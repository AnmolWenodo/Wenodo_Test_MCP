import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

let instance: McpServer | null = null;

export function getServer(): McpServer {
  if (!instance) {
    instance = new McpServer({
      name: "my-mcp-server",
      version: "1.0.0",
    });
  }
  return instance;
}