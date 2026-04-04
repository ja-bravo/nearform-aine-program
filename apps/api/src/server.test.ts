import { describe, expect, it } from "vitest";
import { createServer, toErrorBody } from "./server.js";

const rid = "test-request-id";

describe("toErrorBody", () => {
  it("masks message for 500", () => {
    expect(toErrorBody(500, "secret", rid)).toEqual({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
        requestId: rid,
      },
    });
  });

  it("exposes message for 4xx-style codes", () => {
    expect(toErrorBody(400, "bad", rid)).toEqual({
      error: { code: "REQUEST_ERROR", message: "bad", requestId: rid },
    });
  });

  it("treats 503 as a safe client-visible failure (not internal)", () => {
    expect(toErrorBody(503, "Database unavailable", rid)).toEqual({
      error: {
        code: "REQUEST_ERROR",
        message: "Database unavailable",
        requestId: rid,
      },
    });
  });
});

describe("cors", () => {
  it("reflects allowed Origin for preflight", async () => {
    const app = await createServer();
    await app.ready();
    const res = await app.inject({
      method: "OPTIONS",
      url: "/healthz/live",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "GET",
      },
    });
    expect(res.statusCode).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000"
    );
    await app.close();
  });

  it("allows PATCH in Access-Control-Allow-Methods", async () => {
    const app = await createServer();
    await app.ready();
    const res = await app.inject({
      method: "OPTIONS",
      url: "/api/v1/todos/123",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "PATCH",
      },
    });
    expect(res.statusCode).toBe(204);
    expect(res.headers["access-control-allow-methods"]).toContain("PATCH");
    await app.close();
  });

  it("DELETE without Content-Type header and empty body returns 204 or 404 (not 400)", async () => {
    const app = await createServer();
    await app.ready();
    const res = await app.inject({
      method: "DELETE",
      url: "/api/v1/todos/1e4f0572-9f21-4795-bd70-343c370f485d",
      // no content-type
    });
    // It should not be 400. It could be 404 because we didn't mock repo,
    // or 204 if there was a real DB. But 400 means body parser failed.
    expect(res.statusCode).not.toBe(400);
    await app.close();
  });
});

describe("healthz", () => {
  it("GET /healthz/live returns 200", async () => {
    const app = await createServer();
    await app.ready();
    const res = await app.inject({ method: "GET", url: "/healthz/live" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ status: "ok" });
    await app.close();
  });

  it("GET /healthz/ready returns 503 without DATABASE_URL", async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const app = await createServer();
    await app.ready();
    const res = await app.inject({ method: "GET", url: "/healthz/ready" });
    expect(res.statusCode).toBe(503);
    const body = JSON.parse(res.body) as {
      error: { code: string; requestId: string };
    };
    expect(body.error.code).toBe("REQUEST_ERROR");
    expect(body.error.requestId).toBeDefined();
    await app.close();
    if (prev !== undefined) process.env.DATABASE_URL = prev;
  });
});
