import "server-only";
import { ApiError } from "@/shared/api/api-error";
import { fetchJsonServer } from "@/shared/api/fetch-json-server";
import { getServerApiBaseUrl } from "@/shared/api/env";
import type { TodoDto } from "@/shared/api/schemas";
import { listTodosResponseSchema } from "@/shared/api/schemas";

export type LoadTodosPageData =
  | { kind: "ok"; todos: TodoDto[] }
  | { kind: "error"; message: string; requestId?: string }
  | { kind: "unconfigured" };

export async function loadTodosPageData(): Promise<LoadTodosPageData> {
  if (!getServerApiBaseUrl()) {
    return { kind: "unconfigured" };
  }
  try {
    const data = await fetchJsonServer(
      "/api/v1/todos",
      { method: "GET" },
      listTodosResponseSchema
    );
    return { kind: "ok", todos: data.data.todos };
  } catch (e) {
    if (e instanceof ApiError) {
      return {
        kind: "error",
        message: e.message,
        requestId: e.requestId,
      };
    }
    return {
      kind: "error",
      message: "Could not load tasks. Try again.",
    };
  }
}
