import type { Metadata } from "next";
import { HEIGHT, WIDTH } from "./og/dimensions";
import { ogImagePath } from "./og/path";
import type { PageMeta } from "./page-meta";
import { getPageMeta } from "./page-meta";
import { pageTitle, site } from "./site";

// The single builder every route's `generateMetadata` calls (task-9.2b, §16.8).
//
// What this replaced: at the end of Stage 8, ten of the eleven custom/gallery
// route files declared NO `openGraph`/`twitter` at all — each one carried the
// literal comment "No `openGraph` block, following Task 4.1: the OG surface
// is Stage 9's" — so those ten routes emitted zero `og:*`/`twitter:*` tags.
// The eleventh, the docs catch-all, declared its own `openGraph` object
// inline (four fields) and no `twitter` object at all. So the shortfall this
// module fixes was ten routes with NOTHING, not eleven routes each disagreeing
// with a full shape of their own — there was no full shape anywhere on the
// branch to disagree. What this module actually prevents going forward is the
// NEXT route being hand-written a twelfth way: every route now gets the same
// 16-tag shape by calling the same function, rather than by each author
// re-reading the spec and re-typing the field list.
//
// The target shape (measured on production, 2026-09-21, over `/`,
// `/docs/components/button`, `/components/button` and `/blocks/marketing/hero`
// — all four emit the identical 16-line set):
//
//   og:type, og:site_name, og:title, og:description, og:url, og:image,
//   og:image:type, og:image:width, og:image:height, og:image:alt,
//   twitter:card, twitter:title, twitter:description, twitter:image,
//   twitter:image:alt, and a canonical <link>.
//
// `twitter` is declared explicitly here rather than left to Next's
// openGraph -> twitter fallback, even though that fallback was MEASURED
// (a real `next build` of this branch's docs route, which at the time of
// measurement declared `openGraph` and no `twitter` at all) to already
// produce the exact same five tags, `twitter:image:alt` included — see
// task-9.2b-report.md for the raw extraction. The fallback is not wrong
// today; it is just a second, implicit rule for producing the same tag set
// this function already produces explicitly, and relying on it here would
// mean two different code paths converging on one shape by coincidence
// instead of by construction — the exact trap this task's brief opens with
// ("tying two copies together is not the same as removing the
// duplication"). Declaring it plainly also does not depend on Next's
// fallback behaviour surviving a future version bump.
//
// `pageTitle` (§15.8's em-dash suffix) is called ONLY from this file. Every
// route used to call it directly on its own `{ title: pageTitle(meta.title),
// ... }` line; those lines are gone now that every route goes through
// `pageMetadata`/`notFoundMetadata` instead, so `lib/site.ts`'s "applied in
// exactly ONE place" claim is now literally true, not just intended.

/**
 * The full 16-tag `Metadata` object for a page whose title/description are
 * already resolved (task-9.2b). `route` is used twice: as the page's own
 * path (`og:url`/canonical) and, via `ogImagePath`, to build its card's URL
 * — `lib/page-meta.ts`'s route-format contract applies here too (leading
 * slash, no trailing slash, `/` itself excepted).
 *
 * `title` is taken BARE, not `meta.title` implicitly, because the bare form
 * a route passes in is not always `getPageMeta(route).title` unchanged:
 * `app/components/[name]/page.tsx` passes `` `${meta.title} Components` ``
 * (§15.8's ten-route fix — the gallery `<title>` reads "Button Components",
 * not "Button"), and this function has no way to know that from `route`
 * alone. Every caller already computes this same bare string for its own
 * `<title>`/`<h1>` today; this function just takes it as a parameter instead
 * of re-deriving a second, possibly different, answer.
 *
 * `og:url`/canonical and the image URL are handed to Next as paths relative
 * to `app/layout.tsx`'s `metadataBase` rather than built as
 * `${site.url}${route}` here — verified in the built HTML (see the report)
 * that Next resolves both to the correct absolute `https://sevenui.dev/...`
 * form for every route EXCEPT `/` itself. `/` omits both fields; see
 * `RootUrlTags` below for why and for where its replacement lives.
 */
export function pageMetadata(route: string, title: string, description: string): Metadata {
  const suffixed = pageTitle(title);
  const imagePath = ogImagePath(route);
  const isRoot = route === "/";

  return {
    title: suffixed,
    description,
    ...(isRoot ? {} : { alternates: { canonical: route } }),
    openGraph: {
      type: "website",
      siteName: site.name,
      title: suffixed,
      description,
      ...(isRoot ? {} : { url: route }),
      images: [{ url: imagePath, type: "image/png", width: WIDTH, height: HEIGHT, alt: suffixed }],
    },
    twitter: {
      card: "summary_large_image",
      title: suffixed,
      description,
      images: [{ url: imagePath, alt: suffixed }],
    },
  };
}

