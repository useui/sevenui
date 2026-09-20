import type { ComponentType, ReactNode, SVGProps } from "react";
import { TooltipProvider } from "@/registry/base/ui/tooltip";
import { BlocksAnnouncer } from "../../components/blocks/blocks-announcer";
import { BlocksDrawer } from "../../components/blocks/blocks-drawer";
import { BlocksLoadGate } from "../../components/blocks/blocks-load-gate";
import type { BlocksNavGroup } from "../../components/blocks/blocks-nav";
import { BlocksSidebar } from "../../components/blocks/blocks-sidebar";
import { ThemeDock } from "../../components/blocks/theme-dock";
import { loadBlocksTree } from "../../lib/blocks";
import { getNavTree, resolvePrimitivesHref } from "../../lib/docs/nav";
import { lucideIcon } from "../../lib/pro-manifest";

/**
 * The shell all three `/blocks` routes share (§5, §11.1): the two-column
 * layout, the desktop category column, the content column wrapper, the theme
 * dock at the end of that column, and the section's own nav drawer.
 *
 * FACTORING IT IS SOUND, and it was checked rather than assumed. The three
 * Astro sources (`legacy-pages/blocks/index.astro`, `[group]/index.astro`,
 * `[group]/[category].astro`) carry the same wrapper, the same sidebar, the
 * same `min-w-0` content column, the same `<BlocksThemeDock />` as that
 * column's last child, and the same `<SiteDrawer route=…>` after it. They
 * differ in exactly one element: the category page — and only it — also
 * renders `<BlocksPrefs />` as the content column's FIRST child. That
 * difference is kept, and split three ways below.
 *
 * WHY THIS IS THE LAYOUT AND NOT THREE PAGES REPEATING IT. Mounting the tree
 * here is what makes a category click a client-side navigation with the
 * sidebar, the drawer, the tooltip context, the live region and the preview
 * queue all surviving it — which is the migration's whole point. It is also
 * the one place in this subtree allowed to read the manifest: `lib/blocks.ts`
 * is `server-only` and every consumer below is `"use client"`.
 *
 * `revalidate = 300` is the section's ISR window. The manifest fetch declares
 * the same 300 in `lib/pro-manifest.ts`; this is the route segment's half of
 * it, and it is here rather than in the root layout for the reason written
 * out in `components/site-drawer.tsx`'s `/blocks` guard — a root-layout read
 * would hand all 85 routes this window and couple every one of them to
 * `pro.sevenui.dev`.
 *
 * ONE FETCH, NOT ONE PER PAGE. `loadBlocksTree()` is called here AND by each
 * page AND by `generateStaticParams` AND by `getPageMeta`'s `/blocks/` branch.
 * That is not four network requests: `loadProManifest`'s `fetch` is keyed by
 * URL in Next's Data Cache, so the first caller in a render pass pays for it
 * and the rest read the entry. The rejected shape — a module-scope
 * `await loadProManifest()`, which is what Astro had — is argued down in
 * `lib/blocks.ts`'s header: it would pin the tree to whatever the first render
 * saw and the revalidation window could never refresh it.
 *
 * THE THREE PAGE SINGLETONS, which `legacy-components/blocks-prefs.astro`
 * rendered together on the category page only. They are split deliberately:
 *
 *   - the LIVE REGION (`<BlocksAnnouncer>`) is here, so every `/blocks` page
 *     carries exactly one — including the two that never announce. What they
 *     gain is an empty `sr-only` element that §17.2's extractor cannot see;
 *     what the alternative costs is a context provider mounted where its own
 *     DOM node is not, which is a shape that fails silently the first time a
 *     card moves.
 *   - the PACKAGE-MANAGER SPRITE (`<PackageManagerIcons />`) is NOT here. It
 *     is ~10 KB of path data, and the only thing that references it is the
 *     install control's `<use href="#pm-icon-*">`, which exists on the
 *     category page and nowhere else. It is rendered there.
 *   - the TOOLTIP CONTEXT (`<TooltipProvider>`) is here. It emits no markup at
 *     all, so putting it above all three costs nothing and removes the
 *     question of which pages need it.
 *
 * `<BlocksLoadGate>` joins them for the same reason as the live region: the
 * preview queue's concurrency cap can only be enforced by something that sees
 * every card at once, so it lives above them all. It emits no markup either.
 *
 * The fourth job of `blocks-prefs.astro` — the package-manager PREFERENCE —
 * is not rebuilt anywhere: `components/package-manager-script.tsx` writes
 * `<html data-pm>` pre-paint from the root layout, and `app/globals.css`
 * reveals exactly one of four server-rendered commands.
 *
 * No `<main>` and no page chrome: `app/layout.tsx` owns the document (§11.1)
 * and the root `<main id="content">` is the skip link's target, exactly as in
 * `app/docs/layout.tsx` and `app/components/layout.tsx`.
 */
