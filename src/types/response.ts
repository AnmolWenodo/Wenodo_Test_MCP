export type ToolResponse<T> = {
  result: T | null;
  isError: boolean;
  error: string | null;
};