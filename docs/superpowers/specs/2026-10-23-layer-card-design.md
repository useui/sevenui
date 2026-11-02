# Layer Card — Design

Date: 2026-10-23
Status: implemented (uncommitted, branch `feat/layer-card`)

## Goal

Add `layer-card`, a new primitive: a muted outer surface (the *tray*) that holds
one or more raised inner surfaces (the *panels*), with a header and footer that
sit on the tray as chrome. It covers everything two references do, ReUI's
[Frame](https://reui.io/docs/components/base/frame) and Kumo's
[LayerCard](https://kumo-ui.com/components/layer-card/), and adds six
extensions on top.

Success means:

- Every capability of both references can be expressed with `layer-card`.
- It is built on Base UI only (`useRender`, `mergeProps`), adds no new
  dependency beyond what `item` already uses, and introduces no new CSS token,
  so it stays a shadcn drop-in.
- No context and no state: every mode is resolved in CSS. The file does
  carry `"use client"`, because Base UI's `useRender` calls `React.useRef`
  (through `useMergedRefs`), which the `react-server` build does not export.
  A Server Component can still render it; the client boundary costs no
  hydration state.
- It ships like the other primitives: registry item, tests, docs page with
  demos, and gallery Components.

## Reference findings

Both references implement the same pattern. Read from their source, not only
their docs:

| | ReUI Frame | Kumo LayerCard |
|---|---|---|
| Parts | Frame, Panel, Header, Title, Description, Footer | Root, Secondary (header row), Primary (body) |
| Variants | default / inverse / ghost (inverse is in the source, not the docs) | none |
| Sizes | xs / sm / default / lg (`spacing`; docs list three) | none |
| Multiple panels | yes, plus `stacked`, `dense`, panel `fit` | no |
| `render` prop | no | root only |
| Surface mode (no panel) | no | yes |
| Radius customization | CSS variable | no |

Weaknesses this design avoids:

- Kumo detects surface vs layered mode with `Children.toArray` and
  `child.type === LayerCardPrimary`. That breaks when a panel is wrapped in the
  consumer's own component, and in RSC when a child arrives lazy (the same
  failure SevenUI's docs code blocks hit, where `isValidElement` was false
  during SSR).
- ReUI derives the inner radius with `calc(radius - padding - 1px)` and no
  clamp. Under SevenUI's `radius: none` preset (`0`) that goes negative and
  only lands on 0 by being invalid at computed-value time.

## Name and exports

Item name `layer-card`, file `registry/base/ui/layer-card.tsx`. Flat named
exports like every other primitive and shadcn, not Kumo's dot notation:

```ts
export {
  LayerCard,
  LayerCardHeader,
  LayerCardTitle,
  LayerCardDescription,
  LayerCardAction,
  LayerCardPanel,
  LayerCardFooter,
  layerCardVariants,
};
```

Rejected names: `frame` (ReUI's name in the same ecosystem; overloaded with
iframe and Figma frames), `tray` (accurate but not searchable), `panel`,
`surface`, `shell` (too generic; "Panel" is already a part name in Base UI's
Tabs, Collapsible and Accordion).

## Anatomy

```tsx
<LayerCard>
  <LayerCardHeader>
    <LayerCardTitle>Subrequests</LayerCardTitle>
    <LayerCardDescription>Origins called by this worker.</LayerCardDescription>
    <LayerCardAction>…</LayerCardAction>
  </LayerCardHeader>
  <LayerCardPanel>…</LayerCardPanel>
  <LayerCardPanel>…</LayerCardPanel>
  <LayerCardFooter>Showing 8 of 24</LayerCardFooter>
</LayerCard>
```

Surface mode is the same root with no panel:

```tsx
<LayerCard>Get started with SevenUI.</LayerCard>
```

## API

### LayerCard

`useRender.ComponentProps<"div">` plus:

| Prop | Type | Default | Effect |
|---|---|---|---|
| `variant` | `"default" \| "inverse" \| "ghost"` | `"default"` | default: muted tray, card panels. inverse: card tray, muted panels. ghost: tray without border. |
| `size` | `"xs" \| "sm" \| "default" \| "lg"` | `"default"` | Padding of panels, header and footer. Named `size` to match Card and Item (ReUI calls it `spacing`). |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Horizontal lays panels in a row; header and footer stay full width. |
| `stacked` | `boolean` | `false` | Adjacent panels join with a shared border and square inner corners. |
| `dense` | `boolean` | `false` | Tray padding drops to 0; panels sit flush on the tray border. |
| `tone` | `"default" \| "destructive"` | `"default"` | destructive tints the tray and its border; panels stay neutral (danger zone). |
| `render` | `useRender` render prop | — | Replace or compose the root element (e.g. `<section />`). |

Data attributes on the root: `data-slot="layer-card"`, `data-variant`,
`data-size`, `data-orientation`, `data-tone`, and `data-stacked` /
`data-dense` present only when true.

### LayerCardPanel

`useRender.ComponentProps<"div">` plus `fit?: boolean` (default `false`).
Without `fit` the panel grows into spare space along the main axis; with `fit`
it keeps its content size. `data-slot="layer-card-panel"`.

When rendered as an `a` or `button` (via `render`), the panel gains hover and
`focus-visible` styling, inherits text color, drops underline, and left-aligns
text. This is the navigation-card use case.

### LayerCardHeader, LayerCardDescription, LayerCardAction, LayerCardFooter

Extend `div`. Data slots `layer-card-header`, `layer-card-description`,
`layer-card-action`, `layer-card-footer`.

- Header is a grid, like `CardHeader`. With an action present it becomes two
  columns and the action spans both rows. (No narrow-width wrap: the header
  would have to change its own grid columns from its own container query,
  which a container cannot do to itself.)
- The action is vertically centered when there is no description and
  top-aligned when there is one.
- Footer is a flex row with muted small text.

### LayerCardTitle

`useRender.ComponentProps<"div">`, `data-slot="layer-card-title"`. The render
prop lets a consumer pick a heading level (`render={<h3 />}`), which is how the
docs show labelling a `render={<section aria-labelledby=… />}` root.

## Styling model

All visual decisions route through CSS variables set on the root, so variants
and tone re-point a variable instead of fighting class order, and a consumer's
own `className` still wins.

| Variable | Default | Set by |
|---|---|---|
| `--layer-card-radius` | `--theme(--radius-xl)` (same as Card's `rounded-xl`; inlined, not `var()`, so a `--radius` set on a wrapper is honoured) | consumer override |
| `--layer-card-inset` | `--spacing(1)` | `dense` sets 0 |
| `--layer-card-bg` | `color-mix(var(--muted) 50%)` | `variant` |
| `--layer-card-tone-mix` | `0%` | `tone` (destructive: 6%, 12% dark), mixed into the tray background |
| `--layer-card-border-color` | `foreground / 10%` (Card's ring color) | `tone` (via `--layer-card-tone-border`) |
| `--layer-card-panel-bg` | `var(--card)`, lifted 4% toward `--foreground` in dark mode | `variant` (inverse: opaque muted-on-card) |
| `--layer-card-panel-radius` | `max(0px, calc(var(--layer-card-radius) - var(--layer-card-inset) - var(--layer-card-border-width)))` | `ghost` sets the border width to 0; vertical `dense` sets it to 0 on panels and rounds only a panel touching the tray's top or bottom edge (no clipping, so bar focus rings stay whole) |
| `--layer-card-pad-x/y`, `--layer-card-fill`, `--layer-card-shadow` | inset / `--layer-card-bg` / none | surface mode re-points them to panel padding, panel colour, `shadow-xs`; consumer `p-*`, `bg-*`, `shadow-*` classes replace the properties outright |
| padding vars (panel, bar) | per `size` | `size` |

Size scale (Tailwind spacing units). Bar px is panel px plus the panel's 1px
side border (exactly panel px under vertical `dense`, where panels have no
side border), so header, panel content and footer left-align. Bar py is roughly half the panel py so the
bars read as chrome rather than a second content block.

| size | panel px / py | bar px / py |
|---|---|---|
| xs | 2 / 2 | 2 / 0.5 |
| sm | 3 / 3 | 3 / 1.5 |
| default | 4 / 4 | 4 / 2 |
| lg | 5 / 5 | 5 / 2.5 |

`--layer-card-panel-radius` is public. Content inside a panel (an image, a
table) can use `rounded-(--layer-card-panel-radius)` to match.

Tray and panels use a 1px `border`, not Card's `ring`. Rings are box shadows
outside the box, so two stacked panels would draw a 2px seam; a border can be
removed on one side.

### Mode resolution, all in CSS

- **Layered vs surface.** The root is layered when it contains a panel at any
  depth: `has-[[data-slot=layer-card-panel]]`. Any depth, so panels wrapped by
  Tabs, Collapsible or a consumer component still count. Otherwise the root
  takes the surface look: panel background, panel padding, no inner surface.
  Known limit: a surface-mode card whose direct content is another layered
  `LayerCard` is read as layered. That shape has no use case, and the docs
  note it.
- **Stacked and dense** are positional and only apply to panels that are
  direct children of the root (sibling selectors
  `[data-slot=layer-card-panel]+[data-slot=layer-card-panel]`), as in ReUI. A
  panel wrapped in another element keeps full corners and borders. This keeps
  a nested `LayerCard` unaffected by its parent's rules.
- **Horizontal.** The root becomes a wrapping flex row; header and footer take
  `basis-full`; panels are `flex-1 min-w-0`. Only in horizontal mode the root
  becomes an inline-size container (`@container/layer-card`). Below `@md`
  panels switch to full width, and stacked seams flip from vertical to
  horizontal. Container type is not set in vertical mode, because inline-size
  containment collapses a root that sizes to its content, for example as a
  flex item without a width. In horizontal orientation `dense` only removes
  the tray inset; the edge-merging rules of vertical `dense` (side borders
  dropped, outer panel corners rounded to the tray's inner radius, no
  clipping) are vertical-only.
- **Nesting.** Every root redefines every variable, so a `LayerCard` inside a
  panel computes its own radius and colors.
- **Dark mode** uses the same tokens. Verify contrast of the muted tray
  against `--card` panels in dark mode during the browser check.

## Deliberately out of scope

- Built-in `collapsible` prop: needs state and a client boundary; Collapsible
  and Accordion already exist. Shown as a composition instead.
- `success` / `warning` / `info` tones: those are SevenUI-only tokens (added
  2026-09-13); a consumer without SevenUI's theme item would get unset
  variables. `destructive` is a shadcn token, so it is the only tone.
- Automatic title → root `aria-labelledby` wiring: needs context, which makes
  the component a client component. The docs show the manual pattern.
- Selected/checked panel styling built into the panel: the plan-picker gallery
  Component styles it with `className`.

## Files

### Registry (`packages/registry`)

- `registry/base/ui/layer-card.tsx` — the primitive.
- `registry.json` — new `registry:ui` item, `title: "Layer Card"`,
  dependencies `@base-ui/react@^1.7.0`, `class-variance-authority@^0.7.1`,
  `cn@^0.2.5` (same pins as `item`), no `registryDependencies`.
- `tests/layer-card.test.tsx` — see Testing.
- `demos/layer-card/*` and entries in `demos/registry.json`:

  | Demo | Shows |
  |---|---|
  | `layer-card-demo` | Header with title, description and action; one panel; footer |
  | `layer-card-surface` | No panel, the root used as a single surface |
  | `layer-card-panels` | Several separate panels |
  | `layer-card-stacked` | `stacked` |
  | `layer-card-dense` | `dense`, alone and with `stacked` |
  | `layer-card-horizontal` | `orientation="horizontal"` stats row, stacked |
  | `layer-card-variants` | default, inverse, ghost |
  | `layer-card-sizes` | xs, sm, default, lg |
  | `layer-card-link` | Panels rendered as links (navigation cards) |
  | `layer-card-destructive` | `tone="destructive"` danger zone |
  | `layer-card-radius` | `--layer-card-radius` override and an image using `--layer-card-panel-radius` |

- `components/layer-card/layer-card-01…10.tsx` and entries in
  `components/registry.json`, the compositions:

  | # | Composition |
  |---|---|
  | 01 | Subrequests table filtered by Input and small Tabs in the header (Kumo's example) |
  | 02 | Collapsible panel (`CollapsiblePanel render={<LayerCardPanel />}`) |
  | 03 | Log viewer: ScrollArea inside a panel under a fixed header |
  | 04 | Plan picker: RadioGroup items rendered as panels |
  | 05 | Empty state / drop zone: dashed panel with Empty |
  | 06 | Settings section: Item rows with Switches |
  | 07 | Nested LayerCards |
  | 08 | Usage row: horizontal, stacked, with Meter |
  | 09 | Navigation card grid with link panels |
  | 10 | Danger zone with destructive actions |

  Content follows the demo conventions: English names only, `/placeholder.svg`
  for images.

### Site (`apps/web`)

- `docs/components/layer-card.mdx` — hero demo, install, usage, examples, API
  reference (props tables above, CSS variable table, data attributes), the
  accessibility note, and the nesting limit.
- `lib/gallery.ts` — add `layer-card` to `GALLERY_SLUGS` and to the `layout`
  family.
- `components/gallery/illustrations.tsx` — a `layer-card` illustration.
- Regenerated, not hand-edited: `components/mdx/demo-map.generated.ts`
  (`scripts/build-demo-map.ts`) and `lib/lastmod.generated.json`.
- Primitive count 65 → 66 wherever it is written out: at least
  `docs/index.mdx` (two places, including the "first 53 arrived across five
  waves" passage) and `lib/roadmap.ts`. The plan greps for every occurrence
  rather than trusting this list.

### Repo

- `AGENTS.md` — "65 of them" → 66.

## Testing

Vitest with Testing Library (jsdom). jsdom does not evaluate `:has()` or
container queries, so unit tests assert structure, not appearance:

- Each part renders with its `data-slot`; root data attributes reflect
  `variant`, `size`, `orientation`, `tone`; `data-stacked` and `data-dense`
  appear only when true.
- `className` merges on every part.
- `render` works on root, panel and title (root as `section`, panel as `a`
  keeps `href` and `data-slot`, title as `h3`).
- `fit` changes the panel's grow class.
- `layerCardVariants` is exported and callable.
- The source starts with `"use client"` (guards the client boundary
  `useRender` needs).

Gates: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm check:registry`,
`pnpm check:docs-imports`, and the registry build.

Browser check, since appearance is CSS-only and untestable in jsdom: every demo
in light and dark; radius presets none, small, default and large through the
theme customizer (radius none must give square, non-broken panels); stacked
and dense seams at 1x and 2x DPR; horizontal collapse below `@md`; focus ring
on link panels via keyboard; a nested card; a panel wrapped in Collapsible
still yields layered mode.

## Out of scope for this spec

Version bump, release notes, push and deploy. Those stay user-gated.
