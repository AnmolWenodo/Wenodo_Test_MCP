import cors from "cors";
import "dotenv/config";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ToolFactory } from "./tools/tool-factory";
import { connectDB } from "./clients/db-client";

// dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(cors());

async function start() {
  await connectDB();
}
function createServer(): McpServer {
  const server = new McpServer({
    name: "my-mcp-server",
    version: "1.0.0",
  });

  ToolFactory(server);
  return server;
}

// Legacy SSE endpoint support
const sseServer = createServer();
const sseTransports = new Map<string, SSEServerTransport>();

app.get("/sse", async (_req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  sseTransports.set(transport.sessionId, transport);

  res.on("close", () => {
    sseTransports.delete(transport.sessionId);
  });

  await sseServer.connect(transport);
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string | undefined;

  if (!sessionId) {
    res.status(400).json({ error: "Missing sessionId query param" });
    return;
  }

  const transport = sseTransports.get(sessionId);
  if (!transport) {
    res.status(404).json({ error: `No SSE session found: ${sessionId}` });
    return;
  }

  await transport.handlePostMessage(req, res);
});

// Streamable HTTP MCP endpoint
app.post("/mcp", express.json(), async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Failed to process /mcp request:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  } finally {
    await transport.close();
    await server.close();
  }
});

app.listen(PORT, () => {
  start().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
  console.log(`MCP server listening on http://localhost:${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`Streamable HTTP endpoint: http://localhost:${PORT}/mcp`);
});
