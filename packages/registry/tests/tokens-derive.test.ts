import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { must } from "./helpers/must";

const registry = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, "../registry.json"), "utf8"),
) as { items: { name: string; cssVars?: Record<string, Record<string, string>> }[] };

const tokens = registry.items.find((i) => i.name === "sevenui-tokens");
const theme = must(registry.items.find((i) => i.name === "theme"));

describe("sevenui-tokens derivation", () => {
  it("derives every surface and hairline token from shadcn variables", () => {
    const shadcnKeys = new Set(Object.keys(must(theme.cssVars).light));
    for (const mode of ["light", "dark"] as const) {
      const vars = tokens?.cssVars?.[mode] ?? {};
      const derived = Object.entries(vars).filter(([key]) => /^(surface-|hairline)/.test(key));
      expect(derived.length, mode).toBe(6);
      for (const [key, value] of derived) {
        const refs = [...value.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1]);
        expect(refs.some((ref) => shadcnKeys.has(ref)), `${mode} ${key}`).toBe(true);
        const stripped = value.replace(/var\(--[a-z0-9-]+\)/g, "").replace(/color-mix\(in oklch,/g, "");
        expect(stripped, `${mode} ${key} literal colour`).not.toMatch(/#|oklch\(|rgb\(|hsl\(/);
      }
    }
  });
});
