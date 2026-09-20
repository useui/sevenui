import "server-only";

import { getDocIndex, type DocPage } from "./index";

// A link node is a leaf: it always resolves to a real page. A group node
// carries no `href` of its own — Stage 3 (§11.3) is the one narrowing that
// adds an optional group `href`, and even then its value can only ever come
// from the content index's `route`, never from `label` (Step 4). Nothing in
// this file constructs that field; it exists on the type only so Stage 3
// does not have to widen this type to add it.
export type NavLink = { label: string; href: string };
export type NavGroup = { label: string; children: NavLink[]; href?: string };
export type NavNode = NavLink | NavGroup;

// Exported so every consumer that needs to tell a link from a group —
// today just `app/layout.tsx`, later Stages 3, 7 and 8 — shares this one
// discriminator instead of re-deriving `"children" in node` at each call
// site.
export function isNavGroup(node: NavNode): node is NavGroup {
  return "children" in node;
}

// The hand-maintained 65-entry list in Blume's `blume.config.ts` dies here:
// a new primitive reaches the sidebar the moment its `.mdx` file exists,
// with no second place to register it. Only these three loose root pages
// are named explicitly — everything under `/docs/components/` is derived.
const SKELETON = ["/docs", "/docs/installation", "/docs/theming"] as const;
const PRIMITIVES_GROUP = "Primitives";
const PRIMITIVES_PREFIX = "/docs/components/";

// The Primitives group's OWN page (Task 3.3, §11.3), i.e. the content index
// route the group's `href` is set to below. Note the one-character
// difference from `PRIMITIVES_PREFIX` above: this constant has no trailing
// slash and the prefix does, which is exactly what keeps this route out of
// the `primitives` children list — a group's own landing page must never
// also appear as one of its own children.
const PRIMITIVES_INDEX = "/docs/components";

// Builds the nav tree from an already-assembled content index. Pure and
// synchronous on purpose: Task 2.1's per-build assertion seam
// (`lib/docs/index.ts`'s `readAll()`) needs to build a tree and check it
// against the very index it was built from, in the same synchronous pass,
// before that index is ever handed to a caller.
export function buildNavTree(index: DocPage[]): NavNode[] {
  const byRoute = new Map(index.map((page) => [page.route, page]));

  // Loose root pages, kept as bare `NavLink`s at the top level of the tree
  // (as opposed to inside a group's `children`) so Stage 8's `llms.txt`
  // emitter (§15.4) can tell them apart from `Primitives`' children by
  // shape alone: a `## Docs` heading for these, one heading per named group
  // for the rest. No `slugify`-shaped call is needed to tell them apart —
  // the discriminator is structural (`"children" in node`), not
  // string-derived.
  const rootLinks: NavLink[] = SKELETON.map((route) => {
    const page = byRoute.get(route);
    if (!page) {
      throw new Error(
        `lib/docs/nav.ts: skeleton route "${route}" has no matching page in the content index`,
      );
    }
    return { label: page.title, href: route };
  });

  // Step 2: the sort key is the ROUTE (the slug), not the filename and not
  // the title.
  //
  // Filename sort is not slug sort. `alert-dialog.mdx` sorts before
  // `alert.mdx` in a filename listing because `-` (0x2D) < `.` (0x2E), and
  // that collision repeats across five stems in this corpus: alert/
  // alert-dialog, button/button-group, input/input-group/input-otp,
  // message/message-scroller, toggle/toggle-group — 11 positions where
  // filename order and slug order disagree. The route has no extension to
  // collide with, so sorting it sidesteps this entirely.
  //
  // Title sort would also reproduce today's order (title sort == slug sort
  // for all 65 current primitives), but the title is prose: renaming
  // "Alert Dialog"'s heading for copy reasons would silently reorder the
  // sidebar if the sort keyed off it. The slug is the frozen URL; sort by
  // that.
  //
  // Verified against the live sidebar: today's order is exactly
  // slug-alphabetical and set-identical to the 65 files, so this
  // reproduces it byte-for-byte with no hand-held ordering list. If one is
  // ever wanted, the extension is one line — an optional `order: string[]`
  // prefix, slug-sorted tail — and it is not built now.
  const primitives: NavLink[] = index
    .filter((page) => page.route.startsWith(PRIMITIVES_PREFIX))
    .map((page) => ({ label: page.title, href: page.route }))
    .sort((a, b) => (a.href < b.href ? -1 : a.href > b.href ? 1 : 0));

  // Step 4's narrowing, and the only thing in this file that has ever
  // constructed a group `href`. Its value comes from the content index's own
  // `route` — the same field every leaf `href` above comes from — never from
  // the group's `label`, so §5's boundary holds unchanged.
  //
  // Fail loud rather than degrade. With no page at that route the group
  // would quietly render an unlinked label again (the exact defect §11.3
  // removes) and every primitive's breadcrumb would lose its middle link,
  // with no error raised anywhere — the same quiet-wrong-answer this
  // module's other checks refuse to allow. The lookup, not a literal, is
  // also what makes the `href` provably a real route.
  const indexPage = byRoute.get(PRIMITIVES_INDEX);
  if (!indexPage) {
    throw new Error(
      `lib/docs/nav.ts: the "${PRIMITIVES_GROUP}" group's own page "${PRIMITIVES_INDEX}" has no matching page in the content index`,
    );
  }

  return [...rootLinks, { label: PRIMITIVES_GROUP, children: primitives, href: indexPage.route }];
}

