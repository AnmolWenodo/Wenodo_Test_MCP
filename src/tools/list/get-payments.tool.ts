import { z } from "zod";
import { getCoversHandler } from "../../handlers/get-covers.handler";
import { getPaymentHandler } from "../../handlers/get-payments.handler";
import { validateTenantProtection } from "../../helpers/security";
import { optimizeTable } from "../../helpers/optimize";
import { paymentsGroupBySchema } from "../../helpers/schemas";


export const getPaymentsTool = {
  name: "get-payments",
  description: `
Use this tool for POS payment-method sales summaries only: payment method breakdowns, cash/card analysis, tender type analysis, payment amounts, and payment tips.

Required fields:
- fromDate: string in YYYY-MM-DD format.
- toDate: string in YYYY-MM-DD format.
- entityId: number.
- customerId: number.
- branchIds: number, number[], or comma-separated string.
- UserId: number. Never send null.

Optional fields:
- Text: string containing the user's original request or useful query context.
- groupBy: number[]. Never include duplicate values. For payment analysis, include payment method 7 plus the requested time/detail dimension.
- periodTypeId: only include for comparisons. Use 1 for Week over Week, 2 for Month over Month. Never send 0.

branchIds rules:
- Valid: 237
- Valid: [237, 363, 359]
- Valid: "237,363,359"
- Invalid: ["237", "363", "359"]
If branch IDs are strings, convert them to numbers before calling.

Allowed groupBy values:
- 1 = Date
- 2 = Hour
- 3 = Session
- 4 = Category
- 5 = Revenue Center
- 6 = Product
- 7 = Payment Method
- 8 = Week
- 9 = Month

Recommended payment groupBy:
- Daily payment methods: [7, 1]
- Weekly payment methods: [7, 8]
- Monthly payment methods: [7, 9]

Use exact field names: fromDate, toDate, entityId, branchIds, customerId, UserId, Text, groupBy, periodTypeId.
Do not use unsupported fields such as startDate, endDate, userId, text, Week_Array, Month_Array, or Period_Array.
`,
  inputSchema: z.object({
    fromDate: z.string().describe("Required. Start date in YYYY-MM-DD format."),

    toDate: z.string().describe("Required. End date in YYYY-MM-DD format."),

    entityId: z.number().describe("Required. Entity ID as a number."),

    branchIds: z.union([z.number(), z.array(z.number()), z.string()]).describe("Required. Branch IDs as a number, array of numbers, or comma-separated string. Valid: 237, [237,363], '237,363'. Invalid: ['237','363']; convert string arrays to number arrays."),

    customerId: z.number().describe("Required. Customer ID as a number."),

    groupBy: paymentsGroupBySchema,
    periodTypeId: z.number().optional().describe("Optional. Only include for comparisons: 1=Week over Week, 2=Month over Month. Never send 0."),

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

    const res = await getPaymentHandler(input);

    if (res.isError) {
      return { content: [{ type: "text", text: `âŒ ${res.error}` }] };
    }

    const rows = Array.isArray(res.result) ? res.result : [];
    if (rows.length === 0) {
      return { content: [{ type: "text", text: "No data found" }] };
    }

    const optimized = optimizeTable(rows);
    return {
      content: [{ type: "text", text: JSON.stringify(optimized, null, 2) }],
    };
  },
};

