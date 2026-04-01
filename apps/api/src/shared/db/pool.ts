import SQL from "@nearform/sql";
import pg from "pg";

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!pool) {
    pool = new pg.Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function pingDbWithNearformSql(): Promise<void> {
  const statement = SQL`SELECT 1 AS one`;
  const p = getPool();
  await p.query({ text: statement.text, values: statement.values });
}
