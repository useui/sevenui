import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { BASE_TOKEN_KEYS } from "../../presets/presets";
import { contrastRatio } from "./helpers/contrast";
import { must } from "./helpers/must";

type Item = {
  name: string;
  type: string;
  cssVars?: { light?: Record<string, string>; dark?: Record<string, string>; theme?: Record<string, string> };
  css?: Record<string, unknown>;
  registryDependencies?: string[];
};

const registry = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, "../registry.json"), "utf8"),
) as { items: Item[] };

const tokens = registry.items.find((i) => i.name === "sevenui-tokens");
const theme = must(registry.items.find((i) => i.name === "theme"));
const themeVars = must(theme.cssVars);
const light = tokens?.cssVars?.light ?? {};
const dark = tokens?.cssVars?.dark ?? {};

describe("sevenui-tokens", () => {
  it("ships a sevenui-tokens item of type registry:theme", () => {
    expect(tokens?.type).toBe("registry:theme");
    expect(tokens?.css).toBeDefined();
    const css = must(tokens).css as Record<string, Record<string, string>>;
    expect(css["@utility focus-ring"].outline).toBe("var(--focus-width) solid var(--focus-color, var(--ring))");
    expect(css[":root"]).not.toHaveProperty("--focus-color");
    expect(tokens?.cssVars?.theme).toBeDefined();
  });

  it("defines identical key sets in light and dark", () => {
    expect(Object.keys(light).length).toBeGreaterThan(0);
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
  });

  it("never writes a shadcn variable", () => {
    const forbidden = new Set<string>([...BASE_TOKEN_KEYS, "radius"]);
    const keys = [...Object.keys(light), ...Object.keys(dark)];
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      expect(forbidden.has(key), key).toBe(false);
      expect(/^(success|warning)/.test(key), key).toBe(false);
    }
  });

  it("every registry:ui item depends on sevenui-tokens", () => {
    const ui = registry.items.filter((i) => i.type === "registry:ui");
    expect(ui.length).toBeGreaterThan(0);
    for (const item of ui) {
      expect(item.registryDependencies ?? [], item.name).toContain("https://sevenui.dev/r/sevenui-tokens.json");
    }
  });

  it("declares no brand colour", () => {
    // Colour comes from shadcn's --primary and --ring only.
    for (const vars of [light, dark, tokens?.cssVars?.theme ?? {}]) {
      expect(Object.keys(vars).filter((key) => key.includes("brand"))).toEqual([]);
    }
  });


  it("theme muted-foreground meets 4.5:1 on background in both themes", () => {
    for (const mode of ["light", "dark"] as const) {
      const vars = must(themeVars[mode]);
      expect(contrastRatio(vars["muted-foreground"], vars.background), mode).toBeGreaterThanOrEqual(4.5);
    }
  });
});
