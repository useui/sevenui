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
