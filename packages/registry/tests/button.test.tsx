import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/registry/base/ui/button";

function tokens(element: HTMLElement) {
  return element.className.split(/\s+/);
}

describe("Button", () => {
  it("renders a native button with data-slot", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("data-slot")).toBe("button");
  });

  it("applies the default variant and size tokens", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(tokens(button)).toContain("bg-primary");
    expect(tokens(button)).toContain("h-[var(--control-h,2.125rem)]");
  });

  it.each([
    ["outline", "bg-surface-raised"],
    ["secondary", "bg-surface-panel"],
    ["ghost", "hover:bg-[color-mix(in_oklch,var(--surface-panel,var(--muted)),var(--foreground)_5%)]"],
    ["destructive", "text-destructive"],
    ["link", "underline-offset-4"],
    ["accent", "bg-brand-strong"],
  ] as const)("applies the %s variant token", (variant, token) => {
    render(<Button variant={variant}>Save</Button>);
    expect(tokens(screen.getByRole("button", { name: "Save" }))).toContain(
      token,
    );
  });

  it.each([
    ["xs", "h-[calc(var(--control-h,2.125rem)-0.5rem)]"],
    ["sm", "h-[calc(var(--control-h,2.125rem)-0.25rem)]"],
    ["lg", "h-[calc(var(--control-h,2.125rem)+0.25rem)]"],
    ["icon", "size-[var(--control-h,2.125rem)]"],
    ["icon-sm", "size-[calc(var(--control-h,2.125rem)-0.25rem)]"],
  ] as const)("applies the %s size token", (size, token) => {
    render(<Button size={size}>Save</Button>);
    expect(tokens(screen.getByRole("button", { name: "Save" }))).toContain(
      token,
    );
  });

  describe("v2 design language", () => {
    function classes(props: React.ComponentProps<typeof Button> = {}) {
      render(<Button {...props}>Save</Button>);
      return tokens(screen.getByRole("button", { name: "Save" }));
    }

    it("uses the offset focus ring, never the ring-3 halo", () => {
      const list = classes();
      expect(list).toContain("outline-none");
      expect(list).toContain("focus-visible:focus-ring");
      expect(list.join(" ")).not.toMatch(/ring-3|ring-ring|focus-visible:border-ring/);
    });

    it("turns the focus ring destructive when invalid", () => {
      expect(classes()).toContain("aria-invalid:[--focus-color:var(--destructive)]");
    });

    it("reads the density tokens with fallbacks", () => {
      const list = classes();
      expect(list).toContain("h-[var(--control-h,2.125rem)]");
      expect(list).toContain("px-[var(--control-px,0.75rem)]");
      expect(list).toContain("gap-[var(--control-gap,0.5rem)]");
      expect(list).toContain("text-[length:var(--control-text,0.8125rem)]");
    });

    it("presses with scale and a 1px drop, with a reduced-motion counterpart", () => {
      const list = classes();
      expect(list).toContain("active:not-aria-[haspopup]:scale-[0.985]");
      expect(list).toContain("active:not-aria-[haspopup]:translate-y-px");
      expect(list).toContain("transition-[transform,translate,scale,box-shadow,background-color]");
      expect(list).toContain("motion-reduce:transform-none");
      expect(list).toContain("motion-reduce:active:not-aria-[haspopup]:scale-none");
      expect(list).toContain("motion-reduce:active:not-aria-[haspopup]:translate-none");
    });

    it("layers the default variant with a top highlight", () => {
      expect(classes()).toContain("shadow-highlight");
    });

    it("draws the outline variant as a raised surface with a strong hairline", () => {
      const list = classes({ variant: "outline" });
      expect(list).toContain("bg-surface-raised");
      expect(list).toContain("border-hairline-strong");
      expect(list).toContain("shadow-highlight");
    });

    it("fills the accent variant with the brand", () => {
      const list = classes({ variant: "accent" });
      expect(list).toContain("bg-brand-strong");
      expect(list).toContain("text-brand-foreground");
    });

    it("colours the link variant with the brand", () => {
      const list = classes({ variant: "link" });
      expect(list).toContain("text-brand");
      expect(list).toContain("decoration-brand/40");
    });

    it("keeps brand colour out of the neutral variants", () => {
      for (const variant of ["default", "outline", "secondary", "ghost", "destructive"] as const) {
        const { unmount } = render(<Button variant={variant}>Neutral</Button>);
        const list = tokens(screen.getByRole("button", { name: "Neutral" }));
        expect(list.some((c) => /(^|:)(bg|text|border)-brand/.test(c))).toBe(false);
        unmount();
      }
    });

    it("derives small radii from the theme radius and keeps the button-group override", () => {
      const list = classes({ size: "xs" });
      expect(list).toContain("rounded-[min(--theme(--radius-md),10px)]");
      expect(list).toContain("in-data-[slot=button-group]:rounded-lg");
      expect(list.join(" ")).not.toContain("var(--radius-md)");
    });
  });

  it("merges a custom className with variant classes", () => {
    render(<Button className="custom-class">Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(tokens(button)).toContain("custom-class");
    expect(tokens(button)).toContain("bg-primary");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.hasAttribute("disabled")).toBe(true);
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders as a link via the render prop, keeping button classes", () => {
    render(<Button render={<a href="/docs" />}>Docs</Button>);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.getAttribute("data-slot")).toBe("button");
    expect(tokens(link)).toContain("bg-primary");
  });
});
