import { z } from "zod";
import { getEmployeesHandler } from "../../handlers/get-employees.handler";

export const getEmployeesTool = {
  name: "get-employees",
  description: `
Fetch employee / staff master information from the HR and workforce management system.

This tool returns employee profile and employment-related details, where each row represents a single employee record.

---

### ✅ When to use this tool

Use this tool only if the user asks for:

👤 Employee Information Queries
employee detail
staff detail
employee profile
worker information
team member information
employee contact information
employee designation
employee department
employee branch mapping
manager reporting hierarchy

📊 HR & Workforce Queries
employee joining details
employee termination details
staff directory
employee phone / email lookup
employee payroll type
branch employees
department employees
manager-wise employees
active / terminated employees
probation information

---

### 📊 Data Structure

Each row represents a single employee master record.

Employee Information
  EMPLY_PRSNL_ID → Employee personal identifier
  TITLE → Employee title
  EMPLOYEE_NAME → Full employee name
  EMPLOYEE_NUMBER → Employee code / identifier
  KNOWN_AS → Preferred / short name

Personal Information
  NATIONALITY → Employee nationality
  GENDER → Gender
  DATE_OF_BIRTH → Date of birth

Contact Information
  PRIMARY_PHONE → Primary contact number
  SECONDARY_PHONE → Secondary contact number
  EMAIL → Employee email address

Employment Information
  POSITION_NAME → Job position / designation
  DEPARTMENT_NAME → Department name
  BRANCH_NAME → Assigned branch
  BRANCH_ID → Branch identifier

Employment Dates
  HIRING_DATE → Employee joining date
  PROBATION_END_DATE → Probation completion date
  TERMINATION_DATE → Employee termination date if applicable

Reporting Hierarchy
  PRIMARY_REPORTING_MANAGER → Primary manager
  SECONDARY_REPORTING_MANAGER → Secondary manager
  TERTIARY_REPORTING_MANAGER → Tertiary manager

Payroll Information
  PAYSCHEDULE_NAME → Payroll schedule
  PAY_TYPE → Payment type
    Examples:
    - Hourly Rate
    - Salary
    - Contract

Benefits & Policies
  PAID_BANK_HOLIDAY → Indicates if employee receives paid bank holidays

⚠️ Important Behavior

Each row represents an employee profile record.

Some fields may contain:
- NULL
- empty strings
- inactive employee data

Terminated employees may still appear in results depending on filters applied.

---

### 💡 Examples

User: "Show employee detail for Anthony"
→ Returns employee profile

User: "List all waiters in Franco's"
→ Filter by POSITION_NAME and BRANCH_NAME

User: "Show terminated employees"
→ Filter where TERMINATION_DATE is not null

User: "Who reports to Boban Jachev?"
→ Filter by reporting manager

User: "Employee contact details"
→ Returns phone and email information

---

### 📌 Notes

- Use this tool for employee master and HR-related information
- Prefer this tool when the user asks about staff profiles, hierarchy, employment status, or workforce details
- Employee records may include active and terminated staff
`,

  inputSchema: z.object({
    entityId: z.number(),
     branchIds: z
      .union([z.number(), z.string(), z.array(z.number())])
      .optional()
      .default(0)
      .describe("Branch ID or multiple IDs"),
    customerId: z.number(),
  }),

  handler: async (input: any) => {
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
