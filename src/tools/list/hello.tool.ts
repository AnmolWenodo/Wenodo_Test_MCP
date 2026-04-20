import { z } from "zod";
import { helloHandler } from "../../handlers/hello.handler";

export const helloTool = {
  name: "hello",
  description: "Say hello — use this to verify the MCP server is connected.",
 inputSchema: z.object({
    name: z.string(),
  }),
  handler: async ({ name }: { name: string }) => {
    const res = await helloHandler(name);

    if (res.isError || !res.result) {
      return { content: [{ type: "text" as const, text: `Error: ${res.error}` }] };
    }

    return {
      content: [{ type: "text" as const, text: res.result.message }],
    };
  },
};