import { z } from "zod";
import { getSalesHandler } from "../../handlers/get-sales.handler";
import { log } from "node:console";

export const getSalesTool = {
  name: "get-sales",
  description:
    `
Fetch sales data from the database.

Use this tool whenever the user asks about:
- sales
- revenue
- totals
- invoices
- transactions

You MUST:
- Convert natural language dates (e.g. "5th March 2026") → "2026-03-05"
- If entityId/branchId/customerId not provided, use 0 (means ALL)
- Always call this tool instead of asking the user for IDs

The tool returns detailed transaction data.
You must compute totals from the result if user asks for totals.`,

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

   if (!res.result) {
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
          count: res.result.row_count,
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