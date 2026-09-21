import type { SVGProps } from "react";

/**
 * The mark's geometry, and the ONE place it is written down.
 *
 * Exported because `lib/og/card.tsx` needs the same two paths: Satori cannot
 * paint from this component (its `fill="currentColor"` has no inherited paint
 * server to resolve) nor from `public/icon.svg` (whose colour lives in a
 * `<style>` block with a `prefers-color-scheme` rule that Satori never
 * executes), so the card rebuilds the SVG with the fill baked to a literal.
 * That argument is about the FILL, and it was quietly taken to licence a
 * second copy of the GEOMETRY as well — which is a different thing and has no
 * such excuse. The card now imports these two strings and supplies its own
 * fill, so a mark refresh moves the component and the card together instead of
 * leaving every social card drawing the previous mark with nothing able to
 * see it (§16.8: one fact, one spelling).
 *
 * TWO static copies remain (a third, `apps/web/assets/logomark.svg`, was
 * byte-identical to `public/logomark.svg`, had no reader of its own anywhere
 * in the repo, and was deleted along with the rest of the Blume-shaped
 * `assets/` directory in Stage 10's retirement sweep). They are listed in
 * full because a comment whose whole job is to explain why the mark does NOT
 * have one spelling everywhere is worthless if it undercounts the spellings:
 *
 *   - `apps/web/public/icon.svg`      — the favicon; 720 B; carries a
 *                                       `<style>` block with a
 *                                       `prefers-color-scheme` rule and no
 *                                       `fill` attribute on its `<path>`s
 *   - `apps/web/public/logomark.svg`  — 653 B; plain `fill="currentColor"`
 *                                       on each `<path>`, `height="1em"` on
 *                                       the root
 *
 * These two are NOT byte-identical to each other — different size, different
 * markup around the same shape (verified by md5: `dceb4f53…` vs `40ebb3ec…`,
 * 2026-09-21) — but their GEOMETRY is: both files' `<path d="…">` values
 * match `LOGOMARK_PATHS` below character-for-character. That sameness, not
 * file-level byte identity, is what this module actually guards: the
 * geometry has exactly one source of truth here (read by this component and
 * by `lib/og/card.tsx`), and each static file carries its own independent
 * copy of it because a static asset cannot import anything. What this module
 * removed is the duplication between the two CODE paths — this component and
 * the OG card — which is the pair that could drift silently.
 *
 * The viewBox is a 64x64 square. `lib/og/card.tsx` relies on that — it sizes
 * the mark without aspect-ratio arithmetic — so it is exported too rather than
 * written out again there.
 */
export const LOGOMARK_VIEWBOX = "0 0 64 64";

export const LOGOMARK_PATHS = [
  "M9.08426 12.4419C9.65668 8.91164 12.987 6.51285 16.5232 7.08412L49.549 12.4213C53.0852 12.9928 55.488 16.3176 54.9157 19.8479C54.3433 23.3782 51.013 25.7769 47.4768 25.2057L14.451 19.8685C10.9148 19.297 8.51204 15.9722 9.08426 12.4419Z",
  "M43.1816 15.1254C45.222 12.1858 49.2627 11.4541 52.2072 13.4911C55.1516 15.528 55.8845 19.562 53.8442 22.5016L25.5487 54.2121C23.5083 57.1517 19.4676 57.8834 16.5232 55.8464C13.5787 53.8095 12.8458 49.7755 14.8861 46.8359L43.1816 15.1254Z",
] as const;

/** The SevenUI mark. Inherits `currentColor`; size it via `className`/`height`. */
export function Logomark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      height="1em"
      viewBox={LOGOMARK_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {LOGOMARK_PATHS.map((d) => (
        <path d={d} fill="currentColor" key={d} />
      ))}
    </svg>
  );
}
