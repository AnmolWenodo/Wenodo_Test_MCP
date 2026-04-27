import { z } from "zod";
import { getSalesInvoiceHandler } from "../../handlers/get-sales-invoice.handler";

export const getSalesInvoiceTool = {
  name: "get-sales-invoice-headers",
  description: `
Get sales invoice header data.

Returns one record per transaction (check) including:
- Sales values (net, tax, gross, discount, tips, service charge)
NET = Revenue before tax
TAX = Tax amount
GROSS = Total revenue (NET + TAX)
DISCOUNT = Discount applied
COMP = Complimentary value
VOID = Voided amount
TIPS = Tips collected
SERVICE_CHARGE = Service charge
DONATION = Donation amount
- Customer count (covers)
- Transaction timestamps (open, close, cashup date)
- Business context (entity, branch, integration system)
- Session classification (e.g., breakfast, lunch, dinner)

Use this tool when the user asks about:
- Sales totals or summaries
- Revenue breakdowns
- Number of transactions
- Footfall (covers)
- Discounts, comps, voids
- Session or time-based sales trends
- Average bill value or per-check analysis

Total Sales → SUM(GROSS)
Net Sales → SUM(NET)
Total Tax → SUM(TAX)
Total Covers → SUM(COVERS)
Average Bill Value (ABV) → SUM(GROSS) / COUNT(CHECK_ID)
Average Spend per Customer → SUM(GROSS) / SUM(COVERS)
Discount % → SUM(DISCOUNT) / SUM(GROSS)
Transaction Count → COUNT(*)




Do NOT use for:
- Item-level sales (use sales lines tool)
- Payment method breakdown (use payments tool)

Each record represents a single invoice/check.
Aggregate results to compute totals, averages, and trends.
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
    const res = await getSalesInvoiceHandler(input);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(res.result, null, 2),
        },
      ],
    };
  },
};