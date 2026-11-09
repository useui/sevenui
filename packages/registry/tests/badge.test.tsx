import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge, badgeVariants } from "@/registry/base/ui/badge";
import registry from "../registry.json";
import { contrastRatio, parseColor } from "./helpers/contrast";
import { must } from "./helpers/must";

describe("Badge", () => {
  it("renders a span with data-slot and children", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New");
    expect(badge.tagName).toBe("SPAN");
    expect(badge.getAttribute("data-slot")).toBe("badge");
  });

  it("applies the default variant classes and data attribute", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.getAttribute("data-variant")).toBe("default");
    expect(badge.className).toContain("bg-primary");
    expect(badge.className).toContain("text-primary-foreground");
  });

  it("applies the secondary variant", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(badge.getAttribute("data-variant")).toBe("secondary");
    expect(badge.className).toContain("bg-secondary");
    expect(badge.className).toContain("text-secondary-foreground");
  });

  it("applies the destructive variant", () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    const badge = screen.getByText("Destructive");
    expect(badge.getAttribute("data-variant")).toBe("destructive");
    // v2: the text is the destructive tone pulled towards the foreground for AA.
    expect(badge.className).toContain("[--badge-tone:var(--destructive)]");
    expect(badge.className).toContain("var(--badge-tone))]");
  });

  it("applies the outline variant", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText("Outline");
    expect(badge.getAttribute("data-variant")).toBe("outline");
    expect(badge.className).toContain("border-border");
  });

  it("applies the ghost variant", () => {
    render(<Badge variant="ghost">Ghost</Badge>);
    const badge = screen.getByText("Ghost");
    expect(badge.getAttribute("data-variant")).toBe("ghost");
    expect(badge.className).toContain("hover:bg-muted");
  });

  it("applies the link variant", () => {
    render(<Badge variant="link">Link</Badge>);
    const badge = screen.getByText("Link");
    expect(badge.getAttribute("data-variant")).toBe("link");
    expect(badge.className).toContain("underline-offset-4");
  });

  it("appends a custom className after the variant classes", () => {
    render(<Badge className="custom-badge">Styled</Badge>);
    const badge = screen.getByText("Styled");
    expect(badge.className).toContain("custom-badge");
    expect(badge.className).toContain("inline-flex");
  });

  it("supports rendering as a different element via the render prop", () => {
    render(<Badge render={<a href="/releases" />}>v1.0</Badge>);
    const badge = screen.getByText("v1.0");
    expect(badge.tagName).toBe("A");
    expect(badge.getAttribute("href")).toBe("/releases");
    expect(badge.getAttribute("data-slot")).toBe("badge");
    expect(badge.className).toContain("inline-flex");
  });

  it("passes through arbitrary props such as aria attributes", () => {
    render(<Badge aria-invalid="true">Invalid</Badge>);
    expect(screen.getByText("Invalid").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });

  describe("v2 design language", () => {
    it("takes the reference badge shape", () => {
      render(<Badge>Shape</Badge>);
      const classes = screen.getByText("Shape").className.split(" ");
      expect(classes).toContain("rounded-full");
      expect(classes).toContain("px-2");
      expect(classes).toContain("text-[11px]");
      expect(classes).not.toContain("rounded-4xl");
    });

    it("keeps main's focus halo and aria-invalid ring", () => {
      render(<Badge render={<a href="/x" />}>Focus</Badge>);
      const cls = screen.getByText("Focus").className.split(" ");
      expect(cls).toEqual(
        expect.arrayContaining([
          "focus-visible:border-ring",
          "focus-visible:ring-[3px]",
          "focus-visible:ring-ring/50",
          "aria-invalid:border-destructive",
          "aria-invalid:ring-destructive/20",
          "dark:aria-invalid:ring-destructive/40",
        ]),
      );
      expect(cls.join(" ")).not.toContain("focus-ring");
      expect(cls.join(" ")).not.toContain("--focus-color");
    });

    it("fills default with primary and keeps main's neutral badges", () => {
      const cls = (variant: "default" | "secondary" | "outline") =>
        badgeVariants({ variant }).split(" ");
      expect(cls("default")).toEqual(
        expect.arrayContaining(["bg-primary", "text-primary-foreground"]),
      );
      expect(cls("secondary")).toEqual(
        expect.arrayContaining(["bg-secondary", "text-secondary-foreground"]),
      );
      expect(cls("outline")).toEqual(expect.arrayContaining(["border-border", "text-foreground"]));
      for (const variant of ["default", "secondary", "outline"] as const) {
        expect(cls(variant).join(" "), variant).not.toMatch(/hairline|surface-/);
      }
      // No two of the three share a surface.
      const surfaces = (["default", "secondary", "outline"] as const).map((v) =>
        cls(v).filter((c) => /^(bg-|border-|shadow-)/.test(c)).sort().join(" "),
      );
      expect(new Set(surfaces).size).toBe(3);
    });

    it("draws secondary as a flat fill with no visible edge", () => {
      const cls = badgeVariants({ variant: "secondary" }).split(" ");
      // The base border stays transparent; secondary adds no colour to it.
      expect(cls).toContain("border-transparent");
      expect(cls.filter((c) => /^border-/.test(c) && c !== "border-transparent")).toEqual([]);
      expect(cls.filter((c) => /^(ring-|inset-ring|shadow-)/.test(c))).toEqual([]);
    });

    it("paints no variant with a brand token", () => {
      for (const variant of ["default", "secondary", "destructive", "outline", "ghost", "link", "success", "warning"] as const) {
        expect(badgeVariants({ variant }), variant).not.toMatch(/brand/);
      }
      expect(badgeVariants({ variant: "link" })).toContain("text-primary");
    });

    it.each(["destructive", "success", "warning"] as const)(
      "tints the %s status tone and marks it with a dot",
      (variant) => {
        render(<Badge variant={variant}>{variant}</Badge>);
        const cls = screen.getByText(variant).className;
        expect(cls).toContain("[--badge-tone:var(--");
        expect(cls).toContain(
          "bg-[color:color-mix(in_oklch,transparent_90%,var(--badge-tone))]",
        );
        expect(cls).toContain("before:size-1.5");
        expect(cls).toContain("before:bg-(--badge-tone)");
        // An icon replaces the dot.
        expect(cls).toContain("has-[>svg]:before:hidden");
      },
    );

    it("falls back to the SevenUI status values when a project lacks the status tokens", () => {
      render(<Badge variant="success">ok</Badge>);
      expect(screen.getByText("ok").className).toContain(
        "[--badge-tone:var(--success,oklch(",
      );
      render(<Badge variant="warning">warn</Badge>);
      expect(screen.getByText("warn").className).toContain(
        "[--badge-tone:var(--warning,oklch(",
      );
    });

    it("drops transitions under reduced motion", () => {
      render(<Badge>M</Badge>);
      expect(screen.getByText("M").className).toContain("motion-reduce:transition-none");
    });
  });
});

