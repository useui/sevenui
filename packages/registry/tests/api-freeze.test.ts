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
