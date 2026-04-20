import { getDb } from "../clients/db-client";

export async function getSalesHandler(input: {
  fromDate: string;
  toDate: string;
  entityId?: number;
  branchId?: number;
  customerId?: number;
}) {
  try {
    const db = getDb();

    const result = await db
      .request()
      .input("PI_START_DATE", input.fromDate || null)
      .input("PI_END_DATE", input.toDate || null)
      .input("PI_ENTITY_ID", input.entityId ?? null)
      .input("PI_BRANCH_ID", input.branchId ?? null)
      .input("PI_CUSTOMER_ID", input.customerId ?? null)
      .execute("PRC_GET_MCP_DATA");

    return {
      result: result.recordsets,
      isError: false,
      error: null,
    };
  } catch (err: any) {
    console.error("SP ERROR:", err);

    return {
      result: [],
      isError: true,
      error: err.message,
    };
  }
}