// --- Contrast -------------------------------------------------------------
// Resolves the badge's own color-mix() classes against the theme values in
// registry.json, the way a browser does: mixes in OKLCH, then composites the
// translucent tint over the surface in sRGB. Every tone's text must reach AA
// (4.5:1) on its tint over the page background, a card and a panel.

type Oklch = [number, number, number];
type Rgb = [number, number, number];

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function hexToOklch(hex: string): Oklch {
  const n = Number.parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => toLinear(v / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}

function parse(value: string): Oklch {
  if (value.startsWith("#")) return hexToOklch(value);
  const m = value.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/);
  if (!m) throw new Error(`Unsupported colour: ${value}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** color-mix(in oklch, a p%, b): linear L and C, hue along the shorter arc. */
function mix(a: Oklch, p: number, b: Oklch): Oklch {
  const t = 1 - p / 100;
  let dh = b[2] - a[2];
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (a[2] + dh * t + 360) % 360];
}

const toRgb = ([L, C, h]: Oklch): Rgb => {
  const c = parseColor(`oklch(${L.toFixed(6)} ${C.toFixed(6)} ${h.toFixed(6)})`);
  return [c.r, c.g, c.b];
};

const over = (fg: Rgb, alpha: number, bg: Rgb): Rgb =>
  fg.map((c, i) => alpha * c + (1 - alpha) * bg[i]) as Rgb;

const hex = (rgb: Rgb) =>
  `#${rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0")).join("")}`;

type CssVars = Record<string, Record<string, string>>;
const cssVarsOf = (name: string) =>
  must(registry.items.find((i) => i.name === name)).cssVars as unknown as CssVars;
const themeVars = cssVarsOf("theme");
const tokenVars = cssVarsOf("sevenui-tokens");

function palette(mode: "light" | "dark") {
  const v = themeVars[mode];
  const color = (name: string) => parse(v[name]);
  const card = color("card");
  const foreground = color("foreground");
  // surface-panel: var(--card) in light, card mixed 4% toward the foreground in dark.
  const panelMix = tokenVars[mode]["surface-panel"];
  const panel = panelMix === "var(--card)" ? card : mix(card, 96, foreground);
  expect(panelMix).toMatch(/^(var\(--card\)|color-mix\(in oklch, var\(--card\), var\(--foreground\) 4%\))$/);
  return {
    foreground,
    tones: { destructive: color("destructive"), success: color("success"), warning: color("warning") },
    surfaces: { background: color("background"), card, panel },
  };
}

/** Reads `color-mix(in_oklch,var(--foreground)_N%,…)` from a class list; 0 when the text is the pure tone. */
function foregroundPull(classes: string): number {
  const m = classes.match(
    /(?:^|\s)text-\[color:color-mix\(in_oklch,var\(--foreground\)_(\d+)%,var\(--badge-tone\)\)\]/,
  );
  return m ? Number(m[1]) : 0;
}

/**
 * The tint's alpha at rest, or on a linked badge's hover (`[a]:hover:`), from
 * `transparent_N%`.
 */
function tintAlpha(classes: string, state: "rest" | "hover"): number {
  const prefix = state === "hover" ? "\\[a\\]:hover:" : "";
  const status = classes.match(
    new RegExp(`(?:^|\\s)${prefix}bg-\\[color:color-mix\\(in_oklch,transparent_(\\d+)%,var\\(--badge-tone\\)\\)\\]`),
  );
  if (status) return 1 - Number(status[1]) / 100;
  throw new Error(`no ${state} tint`);
}

const AA = 4.5;

describe("Badge text contrast (WCAG AA)", () => {
  const cases = (["light", "dark"] as const).flatMap((mode) =>
    (["destructive", "success", "warning"] as const).flatMap((variant) =>
      (["rest", "hover"] as const).map((state) => ({ mode, variant, state })),
    ),
  );

  it.each(cases)("$variant text reaches AA on its $state tint in $mode", ({ mode, variant, state }) => {
    const classes = badgeVariants({ variant });
    const p = palette(mode);
    const tone = p.tones[variant];
    const pull = foregroundPull(classes);
    expect(pull, `${variant} text must be a foreground pull of its tone`).toBeGreaterThan(0);
    const text = toRgb(mix(p.foreground, pull, tone));
    const tint = toRgb(tone);
    const alpha = tintAlpha(classes, state);
    const ratios = Object.entries(p.surfaces).map(([name, surface]) => {
      const bg = over(tint, alpha, toRgb(surface));
      return [name, contrastRatio(hex(text), hex(bg))] as const;
    });
    const report = ratios.map(([name, r]) => `${name} ${r.toFixed(2)}`).join(", ");
    expect(Math.min(...ratios.map(([, r]) => r)), `${variant} ${mode} ${state}: ${report}`).toBeGreaterThanOrEqual(AA);
  });
});
