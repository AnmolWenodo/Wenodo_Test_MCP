import { z } from "zod";
import { getShiftHandler } from "../../handlers/get-shifts-handler";
import { validateTenantProtection } from "../../helpers/security";
import { optimizeTable } from "../../helpers/optimize";

export const getShiftsTool = {
  name: "get-shifts",
  description: `
Fetch employee staffing, labor cost, and workforce summary data from the workforce management system.

This tool returns workforce cost and staffing summary records, where each row represents aggregated employee shift, attendance, and labor cost data.

### GROUP BY DIMENSIONS (Pass numeric IDs only):
- 8 = Position (Labor metrics grouped by job position/title)
- 9 = Department (Labor metrics grouped by department)
- 10 = Section (Labor metrics grouped by specific work station)
- 11 = Shift (Labor metrics grouped by shift template name)
- 12 = Pay Type (Labor metrics grouped by compensation type, e.g., Hourly Rate, Salary)
- 13 = Business Date (Workforce summary per day)
- 14 = Employee (Workforce summary per staff member)

---

### ✅ When to use this tool

Use this tool only if the user asks for:

💰 Staff Cost & Labor Analysis Queries
staff cost
labor cost
employee cost
staffing expense
scheduled labor cost
approved labor cost
labor summary
staff payroll cost
shift cost analysis
NIC / pension cost analysis
holiday accrual cost
workforce expense analysis


📊 Workforce Summary Queries
staffing summary
employee shift summary
department staffing
branch staffing analysis
position-wise staffing
employee working hours summary
approved hours analysis
scheduled vs approved hours
attendance summary
daily workforce summary

🕒 Workforce Operations Queries
who worked today
staff utilization
branch workforce analysis
department labor analysis
employee scheduling summary
pay type analysis
shift summary
approved shift reporting

---

### 📊 Data Structure

Each row represents aggregated workforce staffing and labor cost data.

Core Labor Metrics
  SCHEDULED_COST → Scheduled labor cost
  APPROVED_COST → Approved labor cost
  CLOCKED_IN_COST → Actual labor cost based on attendance

Pension & NIC Metrics
  SCHEDULED_PENSION → Scheduled pension contribution
  APPROVED_PENSION → Approved pension contribution
  CLOCKED_IN_PENSION → Actual pension contribution

  SCHEDULED_NIC → Scheduled NIC contribution
  APPROVED_NIC → Approved NIC contribution
  CLOCKED_IN_NIC → Actual NIC contribution

Holiday Accrual Metrics
  SCHEDULED_HOLIDAY_ACCRUAL_COST → Scheduled holiday accrual cost
  APPROVED_HOLIDAY_ACCRUAL_COST → Approved holiday accrual cost
  CLOCKED_IN_HOLIDAY_ACCRUAL_COST → Actual holiday accrual cost

Employee Information
  EMPLY_PRSNL_ID → Employee identifier
  EMPLOYEE_NUMBER → Employee code
  EMPLOYEE_NAME → Employee full name

Business & Branch Information
  BUSINESS_DATE → Business date
  ENTITY_ID → Entity identifier
  BRANCH_ID → Branch identifier
  ENTITY_NAME → Entity name
  BRANCH_NAME → Branch name

Position & Department
  POSITION_NAME → Employee position
  DEPARTMENT_NAME → Department name
  SECTION_NAME → Section name

Shift Information
  SHIFT_NAME → Shift name
  SCHEDULED_DURATION → Scheduled shift duration
  APPROVED_SHIFT_DURATION → Approved shift duration

Attendance Information
  CLOCK_IN → Actual clock-in timestamp
  CLOCK_OUT → Actual clock-out timestamp
  STATUS_NAME → Shift / attendance status

Payroll Information
  PAY_TYPE → Employee pay type
    Examples:
    - Shift Rate
    - Hourly Rate
    - Salary

⚠️ Important Behavior

Data is generally aggregated depending on the grouping applied.

Each row may represent:
- employee labor summaries
- branch staffing summaries
- department labor summaries
- daily workforce summaries
- position-wise staffing summaries

Some attendance fields may contain:
- NULL
- empty values

Pagination is supported using:
- pageNo
- pageSize

---

### 💡 Examples

User: "Staff cost for last month"
→ Returns workforce labor cost summaries

User: "Department-wise labor analysis"
→ Group by department

User: "Branch staffing cost"
→ Returns branch labor summaries

User: "Approved labor hours by employee"
→ Returns employee workforce summaries

User: "Daily staff cost trends"
→ Returns date-wise labor summaries

User: "Pay type analysis"
→ Returns labor grouped by PAY_TYPE

---

### 📌 Notes

- Always convert natural language dates → YYYY-MM-DD
- Use this tool for workforce cost analysis and staffing summaries
- Prefer this tool when the user asks about labor expenses, staffing cost, workforce summaries, or employee labor analytics
- Supports paginated retrieval for large datasets
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
          z.literal(8).transform(() => 8), // position
          z.literal(9).transform(() => 9), // department
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
    Text: z
      .string()
      .optional()
      .default("")
      .describe("Optional text parameter for additional context"),
    UserId: z.coerce.number().optional().describe("Optional user ID for context"),
  }),

  handler: async (input: any) => {
    const tenantCheck = validateTenantProtection(input);
    if (!tenantCheck.isValid) {
      return {
        content: [{ type: "text", text: `❌ Security Error: ${tenantCheck.error}` }],
      };
    }

    const res = await getShiftHandler(input);

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