/**
 * `pageMetadata`, but for the "may miss" routes (task-9.2b fix round 1):
 * `app/docs/[[...slug]]/page.tsx` and the three `/blocks` route files each
 * repeated `const meta = await getPageMeta(route); if (!meta) return
 * notFoundMetadata(); return pageMetadata(route, meta.title,
 * meta.description);` verbatim. Unlike `app/components/[name]/page.tsx`
 * (the one caller whose bare title is NOT `meta.title` unchanged — see
 * `pageMetadata`'s own docstring), all four of these pass `meta.title`
 * straight through, so there is nothing route-specific left for them to
 * supply once the lookup and the miss/hit branch are factored out here.
 */
export async function pageMetadataOrNotFound(route: string): Promise<Metadata> {
  const meta: PageMeta | undefined = await getPageMeta(route);
  if (!meta) return notFoundMetadata();
  return pageMetadata(route, meta.title, meta.description);
}

/**
 * The reduced, image-less metadata production's 404 declares (measured on
 * `https://sevenui.dev/not-a-real-page`, 2026-09-21): seven tags —
 * `og:type`, `og:site_name`, `og:title`, `og:description`, `twitter:card`
 * (**`summary`**, not `summary_large_image` — there is no image to enlarge),
 * `twitter:title`, `twitter:description`. No `og:url`, no `og:image*`, no
 * canonical: correctly, since a missing page has no card and no canonical
 * location of its own.
 *
 * Used by every branch that used to return the bare
 * `{ title: pageTitle("Page not found") }`: `app/not-found.tsx`, and (via
 * `pageMetadataOrNotFound` above) the docs catch-all's miss branch and all
 * three `/blocks` miss branches. Its `og:title`/`twitter:title` carry the
 * suffixed title — §17.6 #28 (the 404 `<title>` gains the suffix) moves them
 * with it, exactly as #17 moved the docs `og:title` with the `<title>`.
 *
 * `description` falls back to `site.description`: production's 404 does not
 * describe a specific page (there isn't one), and this is the same fallback
 * §16.4 already establishes for `/account`'s registered entry in
 * `lib/page-meta.ts` — a page with nothing of its own to say uses the site's
 * own description rather than a second, invented string.
 *
 * `type`/`siteName` are repeated here rather than shared with `pageMetadata`
 * above: the two shapes genuinely differ (this one has no `url`, no
 * `images`, and a `summary` twitter card), and the two lines they do share
 * sit ten lines apart in the same file — not the kind of duplication §16.8
 * exists to rule out.
 */
export function notFoundMetadata(): Metadata {
  const title = pageTitle("Page not found");
  return {
    title,
    description: site.description,
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description: site.description,
    },
    twitter: {
      card: "summary",
      title,
      description: site.description,
    },
  };
}

/**
 * `/`'s `og:url` and canonical `<link>`, rendered directly instead of coming
 * from `pageMetadata` (task-9.2b, fix round 1 — this component and the
 * comment explaining it now live in the one file that decided to omit the
 * fields, instead of being split across this module's `isRoot` branch and a
 * paraphrase in `app/page.tsx`'s JSX).
 *
 * Next's own resolver (`resolveAbsoluteUrlWithPathname` in
 * `next/dist/{cjs,esm}/lib/metadata/resolvers/resolve-url.js`, read against
 * this repo's installed next@16.3.5) collapses `alternates.canonical` and
 * `openGraph.url` to the bare **origin — no trailing slash** whenever the
 * resolved pathname is exactly `"/"`, no matter what value either field is
 * given:
 *
 *   result.pathname === '/' && result.searchParams.size === 0
 *     ? result.origin
 *     : result.href
 *
 * That check runs on the RESOLVED URL, so it fires whether the field is
 * fed a relative `"/"` or an already-absolute `"https://sevenui.dev/"` —
 * there is no value either `Metadata` field can hold that survives it. It is
 * gated only by Next's site-wide `trailingSlash` config option (off in this
 * repo, and turning it on would put a trailing slash on every OTHER route
 * too, which production does not have).
 *
 * Production's measured shape is `https://sevenui.dev/` — WITH the trailing
 * slash — for both tags on `/` (controller ruling: the workaround stays; it
 * reproduces that measurement exactly, and the alternative is a declared
 * §17.6 diff bought for nothing). So `pageMetadata` omits both fields when
 * `route === "/"`, and `app/page.tsx` renders `<RootUrlTags />` in their
 * place. React hoists a `<meta>`/`<link>` into `<head>` from wherever it
 * renders — the same mechanism `app/docs/[[...slug]]/page.tsx` already
 * relies on for its own hand-written `<link>` tags — so this component's
 * position inside `Home()`'s returned tree is invisible.
 *
 * Every other `og:*`/`twitter:*` tag on `/`, `og:image` included (its URL
 * also passes through the same resolver, but keyed to the IMAGE's own
 * pathname `/og/index.png`, never `/`), is unaffected and still comes from
 * `pageMetadata` as normal.
 */
export function RootUrlTags() {
  const rootUrl = `${site.url}/`;
  return (
    <>
      <meta content={rootUrl} property="og:url" />
      <link href={rootUrl} rel="canonical" />
    </>
  );
}
