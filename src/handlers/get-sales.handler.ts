import  sql from "mssql";
import { getDb } from "../clients/db-client";
import { formatVariables, formatGroupBy } from "../helpers/handler-helper";

export async function getSalesHandler(input: {
  Month_Array: never[];
  Period_Array: never[];
  Week_Array: any[];
  fromDate: string;
  toDate: string;
  entityId?: number;
  branchIds?: number | number[] ;
  customerId?: number;
  groupBy?: string[] | string; 
  Text?: string;
  UserId?: number;
  Variables?: Record<string, any>;
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

     const datesTable = new sql.Table();
        datesTable.create = false;
    
        datesTable.columns.add("START_DATE", sql.Date);
        datesTable.columns.add("END_DATE", sql.Date);
        // ─────────────────────────────────────────────
        // WEEK ARRAY TVP
        // ─────────────────────────────────────────────
    
        (input.Week_Array || []).forEach((row: any) => {
          datesTable.rows.add(
            row.WEEK_START_DATE || null,
            row.WEEK_END_DATE || null,
          );
        });
    
        // ─────────────────────────────────────────────
        // MONTH ARRAY TVP
        // ─────────────────────────────────────────────
    
        (input.Month_Array || []).forEach((row: any) => {
          datesTable.rows.add(
            row.MONTH_START_DATE || null,
            row.MONTH_END_DATE || null,
          );
        });
        // ─────────────────────────────────────────────
        // PERIOD ARRAY TVP
        // ─────────────────────────────────────────────
    
        (input.Period_Array || []).forEach((row: any) => {
          datesTable.rows.add(
            row.PERIOD_START_DATE || null,
            row.PERIOD_END_DATE || null,
          );
        });
    
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
      .input("PI_TEXTS",input.Text ?? "")
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
      .input("PI_MCP_DATES_TYPE", sql.TVP("MCP_DATES_TYPE"), datesTable)
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