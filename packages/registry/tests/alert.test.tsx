import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import registry from "../registry.json";
import { contrastRatio } from "./helpers/contrast";
import { must } from "./helpers/must";

describe("Alert", () => {
  it("exposes role='alert' on the root", () => {
    render(<Alert>Heads up</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.getAttribute("data-slot")).toBe("alert");
    expect(alert.textContent).toBe("Heads up");
  });

  it("renders title and description as composed parts", () => {
    render(
      <Alert>
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>Your card was declined.</AlertDescription>
      </Alert>,
    );
    const title = screen.getByText("Payment failed");
    const description = screen.getByText("Your card was declined.");
    expect(title.getAttribute("data-slot")).toBe("alert-title");
    expect(description.getAttribute("data-slot")).toBe("alert-description");
    const alert = screen.getByRole("alert");
    expect(alert.contains(title)).toBe(true);
    expect(alert.contains(description)).toBe(true);
  });

  it("uses the default variant tokens when no variant is given", () => {
    render(<Alert>Default</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.classList.contains("text-card-foreground")).toBe(true);
    expect(alert.className).not.toContain("var(--destructive)");
  });

  it("applies destructive variant tokens", () => {
    render(<Alert variant="destructive">Danger</Alert>);
    const alert = screen.getByRole("alert");
    // v2: the destructive tone pulled towards the foreground for AA.
    expect(
      alert.classList.contains(
        "text-[color:color-mix(in_oklch,var(--foreground)_15%,var(--destructive))]",
      ),
    ).toBe(true);
    expect(alert.classList.contains("text-card-foreground")).toBe(false);
  });

  it("renders the action slot inside the alert", () => {
    render(
      <Alert>
        <AlertTitle>Update available</AlertTitle>
        <AlertAction>
          <button type="button">Install</button>
        </AlertAction>
      </Alert>,
    );
    const action = screen.getByRole("button", { name: "Install" });
    expect(
      action.closest('[data-slot="alert-action"]'),
    ).not.toBeNull();
  });

  it("appends custom className on every part", () => {
    render(
      <Alert className="root-extra">
        <AlertTitle className="title-extra">T</AlertTitle>
        <AlertDescription className="desc-extra">D</AlertDescription>
        <AlertAction className="action-extra">A</AlertAction>
      </Alert>,
    );
    expect(
      screen.getByRole("alert").classList.contains("root-extra"),
    ).toBe(true);
    expect(screen.getByText("T").classList.contains("title-extra")).toBe(true);
    expect(screen.getByText("D").classList.contains("desc-extra")).toBe(true);
    expect(screen.getByText("A").classList.contains("action-extra")).toBe(true);
  });

  it("forwards arbitrary props to the root element", () => {
    render(<Alert id="billing-alert">X</Alert>);
    expect(screen.getByRole("alert").id).toBe("billing-alert");
  });

  describe("v2 design language", () => {
    it("keeps main's compact padding rather than the panel pad", () => {
      render(<Alert>P</Alert>);
      const cls = screen.getByRole("alert").className.split(" ");
      expect(cls).toContain("px-2.5");
      expect(cls).toContain("py-2");
      expect(cls.join(" ")).not.toContain("--panel-pad");
    });

    it("leaves inline links in title and description without a focus style of their own, as main does", () => {
      render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>,
      );
      for (const text of ["Title", "Description"]) {
        const cls = screen.getByText(text).className;
        expect(cls).not.toContain("focus-ring");
        expect(cls).not.toContain("focus-visible");
      }
    });

    it("sits on main's card surface and plain border by default", () => {
      render(<Alert>D</Alert>);
      const cls = screen.getByRole("alert").className;
      expect(cls.split(" ")).toEqual(expect.arrayContaining(["bg-card", "border"]));
      expect(cls).not.toContain("hairline");
      expect(cls).not.toContain("surface-");
    });

    it("tints the destructive tone into the card, neutral base first, with a tone edge", () => {
      render(<Alert variant="destructive">X</Alert>);
      const cls = screen.getByRole("alert").className;
      // 92% card + 8% tone == color-mix(tone 8%, card). The base comes first
      // because Tailwind's no-color-mix() fallback is the first colour.
      expect(cls).toContain(
        "bg-[color:color-mix(in_oklch,var(--card)_92%,var(--destructive))]",
      );
      expect(cls).not.toContain("surface-");
      expect(cls).toContain(
        "border-[color:color-mix(in_oklch,transparent_70%,var(--destructive))]",
      );
      expect(cls.split(" ")).not.toContain("bg-card");
    });
  });
});

// --- Contrast -------------------------------------------------------------
// Resolves the destructive alert's own color-mix() classes against the theme
// values in registry.json, mixing in OKLCH as the browser does. Title and
// description must reach AA (4.5:1) on the tinted card in both themes.

type Oklch = [number, number, number];

function parseOklch(value: string): Oklch {
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

const css = ([L, C, h]: Oklch) => `oklch(${L.toFixed(6)} ${C.toFixed(6)} ${h.toFixed(6)})`;

describe("Alert destructive contrast (AA)", () => {
  type CssVars = Record<string, Record<string, string>>;
  const cssVarsOf = (name: string) =>
    must(registry.items.find((i) => i.name === name)).cssVars as unknown as CssVars;
  const themeVars = cssVarsOf("theme");

  it.each(["light", "dark"] as const)("title and description reach AA (4.5:1) on the tint in %s", (mode) => {
    render(
      <Alert variant="destructive">
        <AlertTitle>T</AlertTitle>
        <AlertDescription>D</AlertDescription>
      </Alert>,
    );
    const cls = screen.getByRole("alert").className;
    const pct = (re: RegExp) => Number(cls.match(re)?.[1] ?? Number.NaN);
    const tint = pct(/var\(--card\)_(\d+)%,var\(--destructive\)/);
    const title = pct(/(?:^|\s)text-\[color:color-mix\(in_oklch,var\(--foreground\)_(\d+)%,var\(--destructive\)\)\]/);
    const description = pct(
      /\*:data-\[slot=alert-description\]:text-\[color:color-mix\(in_oklch,var\(--foreground\)_(\d+)%,var\(--destructive\)\)\]/,
    );
    for (const n of [tint, title, description]) expect(n).not.toBeNaN();

    const vars = themeVars[mode];
    const card = parseOklch(vars.card);
    const foreground = parseOklch(vars.foreground);
    const destructive = parseOklch(vars.destructive);
    const bg = css(mix(card, tint, destructive));

    const ratios = {
      title: contrastRatio(css(mix(foreground, title, destructive)), bg),
      description: contrastRatio(css(mix(foreground, description, destructive)), bg),
    };
    const report = Object.entries(ratios).map(([k, r]) => `${k} ${r.toFixed(2)}`).join(", ");
    expect(Math.min(...Object.values(ratios)), `${mode}: ${report}`).toBeGreaterThanOrEqual(
      4.5,
    );
  });
});
