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
    branchId: z.number(),
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
