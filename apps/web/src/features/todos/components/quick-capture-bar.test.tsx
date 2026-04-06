import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuickCaptureBar } from "./quick-capture-bar";
import { renderWithTodosClient } from "@/features/todos/test/render-with-todos-client";

describe("QuickCaptureBar", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("does not call fetch when description is empty", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);
    renderWithTodosClient(<QuickCaptureBar />);
    await user.click(screen.getByRole("button", { name: /add task/i }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      await screen.findByText("Add a short description for your task.")
    ).toBeInTheDocument();
  });

  it("does not call fetch for whitespace-only description", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);
    renderWithTodosClient(<QuickCaptureBar />);
    await user.type(screen.getByRole("textbox", { name: /new task/i }), "   ");
    await user.click(screen.getByRole("button", { name: /add task/i }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("POSTs trimmed description on success", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            description: "Buy milk",
            isCompleted: false,
            createdAt: "2026-04-01T12:00:00.000Z",
          },
          meta: { requestId: "rid-1" },
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      )
    );
    renderWithTodosClient(<QuickCaptureBar />);
    await user.type(
      screen.getByRole("textbox", { name: /new task/i }),
      "  Buy milk  "
    );
    await user.click(screen.getByRole("button", { name: /add task/i }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    expect(call?.[0]).toBe("http://localhost:3001/api/v1/todos");
    expect(call?.[1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ description: "Buy milk" }),
    });
    expect(screen.getByRole("textbox", { name: /new task/i })).toHaveValue("");
  });
});
