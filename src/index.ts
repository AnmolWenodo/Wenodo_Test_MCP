import cors from "cors";
import "dotenv/config";
import express from "express";
import { listTools } from "./tools/list";
import { connectDB } from "./clients/db-client";
import zodToJsonSchema from "zod-to-json-schema";
import { z } from "zod";
const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

// ─── Tool registry ────────────────────────────────────────────────────────────

const toolMap = new Map(listTools.map((tool) => [tool.name, tool]));

// ─── handleMCPRequest ─────────────────────────────────────────────────────────

let isInitialized = false;

async function handleMCPRequest(
  method: string,
  params: Record<string, any> = {},
  id: string | number | null,
) {
  if (!isInitialized && method !== "initialize") {
    return {
      jsonrpc: "2.0",
      error: { code: -32000, message: "Server not initialized" },
      id,
    };
  }

  try {
    let result: Record<string, any>;

    switch (method) {
      case "initialize":
        isInitialized = true;
        result = {
          protocolVersion: "2024-11-05",
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "my-mcp-server", version: "1.0.0" },
        };
        break;

      case "tools/list":
        result = {
          tools: listTools.map((tool) => {
            // Cast to ZodObject to access .shape directly
            const shape = (tool.inputSchema as unknown as z.ZodObject<any>)
              .shape;

            // Build JSON schema manually from shape
            const properties: Record<string, any> = {};
            const required: string[] = [];

            for (const [key, value] of Object.entries(shape)) {
              const fieldSchema = zodToJsonSchema(value as any) as any;
              properties[key] = fieldSchema;

              // If field is not optional, mark as required
              const isOptional =
                value instanceof z.ZodOptional || value instanceof z.ZodDefault;
              if (!isOptional) {
                required.push(key);
              }
            }

            return {
              name: tool.name,
              description: tool.description,
              inputSchema: {
                type: "object",
                properties,
                required,
              },
            };
          }),
        };
        break;

      case "tools/call": {
        const { name, arguments: args = {} } = params as {
          name: string;
          arguments?: any;
        };

        const tool = toolMap.get(name);
        if (!tool) {
          return {
            jsonrpc: "2.0",
            error: { code: -32602, message: `Tool not found: ${name}` },
            id,
          };
        }

        // ✅ Call handler directly
        const toolResult = await tool.handler(args);
        result = toolResult;
        break;
      }

      default:
        return {
          jsonrpc: "2.0",
          error: { code: -32601, message: `Method not found: ${method}` },
          id,
        };
    }

    return { jsonrpc: "2.0", result, id };
  } catch (error: any) {
    console.error(`❌ Error handling ${method}:`, error.message);
    return {
      jsonrpc: "2.0",
      error: { code: -32603, message: error.message },
      id,
    };
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.post("/mcp", async (req, res) => {
  const { method, params, id } = req.body;
  console.log(`📩 MCP Request: ${method}`);
  const response = await handleMCPRequest(method, params, id);
  res.json(response);
});

app.get("/mcp", (_req, res) => {
  res.json({
    protocolVersion: "2024-11-05",
    serverInfo: { name: "my-mcp-server", version: "1.0.0" },
    capabilities: { tools: { listChanged: false } },
    toolCount: listTools.length,
    tools: listTools.map((t) => t.name),
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: isInitialized ? "healthy" : "waiting for initialize",
    tools: listTools.length,
  });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

app.listen(PORT, async () => {
  await connectDB().catch((err) => {
    console.error("Failed to connect to DB:", err);
    process.exit(1);
  });

  console.log(`🚀 MCP server running on http://localhost:${PORT}`);
  console.log(`📋 Tools loaded: ${listTools.map((t) => t.name).join(", ")}`);
  console.log(`📡 POST /mcp  — JSON-RPC endpoint`);
  console.log(`📡 GET  /mcp  — Server info`);
  console.log(`📡 GET  /health — Health check`);
});
