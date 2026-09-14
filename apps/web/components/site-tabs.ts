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
  { label: "Primitives", path: "/docs/components", href: "/docs/components/accordion" },
  { label: "Components", path: "/components", href: "/components" },
  { label: "Blocks", path: "/blocks", href: "/blocks" },
  { label: "Pro", path: "/pro", href: "/pro" },
];
