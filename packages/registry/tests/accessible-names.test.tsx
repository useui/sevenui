import * as React from "react";
import fs from "node:fs";
import path from "node:path";
import { act, cleanup, render } from "@testing-library/react";
import { computeAccessibleName } from "dom-accessibility-api";
import { describe, expect, it } from "vitest";

import { flavour, isUiSdk } from "./helpers/flavour";

// Accessible-name parity: every docs demo renders in both flavours, and the
// (role, name) pairs of its interactive elements must be the same. Both
// projects compare against one fixture written from the base flavour
// (UPDATE_ACCESSIBLE_NAMES=1 with --project base), so a control that loses
// or changes its name in one flavour fails here. The demos' imports (such as
// @/registry/base/ui/button) resolve to the flavour under test, which is also
// what puts this file in the ui-sdk project.

const INTERACTIVE = [
  "button",
  "checkbox",
  "combobox",
  // A calendar day in the flavour (guide §8); only focusable cells count.
  "gridcell",
  "link",
  "listbox",
  "menuitem",
  "option",
  "radio",
  "searchbox",
  "slider",
  "spinbutton",
  "switch",
  "tab",
  "textbox",
];

// What some demos need that jsdom lacks (the sidebar and carousel test files
// stub the same).
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;
Element.prototype.getAnimations ??= () => [];
window.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
} as unknown as typeof IntersectionObserver;

const demos = import.meta.glob<{ default: React.ComponentType }>("../demos/**/*.tsx");
const variants = import.meta.glob<{ default: React.ComponentType }>(
  "../registry/ui-sdk/examples/demos/**/*.tsx",
);
const fixturePath = path.join(import.meta.dirname, "__fixtures__", "accessible-names.json");

// Differences recorded on purpose (guide §8), per demo: a normalisation both
// flavours' pairs go through before they are compared.
const dayName = (pair: string) =>
  pair
    .replace(/^(button|gridcell): /, "day: ")
    .replace(/(\d+)(st|nd|rd|th),/, "$1,")
    .replace(/, selected$/, "");
const KNOWN: Record<string, { normalize: (pairs: string[]) => string[]; why: string }> = {
  "calendar-demo": {
    normalize: (pairs) => pairs.map(dayName),
    why: "a day is a focusable gridcell named \"Friday, June 12, 2026\", not a button named \"Friday, June 12th, 2026, selected\" (guide §8 calendar)",
  },
  "calendar-range": {
    normalize: (pairs) => pairs.map(dayName),
    why: "as calendar-demo",
  },
  "input-otp-demo": {
    normalize: (pairs) => [...new Set(pairs.map((pair) => pair.replace(/ Digit \d+ of \d+$/, " ")))],
    why: "one native input over the slots instead of one per slot (guide §8 input-otp); the demo names neither",
  },
};

function pairsOf(root: HTMLElement): string[] {
  const pairs: string[] = [];
  for (const element of root.querySelectorAll<HTMLElement>("*")) {
    const role = element.getAttribute("role") ?? implicitRole(element);
    if (!role || !INTERACTIVE.includes(role)) continue;
    if (role === "gridcell" && !element.hasAttribute("tabindex")) continue;
    if (element.closest("[hidden], [aria-hidden=true], [inert]")) continue;
    if (element instanceof HTMLInputElement && element.type === "hidden") continue;
    pairs.push(`${role}: ${computeAccessibleName(element).replace(/\s+/g, " ").trim()}`);
  }
  return pairs.sort();
}

function implicitRole(element: HTMLElement): string | undefined {
  const tag = element.tagName.toLowerCase();
  if (tag === "button") return "button";
  if (tag === "a" && element.hasAttribute("href")) return "link";
  if (tag === "select") return element.hasAttribute("multiple") ? "listbox" : "combobox";
  if (tag === "textarea") return "textbox";
  if (tag === "input") {
    const type = (element.getAttribute("type") ?? "text").toLowerCase();
    if (type === "checkbox") return "checkbox";
    if (type === "radio") return "radio";
    if (type === "range") return "slider";
    if (type === "number") return "spinbutton";
    if (type === "search") return "searchbox";
    if (["text", "email", "tel", "url", "password"].includes(type)) {
      return type === "password" ? undefined : "textbox";
    }
  }
  return undefined;
}

async function namesOf(file: string) {
  const name = path.basename(file, ".tsx");
  const primitive = path.basename(path.dirname(file));
  const variant = `../registry/ui-sdk/examples/demos/${primitive}/${name}.tsx`;
  const load = isUiSdk && variants[variant] ? variants[variant] : demos[file];
  const { default: Demo } = await load();
  const { container } = render(<Demo />);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  const pairs = pairsOf(container);
  cleanup();
  return pairs;
}

describe("accessible names in the docs demos", () => {
  const files = Object.keys(demos).sort();
  const fixture: Record<string, string[]> = fs.existsSync(fixturePath)
    ? JSON.parse(fs.readFileSync(fixturePath, "utf8"))
    : {};
  const update = process.env.UPDATE_ACCESSIBLE_NAMES === "1" && flavour === "base";

  it("covers every demo", () => {
    expect(files.length).toBeGreaterThan(100);
    if (!update) expect(Object.keys(fixture).sort()).toEqual(files.map((f) => path.basename(f, ".tsx")).sort());
  });

  it.each(files)("%s", async (file) => {
    const name = path.basename(file, ".tsx");
    const pairs = await namesOf(file);
    if (update) {
      fixture[name] = pairs;
      fs.writeFileSync(fixturePath, `${JSON.stringify(fixture, Object.keys(fixture).sort(), 2)}\n`);
      return;
    }
    const normalize = KNOWN[name]?.normalize ?? ((list: string[]) => list);
    expect(normalize(pairs).sort()).toEqual(normalize(fixture[name] ?? []).sort());
  });
});
