import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "../../../components/json-ld";
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

// 69 entries: one per file in apps/web/docs/**/*.mdx (65 under components/,
// plus index.mdx, installation.mdx, theming.mdx and — from Task 3.3 —
// components.mdx, the Primitives index). `/docs` itself (index.mdx) maps to
// `slug: []`, matching this route's optional catch-all segment.
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
  // Hoisted out of the `getDoc` call below because `<JsonLd>` needs the same
  // string, and `routeFrom` is the one place a slug array becomes it (see its
  // own comment). It produces exactly the leading-slash / no-trailing-slash
  // form `lib/page-meta.ts`'s contract requires: `slug.join("/")` cannot
  // yield a trailing slash (Next never puts an empty segment in the array),
  // and the empty-slug case is the literal `"/docs"`, not `"/docs/"` and not
  // `""`.
  const route = routeFrom({ slug });
  const doc = await getDoc(route);
  if (!doc) notFound();

  // Relative, literally-prefixed specifier: Turbopack builds the context
  // module from the static prefix `../../../docs/` (this file lives at
  // apps/web/app/docs/[[...slug]]/page.tsx — three directories up from
  // apps/web/, then into docs/).
  //
  // Correction (Task 2.6 fix round 1, MINOR 2): this comment used to claim
  // the `@docs/*` alias was "deliberately not usable here because
  // Turbopack needs a literal relative prefix, not an alias, to build the
  // dynamic-import context." That platform limitation does not exist —
  // Task 2.6 reproduced both halves against `components/mdx/component.tsx`'s
  // own dynamic import: the brief's aliased specifier there failed only
  // because its alias (`@/*` -> `packages/registry/*`) doubled a path
  // segment, and Turbopack's own error message named the doubled path,
  // which is itself proof it built the aliased dynamic-import context
  // fine; a path-corrected alias (`@/demos/${path}.tsx`) compiled and ran
  // all the way to static generation. The relative form above is kept as
  // the choice here (consistency with the one other dynamic-import call
  // site, `component.tsx`, which reaches the same conclusion) — not
  // because the aliased form is broken under Turbopack, because it isn't.
  const { default: MDXContent } = await import(`../../../docs/${slug.length ? slug.join("/") : "index"}.mdx`);

  // `mx-auto max-w-content` — the 42rem docs measure (§A5, Task 3.1).
  // `--container-content: 42rem` has been declared in `app/globals.css`
  // since Task 1.x with zero call sites; production carries it on
  // `<article class="prose mx-auto max-w-content">`
  // (RootLayout.astro:305). `prose` does NOT come along: §8.3 replaced
  // `.prose` with element overrides in `globals.css`, so the class has no
  // definition here.
  //
  // On the `<article>` itself, as production has it, not on a wrapper in
  // `app/docs/layout.tsx`: the four remaining call sites the `globals.css`
  // comment predicts ("five `max-w-content` call sites on one live page")
  // are the breadcrumb, the mobile TOC, the pagination and the
  // last-updated line — all of them SIBLINGS of the article on the same
  // measure, not ancestors of it. A wrapper would centre the article
  // inside a 42rem box and then leave each of those four to be centred
  // again, or force them inside a wrapper they do not belong in. After
  // this task the count is 1; Tasks 3.2-3.4 take it to 5.
  // `<JsonLd>` mounts HERE, and until Task 3.3 it was mounted nowhere at all:
  // the component shipped in Task 1.7 and the only other occurrences of its
  // name in the repo were comments, so every docs page was emitting zero
  // `application/ld+json` against production's one — an unlisted regression,
  // and no place for §17.6 #23's new `BreadcrumbList` node to land.
  //
  // The page rather than a layout, because a layout is not given the
  // pathname in App Router and this file already owns the one conversion from
  // slug array to route string. OUTSIDE the `<article>`, not inside it: the
  // payload is a `<script>`, and §17.2's text extractor reads the article's
  // text — a JSON blob inside it would be page content as far as any text
  // comparison is concerned. `<JsonLd>` also THROWS on a route
  // `getPageMeta` cannot answer (Task 1.7's deliberate fail-loud choice,
  // which no build had ever executed before this mount); Task 2.5 widened
  // that resolver to answer every `/docs` route from the content index, so
  // all 69 resolve, `/docs/components` included, with no `CUSTOM` entry.
  return (
    <>
      <article className="mx-auto max-w-content">
        <h1>{doc.title}</h1>
        <p className="my-4 text-lg text-muted-foreground">{doc.description}</p>
        <MDXContent />
      </article>
      <JsonLd route={route} />
    </>
  );
}
