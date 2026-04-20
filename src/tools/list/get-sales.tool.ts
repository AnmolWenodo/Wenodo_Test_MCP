import { z } from "zod";
import { getSalesHandler } from "../../handlers/get-sales.handler";

export const getSalesTool = {
  name: "get-sales",
  description:
    "Fetch sales between dates with optional filters: customer, entity, branch",

  inputSchema: z.object({
    fromDate: z.string(),
    toDate: z.string(),
    customer: z.string().optional(),
    entity: z.string().optional(),
    branch: z.string().optional(),
  }),

  handler: async (input: any) => {
    const res = await getSalesHandler(input);

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

    // 🔥 Format response (important for LLM later)
    const summary = res.result
      .map(
        (r: any) =>
          `📄 ${r.invoice_no} | ${r.invoice_date} | ${r.customer_name} | ${r.branch} | ₹${r.total_amount}`
      )
      .join("\n");

    const total = res.result.reduce(
      (sum: number, r: any) => sum + r.total_amount,
      0
    );

    return {
      content: [
        {
          type: "text",
          text: `✅ ${res.result.length} sales found\n💰 Total: ₹${total}\n\n${summary}`,
        },
      ],
    };
  },
};