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
    expect(classes).toContain("border-hairline-strong");
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

  describe("v2 design language", () => {
    function classes(props: React.ComponentProps<typeof Toggle> = {}) {
      render(<Toggle aria-label="Bold" {...props} />);
      return screen.getByRole("button", { name: "Bold" }).className.split(/\s+/);
    }

    it("uses the offset focus ring, never the ring halo", () => {
      const list = classes();
      expect(list).toContain("outline-none");
      expect(list).toContain("focus-visible:focus-ring");
      expect(list.join(" ")).not.toMatch(/ring-3|ring-\[3px\]|ring-ring|focus-visible:border-ring/);
    });

    it("sizes from the density tokens", () => {
      const list = classes();
      expect(list).toContain("h-[var(--control-h,2.125rem)]");
      expect(list).toContain("min-w-[var(--control-h,2.125rem)]");
      expect(list).toContain("text-[length:var(--control-text,0.8125rem)]");
    });

    it("lifts the pressed state onto a raised, neutral surface", () => {
      const list = classes();
      expect(list).toContain("aria-pressed:bg-surface-raised");
      expect(list).toContain("aria-pressed:text-foreground");
      expect(list).toContain(
        "aria-pressed:shadow-[var(--elevation-highlight,0_0_#0000),inset_0_0_0_1px_var(--hairline-strong,var(--border))]",
      );
      expect(list.some((c) => c.includes("brand"))).toBe(false);
    });

    it("keeps the outline pressed state on its own border", () => {
      const list = classes({ variant: "outline" });
      expect(list).toContain(
        "aria-pressed:bg-[color-mix(in_oklch,var(--surface-raised,var(--background)),var(--foreground)_7%)]",
      );
      expect(list).not.toContain("aria-pressed:bg-surface-raised");
      expect(list).toContain("aria-pressed:shadow-[var(--elevation-highlight,0_0_#0000)]");
    });

    it("marks the default variant invalid with a destructive inset hairline", () => {
      // The default variant has no border, so border-destructive alone shows nothing.
      const list = classes({ "aria-invalid": true });
      expect(list).toContain("aria-invalid:[--focus-color:var(--destructive)]");
      expect(list).toContain(
        "aria-invalid:shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--destructive)_60%,transparent)]",
      );
      // Pressed and invalid keeps the raised highlight and swaps only the hairline.
      expect(list).toContain(
        "aria-invalid:aria-pressed:shadow-[var(--elevation-highlight,0_0_#0000),inset_0_0_0_1px_color-mix(in_oklch,var(--destructive)_60%,transparent)]",
      );
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
