import SQL from "@nearform/sql";
import { getPool } from "../../shared/db/pool.js";

export type TodoRow = {
  id: string;
  description: string;
  is_completed: boolean;
  created_at: Date;
};

export type TodoRepository = {
  insertTodo(description: string): Promise<TodoRow>;
  findAllTodosOrderedByCreatedAtDesc(): Promise<TodoRow[]>;
  updateTodoCompletion(
    id: string,
    isCompleted: boolean
  ): Promise<TodoRow | null>;
  deleteTodo(id: string): Promise<boolean>;
};

export function createTodoRepository(): TodoRepository {
  return {
    async insertTodo(description: string): Promise<TodoRow> {
      const pool = getPool();
      const statement = SQL`
        INSERT INTO todos (description)
        VALUES (${description})
        RETURNING id, description, is_completed, created_at
      `;
      const result = await pool.query<TodoRow>({
        text: statement.text,
        values: statement.values,
      });
      const row = result.rows[0];
      if (!row) {
        throw new Error("insert returned no row");
      }
      return row;
    },

    async findAllTodosOrderedByCreatedAtDesc(): Promise<TodoRow[]> {
      const pool = getPool();
      const statement = SQL`
        SELECT id, description, is_completed, created_at
        FROM todos
        ORDER BY created_at DESC
      `;
      const result = await pool.query<TodoRow>({
        text: statement.text,
        values: statement.values,
      });
      return result.rows;
    },

    async updateTodoCompletion(
      id: string,
      isCompleted: boolean
    ): Promise<TodoRow | null> {
      const pool = getPool();
      const statement = SQL`
        UPDATE todos SET is_completed = ${isCompleted}
        WHERE id = ${id}
        RETURNING id, description, is_completed, created_at
      `;
      try {
        const result = await pool.query<TodoRow>({
          text: statement.text,
          values: statement.values,
        });
        return result.rows[0] ?? null;
      } catch (error) {
        throw new Error(
          `Failed to update todo: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    async deleteTodo(id: string): Promise<boolean> {
      const pool = getPool();
      const statement = SQL`
        DELETE FROM todos WHERE id = ${id}
      `;
      try {
        const result = await pool.query({
          text: statement.text,
          values: statement.values,
        });
        return (result.rowCount ?? 0) > 0;
      } catch (error) {
        throw new Error(
          `Failed to delete todo: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
  };
}
