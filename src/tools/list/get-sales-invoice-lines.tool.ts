import { z } from "zod";
import { getSalesInvoiceLinesHandler } from "../../handlers/get-sales-invoice-lines.handler";

export const getSalesInvoiceLinesTool = {
  name: "get-sales-lines-summary",
  description: `
Fetch detailed check / invoice / bill-level sales data from the EPOS system.

This tool returns detailed check-wise transactional data, where each row represents a complete POS check / invoice / customer bill.

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

### 📊 Data Structure


⚠️ Important Behavior

Data may already be aggregated depending on groupBy selection.

Each row can represent:
- individual checks
- grouped invoice summaries
- branch summaries
- cashier summaries
- hourly or daily invoice summaries

Fields included depend on the groupBy parameter.

Missing dimensions may appear as:
- NULL
- empty values
- default values like "Unknown"

---
Grouping Behavior
The groupBy parameter controls how data is aggregated:
- 1 = day: groups data by day, each row is a daily summary
- 2 = hour: groups data by hour, each row is an hourly summary
- 3 = session: groups data by session, each row is a session summary
- 4 = category: groups data by product category, each row is a category summary
- 5 = revenue center: groups data by revenue center, each row is a revenue center summary
- 6 = product: groups data by product, each row is a product summary

---

### 📌 Notes

- Always convert natural language dates → YYYY-MM-DD
- Use this tool when check-level visibility or invoice-level analysis is required
- Prefer this tool over sales-summary tools when the user asks for bill / invoice / receipt level detail
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

  groupBy: z.array(
    z.union([
      z.literal(1).transform(() => 1), // day
      z.literal(2).transform(() => 2), // hour
      z.literal(3).transform(() => 3), // session
      z.literal(4).transform(() => 4), // category
      z.literal(5).transform(() => 5), // revenue center
      z.literal(6).transform(() => 6), // product
    ])
  )
    .default([1])
    .describe(
      "Fields to group by. Pass numeric IDs only:\n" +
      "1 = day\n" +
      "2 = hour\n" +
      "3 = session\n" +
      "4 = category\n" +
      "5 = revenue center\n" +
      "6 = product\n" +
      "Example: [1], [1,3], [4,6]"
    ),

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
}),
  handler: async (input: any) => {
    const res = await getSalesInvoiceLinesHandler(input);

    if (res.result) {
      const safeData = res.result;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(safeData, null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: "No data found",
        },
      ],
    };
  },
};
