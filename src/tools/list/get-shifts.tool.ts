import { z } from "zod";
import { getShiftHandler } from "../../handlers/get-shifts-handler";

export const getShiftsTool = {
  name: "get-shifts",
  description: `
Fetch employee shift scheduling, attendance, and labor cost data from the workforce management system.

This tool returns shift-level workforce records, where each row represents a scheduled or approved employee shift.

---

### ✅ When to use this tool

Use this tool only if the user asks for:

🕒 Shift & Scheduling Queries
employee shifts
scheduled shifts
staff rota
duty roster
shift schedules
employee attendance
clock-in / clock-out details
approved shifts
shift timing details
working hours

💰 Labor Cost & Payroll Queries
labor cost analysis
scheduled labor cost
approved labor cost
shift wage analysis
NIC / pension cost
holiday accrual cost
staffing cost by branch
department labor analysis
position-wise labor cost

📊 Workforce Operations Queries
branch staffing
department staffing
employee availability
attendance exceptions
missing clock-ins
approved vs scheduled shifts
working hours analysis
staff utilization

---

### 📊 Data Structure

Each row represents a single employee shift schedule or attendance record.

Shift Information
  SCHDL_SHIFT_ID → Shift schedule identifier
  SHIFT_MASTER_ID → Shift template identifier
  SHIFT_NAME → Shift name
  SHIFT_COUNT → Number of shifts

Employee Information
  EMPLY_PRSNL_ID → Employee identifier

Business & Branch Information
  BUSINESS_DATE → Business / working date
  ENTITY_ID → Entity identifier
  BRANCH_ID → Branch identifier
  ENTITY_NAME → Entity name
  BRANCH_NAME → Branch name

Position & Department
  POSITION_ID → Position identifier
  POSITION_NAME → Job position
  DEPARTMENT_ID → Department identifier
  DEPARTMENT_NAME → Department name
  SECTION_ID → Section identifier
  SECTION_NAME → Section name

Scheduled Shift Details
  SCHEDULED_START → Scheduled start time
  SCHEDULED_END → Scheduled end time
  SCHEDULED_DURATION → Scheduled duration in minutes
  SCHEDULED_PAID_BREAK → Paid break duration
  SCHEDULED_UNPAID_BREAK → Unpaid break duration

Clock-In / Attendance Details
  CLOCK_IN → Actual clock-in timestamp
  CLOCK_OUT → Actual clock-out timestamp
  CLOCK_IN_SHIFT_DURATION → Actual worked duration

Approved Shift Details
  APPROVED_CLOCK_IN → Approved start time
  APPROVED_CLOCK_OUT → Approved end time
  APPROVED_SHIFT_DURATION → Approved duration

Break Information
  ACTUAL_BREAK_DURATION → Actual break duration
  ACTUAL_BREAK_DURATION_EXCLUDING_PAID_BREAK → Actual unpaid break duration
  ACTUAL_BREAK_TAKEN → Indicates if break was taken
  APPROVED_BREAK_DURATION → Approved break duration
  APPROVED_BREAK_DURATION_EXCLUDING_PAID_BREAK → Approved unpaid break duration

Shift Status
  STATUS_ID → Shift status identifier
  STATUS_NAME → Shift status
    Examples:
    - Approved
    - Pending
    - Rejected
    - Clocked In

Employee Branch
  EMPLY_BRANCH_ID → Employee home branch identifier
  EMPLY_BRANCH_NAME → Employee home branch

Labor Cost Metrics
  SCHEDULED_COST → Scheduled labor cost
  SCHEDULED_PENSION → Scheduled pension cost
  SCHEDULED_NIC → Scheduled national insurance contribution
  SCHEDULED_HOLIDAY_ACCRUAL_COST → Scheduled holiday accrual

Clocked-In Cost Metrics
  CLOCKED_IN_COST → Actual labor cost based on attendance
  CLOCKED_IN_PENSION → Actual pension cost
  CLOCKED_IN_NIC → Actual NIC
  CLOCKED_IN_HOLIDAY_ACCRUAL_COST → Actual holiday accrual cost

Approved Cost Metrics
  APPROVED_COST → Approved labor cost
  APPROVED_PENSION → Approved pension cost
  APPROVED_NIC → Approved NIC
  APPROVED_HOLIDAY_ACCRUAL_COST → Approved holiday accrual cost

Wage Information
  IS_SPECIAL_WAGE → Indicates special wage usage
  SPECIAL_WAGE → Special wage amount
  WAGE_TYPE_ID → Wage type identifier
  PAYTYPE_ID → Pay type identifier
  PAY_TYPE → Pay type
    Examples:
    - Shift Rate
    - Hourly Rate
    - Salary

Availability
  IS_UNAVAILABLE → Indicates employee unavailability

⚠️ Important Behavior

Each row represents a single employee shift record.

Data may include:
- scheduled shifts
- approved shifts
- attendance records
- labor cost calculations

Some attendance fields may be NULL if the employee has not clocked in/out yet.

---

### 🧠 Grouping (PI_GROUP_BY)

Pass numeric IDs as an array to control aggregation.

Supported values:

8  → Position (POSITION_NAME)
9  → Department (DEPARTMENT_NAME)
10 → Section (SECTION_NAME)
11 → Shift (SHIFT_NAME)
12 → Pay Type (PAY_TYPE)
13 → Business Date (BUSINESS_DATE)
14 → Employee (EMPLOYEE_NUMBER, EMPLOYEE_NAME)

---

### 💡 Examples

User: "Labor cost by department"
→ groupBy: [9]

User: "Shift-wise staffing analysis"
→ groupBy: [11]

User: "Employee-wise approved hours"
→ groupBy: [14]

User: "Daily labor summary"
→ groupBy: [13]

User: "Pay type analysis"
→ groupBy: [12]

User: "Position-wise staffing"
→ groupBy: [8]


User: "Show today's shifts"
→ Returns scheduled shift records

User: "Which employees missed clock-in?"
→ Filter where CLOCK_IN is NULL

User: "Labor cost by branch"
→ Aggregate using APPROVED_COST or SCHEDULED_COST

User: "Approved shifts for London branch"
→ Filter by STATUS_NAME and BRANCH_NAME

User: "Department staffing for Reservations"
→ Filter by DEPARTMENT_NAME

---

### 📌 Notes

- Use this tool for workforce scheduling, attendance, and labor cost analysis
- Prefer this tool when the user asks about shifts, staffing, labor expenses, or attendance tracking
- Time durations are generally stored in minutes
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
    ]),
  )
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
  }),

  handler: async (input: any) => {
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
