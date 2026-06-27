import { z } from "zod";
import { getShiftHandler } from "../../handlers/get-shifts-handler";
import { getLeaveHandler } from "../../handlers/get-leaves-handler";
import { validateTenantProtection } from "../../helpers/security";

export const getLeavesTool = {
  name: "get-leaves",
  description: `Fetch employee leave and absence data from the workforce management system.

This tool returns leave-level workforce records, where each row represents an employee leave / absence entry.

---

### ✅ When to use this tool

Use this tool only if the user asks for:

🏖️ Leave & Absence Queries
employee leaves
staff leave records
annual leave
paid leave
unpaid leave
employee absences
leave details
leave schedules
approved leaves
leave history
employee time off
leave balance usage
absence tracking

📊 Workforce & HR Analysis Queries
department leave analysis
branch leave summaries
leave trends
employee leave statistics
absence reports
leave cost analysis
paid vs unpaid leave
position-wise leave analysis
leave status reports
daily leave summaries

---

### 📊 Data Structure

Each row represents a single employee leave or absence record.

Leave Metrics
  PAID_LEAVE → Total paid leave units / days
  UN_PAID_LEAVE → Total unpaid leave units / days
  PAID_LEAVE_PAY → Total paid leave amount
  UN_PAID_LEAVE_PAY → Total unpaid leave amount

Date Range
  START_DATE → Query start date
  END_DATE → Query end date
  LEAVE_DATE → Actual leave date

Entity & Branch
  ENTITY_ID → Entity identifier
  BRANCH_ID → Branch identifier
  ENTITY_NAME → Entity name
  BRANCH_NAME → Branch name

Employee Information
  EMPLY_PRSNL_ID → Employee identifier
  EMPLOYEE_NUMBER → Employee code
  EMPLOYEE_NAME → Employee full name

Leave Information
  ABSENCE_TYPE → Leave / absence type
    Examples:
    - Annual Leave
    - Sick Leave
    - Emergency Leave
    - Unpaid Leave

  LEAVE_STATUS_NAME → Leave approval status
    Examples:
    - Approved
    - Auto Approved
    - Pending
    - Rejected

Employment Information
  PAY_TYPE → Employee pay type
  POSITION_NAME → Employee position
  DEPARTMENT_NAME → Department name
  SECTION_NAME → Section name

⚠️ Important Behavior

Each row represents an employee leave or absence record.

Data may be grouped dynamically depending on the groupBy parameter.

Fields included depend on grouping selection.

Missing dimensions may appear as:
- NULL
- empty values

---

### 🧠 Grouping (PI_GROUP_BY)

Pass numeric IDs as an array to control aggregation.

Supported values:

8 = Position (POSITION_NAME)
9 = Department (DEPARTMENT_NAME)
10 = Section (SECTION_NAME)
11 = Shift (SHIFT_NAME)
12 = Pay Type (PAY_TYPE)
13 = Business Date (BUSINESS_DATE)
14 = Employee (EMPLOYEE_NUMBER, EMPLOYEE_NAME)

---

### 💡 Examples

User: "Show annual leave records"
→ Returns leave entries

User: "Department-wise leave analysis"
→ groupBy: [9]

User: "Employee leave summary"
→ groupBy: [14]

User: "Daily absence report"
→ groupBy: [13]

User: "Paid vs unpaid leave analysis"
→ Returns leave payment metrics

User: "Branch leave trends"
→ groupBy: [13,9]

---

### 📌 Notes

- Always convert natural language dates → YYYY-MM-DD
- Use this tool for employee leave, absence, and paid/unpaid leave analysis
- Prefer this tool when the user asks about vacations, absences, leave costs, or workforce availability
`,

  inputSchema: z.object({
    fromDate: z.string().describe("Start date YYYY-MM-DD"),

    toDate: z.string().describe("End date YYYY-MM-DD"),
    entityId: z.number(),
    branchIds: z
      .union([z.number(), z.string(), z.array(z.number())])
      .optional()
      .default(0)
      .describe("Branch ID or multiple IDs"),
    customerId: z.number(),
    groupBy: z
  .array(
    z.union([
      z.literal(8).transform(() => 8),   // position
      z.literal(9).transform(() => 9),   // department
      z.literal(10).transform(() => 10), // section
      z.literal(11).transform(() => 11), // shift
      z.literal(12).transform(() => 12), // pay type
      z.literal(13).transform(() => 13), // business date
      z.literal(14).transform(() => 14), // employee
      // Catch-all: unknown strings (e.g. "BRANCH_NAME") → null → filtered out
      z.string().transform((val) => { const n = Number(val); return isNaN(n) ? null : n; }),
      z.number().transform((val) => val),
    ]),
  )
  .transform((arr) => arr.filter((v): v is number => v !== null))
  .default([13])
  .describe(
    "Fields to group by. Pass numeric IDs only:\n" +
      "8 = position\n" +
      "9 = department\n" +
      "10 = section\n" +
      "11 = shift\n" +
      "12 = pay type\n" +
      "13 = business date\n" +
      "14 = employee\n" +
      "NOTE: No groupBy for Branch/Site — use branchIds for branch filtering.\n" +
      "Example: [13], [9,13], [8,14]",
  ),

    Week_Array: z
      .array(
        z.object({
          WEEK_START_DATE: z
            .string()
            .describe("Week start date in YYYY-MM-DD format"),

          WEEK_END_DATE: z
            .string()
            .describe("Week end date in YYYY-MM-DD format"),
        }),
      )
      .default([])
      .describe(
        "Array of custom weekly date ranges used for week-over-week comparisons",
      ),

    Month_Array: z
      .array(
        z.object({
          MONTH_START_DATE: z
            .string()
            .describe("Month start date in YYYY-MM-DD format"),

          MONTH_END_DATE: z
            .string()
            .describe("Month end date in YYYY-MM-DD format"),
        }),
      )
      .default([])
      .describe(
        "Array of custom monthly date ranges used for month-over-month comparisons",
      ),

    Period_Array: z
      .array(
        z.object({
          PERIOD_START_DATE: z
            .string()
            .describe("Custom period start date in YYYY-MM-DD format"),

          PERIOD_END_DATE: z
            .string()
            .describe("Custom period end date in YYYY-MM-DD format"),
        }),
      )
      .default([])
      .describe(
        "Array of arbitrary custom date ranges used for flexible reporting comparisons",
      ),
      Text : z.string().describe("Additional context or instructions for the query"),
  UserId : z.number().describe("User ID for permission checks and personalization"),
  }),

  handler: async (input: any) => {
    const tenantCheck = validateTenantProtection(input);
    if (!tenantCheck.isValid) {
      return {
        content: [{ type: "text", text: `❌ Security Error: ${tenantCheck.error}` }],
      };
    }

    const res = await getLeaveHandler(input);

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

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(res.result),
        },
      ],
    };
  },
};
