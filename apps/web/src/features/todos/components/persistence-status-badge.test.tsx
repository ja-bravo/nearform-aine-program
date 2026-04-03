import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PersistenceStatusBadge } from "./persistence-status-badge";

describe("PersistenceStatusBadge", () => {
  afterEach(() => {
    cleanup();
  });

  it("is hidden when status is null", () => {
    render(<PersistenceStatusBadge status={null} />);
    const container = screen.getByRole("status");
    expect(container.className).toContain("opacity-0");
  });

  it("renders 'Saving' in blue when status is 'saving'", () => {
    render(<PersistenceStatusBadge status="saving" />);
    const badge = screen.getByText("Saving");
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement?.className).toContain("opacity-100");
    expect(badge.className).toContain("text-blue-600");
    expect(badge.className).toContain("bg-blue-50");
  });

  it("renders 'Saved' in green when status is 'saved'", () => {
    render(<PersistenceStatusBadge status="saved" />);
    const badge = screen.getByText("Saved");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-green-600");
    expect(badge.className).toContain("bg-green-50");
  });

  it("renders 'Not saved' in red when status is 'error'", () => {
    render(<PersistenceStatusBadge status="error" />);
    const badge = screen.getByText("Not saved");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-red-600");
    expect(badge.className).toContain("bg-red-50");
  });

  it("has aria-live='polite' and role='status' on the container", () => {
    render(<PersistenceStatusBadge status="saving" />);
    const container = screen.getByRole("status");
    expect(container).toHaveAttribute("aria-live", "polite");
  });
});
