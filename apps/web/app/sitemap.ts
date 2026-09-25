import type { MetadataRoute } from "next";
import lastmod from "../lib/lastmod.generated.json";
import { site } from "../lib/site";
import { sitemapRoutes } from "../lib/site-index";

export const revalidate = 300;

const dates: Record<string, string | undefined> = lastmod;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await sitemapRoutes();
  return routes.map((route) => {
    const lastModified = dates[route];
    return lastModified ? { url: `${site.url}${route}`, lastModified } : { url: `${site.url}${route}` };
  });
}
