import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LoadingState } from "./loading-state";

describe("LoadingState", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with default message", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading tasks")).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    render(<LoadingState message="Fetching data" />);
    expect(screen.getByText("Fetching data")).toBeInTheDocument();
  });

  it("has correct ARIA attributes", () => {
    render(<LoadingState />);
    const container = screen.getByRole("status");
    expect(container).toHaveAttribute("aria-live", "polite");
    expect(container).toHaveAttribute("aria-busy", "true");
  });

  it("renders skeleton items", () => {
    const { container } = render(<LoadingState />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(3);
  });
});
