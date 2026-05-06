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
- Products sold per invoice

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

1. Top items sold in date range
2. Analyze what items were sold in each invoice
3. Identify popular product combinations in invoices
4. Identify high-value transactions
5. Detect discounts or voided items

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
