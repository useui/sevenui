import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import baseline from "./__fixtures__/api-exports.json";

const uiDir = path.resolve(import.meta.dirname, "../registry/base/ui");
const modules = Object.keys(baseline).sort();

describe("api freeze", () => {
  it("fixture covers all 66 primitives", () => {
    expect(modules).toHaveLength(66);
    const files = fs
      .readdirSync(uiDir)
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => f.replace(/\.tsx$/, ""))
      .sort();
    expect(files).toEqual(expect.arrayContaining(modules));
  });

  it.each(modules)("%s keeps every export", async (name) => {
    const file = path.join(uiDir, `${name}.tsx`);
    expect(fs.existsSync(file), `${name}.tsx was removed or renamed`).toBe(true);
    const mod = await import(/* @vite-ignore */ file);
    const current = Object.keys(mod);
    const expected = (baseline as Record<string, string[]>)[name];
    const missing = expected.filter((e) => !current.includes(e));
    expect(missing, `${name} lost exports`).toEqual([]);
  });
});

// The UI SDK flavour exports exactly what the base primitive exports, so the
// same demo and gallery source works against either flavour. A flavour file is
// held to this once it is ported: it imports nothing UI SDK replaces (same
// rule as REPLACED_IMPORT in scripts/ui-sdk-flavour.mjs).
const flavourDir = path.resolve(import.meta.dirname, "../registry/ui-sdk/ui");
const REPLACED_IMPORT =
  /from\s+["'](@base-ui\/react|react-day-picker|embla-carousel-react|react-resizable-panels)(?:\/[^"']*)?["']/;
const portedFlavours = modules.filter((name) => {
  const file = path.join(flavourDir, `${name}.tsx`);
  return fs.existsSync(file) && !REPLACED_IMPORT.test(fs.readFileSync(file, "utf8"));
});

describe("api freeze: ui-sdk flavour", () => {
  it.each(portedFlavours)("%s exports the same names as base", async (name) => {
    const base = await import(/* @vite-ignore */ path.join(uiDir, `${name}.tsx`));
    const port = await import(/* @vite-ignore */ path.join(flavourDir, `${name}.tsx`));
    expect(Object.keys(port).sort()).toEqual(Object.keys(base).sort());
  });
});
