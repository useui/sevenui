# Search palette and its index

Type: grilling
Status: resolved
Assignee: Oğuzhan (this session)
Blocked by: 02

## Question

Search is rebuilt on SevenUI's own `command` primitive (settled). Blume's Orama
dialog is not carried over — `theme.css` already forces it to a single column
with `!important` and hides its preview pane, so the replacement should simply
*be* that.

Settle:

1. **What is searchable?** Page titles and descriptions only, headings too, or
   full body text? Full text over 68 pages is a meaningfully larger index and
   needs ranking; titles plus headings is small and fast. Note what Blume
   indexes today so the change is deliberate.
2. **Index generation and shape.** Derived from the content index
   (`02-docs-content-pipeline-decision`) at build time into a static JSON
   fetched on first open, or inlined into the bundle? Record the expected size.
3. **Matching.** Substring, fuzzy, or a small scoring function — and is a
   library acceptable here, or does "hand-rolled" extend to the matcher? The
   `command` primitive is built on Base UI Autocomplete, which brings its own
   filtering behaviour; establish what it already does before writing a matcher.
4. **Scope.** Docs pages only, or also `/components` gallery items and `/blocks`
   entries? The pro manifest is ISR-revalidated, so including blocks means a
   search index that goes stale unless it is fetched client-side.
5. **Keyboard contract.** Cmd/Ctrl+K to open, and whatever else Blume binds
   today — measure it, since users have muscle memory. Does the header search
   affordance keep its current position and appearance?
6. **`search.popular`.** `blume.config.ts` declares six popular links shown in
   the empty state. Does that list survive, and where does it live now?
7. **Result presentation.** The single-column list is the target. What does a
   result row show — title, breadcrumb, matched heading? And does hitting a
   heading result deep-link to its anchor?
8. **No-JS and accessibility.** Blume's dialog degraded somehow; decide what
   the replacement does with no JS, and confirm the `command` primitive's
   a11y story covers a search dialog.

## Answer

**0. Measured first: full-text matching does not work on this corpus.** 65 of
the 68 pages are the same skeleton, so body text is nearly non-selective:

| Query | Pages matched |
| --- | --- |
| `installation` | 67/68 |
| `usage` | 66/68 |
| `props` | 47/68 |
| `base ui` | 47/68 |
| `variant` | 26/68 |

That number is what decides most of this ticket. Blume's index carries body
text and nothing else addressable, so a result can only ever point at a page.

**1. The index gains heading-level entries. 382 entries: 68 pages + 314
headings.** There are 509 `h2`/`h3` headings across the corpus but only 261
distinct, and three of them — `Installation`, `Usage`, `API reference` — account
for 195 occurrences. Those three are excluded; the remaining 314 are genuinely
page-specific (`Loading`, `With icons`, `Controlled`). A heading entry links to
`route#slug`, so a result can land in the middle of a page.

This is a **deliberate improvement**, in the category `04` established: one
uniform declared shape, not a redesign. `13` carries it as a single
intended-diff entry — search results may now deep-link to an anchor.

Anchors match by construction, for `02`'s reason: the heading slug comes from
the same `github-slugger` pass that `rehype-slug` runs at render, so the index
and the rendered `id` cannot drift.

**2. Build-time static JSON, fetched on first open. 113 KiB raw / 30 KiB
gzipped.** Derived from `02`'s content index — the same server-only `fs` module,
no second reader and no codegen — and written as a static asset. Fetch is on
first open, as today, not inlined into the bundle.

Body text stays, page-level only, weighted below title/heading/description.
Measured for the record: dropping body text entirely takes the index to **31
KiB raw / 5 KiB gzipped**. Given the selectivity table that is a real lever, but
it would cost the one thing today's search does have, so it is not taken here —
recorded so a later payload decision has the number.

**3. The matcher is ours; Base UI keeps everything else.** `command` is
`Autocomplete.Root`, and `AutocompleteRootProps` does **not** omit
`filteredItems` — "the list will use these items instead of filtering the
`items` prop internally". So a ranked array is handed in and Base UI renders it
in our order while keeping the combobox roles, `aria-activedescendant`,
highlight and keyboard handling.

Base UI's own filter is not used, and could not be: it is
`Intl.Collator`-backed **substring `contains`** (`usage: 'search'`, `sensitivity:
'base'`, `ignorePunctuation: true`) returning a boolean, with no score — it
cannot rank, and its sliding-window compare over 81 KiB of body text would run
per keystroke.

The scorer is hand-written, no library, a field-weighted ladder: exact title >
title prefix > title substring > heading substring > description substring >
body substring, with a page's own entry ranked above its headings on ties so a
page and its sections do not interleave. 12 results shown, as today.

