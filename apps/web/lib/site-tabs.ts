// Single source of truth for the header tabs. Consumed in two places so every
// page renders the same navigation: the custom Blume Header override
// (components/blume/Header.astro — docs pages reach the header only through
// it) and site-drawer-tabs.astro (the mobile drawer, on every page).
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
export const SITE_TABS = [
  { label: "Docs", path: "/docs", href: "/docs" },
  // `/docs/components` has no index page, so the tab links to the section's
  // first entry — the same resolution Blume applies to an index-less section.
  //
  // TODO(Stage 3, §5): this `href` is hard-coded to the current first
  // primitive. It should derive from `lib/docs/nav.ts`'s first primitive
  // child instead, because hard-coding it is a latent bug the day a
  // primitive sorts ahead of `accordion` — but that module doesn't exist
  // until Stage 3. Task 3.1 replaces this literal.
  { label: "Primitives", path: "/docs/components", href: "/docs/components/accordion" },
  { label: "Components", path: "/components", href: "/components" },
  { label: "Blocks", path: "/blocks", href: "/blocks" },
  { label: "Pro", path: "/pro", href: "/pro" },
];

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
 */
export function currentTabForRoute(pathname: string): string | undefined {
  let best: { path: string; href: string } | undefined;
  for (const tab of SITE_TABS) {
    if (pathname === tab.path || pathname.startsWith(`${tab.path}/`)) {
      if (!best || tab.path.length > best.path.length) best = tab;
    }
  }
  return best?.href;
}
