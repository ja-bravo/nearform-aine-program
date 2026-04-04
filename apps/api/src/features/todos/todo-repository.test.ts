import { describe, expect, it, vi, beforeEach } from "vitest";
import { createTodoRepository } from "./todo-repository.js";
import { getPool } from "../../shared/db/pool.js";

// Mock the pool module
vi.mock("../../shared/db/pool.js", () => ({
  getPool: vi.fn(),
}));

describe("TodoRepository", () => {
  const mockPool = {
    query: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getPool as ReturnType<typeof vi.fn>).mockReturnValue(mockPool);
  });

  describe("insertTodo", () => {
    it("inserts a todo and returns the row", async () => {
      const mockRow = {
        id: "1",
        description: "Test todo",
        is_completed: false,
        created_at: new Date(),
      };
      mockPool.query.mockResolvedValueOnce({ rows: [mockRow] });

      const repo = createTodoRepository();
      const result = await repo.insertTodo("Test todo");

      expect(result).toEqual(mockRow);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining("INSERT INTO todos"),
          values: ["Test todo"],
        })
      );
    });

    it("throws an error if insert returns no row", async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const repo = createTodoRepository();
      await expect(repo.insertTodo("Test todo")).rejects.toThrow(
        "insert returned no row"
      );
    });
  });

  describe("findAllTodosOrderedByCreatedAtDesc", () => {
    it("returns all todos ordered by created_at desc", async () => {
      const mockRows = [
        {
          id: "2",
          description: "Second",
          is_completed: false,
          created_at: new Date(),
        },
        {
          id: "1",
          description: "First",
          is_completed: true,
          created_at: new Date(Date.now() - 1000),
        },
      ];
      mockPool.query.mockResolvedValueOnce({ rows: mockRows });

      const repo = createTodoRepository();
      const result = await repo.findAllTodosOrderedByCreatedAtDesc();

      expect(result).toEqual(mockRows);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining("ORDER BY created_at DESC"),
        })
      );
    });
  });

  describe("updateTodoCompletion", () => {
    it("updates completion status and returns the row", async () => {
      const mockRow = {
        id: "1",
        description: "Test",
        is_completed: true,
        created_at: new Date(),
      };
      mockPool.query.mockResolvedValueOnce({ rows: [mockRow] });

      const repo = createTodoRepository();
      const result = await repo.updateTodoCompletion("1", true);

      expect(result).toEqual(mockRow);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining("UPDATE todos SET is_completed"),
          values: [true, "1"],
        })
      );
    });

    it("returns null if todo not found", async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const repo = createTodoRepository();
      const result = await repo.updateTodoCompletion("non-existent", true);

      expect(result).toBeNull();
    });

    it("throws error on database failure", async () => {
      mockPool.query.mockRejectedValueOnce(new Error("DB failure"));

      const repo = createTodoRepository();
      await expect(repo.updateTodoCompletion("1", true)).rejects.toThrow(
        "Failed to update todo: DB failure"
      );
    });
  });

  describe("deleteTodo", () => {
    it("returns true on successful deletion", async () => {
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });

      const repo = createTodoRepository();
      const result = await repo.deleteTodo("1");

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining("DELETE FROM todos"),
          values: ["1"],
        })
      );
    });

    it("returns false if todo not found during deletion", async () => {
      mockPool.query.mockResolvedValueOnce({ rowCount: 0 });

      const repo = createTodoRepository();
      const result = await repo.deleteTodo("non-existent");

      expect(result).toBe(false);
    });

    it("throws error on database failure during deletion", async () => {
      mockPool.query.mockRejectedValueOnce(new Error("DB failure"));

      const repo = createTodoRepository();
      await expect(repo.deleteTodo("1")).rejects.toThrow(
        "Failed to delete todo: DB failure"
      );
    });
  });
});
