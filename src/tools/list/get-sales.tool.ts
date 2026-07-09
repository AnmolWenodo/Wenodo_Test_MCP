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
Use this tool for POS sales header summary metrics only: revenue, sales, covers, tax, tips, service charge, discounts, and voids.

Required fields:
- fromDate: string in YYYY-MM-DD format.
- toDate: string in YYYY-MM-DD format.
- entityId: number.
- customerId: number.
- branchIds: number, number[], or comma-separated string.
- UserId: number. Never send null.

Optional fields:
- Text: string containing the user's original request or useful query context.
- groupBy: number[]. Default is [1]. Never include duplicate values.
- periodTypeId: only include for comparisons. Use 1 for Week over Week, 2 for Month over Month. Never send 0.

branchIds rules:
- Valid: 237
- Valid: [237, 363, 359]
- Valid: "237,363,359"
- Invalid: ["237", "363", "359"]
If branch IDs are strings, convert them to numbers before calling.

Allowed groupBy values:
- 1 = Date
- 3 = Session
- 4 = Category
- 5 = Revenue Center
- 7 = Week
- 8 = Month
- 9 = Quarter

Never use groupBy 2 Hour with this tool.
Never use groupBy 6 Product with this tool.
Use get-sales-lines-summary for hourly, product, or item-level sales.
Use get-check-wise-sales-summary for invoice, check, waiter, cashier, or average-check questions.

Use exact field names: fromDate, toDate, entityId, branchIds, customerId, UserId, Text, groupBy, periodTypeId.
Do not use unsupported fields such as startDate, endDate, userId, or text.
`,

  inputSchema: z.object({
    fromDate: z.string().describe("Required. Start date in YYYY-MM-DD format."),

    toDate: z.string().describe("Required. End date in YYYY-MM-DD format."),

    entityId: z.number().describe("Required. Entity ID as a number."),

    branchIds: z.union([
      z.number(),
      z.array(z.number()),
      z.string()
    ]).describe(
      "Required. Branch IDs as a number, array of numbers, or comma-separated string. Valid: 237, [237,363], '237,363'. Invalid: ['237','363']; convert string arrays to number arrays."
    ),

    customerId: z.number().describe("Required. Customer ID as a number."),

    groupBy: groupBySchema,

    periodTypeId: z.number().optional().describe("Optional. Only include for comparisons: 1=Week over Week, 2=Month over Month. Never send 0."),

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
      .describe("Optional. Original user request or useful query context."),
    UserId: z.coerce.number().describe("Required user ID for permission checks. Never send null."),
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
