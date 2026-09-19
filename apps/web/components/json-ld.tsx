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
 * `BreadcrumbList` is a third graph node added later, by Stages 3 and 5 — not
 * implemented here.
 */
export function JsonLd({ route }: { route: string }) {
  const websiteId = `${site.url}#website`;
  const graph: Record<string, unknown>[] = [
    { "@id": websiteId, "@type": "WebSite", name: site.name, url: site.url },
  ];

  if (route !== "/") {
    const meta = getPageMeta(route);
    if (!meta) {
      throw new Error(`JsonLd: no page-meta registered for route "${route}"`);
    }
    const pageUrl = `${site.url}${route}`;
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }}
    />
  );
}
