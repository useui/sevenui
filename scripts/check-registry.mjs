import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  EXAMPLE_KINDS,
  FLAVOUR_URL,
  REPLACED,
  SHARED_ITEMS,
  UI_SDK_PORTS,
  importedPackages,
  readFlavour,
  readFlavourExamples,
  replacedImports,
  retarget,
} from "./ui-sdk-flavour.mjs";

const errors = [];
const loadJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const UI_ROOT = "packages/registry";
const DEMOS_ROOT = "packages/registry/demos";
const DOCS_DIR = "apps/web/docs/components";

const ui = loadJson(join(UI_ROOT, "registry.json"));
const demos = loadJson(join(DEMOS_ROOT, "registry.json"));

const uiNames = new Set(ui.items.map((i) => i.name));
const demoNames = new Set(demos.items.map((i) => i.name));
// registryDependencies always point at ui primitives in the root namespace.
const TOKENS_URL = "https://sevenui.dev/r/sevenui-tokens.json";
const OWN_URL = /^https:\/\/sevenui\.dev\/r\/([a-z0-9-]+)\.json$/;

const registryPkg = loadJson(join(UI_ROOT, "package.json"));
const EXPECTED_RANGES = {
  ...registryPkg.devDependencies,
  ...registryPkg.dependencies,
};

function checkLucideDep(item, root, where) {
  const usesLucide = (item.files ?? []).some((file) => {
    const filePath = join(root, file.path);
    return (
      existsSync(filePath) &&
      readFileSync(filePath, "utf8").includes('from "lucide-react"')
    );
  });
  const hasLucide = (item.dependencies ?? []).some(
    (dep) => dep === "lucide-react" || dep.startsWith("lucide-react@"),
  );
  if (usesLucide && !hasLucide) {
    errors.push(
      `${where}: imports lucide-react but dependencies is missing "lucide-react"`,
    );
  }
}

function checkDepRanges(item, where) {
  for (const dep of item.dependencies ?? []) {
    const at = dep.lastIndexOf("@");
    const name = at > 0 ? dep.slice(0, at) : dep;
    const range = at > 0 ? dep.slice(at + 1) : null;
    const expected = EXPECTED_RANGES[name];
    if (!expected) {
      errors.push(
        `${where}: dependency "${name}" is not declared in a workspace package.json`,
      );
    } else if (range === null) {
      errors.push(
        `${where}: dependency "${dep}" has no version range (expected "${name}@${expected}")`,
      );
    } else if (range !== expected) {
      errors.push(
        `${where}: dependency "${dep}" differs from workspace range "${name}@${expected}"`,
      );
    }
  }
}

function checkRegistry(registry, root, label, { fileType } = {}) {
  const seen = new Set();
  for (const item of registry.items) {
    const where = `${label} item "${item.name}"`;
    if (seen.has(item.name)) errors.push(`duplicate ${label} item name "${item.name}"`);
    seen.add(item.name);

    for (const file of item.files ?? []) {
      if (!existsSync(join(root, file.path))) {
        errors.push(`${where}: missing file ${file.path}`);
      }
      if (fileType && file.type !== fileType) {
        errors.push(`${where}: file ${file.path} must be ${fileType}`);
      }
    }

    for (const dep of item.registryDependencies ?? []) {
      const match = dep.match(OWN_URL);
      if (!match) {
        errors.push(
          `${where}: registryDependencies must be full sevenui.dev /r/ URLs, got "${dep}"`,
        );
      } else if (!uiNames.has(match[1])) {
        errors.push(`${where}: dependency "${match[1]}" is not a ui registry item`);
      }
    }

    if (root !== UI_ROOT) {
      const deps = new Set(item.registryDependencies ?? []);
      for (const file of item.files ?? []) {
        const filePath = join(root, file.path);
        if (!existsSync(filePath)) continue;
        const source = readFileSync(filePath, "utf8");
        for (const match of source.matchAll(/@\/registry\/base\/ui\/([a-z0-9-]+)/g)) {
          const depUrl = `https://sevenui.dev/r/${match[1]}.json`;
          if (!deps.has(depUrl)) {
            errors.push(
              `${where}: file ${file.path} imports "${match[1]}" but registryDependencies is missing "${depUrl}"`,
            );
          }
        }
      }
    }

    if (
      item.type === "registry:ui" &&
      !(item.registryDependencies ?? []).includes(TOKENS_URL)
    ) {
      errors.push(`${item.name}: missing sevenui-tokens dependency`);
    }

    checkLucideDep(item, root, where);
    checkDepRanges(item, where);
  }
}

