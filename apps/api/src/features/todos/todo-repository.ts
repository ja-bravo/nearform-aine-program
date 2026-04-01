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
  };
}
