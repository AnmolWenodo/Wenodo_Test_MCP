import { getDb } from "../clients/db-client";
import sql from "mssql";
export async function getLeaveHandler(input: any) {
  try {
    const db = getDb();
    console.log("Leave Tool Called");
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

     const groupBy = Array.isArray(input.groupBy)
      ? input.groupBy.join(",") // → "1,3"
      : String(input.groupBy);

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


    const result = await db
      .request()
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", branchIds ?? 0)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
       .input("PI_START_DATE", input.fromDate)
      .input("PI_END_DATE", input.toDate)
      .input("PI_GROUP_BY", groupBy )
      .input("PI_MCP_DATES_TYPE", sql.TVP("MCP_DATES_TYPE"), datesTable) 
      .execute("PRC_MCP_GET_EMPLOYEE_LEAVE_DATA");

    

    return { result: result.recordset ?? [], isError: false, error: null };
  } catch (err: any) {
    return { result: null, isError: true, error: err.message };
  }
}