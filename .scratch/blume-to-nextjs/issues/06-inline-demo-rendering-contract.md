# Inline demo rendering contract

Type: grilling
Status: open

## Question

The 137 docs demos move from iframes to inline rendering (settled — it fixes
overlays being clipped to the frame). What inline rendering *means* is still
open, and it is the highest-risk decision on the map: it is the one place where
`packages/registry` content meets the site without an isolation boundary.

Settle:

1. **How are the demos imported?** They live in `packages/registry/demos/**`
   (137 `.tsx`), outside `apps/web`. Options: a generated static import map
   (build script emits a module mapping `"button/button-demo"` to an import),
   `next/dynamic` with a generated map, or direct imports written into each MDX
   page. The current call site is `<Component path="button/button-demo" />` and
   the path string is the frozen interface.
2. **CSS isolation without a frame.** Today the iframe is what keeps docs prose
   typography out of the demo. Inline, the demo sits in the page. Is the rule
   "the preview container is never inside `.prose`" enough, or does the prose
   stylesheet need explicit scoping? Tailwind v4 preflight and `@source`
   scanning both cross this boundary.
3. **What happens to `packages/registry/demos/theme.css`?** It exists to style
   the isolated frames and mirrors `apps/web/theme.css`. Inline, the demo
   inherits the site's tokens and the file goes dead. Registry changes are out
   of scope, so it stays on disk unused — confirm that is acceptable and record
   it, or decide the one exception.
4. **Layout shift.** Blume estimates a height server-side (≈21px/line, 18rem
   floor, 25rem ceiling), then the frame reports its measured height and both
   panes follow. Inline, the preview has its natural height and no reporting is
   needed — but the preview/source tab pair shared one height so switching tabs
   never shifted the page. Is that shared height kept, and how?
5. **Client boundaries.** Demos are React components; some are already
   `"use client"` (e.g. `button-sizes`). Does the preview wrapper force a client
   boundary for all of them, or is it per-demo? A demo with no interactivity
   could render as RSC.
6. **Third-party demos.** Carousel (embla), chart (recharts), calendar
   (react-day-picker) and resizable (react-resizable-panels) demos have been
   landmines before (see the `publicHoistPattern` block in
   `pnpm-workspace.yaml`, which exists for Blume's SSR prerender). Do any of
   them need special handling inline, or does `14-blume-shaped-workarounds` own
   that?
7. **Does anything still need a frame?** If a demo genuinely depends on viewport
   isolation (a full-page layout, a sidebar demo), is there an escape hatch, or
   is inline absolute?
