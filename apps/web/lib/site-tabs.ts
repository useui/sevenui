export type SiteTab = { label: string; path: string; href: string };

const PRIMITIVES_PATH = "/docs/components";

export const SITE_TABS: SiteTab[] = [
  { label: "Docs", path: "/docs", href: "/docs" },
  { label: "Primitives", path: PRIMITIVES_PATH, href: "/docs/components/accordion" },
  { label: "Components", path: "/components", href: "/components" },
  { label: "Blocks", path: "/blocks", href: "/blocks" },
  { label: "Pro", path: "/pro", href: "/pro" },
];

export function getSiteTabs(primitivesHref: string): SiteTab[] {
  return SITE_TABS.map((tab) => (tab.path === PRIMITIVES_PATH ? { ...tab, href: primitivesHref } : tab));
}

export function currentTabForRoute(pathname: string, tabs: SiteTab[]): string | undefined {
  let best: SiteTab | undefined;
  for (const tab of tabs) {
    if (pathname === tab.path || pathname.startsWith(`${tab.path}/`)) {
      if (!best || tab.path.length > best.path.length) best = tab;
    }
  }
  return best?.href;
}
