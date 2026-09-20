import Link from "next/link";
import type { Crumb } from "../lib/docs/nav";

export type { Crumb };

/**
 * The site's one breadcrumb, presentational and route-agnostic: it is handed a
 * finished trail and renders it. Extracted from `components/docs/breadcrumb.tsx`
 * by Task 5.2 so `/blocks` could adopt the SAME markup instead of a second copy
 * of it — the docs wrapper and the two `/blocks` pages are now the only callers,
 * and they differ by their trail and one class attribute, nothing else.
 *
 * MARKUP HISTORY, unchanged by the extraction. Blume's `Breadcrumbs.astro`
 * computed the whole trail and rendered only `crumbs[length - 2]` as a single
 * eyebrow word, and rendered nothing at all at trail length <= 1 — which is why
 * all 65 primitive pages shipped an identical non-linked "Primitives". §11.3
 * replaced that with the idiom `/blocks` already used in production (linked
 * ancestors, `/` separators on `mx-1.5`, the current page a non-linked
 * `text-foreground`) and upgraded the ELEMENTS to `nav > ol > li` with
 * `aria-current="page"` on the last item. The list reset on the `<ol>` plus the
 * row layout reproduce the inline text flow production's bare spans got for
 * free, so that upgrade is pixel-identical and touches the accessibility tree
 * only (§17.6 #24). Separators are `aria-hidden`: the list already conveys the
 * structure, so read-out slashes are noise.
 *
 * It is `/blocks` that comes to the docs markup rather than the reverse. Copying
 * production's `/blocks` breadcrumb the other way would have propagated its two
 * gaps — no list semantics, no `aria-current` — onto 68 more pages.
 *
 * NO `"use client"`, deliberately, and it is not an oversight to fix. This file
 * has no hook and no handler, so it renders on the server for the two `/blocks`
 * pages (which know their own route and build their own trail) and is pulled
 * into the client graph by `components/docs/breadcrumb.tsx`, which needs
 * `usePathname()`. A `"use client"` here would force the first case into the
 * browser bundle for no reason. `Crumb` is re-exported as a TYPE so a caller can
 * name it without importing `lib/docs/nav.ts` — that module is `server-only`,
 * and a type import is erased before any bundler sees it.
 *
 * `className` is required rather than defaulted. The two call sites genuinely
 * disagree (the docs trail is centred on the 42rem measure above an `<h1>`; the
 * `/blocks` trail sits inside a header's own 2xl wrapper), and a default would
 * mean one of them silently inheriting the other's spacing after an edit.
 */
export function Breadcrumb({ className, crumbs }: { className: string; crumbs: Crumb[] }) {
  // A one-item trail is the current page naming itself, which carries no
  // information — the same emptiness §11.3 exists to remove. `/docs` is the
  // real case (its trail is its own root); both `/blocks` pages always pass
  // two or more. `components/json-ld.tsx` applies the identical test to the
  // `BreadcrumbList` node, so the rendered trail and the structured data
  // appear and disappear together.
  if (crumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
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
