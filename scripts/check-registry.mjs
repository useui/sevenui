import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const REGISTRY_ROOT = "packages/registry";
const DOCS_DIR = "web/docs/components";

const registry = JSON.parse(
  readFileSync(join(REGISTRY_ROOT, "registry.json"), "utf8"),
);
const errors = [];
const itemNames = new Set(registry.items.map((i) => i.name));
const OWN_URL = /^https:\/\/sevenui\.dev\/r\/([a-z0-9-]+)\.json$/;

for (const item of registry.items) {
  const where = `item "${item.name}"`;

  for (const file of item.files ?? []) {
    if (!existsSync(join(REGISTRY_ROOT, file.path))) {
      errors.push(`${where}: missing file ${file.path}`);
    }
  }

  for (const dep of item.registryDependencies ?? []) {
    const match = dep.match(OWN_URL);
    if (!match) {
      errors.push(
        `${where}: registryDependencies must be full sevenui.dev URLs, got "${dep}"`,
      );
    } else if (!itemNames.has(match[1])) {
      errors.push(`${where}: dependency "${match[1]}" is not a registry item`);
    }
  }

  if (item.type === "registry:ui") {
    if (!itemNames.has(`${item.name}-demo`)) {
      errors.push(`${where}: no "${item.name}-demo" example item`);
    }
    if (!existsSync(join(DOCS_DIR, `${item.name}.mdx`))) {
      errors.push(`${where}: no docs page ${join(DOCS_DIR, `${item.name}.mdx`)}`);
    }
  }
}

// Unique item names
const seen = new Set();
for (const item of registry.items) {
  if (seen.has(item.name)) errors.push(`duplicate item name "${item.name}"`);
  seen.add(item.name);
}

// Every example file is registered
const registeredFiles = new Set(
  registry.items.flatMap((i) => (i.files ?? []).map((f) => f.path)),
);
for (const dir of readdirSync(join(REGISTRY_ROOT, "examples"), { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  for (const f of readdirSync(join(REGISTRY_ROOT, "examples", dir.name))) {
    const p = `examples/${dir.name}/${f}`;
    if (f.endsWith(".tsx") && !registeredFiles.has(p)) {
      errors.push(`example file ${p} is not registered in registry.json`);
    }
  }
}

// Theme parity: every cssVars token appears in examples/theme.css with the same value
const themeItem = registry.items.find((i) => i.name === "theme");
const css = readFileSync(join(REGISTRY_ROOT, "examples/theme.css"), "utf8");
for (const [mode, vars] of Object.entries(themeItem.cssVars)) {
  for (const [key, val] of Object.entries(vars)) {
    if (!css.includes(`--${key}: ${val};`)) {
      errors.push(`theme ${mode} token --${key} missing or differs in examples/theme.css`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Registry check failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`Registry check passed (${registry.items.length} items).`);
