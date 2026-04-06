import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { TodoHomeContent } from "./todo-home-content";
import { TodosSyncProvider } from "./todos-sync-context";

const { mockRefresh } = vi.hoisted(() => ({
  mockRefresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

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
    mockRefresh.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows ErrorMessage with requestId and triggers router refresh on retry", async () => {
    const user = userEvent.setup();

    renderWithClient(
      <TodosSyncProvider initialTodos={[]}>
        <TodoHomeContent
          configBlocked={false}
          initialLoadError={{
            message: "Server is sleepy",
            requestId: "rid-999",
          }}
        />
      </TodosSyncProvider>
    );

    expect(await screen.findByText("Server is sleepy")).toBeInTheDocument();
    expect(screen.getByText(/ID: rid-999/)).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: /retry/i });
    await user.click(retryButton);

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});
