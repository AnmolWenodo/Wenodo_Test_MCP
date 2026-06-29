import { z } from "zod";
import { getSalesInvoiceLinesHandler } from "../../handlers/get-sales-invoice-lines.handler";
import { validateTenantProtection } from "../../helpers/security";
import { groupBySchema } from "../../helpers/schemas";
import { optimizeTable } from "../../helpers/optimize";

export const getSalesInvoiceLinesTool = {
  name: "get-sales-lines-summary",
  description: `
Fetch detailed check / invoice / bill-level sales data from the EPOS system.

This tool returns detailed check-wise transactional data, where each row represents a complete POS check / invoice / customer bill.

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

Use this tool only if the user asks for:

📄 Check / Invoice Detail Queries
specific check detail
invoice breakdown
bill detail
receipt detail
transaction detail
order detail
customer bill detail
POS check information
payment breakdown for a bill
tax / discount detail for an invoice
guest / cashier detail for a transaction
product wise details

📊 Check-Level Analysis Queries
top bills
highest value invoices
check-wise revenue
average bill analysis
check-wise sales comparison
invoice-wise trends
branch-wise bill analysis
cashier-wise invoice performance
hourly invoice trends
daily transaction summaries

---
Use this tool ONLY when:
1. The user asks for detailed check/bill/invoice metrics.
2. The user specifically requests "invoice details", "bill-level summaries", or transactional line-items.
3. You need to drill down into a specific transaction to check what was sold or how it was paid.

---

### ❌ Do NOT use this tool when
- You only need aggregate summaries or store-wide trends (totals, category performance, shifts, tips). Use **get-sales-header-summary** instead.

---

### 📊 Columns / Metrics returned
- **Check-level identifiers**: \`CHECK_HEADER_ID\` (Invoice ID), \`CHECK_NO\` (Bill number), \`CHECK_DATE\`, \`CHECK_OPEN_TIME\`, \`CHECK_CLOSE_TIME\`
- **Metadata**: \`BRANCH_NAME\`, \`REVENUE_CENTER_NAME\`, \`TABLE_NAME\`, \`WAITER_NAME\`
- **Totals**: \`GROSS\`, \`DISCOUNT\`, \`NET\`, \`TAX\`, \`SERVICE_CHARGE\`, \`COVERS\`
- **Status flags**: \`VOID_CHECK\` (1 = cancelled/voided, 0 = active)

---

### 💡 Example queries:
- "Show me all invoices from the Grand Divan on June 1st"
- "List the gross totals and bill numbers for shift 1234"
- "What time did check #999 close?"
`,

inputSchema: z.object({
  fromDate: z.string().describe("Start date YYYY-MM-DD"),

  toDate: z.string().describe("End date YYYY-MM-DD"),

  entityId: z.number().describe("Entity ID"),

  branchIds: z.union([
    z.number(),
    z.array(z.number()),
    z.string()
  ]).describe(
    "Branch ID(s) — single number, array of numbers, or comma-separated string e.g. '1,2,3'"
  ),

  customerId: z.number().describe("Customer ID"),

  groupBy: groupBySchema,

  Week_Array: z.array(
    z.object({
      WEEK_START_DATE: z.string().describe(
        "Week start date in YYYY-MM-DD format"
      ),

      WEEK_END_DATE: z.string().describe(
        "Week end date in YYYY-MM-DD format"
      ),
    })
  )
    .default([])
    .describe(
      "Array of custom weekly date ranges used for week-over-week comparisons"
    ),

  Month_Array: z.array(
    z.object({
      MONTH_START_DATE: z.string().describe(
        "Month start date in YYYY-MM-DD format"
      ),

      MONTH_END_DATE: z.string().describe(
        "Month end date in YYYY-MM-DD format"
      ),
    })
  )
    .default([])
    .describe(
      "Array of custom monthly date ranges used for month-over-month comparisons"
    ),

  Period_Array: z.array(
    z.object({
      PERIOD_START_DATE: z.string().describe(
        "Custom period start date in YYYY-MM-DD format"
      ),

      PERIOD_END_DATE: z.string().describe(
        "Custom period end date in YYYY-MM-DD format"
      ),
    })
  )
    .default([])
    .describe(
      "Array of arbitrary custom date ranges used for flexible reporting comparisons"
    ),
  Text: z
    .string()
    .optional()
    .default("")
    .describe("Additional context or instructions for the query"),
  UserId: z.coerce.number().describe("User ID for permission checks and personalization"),
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
