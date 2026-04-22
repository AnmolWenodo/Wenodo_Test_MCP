import { getDb } from "../clients/db-client";

export async function getEmployeesHandler(input: any) {
  try {
    const db = getDb();
    console.log("Employees Tool Called");

    const result = await db
      .request()
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", input.branchId ?? 0)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
      .execute("PRC_GET_MCP_DATA_EMPLOYEES");

    return { result: result.recordset ?? [], isError: false, error: null };
  } catch (err: any) {
    return { result: null, isError: true, error: err.message };
  }
}