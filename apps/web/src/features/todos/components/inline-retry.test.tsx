import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TodoItemRow } from "./todo-item-row";
import { QuickCaptureBar } from "./quick-capture-bar";

const fixedId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const activeTodo = {
  id: fixedId,
  description: "Buy milk",
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

describe("Inline Retry Behavior", () => {
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

  describe("TodoItemRow Retry", () => {
    it("disables the Retry button while the retry mutation is in-flight (AC2)", async () => {
      const user = userEvent.setup();
      const fetchMock = vi.mocked(fetch);

      // 1. First attempt fails
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: { code: "SERVER_ERROR", message: "Failed" },
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        )
      );

      renderWithClient(<TodoItemRow todo={activeTodo} />);

      // Trigger initial failure
      await user.click(
        screen.getByRole("checkbox", { name: /mark 'buy milk' as complete/i })
      );

      const retryButton = await screen.findByRole("button", { name: /retry/i });

      // 2. Mock retry attempt to hang
      fetchMock.mockImplementationOnce(() => new Promise(() => {}));

      await user.click(retryButton);

      // Verify button is disabled
      await waitFor(() => {
        expect(retryButton).toBeDisabled();
        // Verify badge shows "Saving"
        expect(screen.getByText(/saving/i)).toBeInTheDocument();
      });
    });

    it("successfully retries a failed toggle and shows Saved (AC1)", async () => {
      const user = userEvent.setup();
      const fetchMock = vi.mocked(fetch);

      // 1. First attempt fails
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: { code: "SERVER_ERROR", message: "Failed" },
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        )
      );

      renderWithClient(<TodoItemRow todo={activeTodo} />);
      await user.click(
        screen.getByRole("checkbox", { name: /mark 'buy milk' as complete/i })
      );

      const retryButton = await screen.findByRole("button", { name: /retry/i });

      // 2. Mock retry attempt to succeed
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { ...activeTodo, isCompleted: true },
            meta: { requestId: "rid-retry" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );

      await user.click(retryButton);

      // Verify success state
      await waitFor(() => {
        expect(screen.getByText(/saved/i)).toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });
  });

  describe("QuickCaptureBar Retry", () => {
    it("preserves input and disables Retry button during retry (AC2, AC4)", async () => {
      const user = userEvent.setup();
      const fetchMock = vi.mocked(fetch);

      // 1. First attempt fails
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: { code: "SERVER_ERROR", message: "Failed" },
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        )
      );

      renderWithClient(<QuickCaptureBar />);
      const input = screen.getByRole("textbox", { name: /new task/i });
      await user.type(input, "My new task");
      await user.click(screen.getByRole("button", { name: /add task/i }));

      const retryButton = await screen.findByRole("button", { name: /retry/i });
      expect(input).toHaveValue("My new task"); // AC4: Input preserved on failure

      // 2. Mock retry attempt to hang
      fetchMock.mockImplementationOnce(() => new Promise(() => {}));

      await user.click(retryButton);

      // Verify button is disabled
      await waitFor(() => {
        expect(retryButton).toBeDisabled();
        expect(input).toHaveValue("My new task");
        // Use getAllByText and check that at least one is visible, or be more specific
        expect(screen.getByRole("status")).toHaveTextContent(/saving/i);
      });
    });
  });
});
