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
    fromDate: z.string(),
    toDate: z.string(),
    entityId: z.number().optional(),
    branchId: z.number().optional(),
    customerId: z.number().optional(),
  }),

  handler: async (input: any) => {
    const res = await getEmployeesHandler(input);

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