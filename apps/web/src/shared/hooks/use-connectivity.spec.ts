import { renderHook, act } from "@testing-library/react";
import { onlineManager } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useConnectivity } from "./use-connectivity";

describe("useConnectivity", () => {
  beforeEach(() => {
    onlineManager.setOnline(true);
    vi.clearAllMocks();
  });

  it("returns isOnline: true initially when onlineManager says so", () => {
    const { result } = renderHook(() => useConnectivity());
    expect(result.current.isOnline).toBe(true);
  });

  it("returns isOnline: false when onlineManager is set to offline", () => {
    const { result } = renderHook(() => useConnectivity());

    act(() => {
      onlineManager.setOnline(false);
    });

    expect(result.current.isOnline).toBe(false);
  });

  it("subscribes to onlineManager changes", () => {
    const { result } = renderHook(() => useConnectivity());

    act(() => {
      onlineManager.setOnline(false);
    });
    expect(result.current.isOnline).toBe(false);

    act(() => {
      onlineManager.setOnline(true);
    });
    expect(result.current.isOnline).toBe(true);
  });
});
