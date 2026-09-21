// Single source of truth for the header tabs. `getSiteTabs()` is imported by
// three renderers today so every page shows the same navigation:
// `components/site-header.tsx` (the header, on every page),
// `components/drawer-shell.tsx` (the shared mobile-drawer machinery, mounted
// by `site-drawer.tsx` for most routes and by `blocks/blocks-drawer.tsx` for
// `/blocks`), and `components/docs/sidebar.tsx` (the docs section's own
// mobile drawer, which replaces `site-drawer.tsx` under `/docs` — Task 3.1).
//
// Paths are in final URL space: `path` drives the active-tab match, `href` is
// the link target. Matching is longest-prefix, which is what lets `Primitives`
// (`/docs/components`) claim a route that `Docs` (`/docs`) also spans.
//
// VOCABULARY. Three tiers by composition size, named here and nowhere else:
//
//   Primitives  the installable units (`npx shadcn add @sevenui/button`),
//               documented under /docs/components/* — the URL keeps the older
//               `components` segment, since renaming 65 published pages buys
//               nothing a label does not.
//   Components  composed, copyable usage of those primitives (/components),
//               free, installed from `/r/component/*`.
//   Blocks      full pro sections and pages (/blocks).
//
// `Docs` is the guides only — installation and theming. Before this split it
// also owned the primitive pages, so it and the old `Components` tab both led
// into the same tree while `Components` ALSO named the gallery: one word for
// two things, and two tabs for one thing.
export type SiteTab = { label: string; path: string; href: string };

// `/docs/components` has no index page, so the Primitives tab links to the
// section's first entry — the same resolution Blume applies to an
// index-less section. `PRIMITIVES_PATH` also identifies that tab for
// `getSiteTabs` below, so its `href` can be swapped for the derived one
// without matching on `label` (a display string) or on array position.
const PRIMITIVES_PATH = "/docs/components";

export const SITE_TABS: SiteTab[] = [
  { label: "Docs", path: "/docs", href: "/docs" },
  // This `href` is the value used when nobody resolves one — not a
  // fallback awaiting a later stage, because no later stage changes this.
  // The reason is structural and permanent, not temporal: this module is
  // imported by two `"use client"` components (`SiteHeader`, `SiteDrawer`),
  // `lib/docs/nav.ts` (which knows the real value) is `server-only`, and
  // resolving it is async. A module-level constant can never do all three
  // at once, in any stage. Every render path resolves the real value
  // through `getSiteTabs(primitivesHref)` instead — see `app/layout.tsx`,
  // the one server component in the tree that can read `lib/docs/nav.ts`
  // and pass its result down as a plain string prop.
  { label: "Primitives", path: PRIMITIVES_PATH, href: "/docs/components/accordion" },
  { label: "Components", path: "/components", href: "/components" },
  { label: "Blocks", path: "/blocks", href: "/blocks" },
  { label: "Pro", path: "/pro", href: "/pro" },
];

/**
 * Returns `SITE_TABS` with the Primitives tab's `href` replaced by
 * `primitivesHref` — everything else byte-identical, same order, same
 * object shape. A new array each call rather than a mutation, so nothing
 * can observe a stale value from a previous request.
 *
 * Why a function returning a resolved array, and not a separate
 * `primitivesHref` prop applied ad hoc at render time: `currentTabForRoute`
 * decides the active tab by finding the matching entry and returning THAT
 * entry's own `href` (`best?.href` below) — not by recomputing one. If the
 * rendered `<Link href>` used a resolved value while `currentTabForRoute`
 * kept matching against the stale module-level constant, the two would
 * agree today (the first primitive already is `accordion`) and silently
 * disagree the day it isn't, breaking `aria-current` instead of the link
 * target — the exact latent bug this task exists to remove, relocated
 * rather than fixed. Resolving once into a single array and reading both
 * the rendered `href` and the active-tab match off that same array keeps
 * them from ever being able to disagree.
 */
export function getSiteTabs(primitivesHref: string): SiteTab[] {
  return SITE_TABS.map((tab) => (tab.path === PRIMITIVES_PATH ? { ...tab, href: primitivesHref } : tab));
}

/**
 * The tab whose `path` is the longest prefix of `pathname` — the same
 * longest-prefix rule as Blume's `activeTabForRoute`
 * (blume/components/layout/nav-utils.ts:79-93), matched against `path` (not
 * `href`) for the reason the header comment above states: `path` is what
 * lets `Primitives` (`/docs/components`) claim a route that `Docs` (`/docs`)
 * also spans. Returns the matched tab's `href` (the link target) so callers
 * can compare it against a tab's own `href` for `aria-current`, or
 * `undefined` when no tab claims the route.
 *
 * Deliberately narrower than Blume's version: no `root` parameter and no
 * archived-version-tree carve-out (`isRootTab`/`currentTabForRoute` in the
 * source above) — none of `SITE_TABS` is a root tab (`/`) and this site has
 * no version snapshots, so that branch never fires here.
 *
 * `tabs` is REQUIRED, deliberately — no default of `SITE_TABS`. A default
 * would be a trap: `SITE_TABS`'s own Primitives `href` is the permanent
 * placeholder literal (see the comment above it), so a caller that forgot
 * to pass the resolved array would silently get that stale href back with
 * no type error and no runtime error — exactly wrong the day a primitive
 * sorts ahead of `accordion`, and exactly the kind of quiet-wrong-answer
 * this migration's other fail-loud mechanisms (`useDrawer()`, `<JsonLd>`,
 * `app/layout.tsx`'s own Primitives-href check) refuse to allow. Passing
 * `SITE_TABS` explicitly, as `lib/docs/links.ts` does, is one extra
 * argument at the one call site that only cares about `path`; that is
 * cheaper than a href that goes wrong without ever raising an error.
 * `SiteHeader`/`SiteDrawer` pass their `getSiteTabs(primitivesHref)`
 * -resolved array instead, so the active-tab match and the rendered link
 * agree — see `getSiteTabs`'s doc comment. The matching rule itself —
 * longest-prefix on `path`, never `href` — is unchanged either way.
 */
export function currentTabForRoute(pathname: string, tabs: SiteTab[]): string | undefined {
  let best: SiteTab | undefined;
  for (const tab of tabs) {
    if (pathname === tab.path || pathname.startsWith(`${tab.path}/`)) {
      if (!best || tab.path.length > best.path.length) best = tab;
    }
  }
  return best?.href;
}
