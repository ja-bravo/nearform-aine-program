import cors from "@fastify/cors";
import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import pg from "pg";
import type { TodoRepository } from "./features/todos/todo-repository.js";
import { registerTodosRoutes } from "./features/todos/todo-routes.js";
import { toErrorBody } from "./shared/http/error-envelope.js";

export { toErrorBody } from "./shared/http/error-envelope.js";

export type CreateServerOptions = {
  todoRepository?: TodoRepository;
};

function parseCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN ?? "http://localhost:3000";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createServer(options?: CreateServerOptions) {
  const app = Fastify({
    logger: true,
    genReqId: () => randomUUID(),
  });

  await app.register(cors, { origin: parseCorsOrigins() });

  app.setErrorHandler((error, request, reply) => {
    const err = error as Error & { statusCode?: number; code?: string };
    const requestId = request.id;
    if (
      err.code === "FST_ERR_CTP_EMPTY_JSON_BODY" ||
      err.code === "FST_ERR_CTP_INVALID_JSON_BODY"
    ) {
      return reply.status(400).send(
        toErrorBody(400, "Invalid request body", requestId, {
          code: "VALIDATION_ERROR",
        })
      );
    }
    const statusCode = err.statusCode ?? 500;
    reply
      .status(statusCode)
      .send(toErrorBody(statusCode, err.message, requestId));
    if (statusCode >= 500) {
      app.log.error({ err }, "unhandled error");
    }
  });

  app.get("/healthz/live", async () => ({ status: "ok" }));

  app.get("/healthz/ready", async (request, reply) => {
    const url = process.env.DATABASE_URL;
    if (!url?.trim()) {
      return reply
        .status(503)
        .send(
          toErrorBody(
            503,
            "Database not configured (DATABASE_URL missing)",
            request.id
          )
        );
    }
    const client = new pg.Client({
      connectionString: url,
      connectionTimeoutMillis: 5000,
    });
    try {
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
      return { status: "ok" };
    } catch {
      await client.end().catch(() => {});
      return reply
        .status(503)
        .send(toErrorBody(503, "Database unavailable", request.id));
    }
  });

  registerTodosRoutes(app, options?.todoRepository);

  return app;
}
