# v2 follow-ups for the site project (project 2)

Found while restyling the 66 primitives on `feat/v2` (project 1, plan
`docs/superpowers/plans/2026-11-03-v2-design-language.md`). Everything here is
outside project 1's scope: gallery components, docs demos, the lab, and the
site. Primitive-level regressions were fixed on the branch instead.

## Site and customizer

- ~~Portaled popups ignore the theme customizer.~~ Fixed: `preset-scope.tsx`
  marks a Base UI portal with the scope attribute when whatever opened it was
  inside a preview. Known gap: a toast fired from a timer after the pointer has
  left the preview is not claimed.
- **Site chrome takes the new neutrals and primitives.** Header, search and
  sidebar already look different on `feat/v2` (expected; restyle in project 2).
- The customizer has no "accent" picker yet (deferred by the spec).

## Gallery components (`packages/registry/components`)

- `questionnaire/questionnaire-10.tsx`: the chat bubble card nests the
  questionnaire tray and panel, giving three hairline borders and about 12px of
  padding at each level. It reads heavy. `-11` is a double pad (card body plus tray).
  Consider a `bare` treatment inside cards, as `questionnaire-01` does.
- `questionnaire/*`: the default progress render now shows a bar under the
  "Question n of m" text. `-12` (`w-auto min-w-0`) makes the bar narrow. Gallery
  items that use the default render are 02, 03, 05, 06, 11, 12, 13 and 14.
- `questionnaire/questionnaire-04.tsx`: title spacing changed with the new
  floated legend; check that its own `mb-*` override still looks right.
- Badge `default` changed from a filled primary to a raised neutral chip. Every
  gallery item using a default badge looks different; check the ones that relied
  on the filled look for emphasis.
- `message-scroller-07/-08/-09/-13`: `MessageScrollerButton` defaults to the
  outline variant now (was secondary).
- Dialog gallery items with `p-0` and a `DialogFooter` must pass `m-0` on the
  footer (`dialog-07`, `dialog-08` already do). That is the shadcn footer-bar
  idiom, kept on purpose.

## Lab fixtures (`apps/web/components/v2-lab/matrices`)

- `chart.tsx`: the static tooltip-content row renders at 0px height inside
  `ChartContainer`. Use a plain div with the tooltip classes.
- `resizable.tsx`: react-resizable-panels' inline `height:100%` overrides the
  fixture heights, so the groups collapse. Wrap them in sized containers.
- `drawer.tsx`, `popover.tsx`, `hover-card.tsx`: left/right drawers and
  `side=top` popovers overlap neighbouring cells.
- `sidebar.tsx`: the collapsed-icon cell leaks text-only labels, and the static
  cell's tray stops short of the cell bottom.
- `attachment.tsx`: media-only tiles render as wide empty pills.
- `navigation-menu.tsx`: the viewport popup cannot take a cell's theme or
  density (it takes no props).

## Polish noted by reviewers (primitive-level, deliberately not blocking)

- Light theme: `surface-panel` and `surface-raised` are both white. Rows and
  hovers use `bg-hairline`, but outline vs secondary buttons and the light dialog
  tray still read close. A token-level answer may be better.
- Vertical tabs, horizontal field rows and questionnaire option rows do not scale
  with density.
- `select`: rich (icon + label) values clip the label without an ellipsis.
- `attachment`: the remove "x" is hard to see over light media; give it a backdrop.
- `menubar`: popups are 144px wide, so long labels wrap.
- `progress`: the indeterminate state shows an empty track (pre-existing).
- Dark theme: OTP empty-slot hairlines, the resizable grip and the range-middle tint are faint.
- `api-freeze`: importing `calendar` sits close to the 5s test timeout under load.
- `table`: muted cells on a hovered row are 4.29:1 (the row hover is the
  hairline); lift muted descendants on hover as menu rows do.
- `toast`: the action button's default size moved from `sm` to `xs`.
- `badge`: text went from 12px to 11px and the destructive badge gained a dot;
  controls now use 13px text. Check gallery items that sized around the old values.
- Dark theme: `text-brand` links on raised surfaces are 4.33:1, under AA.
- Derived surface tokens (`--surface-*`, `--hairline*`) are declared on
  `:root`/`.dark`, so a shadcn theme scoped to a wrapper class (for example
  `.theme-rose`) recolours the shadcn variables but not the derived surfaces.
  Redeclaring the derivations on the wrapper, or deriving them in place, fixes it.
- `test:smoke` checks CSS text only: it installs the tokens into a stock shadcn
  project and inspects the stylesheet, but never compiles Tailwind or renders.
- Other `shadow-[var(...)]` classes (for example the empty icon, the outline
  button highlight, sidebar floating panel) are not read as shadows by `cn`, so a
  consumer `shadow-*` stacks beside them instead of replacing them. Card and the
  fields now prefix `0_0_#0000,` for that reason; apply the same where it matters.
