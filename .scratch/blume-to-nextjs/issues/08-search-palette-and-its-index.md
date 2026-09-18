# Search palette and its index

Type: grilling
Status: open
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
