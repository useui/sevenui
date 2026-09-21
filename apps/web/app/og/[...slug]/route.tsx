import { readFileSync } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { OgCard } from "../../../lib/og/card";
import { HEIGHT, WIDTH } from "../../../lib/og/dimensions";
import { routeToSlug, slugToRoute } from "../../../lib/og/path";
import { getPageMeta } from "../../../lib/page-meta";
import { sitemapRoutes } from "../../../lib/site-index";

// Serves `/og/<pathname minus leading slash>.png` (§16), reproducing a URL
// pattern `opengraph-image.tsx` cannot: Next serves that file convention at a
// generated hashed URL of its own choosing, and file-based metadata
// *overrides* `generateMetadata` wholesale, so the file can't be kept around
// while a page's own `generateMetadata` points `og:image` somewhere else. A
// catch-all route is the only shape that reproduces the frozen pattern,
// `/og/index.png` included — see §16 and the plan's Task 9.1 Step 1 for the
// two rejected alternatives (a per-page file convention, and a second
// dynamic route living beside a static catch-all) and why each was rejected.
//
// The runtime is Node (the default — `edge` is deprecated in Next 16 and
// buys nothing here), which is also why the two font files below are read
// with plain `node:fs`, and why `getPageMeta`'s dynamic `import("./docs")` /
// `import("./blocks")` branches (see that file) work unmodified from this
// route: nothing here runs where those imports would be unavailable.

// --- fonts (§16.3) ---------------------------------------------------------
//
// Read as raw bytes at module scope, per the spec: `next/font` cannot be used
// inside an `ImageResponse` render, because Satori needs the actual font
// bytes handed to it up front rather than a lazily-resolved font-loading
// strategy. `process.cwd()` (not `import.meta.url`) is this repo's
// established way to anchor a build-time filesystem read — see
// `lib/docs/corpus.ts`'s `DOCS_DIR` comment for the full reasoning: a bundled
// server chunk's `import.meta.url` points into `.next/server/chunks/…`, not
// the repo, so a source-relative climb from there resolves nowhere. Every
// `next build` / `next dev` / `next start` in this repo runs with
// `cwd = apps/web`, which is also Vercel's configured root directory.
//
// Both files are Geist v5 as served by Google Fonts' `css2` endpoint to a
// non-woff2 user agent (a TTF, not the woff2 a modern browser would get) —
// 72,916 B at weight 400 and 73,048 B at weight 600, verified byte-for-byte
// against those two numbers when they were downloaded for this task. Together
// that's 146 KB of `ImageResponse`'s 500 KB total budget (fonts included).
const FONTS_DIR = path.join(process.cwd(), "lib/og/fonts");
const geistRegular = readFileSync(path.join(FONTS_DIR, "Geist-Regular.ttf"));
const geistSemiBold = readFileSync(path.join(FONTS_DIR, "Geist-SemiBold.ttf"));

// `dynamicParams` is forced on, not a stylistic default: §16.6 established
// that the blocks group and category cards are missing in production today
// precisely because Blume's generator skips any `[param]` route, and §10
// established that `generateStaticParams` runs once at build time and
// never re-runs on revalidation — new categories reach their PAGES only
// because those pages already set `dynamicParams = true`. An OG route that
// enumerated the same routes but left `dynamicParams` at its default `false`
// would 404 the card for every category added after the last deploy: the
// exact bug this stage exists to fix, reintroduced on a delay.
export const dynamicParams = true;

// Matches §15.7's site-wide ISR ceiling — no route in this codebase
// revalidates less often than every 300 seconds — so this route introduces
// no second cache-lifetime number for a reader to reconcile against the
// rest of the site. Blume's generated cards shipped
// `Cache-Control: public, max-age=31536000, immutable`; that header is
// deliberately dropped here rather than reproduced, because `immutable` on
// an asset this route can and does revalidate would be a lie, and Vercel's
// CDN already fronts the prerendered PNGs without needing this route to
// assert their immutability itself.
export const revalidate = 300;

type Params = { slug: string[] };

// The URL contract, both directions (§16, controller addendum A1):
// `/` -> ["index.png"]; `/docs/components/button" -> ["docs", "components",
// "button.png"]. The ".png" extension lives on the LAST segment only, never
// as a separate segment of its own. `routeToSlug`/`slugToRoute` themselves
// now live in `lib/og/path.ts` (task-9.2b) — that module's header explains
// why: `lib/metadata.tsx` needs the same route -> image-URL mapping this
// route enumerates slugs with, and a second hand-written copy of it (which
// is what `app/docs/[[...slug]]/page.tsx` carried before this task) is
// exactly the kind of duplicate §16.8 exists to rule out.

/**
 * The slug set IS `sitemapRoutes()` (controller addendum A1) — every route
 * `/sitemap.xml` lists, which is `CUSTOM_ROUTES` + the docs content index +
 * the pro manifest's blocks routes, already assembled and de-duplicated by
 * `lib/site-index.ts`. Reassembling those three sources a second time here
 * would be a second place for the OG card set and the sitemap to disagree;
 * calling the same function they already export is what keeps them the same
 * set by construction. Its `fetch` for the blocks manifest is Data-Cache-keyed
 * by URL, so a build that also renders `/sitemap.xml`, `/llms.txt` and
 * `/index.md` in the same revalidation window shares that one request across
 * all four surfaces.
 *
 * `/404` gets no card (nothing in `sitemapRoutes()` names it), matching
 * today's production, where a missing page has no OG image to be missing.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const routes = await sitemapRoutes();
  return routes.map((route) => ({ slug: routeToSlug(route) }));
}

/**
 * The registry lookup that makes `dynamicParams: true` safe rather than a
 * sequel to §16.6's bug (controller addendum A2). `getPageMeta` already
 * answers `undefined` for any route unknown to all three of its sources
 * (custom, docs, blocks) — exactly the "registry lookup, else `notFound()`"
 * §16.7 calls for — so this route does not re-implement that check; it only
 * converts the slug to a route string and asks. Without this lookup,
 * `dynamicParams: true` plus a route that drew *any* title/description pair
 * it was handed would turn `/og/<anything>.png` into an image generator
 * hosted on this domain, under this logomark, saying whatever the caller's
 * URL asked it to say — a real abuse surface for a social preview card. It
 * is also parity: a missing file 404s in today's static build.
 *
 * No `?? site.description` fallback is added here on top of `getPageMeta`'s
 * answer (controller addendum A2): `/account`'s registered description in
 * `lib/page-meta.ts` is already `site.description` — the fallback §16.4
 * calls for is baked into the registry itself, and stacking a second
 * fallback on top would just be a second, redundant answer to the same
 * question of "what does /account's card say".
 */
export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const route = slugToRoute(slug);
  const meta = route ? await getPageMeta(route) : undefined;
  if (!meta) {
    notFound();
  }

  // `height`/`width` come from `lib/og/dimensions.ts` — the same numbers the
  // `OgCard` root div is sized to and `lib/metadata.tsx` declares as
  // `og:image:width`/`og:image:height` — rather than a third pair of
  // literals here; see that module's header for why a mismatched pair would
  // fail silently (a letterboxed or clipped render, or a wrong declared box)
  // instead of loudly.
  return new ImageResponse(<OgCard description={meta.description} title={meta.title} />, {
    fonts: [
      { data: geistRegular, name: "Geist", style: "normal", weight: 400 },
      { data: geistSemiBold, name: "Geist", style: "normal", weight: 600 },
    ],
    height: HEIGHT,
    width: WIDTH,
  });
}
