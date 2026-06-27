import { z } from "zod";
import { getSalesInvoiceLinesHandler } from "../../handlers/get-sales-invoice-lines.handler";
import { getCheckWiseSalesSummaryHandler } from "../../handlers/get-checkwise-summary.handler";
import { optimizeTable } from "../../helpers/optimize";

export const getCheckWiseSalesSummaryTool = {
  name: "get-check-wise-sales-summary",
  description: `Fetch detailed information for a specific POS check / invoice / bill.

Use this tool whenever the user asks about:

check detail
invoice detail
bill detail
receipt detail
transaction detail
order detail
POS check information
check breakdown
invoice breakdown
bill breakdown
item level detail for a check
payment detail for a check
tax detail for a bill
discount detail for an invoice
specific check information

Examples:

"Show detail for check 1205"
"Get invoice INV-1001 detail"
"Show bill breakdown for yesterday"
"What items were in check 550?"
"Show payment split for invoice 2001"
"Tax and discount detail for check 900"

### 📊 Data Structure

Each row represents aggregated check-level sales data grouped dynamically based on the groupBy parameter.

Core Metrics
  NET → Total net sales amount
  GROSS → Total gross sales amount
  TAX → Total tax amount
  DISCOUNT → Total discount amount
  VOID → Total void amount
  QUANITY → Total quantity sold

Check Information
  CHECK_NO → POS check / bill number

Date Range
  START_DATE → Query start date
  END_DATE → Query end date

Entity & Branch
  ENTITY_ID → Entity identifier
  BRANCH_ID → Branch identifier
  ENTITY_NAME → Entity name
  BRANCH_NAME → Branch name

The tool returns:

Check / invoice information
Item level details
Quantity and prices
Discounts and taxes
Payment details
Guest count
Employee / cashier
Branch and revenue center
Open / close timestamps
Net / gross amounts`,

inputSchema: z.object({
  fromDate: z.string().describe("Start date YYYY-MM-DD"),

  toDate: z.string().describe("End date YYYY-MM-DD"),

  entityId: z.number().describe("Entity ID"),

  branchIds: z.union([
    z.number(),
    z.array(z.number()),
    z.string()
  ]).describe(
    "Branch ID(s) — single number, array of numbers, or comma-separated string e.g. '1,2,3'"
  ),

  customerId: z.number().describe("Customer ID"),

  groupBy: z.array(
    z.union([
      z.literal(1).transform(() => 1), // day
      z.literal(2).transform(() => 2), // hour
      z.literal(3).transform(() => 3), // session
      z.literal(4).transform(() => 4), // category
      z.literal(5).transform(() => 5), // revenue center
      z.literal(6).transform(() => 6), // product
    ])
  )
    .default([1])
    .describe(
      "Fields to group by. Pass numeric IDs only:\n" +
      "1 = day\n" +
      "2 = hour\n" +
      "3 = session\n" +
      "4 = category\n" +
      "5 = revenue center\n" +
      "6 = product\n" +
      "Example: [1], [1,3], [4,6]"
    ),

  Week_Array: z.array(
    z.object({
      WEEK_START_DATE: z.string().describe(
        "Week start date in YYYY-MM-DD format"
      ),

      WEEK_END_DATE: z.string().describe(
        "Week end date in YYYY-MM-DD format"
      ),
    })
  )
    .default([])
    .describe(
      "Array of custom weekly date ranges used for week-over-week comparisons"
    ),

  Month_Array: z.array(
    z.object({
      MONTH_START_DATE: z.string().describe(
        "Month start date in YYYY-MM-DD format"
      ),

      MONTH_END_DATE: z.string().describe(
        "Month end date in YYYY-MM-DD format"
      ),
    })
  )
    .default([])
    .describe(
      "Array of custom monthly date ranges used for month-over-month comparisons"
    ),

  Period_Array: z.array(
    z.object({
      PERIOD_START_DATE: z.string().describe(
        "Custom period start date in YYYY-MM-DD format"
      ),

      PERIOD_END_DATE: z.string().describe(
        "Custom period end date in YYYY-MM-DD format"
      ),
    })
  )
    .default([])
    .describe(
      "Array of arbitrary custom date ranges used for flexible reporting comparisons"
    ),
  Text : z.string().describe("Additional context or instructions for the query"),
  UserId : z.number().describe("User ID for permission checks and personalization"),
  Variables: z
    .object({
      customerId: z.number(),
      entityId: z.number(),
      branchIds: z.array(z.number()),
      startDate: z.string(),
      endDate: z.string(),
      groupBy: z.array(z.number()),

      Week_Array: z.array(
        z.object({
          WEEK_START_DATE: z.string(),
          WEEK_END_DATE: z.string(),
        })
      ),

      Month_Array: z.array(z.any()),

      Period_Array: z.array(z.any()),
    })
    .describe("Filter variables object"),
}),
  handler: async (input: any) => {
    const res = await getCheckWiseSalesSummaryHandler(input);

    if (res.isError) {
      return { content: [{ type: "text", text: `❌ ${res.error}` }] };
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
