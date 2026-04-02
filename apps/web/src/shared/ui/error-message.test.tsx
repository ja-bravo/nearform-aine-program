import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorMessage } from "./error-message";

describe("ErrorMessage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with message", () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders with requestId", () => {
    render(<ErrorMessage message="Error" requestId="rid-123" />);
    expect(screen.getByText(/rid-123/)).toBeInTheDocument();
  });

  it("does not render retry button if onRetry is not provided", () => {
    render(<ErrorMessage message="Error" />);
    expect(
      screen.queryByRole("button", { name: /retry/i })
    ).not.toBeInTheDocument();
  });

  it("renders retry button and calls onRetry when clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={onRetry} />);

    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("has correct ARIA attributes", () => {
    render(<ErrorMessage message="Error" />);
    const container = screen.getByRole("alert");
    expect(container).toHaveAttribute("aria-live", "assertive");
  });
});
