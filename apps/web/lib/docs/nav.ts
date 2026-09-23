import "server-only";

import { getDocIndex, type DocPage } from "./index";

export type NavLink = { label: string; href: string };
export type NavGroup = { label: string; children: NavLink[]; href?: string };
export type NavNode = NavLink | NavGroup;

export function isNavGroup(node: NavNode): node is NavGroup {
  return "children" in node;
}

const SKELETON = ["/docs", "/docs/installation", "/docs/theming"] as const;
const PRIMITIVES_GROUP = "Primitives";
const PRIMITIVES_PREFIX = "/docs/components/";

const PRIMITIVES_INDEX = "/docs/components";

export function buildNavTree(index: DocPage[]): NavNode[] {
  const byRoute = new Map(index.map((page) => [page.route, page]));

  const rootLinks: NavLink[] = SKELETON.map((route) => {
    const page = byRoute.get(route);
    if (!page) {
      throw new Error(
        `lib/docs/nav.ts: skeleton route "${route}" has no matching page in the content index`,
      );
    }
    return { label: page.title, href: route };
  });

  const primitives: NavLink[] = index
    .filter((page) => page.route.startsWith(PRIMITIVES_PREFIX))
    .map((page) => ({ label: page.title, href: page.route }))
    .sort((a, b) => (a.href < b.href ? -1 : a.href > b.href ? 1 : 0));

  const indexPage = byRoute.get(PRIMITIVES_INDEX);
  if (!indexPage) {
    throw new Error(
      `lib/docs/nav.ts: the "${PRIMITIVES_GROUP}" group's own page "${PRIMITIVES_INDEX}" has no matching page in the content index`,
    );
  }

  return [...rootLinks, { label: PRIMITIVES_GROUP, children: primitives, href: indexPage.route }];
}

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

export async function getNavTree(): Promise<NavNode[]> {
  const index = await getDocIndex();
  return buildNavTree(index);
}

export type Crumb = { label: string; href?: string };

const DOCS_ROOT: Crumb = { label: "Docs", href: "/docs" };

function crumbFor(node: NavNode): Crumb {
  return node.href === undefined ? { label: node.label } : { label: node.label, href: node.href };
}

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

export function docsTrail(tree: NavNode[], route: string): Crumb[] {
  if (route === DOCS_ROOT.href) return [DOCS_ROOT];
  const trail = findTrail(tree, route);
  return trail ? [DOCS_ROOT, ...trail] : [];
}

export type PrevNext = { prev: NavLink | undefined; next: NavLink | undefined };

export async function getPrevNext(route: string): Promise<PrevNext> {
  const links = flattenLinks(await getNavTree());
  const i = links.findIndex((link) => link.href === route);
  if (i === -1) return { prev: undefined, next: undefined };
  return { prev: links[i - 1], next: links[i + 1] };
}
