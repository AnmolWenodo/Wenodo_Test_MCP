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
    //  let branchId: string | null = null;
    //  if (input.branchId !== undefined && input.branchId !== null) {
    //   if (Array.isArray(input.branchId)) {
    //     // e.g. [1,2,3] → "1,2,3"
    //     branchId = input.branchId.join(",");
    //   } else {
    //     // single value → "1"
    //     branchId = String(input.branchId);
    //   }
    // }

    const result = await db
      .request()
      .input("PI_START_DATE", input.fromDate || null)
      .input("PI_END_DATE", input.toDate || null)
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", input.branchId ?? 0)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
      .input("PI_GROUP_BY", input.groupBy ?? null) // No grouping for summary tool
      .execute("PRC_GET_SALES_SUMMARY");

    // Flatten all recordsets into a single array
const rows: any[] = Array.from((result.recordsets as any)[0] ?? []);
    // ── Accumulators ──────────────────────────────────────────
    let totalGross = 0;
    let totalNet = 0;
    let totalServiceCharge = 0;
    let totalTax = 0;
    let totalTips = 0;
    let totalDiscount = 0;

    const byBranch: Record<
      number,
      { gross: number; net: number; service_charge: number; tax: number }
    > = {};

    const bySession: Record<
      string,
      { gross: number; net: number; service_charge: number; tax: number }
    > = {};

    const byRevenueCenter: Record<
      string,
      { gross: number; net: number; service_charge: number }
    > = {};

    // ── Aggregate ─────────────────────────────────────────────
    for (const row of rows) {
      const gross    = Number(row.GROSS_AMOUNT    ?? 0);
      const net      = Number(row.NET_AMOUNT      ?? 0);
      const service  = Number(row.SERVICE_CHARGE  ?? 0);
      const tax      = Number(row.TAX_AMOUNT      ?? 0);
      const tips     = Number(row.TIPS_AMOUNT     ?? 0);
      const discount = Number(row.DISCOUNT_AMOUNT ?? 0);

      const branchId      = row.BRANCH_ID       ?? "Unknown";
      const session       = row.SESSION_NAME    ?? "Unknown";
      const revenueCenter = row.REVENUE_CENTER  ?? "Unknown";

      // Totals
      totalGross          += gross;
      totalNet            += net;
      totalServiceCharge  += service;
      totalTax            += tax;
      totalTips           += tips;
      totalDiscount       += discount;

      // By Branch
      if (!byBranch[branchId]) {
        byBranch[branchId] = { gross: 0, net: 0, service_charge: 0, tax: 0 };
      }
      byBranch[branchId].gross          += gross;
      byBranch[branchId].net            += net;
      byBranch[branchId].service_charge += service;
      byBranch[branchId].tax            += tax;

      // By Session
      if (!bySession[session]) {
        bySession[session] = { gross: 0, net: 0, service_charge: 0, tax: 0 };
      }
      bySession[session].gross          += gross;
      bySession[session].net            += net;
      bySession[session].service_charge += service;
      bySession[session].tax            += tax;

      // By Revenue Center
      if (!byRevenueCenter[revenueCenter]) {
        byRevenueCenter[revenueCenter] = { gross: 0, net: 0, service_charge: 0 };
      }
      byRevenueCenter[revenueCenter].gross          += gross;
      byRevenueCenter[revenueCenter].net            += net;
      byRevenueCenter[revenueCenter].service_charge += service;
    }

    // ── Round all values to 2 decimal places ──────────────────
    const round = (n: number) => parseFloat(n.toFixed(2));

    const roundGroup = (obj: Record<string | number, any>) =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [
          k,
          Object.fromEntries(
            Object.entries(v).map(([field, val]) => [field, round(val as number)])
          ),
        ])
      );

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