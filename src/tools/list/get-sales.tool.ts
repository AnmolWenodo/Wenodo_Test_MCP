import { z } from "zod";
import { getSalesHandler } from "../../handlers/get-sales.handler";
import { log } from "node:console";

export const getSalesTool = {
  name: "get-sales-summary",
  description:
    `
Fetch sales data .

This tool retrieves sales transactions and supports dynamic aggregation based on grouping parameters such as date, hour, session, category,branchwise and revenue center.

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
- sales by branch
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

You can group results using one or more of:

- "date" → Daily sales
- "hour" → Hour-wise sales
- "session" → Breakfast / Lunch / Dinner
- "category" → Product category
- "revenueCenter" → Area within branch
- "branch" → Sales by branch

Example:
- ["date"] → daily trend
- ["session"] → sales by breakfast/lunch/dinner
- ["category"] → sales by product category
- ["date", "session"] → daily session breakdown
- ["branch"] → sales by branch

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
  branchId: z.number().describe("Branch ID"),
  customerId: z.number().describe("Customer ID"),
  groupBy: z.array(
    z.enum(["date", "hour", "session", "category", "revenueCenter", "branch"])
  )
  .optional()
  .describe("Fields to group by"),
}),

  handler: async (input: any) => {
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