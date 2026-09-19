import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDoc, getDocIndex } from "../../../lib/docs";
import { getPageMeta } from "../../../lib/page-meta";
import { pageTitle } from "../../../lib/site";

type Params = { slug?: string[] };

// Route-format contract (mirrors lib/page-meta.ts's, since both key off the
// same content-index `route` strings): leading slash, no trailing slash, no
// query/hash. `getDoc`/`getDocIndex` are an exact string match against
// `route`, so this is the one place a slug array becomes that string —
// every other function in this file goes through it rather than
// re-deriving its own version.
function routeFrom({ slug = [] }: Params): string {
  return slug.length ? `/docs/${slug.join("/")}` : "/docs";
}

// 68 entries: one per file in apps/web/docs/**/*.mdx (65 under components/,
// plus index.mdx, installation.mdx, theming.mdx). `/docs` itself (index.mdx)
// maps to `slug: []`, matching this route's optional catch-all segment.
export async function generateStaticParams() {
  const index = await getDocIndex();
  return index.map((p) => ({
    slug: p.route === "/docs" ? [] : p.route.slice("/docs/".length).split("/"),
  }));
}

// Goes through lib/page-meta.ts's getPageMeta — the single §16.8 lookup —
// rather than reading doc.title/doc.description straight off getDoc(),
// even though this function could get both fields that way (as the brief's
// Step 2 *snippet* literally shows). The brief's *prose* is the actual
// requirement: "Widen lib/page-meta.ts's resolver to answer for docs
// routes from the content index in this step, so Stage 9's OG route reads
// the same {title, description} the page declares." A page.tsx that reads
// getDoc directly while getPageMeta reaches the index its own way is ONE
// underlying source split across TWO lookups that are not symmetric
// (getPageMeta checks CUSTOM first; a future CUSTOM["/docs"] — or any
// getPageMeta-only fallback, cf. CUSTOM["/account"]'s site.description
// fallback — would silently diverge from this page's own metadata, which
// is exactly what §16.8 exists to prevent). Routing both through
// getPageMeta makes that divergence structurally impossible instead of
// merely unexercised today. No extra filesystem cost: getPageMeta's docs
// branch calls the same memoized getDoc() this file also calls below.
//
// pageTitle() is the one place the em-dash suffix is applied (§15.8,
// §17.6 #17): it moves <title>, og:title and og:image:alt together. <h1>
// in the page body below reads doc.title directly (via getDoc, not
// getPageMeta) and does NOT go through pageTitle() — verified live, every
// docs <h1> is bare.
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const route = routeFrom(await params);
  const meta = await getPageMeta(route);
  if (!meta) return {};
  return {
    title: pageTitle(meta.title),
    description: meta.description,
    openGraph: {
      title: pageTitle(meta.title),
      description: meta.description,
      images: [{ url: `/og${route}.png`, alt: pageTitle(meta.title) }],
    },
  };
}

export default async function DocPage({ params }: { params: Promise<Params> }) {
  const { slug = [] } = await params; // params is a Promise in Next 16
  const doc = await getDoc(routeFrom({ slug }));
  if (!doc) notFound();

  // Relative, literally-prefixed specifier: Turbopack builds the context
  // module from the static prefix `../../../docs/` (this file lives at
  // apps/web/app/docs/[[...slug]]/page.tsx — three directories up from
  // apps/web/, then into docs/). The `@docs/*` tsconfig alias exists for
  // static imports and type resolution only; it is deliberately not usable
  // here because Turbopack needs a literal relative prefix, not an alias,
  // to build the dynamic-import context (§4.1).
  const { default: MDXContent } = await import(`../../../docs/${slug.length ? slug.join("/") : "index"}.mdx`);

  return (
    <article>
      <h1>{doc.title}</h1>
      <MDXContent />
    </article>
  );
}
