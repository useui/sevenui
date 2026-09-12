import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const errors = [];
const loadJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const UI_ROOT = "packages/registry";
const DEMOS_ROOT = "packages/registry/demos";
const BLOCKS_ROOT = "packages/blocks";
const DOCS_DIR = "apps/web/docs/components";

const ui = loadJson(join(UI_ROOT, "registry.json"));
const demos = loadJson(join(DEMOS_ROOT, "registry.json"));
const blocks = loadJson(join(BLOCKS_ROOT, "registry.json"));

const uiNames = new Set(ui.items.map((i) => i.name));
const demoNames = new Set(demos.items.map((i) => i.name));
// registryDependencies always point at ui primitives in the root namespace.
const OWN_URL = /^https:\/\/sevenui\.dev\/r\/([a-z0-9-]+)\.json$/;

// Every npm dependency must pin the version range the workspace develops
// against — a bare name makes consumers install latest, so a breaking
// release of a primitive would reach them silently.
const registryPkg = loadJson(join(UI_ROOT, "package.json"));
const blocksPkg = loadJson(join(BLOCKS_ROOT, "package.json"));
const EXPECTED_RANGES = {
  ...registryPkg.devDependencies,
  ...registryPkg.dependencies,
  ...blocksPkg.devDependencies,
  ...blocksPkg.dependencies,
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

// Shared per-registry checks: unique names, files exist, deps pinned,
// lucide declared, registryDependencies are root /r/ URLs naming ui items,
// house-alias imports declared as registryDependencies.
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

    // Every house-alias import must be declared as a registryDependency
    // (ui items import siblings relatively, so this only bites derived registries).
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

    checkLucideDep(item, root, where);
    checkDepRanges(item, where);
  }
}

// Every .tsx under a registry's content folders must be registered — an
// unregistered file silently ships nowhere.
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

// Theme parity: every cssVars token appears in demos/theme.css with the same value
const themeItem = ui.items.find((i) => i.name === "theme");
const css = readFileSync(join(DEMOS_ROOT, "theme.css"), "utf8");
for (const [mode, vars] of Object.entries(themeItem.cssVars)) {
  for (const [key, val] of Object.entries(vars)) {
    if (!css.includes(`--${key}: ${val};`)) {
      errors.push(`theme ${mode} token --${key} missing or differs in demos/theme.css`);
    }
  }
}

// ---- components registry (the /components gallery) ----
const COMPONENTS_ROOT = "packages/registry/components";
const components = loadJson(join(COMPONENTS_ROOT, "registry.json"));
checkRegistry(components, COMPONENTS_ROOT, "components", { fileType: "registry:component" });
checkAllFilesRegistered(components, COMPONENTS_ROOT, "components", { skip: ["registry.json"] });
// Gallery folders must be named after a ui component (the page derives its
// title and docs link from the ui item).
for (const item of components.items) {
  const folder = (item.files ?? [])[0]?.path.split("/")[0];
  if (folder && !uiNames.has(folder)) {
    errors.push(`components item "${item.name}": folder "${folder}" is not a ui registry item`);
  }
}

// ---- blocks registry (free blocks; removed with the teardown) ----
checkRegistry(blocks, BLOCKS_ROOT, "block", { fileType: "registry:component" });
for (const item of blocks.items) {
  if (item.type !== "registry:block") {
    errors.push(`block "${item.name}": type must be "registry:block", got "${item.type}"`);
  }
}
checkAllFilesRegistered(blocks, BLOCKS_ROOT, "block", { skip: ["registry.json", "package.json", "tsconfig.json", "node_modules"] });
if (!existsSync("apps/web/pages/blocks/preview/[slug].astro")) {
  errors.push("blocks preview route apps/web/pages/blocks/preview/[slug].astro is missing");
}

if (errors.length > 0) {
  console.error(`check-registry: ${errors.length} problem(s)\n` + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log(`check-registry: ok (${ui.items.length} ui, ${demos.items.length} demos, ${components.items.length} components, ${blocks.items.length} blocks)`);
