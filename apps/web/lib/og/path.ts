/**
 * The one function that turns a route string into its OG card's URL
 * (task-9.2b). Before this file existed, that mapping was written out
 * twice: `app/og/[...slug]/route.tsx` built it (as a slug array, for
 * `generateStaticParams`/`slugToRoute`) and `app/docs/[[...slug]]/page.tsx`
 * built it again, independently, as `` `/og${route}.png` `` — a second,
 * unrelated spelling of the same rule that happened to agree with the first
 * only because neither one has a case (yet) where the two diverge. §16.8's
 * "one metadata registry" argument applies here too: two hand-written copies
 * of a URL-building rule are two places for the rule to drift the next time
 * either one is touched, so this module is the rule, written once, and both
 * the route and `lib/metadata.tsx` call it rather than re-deriving it.
 *
 * The contract (frozen by §16, "URL pattern"): `/` -> `/og/index.png`;
 * every other route's leading slash is dropped and `.png` is appended to
 * its LAST segment only, never appended as a segment of its own — e.g.
 * `/docs/components/button` -> `/og/docs/components/button.png`.
 */

const INDEX_SLUG = "index.png";

/** route -> slug segments, the shape `generateStaticParams` must return. */
export function routeToSlug(route: string): string[] {
  if (route === "/") {
    return [INDEX_SLUG];
  }
  const segments = route.slice(1).split("/");
  segments[segments.length - 1] += ".png";
  return segments;
}

/**
 * slug segments -> route, the exact inverse of `routeToSlug` above (the same
 * rule, run backwards). Returns `undefined` for any slug shape `routeToSlug`
 * could never have produced — an empty array, a last segment with no
 * ".png", or a last segment that is ONLY ".png" — rather than guessing at a
 * route for a request nothing enumerated.
 */
export function slugToRoute(slug: string[]): string | undefined {
  if (slug.length === 1 && slug[0] === INDEX_SLUG) {
    return "/";
  }
  const last = slug.at(-1);
  if (!last || !last.endsWith(".png")) {
    return undefined;
  }
  const lastSegment = last.slice(0, -".png".length);
  if (!lastSegment) {
    return undefined;
  }
  return `/${[...slug.slice(0, -1), lastSegment].join("/")}`;
}

/**
 * route -> the OG card's URL path, e.g. `/og/docs/components/button.png`.
 * This is what `lib/metadata.tsx` hands to `og:image`/`twitter:image` — a
 * thin wrapper over `routeToSlug` so a caller that only wants the final
 * string never has to know the slug is an array in between.
 */
export function ogImagePath(route: string): string {
  return `/og/${routeToSlug(route).join("/")}`;
}
