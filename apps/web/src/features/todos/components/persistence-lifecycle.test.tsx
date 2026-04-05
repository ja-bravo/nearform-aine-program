import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from "@tanstack/react-query";
import {
  cleanup,
  render,
  screen,
  waitFor,
  fireEvent,
  act,
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
    onlineManager.setOnline(true);
    vi.stubGlobal("fetch", vi.fn());
    vi.mock("@/shared/api/env", () => ({
      getApiBaseUrl: () => "http://localhost:3000",
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("shows 'Saved' -> hidden when toggling completion", async () => {
    vi.useFakeTimers();
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
    fireEvent.click(
      screen.getByRole("checkbox", { name: /complete task: test task/i })
    );

    // Let the mutation resolve and the useEffect run
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // Should show 'Saved'
    expect(screen.getByText("Saved")).toBeInTheDocument();

    // Fast-forward time for usePersistenceStatus (3000ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    // Fast-forward time for PersistenceStatusBadge fade-out (300ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // Should be hidden
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("shows 'Not saved' and 'Retry' when mutation fails", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { code: "ERROR", message: "Failed", requestId: "rid-err" },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    );

    renderWithClient(<TodoItemRow todo={activeTodo} />);
    fireEvent.click(
      screen.getByRole("checkbox", { name: /complete task: test task/i })
    );

    expect(await screen.findByText("Not saved")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("shows 'Deleting...' while deleting", async () => {
    const fetchMock = vi.mocked(fetch);

    // Never resolve
    fetchMock.mockReturnValue(new Promise(() => {}));

    renderWithClient(<TodoItemRow todo={activeTodo} />);
    fireEvent.click(
      screen.getByRole("button", { name: /delete 'test task'/i })
    );

    // Wait for the state to update to isPending
    await waitFor(() => {
      expect(screen.getByText("Deleting…")).toBeInTheDocument();
    });
  });
});
