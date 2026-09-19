# Inline demo rendering contract

Type: grilling
Status: resolved
Assignee: Oğuzhan (this session)

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

## Answer

**0. The inline preview is not greenfield — it already ships.** The
`/components` gallery renders registry React components directly in the page
document today: 10 pages, 40 items, `example-card.astro`, no iframe. Its
preview pane is `flex min-h-72 items-center justify-center bg-background p-6
sm:p-10` and its `min-h-72` is 288px — byte-for-byte Blume's `MIN_PANE_PX`.
The docs demos adopt that component; the two surfaces converge on one preview
rather than growing a second one.

**1. A server component resolves the demo by dynamic template import; the
source text comes from `fs`.** The frozen `path` (`"button/button-demo"`) is
resolved as `await import(\`@/registry/demos/${path}.tsx\`)` inside the RSC
preview — Turbopack builds a context module from the static prefix, so there is
no codegen, consistent with `02`'s no-codegen content index. The Code tab's
source is read from disk by the same server-only module that already reads the
content index: no `?raw`, no second mechanism, and the raw text ships unchanged
(including the `"use client"` line on 81 of 137 demos, as today).

Declared fallback: if the template import does not resolve to a context module
on the first real build, a build script emits `lib/docs/demos.ts` — a literal
137-entry map of `() => import(...)` thunks. This is the only mechanism in the
answer that could not be settled from the filesystem, so it is written as a
build-time proof obligation rather than an assumption.

**2. No forced client boundary — the demo's own directive decides.** The
wrapper is an RSC, so the 56 demos with no directive render with zero client
JS and the 81 `"use client"` demos become client islands automatically.
`client:visible` is **not** reproduced: an IntersectionObserver wrapper would
itself have to be a client component, dragging all 137 back across the boundary
and defeating the split. The consequence is real and recorded: hydration moves
from on-scroll to on-load, so a page with four interactive demos hydrates four
islands immediately. That number belongs to the **Performance budget** fog
patch, alongside `05`'s 2.0 MiB of Shiki HTML and `03`'s 65 serialized nav
nodes.

**3. CSS isolation without a frame is four rules, not one — and "never inside
`.prose`" is not among them.** `04` already removed the `.prose` class: the
prose layer is 9 element overrides applied to MDX-authored elements, which a
demo's own elements never match. So the descendant-cascade problem dissolves,
and what is left is two narrower channels — plain inheritance, and global
element selectors. Both need an owner:

- **(a) Nothing inheritable is set on any ancestor of the demo.** `04`'s body
  typography (`0.875rem` / `1.7` / `muted-foreground`) lands on the `p`, `li`
  and `td` overrides, never on a container. Blume sets exactly these three on
  the `.prose` container today; only the iframe stops them reaching the demo.
- **(b) The preview container carries the layout contract.** `display: grid;
  width: 100%; justify-items: center`, plus `bg-background` and the 288px
  floor. This is `demos/theme.css`'s `[data-blume-example]` rule carried over
  verbatim — the hard-won fix without which the 64 `w-full` demos collapse to
  content width. It is load-bearing regardless of (a) and has nothing to do
  with isolation.
