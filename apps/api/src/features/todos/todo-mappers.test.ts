import { describe, expect, it } from "vitest";
import { rowToTodoDto } from "./todo-mappers.js";

describe("rowToTodoDto", () => {
  it("maps snake_case row to camelCase DTO with ISO createdAt", () => {
    const dto = rowToTodoDto({
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      description: "Buy milk",
      is_completed: false,
      created_at: new Date("2026-04-01T12:00:00.000Z"),
    });
    expect(dto).toEqual({
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      description: "Buy milk",
      isCompleted: false,
      createdAt: "2026-04-01T12:00:00.000Z",
    });
  });
});
