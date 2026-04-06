import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiBaseUrl, getServerApiBaseUrl } from "./env";

describe("env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("getApiBaseUrl trims trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.example/");
    expect(getApiBaseUrl()).toBe("http://api.example");
  });

  it("getApiBaseUrl returns empty string when unset", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    expect(getApiBaseUrl()).toBe("");
  });

  it("getServerApiBaseUrl prefers API_BASE_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://public/");
    vi.stubEnv("API_BASE_URL", "http://internal/");
    expect(getServerApiBaseUrl()).toBe("http://internal");
  });

  it("getServerApiBaseUrl falls back to public URL", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://public/");
    vi.stubEnv("API_BASE_URL", "");
    expect(getServerApiBaseUrl()).toBe("http://public");
  });
});