- **(c) The container re-establishes the demo's root context.** `font-size:
  1rem; line-height: normal; color: var(--foreground); background:
  var(--background)`, plus `font-family` and `letter-spacing` reset to the body
  values. This is not insurance: it is `demos/theme.css`'s `body { background-
  color; color }` rule with its selector changed. The frame's `body` gave every
  demo its typographic starting point; removing the frame means that rule needs
  a new owner, so it is parity work, not a guard.
- **(d) `globals.css` declares no bare `h1`-`h6` selector.** Blume styles
  headings globally, not under `.prose`: `font-family: var(--font-display);
  letter-spacing: -0.05em`. Invisible today because the frame never loads
  Blume's entry; inline it hits every heading a demo renders. No primitive
  renders `h1`-`h6` (`CardTitle` is a `div`), but **4 demos do** —
  `separator-demo`, `hover-card-demo`, `scroll-area-demo`, `collapsible-demo`.
  Per `04` the display font and the `-0.05em` tracking become part of the
  heading *overrides*; the chrome's own headings (`12`) carry their own classes.

(a) and (d) are both required and neither substitutes for the other: (a) stops
what arrives by inheritance from a container, (d) stops what hits the element
directly. (c) closes the gap left if a future layout class violates (a).

**4. `demos/theme.css` stays on disk unused — but four things inside it move.**
Registry changes are out of scope, so the file is not deleted. A line-by-line
diff against `apps/web/theme.css` shows what inline rendering needs and the
site sheet does not have:

| In `demos/theme.css` | In `apps/web/theme.css` |
| --- | --- |
| `@source ".../packages/registry/demos"` | absent — demo utilities are never generated |
| the `[data-blume-example]` grid rule | absent — see 3(b) |
| `outline-color: color-mix(in oklab, var(--ring) 50%, transparent)` in `@layer base` | absent; only `border-color` is set |
| `--color-background` / `-foreground` / `-border` / `-muted` / `-muted-foreground` in `@theme inline` | absent |

The first three move into `app/globals.css` as part of this ticket. The fourth
is not this ticket's: those five utilities come from **Blume's** entry via
`--blume-*` indirection (`entry.ts:124-128`), and `apps/web/theme.css` re-points
`--blume-*` at the shadcn tokens rather than declaring them. When Blume goes
they are undefined, and demos use all five. Handed to `07`/`12` as a finding,
next to the `@custom-variant dark` and `color-scheme` migrations `07` already
found in the same file — the failure mode is identical: **silent**.

**5. The shared pane height is dropped; the tabs take the gallery card's
shape.** Blume estimates server-side (≈21px/line, 288px floor, 400px ceiling),
then the frame postMessages its measured height and both panes follow, so
toggling never shifts the page. Inline none of that machinery has a job: the
demo is server-rendered with its real markup, so its height is correct at first
paint. The preview pane gets `min-h-72` and its natural height; the code pane
gets `max-h-96 overflow-auto`. That is exactly what the 10 live gallery pages
already do, where the two panes do **not** share a height and the tab toggle
does change it.

Retired with it: the estimate arithmetic, the `postMessage` height protocol,
the frame-side `ResizeObserver`, the viewport clamp that exists only to park a
`100svh` feedback loop, and the `rafThrottle` resize listener — the vendor file
this repo patched upstream (blume#245). Cost: one intended-diff entry for `13`,
that switching tabs may now change the page height.

**6. The breakpoint shift is a second deliberate fix, not a regression.** The
docs content column is 42rem (672px), so every demo today renders inside a
≤672px viewport and **`md:` and `lg:` resolve false in every frame**. The
iframe does not only clip overlays; it lies about breakpoints. No demo uses
`md:`/`lg:`/`xl:` itself (3 use `sm:`, true at both widths) — the exposure is
entirely through 6 primitives: `calendar` (`md:flex-row`), `input` /
`textarea` / `questionnaire` (`md:text-sm`), `drawer` (`md:text-left`),
`sidebar` (`md:flex`). **26 of 137 demos** render at least one of them.

Concretely: `calendar-range` (`numberOfMonths={2}`) shows its two months
stacked today and side-by-side inline; inputs go from 16px to 14px; the drawer
header stops being centered. Each is the form the component genuinely takes on
a desktop page. Carried as one intended-diff entry for `13`, in the same
category as the overlay clipping and `04`'s `<InstallCommand>` bar.

**7. Nothing needs a frame. The one `fixed` demo gets an opt-in containment
flag.** `sidebar.tsx` is the only viewport-reading primitive in the registry
(`useIsMobile`, 768px) and the only one positioned against the viewport
(`fixed inset-y-0 z-10 h-svh`, `hidden … md:flex`). Inside the frame it renders
its mobile form; inline at desktop width it would pin a full-height sidebar to
the real page viewport, over the docs chrome.

The escape hatch is containment, not a frame, and it is safe for one measured
reason: **every overlay primitive portals to `document.body`** — dialog, sheet,
drawer, popover, tooltip, dropdown-menu, select, context-menu, menubar,
hover-card, alert-dialog, toast. They are not descendants of the preview
container, so giving that container a containing block cannot clip them. The
defect this whole ticket exists to fix stays fixed.

Shape: opt-in per demo, `<Component path="sidebar/sidebar-demo" contain />`,
applying `contain: layout paint` to the preview container. Opt-in rather than
blanket, because blanket containment is a silent trap — a future demo would
start depending on it without saying so. One user today, and the flag says why
it is there.

An iframe escape hatch was considered and rejected: it means two render paths,
two theme bridges and two height stories, which is every problem this ticket
just closed.

## Findings

**`apps/web` cannot resolve the registry's runtime dependencies on its own.**
Its `package.json` declares only `react`, `react-dom`, `lucide-react`,
`@lucide/astro`, `@clerk/clerk-js` and `@sevenui/presets`. Every demo's real
dependency set — `@base-ui/react`, `class-variance-authority`, `clsx`,
`tailwind-merge`, `cn`, `embla-carousel-react`, `recharts`, `react-day-picker`,
`react-resizable-panels`, `react-hook-form` — belongs to `packages/registry`
and reaches `apps/web` only through the `publicHoistPattern` block in
`pnpm-workspace.yaml`, whose comment names Blume's SSR prerender as its reason.
Node's ancestor walk would still find them under Next, so this is not a blocker
— but it is a workaround surviving the thing it was written for. Ticket 06's
requirement is stated plainly: **`apps/web` must resolve the registry's runtime
deps in its own dependency graph.** Whether that is explicit deps or a
`workspace:*` dependency on `@sevenui/registry`, and whether the hoist block is
then deleted, is `14`'s call.

**The third-party demos need no special handling beyond that.** Carousel
(embla), chart (recharts), calendar (react-day-picker) and resizable
(react-resizable-panels) all size themselves from their parent element, which
inline is the preview pane — the same box the iframe gave them. None of them
reads the viewport; the grep for `matchMedia` / `innerWidth` / `innerHeight` /
`h-svh` / `100vh` across the registry returns `sidebar.tsx` and nothing else.
No demo anywhere uses a viewport unit.

## Hand-offs

- **To `07` / `12`:** five `@theme inline` entries — `--color-background`,
  `--color-foreground`, `--color-border`, `--color-muted`,
  `--color-muted-foreground` — are defined by Blume's entry, not by
  `apps/web/theme.css`, and must be declared directly in `globals.css`. Same
  file, same silent failure mode as `07`'s `@custom-variant dark`. Also: no
  bare `h1`-`h6` selector in `globals.css` (decision 3d) — the chrome's
  headings carry their own classes.
- **To `13`:** three new intended-diff entries. (i) Switching a demo's
  Preview/Code tabs may change the page height. (ii) Inline demos resolve real
  viewport breakpoints, changing 26 of 137 demos at `md` and above. (iii) The
  overlay fix itself — dialogs, sheets and drawers opened from a demo now cover
  the viewport instead of the frame.
- **To `14`:** `publicHoistPattern` in `pnpm-workspace.yaml` is Blume-shaped
  and now unowned (see Findings). Also retired here: the `rafThrottle` resize
  listener and the postMessage height protocol — `06` removes the only caller,
  so the upstream patch (blume#245) stops mattering to this repo.
- **To `15`:** the Code tab's source text is read by the server-only content
  module (decision 1), which is also what the agent-facing `.md` downleveling
  needs when it inlines a demo's source — one reader, not two.
- **To `17`:** the preview is `min-h-72` with natural height and no measured
  reporting, so nothing on a docs page changes height after load except a tab
  toggle. Relevant if the TOC uses scroll-spy.
