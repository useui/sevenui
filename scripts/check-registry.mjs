import { readFileSync, existsSync } from "node:fs";

const registry = JSON.parse(readFileSync("registry.json", "utf8"));
const errors = [];
const itemNames = new Set(registry.items.map((i) => i.name));
const OWN_URL = /^https:\/\/sevenui\.dev\/r\/([a-z0-9-]+)\.json$/;

for (const item of registry.items) {
  const where = `item "${item.name}"`;

  for (const file of item.files ?? []) {
    if (!existsSync(file.path)) {
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
    if (!existsSync(`docs/components/${item.name}.mdx`)) {
      errors.push(`${where}: no docs page docs/components/${item.name}.mdx`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Registry check failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`Registry check passed (${registry.items.length} items).`);
