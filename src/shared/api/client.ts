import type { z } from "zod";

export class ApiError extends Error {
  public kind: "network" | "http" | "parse";
  constructor(kind: "network" | "http" | "parse", message: string, cause?: unknown) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.cause = cause;
  }
}

// This will throw b/c React's standard ecosystem including the try/catch in the useEffect expects failed API calls to throw exception
export async function getJson<T>(
  path: string,
  schema: z.ZodSchema<T>,
  init?: RequestInit,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch (error) {
    throw new ApiError("network", "Network Error", error);
  }

  if (!res.ok) {
    throw new ApiError("http", `HTTP error: Status: ${res.status}, ${res.statusText}`);
  }

  try {
    const rawData = await res.json();
    return schema.parse(rawData);
  } catch (error) {
    throw new ApiError("parse", "Parsing error", error);
  }
}

export function toMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.message;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "An unexpected error occurred";
}
