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
    fromDate: z.string().describe("Start date YYYY-MM-DD"),
    toDate: z.string().describe("End date YYYY-MM-DD"),

    entityId: z.number().optional().default(0),

    // 🔥 SUPPORT MULTIPLE FORMATS
    branchId: z
      .union([z.number(), z.string(), z.array(z.number())])
      .optional()
      .default(0)
      .describe("Branch ID or multiple IDs"),

    customerId: z.number().optional().default(0),
  }),

  handler: async (input: any) => {
    const res = await getCoversHandler(input);

    if (res.isError) {
      return {
        content: [
          {
            type: "text",
            text: `❌ ${res.error}`,
          },
        ],
      };
    }

    const data = res.result ?? [];

    // 🔥 LIMIT RESULT (IMPORTANT)
    const safeData = data;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              count: safeData.length,
              data: safeData,
            },
            null,
            2
          ),
        },
      ],
    };
  },
};