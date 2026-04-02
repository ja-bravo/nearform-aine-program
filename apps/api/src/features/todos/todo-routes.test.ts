import { describe, expect, it, vi } from "vitest";
import { createServer } from "../../server.js";
import { errorEnvelopeSchema } from "./todo-schemas.js";
import type { TodoRepository, TodoRow } from "./todo-repository.js";

const fixedId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const fixedDate = new Date("2026-04-01T12:00:00.000Z");

function mockRepo(overrides: Partial<TodoRepository> = {}): TodoRepository {
  const row = (description: string, isCompleted: boolean = false): TodoRow => ({
    id: fixedId,
    description,
    is_completed: isCompleted,
    created_at: fixedDate,
  });
  return {
    insertTodo: vi.fn(async (d) => row(d)),
    findAllTodosOrderedByCreatedAtDesc: vi.fn(async () => []),
    updateTodoCompletion: vi.fn(async (id, isCompleted) => row("test", isCompleted)),
    ...overrides,
  };
}

describe("POST /api/v1/todos", () => {
  it("returns 201 with data + meta.requestId", async () => {
    const repo = mockRepo();
    const app = await createServer({ todoRepository: repo });
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
    const app = await createServer({ todoRepository: repo });
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
    const app = await createServer({ todoRepository: repo });
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
    const app = await createServer({ todoRepository: repo });
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
    const app = await createServer({ todoRepository: repo });
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
    const app = await createServer({ todoRepository: repo });
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
    const app = await createServer({ todoRepository: repo });
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

describe("PATCH /api/v1/todos/:id", () => {
  it("returns 200 with updated isCompleted state", async () => {
    const repo = mockRepo();
    const app = await createServer({ todoRepository: repo });
    await app.ready();
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/todos/${fixedId}`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ isCompleted: true }),
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as {
      data: Record<string, unknown>;
      meta: { requestId: string };
    };
    expect(body.data).toMatchObject({
      id: fixedId,
      description: "test",
      isCompleted: true,
      createdAt: "2026-04-01T12:00:00.000Z",
    });
    expect(typeof body.meta.requestId).toBe("string");
    expect(body.meta.requestId.length).toBeGreaterThan(0);
    await app.close();
  });

  it("returns 404 NOT_FOUND with error envelope when todo not found", async () => {
    const repo = mockRepo({
      updateTodoCompletion: vi.fn(async () => null),
    });
    const app = await createServer({ todoRepository: repo });
    await app.ready();
    const nonExistentId = "00000000-0000-0000-0000-000000000000";
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/todos/${nonExistentId}`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ isCompleted: true }),
    });
    expect(res.statusCode).toBe(404);
    const parsed = errorEnvelopeSchema.safeParse(JSON.parse(res.body));
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.error.code).toBe("NOT_FOUND");
      expect(parsed.data.error.requestId).toBeDefined();
      expect(parsed.data.error.message).toContain(nonExistentId);
    }
    await app.close();
  });

  it("returns 400 VALIDATION_ERROR when isCompleted is not boolean", async () => {
    const repo = mockRepo();
    const app = await createServer({ todoRepository: repo });
    await app.ready();
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/todos/${fixedId}`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ isCompleted: "true" }),
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

  it("returns 400 VALIDATION_ERROR when isCompleted is missing", async () => {
    const repo = mockRepo();
    const app = await createServer({ todoRepository: repo });
    await app.ready();
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/todos/${fixedId}`,
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
    await app.close();
  });

  it("verifies idempotency: identical requests return same state", async () => {
    const repo = mockRepo();
    const app = await createServer({ todoRepository: repo });
    await app.ready();
    const res1 = await app.inject({
      method: "PATCH",
      url: `/api/v1/todos/${fixedId}`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ isCompleted: true }),
    });
    expect(res1.statusCode).toBe(200);
    const body1 = JSON.parse(res1.body);

    const res2 = await app.inject({
      method: "PATCH",
      url: `/api/v1/todos/${fixedId}`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ isCompleted: true }),
    });
    expect(res2.statusCode).toBe(200);
    const body2 = JSON.parse(res2.body);

    expect(body1.data.isCompleted).toBe(body2.data.isCompleted);
    expect(body1.data.id).toBe(body2.data.id);
    await app.close();
  });

  it("toggles between true and false states", async () => {
    const repo = mockRepo({
      updateTodoCompletion: vi.fn(async (id, isCompleted) => ({
        id,
        description: "Buy milk",
        is_completed: isCompleted,
        created_at: fixedDate,
      })),
    });
    const app = await createServer({ todoRepository: repo });
    await app.ready();

    const res1 = await app.inject({
      method: "PATCH",
      url: `/api/v1/todos/${fixedId}`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ isCompleted: true }),
    });
    expect(res1.statusCode).toBe(200);
    const body1 = JSON.parse(res1.body);
    expect(body1.data.isCompleted).toBe(true);

    const res2 = await app.inject({
      method: "PATCH",
      url: `/api/v1/todos/${fixedId}`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ isCompleted: false }),
    });
    expect(res2.statusCode).toBe(200);
    const body2 = JSON.parse(res2.body);
    expect(body2.data.isCompleted).toBe(false);

    await app.close();
  });
});
