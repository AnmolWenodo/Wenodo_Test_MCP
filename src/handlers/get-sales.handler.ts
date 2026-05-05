import { getDb } from "../clients/db-client";

export async function getSalesHandler(input: {
  fromDate: string;
  toDate: string;
  entityId?: number;
  branchIds?: number | number[] ;
  customerId?: number;
  groupBy?: string[] | string; 
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

    const groupBy = Array.isArray(input.groupBy)
    ? input.groupBy.join(",")   // → "1,3"
    : String(input.groupBy);    // → "1"

    
    const result = await db
      .request()
      .input("PI_START_DATE", input.fromDate || null)
      .input("PI_END_DATE", input.toDate || null)
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", branchIds ?? null)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
      .input("PI_GROUP_BY", groupBy ?? null) // No grouping for summary tool
      .execute("PRC_GET_SALES_SUMMARY");


    // Flatten all recordsets into a single array
const rows: any[] = Array.from((result.recordsets as any)[0] ?? []);
    // ── Accumulators ──────────────────────────────────────────
  

    // ── Final response ────────────────────────────────────────
    return {
      result: rows,
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