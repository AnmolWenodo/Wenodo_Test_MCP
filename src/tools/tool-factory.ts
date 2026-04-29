import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listTools } from "./list";
import { MCPTool } from "../types/tool";
import { ZodRawShape } from "zod";

export function ToolFactory(server: McpServer) {
  const allTools: MCPTool[] = listTools;

  for (const tool of allTools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema as unknown as ZodRawShape,
      },
      tool.handler
    );
  }
}