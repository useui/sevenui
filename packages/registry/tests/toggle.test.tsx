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
    expect(classes).toContain("h-[calc(var(--control-h,2.125rem)-0.25rem)]");
  });

  it("merges a custom className with variant classes", () => {
    render(<Toggle aria-label="Bold" className="custom-class" />);
    const classes = screen
      .getByRole("button", { name: "Bold" })
      .className.split(/\s+/);
    expect(classes).toContain("custom-class");
    expect(classes).toContain("bg-transparent");
  });

  describe("styles", () => {
    function classes(props: React.ComponentProps<typeof Toggle> = {}) {
      render(<Toggle aria-label="Bold" {...props} />);
      return screen.getByRole("button", { name: "Bold" }).className.split(/\s+/);
    }

    it("uses the 3px focus halo, not the offset focus ring", () => {
      const list = classes();
      expect(list).toContain("outline-none");
      expect(list).toContain("focus-visible:border-ring");
      expect(list).toContain("focus-visible:ring-[3px]");
      expect(list).toContain("focus-visible:ring-ring/50");
      expect(list).not.toContain("focus-visible:focus-ring");
    });

    it("sizes from the density tokens", () => {
      const list = classes();
      expect(list).toContain("h-[var(--control-h,2.125rem)]");
      expect(list).toContain("min-w-[var(--control-h,2.125rem)]");
      expect(list).toContain("text-[length:var(--control-text,0.8125rem)]");
    });

    it("fills the pressed state with muted and no edge", () => {
      const list = classes();
      expect(list).toContain("aria-pressed:bg-muted");
      expect(list).toContain("data-[state=on]:bg-muted");
      // The muted fill carries no border, ring, inset or highlight.
      expect(list.some((c) => /^aria-pressed:(border|ring|shadow)/.test(c))).toBe(false);
      expect(list.some((c) => /highlight|surface-|hairline|elevation-inset|brand/.test(c))).toBe(false);
    });

    it("keeps the outline variant on the plain input border", () => {
      const list = classes({ variant: "outline" });
      expect(list).toEqual(expect.arrayContaining(["border", "border-input", "hover:bg-muted"]));
      expect(list.some((c) => /highlight|surface-|hairline|elevation-inset/.test(c))).toBe(false);
    });

    it("marks the invalid state with the destructive border and ring tone", () => {
      const list = classes({ "aria-invalid": true });
      expect(list).toContain("aria-invalid:border-destructive");
      expect(list).toContain("aria-invalid:ring-destructive/20");
      expect(list).toContain("dark:aria-invalid:ring-destructive/40");
      expect(list.join(" ")).not.toContain("--focus-color");
    });

    it("presses like a button, with a reduced-motion counterpart", () => {
      const list = classes();
      expect(list).toContain("active:scale-[0.985]");
      expect(list).toContain("active:translate-y-px");
      expect(list).toContain("motion-reduce:transform-none");
      expect(list).toContain("motion-reduce:transition-none");
      expect(list).toContain("motion-reduce:active:scale-none");
      expect(list).toContain("motion-reduce:active:translate-none");
    });
  });
});
