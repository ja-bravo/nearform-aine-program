/** @vitest-environment node */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/fetch-json-server", () => ({
  fetchJsonServer: vi.fn(),
}));

import { ApiError } from "@/shared/api/api-error";
import { fetchJsonServer } from "@/shared/api/fetch-json-server";
import type { TodoDto } from "@/shared/api/schemas";
import { loadTodosPageData } from "./load-todos";

describe("loadTodosPageData", () => {
  beforeEach(() => {
    vi.stubEnv("API_BASE_URL", "http://api.test");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    vi.mocked(fetchJsonServer).mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns unconfigured when no base URL", async () => {
    vi.stubEnv("API_BASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const r = await loadTodosPageData();
    expect(r).toEqual({ kind: "unconfigured" });
  });

  it("returns ok with todos from API", async () => {
    const todos: TodoDto[] = [
      {
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        description: "One",
        isCompleted: false,
        createdAt: "2026-04-01T12:00:00.000Z",
      },
    ];
    vi.mocked(fetchJsonServer).mockResolvedValue({ data: { todos } });
    const r = await loadTodosPageData();
    expect(r).toEqual({ kind: "ok", todos });
  });

  it("maps ApiError to error result", async () => {
    vi.mocked(fetchJsonServer).mockRejectedValue(
      new ApiError("failed", { requestId: "r1" })
    );
    const r = await loadTodosPageData();
    expect(r).toEqual({
      kind: "error",
      message: "failed",
      requestId: "r1",
    });
  });

  it("maps unknown errors to generic message", async () => {
    vi.mocked(fetchJsonServer).mockRejectedValue(new Error("surprise"));
    const r = await loadTodosPageData();
    expect(r).toEqual({
      kind: "error",
      message: "Could not load tasks. Try again.",
    });
  });
});
