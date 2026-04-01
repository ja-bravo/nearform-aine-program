import type { TodoDto } from "./todo-schemas.js";
import type { TodoRow } from "./todo-repository.js";

export function rowToTodoDto(row: TodoRow): TodoDto {
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : new Date(row.created_at as string).toISOString();
  return {
    id: row.id,
    description: row.description,
    isCompleted: row.is_completed,
    createdAt,
  };
}
