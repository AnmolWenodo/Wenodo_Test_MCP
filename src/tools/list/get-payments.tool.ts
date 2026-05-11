import { z } from "zod";
import { getCoversHandler } from "../../handlers/get-covers.handler";
import { getPaymentHandler } from "../../handlers/get-payments.handler";


export const getPaymentsTool = {
  name: "get-payments",
description: `
Get payment data from the EPOS system.

This tool returns detailed payment records for sales transactions, including payment methods, amounts, and tips.

---

### When to use:

Use this tool when the user asks for:

- payment methods
- cash vs card
- payment breakdown
- payment summary
- how customers paid
- card vs cash ratio
- payment method distribution
- tips collected

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
    - Debit
    - Wallet
    - Online

---

### Important Behavior:

- Data is **line-level (NOT aggregated)**
- One invoice can have **multiple payment records** (split payments)
- PAYMENT_METHOD_DESC represents high-level type:
  - CARD
  - CASH
  - EXTERNAL
- PAYMENT_METHOD_CODE gives detailed breakdown (VISA, MASTERCARD, etc.) :contentReference[oaicite:0]{index=0}  

---



### Example Interpretation:

- VISA → £44  
- MASTERCARD → £26  
- CASH → £0  
- AMERICAN EXPRESS → £26  

→ Indicates majority payments are via **card methods**

---

### Common Aggregations:

To generate insights:

- Total Payments → SUM(TOTAL_AMOUNT_WITH_TIPS)
- Payments by Type → group by PAYMENT_METHOD_DESC
- Payments by Method → group by PAYMENT_METHOD_CODE
- Tips → SUM(TIPS)

---

### Group By : 
 Always Use [7] in groupBy to get payment method breakdowns.

---

### Use Cases:

- Analyze payment preferences (cash vs card)
- Track digital vs physical payments
- Monitor tips collected
- Build payment distribution charts
- Detect anomalies (e.g., zero cash usage)

---

### Notes:

- This tool returns raw payment data (aggregation required)
- CASH entries may have zero value if not used
- EXTERNAL may represent third-party payments
- Ideal for financial analysis and dashboards
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

  groupBy: z.array(
    z.union([
      z.literal(1).transform(() => 1), // day
      z.literal(2).transform(() => 2), // hour
      z.literal(3).transform(() => 3), // session
      z.literal(4).transform(() => 4), // category
      z.literal(5).transform(() => 5), // revenue center
      z.literal(6).transform(() => 6), // product
    ])
  )
    .default([1])
    .describe(
      "Fields to group by. Pass numeric IDs only:\n" +
      "1 = day\n" +
      "2 = hour\n" +
      "3 = session\n" +
      "4 = category\n" +
      "5 = revenue center\n" +
      "6 = product\n" +
      "Example: [1], [1,3], [4,6]"
    ),

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
}),

  handler: async (input: any) => {
    const res = await getPaymentHandler(input);

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