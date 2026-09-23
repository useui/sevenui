import type { Metadata } from "next";
import { HEIGHT, WIDTH } from "./og/dimensions";
import { ogImagePath } from "./og/path";
import type { PageMeta } from "./page-meta";
import { getPageMeta } from "./page-meta";
import { pageTitle, site } from "./site";

export function pageMetadata(route: string, title: string, description: string): Metadata {
  const suffixed = pageTitle(title);
  const imagePath = ogImagePath(route);
  const isRoot = route === "/";

  return {
    title: suffixed,
    description,
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
