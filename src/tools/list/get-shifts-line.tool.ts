import { z } from "zod";
import { getShiftsLine } from "../../handlers/get-shifts-lines.handler";
import { validateTenantProtection } from "../../helpers/security";
import { optimizeTable } from "../../helpers/optimize";

export const getShiftsLineTool = {
  name: "get-shift-lines",

  description: `
Fetch detailed employee shift, attendance, and labor cost data from the workforce management system.

This tool returns detailed shift-level workforce records, where each row represents an employee shift schedule, attendance entry, approved working shift, or labor cost record.

---

### ✅ When to use this tool

Use this tool only if the user asks for:

🕒 Shift & Attendance Queries
employee shifts
staff schedules
rota details
shift details
attendance records
clock-in / clock-out information
approved shifts
employee working hours
daily staffing
scheduled employees
employee attendance detail
employee shift history

💰 Workforce & Labor Cost Queries
labor cost detail
scheduled labor cost
approved labor cost
employee wage analysis
NIC / pension cost
shift wage analysis
department labor analysis
branch staffing cost
approved hours analysis
pay type analysis

📊 Operational Queries
who worked today
which employees were scheduled
missing clock-ins
attendance tracking
daily workforce reports
branch-wise staffing
department staffing
employee utilization
approved shift analysis

---

### 📊 Data Structure

Each row represents a detailed employee shift or attendance record.

Shift Information
  SCHDL_SHIFT_ID → Shift schedule identifier
  SHIFT_MASTER_ID → Shift template identifier
  SHIFT_NAME → Shift name
  SHIFT_COUNT → Number of shifts

Employee Information
  EMPLY_PRSNL_ID → Employee identifier
  EMPLOYEE_NUMBER → Employee code
  EMPLOYEE_NAME → Employee full name

Business & Branch Information
  BUSINESS_DATE → Business / working date
  ENTITY_ID → Entity identifier
  BRANCH_ID → Branch identifier
  ENTITY_NAME → Entity name
  BRANCH_NAME → Branch name

Position & Department
  POSITION_ID → Position identifier
  POSITION_NAME → Employee position
  DEPARTMENT_ID → Department identifier
  DEPARTMENT_NAME → Department name
  SECTION_ID → Section identifier
  SECTION_NAME → Section name

Scheduled Shift Details
  SCHEDULED_START → Scheduled shift start timestamp
  SCHEDULED_END → Scheduled shift end timestamp
  SCHEDULED_DURATION → Scheduled duration in minutes
  SCHEDULED_PAID_BREAK → Scheduled paid break duration
  SCHEDULED_UNPAID_BREAK → Scheduled unpaid break duration

Clock-In / Attendance Details
  CLOCK_IN → Actual clock-in timestamp
  CLOCK_OUT → Actual clock-out timestamp
  CLOCK_IN_SHIFT_DURATION → Actual worked duration

Approved Shift Details
  APPROVED_CLOCK_IN → Approved clock-in timestamp
  APPROVED_CLOCK_OUT → Approved clock-out timestamp
  APPROVED_SHIFT_DURATION → Approved shift duration

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

Employee Branch
  EMPLY_BRANCH_ID → Employee home branch identifier
  EMPLY_BRANCH_NAME → Employee home branch

Labor Cost Metrics
  SCHEDULED_COST → Scheduled labor cost
  SCHEDULED_PENSION → Scheduled pension contribution
  SCHEDULED_NIC → Scheduled national insurance contribution
  SCHEDULED_HOLIDAY_ACCRUAL_COST → Scheduled holiday accrual cost

Clocked-In Cost Metrics
  CLOCKED_IN_COST → Actual labor cost based on attendance
  CLOCKED_IN_PENSION → Actual pension contribution
  CLOCKED_IN_NIC → Actual national insurance contribution
  CLOCKED_IN_HOLIDAY_ACCRUAL_COST → Actual holiday accrual cost

Approved Cost Metrics
  APPROVED_COST → Approved labor cost
  APPROVED_PENSION → Approved pension contribution
  APPROVED_NIC → Approved national insurance contribution
  APPROVED_HOLIDAY_ACCRUAL_COST → Approved holiday accrual cost

Wage Information
  IS_SPECIAL_WAGE → Indicates special wage usage
  SPECIAL_WAGE → Special wage amount
  WAGE_TYPE_ID → Wage type identifier
  PAYTYPE_ID → Pay type identifier
  PAY_TYPE → Employee pay type
    Examples:
    - Shift Rate
    - Hourly Rate
    - Salary

Availability
  IS_UNAVAILABLE → Indicates employee unavailability

Pagination
  PAGING → Pagination indicator / page reference

⚠️ Important Behavior

Each row represents a detailed employee shift or attendance record.

Data may include:
- scheduled shifts
- approved shifts
- attendance records
- labor cost calculations
- incomplete clock-ins / clock-outs

Some fields may contain:
- NULL
- empty values

Pagination is supported using:
- pageNo
- pageSize

---

### 💡 Examples

User: "Show today's employee shifts"
→ Returns scheduled shift records

User: "Who missed clock-in today?"
→ Filter where CLOCK_IN is NULL

User: "Detailed attendance for London branch"
→ Returns attendance records

User: "Labor cost by employee"
→ Returns workforce cost metrics

User: "Approved shifts for Management department"
→ Filter by STATUS_NAME and DEPARTMENT_NAME

User: "Employee shift history"
→ Returns historical shift records

---

### 📌 Notes

- Always convert natural language dates → YYYY-MM-DD
- Use this tool for workforce scheduling, attendance tracking, and labor cost analysis
- Prefer this tool when the user asks for employee shift detail, staffing operations, or attendance visibility
- Supports paginated retrieval for large datasets
`,

  inputSchema: z.object({
    fromDate: z.string().describe("Start date YYYY-MM-DD"),

    toDate: z.string().describe("End date YYYY-MM-DD"),

    entityId: z.number().describe("Entity ID"),

    branchIds: z
      .union([z.number(), z.array(z.number()), z.string()])
      .describe(
        "Branch ID(s) — single number, array of numbers, or comma-separated string e.g. '1,2,3'",
      ),

    customerId: z.number().describe("Customer ID"),

    pageNo: z.number().default(1).describe("Page number for paginated results"),

    pageSize: z.number().default(50).describe("Number of records per page"),

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
      .describe("Additional context or instructions for the query"),
    UserId: z
      .number()
      .describe("User ID for permission checks and personalization"),
  }),

  handler: async (input: any) => {
    const tenantCheck = validateTenantProtection(input);
    if (!tenantCheck.isValid) {
      return {
        content: [{ type: "text", text: `❌ Security Error: ${tenantCheck.error}` }],
      };
    }

    const res = await getShiftsLine(input);

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
