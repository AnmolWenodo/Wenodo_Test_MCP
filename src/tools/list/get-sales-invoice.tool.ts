import { z } from "zod";
import { getSalesInvoiceHandler } from "../../handlers/get-sales-invoice.handler";

export const getSalesInvoiceTool = {
  name: "get-sales-invoice-headers",
  description: `
Get sales invoice header data.

Returns one record per transaction (check) including:
- Sales values (net, tax, gross, discount, tips, service charge)
NET = Revenue before tax
TAX = Tax amount
GROSS = Total revenue (NET + TAX)
DISCOUNT = Discount applied
COMP = Complimentary value
VOID = Voided amount
TIPS = Tips collected
SERVICE_CHARGE = Service charge
DONATION = Donation amount
- Customer count (covers)
- Transaction timestamps (open, close, cashup date)
- Business context (entity, branch, integration system)
- Session classification (e.g., breakfast, lunch, dinner)

Use this tool when the user asks about:
- Sales totals or summaries
- Revenue breakdowns
- Number of transactions
- Footfall (covers)
- Discounts, comps, voids
- Session or time-based sales trends
- Average bill value or per-check analysis

Total Sales → SUM(GROSS)
Net Sales → SUM(NET)
Total Tax → SUM(TAX)
Total Covers → SUM(COVERS)
Average Bill Value (ABV) → SUM(GROSS) / COUNT(CHECK_ID)
Average Spend per Customer → SUM(GROSS) / SUM(COVERS)
Discount % → SUM(DISCOUNT) / SUM(GROSS)
Transaction Count → COUNT(*)




Do NOT use for:
- Item-level sales (use sales lines tool)
- Payment method breakdown (use payments tool)

Each record represents a single invoice/check.
Aggregate results to compute totals, averages, and trends.
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
    const res = await getSalesInvoiceHandler(input);

  const response = transformInvoicesResponse(res.result);
    console.log(response);
    
    return response;
  },
};



function transformInvoicesResponse(response: any) {
  // 🔥 normalize input
  let invoices = [];

  if (Array.isArray(response)) {
    invoices = response;
  } else if (Array.isArray(response?.data)) {
    invoices = response.data;
  } else if (response) {
    invoices = [response]; // single object case
  }

  const count = invoices.length;

  return {
    content: [
    ...invoices.map((inv: any, index: number) => ({
  type: "text",
  text: [
    `Sale #${index + 1}`,
    `Sales ID: ${inv.EPOS_SALES_HEADER_ID}`,
    `Check ID: ${inv.CHECK_ID}`,
    `Check No: ${inv.CHECK_NO}`,
    `Entity: ${inv.ENTITY_NAME} (${inv.ENTITY_ID})`,
    `Branch: ${inv.BRANCH_NAME} (${inv.BRANCH_ID})`,
    inv.CASHUP_MAIN_ID && `Cashup ID: ${inv.CASHUP_MAIN_ID}`,
    inv.CASHUP_DATE && `Cashup Date: ${inv.CASHUP_DATE}`,
    inv.CREATED_DATE && `Created: ${inv.CREATED_DATE}`,
    inv.OPEN_TIME && `Open Time: ${inv.OPEN_TIME}`,
    inv.CLOSE_TIME && `Close Time: ${inv.CLOSE_TIME}`,
    inv.SESSION_NAME && `Session: ${inv.SESSION_NAME}`,
    inv.COVERS != null && `Covers: ${inv.COVERS}`,
    `Net: ${inv.NET}`,
    `Tax: ${inv.TAX}`,
    `Gross: ${inv.GROSS}`,
    inv.DISCOUNT != null && `Discount: ${inv.DISCOUNT}`,
    inv.COMP != null && `Comp: ${inv.COMP}`,
    inv.VOID != null && `Void: ${inv.VOID}`,
    inv.TIPS != null && `Tips: ${inv.TIPS}`,
    inv.SERVICE_CHARGE != null && `Service Charge: ${inv.SERVICE_CHARGE}`,
    inv.DONATION != null && `Donation: ${inv.DONATION}`,
    inv.INTEGRATION_SYSTEM_NAME &&
      `Source: ${inv.INTEGRATION_SYSTEM_NAME} (${inv.INTEGRATION_SYSTEM_ID})`,
  ]
    .filter(Boolean)
    .join(" | "), // ✅ single line
})),
    ],

    
  };
}