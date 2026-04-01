import { describe, expect, it } from "vitest";
import { quickCaptureSchema } from "./capture-schema";

describe("quickCaptureSchema", () => {
  it("rejects empty string", () => {
    const r = quickCaptureSchema.safeParse({ description: "" });
    expect(r.success).toBe(false);
  });

  it("rejects whitespace-only without trimming input", () => {
    const r = quickCaptureSchema.safeParse({ description: "   \t  " });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.message).toBeTruthy();
    }
  });

  it("accepts non-empty trimmed content", () => {
    const r = quickCaptureSchema.safeParse({ description: "Buy milk" });
    expect(r.success).toBe(true);
  });
});
