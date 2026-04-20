import { ToolResponse } from "../types/response";
import { formatError } from "../helpers/errors";

type HelloResult = { message: string };

export async function helloHandler(
  name: string
): Promise<ToolResponse<HelloResult>> {
  try {
    // Replace this with a real apiFetch call when you have an API
    const message = `Hello, ${name}! Your MCP server is working.`;
    return { result: { message }, isError: false, error: null };
  } catch (error) {
    return { result: null, isError: true, error: formatError(error) };
  }
}