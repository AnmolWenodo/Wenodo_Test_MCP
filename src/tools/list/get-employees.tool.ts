import { z } from "zod";
import { getEmployeesHandler } from "../../handlers/get-employees.handler";

export const getEmployeesTool = {
  name: "get-employees",
  description: `
Get employee performance.

Use when user asks:
- staff performance
- waiter sales
- employee contribution
`,

  inputSchema: z.object({
    entityId: z.number(),
     branchId: z
      .union([z.number(), z.string(), z.array(z.number())])
      .optional()
      .default(0)
      .describe("Branch ID or multiple IDs"),
    customerId: z.number(),
  }),

  handler: async (input: any) => {
    const res = await getEmployeesHandler(input);

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

    return {
     content: [
          {
            type: "text",
            text: JSON.stringify(res.result),
          },
        ],
    };
  },
};
