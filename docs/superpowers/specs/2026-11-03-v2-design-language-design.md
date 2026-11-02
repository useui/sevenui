# SevenUI v2 — Design language and primitives

Status: draft for review · Branch: `feat/v2` · Date: 2026-11-03

## Why

SevenUI today looks exactly like shadcn/ui: same spacing, same radii, same
neutral grey, same focus ring. It is technically strong (Base UI, 66
primitives, 900+ free components, Pro blocks) but visually indistinguishable,
so it gives people no reason to pick it over shadcn itself. A competitive look
at BoardUI and Linear showed what we lack is not inventory but a point of view.

v2 gives SevenUI its own look: professional, quietly impressive, easy to adopt,
and explicitly not "AI slop". It also repositions SevenUI as built for teams
**and their agents**. This document covers only the first of five v2 projects,
the design language and the primitives. The others get their own documents.

### The v2 program (agreed order)

1. **Design language and primitives** — this document.
2. **Site** — landing, docs and gallery restyled in the new language; gallery
   cards show real renders instead of abstract skeletons.
3. **Agent channel without MCP** — a "For agents" tab per page, an agent rules
   file, a markdown version of every page.
4. **MCP server.**
5. **Release as v2.**

All work happens on `feat/v2`. Nothing merges to `main` until the program is
ready to ship as v2.

## Goals

- A recognisable SevenUI look across all 66 primitives, in dark and light.
- Character from craft, not decoration: typography, hairlines, layered
  surfaces, considered motion, one restrained brand accent.
- Stay a safe drop-in for shadcn projects: every shadcn CSS variable keeps its
  name and meaning; a user's existing shadcn theme still flows through.
- A library-wide density mode (comfortable / compact) — something shadcn does
  not have and dashboard/agent builders need.
- The light theme gets the same care as the dark one.

## Non-goals

- Pixel parity with shadcn. Dropped on purpose.
- A new token system that replaces shadcn's variables.
- Restyling the site, gallery, or Pro blocks (projects 2 and later; Pro blocks
  live in the separate pro repo).
- Shipping fonts with the registry. Typography choices for the site are
  project 2; primitives inherit the consumer's font.

## Anti-goals (would be a failure even if it works)

- Purple/blue gradients, glows, neon blooms, glassmorphism for its own sake,
  emoji or icon confetti — anything that reads as generic AI output.
- A look so busy or opinionated that people hesitate to put it in their
  product. It must stay calm enough to adopt "with peace of mind".
- Breaking an existing shadcn project that adds a SevenUI primitive.

## The direction ("D")

Arrived at by comparing three directions (today/shadcn, soft, layered), then
four layered variants, then a synthesis informed by Linear. The approved
references are committed next to this document:

- `2026-11-03-v2-design-language/reference-synthesis.html` — the agreed
  result: primitives, a table, a dialog, a docs page, with dark/light and
  comfortable/compact toggles. **Treat it as the visual target, not as code.**
  It is a fast prototype; the real primitives must be more refined.
- `2026-11-03-v2-design-language/reference-direction-d.html` — the landing
  and docs context the look was judged in.

Properties of the look:

