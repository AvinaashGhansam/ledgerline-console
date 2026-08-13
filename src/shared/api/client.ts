import type { z } from "zod";
import { ProblemDetailSchema } from "./schemas.ts";

export class ApiError extends Error {
  public kind: "network" | "http" | "parse";
  public status?: number;
  public detail?: string;

  constructor(
    kind: "network" | "http" | "parse",
    message: string,
    options?: { cause?: unknown; detail?: string; status?: number },
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.cause = options?.cause;
    this.status = options?.status;
    this.detail = options?.detail;
  }
}

async function request<T>(path: string, schema: z.ZodSchema<T>, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch (error) {
    throw new ApiError("network", "Network Error", { cause: error });
  }

  if (!res.ok) {
    let title: string | undefined, detail: string | undefined;

    try {
      const body = await res.json();
      const safeParseBody = ProblemDetailSchema.safeParse(body);
      if (safeParseBody.success) {
        title = safeParseBody.data.title;
        detail = safeParseBody.data.detail;
      }
    } catch (_err) {}

    const errorMessage = title
      ? `${title}, Status: ${res.status}`
      : `HTTP error: Status: ${res.status}`;

    throw new ApiError("http", errorMessage, { detail: detail, status: res.status });
  }

  try {
    const rawData = await res.json();
    return schema.parse(rawData);
  } catch (error) {
    throw new ApiError("parse", "Parsing error", { cause: error });
  }
}

export function toMessage(err: unknown): string {
  if (err instanceof ApiError && err.kind === "http" && err.detail) {
    return err.detail;
  }

  if (err instanceof ApiError) {
    return err.message;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "An unexpected error occurred";
}

export async function getJson<T>(
  url: string,
  schema: z.ZodSchema<T>,
  init?: RequestInit,
): Promise<T> {
  return request(url, schema, { ...init, method: "GET" });
}

export async function postJson<T>(
  url: string,
  body: unknown,
  schema: z.ZodSchema<T>,
  init?: RequestInit,
): Promise<T> {
  return request(url, schema, {
    ...init,
    method: "POST",
    headers: { ...init?.headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
