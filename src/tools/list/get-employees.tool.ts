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
          type: "widget",
          widget: {
            type: "employee_cards", // MUST match your UI widget name EXACTLY
          },
          data: res.result ?? [],
        },
      ],
    };
  },
};