- **Layered surfaces.** A tray with a slightly raised panel inside ("card in a
  card"), hairline borders drawn as inset shadows, a 1px top highlight on
  raised surfaces. The existing `layer-card` primitive already encodes this
  pattern and is the house reference for how to build it.
- **Inset fields.** Inputs, selects and similar sit slightly recessed (a
  soft inner shadow), buttons and menus slightly raised.
- **Hairlines over boxes.** Thin, low-contrast lines; no heavy borders.
- **Neutral primary.** The main button stays neutral (foreground-on-
  background, like Linear). Colour is reserved for the accent.
- **One brand accent, used sparingly** (see below).
- **Considered motion.** Small, physical micro-interactions: a slight press
  on buttons, a spring on the switch thumb, quick fades on overlays. Always
  respect `prefers-reduced-motion`.
- **Status colours** (success, warning, destructive) as quiet tinted badges
  with a dot, never loud fills.

## Brand accent — decided

**Electric blue.** Dark theme `#4d7cff`, light theme `#2f5ce8`. Chosen by the
user over Electric Lime after side-by-side comparison in both themes.

Used only for: the focus ring, the selected-tab indicator, switch and
checkbox "on", the "New"/highlight badge, links, chart emphasis, and an
optional accent button variant. It is never the default button colour.

## Focus — decided

**Offset ring.** The control's own border does not change on focus. A 2px gap
(in the page background colour) is followed by a ~1.5px ring in the accent
colour. Same treatment for every focusable primitive, keyboard and pointer
focus alike where the primitive shows focus at all (`focus-visible` for
buttons; fields show it while focused). This replaces shadcn's
`ring-3 ring-ring/50` halo, which read as loud — an accent-coloured border plus
a 3px halo was explicitly rejected.

## Tokens — decided principle, details to the builder

**Principle (decided):** shadcn's variables stay, unchanged in name and
meaning. New tokens are added on top. Wherever possible a new token is
**derived** from shadcn tokens (`color-mix`, `calc`) so that a user's shadcn
theme or a customizer preset still colours the new surfaces correctly without
defining anything new.

What the new layer needs to express (names are the builder's call; keep them
short, kebab-case, and clearly SevenUI's — they must not collide with shadcn
or Tailwind names):

- **Brand accent** + its foreground. shadcn's `--accent` means "hover grey" and
  must keep that meaning, so the brand colour needs its own name. `--ring`
  should resolve to the brand accent in the SevenUI theme.
- **Surface steps** for tray / panel / raised, derived from `--background`,
  `--card`, `--muted`, `--foreground`.
- **Elevation**: top highlight, inset (recessed) shadow, raised shadow,
  overlay shadow — per theme.
- **Focus ring** geometry (gap, width) so every primitive draws it the same.
- **Density**: control height, horizontal padding, gap, panel padding, base
  font size — at least two sets, comfortable (default) and compact, switched
  by an attribute on any ancestor (e.g. `data-density="compact"`), so a
  single page section can be compact.
- **Motion**: a couple of durations and easings (press, spring, fade).

The new tokens ship in a shared tokens item that every restyled primitive
depends on (see "Decisions settled during review", item 1). The full SevenUI
`theme` item (`packages/registry/registry.json`, type `registry:theme`) keeps
shipping the shadcn values and adopts the new look's tuning of them. The neutral palette values themselves may be tuned toward the
reference (slightly cooler near-black dark theme, warm off-white light theme)
— builder's call, verified against contrast.

## Scope

In scope:

- All 66 primitives in `packages/registry/registry/base/ui/` restyled in the
  new language, every variant and state (hover, active, focus, disabled,
  invalid, open/expanded, selected), both themes, both densities.
- The theme registry item with the new tokens.
- Demo and docs CSS that defines tokens (`apps/web/app/globals.css`,
  `packages/registry/demos/theme.css`) updated so docs demos render the new
  look.
- The theme customizer presets (`packages/presets`) keep working: every
  preset still produces a coherent result, because new tokens derive from the
  preset's shadcn values. Add an accent choice to the customizer only if it
  falls out cheaply; otherwise leave it for project 2.
- Existing tests (`packages/registry/tests`, ~525) updated where they assert
  class names; behaviour tests must not regress.

Out of scope here: the free gallery components (`packages/registry/components`)
and docs demos are not individually redesigned in this project — they inherit
the new look through the primitives. They must still render without visible
breakage, and anything they hard-code that fights the new look is noted for
project 2.

## Constraints

- Base UI only. No Radix, no react-aria. The four sanctioned wrapper deps stay
  scoped as they are.
- Distribution stays the shadcn registry (`npx shadcn add @sevenui/<name>`).
  The registry's internal layout is a byte-parity contract — never restructure
  it. Outputs change because the sources change; the layout does not.
- Tailwind v4. Known traps from the layer-card work apply (see that spec):
  `:where()` for zero-specificity variable defaults; `--theme(--radius-*)`
  rather than `var(--radius-*)` so the customizer's scoped `--radius` is
  honoured; the first colour of `color-mix()` is Tailwind's fallback, so put
  the neutral base first; `useRender` needs `"use client"`.
- Accessibility: WCAG AA contrast for text and for the focus ring against
  both themes; all keyboard behaviour unchanged.
- English everywhere in the repo, kebab-case files, Conventional Commits with
  no attribution trailers.

## Success looks like

- Put the docs page of any primitive next to shadcn's: they are clearly not
  the same library, and SevenUI's looks more finished.
- Add one SevenUI primitive to a fresh shadcn project with the stock shadcn
  theme: it installs, renders, respects that theme's colours, and looks
  intentional.
- Toggle `data-density="compact"` on a container: every primitive inside
  tightens consistently.
- Light theme reviewed with the same scrutiny as dark; no part looks like an
  afterthought.
- Test suite green; registry checks (`check:registry`) green.

## Decisions settled during review

Questions a builder raised on reading this document, with the answers. Items
marked *(designer's call)* were decided by the author on the user's earlier
direction and can be challenged.

1. **Where new tokens come from when a primitive is installed alone.**
   Agreed with the user: a SevenUI primitive dropped into a shadcn project
   "comes with its own look". So the new tokens ship as one shared registry
   item (working name `sevenui-tokens`, type `registry:theme` or
   `registry:style`, carrying `cssVars` for the **new** tokens only — it must
   never write any shadcn variable) and every restyled primitive lists it in
   `registryDependencies`. The shadcn CLI then writes the tokens into the
   user's CSS once. Each primitive additionally keeps `:where()` fallbacks
   (the layer-card pattern) for the variables it reads, so a hand-copied file
   still renders sanely. *(Mechanism: designer's call.)*
2. **Accent colour in a project without the SevenUI theme.** It is the
   SevenUI electric blue by default, carried by the tokens item above, and
   changeable by overriding one token. It is a SevenUI token, not `--ring`:
   the user's own shadcn components keep their `--ring`. In the full SevenUI
   `theme` item, `--ring` is set to the same blue so shadcn and SevenUI parts
   agree. *(Designer's call, following "comes with its own look".)*
3. **"Neutral primary".** Buttons keep painting with `--primary`, so
   `--primary` keeps its shadcn meaning and customizer presets still tint
   buttons. "Neutral" is a property of SevenUI's own theme, whose `--primary`
   is already near-foreground. *(Designer's call.)*
4. **Public API.** Frozen, additive only. No renamed or removed variants,
   sizes, props or `data-slot`s, because ~905 gallery components and the Pro
   blocks consume them. New optional variants (e.g. an `accent` button) are
   fine. Density is built on CSS variables inside existing variants, not as a
   new prop. *(Designer's call.)*
5. **Accent button contrast.** White on `#4d7cff` is about 3.7:1 and fails AA
   for text. The accent stays `#4d7cff` for non-text uses on dark (ring,
   switch, checkbox, indicators — all above 3:1) and for links (about 5.3:1
   on the dark background). The **filled accent button** on dark uses a
   slightly deeper fill (about `#3a68f0`, 4.75:1 with white) so it keeps
   white text, as in the approved reference. Light theme `#2f5ce8` passes
   with white (5.5:1). Exact values: builder's call within AA.
6. **Site chrome before project 2.** Changes to `apps/web/app/globals.css`
   are scoped so that docs demos get the new look while the site's own
   chrome is restyled in project 2. *(Builder may decide the mechanism.)*

## Left to the builder

- Exact token names and values, the neutral ramp tuning, radius scale.
- How density is wired into each primitive (variables vs. variants), as long
  as one ancestor attribute switches it.
- Motion specifics within the "small and physical" brief.
- Order of primitives, and how to batch them into reviewable commits.
- Whether to add an accent picker to the customizer now or defer it.
