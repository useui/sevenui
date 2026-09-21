import type { Metadata } from "next";
import { notFoundMetadata } from "../../lib/metadata";
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
 * two tags, the second carrying an unwanted `nofollow`. Re-measured on this
 * branch's preview deployment (task-9.4): all four missing-page URLs —
 * `/not-a-page`, `/blocks/not-a-group`, `/docs/not-a-primitive` and
 * `/docs/components/not-a-primitive` — carry exactly one `noindex` tag. Still
 * true; still not declared here.
 *
 * `metadata` DOES need declaring here, and its previous absence was a
 * measured defect, not a no-op — task-9.4 caught it. The comment this
 * replaces claimed metadata for a docs miss was "already resolved from the
 * matched page's own `generateMetadata`" by the time this boundary renders,
 * so no export was needed here. That claim is false: `next build` of this
 * branch, checked against both `/docs/not-a-primitive` and
 * `/docs/components/not-a-primitive`, showed `<title>SevenUI</title>` (the
 * root layout's bare default) and ZERO `og:*`/`twitter:*` tags — not the
 * `pageMetadataOrNotFound` miss branch's `notFoundMetadata()` result that
 * `app/docs/[[...slug]]/page.tsx`'s `generateMetadata` computes for exactly
 * this route. `/blocks/not-a-group` and `/not-a-page`, by contrast, DID show
 * the suffixed title and full seven-tag set on the same build — and the
 * difference is not that their `generateMetadata` miss branch is somehow
 * live: `app/blocks/[group]/page.tsx` calls `notFound()` from its component
 * exactly the same way this route's page does, and `/blocks` has no
 * `not-found.tsx` of its own, so its miss bubbles to `app/not-found.tsx`,
 * which DOES declare `metadata`. That is the actual mechanism, confirmed by
 * this file being the one boundary without a `metadata` export and the one
 * URL family measured broken: once `notFound()` fires anywhere under a
 * segment, Next renders the nearest `not-found.tsx` and reads ITS metadata
 * (falling back to the parent layout's default when it has none) — the
 * originating page's `generateMetadata` return for that same request is
 * never consulted. A single owner for the docs 404 head is still correct in
 * spirit, but the owner has to be this file, because this is the boundary
 * Next actually asks.
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
export const metadata: Metadata = notFoundMetadata();

export default function DocsNotFound() {
  return <RootNotFound />;
}
