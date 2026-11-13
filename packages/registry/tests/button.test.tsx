import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { Button, buttonVariants } from "@/registry/base/ui/button";
import { isUiSdk } from "./helpers/flavour";
import { AA, contrastOn, destructivePull, destructiveTint, mix, palette } from "./helpers/palette";

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

  // Button has no "use client", so a Server Component runs it. What it hands
  // on must cross into the client: no functions, and no render element
  // (React delivers one lazily, which the flavour's UI SDK part cannot
  // render). React's server build has no useState, so the module is loaded
  // here with that hook removed. Also checked as a real RSC render in Next.js.
  it("renders from a Server Component with a custom slot or a render element", async () => {
    vi.resetModules();
    vi.doMock("react", async (importOriginal) => ({
      ...(await importOriginal<typeof import("react")>()),
      useState: undefined,
    }));
    try {
      const { Button: ServerButton } = await import("@/registry/base/ui/button");
      const run = ServerButton as unknown as (props: object) => React.ReactElement;
      const cases: [object, string][] = [
        [{ "data-slot": "carousel-next", children: "Next" }, "carousel-next"],
        [{ render: <a href="#next" />, children: "Next" }, "button"],
      ];
      for (const [props, slot] of cases) {
        const element = run(props);
        const passed = element.props as Record<string, unknown>;
        expect(Object.keys(passed).filter((key) => typeof passed[key] === "function")).toEqual([]);
        if (typeof element.type === "string") {
          expect(passed["data-slot"]).toBe(slot);
        } else {
          expect(passed.render === undefined || typeof passed.render === "object").toBe(true);
          if (isUiSdk) throw new Error("the flavour must not hand UI SDK's part a server render");
        }
      }
    } finally {
      vi.doUnmock("react");
      vi.resetModules();
    }
  });

  it("applies the default variant and size tokens", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(tokens(button)).toContain("bg-primary");
    expect(tokens(button)).toContain("h-[var(--control-h,2.125rem)]");
  });

  it.each([
    ["outline", "bg-background"],
    ["secondary", "bg-secondary"],
    ["ghost", "hover:bg-muted"],
    ["destructive", "text-[color:color-mix(in_oklch,var(--foreground)_30%,var(--destructive))]"],
    ["link", "underline-offset-4"],
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

  describe("styles", () => {
    function classes(props: React.ComponentProps<typeof Button> = {}) {
      render(<Button {...props}>Save</Button>);
      return tokens(screen.getByRole("button", { name: "Save" }));
    }

    it("uses the ring-3 focus halo, not the offset focus ring", () => {
      const list = classes();
      expect(list).toContain("outline-none");
      expect(list).toContain("focus-visible:border-ring");
      expect(list).toContain("focus-visible:ring-3");
      expect(list).toContain("focus-visible:ring-ring/50");
      expect(list).not.toContain("focus-visible:focus-ring");
    });

    it("draws a destructive ring when invalid", () => {
      const list = classes();
      expect(list).toContain("aria-invalid:border-destructive");
      expect(list).toContain("aria-invalid:ring-3");
      expect(list).toContain("aria-invalid:ring-destructive/20");
      expect(list).toContain("dark:aria-invalid:ring-destructive/40");
      expect(list.join(" ")).not.toContain("--focus-color");
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

    it("adds no top highlight, inset, surface or hairline to any variant", () => {
      for (const variant of ["default", "outline", "secondary", "ghost", "destructive", "link"] as const) {
        const { unmount } = render(<Button variant={variant}>Plain</Button>);
        const list = tokens(screen.getByRole("button", { name: "Plain" }));
        expect(list.some((c) => /highlight|shadow-inset|elevation-inset|surface-|hairline/.test(c))).toBe(false);
        unmount();
      }
    });

    it("draws the outline variant with the plain border on the background", () => {
      const list = classes({ variant: "outline" });
      expect(list).toContain("bg-background");
      expect(list).toContain("border-border");
      expect(list).toContain("dark:border-input");
    });

    it("gives the secondary variant no edge: no border colour, ring or inset", () => {
      const list = classes({ variant: "secondary" });
      expect(list).toContain("bg-secondary");
      // The base border stays transparent; secondary sets no border colour.
      expect(list).toContain("border-transparent");
      expect(list.some((c) => /^(hover:|aria-expanded:|dark:)*border-(?!transparent)/.test(c))).toBe(false);
      expect(list.some((c) => /^(hover:|aria-expanded:|dark:)*(ring-|shadow-)/.test(c))).toBe(false);
    });

    it("colours the link variant with primary", () => {
      const list = classes({ variant: "link" });
      expect(list).toContain("text-primary");
    });

    it("paints no variant with a brand token", () => {
      for (const variant of ["default", "outline", "secondary", "ghost", "destructive", "link"] as const) {
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

  // Base UI's Button ignores a Promise from onClick; UI SDK's would turn
  // pending (aria-busy, aria-disabled) and ignore presses until it settled.
  it("stays pressable while a Promise its onClick returned is pending", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn(() => new Promise<void>(() => {}));
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    await user.click(button);
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(button.hasAttribute("aria-busy")).toBe(false);
    expect(button.hasAttribute("data-pending")).toBe(false);
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
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

// --- Contrast -------------------------------------------------------------
// The destructive button's text is the destructive tone pulled towards the
// foreground; it must reach AA on its rest and hover tints over every surface
// a button sits on, in both themes.

describe("Destructive button contrast (AA)", () => {
  const classes = buttonVariants({ variant: "destructive" });
  const cases = (["light", "dark"] as const).flatMap((mode) =>
    (["rest", "hover"] as const).map((state) => ({ mode, state })),
  );

  it.each(cases)("text reaches AA on the $state tint in $mode", ({ mode, state }) => {
    const prefix = `${mode === "dark" ? "dark:" : ""}${state === "hover" ? "hover:" : ""}`;
    const alpha = destructiveTint(classes, prefix);
    const pull = destructivePull(classes);
    expect(alpha).not.toBeNaN();
    expect(pull).toBeGreaterThan(0);
    const p = palette(mode);
    const text = mix(p.foreground, pull, p.destructive);
    const ratios = Object.entries(p.surfaces).map(
      ([name, s]) => [name, contrastOn(text, s, { color: p.destructive, alpha })] as const,
    );
    const report = ratios.map(([n, r]) => `${n} ${r.toFixed(2)}`).join(", ");
    expect(Math.min(...ratios.map(([, r]) => r)), `${mode} ${state}: ${report}`).toBeGreaterThanOrEqual(AA);
  });
});
