import * as React from "react";

/**
 * The live-example box every demo renders inside (task-2.6 brief step 1/3).
 * `flex min-h-72 items-center justify-center bg-background p-6 sm:p-10` is
 * byte-for-byte the `/components` gallery's own preview pane class list
 * (`apps/web/legacy-components/example-card.astro`'s `[data-panel="preview"]`
 * div) — `min-h-72` is 288px, Blume's own `MIN_PANE_PX`. Stage 4's gallery
 * adopts THIS component rather than growing a second one ("This is not
 * greenfield").
 *
 * TWO elements, not one (fix round 1, CRITICAL 1). The centering box (this
 * function's own classes, above) and the grid box (`data-sevenui-example`)
 * are kept separate because putting both on the same element is inert: the
 * unlayered `display: grid` beats the layered `justify-center` utility's
 * conflicting `display`, true, but does NOT touch `justify-content` — that
 * Tailwind utility keeps applying to the (now grid) container, and per CSS
 * Grid §12.8 an auto column track is sized to its CONTENT (not stretched)
 * whenever `justify-content` is anything but `normal`/`stretch`. `center`
 * is exactly such a value, so the single column shrinks to content width
 * and `width: 100%` on that same element resolves against a box that's
 * already been sized away from the container — measured on a 720px pane
 * with the two on one element: `input` (`w-full max-w-sm`) came out 197px
 * (should be 384), `table` (`w-full overflow-x-auto`) came out 317px
 * (should fill the pane), and `accordion` was only right by coincidence
 * (its own max-width already sits under the shrunk column's content size).
 * A synthetic three-leg isolation confirmed the mechanism (grid +
 * `justify-center` alone: 79px; the old flex-only gallery shape: 800px;
 * grid without `justify-center`: 800px), and a counterfactual forcing
 * `justify-content: normal` back to 384px pinned it.
 *
 * Splitting the two elements removes the conflict entirely: the OUTER div
 * (flex, `justify-content: center`) only ever centers a single flex
 * child — the inner div — whose own `width: 100%` (from
 * `data-sevenui-example`'s CSS) consumes all the outer's free space, so
 * there's nothing left for the outer's `justify-content` to distribute.
 * Inside that always-full-width inner div, `justify-items: center`
 * centers a content-sized demo and lets a `w-full` demo's OWN width
 * utility fill the track — the grid rule works exactly as documented once
 * it isn't sharing an element with a conflicting flex property. This is
 * also the shape both existing live implementations already use (never
 * one element doing both jobs): Blume renders `<body style="display:flex">`
 * with `<div data-blume-example style="margin:auto">` inside it, and the
 * `/components` gallery's own preview pane
 * (`legacy-components/example-card.astro`) is pure flex with no grid rule
 * at all.
 *
 * `data-sevenui-example` (on the INNER div) is the renamed
 * `[data-blume-example]` hook (`packages/registry/demos/theme.css:153`,
 * untouched by this task — scope wall). `apps/web/app/globals.css` keys
 * its CSS-isolation rules (§7.2 b/c) off this attribute now that the
 * iframe (and its `body`) is gone: (b) `display: grid; width: 100%;
 * justify-items: center` is the hard-won fix the 64 `w-full` demos need so
 * they don't collapse to content width, and (c) re-establishes the frame
 * body's typographic starting point (`color`, `background`,
 * `font-family`, `font-size`, `line-height`, `letter-spacing`) now that no
 * iframe `<body>` supplies it.
 *
 * `contain` (§7.3): the one opt-in escape hatch, used by exactly one demo
 * today (`sidebar/sidebar-demo` — `apps/web/docs/components/sidebar.mdx`).
 * `sidebar.tsx` is the only registry primitive that reads the viewport
 * (`useIsMobile`, 768px) and positions against it (`fixed inset-y-0 h-svh`);
 * inline, at desktop width, it would pin a full-height sidebar over the
 * docs chrome. `contain: layout paint` makes the INNER div both a
 * containing block for that fixed-position descendant and a paint/clip
 * boundary, so the sidebar sizes and clips against THAT box instead of the
 * viewport — it stays on the same element as `data-sevenui-example`, the
 * demo's direct parent, not the outer centering box. Safe specifically
 * because every overlay primitive (dialog, sheet, drawer, popover,
 * tooltip, dropdown-menu, select, context-menu, menubar, hover-card,
 * alert-dialog, toast) portals to `document.body` — none of them is a
 * descendant of this div, so containment here can't re-clip the thing this
 * whole task exists to un-clip. Opt-in, not blanket, per Step 5: a blanket
 * rule would be exactly the "silent trap a future demo would start
 * depending on without saying so" that step rejects.
 *
 * Applied as an inline `style`, not a Tailwind utility: `contain: layout
 * paint` is a single two-word value with exactly one call site, and this
 * sidesteps any question of how a `contain-[layout_paint]` arbitrary-value
 * utility tokenizes under Turbopack.
 */
export function PreviewPane({
  children,
  contain = false,
}: {
  children: React.ReactNode;
  contain?: boolean;
}) {
  return (
    <div className="flex min-h-72 items-center justify-center bg-background p-6 sm:p-10">
      <div data-sevenui-example="" style={contain ? { contain: "layout paint" } : undefined}>
        {children}
      </div>
    </div>
  );
}