function checkAllFilesRegistered(registry, root, label, { skip = [] } = {}) {
  const registered = new Set(
    registry.items.flatMap((i) => (i.files ?? []).map((f) => f.path)),
  );
  const walk = (rel) => {
    for (const entry of readdirSync(join(root, rel), { withFileTypes: true })) {
      if (skip.includes(entry.name)) continue;
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(relPath);
      else if (entry.name.endsWith(".tsx") && !registered.has(relPath)) {
        errors.push(`${label} file ${relPath} is not registered`);
      }
    }
  };
  walk("");
}

// ---- ui registry ----
checkRegistry(ui, UI_ROOT, "ui");
for (const item of ui.items) {
  const where = `ui item "${item.name}"`;
  if (item.type !== "registry:ui") continue;
  if (!demoNames.has(`${item.name}-demo`)) {
    errors.push(`${where}: no "${item.name}-demo" item in the demos registry`);
  }
  if (!existsSync(join(DOCS_DIR, `${item.name}.mdx`))) {
    errors.push(`${where}: no docs page ${join(DOCS_DIR, `${item.name}.mdx`)}`);
  }
}

// ---- demos registry ----
checkRegistry(demos, DEMOS_ROOT, "demos");
checkAllFilesRegistered(demos, DEMOS_ROOT, "demos", { skip: ["theme.css", "registry.json", "package.json"] });

const themeItem = ui.items.find((i) => i.name === "theme");
const THEME_CONSUMER_FILES = [join(DEMOS_ROOT, "theme.css"), "apps/web/app/globals.css"];
for (const themeFile of THEME_CONSUMER_FILES) {
  const css = readFileSync(themeFile, "utf8");
  for (const [mode, vars] of Object.entries(themeItem.cssVars)) {
    for (const [key, val] of Object.entries(vars)) {
      if (!css.includes(`--${key}: ${val};`)) {
        errors.push(`theme ${mode} token --${key} missing or differs in ${themeFile}`);
      }
    }
  }
}

// ---- components registry (the /components gallery) ----
const COMPONENTS_ROOT = "packages/registry/components";
const components = loadJson(join(COMPONENTS_ROOT, "registry.json"));
checkRegistry(components, COMPONENTS_ROOT, "components", { fileType: "registry:component" });
checkAllFilesRegistered(components, COMPONENTS_ROOT, "components", { skip: ["registry.json"] });
for (const item of components.items) {
  const folder = (item.files ?? [])[0]?.path.split("/")[0];
  if (folder && !uiNames.has(folder)) {
    errors.push(`components item "${item.name}": folder "${folder}" is not a ui registry item`);
  }
}

// ---- ui-sdk flavour registry (/r/ui-sdk/*) ----
// Derived from the files, never hand-edited: see scripts/ui-sdk-flavour.mjs.
const flavour = readFlavour();
errors.push(...flavour.problems.map((p) => `ui-sdk ${p}`));
const FLAVOUR_ROOT = join(UI_ROOT, "registry/ui-sdk");
const flavourItems = new Map(flavour.registry.items.map((i) => [i.name, i]));
const registeredFlavourFiles = new Set(
  [...flavour.state.values()].flatMap((e) => e.files.map((f) => f.path)),
);
// registry/ui-sdk/examples holds the example overlays, checked below.
const walkFlavour = (rel) => {
  for (const entry of readdirSync(join(UI_ROOT, rel), { withFileTypes: true })) {
    const relPath = `${rel}/${entry.name}`;
    if (relPath === "registry/ui-sdk/examples") continue;
    if (entry.isDirectory()) walkFlavour(relPath);
    else if (/\.tsx?$/.test(entry.name) && !registeredFlavourFiles.has(relPath)) {
      errors.push(`ui-sdk file ${relPath} belongs to no primitive`);
    }
  }
};
if (existsSync(FLAVOUR_ROOT)) walkFlavour("registry/ui-sdk");

