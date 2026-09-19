# MDX content component parity set

Type: grilling
Status: resolved
Assignee: Oğuzhan (this session)

## Question

**Corrected 2026-09-18 by `01-nextjs-mdx-pipeline-options`.** The authored
custom-MDX surface is **2 components, not ~40**. With code fences stripped from
all 68 `.mdx`, only `<Component>` (137 uses) and `<InstallCommand>` (68 uses)
remain. The "~40" was Blume's *available* set (35 content components plus
element overrides); the charting session's JSX tag count had swept in tags
inside fenced demo sources. So questions 1, 2, 3 and 6 below are largely
answered: nothing else is used, nothing else comes along.

What survives as real work: the **element overrides** (how Blume styles `h1`-`h6`,
`p`, `a`, `ul`, `table`, `pre`, `code`, `blockquote`, `img` inside MDX — the
prose layer), plus the two components. Retriage on that basis.

Measured so far from `apps/web/docs/`: `<Component>` 137 uses,
`<InstallCommand>` 68 uses. The rest of Blume's set appears in its barrel:
Accordion, AccordionItem, AutoTypeTable, Badge, Callout, Card, CardGroup,
CodeBlock, CodeGroup, Color, ColorItem, ColorRow, Column, Columns, Component,
Diff, Expandable, FileTree, Frame, GithubInfo, Panel, Prompt, Step, Steps, Tab,
Tabs, Tile, Tooltip, Tree, TreeFile, TreeFolder, TypeTable, Visibility, YouTube.

Settle:

1. Which of these are actually used by the 68 pages, and how many times each.
   (A fact — gather it; the barrel import proves nothing about usage.)
2. For each used component: reimplement, or rewrite the pages that use it? A
   component used twice may be cheaper to inline than to reimplement.
3. For each reimplemented component: is its prop API frozen (so the MDX is
   untouched), or is the MDX allowed to change? Freezing the API keeps 68 files
   still but inherits Blume's design choices.
4. `<InstallCommand>` is already a local override
   (`apps/web/components/install-command.astro`) and needs a React port. Does
   its rendered UI change at all, given `install-control.astro` and
   `copy-command.tsx` exist alongside it and overlap?
5. `<AutoTypeTable>` reads types from source to build a props table. Does the
   docs set use it? If so, this is the single most expensive component to
   reimplement (it needs a TypeScript type reader) and deserves its own
   decision: reimplement, replace with hand-written `<TypeTable>`, or drop.
6. Which components are dead in this project and simply do not come along
   (`YouTube`, the OpenAPI set, `GithubInfo`, `Visibility`, …)?

## Added by `02-docs-content-pipeline-decision` (2026-09-19)

The wide-table scroll wrapper (`<div class="blume-table-scroll" tabindex="0">`
around every `<table>` today, produced by Blume's `blume:table-wrap` hast
plugin) is a **`table` element override**, not a rehype plugin. 57 of the 68
files contain tables, so this override is load-bearing.

Its class hook does not survive: per `02`, no `blume-*` name is kept and no
replacement name is coined — the wrapper carries Tailwind utilities inline.
`02`'s answer records the exact CSS-to-utility translation.

`remark-gfm` is in the chain (57 files have tables); no strikethrough, task
lists, footnotes or HTML comments appear anywhere in the corpus.

## Answer

**1. The authored component surface is exactly two, re-verified independently.**
`<Component>` (137 uses, 65 files) and `<InstallCommand>` (68 uses, 67 files).
Nothing else. `01`'s correction holds, and the method matters: a tag scan that
strips only fenced blocks still reports 15 more tags (`ToolbarButton`, `Badge`,
`Toggle`, …) — **every one of them sits inside an inline code span**, prose
about a component rather than a use of one. Stripping inline code too leaves
two. `<AutoTypeTable>`: zero uses, confirmed.

`<CodeBlock>` is a third component but not an *added* one — both
`<InstallCommand>` and all 154 fences render through it, so it is the shared
code-block primitive and was always going to be written. `<Component>` belongs
to `06-inline-demo-rendering-contract`; this ticket only shares the element map
with it.

**2. The prose layer is hand-written element overrides — no
`@tailwindcss/typography`.** Blume's prose is the Typography plugin (^0.5.20)
themed with `--tw-prose-*` variables plus ~200 lines of its own overrides
(`blume/src/theme/entry.ts:234-560`). We take neither. Rationale is the measured
corpus: the plugin earns its keep on elements you do not control, and this
corpus is closed.

