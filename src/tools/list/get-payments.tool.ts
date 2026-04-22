import { z } from "zod";
import { getCoversHandler } from "../../handlers/get-covers.handler";
import { getPaymentHandler } from "../../handlers/get-payments.handler";


export const getPaymentsTool = {
  name: "get-payments",
description: `
Get payment breakdown.

Use when user asks:
- payment methods
- cash vs card
- payment summary
`,

  inputSchema: z.object({
    fromDate: z.string(),
    toDate: z.string(),
    entityId: z.number().optional(),
    branchId: z.number().optional(),
    customerId: z.number().optional(),
  }),

  handler: async (input: any) => {
    const res = await getPaymentHandler(input);

    if (res.isError) {
      return { content: [{ type: "text", text: `❌ ${res.error}` }] };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(res.result?.slice(0, 50) ?? [], null, 2),
        },
      ],
    };
  },
};