import { getDb } from "../clients/db-client";

export async function getSalesInvoiceLinesHandler(input: any) {
  try {
    const db = getDb();
    console.log("Sales Lines Tool Called");

    const result = await db
      .request()
      .input("PI_START_DATE", input.fromDate)
      .input("PI_END_DATE", input.toDate)
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", input.branchId ?? 0)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
      .execute("PRC_GET_MCP_DATA_INVOICE_LINES");

      console.log(result.recordset);
      

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