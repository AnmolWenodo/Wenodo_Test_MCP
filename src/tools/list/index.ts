import { get } from "node:http";
import { helloTool } from "./hello.tool";
import { getSalesTool } from "./get-sales.tool";
import { getSalesInvoiceLinesTool } from "./get-sales-invoice-lines.tool";
import { getSalesInvoiceTool } from "./get-sales-invoice.tool";
import { getCoversTool } from "./get-covers.tool";
import { getDiscountsTool } from "./get-discounts.tool";
import { getEmployeesTool } from "./get-employees.tool";
import { getPaymentsTool } from "./get-payments.tool";
export const listTools = [
  helloTool,
  getSalesTool,
  getSalesInvoiceTool,
  getSalesInvoiceLinesTool,
  getCoversTool,
  getPaymentsTool,
  getDiscountsTool,
  getEmployeesTool,
];
