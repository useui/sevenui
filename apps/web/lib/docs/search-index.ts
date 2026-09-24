import "server-only";

import { getDocIndex, type DocPage } from "./index";
import { stripFences } from "./headings";
import { buildNavTree, isNavGroup, type NavNode } from "./nav";
import componentsRegistry from "../../../../packages/registry/components/registry.json";
import type { Group } from "../blocks";
import { GALLERY_SLUGS } from "../gallery";
import { buildSiteSearchEntries, loosePageRoutes } from "../site-search";
import { POPULAR, SITE_SECTIONS, type SearchEntry } from "./search";

const GENERIC_HEADINGS = new Set(["Installation", "Usage", "API reference"]);

const JSX_OR_HTML_TAG = /<\/?[a-zA-Z][^\n<>]*>|<\/?>/g;

const MDX_IMPORT_EXPORT_LINE = /^[ \t]*(?:import|export)\b.*$/gm;

const MARKDOWN_HEADING_MARKER = /^[ \t]{0,3}#{1,6}[ \t]+/gm;

const MARKDOWN_TABLE_SEPARATOR_ROW =
  /^[ \t]*\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)*\|?[ \t]*$/gm;

const MARKDOWN_ESCAPED_PIPE = /\\\|/g;
const MARKDOWN_TABLE_PIPE = /\|/g;

const MARKDOWN_LINK = /\[([^\]\n]+)\]\([^)\n]+\)/g;

const MARKDOWN_EMPHASIS_MARKER = /\*\*|\*|__|_|~~|`/g;

const WHITESPACE_RUN = /\s+/g;

function toSearchBody(raw: string): string {
  return stripFences(raw)
    .replace(MDX_IMPORT_EXPORT_LINE, " ")
    .replace(JSX_OR_HTML_TAG, " ")
    .replace(MARKDOWN_HEADING_MARKER, "")
    .replace(MARKDOWN_TABLE_SEPARATOR_ROW, "")
    .replace(MARKDOWN_ESCAPED_PIPE, "|")
    .replace(MARKDOWN_TABLE_PIPE, " ")
    .replace(MARKDOWN_LINK, "$1")
    .replace(MARKDOWN_EMPHASIS_MARKER, "")
    .replace(WHITESPACE_RUN, " ")
    .trim();
}

function buildSectionIndex(tree: NavNode[]): Map<string, string> {
  const sections = new Map<string, string>();
  const walk = (nodes: NavNode[], section: string): void => {
    for (const node of nodes) {
      if (isNavGroup(node)) {
        if (node.href !== undefined) sections.set(node.href, node.label);
        walk(node.children, node.label);
      } else {
        sections.set(node.href, section);
      }
    }
  };
  walk(tree, "Docs");
  return sections;
}

const MIN_TOTAL_BODY_CHARS = 40_000;

function assertSearchIndex(entries: SearchEntry[], pages: DocPage[]): void {
  if (entries.length === 0) {
    throw new Error(
      "lib/docs/search-index.ts: the search index has zero entries; a vacuous index must fail the build, not diff clean",
    );
  }

  const pageEntries = entries.filter((e) => e.hash === undefined);
  const headingEntries = entries.filter((e) => e.hash !== undefined);

  if (pageEntries.length !== pages.length) {
    throw new Error(
      `lib/docs/search-index.ts: expected ${pages.length} page entries (one per content-index page), found ${pageEntries.length}`,
    );
  }
  if (pageEntries.length + headingEntries.length !== entries.length) {
    throw new Error(
      `lib/docs/search-index.ts: ${pageEntries.length} page entries + ${headingEntries.length} heading entries ` +
        `!== ${entries.length} total entries`,
    );
  }

  const totalBodyChars = pageEntries.reduce((sum, e) => sum + (e.body?.length ?? 0), 0);
  if (totalBodyChars < MIN_TOTAL_BODY_CHARS) {
    throw new Error(
      `lib/docs/search-index.ts: total page body length is ${totalBodyChars} characters, below the ` +
        `${MIN_TOTAL_BODY_CHARS}-character floor — toSearchBody may be silently emptying body text ` +
        `(measured ~80,600 characters on a healthy corpus; see MIN_TOTAL_BODY_CHARS above)`,
    );
  }

  const normalize = (s: string): string => s.trim().toLowerCase();
  const normalizedGeneric = new Set([...GENERIC_HEADINGS].map(normalize));
  for (const entry of headingEntries) {
    if (normalizedGeneric.has(normalize(entry.title))) {
      throw new Error(
        `lib/docs/search-index.ts: heading "${entry.title}" on ${entry.route}#${entry.hash} is a case/whitespace ` +
          `variant of a generic heading that should have been excluded (compare against: ${[...GENERIC_HEADINGS].join(", ")})`,
      );
    }
  }
}

