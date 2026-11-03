import registry from "../../registry.json";
import { contrastRatio, parseColor } from "./contrast";

// Resolves theme and token colours from registry.json the way a browser does:
// color-mix() in OKLCH, translucent fills composited over a surface in sRGB.

export type Oklch = [number, number, number];
type Rgb = [number, number, number];
export type Mode = "light" | "dark";

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
export function mix(a: Oklch, p: number, b: Oklch): Oklch {
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

const hex = (rgb: Rgb) =>
  `#${rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0")).join("")}`;

type CssVars = Record<string, Record<string, string>>;
function cssVarsOf(name: string): CssVars {
  const item = registry.items.find((i) => i.name === name);
  if (!item?.cssVars) throw new Error(`registry item ${name} has no cssVars`);
  return item.cssVars as unknown as CssVars;
}

/** The theme colours plus the derived SevenUI surfaces for one mode. */
export function palette(mode: Mode) {
  const v = cssVarsOf("theme")[mode];
  const t = cssVarsOf("sevenui-tokens")[mode];
  const color = (name: string) => parse(v[name]);
  const foreground = color("foreground");
  const card = color("card");
  const popover = color("popover");
  // Light: panel = card, raised = popover. Dark: pulled 4% / 7% toward the foreground.
  const panel = t["surface-panel"] === "var(--card)" ? card : mix(card, 96, foreground);
  const raised = t["surface-raised"] === "var(--popover)" ? popover : mix(popover, 93, foreground);
  const hairline = t.hairline.match(/var\(--foreground\) (\d+)%/);
  if (!hairline) throw new Error(`unexpected hairline token: ${t.hairline}`);
  const hairlinePct = Number(hairline[1]);
  return {
    foreground,
    mutedForeground: color("muted-foreground"),
    destructive: color("destructive"),
    hairlineAlpha: hairlinePct / 100,
    surfaces: { background: color("background"), card, panel, popover, raised },
  };
}

export type Surface = keyof ReturnType<typeof palette>["surfaces"];

/** Contrast of `text` over a `tint` at `alpha`, composited on `surface`. */
export function contrastOn(text: Oklch, surface: Oklch, tint?: { color: Oklch; alpha: number }): number {
  const base = toRgb(surface);
  const bg = tint
    ? (toRgb(tint.color).map((c, i) => tint.alpha * c + (1 - tint.alpha) * base[i]) as Rgb)
    : base;
  return contrastRatio(hex(toRgb(text)), hex(bg));
}

export const AA = 4.5;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

/**
 * Reads N from `<prefix>text-[color:color-mix(in_oklch,var(--foreground)_N%,var(--destructive))]`
 * in a class list; NaN when the class is missing.
 */
export function destructivePull(classes: string, prefix = ""): number {
  const m = classes.match(
    new RegExp(
      `(?:^|\\s)${escapeRegExp(prefix)}text-\\[color:color-mix\\(in_oklch,var\\(--foreground\\)_(\\d+)%,var\\(--destructive\\)\\)\\](?:\\s|$)`,
    ),
  );
  return m ? Number(m[1]) : Number.NaN;
}

/** Reads the alpha of `<prefix>bg-destructive/N` in a class list; NaN when missing. */
export function destructiveTint(classes: string, prefix = ""): number {
  const m = classes.match(new RegExp(`(?:^|\\s)${escapeRegExp(prefix)}bg-destructive\\/(\\d+)(?:\\s|$)`));
  return m ? Number(m[1]) / 100 : Number.NaN;
}
