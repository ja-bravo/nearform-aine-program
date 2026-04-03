import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TodoItemRow } from "./todo-item-row";

const fixedId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const activeTodo = {
  id: fixedId,
  description: "Test task",
  isCompleted: false,
  createdAt: "2026-04-01T12:00:00.000Z",
};

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

describe("Persistence Lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it("shows 'Saved' -> hidden when toggling completion", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { ...activeTodo, isCompleted: true },
          meta: { requestId: "rid-1" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    renderWithClient(<TodoItemRow todo={activeTodo} />);

    // Click toggle
    fireEvent.click(screen.getByRole("checkbox"));

    // Should show 'Saved'
    expect(await screen.findByText("Saved")).toBeInTheDocument();

    // Fast-forward time
    vi.advanceTimersByTime(3000);

    // Wait for the duration to pass
    await waitFor(() => {
      expect(screen.queryByText("Saved")).not.toBeInTheDocument();
    });
  });

  it("shows 'Not saved' and 'Retry' when mutation fails", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { code: "ERROR", message: "Failed" },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    );

    renderWithClient(<TodoItemRow todo={activeTodo} />);
    fireEvent.click(screen.getByRole("checkbox"));

    expect(await screen.findByText("Not saved")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument(); // Restored error context
  });

  it("shows 'Deleting...' while deleting", async () => {
    const fetchMock = vi.mocked(fetch);

    // Never resolve
    fetchMock.mockReturnValue(new Promise(() => {}));

    renderWithClient(<TodoItemRow todo={activeTodo} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    // Wait for the state to update to isPending
    await waitFor(() => {
      expect(screen.getByText("Deleting…")).toBeInTheDocument();
    });
  });
});
