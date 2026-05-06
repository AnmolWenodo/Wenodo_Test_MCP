import { z } from "zod";
import { getSalesInvoiceLinesHandler } from "../../handlers/get-sales-invoice-lines.handler";

export const getSalesInvoiceLinesTool = {
  name: "get-sales-lines-summary",
  description: `
Fetch invoice-level transactional sales data from the EPOS system.

This tool returns raw line-item level sales records, where each row represents a product sold within an invoice.

---

### ✅ When to use this tool

Use this tool when the user asks for:

📄 Detailed / Transactional Queries
invoice-level data
order / bill details
receipt-level breakdown
item-wise sales inside invoices
products sold per order
transaction history
detailed (non-aggregated) sales data
📊 Aggregation / Analysis Queries (IMPORTANT)
top / best selling products
sales by product, category, or revenue center
hourly or daily sales trends
most popular items
least selling items
quantity or revenue-based rankings
comparisons across categories/products

---

### 📊 Data Structure

Each row represents aggregated sales data, grouped dynamically based on the groupBy parameter.

The dataset can include product, time, category, session, and revenue dimensions depending on the grouping applied.

Core Metrics
  NET → Total net sales amount
  GROSS → Total gross sales amount
  TAX → Total tax amount
  DISCOUNT → Total discount amount
  VOID → Total voided amount
  QUANTITY → Total quantity sold (source column: QUANITY)
Entity & Branch
  ENTITY_ID → Entity identifier
  BRANCH_ID → Branch identifier
  ENTITY_NAME → Entity name
  NAME → Branch name
Product & Category
  PRODUCT_NAME → Product name (present when grouped by product)
  CATEGORY_NAME → Product category (present when grouped by category)
Time Dimensions
  CASHUP_DATE → Business date
  HOUR_PART → Hour of sale (0–23)
Sales Dimensions
  REVENUE_CENTER → Sales channel / area (e.g., Unknown, Dine-in, Delivery)
  SESSION_NAME → Session (Breakfast, Lunch, etc.) (nullable)

⚠️ Important Behavior
Data is already aggregated
Each row represents a grouped result, not raw transactions
Fields included depend on groupBy selection
Missing dimensions may appear as:
NULL
default values (e.g., "Unknown")

---

### 🧠 Grouping (PI_GROUP_BY)

Pass numeric IDs as an array to control aggregation.

Supported values:

1 → day (CASHUP_DATE)
2 → hour (DATEPART(HOUR, TIME_OF_SALE))
3 → session (if available in DB)
4 → category (CATEGORY_NAME)
5 → revenue center / account group (ACCOUNT_GROUP_NAME)
6 → product (PRODUCT_NAME + PRODUCT_SKU)

---

### 💡 Examples

User: "Show invoices with item details"
→ No groupBy (raw rows)

User: "Sales by product"
→ groupBy: [6]

User: "Hourly sales"
→ groupBy: [2]

User: "Category sales by day"
→ groupBy: [1, 4]

---

### 📌 Notes

- Always convert natural language dates → YYYY-MM-DD

---

Use this tool when detailed transactional visibility or flexible grouping is required.
`,

  inputSchema: z.object({
    fromDate: z.string().describe("Start date YYYY-MM-DD"),
    toDate: z.string().describe("End date YYYY-MM-DD"),
    entityId: z.number().describe("Entity ID"),
    branchIds: z
      .union([z.number(), z.array(z.number()), z.string()])
      .describe(
        "Branch ID(s) — single number, array of numbers, or comma-separated string e.g. '1,2,3'",
      ),
    customerId: z.number().describe("Customer ID"),
    groupBy: z
      .array(
        z.union([
          z.literal(1).transform(() => 1),
          z.literal(2).transform(() => 2),
          z.literal(3).transform(() => 3),
          z.literal(4).transform(() => 4),
          z.literal(5).transform(() => 5),
        ]),
      )
      .default([1])
      .describe(
        "Fields to group by. Pass numeric IDs only:\n" +
          "Example: [1] , [1,3] for date+session. Only these values are allowed.",
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
