# Docs page furniture

Type: grilling
Status: open
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
