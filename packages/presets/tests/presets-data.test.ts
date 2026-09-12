import { describe, expect, it } from "vitest";
import { BASE_COLOR_NAMES, THEME_NAMES } from "../schema";
import { BASE_COLORS, BASE_TOKEN_KEYS, RADIUS, THEMES } from "../presets";

// Keys a theme overlay must define — always as a complete set, in both
// modes, so primary and primary-foreground can never come from different
// palettes (the contrast guarantee).
const OVERLAY_KEYS = [
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar-primary",
  "sidebar-primary-foreground",
];

describe("BASE_COLORS", () => {
  it("has an entry per schema name and no extras", () => {
    expect(Object.keys(BASE_COLORS).sort()).toEqual([...BASE_COLOR_NAMES].sort());
  });

  it.each([...BASE_COLOR_NAMES])("%s defines the full token set in both modes", (name) => {
    for (const mode of ["light", "dark"] as const) {
      expect(Object.keys(BASE_COLORS[name][mode]).sort()).toEqual([...BASE_TOKEN_KEYS].sort());
    }
  });

  it("neutral reproduces today's default primary", () => {
    expect(BASE_COLORS.neutral.light.primary).toBe("oklch(0.205 0 0)");
    expect(BASE_COLORS.neutral.dark.primary).toBe("oklch(0.922 0 0)");
  });

  it("neutral reproduces today's chart palette", () => {
    expect(BASE_COLORS.neutral.light["chart-1"]).toBe("oklch(0.646 0.222 41.116)");
    expect(BASE_COLORS.neutral.light["chart-2"]).toBe("oklch(0.6 0.118 184.704)");
    expect(BASE_COLORS.neutral.light["chart-3"]).toBe("oklch(0.398 0.07 227.392)");
    expect(BASE_COLORS.neutral.light["chart-4"]).toBe("oklch(0.828 0.189 84.429)");
    expect(BASE_COLORS.neutral.light["chart-5"]).toBe("oklch(0.769 0.188 70.08)");
    expect(BASE_COLORS.neutral.dark["chart-1"]).toBe("oklch(0.488 0.243 264.376)");
    expect(BASE_COLORS.neutral.dark["chart-2"]).toBe("oklch(0.696 0.17 162.48)");
    expect(BASE_COLORS.neutral.dark["chart-3"]).toBe("oklch(0.769 0.188 70.08)");
    expect(BASE_COLORS.neutral.dark["chart-4"]).toBe("oklch(0.627 0.265 303.9)");
    expect(BASE_COLORS.neutral.dark["chart-5"]).toBe("oklch(0.645 0.246 16.439)");
  });

  // Upstream has drifted neutral/stone/zinc to grayscale chart-1..5 (the same
  // five values in both modes), which reads as a broken chart rather than a
  // neutral one — zinc's light chart-1 is all but invisible on white. The
  // generator pins those three back to the colorful palette gray and slate
  // still ship, so a base color only ever changes the neutral scale.
  // See scripts/generate-base-colors.mjs CHART_PIN.
  it.each([...BASE_COLOR_NAMES])("%s shares neutral's chart palette", (name) => {
    for (const mode of ["light", "dark"] as const) {
      for (const key of ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]) {
        expect(BASE_COLORS[name][mode][key]).toBe(BASE_COLORS.neutral[mode][key]);
      }
    }
  });

  it("never reuses one mode's chart palette for the other", () => {
    // The grayscale drift's tell: identical light and dark values.
    expect(BASE_COLORS.neutral.light["chart-1"]).not.toBe(BASE_COLORS.neutral.dark["chart-1"]);
  });

  it("never contains a radius token (radius is its own field)", () => {
    for (const name of BASE_COLOR_NAMES) {
      expect(BASE_COLORS[name].light).not.toHaveProperty("radius");
      expect(BASE_COLORS[name].dark).not.toHaveProperty("radius");
    }
  });
});

describe("THEMES", () => {
  it("has an entry per schema name and no extras", () => {
    expect(Object.keys(THEMES).sort()).toEqual([...THEME_NAMES].sort());
  });

  it("neutral is the empty overlay", () => {
    expect(THEMES.neutral).toEqual({ light: {}, dark: {} });
  });

  it.each([...THEME_NAMES].filter((name) => name !== "neutral"))(
    "%s defines exactly the overlay keys in both modes",
    (name) => {
      for (const mode of ["light", "dark"] as const) {
        expect(Object.keys(THEMES[name][mode]).sort()).toEqual([...OVERLAY_KEYS].sort());
      }
    },
  );
});

describe("RADIUS", () => {
  it("maps every radius name to a CSS length", () => {
    expect(RADIUS).toEqual({ none: "0", small: "0.45rem", default: "0.625rem", large: "0.875rem" });
  });
});
