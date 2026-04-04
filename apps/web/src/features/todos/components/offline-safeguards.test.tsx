import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from "@tanstack/react-query";
import { cleanup, render, screen, act } from "@testing-library/react";
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

describe("Offline Safeguards", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    // Mock environment to provide API URL
    vi.mock("@/shared/api/env", () => ({
      getApiBaseUrl: () => "http://localhost:3000",
    }));
    onlineManager.setOnline(true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("QuickCaptureBar Offline", () => {
    it("disables Add Task button when offline (AC2)", () => {
      act(() => {
        onlineManager.setOnline(false);
      });
      renderWithClient(<QuickCaptureBar />);

      const addButton = screen.getByRole("button", { name: /add task/i });
      expect(addButton).toBeDisabled();
    });

    it("re-enables Add Task button when online restored (AC3)", () => {
      act(() => {
        onlineManager.setOnline(false);
      });
      renderWithClient(<QuickCaptureBar />);

      const addButton = screen.getByRole("button", { name: /add task/i });
      expect(addButton).toBeDisabled();

      act(() => {
        onlineManager.setOnline(true);
      });

      expect(addButton).not.toBeDisabled();
    });
  });

  describe("TodoItemRow Offline", () => {
    it("disables checkbox and delete button when offline (AC2)", () => {
      act(() => {
        onlineManager.setOnline(false);
      });
      renderWithClient(<TodoItemRow todo={activeTodo} />);

      const checkbox = screen.getByRole("checkbox", {
        name: /complete task: buy milk/i,
      });
      const deleteButton = screen.getByRole("button", { name: /delete/i });

      expect(checkbox).toBeDisabled();
      expect(deleteButton).toBeDisabled();
    });

    it("re-enables controls when online restored (AC3)", () => {
      act(() => {
        onlineManager.setOnline(false);
      });
      renderWithClient(<TodoItemRow todo={activeTodo} />);

      const checkbox = screen.getByRole("checkbox", {
        name: /complete task: buy milk/i,
      });
      const deleteButton = screen.getByRole("button", { name: /delete/i });

      expect(checkbox).toBeDisabled();
      expect(deleteButton).toBeDisabled();

      act(() => {
        onlineManager.setOnline(true);
      });

      expect(checkbox).not.toBeDisabled();
      expect(deleteButton).not.toBeDisabled();
    });
  });
});
