import { describe, expect, it } from "vitest";
import { createServer } from "../../server.js";
import { closePool } from "../../shared/db/pool.js";
import { runMigrations } from "../../shared/db/migration-runner.js";

const runDb = process.env.RUN_DB_TESTS === "1" && process.env.DATABASE_URL;

describe.skipIf(!runDb)("POST/GET /api/v1/todos (Postgres)", () => {
  it("creates and lists todos; newest first", async () => {
    await runMigrations();
    const app = createServer();
    await app.ready();
    const first = await app.inject({
      method: "POST",
      url: "/api/v1/todos",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ description: "integration-a" }),
    });
    expect(first.statusCode).toBe(201);
    await new Promise((r) => setTimeout(r, 15));
    const second = await app.inject({
      method: "POST",
      url: "/api/v1/todos",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ description: "integration-b" }),
    });
    expect(second.statusCode).toBe(201);
    const list = await app.inject({
      method: "GET",
      url: "/api/v1/todos",
    });
    expect(list.statusCode).toBe(200);
    const body = JSON.parse(list.body) as {
      data: { todos: { description: string }[] };
    };
    const descriptions = body.data.todos.map((t) => t.description);
    const idxA = descriptions.indexOf("integration-a");
    const idxB = descriptions.indexOf("integration-b");
    expect(idxA).toBeGreaterThanOrEqual(0);
    expect(idxB).toBeGreaterThanOrEqual(0);
    expect(idxB).toBeLessThan(idxA);
    await app.close();
    await closePool();
  });
});
