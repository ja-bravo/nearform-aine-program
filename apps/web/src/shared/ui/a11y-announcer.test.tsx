import { cleanup, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { A11yAnnouncer, announce } from "./a11y-announcer";

describe("A11yAnnouncer", () => {
  afterEach(() => {
    cleanup();
  });

  it("is initially empty", () => {
    render(<A11yAnnouncer />);
    const announcer = screen.getByRole("status");
    expect(announcer).toBeEmptyDOMElement();
  });

  it("updates text when announce is called", () => {
    render(<A11yAnnouncer />);
    const announcer = screen.getByRole("status");

    act(() => {
      announce("Test announcement");
    });

    expect(announcer).toHaveTextContent("Test announcement");
  });

  it("has sr-only class to be hidden visually", () => {
    render(<A11yAnnouncer />);
    const announcer = screen.getByRole("status");
    expect(announcer.className).toContain("sr-only");
  });

  it("has aria-live='polite'", () => {
    render(<A11yAnnouncer />);
    const announcer = screen.getByRole("status");
    expect(announcer).toHaveAttribute("aria-live", "polite");
  });
});