**The element set is exactly 9**, and the absences are the finding:

| Present | Count | Files |
| --- | --- | --- |
| inline `code` | 1823 | 68 |
| `table` / `th` / `td` | 507 rows | 57 |
| `h3` | 260 | 64 |
| `h2` | 249 | 68 |
| `pre` (fences) | 154 | 67 |
| `a` | 98 | 56 |
| `strong` | 90 | 17 |
| `ul` / `li` | 46 | **7** |
| `p` | — | 68 |

**Absent from all 68 files:** `h1`, `h4`, `h5`, `h6`, ordered lists,
`blockquote`, `hr`, images, emphasis (`em`), strikethrough, task lists,
footnotes, HTML comments. Thirteen element types the plugin would style and
nothing would ever render. Taking the plugin also means inheriting its
`.prose`-scoped descendant selectors, which Blume's own rules already fight with
`!important` and an `:is()` specificity bump (its `blume-table-scroll :is(th,td)`
comment says so outright). That fight has no payoff here.

Consistent with `02`: the overrides are a plain object passed at render time,
not rehype plugins, and every element carries Tailwind utilities with no
bespoke class names.

**3. The values match Blume's rendered output exactly — but the override file
is not the source of truth.** Blume only *overrides* some properties; the rest
fall through to the Typography plugin's defaults, so the rendered value is a
merge. `h2` is the clear case: Blume sets `font-size: 1.875rem`, `line-height:
1.2`, `margin-top: 3rem` and says nothing about `margin-bottom`, which the
plugin supplies. **Values must be read from computed styles on the live pages,
not transcribed from `theme/entry.ts`.**

What Blume does set, and what the port must reproduce:

- Body: `0.875rem` / `1.7`, color **`muted-foreground`** — headings are
  `foreground`, body text is muted. A deliberate signature, not an accident.
- Headings: weight `500`, `overflow-wrap: break-word`. `h2` `1.875rem`/`1.2`,
  `margin-top: 3rem`, and `margin-top`/`border-top` zeroed when first child.
  `h3` `1.25rem`/`1.35`.
- `p`, `ul`, `ol`: `margin: 1rem 0`. `strong`: `600`.
- `a`: `foreground`, weight `500`, **dotted** underline, `1px`, offset `0.2em`.
- `table`: `0.8125rem`. The scroll wrapper's utility translation is already
  recorded in `02`.
- `pre`: transparent background, `1px` border, `--radius`, `0.8125rem`/`1.55`,
  `margin: 1.5rem 0`, `padding: 1rem 0`; the `<code>` inside is the scroller
  (`max-height: 24rem`, both axes, thin theme-colored scrollbars) so the
  `<pre>` stays static and the absolutely-pinned copy button never drifts —
  `05` owns that button.

The heading anchor comes along in today's shape: `rehype-autolink-headings`
with `wrap` (locked by `02`) plus a `#` revealed on hover/focus. The
`blume-heading-anchor` class name does not survive; the affordance becomes the
heading component's own `::after`.

This **closes the map's "Docs prose typography" fog patch**: the mechanism is
hand-written overrides, the values are Blume's measured output, and there is no
`.prose` stylesheet to design.

**4. `<InstallCommand>` gains a package-manager bar — a deliberate, recorded
change.** Today it is npm-hard-coded: `install-command.astro` calls
`installCommand(item)` with the default `pm`, so every one of the 68 blocks
reads `npx`, while the site stores a preference (`sevenui:package-manager`,
default **pnpm**) that only `/blocks` honours. The dev chose to close that gap
in the migration rather than after it.

Shape: the block stays a Shiki-highlighted bash code block, and the
**package-manager menu lives in the block's header bar** — which means the
install block *gains* the `data-language` header it does not have today (it
goes through `highlightCode`, not the fence path, so it never gets one, while
all 154 fences do).

Mechanism: **all four commands are highlighted and embedded, and CSS selects
one by `<html data-pm>`.** No client component, no hydration mismatch, no
flash. This is the existing `install-control.astro` pattern (`.pm-only-*`
classes, so the trigger "never needs JS to stay truthful") driven by the same
head-script pattern `07` established for `data-theme`. Payload cost is
negligible because an install block is one short line.

**Parity consequence, stated plainly:** this changes the install block on 67 of
68 docs pages. It is a large diff but a **uniform** one — a single declared
shape repeated, not 67 different changes — so `13` carries it as **one**
intended-diff entry. That is exactly the property the `/components` rename
lacked, where each of 65 routes diffed differently.

