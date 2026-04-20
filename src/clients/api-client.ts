import dotenv from "dotenv";
dotenv.config();

// Replace this with your real base URL and auth logic
const BASE_URL = process.env.API_BASE_URL ?? "https://api.example.com";
const API_KEY  = process.env.API_KEY ?? "";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}