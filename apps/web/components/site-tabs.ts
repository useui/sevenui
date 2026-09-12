// Single source of truth for the header tabs. Consumed in two places so
// every page renders the same header: the custom Blume Header override
// (components/blume/Header.astro — docs pages go through it) and the
// PageLayout pages that build their own navigation prop (landing, blocks).
// Paths are in final URL space: `path` drives the active-tab match, `href`
// is the link target.
export const SITE_TABS = [
  { label: "Docs", path: "/docs", href: "/docs" },
  { label: "Components", path: "/components", href: "/components" },
  { label: "Blocks", path: "/blocks", href: "/blocks" },
  { label: "Pro", path: "/pro", href: "/pro" },
];
