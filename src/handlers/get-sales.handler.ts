import { getDb } from "../clients/db-client";

export async function getSalesHandler(input: {
  fromDate: string;
  toDate: string;
  entityId?: number;
  branchId?: number;
  customerId?: number;
  groupBy?: string[]; // e.g. ["date"], ["session"], ["category"], ["revenueCenter"], ["branch"]
}) {
  try {
    const db = getDb();
    console.log("Sales Summary Tool Called");
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

    const groupBy = Array.isArray(input.groupBy)
    ? input.groupBy.join(",")   // → "1,3"
    : String(input.groupBy);    // → "1"

    
    const result = await db
      .request()
      .input("PI_START_DATE", input.fromDate || null)
      .input("PI_END_DATE", input.toDate || null)
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", branchId ?? null)
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