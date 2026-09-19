# Docs page furniture

Type: grilling
Status: resolved
Blocked by: 03

## Question

Surfaced by `02-docs-content-pipeline-decision`, which settled where prev/next
and the TOC get their **data** but not whether the rest of the furniture around
a docs page is reproduced at all. Four pieces ship live today and no ticket owns
them.

Settle, item by item — reproduce, change, or drop:

1. **Breadcrumb.** `<nav aria-label="Breadcrumb">` above the page title,
   rendering the nav group label only (`Primitives` on a component page). One
   segment, no links, no trail to the page itself. Is a one-word non-interactive
   breadcrumb worth reproducing? Its content depends on the nav tree
   (`03-sidebar-and-nav-source-of-truth`), which is why this is blocked on it.

2. **"Was this page helpful?"** `<section aria-label="Was this page helpful?">`
   with Yes/No buttons that swap to a thanks state. It is **not** inert: it
   fires Blume's `track()` → `window.gtag('event', 'feedback', { helpful, path,
title })`, and the site has GA4 configured (`G-8702Z28SMN`) in
   `blume.config.ts`. So this is a live analytics signal with real history.
   Reproducing it means emitting the **same event name and prop keys**, or the
   historical series breaks. Decide: reproduce as-is, reproduce with a different
   destination, or drop (and accept the series ends).

3. **TOC scroll-spy.** The TOC data is settled (`02`: from the content index,
   h2 + h3). The _behaviour_ is not. Today a `<blume-toc>` custom element writes
   `aria-current="location"` onto the active entry, and the TOC is rendered
   **twice** — a sticky right rail (`xl:block`) and a mobile `<details>`
   disclosure. Both must be driven. What replaces the custom element, and is it
   one client component rendered twice or two?

4. **Pagination markup.** `02` settled that prev/next ordering comes from the
   nav tree. The rendered shape is still open: a `<nav aria-label="Pagination">`
   with two bordered cards carrying a "Previous"/"Next" eyebrow (hidden under
   `md`), the target's title truncated, and an arrow that flips under RTL
   (`rtl:-scale-x-100`). Keep the RTL flip? `direction` is a shipped primitive
   but no locale is configured.

Each of these is chrome around the content, so the client/server boundary
question belongs with `12-chrome-port-client-and-server-boundaries` — this
ticket decides _what exists_, not _where the boundary goes_.

## Update from `15-agent-facing-and-seo-surface`

A fifth piece of furniture ships live that this ticket never listed: the
**page-actions rail** in the TOC aside (Edit on GitHub, Scroll to top, Copy as
Markdown, Open in chat × 6 providers). `15` found it, owns it, and resolved it —
ported whole, docs-only. Do not re-decide it here. This ticket still owns the
four items above.

## Answer

Resolved 2026-09-19. Every component was read from Blume's source
(`…/blume/src/components/layout/{Breadcrumbs,Pagination,PageFeedback}.astro`,
`toc-element.ts`) and every claim verified against the live site. Two of the four
items turned out to be different problems than the ticket described, and the
first one grew into a new page.

### Premise corrections

1. **The breadcrumb is not a breadcrumb.** `Breadcrumbs.astro` computes the full
   trail and then renders only `crumbs[length - 2]` — the parent group — as an
   eyebrow, and renders **nothing** when the trail is length ≤ 1. Verified live:
   `/docs`, `/docs/installation` and `/docs/theming` have no breadcrumb at all,
   while the 65 primitive pages all emit the identical `<span>Primitives</span>`.
   Because `03` gives groups no `href`, it is a single non-linked segment
   announced as a navigation landmark.

2. **The feedback event fans out to five sinks, of which one is live.** `track()`
   calls an internal reporter, `posthog.capture`, `gtag('event', …)`,
   `plausible`, and dispatches a `blume:track` CustomEvent. Only gtag is
   configured (`G-8702Z28SMN`). The contract is event `feedback`, props
   `{ helpful: "yes"|"no", path: location.pathname, title: document.title }`.
   There is **no dedup**: the hide is DOM-only and `astro:after-swap` re-inits, so
   navigating away and back already allows repeat votes today.

3. **`15` moves the `title` prop under this ticket's feet.** The live docs title
   is `<title>Button - SevenUI</title>` (ASCII hyphen); `15`'s rule makes it an em
   dash. So the GA4 series' `title` dimension changes value at cutover no matter
   what this ticket decides.

4. **A conflict with `12`.** `12` killed `--container-content` and
   `--radius-blume` because there were "zero `max-w-content`/`rounded-blume`
   anywhere in `apps/web` or the registry". True at the time — the classes live
   inside Blume's components in `node_modules`. But all four furniture pieces use
   both on every element (5 `max-w-content`, 12 `rounded-blume` on one live page),
   so porting them falsifies the premise. Values: `--blume-content-width: 42rem`
   (the measure `06` and `12` already cite) and `--blume-radius: 0.75rem` =
   **12px**, against our `--radius: 0.625rem` → `rounded-lg` 10px / `rounded-xl`
   14px. The furniture's corners match **neither** SevenUI radius.

### Decisions

**1. The breadcrumb becomes a real breadcrumb.** Not the landmark removed — the
trail drawn. The site already ships the correct idiom on `/blocks`
(`Blocks / Marketing / Hero`: linked ancestors, `mx-1.5` `/` separators, current
page a non-linked `text-foreground` span), so docs adopts it rather than
inventing one.

- **Trail shape:** a synthetic `Docs` root, then the nav ancestors, then the page
  — `Docs / Primitives / Button`. Taking the nav trail as-is was rejected because
  it leaves `/docs/installation` with a one-item trail, which is the same defect
  relocated. `Docs` is also the site's own word: the header tab for `/docs` is
  labelled exactly that.
- **Markup:** the semantically correct `nav > ol > li` with `aria-current="page"`
  on the last item, and **`/blocks` is brought along**. Copying the blocks markup
  verbatim would have propagated its two gaps (no list structure, no
  `aria-current`) to 68 more pages. `list-none` keeps it pixel-identical, so
  `/blocks`'s near-pixel parity is untouched and the diff is in the
  accessibility tree only. The visual idiom is preserved exactly, as is the docs
  position (above the `<h1>`, `mb-2`, on decision 5's measure).
- **The docs index renders none.** A breadcrumb whose only item is the current
  page carries no information. Net: 65 pages go from one word to a three-item
  trail, `/docs/installation` and `/docs/theming` **gain** a two-item trail they
  do not have today, `/docs` stays bare.

**2. `BreadcrumbList` JSON-LD is added**, as a third node in the `@graph` `15`
already established, on docs and on `/blocks` alike — `/blocks`'s trail is fully
addressable, so excluding it would need an explanation that does not exist. One
line on `13`'s list for all routes, not one per route.

**3. `/docs/components` becomes a real page** — the decision that made the JSON-LD
conformant rather than merely plausible. The alternative considered and rejected
was redirecting `/docs/components` to the first primitive: it makes the *URL*
honest but Google follows the 308 and canonicalizes the breadcrumb `item` to
`/docs/components/accordion`, which is Button's **sibling**, not its ancestor.
That is the same structural lie, laundered through a hop. `03`'s decision 5 maps
"Primitives" to the first primitive for the *header tab*, which is a jump-into-a-
section affordance; a breadcrumb is a hierarchy claim and cannot borrow it.

This is a **new page in the cutover** and therefore a deliberate bend of the map's
"no redesign, no new surfaces" principle, taken knowingly rather than by
accident.

- **Mechanically it is `docs/components/index.mdx`** — a real content page with
  frontmatter, carrying one new `<PrimitiveIndex />`. That reopens `04`'s closed
  component set by exactly one entry, and the reopening is justified on `04`'s own
  terms: it closed the set because nothing else had a use, and dropped
  `AutoTypeTable` because it provably could not work. This has one use and
  provably can work, since all 65 labels and descriptions already sit in
  frontmatter. The alternative — `app/docs/components/page.tsx` — is cheaper to
  write and more expensive everywhere else: outside the content index it needs a
  special case in `03`'s nav, `08`'s search index, `15`'s `.md` mirror and
  `llms.txt`, and `16`'s registry, and would be the only route under `/docs` with
  no `.md`. As MDX, all of them handle it with **zero special cases**.
- **The Primitives group node gains an optional `href`**, narrowing `03`'s
  decision 4 rather than breaking it: that type boundary exists so a *label*
  cannot become a URL, and the group's `href` still comes only from the content
  index's `route`. The sidebar's `<details>` summary becomes a link with the
  toggle bound to the chevron. Rejected: making the index the group's first child,
  which keeps the type boundary intact but forces the breadcrumb to find the group
  URL through a "the group's overview child" special case — the exact kind of hack
  this decision exists to avoid. The index is excluded from the group's derived
  children so it does not appear twice.
- **Content:** the 65 primitives as a card grid in `/components`'s existing idiom
  (`rounded-xl border`, label plus description), **alphabetical**. Alphabetical
  because `03` slug-sorts the nav and the page must agree with the sidebar;
  grouping by wave would duplicate `/docs`'s hand-maintained Coverage section with
  a second list free to drift from it.

**4. "Was this page helpful?" is reproduced, with two corrections.** The GA4
series is read, so the event name `feedback` and the prop keys `helpful`, `path`
and `title` are preserved exactly.

- `title` is sent as the **bare page title** from `16`/`19`'s `lib/page-meta.ts`
  registry, not `document.title`. Per premise 3 the value changes at cutover
  regardless; if it must change once, it should change to the value that carries
  no separator and will not move again. `path` remains the series' real key.
- The four dead sinks are dropped: posthog, plausible, the internal reporter and
  the `blume:track` CustomEvent, which has no listener anywhere.

**5. The TOC scroll-spy becomes one hook rendered twice.** The algorithm is
ported exactly: a 72px offset constant; active is the **last** heading whose
`getBoundingClientRect().top <= 72`; at the document bottom the last link is
forced. Today two independent `<blume-toc>` instances run — the mobile
`<details>` and the desktop `<aside>` — each with its own observer and its own
`aria-current` write. In React one `useActiveHeading` in the docs layout feeds
both renderers, so there is **one** scroll listener and **one** observer instead
of two.

The `IntersectionObserver` is kept even though its callback ignores its own
entries and only triggers a recompute. It is not ceremony: `06` hydrates 81 demos
on load, which moves headings without any scroll event, and the rAF-throttled
scroll listener alone would miss that.

**6. Pagination is reproduced exactly; the RTL flip is dropped.** The markup,
measurements and classes carry over verbatim, the empty `<span />` placeholder
included. The logical properties (`ms-auto`, `text-end`) stay — they are
unconditional and simply correct. `rtl:-scale-x-100` goes: the variant only fires
under `[dir="rtl"]`, and the port has no locale, no `dir` switch, and i18n is
ruled out map-wide. A variant that can never match is dead code, dropped on the
same grounds as `12`'s unreachable panel machinery and `14`'s consumer-less
`@theme` entries.

**7. The two tokens `12` killed go in opposite directions.**
`--container-content` **comes back under our own name**: the 42rem docs measure is
referenced by `04`'s element overrides, `06`'s demo panes and all four furniture
pieces, yet after `04` deleted `.prose` and `12` killed the token, **nothing on
the map owned it** — a real gap this ticket closes. `rounded-blume` genuinely
dies: 12px matches no SevenUI radius while the furniture sits inches from
primitives at 10px, so it snaps to `rounded-lg`. A 2px change on four elements,
comfortably inside the parity bar, and it narrows `12`'s decision rather than
widening it.

### Effects on resolved tickets

- **`04`:** its closed component set gains exactly one entry, `<PrimitiveIndex />`.
- **`03`:** a group node gains an optional `href`, sourced only from the content
  index's `route`.
- **`12`:** `--container-content` survives (renamed); `--radius-blume` still dies.
- **`13`:** one new route, plus intended-diff rows for the breadcrumb, the
  `BreadcrumbList` node, and the feedback `title` prop.
- **`15`:** the new page joins `sitemap.xml`, `llms.txt` and the `.md` mirrors
  automatically, because it is authored as MDX.
- **`16`:** the new page gets an OG card with no special casing, from the same
  content index.
