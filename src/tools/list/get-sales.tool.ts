import { z } from "zod";
import { getSalesHandler } from "../../handlers/get-sales.handler";
import { log } from "node:console";

export const getSalesTool = {
  name: "get-sales-header-summary",
  description:
    `
Fetch sales data .

This tool retrieves sales summaries of  transactions and supports dynamic aggregation based on grouping parameters such as date, hour, session, categoryand revenue center.

---

### When to use:

Use this tool when the user asks for:

- total sales
- revenue
- sales summary
- sales trends
- sales by date / time / session
- sales by category
- sales by revenue center
- business performance
- Covers details by year/ month / date
- Tips details by year/ month / date
- Discounts details by year/ month / date

---

### Capabilities:

This tool supports both:

**Aggregated Data (Using GroupBy)**
   - Returns grouped sales summaries
   - Use when user asks for:
     - totals
     - trends
     - comparisons
     - charts

---

### What this tool returns:

#### If no GroupBy:
- Raw transaction data (invoice / Header-level)
- Multiple rows per invoice possible

#### If GroupBy is used:
- Aggregated sales data
- Each row represents grouped results

Common metrics:
- NET → Net sales
- TAX → Tax amount
- GROSS → Total revenue
- DISCOUNT → Discount amount
- TIPS → Tips collected
- SERVICE_CHARGE → Service charge amount  
- COVERS → Number of customers

---

### Example Use Cases:

- Sales summaries of year / month / date
- Total sales for a date range
- Sales trend over time (group by date)
- Sales by session (Breakfast/Lunch/Dinner)
- Category performance analysis
- Revenue by revenue center
- Drill-down from summary → transactions
- houly sales trends where product is not included.
---

### Notes:

- This is the primary tool for revenue analysis
- Use raw data for detailed invoice-header-level queries
- Always compute totals if user asks for totals
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
    const res = await getSalesHandler(input);

    if (res.isError) {
      return {
        content: [{ type: "text", text: `❌ ${res.error}` }],
      };
    }

   if (!res.result) {
      return {
        content: [{ type: "text", text: "No sales found" }],
      };
    }

   return {

   
  content: [
    {
      type: "text",
      text: JSON.stringify(
        {
          count: res.result.length,
          data: res.result
        },
        null,
        2
      ),
    },
  ],
};
  },
};