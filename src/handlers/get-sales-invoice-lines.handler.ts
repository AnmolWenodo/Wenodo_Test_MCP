import { getDb } from "../clients/db-client";
import sql from "mssql";

export async function getSalesInvoiceLinesHandler(input: any) {
  try {
    const db = getDb();
    console.log("Sales Lines Tool Called");
    // console.log("Input Parameters:", input);
    let branchIds: string | null = null;

    branchIds = Array.isArray(input.branchIds)
      ? input.branchIds.join(",") // e.g. [1,2,3] → "1,2,3"
      : input.branchIds !== undefined && input.branchIds !== null
        ? String(input.branchIds) // single value → "1"
        : null; // undefined or null → null
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

    // ─────────────────────────────────────────────
    // DEBUG LOG
    // ─────────────────────────────────────────────

    console.log("➡️ INPUT PARAMS", {
      fromDate: input.fromDate,
      toDate: input.toDate,
      entityId: input.entityId,
      branchIds,
      customerId: input.customerId,
      groupBy: groupBy ?? null,
      PI_MCP_DATES_TYPE: datesTable.rows,
    });

    // ─────────────────────────────────────────────
    // EXECUTE SP
    // ─────────────────────────────────────────────

    const result = await db
      .request()
      .input("PI_START_DATE", input.fromDate || null)
      .input("PI_END_DATE", input.toDate || null)
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", branchIds ?? null)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
      .input("PI_GROUP_BY", groupBy ?? null) // No grouping for summary tool
      .input("PI_MCP_DATES_TYPE", sql.TVP("MCP_DATES_TYPE"), datesTable) // TVP for custom date ranges
      .execute("PRC_GET_PRODUCT_AND_CATEGORY_WISE_SALES_SUMMARY");
    console.log("Raw DB Result1:", result);
    return {
      result: result.recordset ?? [],
      isError: false,
      error: null,
    };
  } catch (err: any) {
    return {
      result: null,
      isError: true,
      error: err.message,
    };
  }
}
