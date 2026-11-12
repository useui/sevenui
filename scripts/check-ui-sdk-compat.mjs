// Classifies every demo and gallery example against the UI SDK flavour and
// keeps packages/registry/ui-sdk-compat.json honest.
//
// The examples import `@/registry/base/ui/*`. A consumer who installed the UI
// SDK flavour has the flavour files under that alias and none of the libraries
// the flavour replaces. This script rebuilds exactly that view: it copies the
// flavour tree and the examples into a temporary project whose node_modules
// links every registry dependency EXCEPT the replaced ones, maps
// `@/registry/base/ui/*` to the flavour files, and typechecks all of it at once.
// Copies, not symlinks: a symlinked file resolves bare imports from its real
// location, where Base UI is installed, and the check would pass by accident.
//
// Each example is then:
//   ok             typechecks, no recorded behaviour difference;
//   differs        typechecks, a recorded difference (DIFFERS below) applies;
//   needs-variant  does not typecheck as a UI SDK consumer would see it.
//
//   node scripts/check-ui-sdk-compat.mjs           validate the committed manifest
//   node scripts/check-ui-sdk-compat.mjs --write   regenerate it
//
// Validation fails when an example has no entry, an entry has no example, or
// any classification changed, so the manifest cannot rot.

import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const REG = join(ROOT, "packages/registry");
const MANIFEST = join(REG, "ui-sdk-compat.json");
const WRITE = process.argv.includes("--write");

// Keep in step with REPLACED in scripts/ui-sdk-flavour.mjs.
const REPLACED = ["@base-ui/react", "react-day-picker", "embla-carousel-react", "react-resizable-panels"];
// Test tooling is not something an example may lean on.
const NOT_LINKED = new Set([...REPLACED, "typescript", "vitest", "jsdom", "@testing-library/react", "@testing-library/user-event"]);
const EXAMPLE_ROOTS = ["demos", "components"];

