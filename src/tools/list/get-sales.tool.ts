import { z } from "zod";
import { getSalesHandler } from "../../handlers/get-sales.handler";
import { log } from "node:console";

export const getSalesTool = {
  name: "get-sales",
  description:
    "Fetch sales between dates with optional filters: customer, entity, branch",

inputSchema: z.object({
  fromDate: z.string().describe("Start date YYYY-MM-DD"),
  toDate: z.string().describe("End date YYYY-MM-DD"),

  entityId: z.number().optional().describe("Entity ID"),
  branchId: z.number().optional().describe("Branch ID"),
  customerId: z.number().optional().describe("Customer ID"),
}),

  handler: async (input: any) => {
    const res = await getSalesHandler(input);

     console.log("get-sales result:", res);
    if (res.isError) {
      return {
        content: [{ type: "text", text: `❌ ${res.error}` }],
      };
    }

   if (!res.result || res.result.length === 0) {
      return {
        content: [{ type: "text", text: "No sales found" }],
      };
    }

   return {

   
  content: [
    {
      type: "text",
      text: JSON.stringify(
        {
          count: res.result.length,
          data: res.result
        },
        null,
        2
      ),
    },
  ],
};
  },
};