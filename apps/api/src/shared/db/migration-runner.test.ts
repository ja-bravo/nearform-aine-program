import SQL from "@nearform/sql";
import { randomUUID } from "crypto";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { afterAll, describe, expect, it } from "vitest";
import { fileURLToPath } from "url";
import { getMigrationsGlob, runMigrations } from "./migration-runner.js";
import { closePool, getPool, pingDbWithNearformSql } from "./pool.js";

const migrationsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "migrations"
);

describe("migration SQL artifacts", () => {
  it("resolves a Postgrator glob under apps/api/migrations", () => {
    expect(getMigrationsGlob().replace(/\\/g, "/")).toMatch(
      /\/migrations\/\*\.sql$/
    );
  });

  it("001 creates todos with expected columns", async () => {
    const sql = await readFile(
      join(migrationsDir, "001.do.create-todos.sql"),
      "utf8"
    );
    expect(sql).toMatch(/CREATE TABLE\s+todos/i);
    expect(sql).toContain("description");
    expect(sql).toContain("is_completed");
    expect(sql).toContain("created_at");
  });

  it("002 adds list-by-creation index", async () => {
    const sql = await readFile(
      join(migrationsDir, "002.do.add-todos-indexes.sql"),
      "utf8"
    );
    expect(sql).toContain("idx_todos_created_at");
    expect(sql).toContain("created_at");
  });
});

describe("runMigrations", () => {
  it("fails fast when DATABASE_URL is missing", async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    await expect(runMigrations()).rejects.toThrow(/DATABASE_URL/);
    if (prev !== undefined) process.env.DATABASE_URL = prev;
  });
});

const runDb = process.env.RUN_DB_TESTS === "1" && process.env.DATABASE_URL;

describe.skipIf(!runDb)("migrations against Postgres", () => {
  afterAll(async () => {
    await closePool();
  });

  it("applies migrations and records schema version", async () => {
    await runMigrations();
    await pingDbWithNearformSql();
    const pool = getPool();
    const ver = await pool.query(
      "SELECT version FROM schemaversion ORDER BY version DESC LIMIT 1"
    );
    expect(Number(ver.rows[0]?.version)).toBeGreaterThanOrEqual(2);
    const tab = await pool.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'todos'
       ORDER BY ordinal_position`
    );
    const names = tab.rows.map((r) => r.column_name as string);
    expect(names).toEqual(
      expect.arrayContaining([
        "id",
        "description",
        "is_completed",
        "created_at",
      ])
    );
    const idx = await pool.query(
      `SELECT indexname FROM pg_indexes
       WHERE schemaname = 'public' AND tablename = 'todos'
       AND indexname = 'idx_todos_created_at'`
    );
    expect(idx.rows.length).toBe(1);
    const label = `durability-smoke-${randomUUID()}`;
    const insert = SQL`INSERT INTO todos (description) VALUES (${label}) RETURNING id`;
    const inserted = await pool.query({
      text: insert.text,
      values: insert.values,
    });
    expect(inserted.rows[0]?.id).toBeDefined();
    const selectRow = SQL`SELECT id FROM todos WHERE description = ${label}`;
    const one = await pool.query({
      text: selectRow.text,
      values: selectRow.values,
    });
    expect(one.rows.length).toBe(1);
  });

  it("is idempotent on second run", async () => {
    await runMigrations();
    await runMigrations();
  });
});
