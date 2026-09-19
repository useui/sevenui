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

  return [...rootLinks, { label: PRIMITIVES_GROUP, children: primitives }];
}

// The Primitives tab's link target (§5, `lib/site-tabs.ts`'s `getSiteTabs`):
// the group's own `href` once Stage 3 (§11.3) populates one, or its first
// (slug-sorted) child's `href` until then.
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
  return group?.href ?? group?.children[0]?.href;
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
