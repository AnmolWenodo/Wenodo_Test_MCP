import { z } from "zod";
import { getCoversHandler } from "../../handlers/get-covers.handler";
import { getPaymentHandler } from "../../handlers/get-payments.handler";
import { validateTenantProtection } from "../../helpers/security";
import { optimizeTable } from "../../helpers/optimize";
import { paymentsGroupBySchema } from "../../helpers/schemas";


export const getPaymentsTool = {
  name: "get-payments",
  description: `
Get payment data from the EPOS system.

This tool returns detailed payment records for sales transactions, including payment methods, amounts, and tips.

### WHEN TO USE:
Use this tool when you need details on payment methods, cash vs. card ratios, payment breakdown, or card performance.

### GROUP BY DIMENSIONS (Pass numeric IDs only):
You should always group with 7 and 1-9 in the payment tool dimension:
- 1 = Date / Day
- 2 = Hour
- 3 = Session (Lunch, Dinner, etc.)
- 4 = Category (Food, Beverage, etc.)
- 5 = Revenue Center (Dining Room, Bar)
- 6 = Product
- 7 = Payment Method (e.g. Cash, Visa, Mastercard)
- 8 = Week
- 9 = Month

---

### What this tool returns:
Each record represents a **single payment entry linked to an invoice**.

### 📊 Data Structure
Each row represents aggregated payment-level sales data grouped dynamically based on the groupBy parameter.

Core Metrics
  TOTAL_AMOUNT_WITH_TIPS → Total collected amount including tips
  TIPS → Total tips collected

Date Range
  START_DATE → Query start date
  END_DATE → Query end date

Entity & Branch
  ENTITY_ID → Entity identifier
  BRANCH_ID → Branch identifier
  ENTITY_NAME → Entity name
  BRANCH_NAME → Branch name

Payment Information
  PAYMENT_METHOD_DESC → Payment method description
    Examples:
    - Cash
    - Credit
#### If no GroupBy:
- Raw transaction data (invoice / Header-level payment details)
- Multiple rows per invoice possible

#### If GroupBy is used:
- Aggregated payment data
- Each row represents grouped results

Common metrics:
- PAY_AMOUNT → Payment amount
- TIPS → Tips collected
- SERVICE_CHARGE → Service charge amount
- COVERS → Number of customers

---

### Example Use Cases:
- Payment breakdowns by method (group by payment method)
- Payment trends over time (group by date)
- Payment performance by revenue center

---

### Notes:
- Use this tool specifically for payment analysis
- Always compute totals if user asks for totals
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
      "Branch ID(s) — single number, array of numbers, or comma-separated string e.g. '1,2,3'"
    ),

    customerId: z.number().describe("Customer ID"),

    groupBy: paymentsGroupBySchema,

    Week_Array: z.array(
      z.object({
        WEEK_START_DATE: z.string().describe(
          "Week start date in YYYY-MM-DD format"
        ),

        WEEK_END_DATE: z.string().describe(
          "Week end date in YYYY-MM-DD format"
        ),
      })
    )
      .default([])
      .describe(
        "Array of custom weekly date ranges used for week-over-week comparisons"
      ),

    Month_Array: z.array(
      z.object({
        MONTH_START_DATE: z.string().describe(
          "Month start date in YYYY-MM-DD format"
        ),

        MONTH_END_DATE: z.string().describe(
          "Month end date in YYYY-MM-DD format"
        ),
      })
    )
      .default([])
      .describe(
        "Array of custom monthly date ranges used for month-over-month comparisons"
      ),

    Period_Array: z.array(
      z.object({
        PERIOD_START_DATE: z.string().describe(
          "Custom period start date in YYYY-MM-DD format"
        ),

        PERIOD_END_DATE: z.string().describe(
          "Custom period end date in YYYY-MM-DD format"
        ),
      })
    )
      .default([])
      .describe(
        "Array of arbitrary custom date ranges used for flexible reporting comparisons"
      ),
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
        content: [{ type: "text", text: `❌ Security Error: ${tenantCheck.error}` }],
      };
    }

    const res = await getPaymentHandler(input);

    if (res.isError) {
      return { content: [{ type: "text", text: `❌ ${res.error}` }] };
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