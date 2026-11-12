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
//   node scripts/ui-sdk-flavour.mjs build    write packages/registry/registry.ui-sdk.json
//   node scripts/ui-sdk-flavour.mjs sync     re-seed pending files and mirrors from base
//   node scripts/ui-sdk-flavour.mjs status   list ported, blocked and pending primitives
//                                     (--strict exits 1 while any remain)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const REGISTRY_ROOT = join(REPO, "packages/registry");
export const FLAVOUR_REGISTRY = join(REGISTRY_ROOT, "registry.ui-sdk.json");
export const SITE = "https://sevenui.dev/r";
export const FLAVOUR_URL = /^https:\/\/sevenui\.dev\/r\/ui-sdk\/([a-z0-9-]+)\.json$/;

// Items every flavour shares: never duplicated under /r/ui-sdk/.
export const SHARED_ITEMS = new Set(["theme", "sevenui-tokens", "animations"]);

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

// Keep in sync with packages/registry/vitest.config.ts and tests/api-freeze.test.ts.
export const REPLACED_IMPORT =
  /from\s+["'](@base-ui\/react|react-day-picker|embla-carousel-react|react-resizable-panels)(?:\/[^"']*)?["']/g;
const PACKAGE_IMPORT = /(?:^|\n)\s*(?:import|export)\s[^"';]*?from\s+["']([^"'./@][^"']*|@[^"'/]+\/[^"']+)["']|(?:^|\n)\s*import\s+["']([^"'./][^"']*)["']/g;

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

export const LAYER_DOCS =
  'UI SDK adds its runtime CSS to a cascade layer named ui-sdk. Put `@layer ui-sdk;` on the first line of your global CSS file, above `@import "tailwindcss"`, so your utilities win over it. Without it, popups such as dialogs can lose their padding and background.';

export const retarget = (source) =>
  source.replaceAll("@/registry/base/", "@/registry/ui-sdk/");
export const replacedImports = (source) =>
  [...new Set([...source.matchAll(REPLACED_IMPORT)].map((m) => m[1]))];
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
  for (const match of source.matchAll(PACKAGE_IMPORT)) {
    const spec = match[1] ?? match[2];
    if (spec) names.add(packageName(spec));
  }
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
    const docs = packages.has("@ui-sdk/react") ? LAYER_DOCS : undefined;
    items.push({
      name,
      type,
      title,
      description: describe(entry.item),
      ...(dependencies.length ? { dependencies } : {}),
      registryDependencies: regDepsOf(entry),
      files: entry.files,
      ...(cssVars ? { cssVars } : {}),
      ...(css ? { css } : {}),
      ...(docs ? { docs } : {}),
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

function status() {
  const { ported, blocked, pending, mirrors, problems } = readFlavour();
  console.log(`ported (${ported.length}): ${ported.join(", ")}`);
  console.log(`  of which mirrors (${mirrors.length}): ${mirrors.join(", ")}`);
  console.log(`blocked (${blocked.length}): ${blocked.map((e) => `${e.item.name} <- ${e.waitingOn.join("+")}`).join(", ")}`);
  console.log(`pending (${pending.length}): ${pending.join(", ")}`);
  if (problems.length) console.log(`problems:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  // --strict is the finish line of the porting programme: nothing left to port.
  if (process.argv.includes("--strict") && (pending.length || blocked.length || problems.length)) process.exit(1);
}

function build() {
  const { registry, problems } = readFlavour();
  if (problems.length) {
    console.error(`ui-sdk-flavour: ${problems.length} problem(s)\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    process.exit(1);
  }
  writeFileSync(FLAVOUR_REGISTRY, `${JSON.stringify(registry, null, 2)}\n`);
  console.log(`ui-sdk-flavour: wrote ${registry.items.length} item(s) to packages/registry/registry.ui-sdk.json`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] ?? "status";
  if (command === "build") build();
  else if (command === "sync") sync();
  else if (command === "status") status();
  else {
    console.error(`unknown command "${command}" (build, sync, status)`);
    process.exit(1);
  }
}

