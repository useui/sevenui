"use client";

import { DrawerShell } from "../drawer-shell";
import { BlocksNav, type BlocksNavGroup } from "./blocks-nav";

/**
 * The /blocks mobile nav drawer: the site tabs plus the category tree,
 * exactly as production ships it (`<SiteDrawer route="/blocks">` with the
 * category nav in its slot).
 *
 * It exists as its own component, rather than `components/site-drawer.tsx`
 * growing a third branch, because the root layout cannot read the manifest:
 * `lib/blocks.ts`'s fetch declares `revalidate: 300`, and a root-layout
 * component reading it would give every route on the site that window and
 * couple all 85 builds to `pro.sevenui.dev`. The full argument, and the
 * matching `null` return that keeps a /blocks page from carrying two drawers,
 * are in `site-drawer.tsx`'s own `/blocks` guard.
 *
 * All of the drawer machinery — panel, `inert`, scroll lock, backdrop,
 * close-on-resize, the tab strip — comes from the shared
 * `components/drawer-shell.tsx`, so this is genuinely a second MOUNT and not
 * a second copy. Task 5.2 renders it from `app/blocks/layout.tsx`, which is
 * also where the manifest is read and each group's icon element is built —
 * see `blocks-nav.tsx` for the prop shape and why the icon crosses the
 * boundary already rendered.
 */
export function BlocksDrawer({
  primitivesHref,
  groups,
}: {
  primitivesHref: string;
  groups: BlocksNavGroup[];
}) {
  return (
    <DrawerShell
      primitivesHref={primitivesHref}
      tree={
        <nav aria-label="Block categories">
          <BlocksNav groups={groups} />
        </nav>
      }
    />
  );
}
