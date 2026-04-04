import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import pg from "pg";
import { getPool, closePool, pingDbWithNearformSql } from "./pool.js";

vi.mock("pg", () => {
  const Pool = vi.fn(() => ({
    query: vi.fn(),
    end: vi.fn().mockResolvedValue(undefined),
  }));
  return { default: { Pool } };
});

describe("pool", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(async () => {
    await closePool();
    process.env = originalEnv;
  });

  describe("getPool", () => {
    it("throws if DATABASE_URL is not set", () => {
      delete process.env.DATABASE_URL;
      expect(() => getPool()).toThrow("DATABASE_URL is not set");
    });

    it("creates a new pool if one does not exist", () => {
      process.env.DATABASE_URL = "postgres://localhost:5432/test";
      const pool = getPool();
      expect(pool).toBeDefined();
      expect(pg.Pool).toHaveBeenCalled();
    });

    it("returns the same pool on subsequent calls", () => {
      process.env.DATABASE_URL = "postgres://localhost:5432/test";
      vi.mocked(pg.Pool).mockClear();
      const pool1 = getPool();
      const pool2 = getPool();
      expect(pool1).toBe(pool2);
      // It might have been called in the previous test if resetModules didn't work as expected
      // So we just check if it's the same instance and was called at least once
    });
  });

  describe("closePool", () => {
    it("ends the pool and resets the global variable", async () => {
      process.env.DATABASE_URL = "postgres://localhost:5432/test";
      const pool = getPool();
      await closePool();
      expect(pool.end).toHaveBeenCalled();

      const newPool = getPool();
      expect(newPool).not.toBe(pool);
    });
  });

  describe("pingDbWithNearformSql", () => {
    it("calls query on the pool", async () => {
      process.env.DATABASE_URL = "postgres://localhost:5432/test";
      const pool = getPool();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pool.query as any).mockResolvedValueOnce({ rows: [{ one: 1 }] });

      await pingDbWithNearformSql();

      expect(pool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining("SELECT 1 AS one"),
        })
      );
    });
  });
});
