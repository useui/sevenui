import "server-only";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import componentsRegistry from "../../../../packages/registry/components/registry.json";
import uiSdkCompat from "../../../../packages/registry/ui-sdk-compat.json";
import registryPackage from "../../../../packages/registry/package.json";
import registry from "../../../../packages/registry/registry.json";
import { type Group, loadBlocksTree } from "../../lib/blocks";
import { getNavTree, isNavGroup, type NavLink } from "../../lib/docs/nav";
import { galleryFamilies } from "../../lib/gallery";
import { REGISTRY_DIR } from "../../lib/ui-sdk-examples";

// Every number the home page states is read here, from the registry at build time or from the Pro manifest
// on the page's ISR window, so the copy cannot drift from what is published.

const uiItems = registry.items.filter((item) => item.type === "registry:ui");

export const primitiveCount = uiItems.length;
export const componentCount = componentsRegistry.items.length;

/** "900+": the free component count, rounded down to the hundred so the copy does not churn. */
export const componentLabel = `${Math.floor(componentCount / 100) * 100}+`;

/**
 * The home page says every primitive has its own test file (packages/registry/tests/<name>.test.tsx, run by
 * both vitest projects, `base` and `ui-sdk`). Checked here, so a primitive added without one fails the build
 * instead of making the sentence false.
 */
const untested = uiItems.filter((item) => !existsSync(path.join(REGISTRY_DIR, "tests", `${item.name}.test.tsx`)));
if (untested.length > 0) {
  throw new Error(
    `components/home/registry-data.ts: no test file for ${untested.map((item) => item.name).join(", ")}; the home page claims one per primitive`,
  );
}

/** The two foundations as the registry package pins them: Base UI by range ("1.7"), UI SDK exactly. */
export const baseUiVersion = registryPackage.dependencies["@base-ui/react"].replace(/^\^?(\d+\.\d+)\..*$/, "$1");
export const uiSdkVersion = registryPackage.dependencies["@ui-sdk/react"];

/** Demos and gallery examples published in both flavours: the UI SDK compat manifest lists each one. */
export const dualFlavourExampleCount = Object.keys(uiSdkCompat.items).length;

/**
 * The headless-library modules one flavour of a primitive imports, read from its source file, e.g.
 * `@base-ui/react` for the Base UI combobox and `@ui-sdk/react/combobox` for the UI SDK one. UI SDK's shared
 * building blocks (`primitive`, `merge-props`, …) are left out: they are not what the primitive is built on.
 */
export async function foundationModules(name: string, flavour: "base-ui" | "ui-sdk"): Promise<string[]> {
  const dir = flavour === "ui-sdk" ? "ui-sdk" : "base";
  const source = await readFile(path.join(REGISTRY_DIR, "registry", dir, "ui", `${name}.tsx`), "utf8");
  const pkg = flavour === "ui-sdk" ? "@ui-sdk/react" : "@base-ui/react";
  const helpers = new Set(["primitive", "merge-props", "use-render", "utils"].map((entry) => `${pkg}/${entry}`));
  const modules = [...source.matchAll(/from\s+"([^"]+)"/g)]
    .map((match) => match[1])
    .filter((spec) => (spec === pkg || spec.startsWith(`${pkg}/`)) && !helpers.has(spec));
  const unique = [...new Set(modules)].sort();
  if (unique.length === 0) throw new Error(`components/home/registry-data.ts: ${dir}/ui/${name}.tsx imports nothing from ${pkg}`);
  return unique;
}

/** The primitives in the docs sidebar's order, each with its page. */
export async function loadPrimitiveLinks(): Promise<NavLink[]> {
  const group = (await getNavTree()).find(isNavGroup);
  const links = group?.children ?? [];
  if (links.length !== primitiveCount) {
    throw new Error(
      `components/home/registry-data.ts: the docs nav lists ${links.length} primitives, the registry ${primitiveCount}`,
    );
  }
  return links;
}

/** The gallery's families with their component totals, in the /components sidebar order. */
export const componentFamilies = galleryFamilies.map((family) => ({
  id: family.id,
  label: family.label,
  count: family.components.reduce((sum, component) => sum + component.count, 0),
}));

export type Catalog = { groups: Group[]; blockCount: number; categoryCount: number };

/** The live Pro manifest. Throws like /blocks does, so a failed ISR render keeps the last good page. */
export async function loadCatalog(): Promise<Catalog> {
  const groups = await loadBlocksTree();
  const categories = groups.flatMap((group) => group.categories);
  return {
    groups,
    blockCount: categories.reduce((sum, category) => sum + category.items.length, 0),
    categoryCount: categories.length,
  };
}
