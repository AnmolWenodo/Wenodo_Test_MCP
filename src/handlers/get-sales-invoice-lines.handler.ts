import { getDb } from "../clients/db-client";

export async function getSalesInvoiceLinesHandler(input: any) {
  try {
    const db = getDb();
    console.log("Sales Lines Tool Called");
    // console.log("Input Parameters:", input);
     let branchIds: string | null = null;
    
  branchIds = Array.isArray(input.branchIds)
      ? input.branchIds.join(",")   // e.g. [1,2,3] → "1,2,3"
      : input.branchIds !== undefined && input.branchIds !== null
        ? String(input.branchIds)   // single value → "1"
        : null;                    // undefined or null → null
  const groupBy = Array.isArray(input.groupBy)
    ? input.groupBy.join(",")   // → "1,3"
    : String(input.groupBy); 


    const result = await db
      .request()
      .input("PI_START_DATE", input.fromDate)
      .input("PI_END_DATE", input.toDate)
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", branchIds)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
      .input("PI_GROUP_BY", groupBy ?? '') 
      .execute("PRC_GET_PRODUCT_AND_CATEGORY_WISE_SALES_SUMMARY");
    // console.log("Raw DB Result1:", result);
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