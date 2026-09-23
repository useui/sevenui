import { type Crumb, docsTrail, getNavTree } from "../lib/docs/nav";
import { getPageMeta } from "../lib/page-meta";
import { site } from "../lib/site";

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

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");

  // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD from our own metadata, with < escaped
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
