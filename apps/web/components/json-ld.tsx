import { type Crumb, docsTrail, getNavTree } from "../lib/docs/nav";
import { getPageMeta } from "../lib/page-meta";
import { site } from "../lib/site";

/**
 * The site's `@graph` JSON-LD (§15.8): a `WebSite` node on every page, plus a
 * `TechArticle` node on every page except the landing page. Node shapes and
 * field names are ported from production — see task-1.7-report.md for the
 * payloads read from `/`, `/docs/components/button`, `/components/button`
 * and `/blocks`.
 *
 * `headline`/`name` take the **bare** title from `getPageMeta`, never the
 * output of `pageTitle`: the em-dash suffix belongs to the browser tab, not
 * the article. Today's 16 non-docs `TechArticle` pages emit a suffixed
 * headline; that is intended diff §17.6 #18.
 *
 * `BreadcrumbList` is the third graph node, added for docs routes by Task 3.3
 * (§17.6 #23) — production emits only the two above, so this node is
 * genuinely new. Task 5.2 brings `/blocks` onto it through the optional
 * `crumbs` prop: a caller that already has a trail hands it over, and only a
 * caller that does not falls back to computing the docs trail. See the
 * `trail` line below for why that is a prop rather than a second branch here.
 *
 * ROUTE FORMAT, and it is not cosmetic: `route` must have a leading slash and
 * NO trailing slash (`lib/page-meta.ts`'s own contract names this component
 * as the caller that throws otherwise — a trailing slash makes `getPageMeta`
 * return `undefined` and the `!meta` branch below fails the build). Every
 * mount point must normalise before passing.
 */
export async function JsonLd({ route, crumbs }: { route: string; crumbs?: Crumb[] }) {
  const websiteId = `${site.url}#website`;
  const pageUrl = `${site.url}${route}`;
  const graph: Record<string, unknown>[] = [
    { "@id": websiteId, "@type": "WebSite", name: site.name, url: site.url },
  ];

  if (route !== "/") {
    const meta = await getPageMeta(route);
    if (!meta) {
      throw new Error(`JsonLd: no page-meta registered for route "${route}"`);
    }
    graph.push({
      "@id": `${pageUrl}#page`,
      "@type": "TechArticle",
      headline: meta.title,
      inLanguage: "en",
      name: meta.title,
      url: pageUrl,
      description: meta.description,
      isPartOf: { "@id": websiteId },
    });
  }

  // The `BreadcrumbList` node (§17.6 #23) — the SAME trail the rendered
  // breadcrumb draws, from the same function, so the markup and the
  // structured data cannot describe two different hierarchies. That is the
  // whole reason it is not assembled locally here.
  //
  // Emitted only for a trail of two or more, which mirrors
  // `components/breadcrumb.tsx`'s own guard: `/docs` is its own trail's only
  // item, and a one-item breadcrumb list is as empty of information in the
  // graph as it is on the page.
  //
  // WHY `crumbs` IS A PROP AND NOT A SECOND BRANCH IN HERE (Task 5.2). The
  // `/blocks` trail cannot be recomputed from `route` in this file without
  // reaching for `lib/blocks.ts` and re-deriving a hierarchy the calling page
  // has already resolved — a second derivation of the same thing, free to
  // disagree with the first. Instead each `/blocks` page builds ONE array and
  // passes it to both the rendered breadcrumb and this component, which is
  // what preserves the property this comment has always insisted on: the
  // markup and the structured data cannot describe two different hierarchies,
  // because they are literally the same array.
  //
  // `??` short-circuits, so `getNavTree()` is not awaited at all on a route
  // that brought its own trail. When no trail is passed, the tree is read
  // unconditionally rather than behind a "is this a docs route" test:
  // `docsTrail` already answers `[]` for anything the nav does not contain,
  // so a second route-shape predicate here would be a duplicate of
  // `getPageMeta`'s free to drift from it. The tree is memoized through
  // `getDocIndex()`, which every docs render has already resolved by this
  // point, so this costs no extra filesystem pass.
  //
  // `position` is 1-based and contiguous by construction (the array index),
  // and every `item` is absolute — Google resolves neither a relative `item`
  // nor a gap in the sequence.
  const trail = crumbs ?? docsTrail(await getNavTree(), route);
  if (trail.length > 1) {
    graph.push({
      "@id": `${pageUrl}#breadcrumb`,
      "@type": "BreadcrumbList",
      itemListElement: trail.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        ...(crumb.href ? { item: `${site.url}${crumb.href}` } : {}),
      })),
    });
  }

  // `dangerouslySetInnerHTML` puts this string directly into the document
  // with no HTML-escaping of its own — unlike an attribute value (e.g.
  // `generateMetadata`'s `description`, which Next escapes for us), a raw
  // "<" here can close the `<script>` tag early if any title/description
  // ever contains one. No current description does (byte-neutral today),
  // but `getPageMeta` above now answers from author-written docs
  // frontmatter (Stage 2), which taints this payload from this task
  // onward regardless of whether `<JsonLd>` is mounted yet. Escaping to
  // the JS string escape `<` is Next's own prescribed fix for this
  // exact sink and is unconditionally safe (valid inside a JSON string,
  // parses back to the same "<").
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
