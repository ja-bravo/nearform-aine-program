import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TodoItemRow } from "./todo-item-row";
import { renderWithTodosClient } from "@/features/todos/test/render-with-todos-client";

const fixedId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const activeTodo = {
  id: fixedId,
  description: "Buy milk",
  isCompleted: false,
  createdAt: "2026-04-01T12:00:00.000Z",
};
const completedTodo = { ...activeTodo, isCompleted: true };

describe("TodoItemRow", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("applies line-through class to description of completed todo", () => {
    renderWithTodosClient(<TodoItemRow todo={completedTodo} />, [
      completedTodo,
    ]);
    const description = screen.getByText("Buy milk");
    expect(description.className).toContain("line-through");
  });

  it("does NOT apply line-through class to active todo description", () => {
    renderWithTodosClient(<TodoItemRow todo={activeTodo} />, [activeTodo]);
    const description = screen.getByText("Buy milk");
    expect(description.className).not.toContain("line-through");
  });

  it("calls PATCH with correct id and isCompleted:true when toggling active todo", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            id: fixedId,
            description: "Buy milk",
            isCompleted: true,
            createdAt: "2026-04-01T12:00:00.000Z",
          },
          meta: { requestId: "rid-1" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    renderWithTodosClient(<TodoItemRow todo={activeTodo} />, [activeTodo]);
    await user.click(
      screen.getByRole("checkbox", { name: /complete task: buy milk/i })
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    expect(call?.[0]).toMatch(new RegExp(`/api/v1/todos/${fixedId}$`));
    expect(call?.[1]).toMatchObject({
      method: "PATCH",
      body: JSON.stringify({ isCompleted: true }),
    });
  });

  it("calls PATCH with correct id and isCompleted:false when toggling completed todo", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            id: fixedId,
            description: "Buy milk",
            isCompleted: false,
            createdAt: "2026-04-01T12:00:00.000Z",
          },
          meta: { requestId: "rid-1" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    renderWithTodosClient(<TodoItemRow todo={completedTodo} />, [
      completedTodo,
    ]);
    await user.click(
      screen.getByRole("checkbox", { name: /mark task active: buy milk/i })
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    expect(call?.[0]).toMatch(new RegExp(`/api/v1/todos/${fixedId}$`));
    expect(call?.[1]).toMatchObject({
      method: "PATCH",
      body: JSON.stringify({ isCompleted: false }),
    });
  });

  it("disables controls while PATCH is pending", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);
    // Never resolves — keeps mutation pending
    fetchMock.mockImplementationOnce(() => new Promise(() => {}));
    renderWithTodosClient(<TodoItemRow todo={activeTodo} />, [activeTodo]);
    await user.click(
      screen.getByRole("checkbox", { name: /complete task: buy milk/i })
    );
    await waitFor(() => {
      expect(
        screen.getByRole("checkbox", { name: /complete task: buy milk/i })
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /delete 'buy milk'/i })
      ).toBeDisabled();
    });
  });

  it("shows inline error text when PATCH fails, does not remove row", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_ERROR",
            message: "Server error",
            requestId: "rid-2",
          },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    );
    renderWithTodosClient(<TodoItemRow todo={activeTodo} />, [activeTodo]);
    await user.click(
      screen.getByRole("checkbox", { name: /complete task: buy milk/i })
    );
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
  });

  it("calls DELETE with correct id when delete button clicked", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    renderWithTodosClient(<TodoItemRow todo={activeTodo} />, [activeTodo]);
    await user.click(
      screen.getByRole("button", { name: /delete 'buy milk'/i })
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    expect(call?.[0]).toMatch(new RegExp(`/api/v1/todos/${fixedId}$`));
    expect(call?.[1]).toMatchObject({ method: "DELETE" });
  });

  it("disables controls while DELETE is pending", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);
    // Never resolves — keeps mutation pending
    fetchMock.mockImplementationOnce(() => new Promise(() => {}));
    renderWithTodosClient(<TodoItemRow todo={activeTodo} />, [activeTodo]);
    await user.click(
      screen.getByRole("button", { name: /delete 'buy milk'/i })
    );
    await waitFor(() => {
      expect(
        screen.getByRole("checkbox", { name: /complete task: buy milk/i })
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /delete 'buy milk'/i })
      ).toBeDisabled();
    });
  });

  it("shows inline error text when DELETE fails, row remains in DOM", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_ERROR",
            message: "Server error",
            requestId: "rid-3",
          },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    );
    renderWithTodosClient(<TodoItemRow todo={activeTodo} />, [activeTodo]);
    await user.click(
      screen.getByRole("button", { name: /delete 'buy milk'/i })
    );
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
  });

  it("checkbox has accessible label mentioning todo description", () => {
    renderWithTodosClient(<TodoItemRow todo={activeTodo} />, [activeTodo]);
    expect(
      screen.getByRole("checkbox", { name: /buy milk/i })
    ).toBeInTheDocument();
  });

  it("delete button has accessible label mentioning todo description", () => {
    renderWithTodosClient(<TodoItemRow todo={activeTodo} />, [activeTodo]);
    expect(
      screen.getByRole("button", { name: /delete 'buy milk'/i })
    ).toBeInTheDocument();
  });

  it("uses fallback 'task' in aria-label when description is empty", () => {
    const emptyTodo = { ...activeTodo, description: "" };
    renderWithTodosClient(<TodoItemRow todo={emptyTodo} />, [emptyTodo]);
    expect(
      screen.getByRole("checkbox", { name: /complete task: task/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete 'task'/i })
    ).toBeInTheDocument();
  });

  it("renders 'Invalid date' when createdAt is malformed", () => {
    const malformedTodo = { ...activeTodo, createdAt: "not-a-date" };
    renderWithTodosClient(<TodoItemRow todo={malformedTodo} />, [
      malformedTodo,
    ]);
    expect(screen.getByText(/added invalid date/i)).toBeInTheDocument();
  });
});
