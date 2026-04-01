import Fastify from "fastify";
import pg from "pg";

/** Safe JSON error body for clients (no stack traces). */
export function toErrorBody(statusCode: number, message: string) {
  const internal = statusCode === 500;
  return {
    error: {
      code: internal ? "INTERNAL_ERROR" : "REQUEST_ERROR",
      message: internal ? "An unexpected error occurred" : message,
    },
  };
}

export function createServer() {
  const app = Fastify({
    logger: true,
  });

  app.setErrorHandler((error, _request, reply) => {
    const err = error as Error & { statusCode?: number };
    const statusCode = err.statusCode ?? 500;
    reply.status(statusCode).send(toErrorBody(statusCode, err.message));
    if (statusCode >= 500) {
      app.log.error({ err }, "unhandled error");
    }
  });

  app.get("/healthz/live", async () => ({ status: "ok" }));

  /**
   * Readiness: verifies `DATABASE_URL` is set and Postgres accepts a connection.
   * Returns 503 when misconfigured or DB is down (compose still allows liveness).
   */
  app.get("/healthz/ready", async (_request, reply) => {
    const url = process.env.DATABASE_URL;
    if (!url?.trim()) {
      return reply
        .status(503)
        .send(
          toErrorBody(503, "Database not configured (DATABASE_URL missing)")
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
      return reply.status(503).send(toErrorBody(503, "Database unavailable"));
    }
  });

  return app;
}