export const revalidate = 300;

// Each group's icon is rendered HERE and handed to the nav tree as a finished
// element, because `blocks-nav.tsx` is `"use client"` and `lucideIcon` lives
// behind `server-only` (it reaches into lucide-react's ~1,800-entry record).
// The class string is the chevron's own, in `blocks-nav.tsx`'s `<summary>`,
// minus the two utilities the chevron adds for its own row behaviour and its
// open-state rotation — the same icon dimension and the same muted foreground.
// Verified against production's shipped HTML for `/blocks`, where the group
// mark carries exactly this pair.
const GROUP_ICON_CLASS = "size-3.5 text-muted-foreground";

export default async function BlocksLayout({ children }: { children: ReactNode }) {
  // Two independent reads, so they overlap rather than queue. `getNavTree()`
  // is a memoized filesystem pass the root layout has already made;
  // `loadBlocksTree()` is the manifest.
  const [groups, tree] = await Promise.all([loadBlocksTree(), getNavTree()]);

  // Same resolution, same owner and the same fail-loud check as
  // `app/layout.tsx` and `app/docs/layout.tsx`: the drawer's tab block is the
  // mobile route to Blocks and Pro, and its Primitives entry links to the
  // first primitive.
  const primitivesHref = resolvePrimitivesHref(tree);
  if (!primitivesHref) {
    throw new Error("app/blocks/layout.tsx: nav tree has no Primitives group with a resolvable href");
  }

  // `blocks-nav.tsx`'s header states this mapping and this file is its one
  // implementation. Both counts come off the JOINED tree's own arrays, never
  // off the raw manifest — `lib/blocks.ts` has already decided which items
  // belong to which category and which categories to which group, and a second
  // count derived from the flat arrays would be free to disagree with the
  // categories the sidebar actually lists. Descriptions and cover assets are
  // left out on purpose: this tree renders neither, and they are the bulk of
  // the manifest's bytes in the flight payload.
  const navGroups: BlocksNavGroup[] = groups.map((group) => {
    // `lucideIcon` is declared as returning `(props) => unknown` so that
    // `lib/pro-manifest.ts` need not name a React type; JSX wants a component
    // type, so the narrowing happens at the call site rather than by widening
    // that module's contract.
    const Icon = group.icon
      ? (lucideIcon(group.icon) as ComponentType<SVGProps<SVGSVGElement>>)
      : null;
    return {
      id: group.id,
      label: group.label,
      itemCount: group.items.length,
      icon: Icon ? <Icon aria-hidden="true" className={GROUP_ICON_CLASS} /> : null,
      categories: group.categories.map((category) => ({
        id: category.id,
        label: category.label,
        itemCount: category.items.length,
      })),
    };
  });

  return (
    <TooltipProvider>
      <BlocksAnnouncer>
        <BlocksLoadGate>
          {/*
            Ported from the three Astro sources' shared wrapper, unchanged:
            a 260px navigation track beside a `minmax(0,1fr)` content track
            above the large breakpoint, and a single column below it.
          */}
          <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
            <BlocksSidebar groups={navGroups} />
            <div className="min-w-0">
              {children}
              {/*
                Last child of the content column, exactly where each Astro page
                put it. EXACTLY ONE PER PAGE is the rule its own header states:
                two instances would both write `localStorage["preset-config"]`
                while showing two independent pressed states. Rendering it here
                rather than from the three pages is what makes that structural
                instead of a convention three files have to keep.
              */}
              <ThemeDock />
            </div>
          </div>
          {/*
            The section's own drawer, and the reason it is not
            `components/site-drawer.tsx` is in that file's `/blocks` guard:
            the root layout cannot read the manifest without giving every route
            on the site this revalidation window. Both mount the same
            `components/drawer-shell.tsx`, so there is still exactly one drawer
            per page and one copy of its machinery. This is also the tree's
            SECOND mount — the desktop column above is the first — which is
            what production ships too.
          */}
          <BlocksDrawer groups={navGroups} primitivesHref={primitivesHref} />
        </BlocksLoadGate>
      </BlocksAnnouncer>
    </TooltipProvider>
  );
}
