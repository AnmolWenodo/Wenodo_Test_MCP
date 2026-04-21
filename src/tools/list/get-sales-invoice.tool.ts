import { z } from "zod";
import { getSalesInvoiceHandler } from "../../handlers/get-sales-invoice.handler";

export const getSalesInvoiceTool = {
  name: "get-sales-invoice",
  description: `
Fetch invoice-level sales data.

Use when user asks:
- invoice list
- sales invoices
- transactions summary
`,

  inputSchema: z.object({
    fromDate: z.string(),
    toDate: z.string(),
    entityId: z.number().optional(),
    branchId: z.number().optional(),
    customerId: z.number().optional(),
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