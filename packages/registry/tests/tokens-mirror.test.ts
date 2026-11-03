import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { must } from "./helpers/must";

type Item = {
  name: string;
  cssVars?: { light?: Record<string, string>; dark?: Record<string, string>; theme?: Record<string, string> };
};

const root = path.resolve(import.meta.dirname, "../../..");
const registry = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "../registry.json"), "utf8")) as {
  items: Item[];
};
const tokens = must(registry.items.find((i) => i.name === "sevenui-tokens"));
const theme = must(registry.items.find((i) => i.name === "theme"));
const tokenVars = must(tokens.cssVars);
const themeVars = must(theme.cssVars);

const FILES = {
  "apps/web/app/globals.css": {
    light: /^:root,\n\[data-theme="light"\] \{\n(?=\s+--background)/m, dark: /^\[data-theme="dark"\] \{\n/m,
  },
  "packages/registry/demos/theme.css": {
    light: /^:root \{\n(?=\s+--background)/m,
    dark: /^\.dark,\n\[data-theme="dark"\] \{\n/m,
  },
} as const;

function block(css: string, opener: RegExp): string {
  const match = opener.exec(css);
  expect(match, `block ${opener}`).not.toBeNull();
  const found = must(match);
  const start = found.index + found[0].length;
  return css.slice(start, css.indexOf("\n}", start));
}

function declared(body: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of body.matchAll(/^\s*--([\w-]+):\s*(.+?);\s*$/gm)) map.set(m[1], m[2]);
  return map;
}

const NEUTRALS = ["background", "card", "popover", "muted", "foreground", "muted-foreground", "border", "input", "ring"];

describe.each(Object.entries(FILES))("%s", (file, openers) => {
  const css = readFileSync(path.join(root, file), "utf8");

  it("declares every sevenui-tokens variable with the registry value", () => {
    for (const mode of ["light", "dark"] as const) {
      const vars = declared(block(css, openers[mode]));
      const entries = Object.entries(must(tokenVars[mode]));
      expect(entries.length).toBeGreaterThan(0);
      for (const [key, value] of entries) expect(vars.get(key), `${mode} ${key}`).toBe(value);
    }
  });

  it("mirrors the sevenui-tokens @theme entries, focus utility and density rules", () => {
    for (const [key, value] of Object.entries(must(tokenVars.theme))) {
      expect(css, key).toContain(`${key}: ${value};`);
    }
    expect(css).toContain("@utility focus-ring");
    expect(css).toContain("outline: var(--focus-width) solid var(--focus-color, var(--brand));");
    expect(css).not.toMatch(/^\s*--focus-color:/m);
    expect(css).toMatch(/\[data-density="?compact"?\]/);
    expect(css).toContain("--focus-width: 1.5px;");
    expect(css).toContain("--control-h: 1.75rem;");
  });

  it("matches the theme item neutrals and ring", () => {
    for (const mode of ["light", "dark"] as const) {
      const vars = declared(block(css, openers[mode]));
      for (const key of NEUTRALS) expect(vars.get(key), `${mode} ${key}`).toBe(must(themeVars[mode])[key]);
    }
  });
});
