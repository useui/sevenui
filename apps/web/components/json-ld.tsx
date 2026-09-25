import { type Crumb, docsTrail, getNavTree } from "../lib/docs/nav";
import { ogImagePath } from "../lib/og/path";
import { getPageMeta, type PageMeta } from "../lib/page-meta";
import { site } from "../lib/site";
import { PRO_PRICE } from "../lib/pro-pricing";

const isCollection = (route: string): boolean =>
  route === "/components" || route.startsWith("/components/") || route === "/blocks" || route.startsWith("/blocks/");

function pageNode(route: string, meta: PageMeta, websiteId: string, organizationId: string): Record<string, unknown> {
  const pageUrl = `${site.url}${route}`;
  const common = {
    "@id": `${pageUrl}#page`,
    inLanguage: "en",
    name: meta.title,
    url: pageUrl,
    description: meta.description,
    isPartOf: { "@id": websiteId },
  };

  if (route === "/docs" || route.startsWith("/docs/")) {
    return { ...common, "@type": "TechArticle", headline: meta.title };
  }
  if (isCollection(route)) {
    return { ...common, "@type": "CollectionPage" };
  }
  if (route === "/pro") {
    return {
      ...common,
      "@type": "WebPage",
      mainEntity: {
        "@id": `${pageUrl}#product`,
        "@type": "Product",
        name: `${site.name} Pro`,
        description: meta.description,
        image: `${site.url}${ogImagePath(route)}`,
        brand: { "@id": organizationId },
        offers: {
          "@type": "Offer",
          price: PRO_PRICE.launch.toFixed(2),
          priceCurrency: PRO_PRICE.currency,
          availability: "https://schema.org/InStock",
          url: pageUrl,
        },
      },
    };
  }
  return { ...common, "@type": "WebPage" };
}

export async function JsonLd({ route, crumbs }: { route: string; crumbs?: Crumb[] }) {
  const rootUrl = `${site.url}/`;
  const websiteId = `${rootUrl}#website`;
  const organizationId = `${rootUrl}#organization`;
  const pageUrl = `${site.url}${route}`;
  const graph: Record<string, unknown>[] = [
    {
      "@id": organizationId,
      "@type": "Organization",
      name: site.name,
      url: rootUrl,
      logo: `${site.url}/icon.svg`,
      sameAs: [`https://github.com/${site.github.owner}/${site.github.repo}`],
    },
    { "@id": websiteId, "@type": "WebSite", name: site.name, url: rootUrl, publisher: { "@id": organizationId } },
  ];

  if (route !== "/") {
    const meta = await getPageMeta(route);
    if (!meta) {
      throw new Error(`JsonLd: no page-meta registered for route "${route}"`);
    }
    graph.push(pageNode(route, meta, websiteId, organizationId));
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
