import "server-only";

import { getNavTree, isNavGroup, type NavGroup } from "./docs/nav";
import { galleryComponents, galleryFamilies } from "./gallery";
import { RELEASES } from "./roadmap";
import { type HeaderNav, PRIMITIVE_PICKS } from "./site-nav";

/** The counts and links the header's Library menu shows, read from the same sources as the sidebar. */
export async function getHeaderNav(primitivesHref: string): Promise<HeaderNav> {
  const tree = await getNavTree();
  const group = tree.find((node): node is NavGroup => isNavGroup(node));
  const children = group?.children ?? [];
  const bySlug = new Map(children.map((child) => [child.href.split("/").pop(), child]));

  return {
    primitives: {
      href: group?.href ?? primitivesHref,
      count: children.length,
      picks: PRIMITIVE_PICKS.flatMap((slug) => {
        const link = bySlug.get(slug);
        return link ? [{ label: link.label, href: link.href }] : [];
      }),
    },
    components: {
      count: galleryComponents.reduce((sum, component) => sum + component.count, 0),
      families: galleryFamilies.map((family) => ({
        label: family.label,
        href: `/components#${family.id}`,
        count: family.components.reduce((sum, component) => sum + component.count, 0),
      })),
    },
    version: RELEASES[0]?.version ?? "1.0.0",
  };
}