**4. Scope is docs only — 68 pages, unchanged.** This is parity, not a
restriction: Blume's index contains the 68 `.mdx` routes and nothing else. The
`/components` gallery (10 pages, 40 items) and `/blocks` are **not** searchable
today. `/blocks` must stay out on its own merits — its pages are ISR-revalidated
from the pro manifest, so a build-time index of them goes stale by construction.
The gallery was raised and dropped: it is a product decision about what search
covers, not migration parity, and this cutover's rule is that regressions stay
attributable.

**5. Keyboard contract is preserved minus one dead binding.** Measured from
`Search.astro`: `⌘/Ctrl+K` **toggles** (pressing it with the dialog open closes
it — deliberate, to avoid re-`showModal` on an open dialog), `/` opens only and
is inert while focus is in any field, plus arrows, Enter and Escape.

`⌘J` toggles the result-preview pane and is **dropped**: this site already hides
that pane with `!important` in `theme.css`, so the binding is dead today. One
line in the spec, no behaviour lost.

The trigger keeps its position and appearance exactly: a `h-9` rounded-full
bordered pill, icon-only below `lg`, gaining the "Search" label and a `⌘K` kbd
above it.

**6. `search.popular` survives and moves to `lib/docs/search.ts`.** Six links,
rendered as a "Popular" group in the empty state, unchanged. **Landmine:** the
routes in `blume.config.ts` are base-less (`/installation`, `/theming`,
`/components/button`) because Blume prefixes them through `basePath` at render.
`02` decided there is no `basePath`, so all six must be written with a literal
`/docs/` prefix. Same family as `03`'s 4 base-relative markdown links, and
`/components/button` is the dangerous one — unprefixed it resolves to a real but
wrong page in the gallery's namespace rather than 404ing.

The empty state's other group, "Ask AI", does not come along — `blume.config.ts`
has no `ai.ask` block, so it is already off in production.

**7. Result rows keep today's shape; one template serves both entry kinds.**
Measured: file icon, title, and a 2-line clamped excerpt, both title and excerpt
carrying `<mark>` highlights. The `breadcrumb` field is carried in the hit and
**never rendered** — it exists for the section pills only.

- A **page** row is that row unchanged: icon, title, excerpt (the description,
  or a window of body text around the match).
- A **heading** row puts the heading text on the title line and its page's title
  on the second line, in place of the excerpt.

Section pills are kept, with today's threshold — they render only when the
result set spans two or more sections, which on this site (Primitives 65,
Docs 3) is most of the time not the case. They count **distinct pages**, not
entries, so heading entries cannot inflate them.

**8. There is no no-JS story to preserve, and the a11y story improves.** Blume's
dialog is a custom element wrapping a native `<dialog>`; with JS off the trigger
is inert and no fallback exists. The replacement is the same: search is a client
component. `CommandDialog` is Base UI Dialog plus Autocomplete, so the combobox
roles, `aria-activedescendant` wiring and focus trap come from the primitive
rather than being hand-rolled, which is a strict improvement over 866 lines of
bespoke element.

## Findings

**The excerpt-sanitizing machinery does not come along, and that is a security
simplification.** Blume builds result rows as HTML strings and assigns them with
`innerHTML`, so it needs `highlight()` (match on raw text, escape per segment,
so a query like `amp` cannot mark the inside of an entity) and
`sanitizeExcerpt()` (reduce provider markup to bare `<mark>`, splitting on
angle-runs so a deletion cannot splice `<<b>script>` into `<script>`). Both
exist because the output path is `innerHTML`. In React the excerpt is rendered
as an array of text nodes and `<mark>` elements, so there is no HTML string, no
escaping step and no sanitizer — roughly 60 lines of security-critical code
that simply has no successor.

**Anchored results need `scroll-padding-top` or they land under the header.**
Blume sets `scroll-padding-top: 4.5rem` on `html` in its theme entry — another
rule living in Blume's generated CSS rather than `apps/web/theme.css`, in the
same family as `07`'s `@custom-variant dark` and `06`'s five `--color-*` tokens.
Without it, decision 1's deep links scroll the target heading behind the sticky
header.

## Hand-offs

- **To `12`:** the search trigger and dialog are a client component in the
  header. Also `scroll-padding-top: 4.5rem` on `html` in `globals.css` — third
  entry in the running list of rules that live in Blume's generated CSS, after
  `07`'s `@custom-variant dark` / `color-scheme` and `06`'s five `--color-*`.
- **To `13`:** one new intended-diff entry — search results may deep-link to a
  heading anchor. Also a new static asset (the index JSON) that the generated
  inventory will see.
- **To `14`:** `blume.config.ts`'s `search.popular` block and its six base-less
  routes resolve to `lib/docs/search.ts` with literal `/docs/` prefixes.
- **To the map's Performance budget patch:** a 30 KiB gzipped index, fetched on
  first open rather than shipped in the bundle, and a measured 5 KiB alternative
  if body text is ever dropped.
