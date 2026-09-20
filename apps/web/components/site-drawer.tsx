"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";
import type { GalleryComponent } from "../lib/gallery";
import { useDrawer } from "./drawer-context";
import { DrawerShell } from "./drawer-shell";
import { GalleryNav } from "./gallery/nav";

/**
 * The site-wide mobile nav drawer, mounted once from `app/layout.tsx` and
 * opened by the header's hamburger button. Ported from
 * `legacy-components/site-drawer.astro` and
 * `legacy-components/site-drawer-tabs.astro`.
 *
 * What is left in this file after Task 5.3a is the ROUTING judgement only:
 * whether this route gets a drawer at all, and which tree goes into it. The
 * panel, the `SITE_TABS` strip, the `inert` handling, the scroll lock, the
 * close-on-resize and the backdrop moved to `components/drawer-shell.tsx`
 * unchanged, so `/blocks` can mount its own drawer without them becoming a
 * third copy. Their comments moved with them.
 *
 * The Astro source's `hasTree`/`<slot />` branching — a page handing its own
 * tree in to sit under the tab block — is back, in three different shapes,
 * because App Router has no slot a child layout can fill upward. Under
 * `/docs` this component returns `null` entirely and
 * `components/docs/sidebar.tsx` is the drawer (Task 3.1). Under `/components`
 * the tree is threaded down as a prop from `app/layout.tsx` and rendered here
 * (Task 4.2). Under `/blocks` this component again returns `null` and
 * `components/blocks/blocks-drawer.tsx` mounts the shell from that section's
 * own layout (Task 5.3a). All three branches are guarded on `usePathname()`
 * and all three are explained where they appear below.
 *
 * `primitivesHref` is threaded down from `app/layout.tsx` for the same reason
 * `SiteHeader` takes it: the nav tree lives behind `lib/docs` (`server-only`),
 * and this is a `"use client"` component. `galleryComponents` is threaded down
 * the same way, and for the same reason, from Task 4.2 — see the `isGallery`
 * branch below for why the gallery tree comes INTO this drawer rather than
 * getting one of its own.
 */
export function SiteDrawer({
  primitivesHref,
  galleryComponents,
}: {
  primitivesHref: string;
  galleryComponents: GalleryComponent[];
}) {
  const { setOpen } = useDrawer();
  const pathname = usePathname();

  // Task 3.1 (§5): a docs page must carry exactly ONE drawer, and under
  // `/docs` that drawer is `components/docs/sidebar.tsx` — the same element
  // that is the desktop sidebar column, which additionally lists the 65
  // primitives this tabs-only drawer never could. It owns the backdrop, the
  // scroll lock, the `inert` handling and the tab block there, so this
  // component stands down entirely rather than stacking a second off-canvas
  // panel behind it.
  //
  // The rejected alternative was feeding the tree upward into this drawer:
  // a child layout cannot hand data to a parent layout during SSR, so
  // `app/layout.tsx` would have to serialize all 65 links into the client
  // payload on EVERY route (`/`, `/blocks`, `/pro`, the gallery) when Blume
  // pays for them on docs pages only.
  //
  // `usePathname()` resolves during prerender, so the suppression is
  // server-side too — the static HTML for a docs route simply has no second
  // drawer in it, not a hydration-time flip.
  const isDocs = pathname === "/docs" || pathname.startsWith("/docs/");

  // Task 5.3a (§5). `/blocks` needs a drawer carrying the site tabs AND the
  // category tree, exactly as production does. This component cannot supply
  // that tree, and the reason is NEITHER of the two above — it is not that a
  // second panel would stack (the `/docs` reason), and it is not a payload
  // size argument (the `/components` reason). It is the revalidation blast
  // radius: the category tree comes from `lib/blocks.ts`, whose fetch
  // declares `revalidate: 300`. A root-layout component reading it would
  // attach that 300-second window to EVERY route on the site and couple all
  // 85 builds to `pro.sevenui.dev` being reachable — turning a pro-repo
  // outage into a site-wide one and giving 84 routes a revalidation period
  // they have no reason to have. So `/blocks` mounts its own drawer from its
  // own layout (`components/blocks/blocks-drawer.tsx`), where the fetch
  // belongs, and this one stands down. Both render the SAME
  // `components/drawer-shell.tsx`, so there is still exactly one drawer per
  // page and exactly one copy of its machinery.
  const isBlocks = pathname === "/blocks" || pathname.startsWith("/blocks/");

  // Task 4.2 (§5). Every one of the 11 `/components` routes passed
  // `<ComponentGalleryNav>` into `site-drawer.astro`'s slot, so below `lg`
  // the drawer carried the section tabs AND the 10 gallery links, with the
  // tab block separated by a bottom rule (`site-drawer.astro`'s `hasTree`
  // branch). Without this, all 11 routes would lose their entire mobile
  // navigation.
  //
  // A child layout cannot hand content to a root-layout component in the
  // App Router, so `app/layout.tsx` resolves the list on the server and
  // passes it as a plain prop — exactly as it already threads
  // `primitivesHref` — and this flag decides whether to render it.
  // `usePathname()` resolves during prerender, so no other route's HTML
  // contains those links either; they are not hidden, they are absent.
  //
  // A second, gallery-guarded drawer (the `isDocs` shape above) was
  // rejected: it would make the backdrop, the scroll lock, the `inert`
  // handling and the resize-close a THIRD copy. That objection is what
  // `drawer-shell.tsx` now answers, and it is why `/blocks` could be given
  // its own drawer without paying the price this branch refused. The 10
  // gallery links stay here regardless: the tree is a few hundred bytes,
  // `app/layout.tsx` already resolves it, and moving it would buy nothing.
  const isGallery = pathname === "/components" || pathname.startsWith("/components/");

  // A link tap has to close the drawer; this layout persists across
  // client-side navigations, unlike Astro's full page loads. Same reason as
  // the tab links' own handler inside the shell, hoisted to a stable callback
  // because `GalleryNav` takes it as a prop.
  const closeDrawer = useCallback(() => setOpen(false), [setOpen]);

  if (isDocs || isBlocks) return null;

  return (
    <DrawerShell
      primitivesHref={primitivesHref}
      tree={isGallery ? <GalleryNav components={galleryComponents} onNavigate={closeDrawer} /> : undefined}
    />
  );
}
