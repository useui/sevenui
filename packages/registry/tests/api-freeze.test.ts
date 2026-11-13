import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { importsReplaced } from "../../../scripts/ui-sdk-flavour.mjs";
import baseline from "./__fixtures__/api-exports.json";

const uiDir = path.resolve(import.meta.dirname, "../registry/base/ui");
const modules = Object.keys(baseline).sort();
// Each case imports a primitive for the first time, which transforms it and its
// libraries cold; calendar (react-day-picker) alone has taken 5.7-7.5s under a
// full run, past vitest's 5s default, failing on load time rather than on an
// export. The assertions are unchanged.
const IMPORT_TIMEOUT = 30_000;

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
  }, IMPORT_TIMEOUT);
});

// The UI SDK flavour exports exactly what the base primitive exports, so the
// same demo and gallery source works against either flavour. Every primitive is
// ported (scripts/check-registry.mjs requires it), and "ported" is the one rule
// in scripts/ui-sdk-flavour.mjs: the file imports nothing UI SDK replaces, in
// any import form.
const flavourDir = path.resolve(import.meta.dirname, "../registry/ui-sdk/ui");
const portedFlavours = modules.filter((name) => {
  const file = path.join(flavourDir, `${name}.tsx`);
  return fs.existsSync(file) && !importsReplaced(fs.readFileSync(file, "utf8"));
});

describe("api freeze: ui-sdk flavour", () => {
  // Asserted, so a primitive that stops counting as ported fails here instead
  // of silently leaving the comparison below.
  it("every primitive has a ported flavour file", () => {
    expect(modules.filter((name) => !portedFlavours.includes(name))).toEqual([]);
  });

  it.each(portedFlavours)(
    "%s exports the same names as base",
    async (name) => {
      const base = await import(/* @vite-ignore */ path.join(uiDir, `${name}.tsx`));
      const port = await import(/* @vite-ignore */ path.join(flavourDir, `${name}.tsx`));
      expect(Object.keys(port).sort()).toEqual(Object.keys(base).sort());
    },
    IMPORT_TIMEOUT,
  );
});
