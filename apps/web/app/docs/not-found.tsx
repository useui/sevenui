import RootNotFound from "../not-found";

/**
 * The docs-scoped 404 boundary (§11.1). `notFound()` from
 * `app/docs/[[...slug]]/page.tsx` resolves HERE rather than at the root, so a
 * miss arrives inside the docs layout — which means it arrives WITH THE
 * SIDEBAR. That is the whole point of the file: the sidebar is the only thing
 * on the site that lists all 65 primitives, and a mistyped or stale primitive
 * slug is overwhelmingly what a docs miss is. The bare root 404 offers
 * nothing to recover with.
 *
 * The BODY is the root 404's, imported rather than re-derived: the 6xl muted
 * "404", the `Page not found` heading, the sentence, and the accent button
 * home (`app/not-found.tsx`, Task 1.9). One copy, so the two can never drift.
 *
 * No `robots` declaration, deliberately. Task 1.9 established that Next
 * injects `<meta name="robots" content="noindex">` on its own for any route
 * resolved through a `not-found.tsx`, and that declaring it as well produced
 * two tags, the second carrying an unwanted `nofollow`.
 *
 * No `metadata` export either, and that one is not a no-op: by the time this
 * boundary renders, metadata has already been resolved from the matched
 * page's own `generateMetadata` — so the `<title>` for a docs miss is set
 * there (see its "no page at this route" branch), which keeps a single owner
 * for it instead of two that could disagree.
 *
 * TWO SIDEBAR INTERACTIONS THIS BOUNDARY COULD HAVE GOT WRONG, both checked
 * against `components/docs/sidebar.tsx`:
 *
 *  - No row is active. `containsRoute` compares the pathname against real
 *    route strings, and a miss matches none of them, so `activeInside` is
 *    false for the one group — and `NavGroupRow`'s force is ONE-WAY (it only
 *    ever opens), so nothing opens it either. The Primitives group therefore
 *    arrives COLLAPSED on a 404, which is the same state a first visit to
 *    `/docs` shows. It is also why this page still helps: the group is one
 *    click from the full list.
 *  - `center()` must no-op rather than throw. It scrolls the FIRST link with
 *    `aria-current="page"` that has client rects; with no active link the
 *    loop finds none, `link` stays null and the effect returns before it
 *    reads any geometry. Nothing is dereferenced.
 *
 * The breadcrumb, both TOC variants and the page-actions rail all take
 * themselves out on this route (no trail, no headings, no matching doc
 * route), so the content column holds this and nothing else.
 *
 * Boundaries for the gallery and `/blocks` are declined — not added.
 */
export default function DocsNotFound() {
  return <RootNotFound />;
}