// The Primitives tab's link target (§5, `lib/site-tabs.ts`'s `getSiteTabs`):
// the group's FIRST (slug-sorted) child's `href`, unconditionally.
//
// RULED, Task 3.3 §D.2 — DO NOT "fix" this back to preferring the group's
// own `href`. It used to read `group?.href ?? group?.children[0]?.href`, and
// the comment above it (and `site-tabs.ts`'s) anticipated the group gaining
// an `href` and this tab following it. Now that `buildNavTree` populates
// one, that preference would retarget the header's Primitives tab from
// `/docs/components/accordion` to `/docs/components` on EVERY page of the
// site — three links on ~101 routes — and §17.6 is declared complete with
// no row covering a site-wide link rewrite. Keeping the tab put is the
// reversible choice; moving it would mix an unlisted 101-route diff into
// the one gate that would otherwise catch a real regression. The group's
// `href` still lives in the tree for the breadcrumb and the sidebar
// summary, both of which read the tree directly; this function has exactly
// one call site (`app/layout.tsx`), whose only consumer is the tab.
//
// The group is identified by the same structural fact `buildNavTree` used
// to BUILD it — its children's routes start with `PRIMITIVES_PREFIX`
// (`page.route.startsWith(PRIMITIVES_PREFIX)`, above) — not by its
// `label`. A label match reads as "shape, not string" but isn't: nothing
// in the tree's shape marks a group as Primitives, only equality against
// its display text does, and a rename, a localization, or a second group
// whose label happens to collide would each defeat it silently. The route
// prefix is the one thing that is actually structural here: it is the
// predicate that put those children in this group in the first place, so
// construction and lookup share one module-private constant and cannot
// drift apart — and unlike the label, it survives a rename, a
// localization, and a second group being added.
export function resolvePrimitivesHref(tree: NavNode[]): string | undefined {
  const group = tree.find(
    (node): node is NavGroup =>
      isNavGroup(node) &&
      node.children.length > 0 &&
      node.children.every((child) => child.href.startsWith(PRIMITIVES_PREFIX)),
  );
  return group?.children[0]?.href;
}

// Visits every `href` reachable in the tree, INCLUDING a group's own
// `href` when it has one. Nothing sets that field today (Step 4: a group
// carries no `href` until Stage 3's §11.3 narrowing), so the `node.href
// !== undefined` branch below is a no-op on the current tree — but it is
// not a no-op forever, and this walker is the mechanism the exactly-once
// assertion below trusts completely. Skipping a group's own `href` here
// would make that assertion report `found 0` and blame the wrong thing
// (the page, not the walker) the day Stage 3 populates it.
function walk(tree: NavNode[], visit: (href: string) => void): void {
  for (const node of tree) {
    if (isNavGroup(node)) {
      if (node.href !== undefined) visit(node.href);
      walk(node.children, visit);
    } else {
      visit(node.href);
    }
  }
}

// Nothing checked this before this task, and Blume silently dumped an
// orphan page into `llms.txt`'s "## Other" section (§5) rather than failing
// the build. Every content-index route must appear in the nav EXACTLY
// once — zero is a page nobody can navigate to, and two is either a
// duplicate sidebar entry or, come Stage 8, a duplicate `llms.txt` heading.
// Throws, does not warn: called from `index.ts`'s `readAll()` seam, the
// same place Task 2.9's `validateLinks` fails the build today.
export function assertNavCoversIndex(index: DocPage[], tree: NavNode[]): void {
  const inNav = new Map<string, number>();
  walk(tree, (href) => inNav.set(href, (inNav.get(href) ?? 0) + 1));
  for (const page of index) {
    const n = inNav.get(page.route) ?? 0;
    if (n !== 1) {
      throw new Error(`nav must contain ${page.route} exactly once, found ${n}`);
    }
  }
}

