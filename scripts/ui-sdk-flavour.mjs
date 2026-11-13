// The UI SDK flavour of the primitives: registry/ui-sdk/ is a sibling of
// registry/base/, and its registry is derived from the root registry.json and
// from each flavour file's own imports, so porters only ever edit their own
// registry/ui-sdk/ui/<name>.tsx.
//
// The flavour builds on UI SDK wherever UI SDK has the component, so a ported
// flavour file imports none of REPLACED: not Base UI, and not the third-party
// libraries UI SDK replaces (calendar, carousel, resizable). chart keeps
// recharts and message-scroller/questionnaire keep @shadcn/react: UI SDK has
// no equivalent.
//
// A primitive is in one of three states, read from the files themselves:
//   pending  its flavour file is the untouched seed (the base file with its
//            specifiers retargeted, kept so imports resolve) or, for a library
//            that gets no seed, is absent
//   ported   its flavour file imports nothing in REPLACED (a base file that
//            imports nothing in REPLACED is a "mirror": ported by being an
//            exact retargeted copy, unless it is in UI_SDK_PORTS: plain markup
//            in base that the flavour builds on a UI SDK component, so its
//            file must import @ui-sdk/react, and its seed copy is pending)
//   blocked  ported, but a registryDependency is not, so it stays out of the
//            published registry until that dependency is ported
//
// The demos and gallery examples are written once, against
// `@/registry/base/ui/*`. Their flavour source is the overlay file at the
// mirrored path, registry/ui-sdk/examples/{demos,components}/<primitive>/<file>.tsx,
// if one exists (a variant: the same example with only what the flavour
// requires changed), otherwise the original file. The flavour example
// registries (/r/ui-sdk/demo/*, /r/ui-sdk/component/*) and the generated
// example tree are derived from that source with its primitive imports
// retargeted to `@/registry/ui-sdk/`:
//   packages/registry/.generated/ui-sdk/{demos,components}/<primitive>/<file>.tsx
//   packages/registry/.generated/ui-sdk/{demos,components}/registry.json
// Both are git-ignored build output; the docs site renders its flavour
// previews from the tree.
//
//   node scripts/ui-sdk-flavour.mjs build     write packages/registry/registry.ui-sdk.json
//                                             and the generated example tree
//   node scripts/ui-sdk-flavour.mjs examples  write the generated example tree only
//   node scripts/ui-sdk-flavour.mjs sync      re-seed pending files and mirrors from base
//   node scripts/ui-sdk-flavour.mjs review <kind>/<primitive>/<file>.tsx ...
//                                             record that each named variant was
//                                             reviewed against its original as it is now
//   node scripts/ui-sdk-flavour.mjs status    list ported, blocked and pending primitives
//                                             and the example totals (--strict exits 1
//                                             while any primitive remains)

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const REGISTRY_ROOT = join(REPO, "packages/registry");
export const FLAVOUR_REGISTRY = join(REGISTRY_ROOT, "registry.ui-sdk.json");
export const SITE = "https://sevenui.dev/r";
export const FLAVOUR_URL = /^https:\/\/sevenui\.dev\/r\/ui-sdk\/([a-z0-9-]+)\.json$/;

// Items every flavour shares: never duplicated under /r/ui-sdk/.
export const SHARED_ITEMS = new Set(["theme", "sevenui-tokens", "animations"]);

