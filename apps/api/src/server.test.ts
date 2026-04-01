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

describe("healthz", () => {
  it("GET /healthz/live returns 200", async () => {
    const app = createServer();
    await app.ready();
    const res = await app.inject({ method: "GET", url: "/healthz/live" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ status: "ok" });
    await app.close();
  });

  it("GET /healthz/ready returns 503 without DATABASE_URL", async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const app = createServer();
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
