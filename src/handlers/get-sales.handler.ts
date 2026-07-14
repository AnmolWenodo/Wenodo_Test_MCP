import sql from "mssql";
import { getDb } from "../clients/db-client";
import { formatVariables, formatGroupBy } from "../helpers/handler-helper";

export async function getSalesHandler(input: {

  fromDate: string;
  toDate: string;
  entityId?: number;
  branchIds?: number | number[];
  customerId?: number;
  groupBy?: string[] | string;
  Text?: string;
  UserId?: number;
  Variables?: Record<string, any>;
  periodTypeId?: number;
}) {
  try {
    const db = getDb();
    console.log("Sales Summary Tool Called");
    let branchIds: string | null = null;
    if (input.branchIds !== undefined && input.branchIds !== null) {
      if (Array.isArray(input.branchIds)) {
        // e.g. [1,2,3] → "1,2,3"
        branchIds = input.branchIds.join(",");
      } else {
        // single value → "1"
        branchIds = String(input.branchIds);
      }
    }

    const groupBy = formatGroupBy(input.groupBy);

    // ─────────────────────────────────────────────
    // DEBUG LOG
    // ─────────────────────────────────────────────

    const spCall = await db
      .request()
      .input("PI_ID", null)
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", null)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
      .input("PI_USER_ID", input.UserId ?? 0)
      .input("PI_TEXTS", input.Text ?? "")
      .input("PI_ACTIVE", 1)
      .input("PI_SP_NAME", "PRC_MCP_GET_SALES_SUMMARY")
      .input("PI_VARIABLE", JSON.stringify(formatVariables(input)))
      .output("PO_ID", sql.Int)
      .execute("PRC_INS_UPD_MCP_PROCESS_LOG");

    console.log("Logging SP Call Parameters:", spCall.output);

    const result = await db
      .request()
      .input("PI_START_DATE", input.fromDate || null)
      .input("PI_END_DATE", input.toDate || null)
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", branchIds ?? null)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
      .input("PI_GROUP_BY", groupBy ?? null) // No grouping for summary tool
      .input("PI_PERIOD_TYPE_ID", input.periodTypeId ?? null) // Assuming you have a periodTypeId in your input
      // .input("PI_MCP_DATES_TYPE", sql.TVP("MCP_DATES_TYPE"), datesTable)
      .execute("PRC_MCP_GET_SALES_SUMMARY");

    // Flatten all recordsets into a single array

    // log("Raw DB result:", result.recordsets);
    const rows: any[] = Array.from((result.recordsets as any)[0] ?? []);
    // ── Accumulators ──────────────────────────────────────────

    // ── Final response ────────────────────────────────────────
    return {
      result: result.recordsets,
      isError: false,
      error: null,
    };
  } catch (err: any) {
    console.error("SP ERROR:", err);
    return {
      result: null,
      isError: true,
      error: err.message,
    };
  }
}