// Example source roots (under packages/registry) -> their /r/ route segment.
export const EXAMPLE_KINDS = { demos: "demo", components: "component" };
export const OVERLAY_ROOT = join(REGISTRY_ROOT, "registry/ui-sdk/examples");
export const GENERATED_ROOT = join(REGISTRY_ROOT, ".generated/ui-sdk");
// A variant is a copy of its original with only what the flavour needs
// changed, so an edit to the original does not reach it by itself. This lock
// records, per variant, the hash of the original it was last reviewed
// against; when the original changes, every check fails until the change is
// carried into the variant and `review` records the new hash. It lives
// outside the overlay tree, so nothing about it is published.
export const VARIANT_LOCK = join(REGISTRY_ROOT, "ui-sdk-variants.lock.json");
export const hashSource = (source) => `sha256-${createHash("sha256").update(source).digest("hex")}`;
// Examples that cannot exist in the flavour, as "<route>/<name>": reason.
// They are left out of /r/ui-sdk/{demo,component}/ and the generated tree,
// and check-registry prints each one. Every example has a flavour today.
export const EXCLUDED_EXAMPLES = {};

// Package -> whether a pending file may be a seed copy. The third-party
// wrappers get no seed: their port is a rewrite, not an edit of a copy.
export const REPLACED = {
  "@base-ui/react": { seed: true },
  "react-day-picker": { seed: false },
  "embla-carousel-react": { seed: false },
  "react-resizable-panels": { seed: false },
};
// Plain markup in base that UI SDK ships a component for (guide §9.4): these
// are real ports, not mirrors. pagination stays a mirror: UI SDK's is stateful
// and cannot keep the base API.
export const UI_SDK_PORTS = new Set(["label", "textarea", "input-group"]);

// Every way a module can name another one: `import … from "x"`, `import type
// … from "x"`, `export … from "x"`, a side-effect `import "x"`, a dynamic
// `import("x")` (also with a template literal, and as `typeof import("x")`),
// `require("x")` (also TypeScript's `import x = require("x")`) and a
// `/// <reference types="x" />`. A rule that recognised only `from "x"` let a
// file with `await import("@base-ui/react/tabs")` count as ported.
// Group 2 is the specifier. A template literal is only valid after
// `import(`, so prose in comments ("from `items`") is not read as an import.
const SPECIFIER = String.raw`(?:\bfrom|\bimport|\brequire|<reference\s+types\s*=)\s*\(?\s*(["']|(?<=\bimport\s*\(\s*)\x60)`;
const specifierRegExp = (body) => new RegExp(`${SPECIFIER}(${body})\\1`, "g");
const REPLACED_NAMES = String.raw`@base-ui\/react|react-day-picker|embla-carousel-react|react-resizable-panels`;
// The one definition of "imports something UI SDK replaces"; group 2 is the
// specifier. TypeScript callers import importsReplaced, typed by
// scripts/ui-sdk-flavour.d.mts; packages/registry/vitest.config.ts and
// tests/api-freeze.test.ts must use it rather than keep a copy of the rule.
export const REPLACED_IMPORT = specifierRegExp(String.raw`(?:${REPLACED_NAMES})(?:\/[^"'\x60]*)?`);
// A bare package specifier: not relative, not absolute, not the `@/` alias,
// not a `node:` builtin.
const PACKAGE_IMPORT = specifierRegExp(String.raw`(?![./]|@\/|node:)(?:@[^"'\x60/\s]+\/)?[^"'\x60/\s]+(?:\/[^"'\x60\s]*)?`);

// Base UI names a few primitives differently; descriptions follow UI SDK.
const PRIMITIVE_NAMES = {
  "Preview Card": "Hover Card",
  OTPField: "OTP Input",
  "Number Field": "Number Input",
  "Toggle Group": "Toggle",
  Autocomplete: "Command",
};
const DESCRIPTION_OVERRIDES = {
  direction:
    "Sets the reading direction for RTL support; UI SDK components read it from the page.",
  popover:
    "Displays rich content in the top layer, positioned relative to an anchor element, built on the UI SDK Popover component.",
};

