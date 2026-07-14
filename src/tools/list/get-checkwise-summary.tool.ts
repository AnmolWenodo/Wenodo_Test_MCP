import { z } from "zod";
import { getCheckWiseSalesSummaryHandler } from "../../handlers/get-checkwise-summary.handler";
import { validateTenantProtection } from "../../helpers/security";
import { optimizeTable } from "../../helpers/optimize";

export const getCheckWiseSalesSummaryTool = {
  name: "get-check-wise-sales-summary",
  description: `
Fetch detailed information for a specific POS check / invoice / bill.

Required fields:
- fromDate: string in YYYY-MM-DD format.
- toDate: string in YYYY-MM-DD format.
- entityId: number.
- customerId: number.
- branchIds: number, number[], or comma-separated string.
- UserId: number. Never send null.

Optional fields:
- Text: string containing the user's original request or useful query context.
- groupBy: number[]. Default is [1]. Never include duplicate values.
- periodTypeId: only include for comparisons. Use 1 for Week over Week, 2 for Month over Month. Never send 0.

### GROUP BY DIMENSIONS (Pass numeric IDs only):
- 1 = Day
- 2 = Hour
- 3 = Session
- 4 = Category
- 5 = Revenue Center

⚠️ WARNING: Do NOT use option 6 (Product) with this tool. It will trigger a database error ('Invalid column name PRODUCT_NAME'). For product-level item sales analysis, use get-sales-lines-summary instead.

---

### ✅ When to use this tool

Use this tool whenever the user asks about:
- check detail
- invoice detail
- bill detail
- receipt detail
- transaction detail
- order detail
- POS check information
- check breakdown
- invoice breakdown
- bill breakdown
- item level detail for a check
- payment detail for a check
- tax detail for a bill
- discount detail for an invoice
- specific check information

### ❌ Do NOT use this tool when
- You only need aggregate summaries or store-wide trends (totals, category performance, shifts, tips). Use **get-sales-header-summary** instead.
- You need product-level item sales analysis. Use **get-sales-lines-summary** instead.

---

### 💡 Example queries:
- "Show detail for check 1205"
- "Get invoice INV-1001 detail"
- "Show bill breakdown for yesterday"
- "What items were in check 550?"
- "Show payment split for invoice 2001"
- "Tax and discount detail for check 900"
`,

  inputSchema: z.object({
    fromDate: z.string().describe("Required. Start date in YYYY-MM-DD format."),

    toDate: z.string().describe("Required. End date in YYYY-MM-DD format."),

    entityId: z.number().describe("Required. Entity ID as a number."),

    branchIds: z.union([
      z.number(),
      z.array(z.number()),
      z.string()
    ]).describe(
      "Required. Branch IDs as a number, array of numbers, or comma-separated string. Valid: 237, [237,363], '237,363'. Invalid: ['237','363']; convert string arrays to number arrays."
    ),

    customerId: z.number().describe("Required. Customer ID as a number."),

    groupBy: z.array(
      z.union([
        z.literal(1).transform(() => 1), // day
        z.literal(2).transform(() => 2), // hour
        z.literal(3).transform(() => 3), // session
        z.literal(4).transform(() => 4), // category
        z.literal(5).transform(() => 5), // revenue center
        z.literal(6).transform(() => 6), // product
        z.string().transform((val) => { const n = Number(val); return isNaN(n) ? null : n; }),
        z.number().transform((val) => val),
      ])
    )
    .transform((arr) => arr.filter((v): v is number => v !== null))
    .default([1])
    .describe(
      "Fields to group by. Pass numeric IDs only:\n" +
      "1 = day\n" +
      "2 = hour\n" +
      "3 = session\n" +
      "4 = category\n" +
      "5 = revenue center\n" +
      "6 = product\n" +
      "NOTE: No groupBy for Branch/Site — use branchIds for branch filtering.\n" +
      "Example: [1], [1,3], [4,6]"
    ),

    periodTypeId: z.number().optional().describe("Optional. Only include for comparisons: 1 = Week over Week, 2 = Month over Month. Never send 0."),

    Text: z
      .string()
      .optional()
      .default("")
      .describe("Optional. Original user request or useful query context."),

    UserId: z.coerce.number().describe("Required user ID for permission checks. Never send null."),
  }),

  handler: async (input: any) => {
    const tenantCheck = validateTenantProtection(input);
    if (!tenantCheck.isValid) {
      return {
        content: [{ type: "text", text: `❌ Security Error: ${tenantCheck.error}` }],
      };
    }

    const res = await getCheckWiseSalesSummaryHandler(input);

    if (res.isError) {
      return { content: [{ type: "text", text: `❌ ${res.error}` }] };
    }

    const rows = Array.isArray(res.result) ? res.result : [];
    if (rows.length === 0) {
      return { content: [{ type: "text", text: "No data found" }] };
    }

    const optimized = optimizeTable(rows);
    return {
      content: [{ type: "text", text: JSON.stringify(optimized, null, 2) }],
    };
  },
};
