import { z } from "zod";
import { getShiftsLine } from "../../handlers/get-shifts-lines.handler";
import { validateTenantProtection } from "../../helpers/security";
import { optimizeTable } from "../../helpers/optimize";

export const getShiftsLineTool = {
  name: "get-shift-lines",
  description: `
Fetch detailed employee shift, attendance, and labor cost data from the workforce management system.

This tool returns detailed shift-level workforce records, where each row represents an employee shift schedule, attendance entry, approved working shift, or labor cost record.

Required fields:
- fromDate: string in YYYY-MM-DD format.
- toDate: string in YYYY-MM-DD format.
- entityId: number.
- customerId: number.
- branchIds: number, number[], or comma-separated string.
- UserId: number. Never send null.

Optional fields:
- Text: string containing the user's original request or useful query context.
- groupBy: number[]. Default is [13]. Never include duplicate values.
- periodTypeId: only include for comparisons. Use 1 for Week over Week, 2 for Month over Month. Never send 0.
- pageNo: number. Default is 1.
- pageSize: number. Default is 50.

branchIds rules:
- Valid: 237
- Valid: [237, 363, 359]
- Valid: "237,363,359"
- Invalid: ["237", "363", "359"]
If branch IDs are strings, convert them to numbers before calling.

Allowed groupBy values:
- 8 = Position
- 9 = Department
- 10 = Section
- 11 = Shift
- 12 = Pay Type
- 13 = Business Date
- 14 = Employee

---

### ✅ When to use this tool

Use this tool only if the user asks for:

🕒 Shift & Attendance Queries
- employee shifts
- staff schedules
- rota details
- shift details
- attendance records
- clock-in / clock-out information
- approved shifts
- employee working hours
- daily staffing
- scheduled employees
- employee attendance detail
- employee shift history

💰 Workforce & Labor Cost Queries
- labor cost detail
- scheduled labor cost
- approved labor cost
- employee wage analysis
- NIC / pension cost
- shift wage analysis
- department labor analysis
- branch staffing cost
- approved hours analysis
- pay type analysis

---

### 💡 Examples
- "Show today's employee shifts"
- "Who missed clock-in today?"
- "Detailed attendance for London branch"
- "Labor cost by employee"
- "Approved shifts for Management department"
- "Employee shift history"
`,

  inputSchema: z.object({
    fromDate: z.string().describe("Required. Start date in YYYY-MM-DD format."),

    toDate: z.string().describe("Required. End date in YYYY-MM-DD format."),

    entityId: z.number().describe("Required. Entity ID as a number."),

    branchIds: z.union([
      z.number(),
      z.array(z.number()),
      z.string()
    ]).describe(
      "Required. Branch IDs as a number, array of numbers, or comma-separated string. Valid: 237, [237,363], '237,363'. Invalid: ['237','363']; convert string arrays to number arrays."
    ),

    customerId: z.number().describe("Required. Customer ID as a number."),

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
          "Example: [13], [9,13], [8,14]"
      ),

    periodTypeId: z.number().optional().describe("Optional. Only include for comparisons: 1=Week over Week, 2=Month over Month. Never send 0."),

    pageNo: z.number().optional().default(1).describe("Optional. Page number for paginated results (default: 1)."),

    pageSize: z.number().optional().default(50).describe("Optional. Number of records per page (default: 50)."),

    Text: z
      .string()
      .optional()
      .default("")
      .describe("Optional. Original user request or useful query context."),

    UserId: z.coerce.number().describe("Required user ID for permission checks. Never send null."),
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
