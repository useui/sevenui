import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import componentsRegistry from "../../../../packages/registry/components/registry.json";
import registry from "../../../../packages/registry/registry.json";
import { type Group, loadBlocksTree } from "../../lib/blocks";

const uiItems = registry.items.filter((item) => item.type === "registry:ui");

export const primitiveCount = uiItems.length;
export const componentCount = componentsRegistry.items.length;

/** The real registry source of a primitive, with long class strings collapsed so the structure reads. */
export function sourceOf(name: string): string {
  // Throws rather than falling back: an ISR render that fails keeps serving the last good page.
  const file = path.join(process.cwd(), "../../packages/registry/registry/base/ui", `${name}.tsx`);
  return readFileSync(file, "utf8")
    .trimEnd()
    .replace(/^"use client";\n\n/, "")
    .replace(/"[^"\n]{60,}"/g, '"…"')
    .replace(/className=\{cn\(\s*"…",\s*className,?\s*\)\}/g, 'className={cn("…", className)}');
}

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
