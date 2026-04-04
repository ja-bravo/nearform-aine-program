import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuickCaptureBar } from "./quick-capture-bar";
import { TodoItemRow } from "./todo-item-row";
import { TodoList } from "./todo-list";

const fixedId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const fixedId2 = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
const activeTodo = {
  id: fixedId,
  description: "Buy milk",
  isCompleted: false,
  createdAt: "2026-04-01T12:00:00.000Z",
};
const secondTodo = {
  id: fixedId2,
  description: "Clean kitchen",
  isCompleted: false,
  createdAt: "2026-04-01T13:00:00.000Z",
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

describe("Keyboard Navigation and Focus Management", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  describe("T1 - Visible Focus Indicator", () => {
    it("TodoItemRow checkbox has focus-visible styling", () => {
      renderWithClient(<TodoItemRow todo={activeTodo} />);
      const checkbox = screen.getByRole("checkbox");
      // Current classes: h-6 w-6 shrink-0 cursor-pointer rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:focus:ring-zinc-400
      // Expected: focus-visible:ring-offset-2
      expect(checkbox.className).toContain("focus-visible");
      expect(checkbox.className).toContain("ring-offset-2");
    });

    it("TodoItemRow delete button has focus-visible styling", () => {
      renderWithClient(<TodoItemRow todo={activeTodo} />);
      const deleteBtn = screen.getByRole("button", { name: /delete/i });
      expect(deleteBtn.className).toContain("focus-visible");
      expect(deleteBtn.className).toContain("ring-offset-2");
    });

    it("QuickCaptureBar input has focus-visible styling", () => {
      renderWithClient(<QuickCaptureBar />);
      const input = screen.getByLabelText(/new task/i);
      expect(input.className).toContain("focus-visible");
      expect(input.className).toContain("ring-offset-2");
    });

    it("QuickCaptureBar add button has focus-visible styling", () => {
      renderWithClient(<QuickCaptureBar />);
      const addBtn = screen.getByRole("button", { name: /add task/i });
      expect(addBtn.className).toContain("focus-visible");
      expect(addBtn.className).toContain("ring-offset-2");
    });
  });

  describe("T2 - Focus Management", () => {
    it("QuickCaptureBar input retains focus after successful submission", async () => {
      const user = userEvent.setup();
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { ...activeTodo, description: "New task" },
            meta: { requestId: "rid-1" },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        )
      );

      renderWithClient(<QuickCaptureBar />);
      const input = screen.getByLabelText(/new task/i);
      await user.type(input, "New task");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });

    it("moves focus to the next item checkbox when an item is deleted", async () => {
      const user = userEvent.setup();
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

      const { rerender } = renderWithClient(
        <TodoList
          todos={[activeTodo, secondTodo]}
          isLoading={false}
          loadFailed={false}
        />
      );

      const deleteBtn = screen.getByRole("button", {
        name: /delete 'buy milk'/i,
      });
      await user.click(deleteBtn);

      // Simulate re-render after successful deletion
      rerender(
        <QueryClientProvider
          client={
            new QueryClient({
              defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
              },
            })
          }
        >
          <TodoList todos={[secondTodo]} isLoading={false} loadFailed={false} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        const secondCheckbox = screen.getByRole("checkbox", {
          name: /mark 'clean kitchen' as complete/i,
        });
        expect(secondCheckbox).toHaveFocus();
      });
    });
  });

  describe("T3 - Keyboard Interaction", () => {
    it("QuickCaptureBar supports Enter for submission", async () => {
      const user = userEvent.setup();
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { ...activeTodo, description: "New task" },
            meta: { requestId: "rid-1" },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        )
      );

      renderWithClient(<QuickCaptureBar />);
      const input = screen.getByLabelText(/new task/i);
      await user.type(input, "New task");
      await user.keyboard("{Enter}");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("TodoItemRow checkbox toggles with Space", async () => {
      const user = userEvent.setup();
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { ...activeTodo, isCompleted: true },
            meta: { requestId: "rid-1" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );

      renderWithClient(<TodoItemRow todo={activeTodo} />);
      const checkbox = screen.getByRole("checkbox");
      checkbox.focus();
      await user.keyboard(" ");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
