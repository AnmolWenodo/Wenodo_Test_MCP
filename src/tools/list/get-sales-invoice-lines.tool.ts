import { z } from "zod";
import { getSalesInvoiceLinesHandler } from "../../handlers/get-sales-invoice-lines.handler";

export const getSalesInvoiceLinesTool = {
  name: "get-sales-invoice-lines",
  description: `
Fetch invoice line items (products).

Use when user asks:
- item sales
- product sales
- line details
- what items sold
`,

  inputSchema: z.object({
    fromDate: z.string(),
    toDate: z.string(),
    entityId: z.number().optional(),
    branchId: z.number().optional(),
    customerId: z.number().optional(),
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
