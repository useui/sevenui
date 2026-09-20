import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getPrevNext } from "../../lib/docs/nav";

/**
 * Prev/next pagination at the foot of every docs page (§11.3), ported from
 * `blume/components/layout/Pagination.astro`. Rendered by
 * `app/docs/[[...slug]]/page.tsx` after the `<article>` and after the
 * feedback block — `RootLayout.astro:692-706`'s order, which puts feedback
 * first and this last.
 *
 * A SERVER component, and the only one of this task's three new pieces that
 * is: its whole input is `getPrevNext(route)`, which lives in
 * `lib/docs/nav.ts` (`import "server-only"`). Nothing here is interactive,
 * so there is no reason to pay for a client boundary — and paying for one
 * would mean shipping the flattened nav order to the browser.
 *
 * The walker is NOT re-implemented here. `getPrevNext` reads the NAV tree
 * rather than the file tree, which is the only thing that can express the
 * Primitives group boundary (a file walk runs straight from `/docs/theming`
 * into `/docs/components/accordion` with no seam) — see its own comment.
 *
 * ONE HOP LONGER THAN IT USED TO BE, and correctly so: the chain now runs
 * `/docs/theming` -> `/docs/components` -> `/docs/components/accordion`,
 * because Task 3.3 gave the Primitives group its own page and `flattenLinks`
 * orders a group's `href` immediately before its children — the order a
 * reader meets them in the rendered sidebar. Anything written before that
 * task (including this one's own brief) describes `/docs/theming` as linking
 * straight to Accordion; that was true until the group got a page.
 *
 * Two deliberate subtractions from the source, both settled in §17.6 #27 and
 * §11.6 rather than decided here:
 *
 *  - The 12px Blume radius token dies with the token itself (§8.3): both
 *    anchors snap to the 8px utility below, a 2px change on two elements
 *    that sit inches from primitives at 10px. These are 2 of the 4 elements
 *    that carried it; the others are the mobile TOC `<details>` (Task 3.2)
 *    and the feedback buttons (`feedback.tsx`).
 *  - The two icons lose their right-to-left mirror variant. There is no
 *    locale, no `dir` switch and i18n is ruled out map-wide, so the variant
 *    can never match — dead code, dropped on the same grounds as §5's
 *    unreachable panel machinery. The logical properties stay: the inline
 *    margin and text alignment on the next anchor are unconditional and
 *    simply correct.
 *
 * The bare `<span />` placeholder is ASYMMETRIC on purpose and must not be
 * "fixed". Blume renders it only when `prev` is absent (so the lone `next`
 * anchor still lands on the right of the flex row); when `next` is absent it
 * renders nothing at all, because the lone `prev` anchor is already on the
 * left. Making it symmetric would add an element the live page does not have.
 */
export async function DocsPagination({ route }: { route: string }) {
  const { prev, next } = await getPrevNext(route);

  // The whole landmark disappears when the page is alone in the order —
  // which no docs route is today (`/docs` has a next, the last primitive has
  // a prev), so this is the guard Blume has, not a live state.
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mx-auto mt-12 flex max-w-content justify-between gap-4 border-border border-t pt-6 max-md:flex-col"
    >
      {prev ? (
        <Link
          className="flex max-w-[48%] flex-1 items-center gap-2 rounded-lg border border-border px-4 py-3 text-foreground transition-colors hover:border-foreground max-md:max-w-full"
          href={prev.href}
        >
          <ArrowLeft aria-hidden="true" size={16} />
          <span className="min-w-0">
            <span className="block text-muted-foreground text-xs max-md:hidden">Previous</span>
            <span className="block truncate font-medium">{prev.label}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          className="ms-auto flex max-w-[48%] flex-1 items-center justify-end gap-2 rounded-lg border border-border px-4 py-3 text-end text-foreground transition-colors hover:border-foreground max-md:max-w-full"
          href={next.href}
        >
          <span className="min-w-0">
            <span className="block text-muted-foreground text-xs max-md:hidden">Next</span>
            <span className="block truncate font-medium">{next.label}</span>
          </span>
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      )}
    </nav>
  );
}
