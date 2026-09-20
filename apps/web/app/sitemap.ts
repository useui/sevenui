import type { MetadataRoute } from "next";
import { site } from "../lib/site";
import { sitemapRoutes } from "../lib/site-index";

// `sitemap.xml` (§15.7). Production's sitemap listed the docs corpus, the
// gallery and the standalone pages, plus `/blocks` itself but none of its
// group or category routes — so every one of those pro pages was in no sitemap
// at all. This lists every page the site serves: those, plus the blocks tree
// in full, plus §11.3's `/docs/components`, which arrives with no special case
// because it is authored as MDX like every other docs page (§17.6 #2 and #26).
//
// No count is given here, in either half of that sentence. The blocks tree is
// manifest-derived and drifts by design (Ruling 58) — quoting today's totals
// in a comment is how the plan's own "18 blocks routes" went stale, and this
// header would be wrong about the very thing it exists to explain the moment
// pro publishes another category. `node scripts/route-inventory.mjs` answers
// the question against the live manifest whenever it is actually asked; see
// `lib/site-index.ts`'s header for the derivation.
//
// ISR at the §15.7 ceiling, for the manifest's sake. `lib/site-index.ts` reads
// it through the same URL-keyed Data Cache entry `/llms.txt` and the `/blocks`
// pages use, so this route adds no network request of its own; the only thing
// `revalidate` buys here is that a category the pro repo publishes appears in
// the sitemap within five minutes instead of at the next deploy.
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await sitemapRoutes();
  // BARE `<loc>` entries, exactly as production emits them: no `lastModified`,
  // no `changeFrequency`, no `priority`. Next omits each of those elements when
  // the field is absent, so an entry of `{ url }` alone produces
  // `<url><loc>…</loc></url>` and nothing more. Adding `lastModified` would be
  // a new feature wearing parity's clothes — and a dishonest one for most of
  // this set, since neither the manifest nor the MDX corpus carries a
  // per-page modification date this route could tell the truth with.
  //
  // `site.url` carries no trailing slash and `route` always starts with one, so
  // the root route "/" concatenates to `https://sevenui.dev/` — which is the
  // form the fixture uses for the landing page.
  return routes.map((route) => ({ url: `${site.url}${route}` }));
}
