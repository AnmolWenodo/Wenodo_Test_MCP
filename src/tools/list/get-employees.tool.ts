import { z } from "zod";
import { getEmployeesHandler } from "../../handlers/get-employees.handler";
import { validateTenantProtection } from "../../helpers/security";
import { optimizeTable } from "../../helpers/optimize";

export const getEmployeesTool = {
  name: "get-employees",
  description: `
Fetch employee / staff master information from the HR and workforce management system.

This tool returns employee profile and employment-related details, where each row represents a single employee record.

Required fields:
- entityId: number.
- customerId: number.
- branchIds: number, number[], or comma-separated string.
- UserId: number. Never send null.

Optional fields:
- Text: string containing the user's original request or useful query context.

branchIds rules:
- Valid: 237
- Valid: [237, 363, 359]
- Valid: "237,363,359"
- Invalid: ["237", "363", "359"]
If branch IDs are strings, convert them to numbers before calling.

---

### ✅ When to use this tool

Use this tool only if the user asks for:

👤 Employee Information Queries
- employee detail
- staff detail
- employee profile
- worker information
- team member information
- employee contact information
- employee designation
- employee department
- employee branch mapping
- manager reporting hierarchy

📊 HR & Workforce Queries
- employee joining details
- employee termination details
- staff directory
- employee phone / email lookup
- employee payroll type
- branch employees
- department employees
- manager-wise employees
- active / terminated employees
- probation information

---

### 💡 Examples
- "Show employee detail for Anthony"
- "List all waiters in Franco's"
- "Show terminated employees"
- "Who reports to Boban Jachev?"
- "Employee contact details"
`,

  inputSchema: z.object({
    entityId: z.number().describe("Required. Entity ID as a number."),

    branchIds: z.union([
      z.number(),
      z.array(z.number()),
      z.string()
    ]).describe(
      "Required. Branch IDs as a number, array of numbers, or comma-separated string. Valid: 237, [237,363], '237,363'. Invalid: ['237','363']; convert string arrays to number arrays."
    ),

    customerId: z.number().describe("Required. Customer ID as a number."),

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

    const res = await getEmployeesHandler(input);

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
      return { content: [{ type: "text", text: "No employees found" }] };
    }

    const optimized = optimizeTable(rows);
    return {
      content: [{ type: "text", text: JSON.stringify(optimized, null, 2) }],
    };
  },
};
