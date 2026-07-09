import { z } from "zod";
import { getSalesHandler } from "../../handlers/get-sales.handler";
import { log } from "node:console";
import { validateTenantProtection } from "../../helpers/security";

import { optimizeSalesSummary } from "../../helpers/optimize";

import { groupBySchema } from "../../helpers/schemas";

export const getSalesTool = {
  name: "get-sales-header-summary",
  description:
    `
Use this tool only for POS sales header summary metrics: revenue, sales, covers, tax, tips, service charge, discounts, and voids.

Required inputs:
- fromDate: YYYY-MM-DD. Convert natural language dates before calling. If no date is provided, reuse the previous date range or ask the user.
- toDate: YYYY-MM-DD. For relative periods, use today's date as the end date.
- customerId: pass state.customer_id.
- entityId: pass state.entity_id.
- branchIds: pass state.branch_ids.
- UserId: pass state.user_id.

Optional inputs:
- Text: pass the user's original request or useful query context.
- groupBy: no duplicates. Default is [1].
- periodTypeId: use 1 for Week over Week, 2 for Month over Month.

Allowed groupBy values for this tool:
- 1 = Date
- 3 = Session
- 4 = Category
- 5 = Revenue Center
- 7 = Week
- 8 = Month
- 9 = Quarter

Do not use groupBy 2 Hour with this tool; use get-sales-lines-summary for hourly sales. Use get-sales-lines-summary for product/item-level questions. Use get-check-wise-sales-summary for invoice, check, waiter, cashier, or average-check questions.
`,

  inputSchema: z.object({
    fromDate: z.string().describe("Start date YYYY-MM-DD"),

    toDate: z.string().describe("End date YYYY-MM-DD"),

    entityId: z.number().describe("Entity ID"),

    branchIds: z.union([
      z.number(),
      z.array(z.number()),
      z.string()
    ]).describe(
      "Branch ID(s) â€” single number, array of numbers, or comma-separated string e.g. '1,2,3'"
    ),

    customerId: z.number().describe("Customer ID"),

    groupBy: groupBySchema,

    periodTypeId: z.number().optional().describe("Period Type ID 1=Week, 2=Month"),

    // Week_Array: z.array(
    //   z.object({
    //     WEEK_START_DATE: z.string().describe(
    //       "Week start date in YYYY-MM-DD format"
    //     ),

    //     WEEK_END_DATE: z.string().describe(
    //       "Week end date in YYYY-MM-DD format"
    //     ),
    //   })
    // )
    //   .default([])
    //   .describe(
    //     "Array of custom weekly date ranges used for week-over-week comparisons"
    //   ),

    // Month_Array: z.array(
    //   z.object({
    //     MONTH_START_DATE: z.string().describe(
    //       "Month start date in YYYY-MM-DD format"
    //     ),

    //     MONTH_END_DATE: z.string().describe(
    //       "Month end date in YYYY-MM-DD format"
    //     ),
    //   })
    // )
    //   .default([])
    //   .describe(
    //     "Array of custom monthly date ranges used for month-over-month comparisons"
    //   ),

    // Period_Array: z.array(
    //   z.object({
    //     PERIOD_START_DATE: z.string().describe(
    //       "Custom period start date in YYYY-MM-DD format"
    //     ),

    //     PERIOD_END_DATE: z.string().describe(
    //       "Custom period end date in YYYY-MM-DD format"
    //     ),
    //   })
    // )
    //   .default([])
    //   .describe(
    //     "Array of arbitrary custom date ranges used for flexible reporting comparisons"
    //   ),
    Text: z
      .string()
      .optional()
      .default("")
      .describe("Additional context or instructions for the query"),
    UserId: z.coerce.number().describe("User ID for permission checks and personalization"),
  }),

  handler: async (input: any) => {
    const tenantCheck = validateTenantProtection(input);
    if (!tenantCheck.isValid) {
      return {
        content: [{ type: "text", text: `âŒ Security Error: ${tenantCheck.error}` }],
      };
    }

    const res = await getSalesHandler(input);

    if (res.isError) {
      return {
        content: [{ type: "text", text: `âŒ ${res.error}` }],
      };
    }

    if (!res.result) {
      return {
        content: [{ type: "text", text: "No sales found" }],
      };
    }

    const optimized = optimizeSalesSummary(res.result as any[][]);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(optimized, null, 2),
        },
      ],
    };
  },
};