const MIN_BLOCK_ITEMS = 1;

function fail(message: string): never {
  throw new Error(`lib/docs/search-index.ts: ${message}`);
}

/** Guards the non-docs part: every page, component and block the site shows has its entry, and nothing leaks into /docs. */
function assertSiteEntries(entries: SearchEntry[], groups: Group[]): void {
  const pageRoutes = new Set(entries.filter((e) => e.hash === undefined).map((e) => e.route));
  const hrefs = new Set(entries.filter((e) => e.hash !== undefined).map((e) => `${e.route}#${e.hash}`));

  for (const entry of entries) {
    if (entry.route === "/docs" || entry.route.startsWith("/docs/")) {
      fail(`site entry "${entry.title}" points into /docs (${entry.route}); docs pages come from the content index only`);
    }
  }

  for (const route of loosePageRoutes()) {
    if (!pageRoutes.has(route)) fail(`page-meta route "${route}" has no entry in the Pages section`);
  }

  for (const slug of GALLERY_SLUGS) {
    if (!pageRoutes.has(`/components/${slug}`)) fail(`gallery page /components/${slug} has no entry`);
  }
  for (const item of componentsRegistry.items) {
    const slug = item.files[0].path.split("/")[0];
    if (!hrefs.has(`/components/${slug}#${item.name}`)) {
      fail(`component "${item.name}" from packages/registry/components/registry.json has no entry at /components/${slug}#${item.name}`);
    }
  }
  const componentItems = entries.filter((e) => e.section === SITE_SECTIONS.components && e.hash !== undefined);
  if (componentItems.length !== componentsRegistry.items.length) {
    fail(
      `expected ${componentsRegistry.items.length} component entries (one per registry item), found ${componentItems.length}`,
    );
  }

  let blockItems = 0;
  for (const group of groups) {
    if (!pageRoutes.has(`/blocks/${group.id}`)) fail(`block group /blocks/${group.id} has no entry`);
    for (const category of group.categories) {
      const route = `/blocks/${group.id}/${category.id}`;
      if (!pageRoutes.has(route)) fail(`block category ${route} has no entry`);
      for (const item of category.items) {
        if (!hrefs.has(`${route}#${item.name}`)) fail(`block "${item.name}" has no entry at ${route}#${item.name}`);
        blockItems++;
      }
    }
  }
  if (blockItems < MIN_BLOCK_ITEMS) {
    fail("the Pro manifest yielded no blocks — refusing to publish a search index with an empty Blocks section");
  }
}

/** Whole-index checks: rows are keyed by href, and every POPULAR link must land on an indexed page. */
function assertWholeIndex(entries: SearchEntry[]): void {
  const seen = new Set<string>();
  for (const entry of entries) {
    const href = entry.hash === undefined ? entry.route : `${entry.route}#${entry.hash}`;
    if (seen.has(href)) fail(`duplicate href "${href}" — the palette keys rows by href`);
    seen.add(href);
  }

  const pageRoutes = new Set(entries.filter((e) => e.hash === undefined).map((e) => e.route));
  for (const popular of POPULAR) {
    if (!popular.href.startsWith("/")) {
      fail(`POPULAR entry "${popular.href}" must be a root-relative path (there is no basePath)`);
    }
    if (!pageRoutes.has(popular.href)) fail(`POPULAR entry "${popular.href}" has no matching page in the search index`);
  }
}

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const pages = await getDocIndex();
  const sections = buildSectionIndex(buildNavTree(pages));

  const entries: SearchEntry[] = [];
  for (const page of pages) {
    const section = sections.get(page.route) ?? "Docs";

    entries.push({
      route: page.route,
      title: page.title,
      description: page.description,
      body: toSearchBody(page.raw),
      section,
    });

    for (const heading of page.headings) {
      if (GENERIC_HEADINGS.has(heading.text)) continue;
      entries.push({
        route: page.route,
        hash: heading.id,
        title: heading.text,
        pageTitle: page.title,
        section,
      });
    }
  }

  assertSearchIndex(entries, pages);

  const site = await buildSiteSearchEntries();
  assertSiteEntries(site.entries, site.groups);

  const all = [...entries, ...site.entries];
  assertWholeIndex(all);
  return all;
}
