import { get } from "node:http";
import { helloTool } from "./hello.tool";
import { getSalesTool } from "./get-sales.tool";
export const listTools = [helloTool,getSalesTool];