const baseUiNames = ui.items.filter((i) => i.type === "registry:ui").map((i) => i.name);
const accounted = new Set([...flavour.ported, ...flavour.pending, ...flavour.blocked.map((e) => e.item.name)]);
for (const name of baseUiNames) {
  if (!accounted.has(name)) errors.push(`ui-sdk: primitive "${name}" is neither ported, blocked nor pending`);
}
for (const name of flavourItems.keys()) {
  if (!uiNames.has(name) || SHARED_ITEMS.has(name)) {
    errors.push(`ui-sdk item "${name}" is not a base primitive`);
  }
}

for (const item of flavour.registry.items) {
  const where = `ui-sdk item "${item.name}"`;
  for (const file of item.files) {
    const filePath = join(UI_ROOT, file.path);
    if (!file.path.startsWith("registry/ui-sdk/")) errors.push(`${where}: file ${file.path} is outside registry/ui-sdk/`);
    const replaced = existsSync(filePath) ? replacedImports(readFileSync(filePath, "utf8")) : [];
    if (replaced.length > 0) errors.push(`${where}: ${file.path} imports ${replaced.join(", ")}, which UI SDK replaces`);
    // Markup primitives the flavour builds on a UI SDK component (label,
    // textarea, input-group) are published only as real ports.
    if (UI_SDK_PORTS.has(item.name) && !importedPackages(existsSync(filePath) ? readFileSync(filePath, "utf8") : "").has("@ui-sdk/react")) {
      errors.push(`${where}: ${file.path} must import @ui-sdk/react (a UI SDK port, not a mirror)`);
    }
  }
  for (const dep of item.dependencies ?? []) {
    const name = dep.slice(0, dep.lastIndexOf("@") > 0 ? dep.lastIndexOf("@") : undefined);
    if (name in REPLACED) errors.push(`${where}: depends on ${name}, which UI SDK replaces`);
  }
  for (const dep of item.registryDependencies) {
    const own = dep.match(FLAVOUR_URL);
    if (own) {
      if (!flavourItems.has(own[1])) errors.push(`${where}: registryDependency "${dep}" is not a published ui-sdk item`);
    } else {
      const shared = dep.match(OWN_URL)?.[1];
      if (!shared || !SHARED_ITEMS.has(shared)) {
        errors.push(`${where}: registryDependency "${dep}" must be ${"https://sevenui.dev/r/ui-sdk/<name>.json"} or a shared theme/tokens/animations item`);
      }
    }
  }
  if (!item.registryDependencies.includes(TOKENS_URL)) errors.push(`${where}: missing sevenui-tokens dependency`);
  checkLucideDep(item, UI_ROOT, where);
  checkDepRanges(item, where);
}

