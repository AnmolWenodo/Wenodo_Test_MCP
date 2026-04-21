import { get } from "node:http";
import { helloTool } from "./hello.tool";
import { getSalesTool } from "./get-sales.tool";
import { getSalesInvoiceLinesTool } from "./get-sales-invoice-lines.tool";
import { getSalesInvoiceTool } from "./get-sales-invoice.tool";
export const listTools = [helloTool,getSalesTool,getSalesInvoiceTool,
  getSalesInvoiceLinesTool];