// Same reasoning as `walk` above, for the same reason: a group's own
// `href`, once Stage 3 populates one, IS a page — its own landing page for
// the section, ordered immediately before its children the way a reader
// would meet it in the rendered sidebar. Dropping it here would silently
// remove that page from the prev/next chain with no error at all, unlike
// `assertNavCoversIndex`'s loud failure for the same oversight.
function flattenLinks(tree: NavNode[]): NavLink[] {
  const out: NavLink[] = [];
  for (const node of tree) {
    if (isNavGroup(node)) {
      if (node.href !== undefined) out.push({ label: node.label, href: node.href });
      out.push(...flattenLinks(node.children));
    } else {
      out.push(node);
    }
  }
  return out;
}

// The one nav tree every page-facing consumer reads: Stage 3's sidebar and
// pagination, Stage 7's palette, Stage 8's `llms.txt`. Fetches the content
// index itself (through `getDocIndex()`, which the assertion above has
// already run against by the time this resolves) rather than taking one as
// a parameter, so every call site gets the same tree without threading the
// index through the whole app.
export async function getNavTree(): Promise<NavNode[]> {
  const index = await getDocIndex();
  return buildNavTree(index);
}

// One breadcrumb. `href` is optional for the same reason the sidebar's group
// summary has a `<span>` branch: a group that carries no `href` is still a
// real ancestor and must still be NAMED in the trail, just not linked.
export type Crumb = { label: string; href?: string };

// The synthetic root of every docs trail.
//
// Synthetic because the nav tree has no root node, and taking the tree's own
// trail as-is was rejected: it leaves `/docs/installation` with a one-item
// trail — the same no-information breadcrumb §11.3 exists to remove, merely
// relocated.
//
// `Docs` is the site's own word for this section, not a coinage: it is the
// label of `lib/site-tabs.ts`'s first tab, whose `href` is this same
// `/docs`. It deliberately does NOT reuse the index page's own frontmatter
// title ("Introduction", `docs/index.mdx`) — a trail's root names the
// section a reader is in, and "Introduction / Primitives / Button" names a
// document instead.
const DOCS_ROOT: Crumb = { label: "Docs", href: "/docs" };

// `href` is read off the UNION, not off either branch: `NavLink.href` is
// required and `NavGroup.href` optional, so the union's property type is
// already `string | undefined` and no narrowing is needed. The key is omitted
// rather than set to `undefined` so the crumb serializes clean across the RSC
// boundary.
function crumbFor(node: NavNode): Crumb {
  return node.href === undefined ? { label: node.label } : { label: node.label, href: node.href };
}

// Depth-first search for `route`, returning the chain of nodes from the top
// level down to the match, or `undefined` when the tree does not contain it.
// A group matches on its OWN `href` as well as through its children, which
// is what gives `/docs/components` the trail `Docs / Primitives` with the
// group as the current page rather than as an ancestor of itself.
function findTrail(nodes: NavNode[], route: string): Crumb[] | undefined {
  for (const node of nodes) {
    if (isNavGroup(node)) {
      if (node.href === route) return [crumbFor(node)];
      const inner = findTrail(node.children, route);
      if (inner) return [crumbFor(node), ...inner];
    } else if (node.href === route) {
      return [crumbFor(node)];
    }
  }
  return undefined;
}

/**
 * The breadcrumb trail for one docs route (§11.3): the synthetic `Docs`
 * root, then every nav ancestor, then the page itself —
 * `Docs / Primitives / Button`.
 *
 * `/docs` returns a ONE-item trail on purpose, and callers render nothing
 * for a trail of one: a breadcrumb whose only item is the current page
 * carries no information. It is special-cased rather than found through the
 * tree so the root crumb reads `Docs` there too, instead of the index page's
 * own title.
 *
 * An empty array for a route the nav does not contain. Unreachable for a
 * docs page (`assertNavCoversIndex` fails the build before any of this
 * runs), and the correct answer for the non-docs routes `components/
 * json-ld.tsx` also serves — they get no `BreadcrumbList`.
 */
export function docsTrail(tree: NavNode[], route: string): Crumb[] {
  if (route === DOCS_ROOT.href) return [DOCS_ROOT];
  const trail = findTrail(tree, route);
  return trail ? [DOCS_ROOT, ...trail] : [];
}

export type PrevNext = { prev: NavLink | undefined; next: NavLink | undefined };

// Prev/next reads the NAV tree, not the file tree: the nav tree is what
// ships today, and the file tree alone cannot express the "Primitives"
// group's boundary (it would run straight from `/docs/theming` into
// `/docs/components/accordion` with no seam). Walks the tree in its own
// display order — root links first, then each group's children — so
// "next" from the last root link is the first primitive, matching what a
// reader would click next in the rendered sidebar.
export async function getPrevNext(route: string): Promise<PrevNext> {
  const links = flattenLinks(await getNavTree());
  const i = links.findIndex((link) => link.href === route);
  if (i === -1) return { prev: undefined, next: undefined };
  return { prev: links[i - 1], next: links[i + 1] };
}
