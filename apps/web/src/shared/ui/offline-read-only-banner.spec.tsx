import { render, screen, act, cleanup } from "@testing-library/react";
import { onlineManager } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { OfflineReadOnlyBanner } from "./offline-read-only-banner";

describe("OfflineReadOnlyBanner", () => {
  beforeEach(() => {
    onlineManager.setOnline(true);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the offline message when isOnline is false", () => {
    act(() => {
      onlineManager.setOnline(false);
    });
    render(<OfflineReadOnlyBanner />);
    expect(screen.getByText(/You are offline/i)).toBeInTheDocument();
  });

  it("renders nothing when isOnline is true", () => {
    const { container } = render(<OfflineReadOnlyBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("has the correct warning styles", () => {
    act(() => {
      onlineManager.setOnline(false);
    });
    render(<OfflineReadOnlyBanner />);
    const banner = screen.getByRole("alert");
    // Verify it has warning background and text color
    expect(banner).toHaveClass("bg-[#D97706]");
    expect(banner).toHaveClass("text-white");
  });
});
