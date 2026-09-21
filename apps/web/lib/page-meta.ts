import { galleryComponents } from "./gallery";
import { site } from "./site";

// NOTE: as of Task 2.5, this module is transitively `server-only`. It was
// previously pure data, safe to import from anywhere (including a client
// component). `getPageMeta`'s docs branch now does `import("./docs")`,
// i.e. `lib/docs/index.ts`, whose first line is `import "server-only"` —
// so importing THIS file and calling `getPageMeta` from a client component
// now fails the build (loudly, not silently) the moment that branch's
// module is actually loaded. Nothing imports this file from a client
// component today; flagging it here because later stages (3, 4, 5, 8) add
// callers, and whoever adds the first client-side one needs to know before
// hitting the build error.
export type PageMeta = { title: string; description: string };

/** Custom pages: declared explicitly. Docs come from the content index
 *  (Stage 2), blocks from the pro manifest (Stage 5).
 *
 *  Descriptions below are copied verbatim from each live page's own
 *  `<meta name="description">` on https://sevenui.dev — see
 *  task-1.7-report.md for the raw probe output.
 *
 *  `/account` is the one case that does not copy a page-specific string: the
 *  live page's own `<meta name="description">` is byte-identical to
 *  `site.description`, which is production's existing fallback behaviour for
 *  a page with no description of its own — exactly the case §16.4 names the
 *  site-description fallback for. `site.description` is used here for that
 *  reason, not invented.
 */
const CUSTOM: Record<string, PageMeta> = {
  "/": { title: site.name, description: site.description },
  "/components": {
    title: "Components",
    description:
      "Composed, ready-to-use pieces built from the SevenUI primitives. Copy one into your project with a single command — the source is yours.",
  },
  /**
   * The `/blocks` directory page. A LITERAL, beside `/components`, and
   * deliberately not in the manifest-backed branch below: this sentence is
   * written in `legacy-pages/blocks/index.astro` (and nowhere in the pro
   * manifest), so the pro repo does not own it and must not be able to change
   * it. Its two children DO come from the manifest — see the `/blocks/`
   * branch in `getPageMeta`.
   */
  "/blocks": {
    title: "Blocks",
    description: "Production-ready pro blocks built on SevenUI components.",
  },
  "/pro": {
    title: "Pro",
    description:
      "Pre-order SevenUI Pro for $99 lifetime — the price rises to $249 once the Pro blocks catalog launches.",
  },
  "/account": { title: "Account", description: site.description },
  "/terms": {
    title: "Terms of Service",
    description:
      "The terms that govern your use of the SevenUI website, the free component registry, and SevenUI Pro.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description: "What personal data SevenUI collects, who processes it, and how to exercise your rights.",
  },
  /**
   * The 10 gallery children (Task 4.2), derived rather than transcribed.
   * Every live page's own `<meta name="description">` is this one sentence
   * with the primitive's label substituted twice — verified against the
   * shipped HTML for all ten — and the label already has a single source
   * (the matching `registry:ui` item's `title`). Writing the ten out by
   * hand would copy that label into a second place and copy the sentence
   * into ten more, all of which a `registry:ui` rename would then leave
   * stale without any error.
   *
   * The page BODY renders `getPageMeta(route).description` too (see
   * `app/components/[name]/page.tsx`), so the sentence lives here once and
   * the `<meta>` and the `<p>` under the `<h1>` cannot disagree.
   *
   * `/components` itself is NOT here — it has been in this object since
   * Task 1.7, probed from the live site, and is deliberately left alone.
   */
  ...Object.fromEntries(
    galleryComponents.map((component) => [
      `/components/${component.slug}`,
      {
        title: component.label,
        description: `Free, copy-and-go ${component.label} components built on the SevenUI ${component.label} primitive.`,
      },
    ]),
  ),
};

/**
 * Route-format contract, binding on every caller (this function is an exact
 * string lookup, both against `CUSTOM` and — for `/docs/*` — against the
 * content index's own `route` keys, which are produced the same way):
 *
 *   - a leading slash ("/docs", never "docs")
 *   - NO trailing slash ("/docs/theming", never "/docs/theming/") — a
 *     trailing slash matches nothing here and getDoc() returns undefined
 *   - NO query string or hash
 *
 * `pageUrl` below is built as `${site.url}${route}` with no separator
 * inserted, so a route missing its leading slash silently produces a
 * mangled URL (`https://sevenui.devfoo`) instead of failing loudly, and a
 * trailing slash on a docs route makes this function return `undefined`
 * where a caller (e.g. `JsonLd`) may throw. There are 68 docs routes plus
 * the custom pages above; get the format right at every call site.
 *
 * `getPageMeta` is async because `/docs/*` routes are answered from the
 * content index (Stage 2's `getDocIndex`/`getDoc`, themselves async — they
 * read the filesystem). It stays ONE function rather than splitting a sync
 * "custom-only" version from an async "docs-aware" version: a dual API
 * would let the two halves drift, and every later caller would have to
 * know which half to reach for. The one exception is `CUSTOM_ROUTES`
 * below, kept synchronous on purpose — see its own comment.
 *
 * The `import("./docs")` is dynamic, not a static top-level import, to
 * avoid tying module-evaluation order to a real cycle: `./docs` (this
 * directory's `index.ts`) imports `./docs/links`, which imports
 * `CUSTOM_ROUTES` from this very file. A static import here would close
 * that cycle at module-load time; ES module live bindings would very
 * likely still resolve it correctly (nothing on either side is read at
 * its own module's top level), but a dynamic import deferred until this
 * function actually runs sidesteps the question entirely — by the first
 * call, this module has already finished evaluating, so `./docs`'s import
 * of `CUSTOM_ROUTES` back out of this file always sees a fully
 * initialized module.
 */
