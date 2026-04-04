import SQL from "@nearform/sql";
import { randomUUID } from "crypto";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { afterAll, describe, expect, it, vi, beforeEach } from "vitest";
import { fileURLToPath } from "url";
import { getMigrationsGlob, runMigrations } from "./migration-runner.js";
import { closePool, getPool, pingDbWithNearformSql } from "./pool.js";
import pg from "pg";
import Postgrator from "postgrator";

vi.mock("pg", async (importOriginal) => {
  const mod = (await importOriginal()) as any;
  const Client = vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue({ rows: [] }),
    end: vi.fn().mockResolvedValue(undefined),
  }));
  return { ...mod, default: { ...mod.default, Client } };
});

const mockPostgrator = {
  migrate: vi.fn().mockResolvedValue([]),
};

vi.mock("postgrator", () => {
  return {
    default: vi.fn().mockImplementation(() => mockPostgrator),
  };
});

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

describe("runMigrations unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/mydb";
  });

  it("fails fast when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;
    await expect(runMigrations()).rejects.toThrow(/DATABASE_URL/);
  });

  it("successfully runs migrations with mocked DB", async () => {
    await runMigrations();
    expect(pg.Client).toHaveBeenCalled();
    expect(Postgrator).toHaveBeenCalledWith(
      expect.objectContaining({
        database: "mydb",
      })
    );
  });

  it("throws error when database name is missing in connection string", async () => {
    process.env.DATABASE_URL = "postgres://localhost:5432";
    await expect(runMigrations()).rejects.toThrow(
      "DATABASE_URL must include a database name in the path"
    );
  });

  it("logs and rethrows on migration failure", async () => {
    const error = new Error("migration failed");
    (error as any).appliedMigrations = [{ version: 1 }];
    mockPostgrator.migrate.mockRejectedValueOnce(error);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(runMigrations()).rejects.toThrow("migration failed");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("database migration failed")
    );
    consoleSpy.mockRestore();
  });
});
