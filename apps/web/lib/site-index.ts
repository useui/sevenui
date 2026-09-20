// The site's own list of the pages it publishes, and the one Markdown
// rendering of that list (§15.4). Three route handlers read this module —
// `app/llms.txt/route.ts`, `app/index.md/route.ts` and `app/sitemap.ts` —
// and they read it for the same reason: the three surfaces disagreeing about
// which pages exist is the defect this file removes. Production disagreed:
// `sitemap.xml` carried `/blocks` but none of its group or category children,
// and `llms.txt` carried neither `/blocks` nor the gallery at all, because
// Blume's `buildLlmsIndex` walked its own navigation and the gallery and
// blocks surfaces are not Blume page records.
//
// WHY THIS IS A MODULE AND NOT A HELPER EXPORTED FROM ONE OF THOSE HANDLERS:
// `app/sitemap.ts` is one of the three consumers, and a sitemap importing from
// a sibling `route.ts` would be nonsense — so a shared module is the only
// shape three consumers can have. It is NOT because a route file rejects a
// non-HTTP-method named export; that was this file's original stated reason
// and it is false for this Next version. Measured, not assumed: the generated
// `apps/web/.next/types/validator.ts` checks each handler with a bare
// `type __IsExpected<Specific extends RouteHandlerConfig<"/llms.txt">> =
// Specific`, and a generic `extends` constraint performs no excess-property
// check (only an object literal assigned to a typed target does) — the Next
// 13/14 validator form that did reject extra exports is gone. Reproducing that
// constraint shape standalone and running this repo's own compiler over a
// module exporting `GET`, `revalidate` AND a helper exits 0 (tsc 7.0.2,
// `--strict`). Recorded because a false "why" is the expensive kind: the next
// reader believes route files cannot share, and copies a helper into two
// handlers rather than importing one — the exact drift this file prevents.
//
// NOTHING HERE IS A COUNT. The blocks half is manifest-derived and drifts
// (Ruling 58; `scripts/route-inventory.mjs`'s header says the same thing about
// the same data), so no function below returns, asserts or compares a number
// of routes, and the prose above names none either. `blocksRoutes()` reports
// what the manifest says at the moment it is called.
//
// `loadBlocksTree()` is called per render, NOT hoisted to module scope — see
// `lib/blocks.ts`'s header for why a module-level promise would pin the whole
// server process to the first render's snapshot and make `revalidate` a no-op.
// The three handlers above share one `fetch` anyway, because Next's Data Cache
// is keyed by URL: `sitemap.ts` and `llms.txt` asking in the same revalidation
// window cost one request between them, which is the entire reason §15.4 could
// afford to list the blocks routes at all.
import "server-only";

import { loadBlocksTree } from "./blocks";
import { getDocIndex } from "./docs";
import { getNavTree, isNavGroup, type NavLink } from "./docs/nav";
import { GALLERY_SLUGS } from "./gallery";
import { CUSTOM_ROUTES, requirePageMeta } from "./page-meta";
import { site } from "./site";
import { SITE_TABS } from "./site-tabs";

/**
 * `/components` and its ten gallery pages, derived from the same pinned
 * `GALLERY_SLUGS` that `app/components/[name]/page.tsx` returns from
 * `generateStaticParams` — so this list and the route set are the same list,
 * and a slug added to one cannot be missing from the other.
 */
export const galleryRoutes: readonly string[] = [
  "/components",
  ...GALLERY_SLUGS.map((slug) => `/components/${slug}`),
];

/**
 * Every `/blocks` route, in the tree's own reading order: the directory, then
 * each group followed by its own categories. That is the order the `/blocks`
 * pages present them in, and the order a reader would meet them — as opposed
 * to `sitemapRoutes()` below, which sorts, because a sitemap has no reader.
 *
 * The route strings are built here rather than taken from the manifest's own
 * fields: the manifest knows ids and parents (`category.group`), not URLs.
 * The two-level shape — group, then `group/category`, nothing deeper — is the
 * same one `lib/page-meta.ts`'s `/blocks/` branch parses back out, and the
 * same one `app/blocks/[group]/[category]` serves.
 */
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