// The one-time setup message. The shadcn CLI prints an item's `docs` once for
// every item it resolves, dependencies included, so it lives on one flavour-only
// item, SETUP_ITEM, that every item importing UI SDK depends on: one install
// prints it once (checked with shadcn 4.19.1: four times for dialog, select and
// tooltip when each item carried it, once this way).
export const SETUP_ITEM = "ui-sdk-setup";
export const LAYER_DOCS = [
  'UI SDK keeps its runtime CSS in a cascade layer named ui-sdk. Put `@layer ui-sdk;` on the first line of your global CSS file, above `@import "tailwindcss"`. UI SDK normally inserts its styles first, so a default setup also works without the line; it keeps your utilities winning when UI SDK\'s styles end up after yours (for example under a Content Security Policy without a nonce, where they become constructed stylesheets), where popups such as dialogs would lose their padding and background.',
  "SevenUI's UI SDK flavour is built and tested against @ui-sdk/react and @ui-sdk/core 0.1.0-beta.1. pnpm, yarn and bun save that exact version; npm saves ^0.1.0-beta.1, which also accepts later betas, so pin it: npm install --save-exact @ui-sdk/react@0.1.0-beta.1 @ui-sdk/core@0.1.0-beta.1",
].join("\n\n");

export const retarget = (source) =>
  source.replaceAll("@/registry/base/", "@/registry/ui-sdk/");
export const replacedImports = (source) =>
  [...new Set([...source.matchAll(REPLACED_IMPORT)].map((m) => m[2].match(new RegExp(REPLACED_NAMES))[0]))];
/** Whether a source imports, in any form, a library UI SDK replaces. */
export const importsReplaced = (source) => replacedImports(source).length > 0;
const seedable = (base) => replacedImports(base).every((name) => REPLACED[name].seed);

const read = (path) => readFileSync(path, "utf8");
const loadJson = (path) => JSON.parse(read(path));

