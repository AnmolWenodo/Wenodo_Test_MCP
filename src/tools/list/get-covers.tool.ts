import { z } from "zod";
import { getCoversHandler } from "../../handlers/get-covers.handler";

export const getCoversTool = {
  name: "get-covers",
  description: `
Get customer covers data from the EPOS system.

This tool returns the number of customers (covers) aggregated across multiple dimensions such as date, branch, session (Breakfast/Lunch/Dinner), and revenue center.

---

### When to use:

Use this tool when the user asks for:

- number of customers
- covers
- footfall
- guest count
- how many people visited
- covers by session (breakfast/lunch/dinner)
- covers by branch or location
- daily customer count
- customer distribution across time or location

---
### What this tool returns:

Each record represents aggregated customer covers for a specific combination of:

- REVENUE_CENTER_MASTER_ID → Unique ID of the revenue center  
- REVENUE_CENTER → Area within the branch (e.g., Restaurant, Terrace, Basement, Unknown)  
- SESSION_ID → Session identifier (1 = Breakfast, 2 = Lunch, 3 = Dinner)  
- SESSION_NAME → Time segment (Breakfast, Lunch, Dinner)  
- BRANCH_ID → Unique branch ID  
- BRANCH_NAME → Location (e.g., London, Bristol)  
- DATE → Business date of the record  
- COVERS → Number of customers   

---

### Important:

- Each row is already **aggregated data**
- One row = one combination of:
  - branch
  - session
  - revenue center
  - date
- This is **not raw or line-level data**

---

### Example:

{
  "REVENUE_CENTER": "Unknown",
  "SESSION_NAME": "BREAKFAST",
  "BRANCH_NAME": "London",
  "DATE": "2026-01-01",
  "COVERS": 10
}

→ Meaning:
10 customers visited the **London branch** during **Breakfast session** in the **Unknown revenue center** on that date.

---

### Important Behavior:

- Data is already aggregated (NOT line-level)
- Each row represents a grouped result (not individual customers)
- Multiple rows may exist for:
  - different sessions (Breakfast/Lunch/Dinner)
  - different branches
  - different revenue centers

---

### Example Interpretation:

For a single date:

- London → Breakfast → 10 covers  
- London → Lunch → 55 covers  
- London → Dinner → 354 covers  

- Bristol → Restaurant → Lunch → 282 covers  
- Bristol → Terrace → Dinner → 89 covers  

---

### Common Aggregations:

To derive insights:

- Total covers → SUM(COVERS)
- Covers by session → group by SESSION_NAME
- Covers by branch → group by BRANCH_NAME
- Covers by revenue center → group by REVENUE_CENTER
- Covers by date → group by DATE

---

### Example Outputs:

#### Total Covers:
{
  "total_covers": 1181
}

#### Covers by Session:
[
  { "session": "BREAKFAST", "covers": 49 },
  { "session": "LUNCH", "covers": 508 },
  { "session": "DINNER", "covers": 624 }
]

#### Covers by Branch:
[
  { "branch": "London", "covers": 419 },
  { "branch": "Bristol", "covers": 762 }
]

---

### Use Cases:

- Track customer footfall/ Covers trends
- Compare performance across branches
- Identify peak service periods
- Analyze utilization of revenue centers
- Build dashboards and charts (line, bar, pie)

---

### Notes:

- This tool returns pre-aggregated data
- Additional grouping may be required depending on user query
- Ideal for analytics, KPIs, and visualization
`,

  inputSchema: z.object({
    fromDate: z.string().describe("Start date YYYY-MM-DD"),
    toDate: z.string().describe("End date YYYY-MM-DD"),

    entityId: z.number().optional().default(0),

    // 🔥 SUPPORT MULTIPLE FORMATS
    branchId: z
      .union([z.number(), z.string(), z.array(z.number())])
      .optional()
      .default(0)
      .describe("Branch ID or multiple IDs"),

    customerId: z.number().optional().default(0),
  }),

  handler: async (input: any) => {
    const res = await getCoversHandler(input);

    if (res.isError) {
      return {
        content: [
          {
            type: "text",
            text: `❌ ${res.error}`,
          },
        ],
      };
    }

    const data = res.result ?? [];

    // 🔥 LIMIT RESULT (IMPORTANT)
    const safeData = data;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              count: safeData.length,
              data: safeData,
            },
            null,
            2
          ),
        },
      ],
    };
  },
};