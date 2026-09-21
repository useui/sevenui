"use client";

import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";
import type { Heading } from "../../lib/docs/headings";
import { useActiveHeading } from "./use-active-heading";

/**
 * The docs table-of-contents (§11.3), ported from
 * `blume/components/layout/TableOfContents.astro`. Two renderers over one data
 * source and one scroll-spy: `DocsTocMobile` is the collapsible shown above the
 * content below `xl`, `DocsTocDesktop` is the list in the sticky third grid
 * track from `xl` up. `app/docs/layout.tsx` mounts the provider around the grid
 * and drops each renderer at the position `RootLayout.astro:684-721` had it.
 *
 * WHY THE PROVIDER CARRIES EVERY ROUTE'S HEADINGS. The two renderers live in
 * different grid tracks, so the hook that feeds both has to sit above the grid —
 * in `app/docs/layout.tsx`. That layout is at `app/docs/`, ABOVE the
 * `[[...slug]]` segment, so it is handed no `params` and there is no server API
 * that tells it which docs route is being rendered; Next also does not re-render
 * a shared layout when navigating between its children, which is the same
 * constraint `sidebar.tsx` documents for `aria-current="page"`. So the layout
 * hands down the whole `route -> headings` map and `usePathname()` picks the row
 * — correct on first paint AND after a client-side navigation.
 *
 * The map's cost is real and measured, not hand-waved. On
 * `/docs/components/button`: 509 headings over 68 routes, 32,854 B of JSON,
 * 38,080 B once escaped into the inlined flight payload, and +5,318 B gzipped
 * against the same page with the map removed. Blume shipped no heading data at
 * all — only the current page's rendered list. What makes that acceptable
 * rather than merely regrettable: the three object keys repeat 509 times so it
 * compresses ~7:1, and it rides the DOCUMENT load, not each navigation.
 * The alternatives were weighed and both fail on structure, not on size:
 * moving the renderers into `[[...slug]]/page.tsx` gets `params` for free but
 * cannot reach the third grid track, and parallel-route slots get `params` too
 * but cannot hand their headings UP to a provider that must be their ancestor.
 *
 * `<blume-toc class="block">`, the custom-element host that wrapped each list,
 * is dropped with the element (§13.3). It contributed `display: block` to a
 * `<ul>` that is block anyway, so the box model is unchanged.
 */

type TocContextValue = {
  activeId: string | null;
  headings: Heading[];
};

const TocContext = createContext<TocContextValue | null>(null);

function useToc(): TocContextValue {
  const context = useContext(TocContext);
  if (!context) {
    throw new Error("DocsTocMobile/DocsTocDesktop must be used within a DocsTocProvider");
  }
  return context;
}

export function DocsTocProvider({
  children,
  headingsByRoute,
}: {
  children: ReactNode;
  headingsByRoute: Record<string, Heading[]>;
}) {
  const pathname = usePathname();
  // A route with no row is not an error: `not-found.tsx` and any future
  // non-content route under `/docs` render inside this layout too, and Blume
  // showed no TOC on those either.
  const headings = headingsByRoute[pathname] ?? [];
  const activeId = useActiveHeading(headings.map((heading) => heading.id));
  return <TocContext.Provider value={{ activeId, headings }}>{children}</TocContext.Provider>;
}

// `padding-inline-start: (depth - 2) * 0.75rem` — h2 at 0, h3 indented once.
// Stays an inline style because it is a computed value, not a utility; §4.7 also
// forbids coining a class name for it. The unit is written out even at zero
// (`0rem`, not `0`) because that is what production emits and because React
// would turn a bare `0` into `0px`.
function indent(depth: Heading["depth"]): { paddingInlineStart: string } {
  return { paddingInlineStart: `${(depth - 2) * 0.75}rem` };
}

// `aria-current="location"`, NOT `"page"`. The sidebar's rows are `"page"`; a
// TOC entry is a position within the current page, and both variants' styling
// hooks below select on `location` specifically.
function ariaCurrent(isActive: boolean): "location" | undefined {
  return isActive ? "location" : undefined;
}

/**
 * The `xl:hidden` collapsible, rendered inside the content column between the
 * breadcrumb and the `<h1>` (`RootLayout.astro:684-688`).
 *
 * Blume's 12px radius token dies with `--radius-blume` (§17.6 #27, §8.3): this
 * `<details>` is one of the four elements that carried it and it snaps to
 * `rounded-lg`, a 2px change. No replacement class is coined.
 */
export function DocsTocMobile() {
  const { activeId, headings } = useToc();
  if (headings.length === 0) return null;

  return (
    <details className="group mx-auto mb-6 max-w-content rounded-lg border border-border xl:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-medium text-foreground text-sm [&::-webkit-details-marker]:hidden">
        <span>On this page</span>
        <ChevronDown
          aria-hidden="true"
          className="text-muted-foreground transition-transform group-open:rotate-180"
          size={16}
        />
      </summary>
      <ul className="m-0 list-none border-border border-t p-2">
        {headings.map((heading) => (
          <li key={heading.id} style={indent(heading.depth)}>
            <a
              aria-current={ariaCurrent(heading.id === activeId)}
              className="block rounded-md px-2 py-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground aria-[current=location]:font-medium aria-[current=location]:text-foreground"
              href={`#${heading.id}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

/**
 * The list inside the sticky TOC aside (`RootLayout.astro:719-723`).
 *
 * The link classes are NOT shared with the mobile variant: the mobile rows sit
 * inside a bordered card and carry their own padding, radius and `text-sm`,
 * while these inherit the aside's `text-sm` and need none of it. Unifying them
 * would change one variant or the other.
 */
export function DocsTocDesktop() {
  const { activeId, headings } = useToc();
  if (headings.length === 0) return null;

  return (
    <>
      <p className="mb-3 font-semibold text-foreground text-sm">On this page</p>
      <ul className="m-0 list-none p-0">
        {headings.map((heading) => (
          <li key={heading.id} style={indent(heading.depth)}>
            <a
              aria-current={ariaCurrent(heading.id === activeId)}
              className="block py-1.5 text-muted-foreground transition-colors hover:text-foreground aria-[current=location]:font-medium aria-[current=location]:text-foreground"
              href={`#${heading.id}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
