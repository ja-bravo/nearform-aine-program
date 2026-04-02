import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactElement } from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { TodoHome } from "./todo-home";

// Helper to render with a fresh QueryClient
function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

describe("Error Recovery Integration", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    // Mock environment to provide API URL
    vi.mock("@/shared/api/env", () => ({
      getApiBaseUrl: () => "http://localhost:3000",
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows ErrorMessage with requestId and allows retry on load failure", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);

    // 1. Setup initial failure response
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_ERROR",
            message: "Server is sleepy",
            requestId: "rid-999",
          },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    );

    renderWithClient(<TodoHome />);

    // Verify error state components are rendered correctly
    expect(await screen.findByText("Server is sleepy")).toBeInTheDocument();
    expect(screen.getByText(/ID: rid-999/)).toBeInTheDocument();

    // 2. Setup successful response for the retry attempt
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            todos: [
              {
                id: "550e8400-e29b-41d4-a716-446655440000",
                description: "Recovered task",
                isCompleted: false,
                createdAt: "2026-04-02T12:00:00.000Z",
              },
            ],
          },
          meta: { requestId: "rid-1000" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const retryButton = screen.getByRole("button", { name: /retry/i });
    await user.click(retryButton);

    // Verify recovery: list items are shown and error is cleared
    expect(await screen.findByText("Recovered task")).toBeInTheDocument();
    expect(screen.queryByText("Server is sleepy")).not.toBeInTheDocument();
  });
});
