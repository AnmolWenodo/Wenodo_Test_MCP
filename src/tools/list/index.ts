import { get } from "node:http";
import { helloTool } from "./hello.tool";
import { getSalesTool } from "./get-sales.tool";
import { getSalesInvoiceLinesTool } from "./get-sales-invoice-lines.tool";
import { getSalesInvoiceTool } from "./get-sales-invoice.tool";
import { getCoversTool } from "./get-covers.tool";
import { getDiscountsTool } from "./get-discounts.tool";
import { getEmployeesTool } from "./get-employees.tool";
import { getPaymentsTool } from "./get-payments.tool";
import { getCheckWiseSalesSummaryTool } from "./get-checkwise-summary.tool";
import { getShiftsTool } from "./get-shifts.tool";
import { getLeavesTool } from "./get-leaves-tool";
export const listTools = [
  helloTool,
  getSalesTool,
  // getSalesInvoiceTool,
  getSalesInvoiceLinesTool,
  getCheckWiseSalesSummaryTool,
  // getCoversTool,
  getPaymentsTool,
  // getDiscountsTool,
  getEmployeesTool,
  getShiftsTool,
  getLeavesTool,
];
