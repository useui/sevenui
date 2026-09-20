// No `import "server-only"`, no `node:fs`, and — the one that actually
// matters — no `import ... from "./index"`. `./index` carries `server-only`
// itself, and `server-only`'s poisoning is transitive: importing a module
// that imports it is just as fatal in a client bundle as importing it
// directly. Task 7.2's search palette is a client component (it needs
// keyboard state and `Autocomplete.Root`), and it needs `SearchEntry`,
// `POPULAR`, `SEARCH_RESULT_LIMIT` and `SEARCH_INDEX_URL` from this exact
// file, so this file is the one place in `lib/docs` that must stay reachable
// from the client. The index itself never lives here — it is fetched at
// runtime from `SEARCH_INDEX_URL` — so nothing below ever touches the
// filesystem.

/**
 * One row of the docs search index (§9 Step 1). Two shapes share the type,
 * discriminated by `hash`:
 *
 * - A **page** entry has no `hash`. `description` and `body` are page-only
 *   fields (a heading has neither — see `lib/docs/search-index.ts`).
 * - A **heading** entry carries `hash`, the `id` `rehype-slug` gave that
 *   heading at render time (never re-derived here — see Step 1 of the
 *   builder). `title` is the heading's own text; `pageTitle` is the owning
 *   page's title, which Task 7.2 renders on the result row's second line in
 *   place of the excerpt a page row shows there.
 *
 * `section` is Blume's `SearchDocument.section` under its accurate name —
 * the nearest ancestor nav group's label ("Primitives" for everything under
 * `/docs/components/`, "Docs" for the three loose root pages), used only to
 * group the result set's section pills. It is never rendered as a
 * breadcrumb, so it does not need Blume's separate `breadcrumb: string[]`.
 */
export type SearchEntry = {
  route: string;
  hash?: string;
  title: string;
  pageTitle?: string;
  description?: string;
  body?: string;
  section: string;
};

export type PopularLink = { href: string; label: string };

// Ported from `blume.config.ts`'s `search.popular` (§9 Step 4), with its one
// landmine defused. Blume's six routes are base-less — `/installation`,
// `/components/button` — because Blume prefixes every link through
// `basePath` at render time. There is no `basePath` here, so an unprefixed
// copy of this list would not 404 into visible brokenness; two of the six
// (`/components/button`, `/components/dialog`) are REAL routes in the
// `/components` gallery's own namespace and would silently point at the
// wrong page. Every `href` below carries the literal `/docs/` prefix Blume
// added implicitly, and `lib/docs/search-index.ts`'s build-time assertion
// checks both that the prefix is there and that the route is real — a typo
// like `/docs/components/buton` would still pass a prefix-only check.
export const POPULAR: PopularLink[] = [
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/theming", label: "Theming" },
  { href: "/docs/components/button", label: "Button" },
  { href: "/docs/components/dialog", label: "Dialog" },
  { href: "/docs/components/combobox", label: "Combobox" },
  { href: "/docs/components/toast", label: "Toast" },
];

// §9 Step 3: "12 results shown, as today."
export const SEARCH_RESULT_LIMIT = 12;

// The build-time route (`app/search-index.json/route.ts`) that serves the
// asset this file describes but does not itself build or hold.
export const SEARCH_INDEX_URL = "/search-index.json";
