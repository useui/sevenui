import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsFeedback } from "../../../components/docs/feedback";
import { DocsPagination } from "../../../components/docs/pagination";
import { JsonLd } from "../../../components/json-ld";
import { getDoc, getDocIndex } from "../../../lib/docs";
import { pageMetadataOrNotFound } from "../../../lib/metadata";
import { getPageMeta } from "../../../lib/page-meta";

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
// `pageMetadataOrNotFound` (task-9.2b) resolves through `pageMetadata`,
// whose call to `pageTitle()` is the one place the em-dash suffix is applied
// (§15.8, §17.6 #17): it moves <title>, og:title and og:image:alt together.
// <h1> in the page body below reads doc.title directly (via getDoc, not
// getPageMeta) and does NOT go through `pageTitle()` — verified live, every
// docs <h1> is bare.
//
// `pageMetadata` is also what retires this file's own
// `` `/og${route}.png` `` — a second, hand-written spelling of the same
// route -> image-URL mapping `app/og/[...slug]/route.tsx` already owns (see
// `lib/og/path.ts`'s header). Before this task the two were kept in sync by
// coincidence, not by construction; now there is exactly one function that
// turns a route into its card's URL, and both call it.
// No page at this route: the component below calls `notFound()` and
// `app/docs/not-found.tsx` renders. This function's return value on that
// branch — `pageMetadataOrNotFound`'s (task-9.2b) `notFoundMetadata()` call —
// does NOT reach the document: task-9.4 measured `next build` of this exact
// branch and found `/docs/not-a-primitive` and
// `/docs/components/not-a-primitive` shipping `<title>SevenUI</title>` and
// zero `og:*`/`twitter:*` tags, not this branch's suffixed title and seven
// tags. Once the page component's `notFound()` fires, Next renders the
// nearest `not-found.tsx` and reads metadata from THAT boundary (or its
// parent layout's default, absent one) — never from this route's own
// `generateMetadata`. The single place the docs 404's `<title>` is actually
// set is `app/docs/not-found.tsx`'s own `metadata` export.
//
// The branch stays anyway, unreachable or not: `pageMetadataOrNotFound` is
// the one hit-or-miss helper this file shares with all three `/blocks` route
// files (`lib/metadata.tsx`'s docstring), and carving a miss-free path out
// for just this route would reintroduce the per-route special-casing §16.8
// exists to rule out, to save a call that already costs nothing extra (same
// memoized `getPageMeta` lookup either branch takes). It also keeps this
// function honestly total over `Metadata` rather than returning a value that
// happens to never get used for a plausible-sounding reason.
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const route = routeFrom(await params);
  return pageMetadataOrNotFound(route);
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
  // module from the literal prefix `../../../docs/` (this file lives at
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
  // all the way through prerendering. The relative form above is kept as
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
  // The bare title the feedback event reports (§17.6 #25), taken from the
  // §16.8 single lookup rather than off `doc` — the same reason
  // `generateMetadata` above goes through it. For a route `getDoc` has just
  // answered, `getPageMeta`'s docs branch returns `{ title: doc.title }` out
  // of that same memoized call, so the fallback below is `doc.title` by
  // construction and exists only to satisfy the optional return type:
  // `<JsonLd>` already throws on a route this resolver cannot answer.
  const meta = await getPageMeta(route);

  // Blume's foot-of-page order (`RootLayout.astro:692-706`): the article,
  // then feedback, then pagination — two separately-ruled strips, each with
  // its own top margin and top rule. Blume's `lastUpdated` line sits between
  // them in the source and is NOT ported, because it does not render on this
  // site at all: the shipped HTML contains zero occurrences of it (no
  // `lastModified` is configured), and neither the spec nor the plan
  // mentions it anywhere. That is also the correction to this file's
  // `max-w-content` comment above, which predicted the four siblings as
  // "breadcrumb, mobile TOC, pagination, last-updated": the live four are
  // the breadcrumb, the mobile TOC, FEEDBACK and the pagination, which is
  // what the five live occurrences on a primitive page are.
  //
  // `<JsonLd>` moves to last. It renders a `<script>`, so its position among
  // these siblings is invisible; keeping the two content blocks adjacent to
  // the article they belong to reads better than threading a payload
  // between them.
  return (
    <>
      {/*
        The three agent-facing `<link>` tags (§15.11), transcribed from the
        shipped HTML:

          <link href="/agent-readability.json" rel="describedby" type="application/json">
          <link href="/llms.txt" rel="describedby" type="text/plain">
          <link href="/docs/components/button.md" rel="alternate" type="text/markdown">

        React hoists a `<link>` into the document head from wherever it is
        rendered, so their position among these siblings is invisible — the
        same property `<JsonLd>` relies on below.

        HERE, NOT IN `app/docs/layout.tsx`, and not in a client component
        mounted by it. The third tag's href is the current route's `.md`
        mirror; the layout sits above the `[[...slug]]` segment, is handed no
        params, and cannot know which route it is wrapping (the constraint
        `toc.tsx`, `breadcrumb.tsx` and `page-actions.tsx` each document). This
        page already owns `route` — the one conversion from slug array to route
        string, above — so it needs neither `usePathname()` nor a client
        boundary to build the href.

        It also needs no "is this a real docs page" guard. `getDoc` has already
        returned above and `notFound()` has already run for a miss, so
        `app/docs/not-found.tsx` renders WITHOUT this element in the tree at
        all — where a layout-mounted version had to be handed all 69 route
        strings just to decide to render nothing. The docs-only scope is
        unchanged either way: this subtree is the only place these tags exist,
        verified absent on `/`, `/components/button` and `/blocks`.

        `${route}.md` is the mirror's URL, built the same way
        `page-actions.tsx` builds its "Copy as Markdown" target and the same
        way `scripts/build-md-mirrors.ts` names the file it writes into
        `public/` (§15.2's slug rule). Three call sites, one shape; if the
        mirrors ever move, all three move together.
      */}
      <link href="/agent-readability.json" rel="describedby" type="application/json" />
      <link href="/llms.txt" rel="describedby" type="text/plain" />
      <link href={`${route}.md`} rel="alternate" type="text/markdown" />
      <article className="mx-auto max-w-content">
        {/*
          The docs page title. It carries its own classes because NOTHING
          else can give it any: it is literal JSX, so `mdx-components.tsx`'s
          element map never sees it (MDX dispatches `_components` for
          markdown SYNTAX only), and §6's map correctly declares no `h1`
          override because no MDX body has one — verified by scanning the
          corpus rather than by trusting §6's count, which says 68 where
          `find apps/web/docs -name '*.mdx'` returns 69: zero of the 69
          contains a `# ` heading or a literal `<h1>`. With
          `.prose` deleted (§6, §8.3) and Tailwind preflight's
          `h1-h6 { font-size: inherit; font-weight: inherit }` in force, this
          element rendered at the body's 16px/400 — smaller than the `<h2>`s
          beneath it — on all 69 docs routes (task 11.1e, R1).

          Every value below is production's, read off
          https://sevenui.dev/docs/components/button with getComputedStyle at
          1440 and 390 (task-11.1e-report.md has the table), not transcribed
          from Blume's override file:

            48px/500, line-height 1.1, margin 0 0 1rem, letter-spacing
            -0.05em (-2.4px), overflow-wrap: break-word, display font
            — and 36px at 390.

          `text-4xl sm:text-5xl` is that responsive pair. Production writes it
          as a flat `3rem` with `@media (width <= 640px) { 2.25rem }`. THE
          CAUSE of the one-pixel disagreement is that the two conventions
          are inclusive at the same number from opposite sides: production's
          query is `max-width: 640px` and Tailwind's `sm:` is
          `min-width: 640px`, so both match at exactly 640 and neither
          matches "just below 641". Measured: 639 agree, 641 agree, and at
          exactly 640 production gives 36px where this gives 48px (the `h2`
          does the same thing, 26px vs 30px). Nothing is broken at that
          width — it is the boundary itself. Recorded rather than papered
          over with an arbitrary `min-[641px]:` value, which would only move
          the disagreement to fractional widths between 640 and 641.

          `tracking-tighter` is -0.05em, the same value the restored bare
          heading rule in `globals.css` supplies — stated here too, so this
          heading keeps production's tracking on its own, exactly as the `h2`
          and `h3` overrides in `mdx-components.tsx` do.
        */}
        <h1 className="mb-4 font-display text-4xl leading-[1.1] font-medium tracking-tighter text-foreground break-words sm:text-5xl">
          {doc.title}
        </h1>
        <p className="my-4 text-lg text-muted-foreground">{doc.description}</p>
        <MDXContent />
      </article>
      <DocsFeedback title={meta?.title ?? doc.title} />
      <DocsPagination route={route} />
      <JsonLd route={route} />
    </>
  );
}