**5. Nothing is added. All 35 Blume content components are dropped.** The dev
opened this up — `TypeTable`, `AutoTypeTable`, `GithubInfo`, `Diff` were all
raised — and closed it again after each was measured. The measurements, kept
because they are the reasons:

- **`AutoTypeTable` cannot work on this registry.** It resolves a *named*
  interface or type alias through the TypeScript compiler API. **59 of 65**
  registry components have no named props type — `button.tsx` is
  `ButtonPrimitive.Props & VariantProps<typeof buttonVariants>`, an inline
  intersection. Making it work needs either named prop types across the
  registry (**out of scope**) or an extractor that resolves a function
  parameter's type across the `node_modules` boundary and evaluates a cva
  generic — whose output, since `ButtonProps extends NativeButtonProps,
  BaseUIComponentProps<'button', ButtonState>`, would be ~250 native DOM
  attributes. Noise, not an API reference.
- **`TypeTable` is not a table.** Blume's is a Fumadocs-style disclosure grid
  (111 lines, one `<details>` per row), so "build it on our `table` primitive"
  would have meant `collapsible`. Dropped anyway: it has zero uses, `13`'s gate
  cannot see a component that renders on no route, and `apps/web` has no test
  harness to exercise it. Its value only appears when the 65 "API reference"
  sections stop linking to base-ui.com and document props instead — a **content
  effort**, not a migration one, and the right time to build it.
- **`Diff`** would have meant `@pierre/diffs`, a declarative shadow root, and a
  second `light-dark()` theming bridge running parallel to the single contract
  `07` just established. `05` already noted `@shikijs/transformers` covers diff
  through the highlighter that is in the chain anyway.
- **`GithubInfo`** is a build-time GitHub API call, rate-limited without
  `GITHUB_TOKEN`, degrading silently to a card with no counts.

The general rule this settles: a component with zero uses does not get built
during the migration. If a docs page later wants an admonition, the answer is
not to port Blume's `<Callout>` — the registry has an `alert` primitive.

**6. The element map is closed and asserted.** The root `mdx-components.tsx`
declares exactly the 9 element overrides plus `Component` and `InstallCommand`.
A build-time check rides on the content index's **existing** text scan (`02`,
decision 8): if any MDX file introduces an element with no override, the build
fails. Cost is zero — the scan already runs — and it converts "the corpus is
narrow" from a lucky fact into an invariant, so the day someone writes a
blockquote it is a build error rather than a silently unstyled page.

## Findings

**The three install surfaces do not overlap; they diverge.** The ticket asked
whether `install-control.astro` and `copy-command.tsx` overlap with
`<InstallCommand>`. They do not — they are three components for three surfaces:

| Surface | Component | Shape | PM |
| --- | --- | --- | --- |
| docs (68 blocks) | `install-command.astro` | bash code block | hard `npx` |
| `/blocks` | `install-control.astro` | fused 32px control, command head elided to `…` | 4-PM menu, reads the preference |
| landing + `/components` | `copy-command.tsx` | `$ command` row, React | hard `npx` |

The `/blocks` control elides the command's head *because* it sits in a cramped
toolbar; on a docs page the command is the content and stays whole. Decision 4
takes docs from 1-of-3 surfaces honouring the preference to 2-of-3. **The
landing page and the `/components` gallery still hard-code `npx`** — a
remaining product inconsistency, recorded here and deliberately not fixed in
this cutover.

**`apps/web` has no test harness.** Zero test files, no `vitest` in its
`package.json`; all 66 test files live in `packages/registry`. `13` settled the
parity method (route diffing) and never touched unit testing, so nothing on the
map owns this. Recorded as a new fog patch rather than decided here.

## Hand-offs

- **To `06`:** `<Component>` (137 uses) is yours. The element map declared in
  decision 6 is shared — the demo component is an entry in the same object.
- **To `13`:** one new intended-diff entry — the install block gains a
  package-manager header bar on every docs page. One uniform shape, not 67
  separate diffs.
- **To `17`:** the heading anchor's hover `#` ships as part of the `h2`/`h3`
  element override, not as page furniture. The TOC remains yours.
- **To `14`:** `components.ts` (item 4) resolves to the root
  `mdx-components.tsx`; its `{ layout: { Header, Sidebar } }` half has no
  successor, since the chrome is ported as ordinary React (`12`).
- **To `15`:** unblocked — `02` and `04` were its two blockers.
