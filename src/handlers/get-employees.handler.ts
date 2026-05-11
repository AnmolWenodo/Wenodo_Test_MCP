import { getDb } from "../clients/db-client";

export async function getEmployeesHandler(input: any) {
  try {
    const db = getDb();
    console.log("Employees Tool Called");
     let branchIds: string | null = null;
     if (input.branchId !== undefined && input.branchId !== null) {
      if (Array.isArray(input.branchId)) {
        // e.g. [1,2,3] → "1,2,3"
        branchIds = input.branchId.join(",");
      } else {
        // single value → "1"
        branchIds = String(input.branchId);
      }
    }

    const result = await db
      .request()
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", branchIds ?? 0)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
      .execute("PRC_MCP_GET_EMPLOYEES_DATA");

    return { result: result.recordset ?? [], isError: false, error: null };
  } catch (err: any) {
    return { result: null, isError: true, error: err.message };
  }
}