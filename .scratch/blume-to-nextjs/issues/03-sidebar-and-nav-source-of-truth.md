# Sidebar and nav source of truth

Type: grilling
Status: resolved
Assignee: Oğuzhan (this session)
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

## Answer

**1. Hybrid — derive the set, declare the shape.** `lib/docs/nav.ts`, next to
`02`'s content index, declares the tree skeleton: `/`, `/installation`,
`/theming`, then one group `label: "Primitives"` whose children are every
content-index route under `/components/`. Labels come from the index's `title`.
The 65-entry list dies; a new primitive reaches the sidebar by shipping its
`.mdx` and nothing else. A **build-time assertion** requires every index route
to appear in the nav exactly once — today nothing checks this, and Blume
silently dumps an orphan page into `llms.txt`'s `## Other` section.

**2. Order is automatic, keyed on the slug.** No explicit order array: the
group's order is a slug sort of the derived set. Verified — today's config order
is *exactly* slug-alphabetical (set-identical to the 65 files, diffed), so
automatic ordering reproduces the live sidebar byte-for-byte. Two ordering facts
worth keeping:

- **Filename sort is not slug sort.** `alert-dialog.mdx` sorts before
  `alert.mdx` because `-` < `.`. Five pairs collide: `alert`, `button`, `input`,
  `message`, `toggle`. A naive `readdir().sort()` produces the wrong order in
  five places.
- **Title sort equals slug sort for all 65 today** (verified), so the key choice
  costs no parity either way. The key is the **slug** anyway, because the slug
  is the frozen URL while `title` is content — `04` or `17` editing a heading
  must not silently reorder 65 sidebar links.

If a hand-held order is ever wanted, the extension is one line (an optional
`order: string[]` prefix, slug-sorted tail). It is **not** built now; an unused
mechanism is exactly what decision 6 below throws away.

**3. Sidebar is a client component inside `app/docs/layout.tsx`.** Forced by the
active-link marker: App Router does not re-render a shared layout when
navigating between its children, so `aria-current="page"` cannot be computed on
the server there — it needs `usePathname()`. The tree itself is still built on
the server and handed down as serialized data (label + href per node); the
content index and `fs` never reach the client. Rejected: rendering the sidebar
from the page instead of the layout, which keeps it a server component but
re-sends 65 links on every navigation and loses layout persistence.

**4. Labels can never become URLs, by type.** Two node shapes: a link is
`{ label, href }`, a group is `{ label, children }` — **a group has no `href`**
(nor does it today: the config gives the Primitives group only `display`,
`label`, `items`). `href` is only ever the content index's `route`, which the
index computes from the file path. No `slugify(label)`-shaped call exists
anywhere. `13`'s anchor/DOM diff catches a regression. The label still has one
legitimate output path — `llms.txt`'s `## Primitives` heading — which is why
this is a type boundary rather than a naming convention.

**5. `site-tabs.ts` moves as data; one component renders both placements.** The
array moves verbatim to `lib/site-tabs.ts` (already framework-free). Today it is
a single source with two renderers (`Header.astro`, `site-drawer-tabs.astro`);
after the port it is one `<SiteTabs>` with two variants. `currentTabForRoute` is
Blume's (`blume/components/layout/nav-utils.ts`) — the tabs' only logic
dependency on Blume — and is reimplemented as a ~10-line longest-prefix helper
beside the data, with a unit test. The `Primitives` tab's `href` stops being the
hard-coded `/docs/components/accordion` and derives from the nav's first
primitive child; hard-coding it is a latent bug the day a primitive sorts ahead
of `accordion`.

**6. One tree, pure selectors, no second structure.** `lib/docs/nav.ts` exports
`docsNav` (the tree) and `flatNavRoutes(docsNav)` for prev/next — `02` fixed
prev/next to the flattened sidebar order. The `llms.txt` emitter (`15`) walks
the tree itself; it must synthesize the literal `## Docs` heading for the loose
root pages, because that string is **Blume's hard-coded default**, not a
configured label (`src/ai/llms.ts`: loose root pages get `## Docs`, then each
group emits `## <label>`). `search.popular` is **not** wired to the nav — it
stays a hand-written list, owned by `08`.

**7. Blume's dead nav machinery is not ported.** `NavTree.astro` is half
`display: "page"` panel stack: drill-in buttons, a back button, the `blume-nav`
custom element, a 260ms slide with RTL handling. Panels are only created for
`page`-mode groups and SevenUI declares none, so **the entire mechanism is
unreachable on this site today**. The ported sidebar knows two row types: a page
link and one `group` collapsible. Blume's `collapsed: false` escape hatch is
also unused and does not come along. Handed to `14`.

