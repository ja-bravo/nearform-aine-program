/** @vitest-environment node */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError } from "./api-error";
import { fetchJsonServer } from "./fetch-json-server";

describe("fetchJsonServer", () => {
  beforeEach(() => {
    vi.stubEnv("API_BASE_URL", "http://api.test");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("throws ApiError when no base URL is configured", async () => {
    vi.stubEnv("API_BASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    await expect(
      fetchJsonServer("/x", { method: "GET" }, z.object({}))
    ).rejects.toMatchObject({
      message: "App is missing API configuration.",
    });
  });

  it("returns parsed JSON on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const data = await fetchJsonServer(
      "/path",
      { method: "GET" },
      z.object({ ok: z.boolean() })
    );
    expect(data).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/path",
      expect.objectContaining({ method: "GET", cache: "no-store" })
    );
  });

  it("prefixes path when missing leading slash", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ x: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    await fetchJsonServer(
      "relative",
      { method: "GET" },
      z.object({ x: z.number() })
    );
    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/relative",
      expect.any(Object)
    );
  });

  it("throws when fetch rejects", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("network"));
    await expect(
      fetchJsonServer("/x", { method: "GET" }, z.object({}))
    ).rejects.toMatchObject({
      message: "Could not reach the server. Check your connection.",
    });
  });

  it("throws when response body is invalid JSON", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("not-json", { status: 200 })
    );
    await expect(
      fetchJsonServer("/x", { method: "GET" }, z.object({}))
    ).rejects.toMatchObject({
      message: "Unexpected response from the server.",
    });
  });

  it("throws ApiError with envelope on error response", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "E1",
            message: "bad",
            requestId: "rid-9",
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    );
    await expect(
      fetchJsonServer("/x", { method: "GET" }, z.object({}))
    ).rejects.toMatchObject({
      message: "bad",
      code: "E1",
      requestId: "rid-9",
      status: 400,
    });
  });

  it("throws generic message when error body is not an envelope", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      })
    );
    await expect(
      fetchJsonServer("/x", { method: "GET" }, z.object({}))
    ).rejects.toMatchObject({
      message: "Something went wrong. Try again.",
      status: 502,
    });
  });

  it("throws when success body fails schema", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ wrong: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    await expect(
      fetchJsonServer(
        "/x",
        { method: "GET" },
        z.object({ expected: z.string() })
      )
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("sets Content-Type when body is present", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ a: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    await fetchJsonServer(
      "/x",
      { method: "POST", body: "{}" },
      z.object({ a: z.number() })
    );
    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/x",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });
});
