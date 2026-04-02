import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiError } from "@/shared/api/api-error";
import { useTodosQuery } from "./use-todos-query";

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useTodosQuery", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    // Mock getApiBaseUrl to return a value
    vi.mock("@/shared/api/env", () => ({
      getApiBaseUrl: () => "http://localhost:3000",
    }));
  });

  it("propagates ApiError on failure", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: {
            code: "NOT_FOUND",
            message: "List not found",
            requestId: "rid-456",
          },
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    );

    const { result } = renderHook(() => useTodosQuery(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    const error = result.current.error as ApiError;
    expect(error.message).toBe("List not found");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.requestId).toBe("rid-456");
  });
});
