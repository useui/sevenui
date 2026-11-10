import "server-only";

import { loadBlocksTree } from "./blocks";
import { getNavTree, isNavGroup, type NavGroup, type NavLink } from "./docs/nav";
import { galleryComponents, galleryFamilies } from "./gallery";

export type ShellItem = { label: string; href: string; count?: number };
export type ShellBranch = { id: string; label: string; href?: string; count: number; items: ShellItem[] };

/** The static half of the one site sidebar: the docs guides, the primitives, and the component gallery. */
export type ShellNav = {
  start: ShellItem[];
  primitives: { href?: string; items: ShellItem[] };
  components: { total: number; branches: ShellBranch[] };
};

/** The live half: Pro blocks, read from the pro manifest (ISR, 300s), so it travels separately. */
export type BlocksNav = { total: number; branches: ShellBranch[] };

export async function getShellNav(): Promise<ShellNav> {
  const tree = await getNavTree();
  const start = tree.filter((node): node is NavLink => !isNavGroup(node));
  const primitives = tree.find((node): node is NavGroup => isNavGroup(node));

  return {
    start,
    primitives: { href: primitives?.href, items: primitives?.children ?? [] },
    components: {
      total: galleryComponents.reduce((sum, component) => sum + component.count, 0),
      branches: galleryFamilies.map((family) => ({
        id: family.id,
        label: family.label,
        count: family.components.length,
        items: family.components.map((component) => ({
          label: component.label,
          href: `/components/${component.slug}`,
          count: component.count,
        })),
      })),
    },
  };
}

export async function getBlocksNav(): Promise<BlocksNav> {
  const groups = await loadBlocksTree();
  return {
    total: groups.reduce((sum, group) => sum + group.items.length, 0),
    branches: groups.map((group) => ({
      id: group.id,
      label: group.label,
      href: `/blocks/${group.id}`,
      count: group.items.length,
      items: group.categories.map((category) => ({
        label: category.label,
        href: `/blocks/${group.id}/${category.id}`,
        count: category.items.length,
      })),
    })),
  };
}