// ---- ui-sdk flavour example registries (/r/ui-sdk/{demo,component}/*) ----
// Derived from demos/ and components/ plus the overlays in
// registry/ui-sdk/examples/: see readFlavourExamples.
const flavourExamples = readFlavourExamples(flavour);
errors.push(...flavourExamples.problems.map((p) => `ui-sdk examples: ${p}`));
const excludedKeys = new Set(flavourExamples.excluded.map((e) => e.key));
const exampleRegistries = { demos, components };
for (const [kind, route] of Object.entries(EXAMPLE_KINDS)) {
  const original = exampleRegistries[kind];
  const derived = flavourExamples.registries[kind];
  const label = `ui-sdk ${route}`;
  const derivedNames = new Set(derived.items.map((i) => i.name));
  // Closed and complete: the same items as the original registry, minus the
  // recorded exclusions, and nothing else.
  for (const item of original.items) {
    const key = `${route}/${item.name}`;
    if (!derivedNames.has(item.name) && !excludedKeys.has(key)) errors.push(`${label}: "${item.name}" is not published in the flavour`);
    if (derivedNames.has(item.name) && excludedKeys.has(key)) errors.push(`${label}: "${item.name}" is excluded but published`);
  }
  const originalNames = new Set(original.items.map((i) => i.name));
  for (const item of derived.items) {
    const where = `${label} item "${item.name}"`;
    if (!originalNames.has(item.name)) errors.push(`${where}: no such item in ${kind}/registry.json`);
    const originalItem = original.items.find((i) => i.name === item.name);
    if (originalItem && JSON.stringify(originalItem.files) !== JSON.stringify(item.files)) {
      errors.push(`${where}: files differ from ${kind}/registry.json, so the install target would move`);
    }
    for (const file of item.files) {
      const rel = `${kind}/${file.path}`;
      const content = flavourExamples.files.get(rel);
      if (content === undefined) {
        errors.push(`${where}: ${rel} is missing from the generated tree`);
        continue;
      }
      const overlayPath = join(FLAVOUR_ROOT, "examples", rel);
      const source = existsSync(overlayPath) ? readFileSync(overlayPath, "utf8") : readFileSync(join(UI_ROOT, rel), "utf8");
      if (content !== retarget(source)) errors.push(`${where}: generated ${rel} is not its ${existsSync(overlayPath) ? "overlay" : "original"} retargeted`);
      if (/@\/registry\/base\//.test(content)) errors.push(`${where}: ${rel} still imports @/registry/base/`);
      const replaced = replacedImports(content);
      if (replaced.length) errors.push(`${where}: ${rel} imports ${replaced.join(", ")}, which UI SDK replaces`);
      for (const m of content.matchAll(/@\/registry\/ui-sdk\/ui\/([a-z0-9-]+)/g)) {
        const url = `https://sevenui.dev/r/ui-sdk/${m[1]}.json`;
        if (!item.registryDependencies.includes(url)) errors.push(`${where}: ${rel} imports "${m[1]}" but registryDependencies is missing "${url}"`);
      }
      if (content.includes('from "lucide-react"') && !(item.dependencies ?? []).some((d) => d.startsWith("lucide-react@"))) {
        errors.push(`${where}: imports lucide-react but dependencies is missing "lucide-react"`);
      }
    }
    for (const dep of item.registryDependencies) {
      const own = dep.match(FLAVOUR_URL);
      if (own) {
        if (!flavourItems.has(own[1])) errors.push(`${where}: registryDependency "${dep}" is not a published ui-sdk item`);
      } else if (!SHARED_ITEMS.has(dep.match(OWN_URL)?.[1])) {
        errors.push(`${where}: registryDependency "${dep}" must be https://sevenui.dev/r/ui-sdk/<name>.json or a shared theme/tokens/animations item`);
      }
    }
    for (const dep of item.dependencies ?? []) {
      const name = dep.slice(0, dep.lastIndexOf("@") > 0 ? dep.lastIndexOf("@") : undefined);
      if (name in REPLACED) errors.push(`${where}: depends on ${name}, which UI SDK replaces`);
    }
    checkDepRanges(item, where);
  }
}
// Every overlay mirrors a registered example (readFlavourExamples reports
// orphans) and is what that example publishes.
for (const rel of flavourExamples.overlays) {
  if (!flavourExamples.files.has(rel)) errors.push(`ui-sdk overlay ${rel} is not published`);
}

if (errors.length > 0) {
  console.error(`check-registry: ${errors.length} problem(s)\n` + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log(`check-registry: ok (${ui.items.length} ui, ${demos.items.length} demos, ${components.items.length} components)`);
console.log(
  `check-registry: ui-sdk flavour ${flavour.ported.length}/${baseUiNames.length} published, ` +
    `${flavour.blocked.length} blocked (${flavour.blocked.map((e) => `${e.item.name} <- ${e.waitingOn.join("+")}`).join(", ") || "none"}), ` +
    `${flavour.pending.length} pending: ${flavour.pending.join(", ") || "none"}`,
);
console.log(
  `check-registry: ui-sdk examples ${Object.entries(flavourExamples.registries)
    .map(([kind, r]) => `${r.items.length}/${exampleRegistries[kind].items.length} ${kind}`)
    .join(", ")} published, ${flavourExamples.overlays.length} variant(s), ${flavourExamples.excluded.length} excluded`,
);
for (const e of flavourExamples.excluded) console.log(`check-registry: ui-sdk example ${e.key} excluded: ${e.reason}`);
