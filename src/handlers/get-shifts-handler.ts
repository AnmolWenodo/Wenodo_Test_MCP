import { getDb } from "../clients/db-client";
import sql from "mssql";
import { formatVariables, formatGroupBy } from "../helpers/handler-helper";

export async function getShiftHandler(input: any) {
  try {
    const db = getDb();
    console.log("Shifts Tool Called");
    let branchIds: string | null = null;
    if (input.branchIds !== undefined && input.branchIds !== null) {
      if (Array.isArray(input.branchIds)) {
        branchIds = input.branchIds.join(",");
      } else {
        branchIds = String(input.branchIds);
      }
    }

    const groupBy = formatGroupBy(input.groupBy);

    const spCall = await db
      .request()
      .input("PI_ID", null)
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", null)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
      .input("PI_USER_ID", input.UserId ?? 0)
      .input("PI_ACTIVE", 1)
      .input("PI_TEXTS", input.Text ?? "")
      .input("PI_SP_NAME", "PRC_MCP_GET_EMPLOYEE_SHIFTS_DATA")
      .input("PI_VARIABLE", JSON.stringify(formatVariables(input)))
      .output("PO_ID", sql.Int)
      .execute("PRC_INS_UPD_MCP_PROCESS_LOG");

    console.log("Logging SP Call Parameters:", spCall);

    const result = await db
      .request()
      .input("PI_START_DATE", input.fromDate || null)
      .input("PI_END_DATE", input.toDate || null)
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", branchIds ?? null)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
      .input("PI_GROUP_BY", groupBy ?? null)
      .input("PI_PERIOD_TYPE_ID", input.periodTypeId ?? null)
      .execute("PRC_MCP_GET_EMPLOYEE_SHIFTS_DATA");

    return { result: result.recordset ?? [], isError: false, error: null };
  } catch (err: any) {
    return { result: null, isError: true, error: err.message };
  }
}
