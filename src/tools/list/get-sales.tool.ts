import { z } from "zod";
import { getSalesHandler } from "../../handlers/get-sales.handler";
import { log } from "node:console";

export const getSalesTool = {
  name: "get-sales-summary",
  description:
    `
Fetch sales data .

This tool retrieves sales transactions and supports dynamic aggregation based on grouping parameters such as date, hour, session, categoryand revenue center.

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

### Supported GroupBy Fields:



---

### What this tool returns:

#### If no GroupBy:
- Raw transaction data (invoice / line-level)
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

- Total sales for a date range
- Sales trend over time (group by date)
- Sales by session (Breakfast/Lunch/Dinner)
- Category performance analysis
- Revenue by revenue center
- Drill-down from summary → transactions

---

### Notes:

- This is the primary tool for revenue analysis
- Use grouping for charts and summaries
- Use raw data for detailed invoice-level queries
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
]).describe("Branch ID(s) — single number, array of numbers, or comma-separated string e.g. '1,2,3'"),
  customerId: z.number().describe("Customer ID"),
  groupBy: z.array(
 z.union([
    z.literal(1).transform(() => 1),
    z.literal(2).transform(() => 2),
    z.literal(3).transform(() => 3),
    z.literal(4).transform(() => 4),
    z.literal(5).transform(() => 5),
  ])
).default([1])
.describe(
  "Fields to group by. Pass numeric IDs only:\n" +
  "Example: [1] , [1,3] for date+session. Only these values are allowed."
),
}),

  handler: async (input: any) => {
    console.log("get-sales input:", input);
    const res = await getSalesHandler(input);

     console.log("get-sales result:", res);
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