/**
 * Every route `sitemap.xml` lists (§15.7), sorted.
 *
 * Assembled from three sources and no fourth, each of which is already the
 * authority for its own half of the site:
 *
 *  - `CUSTOM_ROUTES` — the hand-declared pages in `lib/page-meta.ts`:
 *    `/`, `/account`, `/privacy`, `/pro`, `/terms`, plus `/components` and
 *    its ten gallery children and `/blocks` itself. Reused rather than
 *    re-listed precisely because it is already the one place those routes are
 *    written down; a page added there reaches the sitemap with no second edit.
 *  - the content index — every `/docs` route, including §11.3's
 *    `/docs/components`, which arrives here for free because it is authored as
 *    MDX like every other page (§17.6 #26; it is the one addition to this file
 *    that is not a blocks route).
 *  - the manifest — the blocks group and category routes production never
 *    listed.
 *
 * A `Set` because the three overlap by exactly one route (`/blocks` is both a
 * `CUSTOM_ROUTES` entry and `blocksRoutes()`'s first element) and because
 * de-duplicating is cheaper than teaching either source to omit it.
 *
 * `localeCompare` per §15.7: entry order is explicitly not a contract here —
 * production's own collation is inconsistent (`alert-dialog` before `alert`,
 * `/components/tabs` before `/components`) — and the gate's criterion for this
 * file is URL-SET equality, so a plain, stable sort is the whole requirement.
 */
export async function sitemapRoutes(): Promise<string[]> {
  const [index, blocks] = await Promise.all([getDocIndex(), blocksRoutes()]);
  const routes = new Set<string>([...CUSTOM_ROUTES, ...index.map((page) => page.route), ...blocks]);
  return [...routes].sort((a, b) => a.localeCompare(b));
}

// One entry line, the only line shape `llms.txt` has:
// `- [<title>](<absolute url>): <description>`.
//
// Absolute URLs, unlike `lib/docs/serialize-md.ts`'s `<PrimitiveIndex>` rows,
// which are root-relative. That is not an inconsistency between the two
// modules: `llms.txt` is a standalone index an agent may fetch on its own with
// no page context to resolve against, and production already wrote it this
// way on all 68 of its lines. Titles stay BARE here (§15.9) — the em-dash
// `— SevenUI` suffix belongs to `<title>` only, and this file names the site
// once in its own `# SevenUI` header.
const entry = (title: string, route: string, description: string): string =>
  `- [${title}](${site.url}${route}): ${description}`;

// Blume's hard-coded heading for loose root pages, synthesized literally
// (§15.4). It is not a configured label anywhere — there is nothing to read it
// off — which is why `lib/docs/nav.ts` keeps loose root pages as bare
// `NavLink`s at the top level instead of folding them into a group: the shape
// of the node, not a string, is what tells this emitter which heading to write.
const LOOSE_PAGES_HEADING = "## Docs";

/**
 * `/llms.txt` — and, byte for byte, `/index.md` (§15.2). Production served
 * both from one generator (`buildRawMarkdown` has no MDX source for a
 * landing-page home, so it substitutes `buildLlmsIndex()`), the two files were
 * verified identical at 9,299 B, and Stage 8's definition of done checks that
 * they still are. This is that one generator; the two handlers return its
 * output unchanged — the sections below are built HERE, never appended by a
 * handler, because that is the only way the two files cannot drift.
 *
 * Four sections, all the same shape — a blank line, a `## ` heading, a blank
 * line, then one `- [title](url): description` row per page:
 *
 *   ## Docs        the loose root pages, from the nav tree
 *   ## Primitives  the nav group, its own landing page first
 *   ## Components  the gallery catalog
 *   ## Blocks      the pro catalog
 *
 * The first two reproduce production. The last two are §15.4's addition, and
 * they are SECTIONS rather than rows appended to `## Primitives`: that heading
 * names the 65 installable Base UI primitives, while `/components` is the
 * composed-examples gallery and `/blocks` is the pro catalog. Listing
 * `/components/button` under `## Primitives` would be a false statement about
 * what the page is, in a file whose whole structure is its H2 sections.
 *
 * `/docs/components` IS listed, at the head of `## Primitives`. It arrives the
 * same way §17.6 #26 puts it in the sitemap, in `llms-full.txt` and in
 * `/docs/components.md` — because it is authored as MDX like every other docs
 * page. An earlier version of this file omitted it on the grounds that a nav
 * group's landing page is not one of its own children (`lib/docs/nav.ts`'s
 * `PRIMITIVES_INDEX` / `PRIMITIVES_PREFIX` pair, one trailing slash apart).
 * That is true of the TREE's shape and irrelevant to an INDEX's job: it left
 * this file listing every docs page but one, while `llms-full.txt` carried a
 * section for that page and `/docs/components.md` served it as a document — so
 * an agent walking the index would miss it with no way to discover it.
 * The position — the group's own page immediately before its children — is
 * `lib/docs/nav.ts`'s `flattenLinks` order, i.e. the order a reader meets them
 * in the rendered sidebar.
 */
