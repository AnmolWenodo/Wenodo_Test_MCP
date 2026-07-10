import { z } from "zod";
import { getSalesInvoiceLinesHandler } from "../../handlers/get-sales-invoice-lines.handler";
import { validateTenantProtection } from "../../helpers/security";
import { groupBySchema } from "../../helpers/schemas";
import { optimizeTable } from "../../helpers/optimize";

export const getSalesInvoiceLinesTool = {
  name: "get-sales-lines-summary",
  description: `
Fetch detailed check / invoice / bill-level sales data from the EPOS system.

This tool returns product and category level sales data, where each row represents sales metrics grouped by your chosen dimension (product, category, date, session, etc.).

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
- 1 = Date / Day
- 2 = Hour (Hourly sales distribution)
- 3 = Session (Lunch, Dinner, etc.)
- 4 = Category (Food, Beverage, Retail, etc.)
- 5 = Revenue Center (Bar, Lounge, Dining Room)
- 6 = Product (Highly Important: retrieves quantities and sales numbers of individual products/dishes)
- 7 = Week
- 8 = Month
- 9 = Quarter

---

### ✅ When to use this tool

Use this tool when the user asks for:

📦 Product / Item Level Queries
- product wise sales
- item wise sales
- dish wise sales
- top selling products
- best selling items
- product quantities sold
- menu item performance
- product revenue

🗂️ Category Level Queries
- category wise sales
- food vs beverage breakdown
- revenue by category
- category performance

📊 Hourly / Session / Date Breakdown
- hourly sales
- sales by hour
- session wise sales (lunch, dinner, breakfast)
- daily breakdown by product
- weekly / monthly product trends

---

### ❌ Do NOT use this tool when
- You need header-level totals, covers, or tips summary → Use **get-sales-header-summary**
- You need check/invoice/bill detail → Use **get-check-wise-sales-summary**

---

### 💡 Example queries:
- "Show top 10 selling products for June"
- "What is the category wise sales for last week?"
- "Show me hourly sales broken down by product"
- "Compare product sales week over week"
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

    groupBy: groupBySchema,

    periodTypeId: z.number().optional().describe("Optional. Only include for comparisons: 1 = Week over Week, 2 = Month over Month. Never send 0."),

    page: z.number().optional().default(1).describe("Optional. Page number (default: 1)."),

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

    const res = await getSalesInvoiceLinesHandler(input);

    if (res.isError) {
      return {
        content: [
          {
            type: "text",
            text: `❌ ${res.error}`,
          },
        ],
      };
    }

    const rows = Array.isArray(res.result) ? res.result : [];
    if (rows.length === 0) {
      return { content: [{ type: "text", text: "No data found" }] };
    }

    const optimized = optimizeTable(rows);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(optimized, null, 2),
        },
      ],
    };
  },
};
