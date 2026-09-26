import "server-only";
import componentsRegistry from "../../../../packages/registry/components/registry.json";
import registry from "../../../../packages/registry/registry.json";
import { type Group, loadBlocksTree } from "../../lib/blocks";

const uiItems = registry.items.filter((item) => item.type === "registry:ui");

export const primitiveCount = uiItems.length;
export const componentCount = componentsRegistry.items.length;

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
