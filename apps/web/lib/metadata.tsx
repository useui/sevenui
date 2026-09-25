import type { Metadata } from "next";
import { HEIGHT, WIDTH } from "./og/dimensions";
import { ogImagePath } from "./og/path";
import type { PageMeta } from "./page-meta";
import { getPageMeta } from "./page-meta";
import { pageTitle, site } from "./site";

/**
 * The <title> a search result shows. The page keeps its own short name everywhere else (H1, OG card,
 * llms.txt); this adds the words people search for — React, Base UI, shadcn — and splits a primitive's
 * docs page (install + API) from its gallery page (examples) so the two stop competing for one query.
 */
export function documentTitle(route: string, title: string): string {
  if (route === "/") return `${site.name} — Base UI components for shadcn/ui`;
  if (route === "/docs/components") return pageTitle("React Primitives built on Base UI");
  if (route === "/components") return pageTitle("Free React Components for shadcn/ui");
  if (route === "/blocks") return pageTitle("Pro React Blocks for shadcn/ui");
  if (route.startsWith("/docs/components/")) return pageTitle(`React ${title} built on Base UI`);
  if (route.startsWith("/components/")) return pageTitle(`React ${title} Examples, shadcn compatible`);
  if (route.startsWith("/blocks/")) return pageTitle(`${title.replace(/ blocks$/, "")} Blocks for React and shadcn/ui`);
  return pageTitle(title);
}

export function pageMetadata(
  route: string,
  title: string,
  description: string,
  { noindex = false }: { noindex?: boolean } = {},
): Metadata {
  const suffixed = documentTitle(route, title);
  const imagePath = ogImagePath(route);
  const isRoot = route === "/";

  return {
    title: { absolute: suffixed },
    description,
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    ...(isRoot ? {} : { alternates: { canonical: route } }),
    openGraph: {
      type: "website",
      siteName: site.name,
      title: suffixed,
      description,
      ...(isRoot ? {} : { url: route }),
      images: [{ url: imagePath, type: "image/png", width: WIDTH, height: HEIGHT, alt: suffixed }],
    },
    twitter: {
      card: "summary_large_image",
      title: suffixed,
      description,
      images: [{ url: imagePath, alt: suffixed }],
    },
  };
}

export async function pageMetadataOrNotFound(route: string): Promise<Metadata> {
  const meta: PageMeta | undefined = await getPageMeta(route);
  if (!meta) return notFoundMetadata();
  return pageMetadata(route, meta.title, meta.description);
}

export function notFoundMetadata(): Metadata {
  const title = pageTitle("Page not found");
  return {
    title,
    description: site.description,
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description: site.description,
    },
    twitter: {
      card: "summary",
      title,
      description: site.description,
    },
  };
}

export function RootUrlTags() {
  const rootUrl = `${site.url}/`;
  return (
    <>
      <meta content={rootUrl} property="og:url" />
      <link href={rootUrl} rel="canonical" />
    </>
  );
}