export async function buildLlmsIndex(): Promise<string> {
  const [index, tree, blocks] = await Promise.all([getDocIndex(), getNavTree(), blocksRoutes()]);

  // Every docs row's title AND description come from the page's own
  // frontmatter, looked up by route. The nav tree's `label` is deliberately
  // NOT used even though every leaf's label is that same `page.title`: a
  // group's label is a module constant in `lib/docs/nav.ts` ("Primitives"),
  // not a page title, so reading labels here would silently source one of
  // these rows differently from all the others. `assertNavCoversIndex` has
  // already run inside `getDocIndex()` and guarantees every nav href is an
  // index route, so the throw below is unreachable for any node this walk
  // visits — it is there because "unreachable" is a claim about today's
  // tree, not about the next one.
  const byRoute = new Map(index.map((page) => [page.route, page]));
  const docsEntry = (href: string): string => {
    const page = byRoute.get(href);
    if (!page) {
      throw new Error(`lib/site-index.ts: nav href "${href}" has no page in the content index`);
    }
    return entry(page.title, href, page.description);
  };

  const lines = [`# ${site.name}`, "", `> ${site.description}`];

  // The predicate is spelled out rather than left as `!isNavGroup(node)`:
  // `isNavGroup` narrows to `NavGroup`, and TypeScript does not narrow a
  // `filter` by the NEGATION of a type guard, so the result would stay
  // `NavNode[]` and `link.href` would be `string | undefined` — the union's
  // property type, because a group's `href` is optional. That `undefined` is
  // not reachable for these nodes (a top-level `NavLink` always has one), so
  // the fix is to state the type, not to guard a value that cannot be missing.
  const looseLinks = tree.filter((node): node is NavLink => !isNavGroup(node));
  if (looseLinks.length > 0) {
    lines.push("", LOOSE_PAGES_HEADING, "");
    for (const link of looseLinks) lines.push(docsEntry(link.href));
  }

  for (const node of tree) {
    if (!isNavGroup(node)) continue;
    lines.push("", `## ${node.label}`, "");
    // The group's own landing page, when it has one — the `href` Stage 3's
    // §11.3 narrowing put on this node. Guarded rather than assumed because
    // `NavGroup.href` is optional by type and nothing forces a future group
    // to have one; a group without a landing page simply starts at its
    // children, which is what this file did before #26 existed.
    if (node.href !== undefined) lines.push(docsEntry(node.href));
    for (const child of node.children) lines.push(docsEntry(child.href));
  }

  // --- the two catalog sections (§15.4) --------------------------------
  //
  // The catalog each section lists. Its first route is the section's own
  // landing page, which is both the source of the heading text and the
  // section's first row — the same shape `## Primitives` now has.
  const catalogs = new Map<string, readonly string[]>([
    ["/components", galleryRoutes],
    ["/blocks", blocks],
  ]);

  // ORDER COMES FROM `lib/site-tabs.ts`, not from `catalogs`' insertion order
  // and not from a list written here. `SITE_TABS` is the site's own declared
  // ordering of its top-level surfaces — Docs, Primitives, Components, Blocks,
  // Pro — and it is what the header and the mobile drawer render, so these
  // sections appear in the order a reader already navigates them, and a
  // reorder there moves this file with it. Not every tab gets a section: `Pro`
  // is a single page with no catalog under it (and is not in the fixture, so
  // adding it would be a new route in an agent index, not parity), and `Docs`
  // / `Primitives` are already rendered above from the nav tree. `catalogs`'
  // keys are what select the two, so the membership test and the ordering come
  // from two different files on purpose.
  const sectionTabs = SITE_TABS.filter((tab) => catalogs.has(tab.path));
  if (sectionTabs.length !== catalogs.size) {
    throw new Error(
      `lib/site-index.ts: ${catalogs.size} catalogs but ${sectionTabs.length} matching site tabs — every ` +
        "catalog path must also be a lib/site-tabs.ts tab path, since SITE_TABS is what orders these " +
        "sections. A catalog with no tab would be dropped from llms.txt silently.",
    );
  }

  // Titles and descriptions are NOT re-derived here: `getPageMeta` is §16.8's
  // single lookup and already answers for every route in both catalogs — the
  // `/components` sentence is a literal it owns, the ten gallery sentences are
  // derived from the registry's own labels, and the blocks ones come straight
  // off the manifest. `requirePageMeta` (not `getPageMeta`) because a miss
  // here is a programming error, not a user typing a URL: every route in these
  // lists was just produced by this module. The repeated `loadBlocksTree()`
  // inside each `/blocks` lookup costs no network — same Data Cache entry —
  // only a re-join of a ~140-entry manifest.
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
    // The heading is the landing page's own registered title ("Components",
    // "Blocks") — the same string `<h1>` and `<title>` are built from, read
    // from the same place, so a rename moves all three together. The tab's own
    // `label` is NOT used: it happens to match for both of these today, but it
    // is header-navigation copy and free to diverge from the page's name.
    lines.push("", `## ${metas[0].title}`, "");
    routes.forEach((route, j) => lines.push(entry(metas[j].title, route, metas[j].description)));
  });

  return `${lines.join("\n")}\n`;
}
