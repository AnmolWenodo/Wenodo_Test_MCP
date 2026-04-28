import { z } from "zod";
import { getDiscountsHandler } from "../../handlers/get-discounts.handler";


export const getDiscountsTool = {
 name: "get-discounts",
description: `
Get discount data applied to sales transactions from the EPOS system.

This tool provides detailed information about discounts given to customers, including discount amounts, types, and where they were applied (branch, session, revenue center, date).

---

### When to use:

Use this tool when the user asks for:

- total discounts
- discount amount
- discounts given
- offers applied
- promotions impact
- discount analysis
- how much discount was given
- discount by branch / session / date
- discount trends
- average discount per sale

---

### What this tool returns:

Each record represents a discount applied to a sales transaction (invoice-level or line-level).

Common fields include:

  EPOS_SALES_DISCOUNT_ID → Unique identifier for the discount record
  DISCOUNT_ID → Unique ID representing the discount type
  DISCOUNT_DESCRIPTION → Name/type of discount (e.g., Staff Food/Drink)
  DISCOUNT_AMOUNT → Monetary value of the discount applied
  EPOS_SALES_HEADER_ID → Invoice ID to which the discount is linked
  CASHUP_DATE → Business date of the transaction
  ENTITY_ID / ENTITY_NAME → Organization or brand name
  BRANCH_ID / BRANCH_NAME → Location where the discount was applied
  STAFF_ID / STAFF_NAME → Staff who applied the discount (may be null)
  Notes:
  Multiple discount records can exist for a single invoice
  Discounts are not aggregated — each row is an individual discount entry
  STAFF_NAME can be null if the discount is system-applied or not tracked
  Data represents reduction in revenue, not sales

### Important Behavior:

- Data may be:
  - line-level (per transaction)

- Multiple records may exist for:
  - different discount types
  - same invoice (multiple discounts applied)
  - different sessions / branches

---

### Key Metrics:

- Total Discount → SUM(DISCOUNT_AMOUNT)
- Discount by Branch → group by BRANCH_NAME
- Discount by Session → group by SESSION_NAME
- Discount by Type → group by DISCOUNT_NAME
- Discount Trend → group by DATE

---

### Example Outputs:

#### Total Discount:
{
  "total_discount": 5246.13
}

#### Discount by Branch:
[
  { "branch": "London", "discount": 3200 },
  { "branch": "Bristol", "discount": 2046.13 }
]

#### Discount by Type:
[
  { "discount_name": "Happy Hour", "amount": 1800 },
  { "discount_name": "Promo10", "amount": 3446.13 }
]

---

### Use Cases:

- Analyze impact of promotions on revenue
- Track discount-heavy branches or sessions
- Identify most used discount types
- Monitor profitability (discount vs revenue)
- Build financial dashboards

---

### Notes:

- Discounts reduce net revenue (important for financial analysis)
- This tool should NOT be used for:
  - customer count (use get-covers)
  - sales totals (use sales tool)
- Often used together with sales data for margin analysis

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
    const res = await getDiscountsHandler(input);

    if (res.isError) {
      return { content: [{ type: "text", text: `❌ ${res.error}` }] };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(res.result ?? [], null, 2),
        },
      ],
    };
  },
};