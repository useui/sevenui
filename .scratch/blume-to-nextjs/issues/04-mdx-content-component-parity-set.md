# MDX content component parity set

Type: grilling
Status: open

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
