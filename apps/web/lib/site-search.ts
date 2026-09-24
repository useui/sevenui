import "server-only";

import { FAQ as PRO_FAQ } from "../app/pro/faq";
import { FAQ as SUPPORT_FAQ } from "../app/support/faq";
import { loadBlocksTree, type Group } from "./blocks";
import { SITE_SECTIONS, type SearchEntry } from "./docs/search";
import { GALLERY_SLUGS, galleryComponent, galleryExamples } from "./gallery";
import { CUSTOM_ROUTES, requirePageMeta } from "./page-meta";
import { RELEASES, UPCOMING } from "./roadmap";

const FILE = "lib/site-search.ts";

/**
 * Extra searchable text for a custom page, taken from the data the page itself
 * renders — never retyped here. Pages without an entry are found by title and
 * description alone.
 */
const PAGE_BODIES: Record<string, () => string> = {
  "/pro": () => PRO_FAQ.map((entry) => entry.q).join(" "),
  "/support": () => SUPPORT_FAQ.map((entry) => entry.q).join(" "),
  "/roadmap": () =>
    [
      ...UPCOMING.items.map((item) => `${item.title}. ${item.description}`),
      ...RELEASES.map((release) => `${release.title} (${release.version}). ${release.summary}`),
    ]
      .join(" ")
      .replaceAll("`", ""),
};

const galleryRoute = (slug: string): string => `/components/${slug}`;

/** The free component gallery: one entry per collection page, one per component (its anchor on that page). */
async function componentEntries(): Promise<SearchEntry[]> {
  const section = SITE_SECTIONS.components;
  const meta = await requirePageMeta("/components", FILE);
  const entries: SearchEntry[] = [
    { route: "/components", title: meta.title, description: meta.description, section },
  ];

  for (const slug of GALLERY_SLUGS) {
    const route = galleryRoute(slug);
    const { label } = galleryComponent(slug);
    const pageMeta = await requirePageMeta(route, FILE);
    // "Button components", as the page's own <title> reads — a bare "Button" would tie the primitive docs page.
    const pageTitle = `${pageMeta.title} components`;
    entries.push({ route, title: pageTitle, description: pageMeta.description, section });
    for (const example of galleryExamples(slug)) {
      entries.push({
        route,
        hash: example.id,
        title: example.title,
        pageTitle,
        description: example.description,
        // Keywords only: lets "dialog" find a dialog component whose title does not say so.
        body: `${label} ${slug} ${example.id}`,
        section,
      });
    }
  }
  return entries;
}

/** The Pro block directory: the index, each group and category page, and each block (its anchor on the category page). */
async function blockEntries(groups: Group[]): Promise<SearchEntry[]> {
  const section = SITE_SECTIONS.blocks;
  const meta = await requirePageMeta("/blocks", FILE);
  const entries: SearchEntry[] = [
    {
      route: "/blocks",
      title: meta.title,
      description: meta.description,
      body: groups.flatMap((group) => [group.label, ...group.categories.map((c) => c.label)]).join(" "),
      section,
    },
  ];

  for (const group of groups) {
    const groupRoute = `/blocks/${group.id}`;
    const groupMeta = await requirePageMeta(groupRoute, FILE);
    entries.push({
      route: groupRoute,
      title: groupMeta.title,
      description: groupMeta.description,
      body: group.categories.map((category) => category.label).join(" "),
      section,
    });

    for (const category of group.categories) {
      const route = `${groupRoute}/${category.id}`;
      const categoryMeta = await requirePageMeta(route, FILE);
      entries.push({
        route,
        title: categoryMeta.title,
        description: categoryMeta.description,
        body: `${group.label} blocks`,
        section,
      });
      // Public manifest metadata only — the gated block source never reaches the index.
      for (const item of category.items) {
        entries.push({
          route,
          hash: item.name,
          title: item.title,
          pageTitle: categoryMeta.title,
          description: item.description,
          body: `${group.label} ${category.label} ${item.name} pro block`,
          section,
        });
      }
    }
  }
  return entries;
}

/** Every custom route that is not part of the component gallery or the block directory. */
export function loosePageRoutes(): string[] {
  return [...CUSTOM_ROUTES].filter(
    (route) => route !== "/components" && !route.startsWith("/components/") && route !== "/blocks",
  );
}

async function pageEntries(): Promise<SearchEntry[]> {
  return Promise.all(
    loosePageRoutes().map(async (route) => {
      const meta = await requirePageMeta(route, FILE);
      const body = PAGE_BODIES[route]?.();
      return {
        route,
        title: meta.title,
        description: meta.description,
        ...(body ? { body } : {}),
        section: SITE_SECTIONS.pages,
      };
    }),
  );
}

export type SiteSearchEntries = {
  entries: SearchEntry[];
  /** The block tree the entries were built from, for the invariant checks. */
  groups: Group[];
};

/** Everything outside /docs: pages, the free component gallery, and the Pro block directory. */
export async function buildSiteSearchEntries(): Promise<SiteSearchEntries> {
  // Throws when the Pro manifest is unreachable, like /blocks, sitemap.xml and llms.txt: the build
  // fails (after pro-manifest.ts's retries) and a failed ISR regeneration keeps serving the last good index.
  const groups = await loadBlocksTree();
  const [pages, components, blocks] = await Promise.all([
    pageEntries(),
    componentEntries(),
    blockEntries(groups),
  ]);
  return { entries: [...pages, ...components, ...blocks], groups };
}
