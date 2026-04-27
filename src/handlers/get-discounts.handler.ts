import { getDb } from "../clients/db-client";

export async function getDiscountsHandler(input: any) {
  try {
    const db = getDb();
    console.log("Discount Tool Called");
    let branchId: string | null = null;
    if (input.branchId !== undefined && input.branchId !== null) {
      if (Array.isArray(input.branchId)) {
        // e.g. [1,2,3] → "1,2,3"
        branchId = input.branchId.join(",");
      } else {
        // single value → "1"
        branchId = String(input.branchId);
      }
    }

    const result = await db
      .request()
      .input("PI_START_DATE", input.fromDate)
      .input("PI_END_DATE", input.toDate)
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", branchId ?? 0)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
      .execute("PRC_GET_MCP_DATA_DISCOUNTS");

    return { result: result.recordset ?? [], isError: false, error: null };
  } catch (err: any) {
    return { result: null, isError: true, error: err.message };
  }
}
