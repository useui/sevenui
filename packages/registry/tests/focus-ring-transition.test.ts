import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// An element that draws the focus ring must not transition outline-color:
// the ring would start at the inherited text colour and fade to brand. In
// Tailwind v4, `transition`, `transition-colors` and `transition-all` all
// include outline-color; an explicit `transition-[…]` list is fine unless it
// names outline or all.

const uiDir = path.resolve(import.meta.dirname, "../registry/base/ui");

/** Index just past the `(…)` group opening at `open`, skipping strings and comments. */
function matchParen(src: string, open: number): number {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      i++;
      while (i < src.length && src[i] !== ch) {
        if (src[i] === "\\") i++;
        i++;
      }
    } else if (ch === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
    } else if (ch === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i + 2) + 1;
    } else if (ch === "(") {
      depth++;
    } else if (ch === ")") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return src.length;
}

function stringLiterals(src: string): string[] {
  return [...src.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)].map((m) => m[1]);
}

/**
 * Class lists that land on one element: every `cn(…)` / `cva(…)` call, plus
 * any focus-ring string literal outside those calls.
 */
function classUnits(src: string): string[] {
  const units: string[] = [];
  const covered: Array<[number, number]> = [];
  for (const m of src.matchAll(/\b(?:cn|cva)\(/g)) {
    const start = (m.index ?? 0) + m[0].length - 1;
    if (covered.some(([a, b]) => start > a && start < b)) continue;
    const end = matchParen(src, start);
    covered.push([start, end]);
    units.push(stringLiterals(src.slice(start, end)).join(" "));
  }
  for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) {
    const at = m.index ?? 0;
    if (covered.some(([a, b]) => at > a && at < b)) continue;
    units.push(m[1]);
  }
  return units;
}

const ringToken = /(^|:)focus-ring$/;
function fadesRing(token: string): boolean {
  const utility = token.split(":").pop() ?? "";
  if (/^(transition|transition-colors|transition-all)!?$/.test(utility)) return true;
  const list = /^transition-\[(.*)\]!?$/.exec(utility);
  return list ? /outline|(^|,)all(,|$)/.test(list[1]) : false;
}

function offenders(src: string): string[] {
  return classUnits(src)
    .map((unit) => unit.split(/\s+/).filter(Boolean))
    .filter((tokens) => tokens.some((t) => ringToken.test(t)))
    .flatMap((tokens) => tokens.filter(fadesRing));
}

const files = fs
  .readdirSync(uiDir)
  .filter((f) => f.endsWith(".tsx"))
  .sort();

describe("focus ring does not fade in", () => {
  it("flags a ring element that transitions colours (positive control)", () => {
    const src = `cn("outline-none transition-colors", "focus-visible:focus-ring")`;
    expect(offenders(src)).toEqual(["transition-colors"]);
    expect(offenders(`cva("transition-all has-[>a:focus-visible]:focus-ring")`)).toEqual([
      "transition-all",
    ]);
    expect(offenders(`className="transition focus-within:focus-ring"`)).toEqual(["transition"]);
    expect(
      offenders(`cn("transition-[outline-color,background-color] focus-visible:focus-ring")`),
    ).toEqual(["transition-[outline-color,background-color]"]);
    expect(
      offenders(`cn("transition-[background-color,border-color] focus-visible:focus-ring")`),
    ).toEqual([]);
    expect(offenders(`cn("transition-colors hover:bg-muted")`)).toEqual([]);
  });

  it("scans the ring-carrying class lists of the ui sources", () => {
    const ringUnits = files.flatMap((f) =>
      classUnits(fs.readFileSync(path.join(uiDir, f), "utf8")).filter((u) =>
        u.split(/\s+/).some((t) => ringToken.test(t)),
      ),
    );
    // The scan must actually reach the ring elements, not pass on nothing.
    expect(files.length).toBeGreaterThanOrEqual(66);
    expect(ringUnits.length).toBeGreaterThan(40);
  });

  it.each(files)("%s keeps outline-color out of ring transitions", (file) => {
    const src = fs.readFileSync(path.join(uiDir, file), "utf8");
    expect(offenders(src)).toEqual([]);
  });
});
