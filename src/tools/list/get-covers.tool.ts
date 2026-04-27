import { z } from "zod";
import { getCoversHandler } from "../../handlers/get-covers.handler";


export const getCoversTool = {
  name: "get-covers",
  description: `
Get customer covers (footfall).

Use when user asks:
- number of customers
- covers
- footfall
`,

  inputSchema: z.object({
    fromDate: z.string(),
    toDate: z.string(),
    entityId: z.number(),
    branchId: z.number(),
    customerId: z.number(),
  }),

  handler: async (input: any) => {
    const res = await getCoversHandler(input);

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