import type { z } from "zod";
import { ApiError } from "./api-error";
import { getApiBaseUrl } from "./env";
import { errorEnvelopeSchema } from "./schemas";

export async function fetchJson<T>(
  path: string,
  init: RequestInit,
  schema: z.ZodType<T>
): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiError("App is missing API configuration.");
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  let res: Response;
  try {
    const hasBody = Boolean(init.body);
    const headers = {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    } as Record<string, string>;

    res = await fetch(url, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection.");
  }
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError("Unexpected response from the server.");
  }
  if (!res.ok) {
    const parsed = errorEnvelopeSchema.safeParse(json);
    if (parsed.success) {
      throw new ApiError(parsed.data.error.message, {
        code: parsed.data.error.code,
        requestId: parsed.data.error.requestId,
        status: res.status,
      });
    }
    throw new ApiError("Something went wrong. Try again.", {
      status: res.status,
    });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError("Unexpected response from the server.");
  }
  return parsed.data;
}
