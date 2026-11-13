import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import componentsRegistry from "../../../../packages/registry/components/registry.json";
import registryPackage from "../../../../packages/registry/package.json";
import registry from "../../../../packages/registry/registry.json";
import { type Group, loadBlocksTree } from "../../lib/blocks";
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
