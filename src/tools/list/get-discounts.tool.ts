import { z } from "zod";
import { getDiscountsHandler } from "../../handlers/get-discounts.handler";


export const getDiscountsTool = {
 name: "get-discounts",
description: `
Get discount data.

Use when user asks:
- discounts
- offers
- promotions

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
    const res = await getDiscountsHandler(input);

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