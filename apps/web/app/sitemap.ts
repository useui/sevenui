import type { MetadataRoute } from "next";
import { site } from "../lib/site";
import { sitemapRoutes } from "../lib/site-index";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await sitemapRoutes();
  return routes.map((route) => ({ url: `${site.url}${route}` }));
}
