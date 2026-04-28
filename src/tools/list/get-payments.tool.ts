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

Fields include:

- EPOS_SALES_PAYMENT_ID → Unique payment record ID  
- EPOS_SALES_HEADER_ID → Invoice ID (multiple payments can belong to one invoice)  
- PAYMENT_METHOD_ID → Unique identifier of payment method  
- PAYMENT_METHOD_CODE → Specific method (e.g., VISA, MASTERCARD, AMERICAN_EXPRESS)  
- PAYMENT_METHOD_DESC → Payment type (e.g., CARD, CASH, EXTERNAL)  
- TOTAL_AMOUNT_WITH_TIPS → Total amount paid including tips  
- TIPS → Tip amount (if any)  
- CASHUP_DATE → Business date of transaction  
- ENTITY_ID / ENTITY_NAME → Organization name  
- BRANCH_ID / BRANCH_NAME → Location  

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

### Example Outputs:

#### Payment by Type:
[
  { "type": "CARD", "amount": 450 },
  { "type": "CASH", "amount": 20 },
  { "type": "EXTERNAL", "amount": 39 }
]

#### Payment by Method:
[
  { "method": "VISA", "amount": 300 },
  { "method": "MASTERCARD", "amount": 120 },
  { "method": "AMERICAN_EXPRESS", "amount": 56 }
]

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
    fromDate: z.string(),
    toDate: z.string(),
    entityId: z.number(),
     branchId: z
      .union([z.number(), z.string(), z.array(z.number())])
      .optional()
      .default(0)
      .describe("Branch ID or multiple IDs"),
    customerId: z.number(),
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