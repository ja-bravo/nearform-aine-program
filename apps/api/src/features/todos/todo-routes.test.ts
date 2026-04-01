import { describe, expect, it, vi } from "vitest";
import { createServer } from "../../server.js";
import { errorEnvelopeSchema } from "./todo-schemas.js";
import type { TodoRepository, TodoRow } from "./todo-repository.js";

const fixedId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const fixedDate = new Date("2026-04-01T12:00:00.000Z");

function mockRepo(overrides: Partial<TodoRepository> = {}): TodoRepository {
  const row = (description: string): TodoRow => ({
    id: fixedId,
    description,
    is_completed: false,
    created_at: fixedDate,
  });
  return {
    insertTodo: vi.fn(async (d) => row(d)),
    findAllTodosOrderedByCreatedAtDesc: vi.fn(async () => []),
    ...overrides,
  };
}

describe("POST /api/v1/todos", () => {
  it("returns 201 with data + meta.requestId", async () => {
    const repo = mockRepo();
    const app = createServer({ todoRepository: repo });
    await app.ready();
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/todos",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ description: "Buy milk" }),
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body) as {
      data: Record<string, unknown>;
      meta: { requestId: string };
    };
    expect(body.data).toMatchObject({
      id: fixedId,
      description: "Buy milk",
      isCompleted: false,
      createdAt: "2026-04-01T12:00:00.000Z",
    });
    expect(typeof body.meta.requestId).toBe("string");
    expect(body.meta.requestId.length).toBeGreaterThan(0);
    await app.close();
  });

  it("returns 400 VALIDATION_ERROR with requestId and details when description missing", async () => {
    const repo = mockRepo();
    const app = createServer({ todoRepository: repo });
    await app.ready();
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/todos",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({}),
    });
    expect(res.statusCode).toBe(400);
    const parsed = errorEnvelopeSchema.safeParse(JSON.parse(res.body));
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.error.code).toBe("VALIDATION_ERROR");
      expect(parsed.data.error.requestId).toBeDefined();
      expect(parsed.data.error.details).toBeDefined();
    }
    expect(JSON.parse(res.body)).not.toHaveProperty("stack");
    await app.close();
  });

  it("returns 400 when description is empty after trim", async () => {
    const repo = mockRepo();
    const app = createServer({ todoRepository: repo });
    await app.ready();
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/todos",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ description: "   " }),
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body) as { error: { code: string } };
    expect(body.error.code).toBe("VALIDATION_ERROR");
    await app.close();
  });

  it("returns 400 when description is not a string", async () => {
    const repo = mockRepo();
    const app = createServer({ todoRepository: repo });
    await app.ready();
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/todos",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ description: 99 }),
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it("returns 400 VALIDATION_ERROR with requestId for malformed JSON", async () => {
    const repo = mockRepo();
    const app = createServer({ todoRepository: repo });
    await app.ready();
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/todos",
      headers: { "content-type": "application/json" },
      payload: "{",
    });
    expect(res.statusCode).toBe(400);
    const parsed = errorEnvelopeSchema.safeParse(JSON.parse(res.body));
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.error.code).toBe("VALIDATION_ERROR");
      expect(parsed.data.error.requestId).toBeDefined();
    }
    await app.close();
  });
});

describe("GET /api/v1/todos", () => {
  it("returns 200 with data.todos newest first and meta.requestId", async () => {
    const older = new Date("2026-04-01T10:00:00.000Z");
    const newer = new Date("2026-04-01T11:00:00.000Z");
    const repo = mockRepo({
      findAllTodosOrderedByCreatedAtDesc: vi.fn(async () => [
        {
          id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          description: "Second",
          is_completed: false,
          created_at: newer,
        },
        {
          id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
          description: "First",
          is_completed: true,
          created_at: older,
        },
      ]),
    });
    const app = createServer({ todoRepository: repo });
    await app.ready();
    const res = await app.inject({ method: "GET", url: "/api/v1/todos" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as {
      data: { todos: { description: string }[] };
      meta: { requestId: string };
    };
    expect(body.data.todos.map((t) => t.description)).toEqual([
      "Second",
      "First",
    ]);
    expect(body.meta.requestId).toBeDefined();
    await app.close();
  });
});

describe("error envelope", () => {
  it("does not expose stack when repository throws", async () => {
    const repo = mockRepo({
      insertTodo: vi.fn(async () => {
        throw new Error("secret db failure");
      }),
    });
    const app = createServer({ todoRepository: repo });
    await app.ready();
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/todos",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ description: "x" }),
    });
    expect(res.statusCode).toBe(500);
    const raw = JSON.parse(res.body) as Record<string, unknown>;
    expect(raw).not.toHaveProperty("stack");
    const parsed = errorEnvelopeSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.error.code).toBe("INTERNAL_ERROR");
      expect(parsed.data.error.message).toBe("An unexpected error occurred");
      expect(String(JSON.stringify(raw))).not.toContain("secret");
    }
    await app.close();
  });
});