const flavourPath = (basePath) => basePath.replace(/^registry\/base\//, "registry/ui-sdk/");

function packageName(specifier) {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

export function importedPackages(source) {
  const names = new Set();
  for (const match of source.matchAll(PACKAGE_IMPORT)) names.add(packageName(match[2]));
  return names;
}

function describe(item) {
  if (DESCRIPTION_OVERRIDES[item.name]) return DESCRIPTION_OVERRIDES[item.name];
  if (!item.description) return item.description;
  return item.description.replace(
    /the Base UI (.+?) primitive/g,
    (_, name) => `the UI SDK ${PRIMITIVE_NAMES[name] ?? name} component`,
  );
}

/**
 * Reads the root registry, the base tree and the flavour tree, and returns the
 * state of every primitive plus the flavour registry built from the ported,
 * unblocked ones. `problems` lists everything the check must fail on.
 */
export function readFlavour() {
  const root = loadJson(join(REGISTRY_ROOT, "registry.json"));
  const pkg = loadJson(join(REGISTRY_ROOT, "package.json"));
  const ranges = { ...pkg.devDependencies, ...pkg.dependencies };
  const uiItems = root.items.filter((i) => i.type === "registry:ui");
  const uiNames = new Set(uiItems.map((i) => i.name));
  const problems = [];
  const state = new Map();
  const sources = new Map();

  for (const item of uiItems) {
    let status = "ported";
    const files = [];
    const uiSdkPort = UI_SDK_PORTS.has(item.name);
    const mirror =
      !uiSdkPort &&
      (item.files ?? []).every(
        (f) => replacedImports(read(join(REGISTRY_ROOT, f.path))).length === 0,
      );
    for (const file of item.files ?? []) {
      const base = read(join(REGISTRY_ROOT, file.path));
      const path = flavourPath(file.path);
      const abs = join(REGISTRY_ROOT, path);
      files.push({ ...file, path });
      if (!existsSync(abs)) {
        if (seedable(base)) {
          problems.push(`${item.name}: missing flavour file ${path} (run "node scripts/ui-sdk-flavour.mjs sync")`);
        }
        status = "pending";
        continue;
      }
      const source = read(abs);
      sources.set(path, source);
      const seed = retarget(base);
      const replaced = replacedImports(source);
      if (replaced.length > 0) {
        if (!seedable(base)) {
          problems.push(
            `${item.name}: ${path} imports ${replaced.join(", ")}; the flavour builds this primitive on UI SDK, so it gets no seed copy (delete it, or finish the port)`,
          );
        } else if (source !== seed) {
          problems.push(
            `${item.name}: ${path} still imports ${replaced.join(", ")} but is not the base seed; finish the port or run "node scripts/ui-sdk-flavour.mjs sync"`,
          );
        }
        status = "pending";
      } else if (uiSdkPort) {
        if (source === seed) {
          status = "pending";
        } else if (!importedPackages(source).has("@ui-sdk/react")) {
          problems.push(
            `${item.name}: ${path} must be built on a UI SDK component (it is a UI SDK port, not a mirror), but imports nothing from @ui-sdk/react; finish the port or run "node scripts/ui-sdk-flavour.mjs sync"`,
          );
        }
      } else if (replacedImports(base).length === 0 && source !== seed) {
        problems.push(
          `${item.name}: ${path} must stay a retargeted copy of ${file.path} (it imports nothing UI SDK replaces); run "node scripts/ui-sdk-flavour.mjs sync"`,
        );
      }
      if (/@\/registry\/base\//.test(source)) {
        problems.push(`${item.name}: ${path} imports from @/registry/base/; flavour files import @/registry/ui-sdk/`);
      }
    }
    state.set(item.name, { item, files, status, mirror });
  }

  const regDepsOf = (entry) => {
    const deps = new Set();
    for (const dep of entry.item.registryDependencies ?? []) {
      const name = dep.match(/\/r\/([a-z0-9-]+)\.json$/)?.[1];
      deps.add(name && uiNames.has(name) ? `${SITE}/ui-sdk/${name}.json` : dep);
    }
    for (const file of entry.files) {
      for (const m of (sources.get(file.path) ?? "").matchAll(/@\/registry\/ui-sdk\/ui\/([a-z0-9-]+)/g)) {
        if (m[1] !== entry.item.name) deps.add(`${SITE}/ui-sdk/${m[1]}.json`);
      }
    }
    // Keep shared items last, as the root registry does.
    return [...deps].sort((a, b) => Number(!FLAVOUR_URL.test(a)) - Number(!FLAVOUR_URL.test(b)));
  };

  // Blocked spreads: an item depending on a blocked item is blocked too.
  let changed = true;
  while (changed) {
    changed = false;
    for (const entry of state.values()) {
      if (entry.status !== "ported") continue;
      const waiting = regDepsOf(entry)
        .map((d) => d.match(FLAVOUR_URL)?.[1])
        .filter((n) => n && state.get(n)?.status !== "ported");
      if (waiting.length) {
        entry.status = "blocked";
        entry.waitingOn = waiting;
        changed = true;
      }
    }
  }

  const items = [];
  for (const entry of state.values()) {
    if (entry.status !== "ported") continue;
    const packages = new Set();
    for (const file of entry.files) {
      for (const name of importedPackages(sources.get(file.path) ?? "")) packages.add(name);
    }
    packages.delete("react");
    packages.delete("react-dom");
    if (packages.has("@ui-sdk/react")) packages.add("@ui-sdk/core");
    const dependencies = [...packages].sort().map((name) => {
      if (!ranges[name]) {
        problems.push(`${entry.item.name}: imports "${name}", which packages/registry/package.json does not declare`);
        return name;
      }
      return `${name}@${ranges[name]}`;
    });
    const { name, type, title, cssVars, css } = entry.item;
    // shadcn can only append CSS, and a late `@layer ui-sdk;` cannot order the
    // layer below Tailwind's, so the install prints the one manual step.
    const usesUiSdk = packages.has("@ui-sdk/react");
    items.push({
      name,
      type,
      title,
      description: describe(entry.item),
      ...(dependencies.length ? { dependencies } : {}),
      registryDependencies: [...(usesUiSdk ? [`${SITE}/ui-sdk/${SETUP_ITEM}.json`] : []), ...regDepsOf(entry)],
      files: entry.files,
      ...(cssVars ? { cssVars } : {}),
      ...(css ? { css } : {}),
    });
  }

  if (items.some((i) => i.registryDependencies.includes(`${SITE}/ui-sdk/${SETUP_ITEM}.json`))) {
    items.push({
      name: SETUP_ITEM,
      type: "registry:lib",
      title: "UI SDK setup",
      description: "The one-time setup of the UI SDK flavour, printed on install: the cascade layer line and the exact UI SDK version.",
      registryDependencies: [],
      files: [],
      docs: LAYER_DOCS,
    });
  }
  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "sevenui-ui-sdk",
    homepage: "https://sevenui.dev",
    items,
  };
  const names = (status) => [...state.values()].filter((e) => e.status === status).map((e) => e.item.name);
  return {
    registry,
    state,
    ported: names("ported"),
    blocked: [...state.values()].filter((e) => e.status === "blocked"),
    pending: names("pending"),
    mirrors: [...state.values()].filter((e) => e.mirror).map((e) => e.item.name),
    problems,
  };
}

const posix = (p) => p.split(sep).join("/");
function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

const RELATIVE_IMPORT = /(?:from\s+|import\s*\(\s*|import\s+)["'](\.{1,2}\/[^"']+)["']/g;

/**
 * Derives the flavour example registries and the generated example tree from
 * demos/registry.json, components/registry.json and the overlay tree. Returns
 * one registry per kind, the files the tree holds (path relative to the tree
 * root -> content), every example's flavour source, and the problems the
 * check must fail on.
 */
export function readFlavourExamples(flavour = readFlavour()) {
  const root = loadJson(join(REGISTRY_ROOT, "registry.json"));
  const pkg = loadJson(join(REGISTRY_ROOT, "package.json"));
  const ranges = { ...pkg.devDependencies, ...pkg.dependencies };
  const uiNames = new Set(root.items.filter((i) => i.type === "registry:ui").map((i) => i.name));
  const published = new Set(flavour.registry.items.map((i) => i.name));
  const problems = [];
  const files = new Map();
  const examples = new Map();
  const registries = {};
  const excluded = [];

  // Overlays first: each must mirror a registered example.
  const overlays = new Map();
  for (const abs of walkFiles(OVERLAY_ROOT)) {
    const rel = posix(relative(OVERLAY_ROOT, abs));
    const [kind] = rel.split("/");
    if (!(kind in EXAMPLE_KINDS) || !rel.endsWith(".tsx")) {
      problems.push(`overlay ${rel}: overlays are registry/ui-sdk/examples/{${Object.keys(EXAMPLE_KINDS).join(",")}}/<primitive>/<file>.tsx`);
      continue;
    }
    overlays.set(rel, read(abs));
  }
  const registered = new Set();
  const lock = existsSync(VARIANT_LOCK) ? loadJson(VARIANT_LOCK).variants ?? {} : null;
  if (lock === null) problems.push(`${posix(relative(REPO, VARIANT_LOCK))} is missing; it records the original each variant was reviewed against`);
  const stale = [];

  for (const [kind, route] of Object.entries(EXAMPLE_KINDS)) {
    const kindRoot = join(REGISTRY_ROOT, kind);
    const registry = loadJson(join(kindRoot, "registry.json"));
    const items = [];
    for (const item of registry.items) {
      const key = `${route}/${item.name}`;
      for (const file of item.files ?? []) registered.add(`${kind}/${file.path}`);
      if (EXCLUDED_EXAMPLES[key]) {
        excluded.push({ key, reason: EXCLUDED_EXAMPLES[key] });
        continue;
      }
      const sources = [];
      for (const file of item.files ?? []) {
        const rel = `${kind}/${file.path}`;
        const original = read(join(kindRoot, file.path));
        const overlay = overlays.get(rel);
        const source = retarget(overlay ?? original);
        if (overlay !== undefined) {
          if (/@\/registry\/base\//.test(overlay)) {
            problems.push(`overlay ${rel}: imports @/registry/base/; a variant imports @/registry/ui-sdk/`);
          }
          if (retarget(original) === source) {
            problems.push(`overlay ${rel}: is the original with only its imports retargeted, which the generator does by itself; delete it`);
          }
          const reviewed = lock?.[rel]?.original;
          if (lock && reviewed === undefined) {
            problems.push(`overlay ${rel}: has no entry in ui-sdk-variants.lock.json; once the variant is right, run "node scripts/ui-sdk-flavour.mjs review ${rel}"`);
          } else if (lock && reviewed !== hashSource(original)) {
            stale.push(rel);
            problems.push(
              `overlay ${rel}: its original, packages/registry/${rel}, changed since the variant was reviewed, so /r/ui-sdk/${route}/${item.name}.json and the UI SDK preview would publish the old example. Carry the change into registry/ui-sdk/examples/${rel}, then run "node scripts/ui-sdk-flavour.mjs review ${rel}"`,
            );
          }
        }
        const replaced = replacedImports(source);
        if (replaced.length) {
          problems.push(`${key}: the flavour source of ${rel} imports ${replaced.join(", ")}; write a variant at registry/ui-sdk/examples/${rel}`);
        }
        for (const m of source.matchAll(RELATIVE_IMPORT)) {
          const base = join(overlay !== undefined ? join(OVERLAY_ROOT, kind) : kindRoot, dirname(file.path), m[1]);
          const found = [base, `${base}.tsx`, `${base}.ts`].find((p) => existsSync(p) && !p.endsWith(sep));
          if (!found) {
            problems.push(`${key}: ${rel} imports "${m[1]}", which does not exist`);
            continue;
          }
          const siblingRel = posix(join(kind, relative(overlay !== undefined ? join(OVERLAY_ROOT, kind) : kindRoot, found)));
          const content = read(found);
          files.set(siblingRel, /\.tsx?$/.test(found) ? retarget(content) : content);
        }
        files.set(rel, source);
        examples.set(rel.replace(/\.tsx$/, ""), { key, rel, source, original, overlay: overlay !== undefined });
        sources.push(source);
      }

      const deps = new Set();
      for (const dep of item.registryDependencies ?? []) {
        const name = dep.match(/\/r\/([a-z0-9-]+)\.json$/)?.[1];
        deps.add(name && uiNames.has(name) && !SHARED_ITEMS.has(name) ? `${SITE}/ui-sdk/${name}.json` : dep);
      }
      for (const source of sources) {
        for (const m of source.matchAll(/@\/registry\/ui-sdk\/ui\/([a-z0-9-]+)/g)) deps.add(`${SITE}/ui-sdk/${m[1]}.json`);
      }
      for (const dep of deps) {
        const name = dep.match(FLAVOUR_URL)?.[1];
        if (name && !published.has(name)) problems.push(`${key}: depends on the flavour primitive "${name}", which is not published`);
      }
      const packages = new Set();
      for (const source of sources) for (const name of importedPackages(source)) packages.add(name);
      packages.delete("react");
      packages.delete("react-dom");
      const dependencies = [...packages].sort().map((name) => {
        if (name in REPLACED) return name;
        if (!ranges[name]) {
          problems.push(`${key}: imports "${name}", which packages/registry/package.json does not declare`);
          return name;
        }
        return `${name}@${ranges[name]}`;
      });
      const { name, type, title, description } = item;
      items.push({
        name,
        type,
        title,
        description,
        ...(dependencies.length ? { dependencies } : {}),
        registryDependencies: [...deps].sort((a, b) => Number(!FLAVOUR_URL.test(a)) - Number(!FLAVOUR_URL.test(b))),
        files: (item.files ?? []).map(({ path, type: fileType }) => ({ path, type: fileType })),
      });
    }
    registries[kind] = {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: `sevenui-ui-sdk-${kind}`,
      homepage: "https://sevenui.dev",
      items,
    };
    files.set(`${kind}/registry.json`, `${JSON.stringify(registries[kind], null, 2)}\n`);
  }

  for (const rel of overlays.keys()) {
    if (!registered.has(rel)) {
      problems.push(`overlay ${rel}: no registered example at packages/registry/${rel}; an overlay mirrors an example's path`);
    }
  }
  for (const key of Object.keys(EXCLUDED_EXAMPLES)) {
    if (!excluded.some((e) => e.key === key)) problems.push(`EXCLUDED_EXAMPLES lists ${key}, which is not an example`);
  }
  for (const rel of Object.keys(lock ?? {})) {
    if (!overlays.has(rel)) problems.push(`ui-sdk-variants.lock.json lists ${rel}, which has no variant; remove the entry`);
  }
  return { registries, files, examples, overlays: [...overlays.keys()], excluded, stale, problems };
}

// Writes the generated tree, touching only files whose content changed so a
// running dev server sees real changes only, and removing stale files.
// `examples` (run by `pnpm dev` and `pnpm typecheck`) still writes the tree
// while a variant only waits for review, so editing an original does not stop
// the dev server; it prints the problem. `build` and every check fail on it.
function writeExamples(derived, { allowStale = false } = {}) {
  const { files } = derived;
  const problems = allowStale ? derived.problems.filter((p) => !derived.stale.some((rel) => p.startsWith(`overlay ${rel}: its original`))) : derived.problems;
  if (problems.length) {
    console.error(`ui-sdk-flavour: ${problems.length} example problem(s)\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    process.exit(1);
  }
  for (const rel of allowStale ? derived.stale : []) {
    console.warn(`ui-sdk-flavour: WARNING the variant ${rel} has not been reviewed against its changed original; build and the checks fail until it is (node scripts/ui-sdk-flavour.mjs review ${rel})`);
  }
  let written = 0;
  let removed = 0;
  for (const [rel, content] of files) {
    const abs = join(GENERATED_ROOT, rel);
    if (existsSync(abs) && read(abs) === content) continue;
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
    written++;
  }
  for (const abs of walkFiles(GENERATED_ROOT)) {
    if (!files.has(posix(relative(GENERATED_ROOT, abs)))) {
      rmSync(abs);
      removed++;
    }
  }
  const counts = Object.entries(derived.registries).map(([kind, r]) => `${r.items.length} ${kind}`).join(", ");
  console.log(
    `ui-sdk-flavour: example tree packages/registry/.generated/ui-sdk up to date (${counts}, ${derived.overlays.length} variant(s); ${written} written, ${removed} removed)`,
  );
}

function sync() {
  const root = loadJson(join(REGISTRY_ROOT, "registry.json"));
  let written = 0;
  for (const item of root.items.filter((i) => i.type === "registry:ui")) {
    for (const file of item.files ?? []) {
      const base = read(join(REGISTRY_ROOT, file.path));
      if (!seedable(base)) continue;
      const abs = join(REGISTRY_ROOT, flavourPath(file.path));
      const current = existsSync(abs) ? read(abs) : null;
      // Never overwrite a port: only missing files, pending seeds and mirrors.
      const isPort =
        current !== null &&
        replacedImports(current).length === 0 &&
        (replacedImports(base).length > 0 ||
          (UI_SDK_PORTS.has(item.name) && importedPackages(current).has("@ui-sdk/react")));
      if (isPort || current === retarget(base)) continue;
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, retarget(base));
      written++;
      console.log(`sync: wrote ${flavourPath(file.path)}`);
    }
  }
  console.log(`sync: ${written} file(s) written`);
}

// Records that each named variant was reviewed against its original as it is
// now. Paths must be named one by one: accepting every variant at once would
// wave stale ones through.
function review(paths) {
  if (paths.length === 0) {
    console.error('review: name each reviewed variant, e.g. "node scripts/ui-sdk-flavour.mjs review components/tabs/tabs-05.tsx"');
    process.exit(1);
  }
  const lock = existsSync(VARIANT_LOCK) ? loadJson(VARIANT_LOCK) : {};
  const variants = { ...(lock.variants ?? {}) };
  for (const raw of paths) {
    const rel = posix(raw).replace(/^(?:packages\/registry\/)?(?:registry\/ui-sdk\/examples\/)?/, "");
    const [kind] = rel.split("/");
    if (!(kind in EXAMPLE_KINDS) || !existsSync(join(OVERLAY_ROOT, rel)) || !existsSync(join(REGISTRY_ROOT, rel))) {
      console.error(`review: ${raw} is not a variant (expected <demos|components>/<primitive>/<file>.tsx with a file under registry/ui-sdk/examples/ and an original)`);
      process.exit(1);
    }
    variants[rel] = { original: hashSource(read(join(REGISTRY_ROOT, rel))) };
    console.log(`review: ${rel} reviewed against its current original`);
  }
  const sorted = Object.fromEntries(Object.entries(variants).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(
    VARIANT_LOCK,
    `${JSON.stringify(
      {
        description:
          "The original each UI SDK example variant (registry/ui-sdk/examples/) was last reviewed against. When an original changes, the checks fail until the change is carried into its variant and `node scripts/ui-sdk-flavour.mjs review <path>` records the new hash. Never edit by hand.",
        variants: sorted,
      },
      null,
      2,
    )}\n`,
  );
}

function status() {
  const { ported, blocked, pending, mirrors, problems } = readFlavour();
  console.log(`ported (${ported.length}): ${ported.join(", ")}`);
  console.log(`  of which mirrors (${mirrors.length}): ${mirrors.join(", ")}`);
  console.log(`blocked (${blocked.length}): ${blocked.map((e) => `${e.item.name} <- ${e.waitingOn.join("+")}`).join(", ")}`);
  console.log(`pending (${pending.length}): ${pending.join(", ")}`);
  if (problems.length) console.log(`problems:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  const examples = readFlavourExamples();
  const counts = Object.entries(examples.registries).map(([kind, r]) => `${r.items.length} ${kind}`).join(", ");
  console.log(`examples: ${counts} published in the flavour, ${examples.overlays.length} variant(s), ${examples.excluded.length} excluded`);
  for (const e of examples.excluded) console.log(`  excluded ${e.key}: ${e.reason}`);
  if (examples.problems.length) console.log(`example problems:\n${examples.problems.map((p) => `  - ${p}`).join("\n")}`);
  // --strict is the finish line of the porting programme: nothing left to port.
  if (process.argv.includes("--strict") && (pending.length || blocked.length || problems.length || examples.problems.length)) {
    process.exit(1);
  }
}

function build() {
  const flavour = readFlavour();
  const { registry, problems } = flavour;
  if (problems.length) {
    console.error(`ui-sdk-flavour: ${problems.length} problem(s)\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    process.exit(1);
  }
  writeFileSync(FLAVOUR_REGISTRY, `${JSON.stringify(registry, null, 2)}\n`);
  console.log(`ui-sdk-flavour: wrote ${registry.items.length} item(s) to packages/registry/registry.ui-sdk.json`);
  writeExamples(readFlavourExamples(flavour));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] ?? "status";
  if (command === "build") build();
  else if (command === "examples") writeExamples(readFlavourExamples(), { allowStale: true });
  else if (command === "sync") sync();
  else if (command === "review") review(process.argv.slice(3));
  else if (command === "status") status();
  else {
    console.error(`unknown command "${command}" (build, examples, sync, review, status)`);
    process.exit(1);
  }
}

