const INDEX_SLUG = "index.png";

/** route -> slug segments, the shape `generateStaticParams` must return. */
export function routeToSlug(route: string): string[] {
  if (route === "/") {
    return [INDEX_SLUG];
  }
  const segments = route.slice(1).split("/");
  segments[segments.length - 1] += ".png";
  return segments;
}

export function slugToRoute(slug: string[]): string | undefined {
  if (slug.length === 1 && slug[0] === INDEX_SLUG) {
    return "/";
  }
  const last = slug.at(-1);
  if (!last || !last.endsWith(".png")) {
    return undefined;
  }
  const lastSegment = last.slice(0, -".png".length);
  if (!lastSegment) {
    return undefined;
  }
  return `/${[...slug.slice(0, -1), lastSegment].join("/")}`;
}

export function ogImagePath(route: string): string {
  return `/og/${routeToSlug(route).join("/")}`;
}
