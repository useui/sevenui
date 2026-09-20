"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Crumb } from "../../lib/docs/nav";

/**
 * The docs breadcrumb (§11.3). Replaces Blume's `Breadcrumbs.astro`, which
 * computed the whole trail and then rendered only `crumbs[length - 2]` — the
 * parent group — as a single eyebrow word, and rendered nothing at all at
 * trail length <= 1. That is why all 65 primitive pages shipped an identical
 * non-linked "Primitives" and `/docs`, `/docs/installation` and
 * `/docs/theming` shipped no breadcrumb whatsoever.
 *
 * Idiom adopted from `/blocks` rather than invented: linked ancestors,
 * `/` separators with `mx-1.5`, the current page a non-linked
 * `text-foreground`. The ELEMENTS are upgraded to the semantically correct
 * `nav > ol > li` with `aria-current="page"` on the last item; `list-none`
 * (plus the flex row, which reproduces the inline text flow `/blocks`'s bare
 * spans get for free) keeps that pixel-identical, so this is an
 * accessibility-tree change, not a visual one. Separators are
 * `aria-hidden` — the list conveys the structure, so read-out slashes are
 * pure noise. Position, spacing and measure are Blume's unchanged: above the
 * `<h1>`, `mb-2`, on the 42rem `max-w-content` measure.
 *
 * `"use client"` for exactly one reason, the same one `DocsSidebar` gives:
 * the trail depends on the current route, App Router does not re-render a
 * shared layout when navigating between its children, and this component
 * must sit in the LAYOUT (above `<DocsTocMobile />`, per
 * `RootLayout.astro:684-688`'s order) where no route or `params` is
 * available. So the route comes from `usePathname()`.
 *
 * The trails themselves are still computed on the SERVER: `lib/docs/nav.ts`
 * is `import "server-only"`, so `docsTrail` cannot be called from here (only
 * its `Crumb` TYPE crosses, and `import type` is erased before any bundler
 * sees it). `app/docs/layout.tsx` builds one trail per route and hands the
 * map down as plain data — the same shape, built in the same loop, as the
 * `headingsByRoute` map `DocsTocProvider` already receives, and for the same
 * reason.
 */
export function DocsBreadcrumb({ crumbsByRoute }: { crumbsByRoute: Record<string, Crumb[]> }) {
  const pathname = usePathname();
  const crumbs = crumbsByRoute[pathname] ?? [];

  // Nothing for `/docs` (a one-item trail — the current page and nothing
  // else carries no information), and nothing for a route with no trail at
  // all, which cannot happen for a docs page: `assertNavCoversIndex` fails
  // the build first.
  if (crumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className="mx-auto mb-2 max-w-content text-muted-foreground text-sm">
      <ol className="m-0 flex list-none flex-wrap items-center p-0">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li
              aria-current={isLast ? "page" : undefined}
              className="flex items-center"
              key={crumb.href ?? crumb.label}
            >
              {index > 0 && (
                <span aria-hidden="true" className="mx-1.5">
                  /
                </span>
              )}
              {isLast || !crumb.href ? (
                <span className={isLast ? "text-foreground" : undefined}>{crumb.label}</span>
              ) : (
                <Link className="hover:text-foreground hover:underline" href={crumb.href}>
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
