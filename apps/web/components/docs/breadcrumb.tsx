"use client";

import { usePathname } from "next/navigation";
import type { Crumb } from "../../lib/docs/nav";
import { Breadcrumb } from "../breadcrumb";

/**
 * The docs breadcrumb (§11.3). Since Task 5.2 this file is a thin wrapper and
 * nothing else: the markup — and the whole argument for it, including why
 * Blume's eyebrow-word `Breadcrumbs.astro` was replaced and why the element
 * upgrade is pixel-identical — moved to `components/breadcrumb.tsx` so
 * `/blocks` could render the SAME component rather than a second copy of it.
 * What is left here is the one thing that is genuinely docs-specific: picking
 * this route's trail out of the precomputed map.
 *
 * `"use client"` for exactly one reason, the same one `DocsSidebar` gives: the
 * trail depends on the current route, App Router does not re-render a shared
 * layout when navigating between its children, and this component must sit in
 * the LAYOUT (above `<DocsTocMobile />`, per `RootLayout.astro:684-688`'s
 * order) where no route or `params` is available. So the route comes from
 * `usePathname()`. The two `/blocks` pages need no wrapper at all for the same
 * reason inverted — they are pages, so they know their own route and build
 * their own trail on the server.
 *
 * The trails themselves are still computed on the SERVER: `lib/docs/nav.ts` is
 * `import "server-only"`, so `docsTrail` cannot be called from here (only its
 * `Crumb` TYPE crosses, and `import type` is erased before any bundler sees
 * it). `app/docs/layout.tsx` builds one trail per route and hands the map down
 * as plain data — the same shape, built in the same loop, as the
 * `headingsByRoute` map `DocsTocProvider` already receives, and for the same
 * reason.
 *
 * The empty-trail and one-item cases are handled by `Breadcrumb` itself (a
 * route with no trail at all cannot happen for a docs page — `assertNavCoversIndex`
 * fails the build first), so the `?? []` below is only there to keep the prop
 * type honest.
 *
 * Position, spacing and measure are Blume's unchanged: above the `<h1>`,
 * `mb-2`, on the 42rem `max-w-content` measure. That is what the class string
 * below carries, and it is the only part of the rendering this file still
 * owns.
 */
export function DocsBreadcrumb({ crumbsByRoute }: { crumbsByRoute: Record<string, Crumb[]> }) {
  const pathname = usePathname();

  return (
    <Breadcrumb
      className="mx-auto mb-2 max-w-content text-muted-foreground text-sm"
      crumbs={crumbsByRoute[pathname] ?? []}
    />
  );
}
