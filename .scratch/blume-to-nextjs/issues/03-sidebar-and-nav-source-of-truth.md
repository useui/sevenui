# Sidebar and nav source of truth

Type: grilling
Status: open
Blocked by: 02

## Question

Today the docs sidebar is hand-declared in `blume.config.ts`: `/`,
`/installation`, `/theming`, then a `display: "group"` collapsible labelled
"Primitives" containing 65 explicit routes. The group exists for a recorded
reason — 66 flat links made the mobile nav drawer unusable — and `NavTree`
opens it automatically when the current page is inside it. Both the header tabs
and the drawer read from this, plus `apps/web/components/site-tabs.ts` which
owns the Docs / Primitives / Components / Blocks / Pro vocabulary.

With the content pipeline settled, decide where this lives.

1. **Explicit list, or derived from the content index?** Deriving removes a
   65-entry list that must be edited whenever a primitive ships; an explicit
   list keeps ordering and labelling under control. A hybrid (derive the set,
   declare the order and grouping) is a third option.
2. **If derived:** what determines order — frontmatter, filename, or a separate
   order file? Alphabetical is what the current list happens to be; confirm
   that is true for all 65 and not almost-true.
3. **The collapsible group behaviour is frozen** (collapsed by default, auto-open
   when the active page is inside). Where does that state live in React, and
   does it persist across navigations?
4. **Labels vs routes.** "Primitives" is the label; the routes keep their
   `/components/` segment. The vocabulary rules in `AGENTS.md` forbid renaming
   route segments. Make sure the chosen shape cannot leak a label into a URL.
5. **`site-tabs.ts`** — does it move as-is, and does it become the single source
   for both the header tabs and the drawer tabs (`site-drawer-tabs.astro`,
   `site-tabs.ts` are separate today)?
6. **Consumers.** The sidebar, the mobile drawer, prev/next, the search
   palette's "popular" list, and `/llms.txt`'s section grouping (which mirrors
   Docs / Primitives today) all want this structure. One export, or several?
