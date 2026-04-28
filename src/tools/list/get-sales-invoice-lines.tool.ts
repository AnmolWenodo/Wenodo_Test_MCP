import { z } from "zod";
import { getSalesInvoiceLinesHandler } from "../../handlers/get-sales-invoice-lines.handler";

export const getSalesInvoiceLinesTool = {
  name: "get-sales-invoice-lines",
  description: `
Fetch invoice-level sales data from the EPOS system.

This tool returns transactional sales data at the invoice line level, including all line items associated with each invoice.

---

### When to use:

Use this tool when the user asks for:
- invoice list
- sales invoices
- transaction details
- invoice-wise sales
- order history
- detailed sales breakdown
- receipt-level data
- item-level sales inside invoices

---

### What this tool returns:

Each record represents a sales line item linked to an invoice.

Key fields include:

- EPOS_SALES_HEADER_ID → Unique invoice / bill ID
- TIME_OF_SALE → Timestamp of transaction
- PRODUCT_NAME → Item sold
- CATEGORY_NAME → Product category (Food, Drinks, etc.)
- QUANTITY → Number of items sold
- NET → Net amount (before tax)
- TAX → Tax amount
- GROSS → Final amount (after tax)
- DISCOUNT → Discount applied
- COMP → Complimentary items
- VOID → Voided items
- ACCOUNT_GROUP_NAME → Sales grouping (e.g., Cookies, Drinks)

Example:
An invoice may contain multiple rows (line items), all sharing the same EPOS_SALES_HEADER_ID. :contentReference[oaicite:0]{index=0}

---

### Important Behavior:

- Multiple rows = one invoice (group by EPOS_SALES_HEADER_ID)
- Data is at line-item level, not aggregated
- Must be grouped to get:
  - total invoice value
  - number of items per invoice
  - invoice summary

---

### Typical Use Cases:

1. Get all invoices for a date range
2. Analyze what items were sold in each invoice
3. Calculate total sales per invoice
4. Identify high-value transactions
5. Detect discounts or voided items
6. Build receipt-level UI or tables

---

### Post-processing Required:

To convert raw data into meaningful insights:

- Group by: EPOS_SALES_HEADER_ID
- Aggregate:
  - total_net = sum(NET)
  - total_tax = sum(TAX)
  - total_gross = sum(GROSS)
  - total_items = sum(QUANTITY)

---

### Example Output (Grouped Invoice):

{
  "invoice_id": 21549934,
  "time": "2026-01-01T18:45:19Z",
  "items": [
    { "name": "Miso White Chocolate", "qty": 1, "gross": 5 },
    { "name": "Triple Chocolate", "qty": 1, "gross": 5 }
  ],
  "total": 10
}

---

### Notes:

- This tool does NOT return summarized data directly
- Always perform grouping/aggregation after fetching
- Suitable for tables, invoice cards, or drill-down UI

---

Use this tool when detailed transactional visibility is required rather than aggregated summaries.
`,

  inputSchema: z.object({
    fromDate: z.string(),
    toDate: z.string(),
    entityId: z.number(),
     branchId: z
      .union([z.number(), z.string(), z.array(z.number())])
      .optional()
      .default(0)
      .describe("Branch ID or multiple IDs"),
    customerId: z.number(),
  }),

  handler: async (input: any) => {
    const res = await getSalesInvoiceLinesHandler(input);

    if (res.result) {
      const safeData = res.result.slice(0, 50);

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