export async function getPageMeta(route: string): Promise<PageMeta | undefined> {
  const custom = CUSTOM[route];
  if (custom) return custom;

  if (route === "/docs" || route.startsWith("/docs/")) {
    const { getDoc } = await import("./docs");
    const doc = await getDoc(route);
    if (!doc) return undefined;
    return { title: doc.title, description: doc.description };
  }

  // The two manifest-backed `/blocks` levels (Task 5.2). `/blocks` itself is
  // above, in `CUSTOM`, and is matched before this branch is reached.
  //
  // `import("./blocks")` is dynamic for the same reason the docs branch's
  // `import("./docs")` is: it keeps a `server-only` module — and, through it,
  // lucide-react's whole icon record — out of this file's static import graph,
  // which `lib/docs/links.ts` reaches for its synchronous `CUSTOM_ROUTES`. It
  // costs no extra network request: `loadProManifest`'s fetch is keyed by URL
  // in Next's Data Cache, so by the time any page asks for its metadata the
  // entry the route's own render made is already warm.
  //
  // A miss at either level returns `undefined` rather than throwing, and that
  // is load-bearing under `dynamicParams = true` — see `requirePageMeta`'s
  // docstring below. `rest.length` rejects a deeper path outright: nothing is
  // mounted under a category, so `/blocks/a/b/c` is a miss and not a category
  // whose id happens to contain a slash.
  if (route.startsWith("/blocks/")) {
    const { loadBlocksTree } = await import("./blocks");
    const [groupId, categoryId, ...rest] = route.slice("/blocks/".length).split("/");
    if (rest.length > 0 || !groupId) return undefined;
    // `categoryId === ""` is NOT the same as `categoryId === undefined`, and
    // conflating them is how a trailing slash resolves instead of missing:
    // `"/blocks/marketing/".split("/")` yields `["marketing", ""]`, so a bare
    // falsiness test below would hand back the GROUP's meta for a route this
    // module's own contract (leading slash, no trailing slash) says does not
    // exist. That is the same malformed-shape class `rest.length` rejects, and
    // it slipped past it because the empty segment is the LAST one rather than
    // an extra. No caller produces it today — `trailingSlash` is false and both
    // route files build their own strings — so this is a contract guard, not a
    // bug fix.
    if (categoryId === "") return undefined;
    const groups = await loadBlocksTree();
    const group = groups.find((entry) => entry.id === groupId);
    if (!group) return undefined;
    if (categoryId === undefined) return { title: `${group.label} blocks`, description: group.description };
    const category = group.categories.find((entry) => entry.id === categoryId);
    if (!category) return undefined;
    return { title: `${category.label} blocks`, description: category.description };
  }

  return undefined;
}

/**
 * `getPageMeta`, but for the callers that cannot continue without an
 * answer — every page whose `<title>`, `<meta name="description">`, `<h1>`
 * or body copy IS the registered meta. Four such call sites across the two
 * gallery route files each wrote the same lookup-then-throw pair; this is
 * that pair, once (task-4.2 review, M3).
 *
 * `file` is the caller's own path and is NOT decorative: the message it
 * produces ("app/components/[name]/page.tsx: no page-meta registered for
 * route \"/components/button\"") names both halves of the break — which
 * route went unregistered and which file expected it — and a stack trace
 * through an awaited server component is a poor substitute for either.
 * Passing it keeps the failure exactly as loud and exactly as specific as
 * the throws it replaces.
 *
 * Deliberately NOT adopted by these callers, and the list is part of the
 * contract rather than an accident:
 *
 *  - `app/docs/[[...slug]]/page.tsx` has a different shape on purpose: a miss
 *    there is a real 404 that must render `app/docs/not-found.tsx` with its
 *    own title, not a build failure, and its body reads
 *    `meta?.title ?? doc.title`. See task-4.2-report.md.
 *  - the three `/blocks` routes (Task 5.2), for the docs route's reason
 *    arriving through a different door. `dynamicParams = true` on
 *    `/blocks/[group]` and `/blocks/[group]/[category]` means an arbitrary
 *    path reaches the component — so an unregistered route there is a USER
 *    TYPING A URL, not a programming error, and it must resolve to
 *    `notFound()`. Throwing would turn every mistyped category into a 500,
 *    and during a build it would turn a category the pro repo removed into a
 *    failed deploy. `/blocks` itself joins them for consistency of shape;
 *    its entry is a literal in `CUSTOM`, so its miss branch is unreachable
 *    while that stays true.
 */
export async function requirePageMeta(route: string, file: string): Promise<PageMeta> {
  const meta = await getPageMeta(route);
  if (!meta) {
    throw new Error(`${file}: no page-meta registered for route "${route}"`);
  }
  return meta;
}

// The route keys of `CUSTOM`, exported as a plain synchronous value so a
// caller that only needs "is this a known custom route" (lib/docs/links.ts's
// link validator) doesn't have to go through `getPageMeta`. That matters
// because Task 2.5 makes `getPageMeta` async (it will answer for `/docs/*`
// routes from the content index, which is async) — a sync validator calling
// it would break at that point. `CUSTOM_ROUTES` is derived from the same
// `CUSTOM` object, so there is still exactly one place this list is written.
export const CUSTOM_ROUTES: ReadonlySet<string> = new Set(Object.keys(CUSTOM));