const posix = (p) => p.split(sep).join("/");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Recorded behaviour differences (guide §8). Each rule names the §8 row it
// comes from and applies to examples that import `primitive` and either are
// listed in `files` (checked by hand) or match `match`. A rule that applies to
// nothing, or lists an example that does not import its primitive, fails the
// check: it is stale.
// ---------------------------------------------------------------------------
const GUIDE = "docs/superpowers/plans/2026-11-13-ui-sdk-porting-guide.md §8";
const DIFFERS = [
  {
    primitive: "avatar",
    files: ["components/avatar/avatar-05.tsx"],
    reason: "the image is rendered at once, so its data-starting-style fade-in never runs",
    row: "avatar",
  },
  {
    primitive: "calendar",
    match: /\[&>button\]|_button/,
    reason: "styles the day's inner <button>, which the UI SDK day (a gridcell with a span) does not have",
    row: "calendar",
  },
  {
    primitive: "calendar",
    files: ["components/calendar/calendar-11.tsx"],
    reason: "pressing the selected date again does not call onSelect, so the chosen time slot is not reset",
    row: "calendar",
  },
  {
    primitive: "calendar",
    match: /<Calendar\b[^>]*?\banimate\b/,
    reason: "`animate` is ignored: no month transition",
    row: "calendar",
  },
  {
    primitive: "calendar",
    match: /\b(startMonth|endMonth)=/,
    reason: "startMonth/endMonth also make outside days beyond them unselectable",
    row: "calendar",
  },
  {
    primitive: "carousel",
    match: /\b(containScroll|duration|axis)\s*:/,
    reason: "embla options containScroll, duration or axis are ignored",
    row: "carousel",
  },
  {
    primitive: "carousel",
    match: /onKeyDownCapture/,
    reason: "a key-capture override no longer stops paging from the viewport",
    row: "carousel",
  },
  {
    primitive: "resizable",
    match: /data-\[separator|\[data-separator|\[data-panel\]/,
    reason: "styles react-resizable-panels' data-separator/data-panel attributes, which the flavour does not emit",
    row: "resizable",
  },
  {
    primitive: "toast",
    match: /swipeDirection|data-limited|data-\[limited/,
    reason: "per-toast swipeDirection is ignored and toasts over the limit wait unrendered (no data-limited)",
    row: "toast",
  },
  {
    primitive: "command",
    match: /./,
    reason: "the first item is highlighted once the input is used, not on mount (base sets autoHighlight=\"always\")",
    row: "command",
  },
  {
    primitive: "command",
    match: /item-press/,
    reason: "choosing an item never changes the query, so the `item-press` guard never fires",
    row: "command",
  },
  {
    primitive: "command",
    match: /<CommandItem\b[^>]*?aria-selected=/,
    reason: "UI SDK owns aria-selected on command items, so the example's own value is replaced",
    row: "command",
  },
  {
    primitive: "slider",
    match: /./,
    reason: "thumbs centre on their value, so at 0% and 100% half a thumb overhangs the track (base uses thumbAlignment=\"edge\")",
    row: "slider",
  },
  {
    primitive: "tooltip",
    match: /\b(trackCursorAxis|disableHoverablePopup)\b|<TooltipProvider\b[^>]*?\btimeout=/,
    reason: "trackCursorAxis, disableHoverablePopup or the provider timeout are ignored",
    row: "tooltip",
  },
  {
    primitive: "switch",
    match: /\buncheckedValue\b/,
    reason: "uncheckedValue is ignored, so Base UI's value for an unchecked switch is not submitted",
    row: "switch",
  },
  {
    primitive: "drawer",
    match: /\bsnapPoints\b|<Drawer\b[^>]*?\bswipeDirection=/,
    reason: "UI SDK's own swipe and snap physics replace Base UI's",
    row: "drawer",
  },
];

// ---------------------------------------------------------------------------
// 1. The consumer view.
// ---------------------------------------------------------------------------

const examples = EXAMPLE_ROOTS.flatMap((r) => walk(join(REG, r)))
  .map((f) => posix(relative(REG, f)))
  .sort();

const work = mkdtempSync(join(tmpdir(), "sevenui-ui-sdk-compat-"));
let ancestor = dirname(work);
while (ancestor !== dirname(ancestor)) {
  if (existsSync(join(ancestor, "node_modules"))) {
    console.error(`check-ui-sdk-compat: ${ancestor}/node_modules would leak packages into the consumer view`);
    process.exit(1);
  }
  ancestor = dirname(ancestor);
}

const errors = [];
let diagnostics;
let listed;
try {
  cpSync(join(REG, "registry/ui-sdk"), join(work, "registry/ui-sdk"), { recursive: true });
  for (const r of EXAMPLE_ROOTS) {
    cpSync(join(REG, r), join(work, r), { recursive: true, filter: (src) => statSync(src).isDirectory() || /\.tsx?$/.test(src) });
  }

  const modules = join(REG, "node_modules");
  const linked = [];
  for (const entry of readdirSync(modules)) {
    if (entry.startsWith(".")) continue;
    const names = entry.startsWith("@") ? readdirSync(join(modules, entry)).map((n) => `${entry}/${n}`) : [entry];
    for (const name of names) {
      if (NOT_LINKED.has(name)) continue;
      mkdirSync(dirname(join(work, "node_modules", name)), { recursive: true });
      symlinkSync(realpathSync(join(modules, name)), join(work, "node_modules", name), "dir");
      linked.push(name);
    }
  }

  // Controls. One must fail (a replaced library is really unresolvable); one
  // must pass only if `@/registry/base/ui/*` really is the flavour: the base
  // calendar exports no `DateRange`, the flavour calendar does.
  mkdirSync(join(work, "controls"));
  writeFileSync(join(work, "controls/replaced.tsx"), `import { Tabs } from "@base-ui/react/tabs";\nexport const control = Tabs;\n`);
  writeFileSync(
    join(work, "controls/flavour.tsx"),
    `import type { DateRange } from "@/registry/base/ui/calendar";\nexport const control: DateRange = { from: new Date(), to: undefined };\n`,
  );

  const base = JSON.parse(readFileSync(join(REG, "tsconfig.json"), "utf8")).compilerOptions;
  writeFileSync(
    join(work, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        ...base,
        paths: {
          "@/registry/base/ui/*": ["./registry/ui-sdk/ui/*"],
          "@/registry/base/hooks/*": ["./registry/ui-sdk/hooks/*"],
          "@/*": ["./*"],
        },
      },
      include: ["registry", ...EXAMPLE_ROOTS, "controls"],
    }),
  );

  let out;
  try {
    out = execFileSync(join(REG, "node_modules/.bin/tsc"), ["-p", join(work, "tsconfig.json"), "--pretty", "false", "--listFiles"], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    });
  } catch (e) {
    if (typeof e.stdout !== "string") throw e;
    out = e.stdout;
  }

  const realWork = realpathSync(work);
  const toRel = (p) => {
    for (const prefix of [realWork, work]) if (p.startsWith(`${prefix}/`)) return p.slice(prefix.length + 1);
    return p;
  };

  diagnostics = new Map();
  listed = [];
  let last = null;
  for (const line of out.split("\n")) {
    const m = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/);
    if (m) {
      const file = toRel(m[1].startsWith("/") ? m[1] : join(work, m[1]));
      last = { line: Number(m[2]), code: m[4], message: m[5] };
      if (!diagnostics.has(file)) diagnostics.set(file, []);
      diagnostics.get(file).push(last);
    } else if (line.startsWith("/")) {
      listed.push(toRel(line.trim()));
      last = null;
    } else if (last && line.startsWith("  ")) {
      last.message += ` ${line.trim()}`;
    } else if (line.trim()) {
      errors.push(`unparsed tsc output: ${line}`);
    }
  }

  // ---- the check has teeth --------------------------------------------------
  const control = diagnostics.get("controls/replaced.tsx") ?? [];
  if (!control.some((d) => d.code === "TS2307" && d.message.includes("@base-ui/react/tabs"))) {
    errors.push("positive control: controls/replaced.tsx imports @base-ui/react/tabs and was NOT reported; the replaced libraries are resolvable");
  }
  if (diagnostics.has("controls/flavour.tsx")) {
    errors.push(`positive control: controls/flavour.tsx failed, so @/registry/base/ui/* does not resolve to the flavour: ${JSON.stringify(diagnostics.get("controls/flavour.tsx"))}`);
  }
  // Every program file is either ours (the copies) or a linked dependency, and
  // none is the base tree or a replaced library.
  const leaked = listed.filter((f) => f.includes("/registry/base/") || REPLACED.some((r) => f.includes(`/node_modules/${r}/`) || f.includes(`/${r.replace("/", "+")}@`)));
  if (leaked.length > 0) errors.push(`the program reached base or replaced files:\n  ${leaked.slice(0, 10).join("\n  ")}`);
  const flavourUsed = listed.filter((f) => f.startsWith("registry/ui-sdk/ui/"));
  if (flavourUsed.length === 0) errors.push("no flavour file is in the program; the alias is not in effect");
  for (const f of examples) if (!listed.includes(f)) errors.push(`${f} is not in the program`);
  // The flavour itself must typecheck as a consumer sees it.
  for (const [file, ds] of diagnostics) {
    if (file.startsWith("registry/")) for (const d of ds) errors.push(`flavour does not typecheck: ${file}:${d.line} ${d.code} ${d.message}`);
    else if (!file.startsWith("controls/") && !examples.includes(file)) for (const d of ds) errors.push(`diagnostic outside the examples: ${file}:${d.line} ${d.code} ${d.message}`);
  }
  if (process.env.UI_SDK_COMPAT_DEBUG) {
    console.log(`linked: ${linked.join(", ")}`);
    console.log(`program: ${listed.length} files, ${flavourUsed.length} flavour files`);
    for (const [file, ds] of diagnostics) for (const d of ds) console.log(`${file}:${d.line} ${d.code} ${d.message}`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// 2. Classification.
// ---------------------------------------------------------------------------

const REPLACED_ROW = {
  "@base-ui/react": "tabs",
  "react-day-picker": "calendar",
  "embla-carousel-react": "carousel",
  "react-resizable-panels": "resizable",
};
const importsOf = (source) => new Set([...source.matchAll(/@\/registry\/base\/ui\/([a-z0-9-]+)/g)].map((m) => m[1]));

// What a file imports from a module, for a reason a reader can act on.
function importedNames(source, specifier) {
  const m = source.match(new RegExp(`import\\s+(type\\s+)?\\{([^}]*)\\}\\s+from\\s+["']${specifier.replace(/[/.]/g, "\\$&")}["']`));
  if (!m) return "";
  const names = m[2].split(",").map((n) => n.trim().replace(/^type\s+/, "")).filter(Boolean);
  return `${m[1] ? "the type " : ""}${names.join(", ")} `;
}

const used = DIFFERS.map(() => 0);
const items = {};
for (const file of examples) {
  const source = readFileSync(join(REG, file), "utf8");
  const primitives = importsOf(source);
  const reasons = [];
  for (const d of diagnostics.get(file) ?? []) {
    const missing = d.code === "TS2307" ? d.message.match(/Cannot find module '([^']+)'/)?.[1] : undefined;
    if (missing) {
      const root = REPLACED.find((r) => missing === r || missing.startsWith(`${r}/`));
      reasons.push({
        reason: `imports ${importedNames(source, missing)}from "${missing}", which a UI SDK project does not have`,
        ...(root ? { ref: `${GUIDE} ${REPLACED_ROW[root]}` } : {}),
      });
    } else {
      reasons.push({ reason: `${d.code} at line ${d.line}: ${d.message}` });
    }
  }
  const typechecks = reasons.length === 0;
  DIFFERS.forEach((rule, i) => {
    if (!primitives.has(rule.primitive)) return;
    if (rule.files ? !rule.files.includes(file) : !rule.match.test(source)) return;
    used[i]++;
    reasons.push({ reason: rule.reason, ref: `${GUIDE} ${rule.row}` });
  });
  const unique = reasons.filter((r, i) => reasons.findIndex((o) => o.reason === r.reason) === i);
  items[file.replace(/\.tsx$/, "")] = typechecks
    ? unique.length === 0
      ? { status: "ok" }
      : { status: "differs", reasons: unique }
    : { status: "needs-variant", reasons: unique };
}
DIFFERS.forEach((rule, i) => {
  if (used[i] === 0) errors.push(`DIFFERS rule for ${rule.primitive} ("${rule.reason}") applies to no example; it is stale`);
  for (const f of rule.files ?? []) {
    if (!examples.includes(f)) errors.push(`DIFFERS rule lists ${f}, which does not exist`);
    else if (!importsOf(readFileSync(join(REG, f), "utf8")).has(rule.primitive)) errors.push(`DIFFERS rule lists ${f}, which does not import ${rule.primitive}`);
  }
});

const STATUSES = ["ok", "differs", "needs-variant"];
const count = (keys) => Object.fromEntries(STATUSES.map((s) => [s, keys.filter((k) => items[k].status === s).length]));
const keys = Object.keys(items);
const folders = {};
for (const folder of [...new Set(keys.map((k) => k.split("/").slice(0, 2).join("/")))].sort()) {
  folders[folder] = count(keys.filter((k) => k.startsWith(`${folder}/`)));
}
const manifest = {
  description:
    "How each demo and gallery example fares against the UI SDK flavour, as a project that installed the flavour sees it. Generated by `node scripts/check-ui-sdk-compat.mjs --write`; `pnpm check:ui-sdk-compat` fails when it is stale.",
  statuses: {
    ok: "typechecks, no recorded behaviour difference",
    differs: "typechecks, a recorded behaviour or visual difference applies",
    "needs-variant": "does not typecheck against the flavour without the replaced libraries",
  },
  totals: count(keys),
  folders,
  items,
};
const text = `${JSON.stringify(manifest, null, 2)}\n`;

if (errors.length > 0) {
  for (const e of errors) console.error(`check-ui-sdk-compat: ${e}`);
  process.exit(1);
}

const summary = `${keys.length} examples: ${STATUSES.map((s) => `${manifest.totals[s]} ${s}`).join(", ")}`;
if (WRITE) {
  writeFileSync(MANIFEST, text);
  console.log(`check-ui-sdk-compat: wrote ${posix(relative(ROOT, MANIFEST))} (${summary})`);
  process.exit(0);
}
if (!existsSync(MANIFEST)) {
  console.error(`check-ui-sdk-compat: ${posix(relative(ROOT, MANIFEST))} is missing; run node scripts/check-ui-sdk-compat.mjs --write`);
  process.exit(1);
}
const committed = JSON.parse(readFileSync(MANIFEST, "utf8"));
if (readFileSync(MANIFEST, "utf8") !== text) {
  const before = committed.items ?? {};
  const all = [...new Set([...Object.keys(before), ...keys])].sort();
  for (const k of all) {
    if (!(k in before)) console.error(`check-ui-sdk-compat: ${k} has no manifest entry (${items[k].status})`);
    else if (!(k in items)) console.error(`check-ui-sdk-compat: ${k} is in the manifest but no such example exists`);
    else if (JSON.stringify(before[k]) !== JSON.stringify(items[k])) {
      console.error(`check-ui-sdk-compat: ${k} changed: ${before[k].status} -> ${items[k].status}`);
    }
  }
  console.error("check-ui-sdk-compat: the manifest is stale; review the changes above, then run node scripts/check-ui-sdk-compat.mjs --write");
  process.exit(1);
}
console.log(`check-ui-sdk-compat: ok (${summary}; ${listed.filter((f) => f.startsWith("registry/ui-sdk/")).length} flavour files in the program, both controls held)`);
