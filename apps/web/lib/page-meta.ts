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

  return undefined;
}

// The route keys of `CUSTOM`, exported as a plain synchronous value so a
// caller that only needs "is this a known custom route" (lib/docs/links.ts's
// link validator) doesn't have to go through `getPageMeta`. That matters
// because Task 2.5 makes `getPageMeta` async (it will answer for `/docs/*`
// routes from the content index, which is async) — a sync validator calling
// it would break at that point. `CUSTOM_ROUTES` is derived from the same
// `CUSTOM` object, so there is still exactly one place this list is written.
export const CUSTOM_ROUTES: ReadonlySet<string> = new Set(Object.keys(CUSTOM));
