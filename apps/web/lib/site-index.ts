import "server-only";

import { loadBlocksTree } from "./blocks";
import { getDocIndex } from "./docs";
import { getNavTree, isNavGroup, type NavLink } from "./docs/nav";
import { GALLERY_SLUGS } from "./gallery";
import { CUSTOM_ROUTES, requirePageMeta } from "./page-meta";
import { site } from "./site";
import { SITE_TABS } from "./site-tabs";

export const galleryRoutes: readonly string[] = [
  "/components",
  ...GALLERY_SLUGS.map((slug) => `/components/${slug}`),
];

export async function blocksRoutes(): Promise<string[]> {
  const groups = await loadBlocksTree();
  const routes = ["/blocks"];
  for (const group of groups) {
    routes.push(`/blocks/${group.id}`);
    for (const category of group.categories) {
      routes.push(`/blocks/${group.id}/${category.id}`);
    }
  }
  return routes;
}

export async function sitemapRoutes(): Promise<string[]> {
  const [index, blocks] = await Promise.all([getDocIndex(), blocksRoutes()]);
  const routes = new Set<string>([...CUSTOM_ROUTES, ...index.map((page) => page.route), ...blocks]);
  return [...routes].sort((a, b) => a.localeCompare(b));
}

const entry = (title: string, route: string, description: string): string =>
  `- [${title}](${site.url}${route}): ${description}`;

const LOOSE_PAGES_HEADING = "## Docs";

export async function buildLlmsIndex(): Promise<string> {
  const [index, tree, blocks] = await Promise.all([getDocIndex(), getNavTree(), blocksRoutes()]);

  const byRoute = new Map(index.map((page) => [page.route, page]));
  const docsEntry = (href: string): string => {
    const page = byRoute.get(href);
    if (!page) {
      throw new Error(`lib/site-index.ts: nav href "${href}" has no page in the content index`);
    }
    return entry(page.title, href, page.description);
  };

  const lines = [`# ${site.name}`, "", `> ${site.description}`];

  const looseLinks = tree.filter((node): node is NavLink => !isNavGroup(node));
  if (looseLinks.length > 0) {
    lines.push("", LOOSE_PAGES_HEADING, "");
    for (const link of looseLinks) lines.push(docsEntry(link.href));
  }

  for (const node of tree) {
    if (!isNavGroup(node)) continue;
    lines.push("", `## ${node.label}`, "");
    if (node.href !== undefined) lines.push(docsEntry(node.href));
    for (const child of node.children) lines.push(docsEntry(child.href));
  }

  const catalogs = new Map<string, readonly string[]>([
    ["/components", galleryRoutes],
    ["/blocks", blocks],
  ]);

  const sectionTabs = SITE_TABS.filter((tab) => catalogs.has(tab.path));
  if (sectionTabs.length !== catalogs.size) {
    throw new Error(
      `lib/site-index.ts: ${catalogs.size} catalogs but ${sectionTabs.length} matching site tabs — every ` +
        "catalog path must also be a lib/site-tabs.ts tab path, since SITE_TABS is what orders these " +
        "sections. A catalog with no tab would be dropped from llms.txt silently.",
    );
  }

  const sections = await Promise.all(
    sectionTabs.map(async (tab) => {
      const routes = catalogs.get(tab.path) ?? [];
      if (routes[0] !== tab.path) {
        throw new Error(
          `lib/site-index.ts: the catalog for "${tab.path}" must start with that route — it is both the ` +
            `section's heading text and its first row, and it starts with "${routes[0]}".`,
        );
      }
      return Promise.all(routes.map((route) => requirePageMeta(route, "lib/site-index.ts")));
    }),
  );

  sectionTabs.forEach((tab, i) => {
    const metas = sections[i];
    const routes = catalogs.get(tab.path) ?? [];
    lines.push("", `## ${metas[0].title}`, "");
    routes.forEach((route, j) => lines.push(entry(metas[j].title, route, metas[j].description)));
  });

  return `${lines.join("\n")}\n`;
}
