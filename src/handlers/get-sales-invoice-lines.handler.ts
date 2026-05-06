import { getDb } from "../clients/db-client";

export async function getSalesInvoiceLinesHandler(input: any) {
  try {
    const db = getDb();
    console.log("Sales Lines Tool Called");
    console.log("Input Parameters:", input);
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
      .input("PI_GROUP_BY", input.groupBy ?? "6,1") 
      .execute("PRC_GET_PRODUCT_AND_CATEGORY_WISE_SALES_SUMMARY");
    console.log("Raw DB Result:", result.recordset);
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