**8. Group open state: controlled, one-way force.** Today's `<details
open={active || collapsed === false}>` is computed on the server with zero
persistence and no JS — but that zero-persistence is an artifact of every
navigation being a document load. With the sidebar a client component in a
persistent layout, it re-renders on `usePathname()` change but never remounts,
so an uncontrolled `defaultOpen` would be ignored after mount: a user jumping
from `/docs/theming` to `/docs/components/button` via the search palette would
find the group **closed** — a real regression. So: `useState(activeInside)` plus
an effect that forces the group open when the active page enters it and **never
forces it closed**. Today's observable behaviour is reproduced exactly, and a
manually-opened group now survives navigation (today's full page loads destroy
it). No `localStorage` — there is none today, and adding one would crowd `07`'s
single-key contract for a preference nobody asked for.

## Scope

**The `/components` URL segment stays.** The dev raised renaming it to
`/primitives` and, after the costs below, dropped it — "no rename". The map's
existing **Out of scope** entry on URL changes stands unamended, and no
follow-up ticket is opened. Recorded because the investigation corrected two
things:

- **The map's stated reason is partly wrong.** "Published install commands
  depend on them" does not hold for this segment: `packages/registry/registry.json`
  references only `/r/*.json`, never a docs route (verified). Install commands
  are indifferent to the docs URL. The load-bearing reasons are SEO on 65
  indexed pages and the `AGENTS.md:21` vocabulary rule.
- **Redirects were never the expensive part.** Three `:slug` wildcard rules
  cover it (HTML, the `.md` mirror, the `/og/....png` image); `vercel.json` has
  no redirects today. The real cost is **verification**: `13` diffs 101 HTML
  routes against the live site, and renaming 65 of them turns each one's
  canonical URL, `llms.txt` line, `.md` `Source:` line, sitemap entry and OG URL
  into an *intended* diff — `13`'s 5-entry intended-diff list would grow into
  the hundreds. That is the migration's parity gate spent on a cosmetic segment,
  which is the same argument that already keeps the redesign out.

The free half is kept regardless: decision 4's type boundary, plus the segment
living in one named constant so a later effort is a one-line flip.

## Findings

**A live-but-fragile link shape that `02`'s "no basePath" decision breaks.**
Blume rewrites base-relative markdown links through `basePath` — `](/components/field)`
is served as `href="/docs/components/field"` (verified on the live `/docs`).
Four links in three files are written that way:

| File | Link |
| --- | --- |
| `docs/index.mdx:53` | `/components/field` |
| `docs/index.mdx:56` | `/installation` |
| `docs/components/field.mdx:55` | `/components/form` |
| `docs/components/form.mdx:39` | `/components/field` |

`02` settled **no `basePath`** (the `/docs` prefix is a literal route segment),
so `@next/mdx` leaves these exactly as written. All four then point outside the
docs tree. Worse than a 404: **the `/components/*` namespace is occupied** — the
gallery serves 10 live pages there (`/components/button`, `/components/dialog`,
`/components/input`, … all 200). These four happen to miss (`/components/field`,
`/components/form`, `/installation` all 404 today as top-level routes), but a
base-relative `/components/button` would silently render the **gallery page**
instead of the primitive's docs page. Decision: rewrite all four to absolute
`/docs/...` form during the migration, and `02`'s internal-link validator must
**reject** any content link that does not resolve against the content index —
treating a base-relative link as an error, not a warning, because the failure
mode is a wrong page rather than a missing one.

The remaining 41 internal links already carry `/docs/`, and the 37
`base-ui.com/react/components/*` links are external and unaffected.

## Hand-offs

- **To `14`:** decision 7 — Blume's `page`-mode panel machinery and the
  `collapsed: false` hatch are unreachable and not ported. Also item 4's "65-entry
  sidebar order with its collapsible Primitives group" now has its new home:
  `lib/docs/nav.ts`, derived, per decisions 1 and 2. `search.popular` still needs
  one (`08`).
- **To `13`:** one new intended diff — sidebar **scroll position now persists
  across navigations**, a free consequence of layout persistence. Today every
  navigation is a document load and the aside starts fresh.
- **To `17`:** unblocked. Prev/next consumes `flatNavRoutes(docsNav)`.
- **To `15`:** the `## Docs` heading is Blume's hard-coded string for loose root
  pages, not a configured label; the nav tree keeps loose pages distinguishable
  from grouped ones so the emitter can reproduce it.
