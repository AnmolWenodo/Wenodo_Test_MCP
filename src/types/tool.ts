import { z } from "zod";

export type MCPTool = {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  handler: (input: any) => Promise<any>;
};