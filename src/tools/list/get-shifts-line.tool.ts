import { z } from "zod";
import { getShiftsLine } from "../../handlers/get-shifts-lines.handler";

export const getShiftsLineTool = {
  name: "get-shift-lines",

  description: `
Fetch detailed employee shift, attendance, and workforce scheduling data from the workforce management system.

This tool returns detailed shift-level workforce records, where each row represents an employee shift schedule, attendance entry, or approved working shift.

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

💰 Workforce & Labor Queries
labor cost detail
shift cost analysis
scheduled vs actual shifts
employee working duration
branch staffing analysis
department staffing
approved labor hours
pay type analysis
employee utilization

📊 Operational Queries
who worked today
which employees were scheduled
missing clock-ins
attendance tracking
daily workforce reports
branch-wise staffing
employee shift history
shift approval tracking

---

### 📊 Data Structure

Each row represents a detailed employee shift or attendance record.

Business & Branch Information
  BUSINESS_DATE → Business / working date
  ENTITY_ID → Entity identifier
  BRANCH_ID → Branch identifier
  ENTITY_NAME → Entity name
  BRANCH_NAME → Branch name

Employee Information
  EMPLY_PRSNL_ID → Employee identifier

Shift Information
  SHIFT_NAME → Shift name
  SCHEDULED_START → Scheduled start timestamp
  SCHEDULED_END → Scheduled end timestamp
  APPROVED_CLOCK_IN → Approved clock-in time
  APPROVED_CLOCK_OUT → Approved clock-out time
  CLOCK_IN → Actual clock-in timestamp
  CLOCK_OUT → Actual clock-out timestamp

Position & Department
  POSITION_NAME → Employee position
  DEPARTMENT_NAME → Department name
  SECTION_NAME → Section name

Attendance & Duration
  SCHEDULED_DURATION → Scheduled duration in minutes
  APPROVED_SHIFT_DURATION → Approved shift duration
  ACTUAL_BREAK_DURATION → Actual break duration

Labor Cost Metrics
  SCHEDULED_COST → Scheduled labor cost
  APPROVED_COST → Approved labor cost
  SCHEDULED_PENSION → Scheduled pension contribution
  APPROVED_PENSION → Approved pension contribution
  SCHEDULED_NIC → Scheduled NIC contribution
  APPROVED_NIC → Approved NIC contribution

Payroll Information
  PAY_TYPE → Employee pay type

Shift Status
  STATUS_NAME → Shift status

---

### 📌 Notes

- Always convert natural language dates → YYYY-MM-DD
- Supports paginated retrieval using pageNo and pageSize
- Use this tool for workforce scheduling, attendance tracking, and labor analysis
`,

  inputSchema: z.object({
    fromDate: z.string().describe("Start date YYYY-MM-DD"),

    toDate: z.string().describe("End date YYYY-MM-DD"),

    entityId: z.number().describe("Entity ID"),

    branchIds: z
      .union([z.number(), z.array(z.number()), z.string()])
      .describe(
        "Branch ID(s) — single number, array of numbers, or comma-separated string e.g. '1,2,3'"
      ),

    customerId: z.number().describe("Customer ID"),

    pageNo: z
      .number()
      .default(1)
      .describe("Page number for paginated results"),

    pageSize: z
      .number()
      .default(50)
      .describe("Number of records per page"),

    Week_Array: z
      .array(
        z.object({
          WEEK_START_DATE: z
            .string()
            .describe("Week start date in YYYY-MM-DD format"),

          WEEK_END_DATE: z
            .string()
            .describe("Week end date in YYYY-MM-DD format"),
        })
      )
      .default([])
      .describe(
        "Array of custom weekly date ranges used for week-over-week comparisons"
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
        })
      )
      .default([])
      .describe(
        "Array of custom monthly date ranges used for month-over-month comparisons"
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
        })
      )
      .default([])
      .describe(
        "Array of arbitrary custom date ranges used for flexible reporting comparisons"
      ),
  }),

  handler: async (input: any) => {
    const res = await getShiftsLine(input);

    if (res.result) {
      const safeData = res.result;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(safeData, null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: "No data found",
        },
      ],
    };
  },
};