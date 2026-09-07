import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Toggle } from "@/registry/base/ui/toggle";

describe("Toggle", () => {
  it("renders an unpressed toggle button by default", () => {
    render(<Toggle aria-label="Bold" />);
    const toggle = screen.getByRole("button", { name: "Bold" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(toggle.getAttribute("data-slot")).toBe("toggle");
  });

  it("toggles aria-pressed on click (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<Toggle aria-label="Bold" />);
    const toggle = screen.getByRole("button", { name: "Bold" });
    await user.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    await user.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
  });

  it("starts pressed with defaultPressed", () => {
    render(<Toggle aria-label="Bold" defaultPressed />);
    expect(
      screen.getByRole("button", { name: "Bold" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("stays at the controlled value and reports changes via onPressedChange", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(
      <Toggle aria-label="Bold" pressed={false} onPressedChange={onPressedChange} />,
    );
    const toggle = screen.getByRole("button", { name: "Bold" });
    await user.click(toggle);
    expect(onPressedChange).toHaveBeenCalledTimes(1);
    expect(onPressedChange.mock.calls[0][0]).toBe(true);
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
  });

  it("updates when the controlled value changes", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [pressed, setPressed] = React.useState(false);
      return (
        <Toggle aria-label="Bold" pressed={pressed} onPressedChange={setPressed} />
      );
    }
    render(<Controlled />);
    const toggle = screen.getByRole("button", { name: "Bold" });
    await user.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(
      <Toggle aria-label="Bold" disabled onPressedChange={onPressedChange} />,
    );
    const toggle = screen.getByRole("button", { name: "Bold" });
    await user.click(toggle);
    expect(onPressedChange).not.toHaveBeenCalled();
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
  });

  it("applies the outline variant and sm size tokens", () => {
    render(<Toggle aria-label="Bold" variant="outline" size="sm" />);
    const classes = screen
      .getByRole("button", { name: "Bold" })
      .className.split(/\s+/);
    expect(classes).toContain("border-input");
    expect(classes).toContain("h-7");
  });

  it("merges a custom className with variant classes", () => {
    render(<Toggle aria-label="Bold" className="custom-class" />);
    const classes = screen
      .getByRole("button", { name: "Bold" })
      .className.split(/\s+/);
    expect(classes).toContain("custom-class");
    expect(classes).toContain("bg-transparent");
  });
});
