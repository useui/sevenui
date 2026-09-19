# Performance budget

Type: grilling
Status: resolved

## Question

Graduated from the map's **Not yet specified** by
`12-chrome-port-client-and-server-boundaries`, which was the stated
prerequisite: the patch said a budget was worth stating "only once the chrome
port shape is known". It is now known.

Today's output is static Astro HTML with almost no client JS. The React chrome
plus the RSC payload will not be free, and five tickets have each measured one
input:

- **`05`:** dual-theme Shiki output is ~2.0 MiB of HTML — 33% of the live button
  page — and the App Router duplicates it into the RSC flight payload.
- **`02`:** highlighting runs once per unique source and is memoized for the
  whole build; a >3x build-time regression is a signal, not a gate.
- **`03`:** the docs sidebar is a client component in the layout, so ~65
  serialized nav nodes ride in every docs page's payload alongside the Shiki
  HTML.
- **`06`:** 56 of 137 demos become zero-JS RSCs, but the 81 that stay client
  components hydrate **on load rather than on scroll** — `client:visible` is
  deliberately not reproduced.
- **`08`:** a 30 KiB gzipped search index, fetched on first open rather than
  bundled, with a measured 5 KiB alternative if body text is ever dropped.
- **`12`:** the header is one client component (five tabs); all three sidebars
  are client components in persistent layouts; a `/blocks` category page ships
  one client component per card plus a concurrency-3 loader context; the search
  dialog is a dynamic import; `/account` and `/pro` ship no Clerk bundle for
  anonymous visitors.

`13-parity-proof-method` put performance **explicitly outside the cutover gate**.
So this ticket is not about blocking the cutover.

Settle:

1. **Is there a budget at all, or only measurements?** A budget that nothing
   enforces is a comment. Name what it would be: a CI check, a manual
   pre-cutover measurement recorded in the spec, or nothing.
2. **What does it measure, and on which routes?** Candidates: transferred HTML,
   RSC payload size, JS shipped per route, LCP/INP on a fixed device profile.
   The honest reference set is probably `/docs/components/button` (the Shiki
   worst case), a `/blocks/<group>/<category>` page (the client-heaviest), `/`
   (hand-tuned, `client:load` showcase today), and one guide page.
3. **What is the baseline?** The Astro build's own numbers for the same routes,
   measured before cutover — or nothing, in which case the budget is absolute
   rather than relative.
4. **What happens when it regresses?** `02` set the precedent for build time (a
   signal, not a gate). Does payload get the same treatment, or is there a
   number above which the cutover does not ship?
5. **Is the 81-demo hydrate-on-load decision revisited here?** `06` dropped
   `client:visible` deliberately. If a measured docs page is dominated by
   hydration rather than HTML, a scroll-gated boundary becomes an option again —
   but it is `06`'s decision being reopened, so the bar is a measurement, not a
   preference.

## Answer

Resolved 2026-09-19. The five inputs the ticket lists were already measured by
other tickets; what was missing was the **other half of the comparison** — what
the port costs before any of our code runs. That was measured directly: Next
16.3.5 and React installed fresh, a hello-world App Router app built (one root
layout, one static server page, one nested layout carrying a single `'use client'`
component with 65 serialized nav nodes), and the emitted chunks weighed.

### The two baselines

Today's site, measured live from the CDN with `Accept-Encoding: gzip`:

| route | HTML gzip | JS gzip |
|---|---|---|
| `/` | 19.9 KB | 6.8 KB |
| `/docs` | 19.0 KB | 12.5 KB |
| `/docs/installation` | 21.6 KB | 12.5 KB |
| `/docs/components/button` | 23.7 KB | 15.0 KB |
| `/docs/components/chart` | 24.8 KB | 15.0 KB |
| `/blocks/marketing/hero` | 21.6 KB | 28.5 KB |

The port's floor: **566 KB raw / 173 KB gzip**, across 7 chunks, **all executed**
(`src=`; preload-only totals zero). Production build, no dev markers. Measured
with gzip -9 against CDN-gzip for the Astro side, so the comparison is like for
like; Vercel serves brotli, which would take roughly 15% off both.

So **every route's JS regresses 6–25x by construction**, before a line of our own
code. That figure, not any of the five inputs, is what decides this ticket.

### Decisions

**1. There is a budget, and it is a recorded measurement — not CI.** A CI check
needs a stable measurement environment and a number to fail on, and neither
exists until the port does. More decisively, `13` put performance **outside** the
cutover gate, so a CI gate would block a release on something nobody agreed
blocks it. Recording nothing is the worse option: the 6–25x arrives by
construction, and a spec that does not say it out loud turns a known cost into a
post-cutover discovery.

**2. Three numbers per route, and INP rather than LCP.** Compressed transfer
(HTML plus the RSC flight payload), compressed JS executed on first load, and one
field metric. INP is the right one because the change is hydration-shaped, not
render-shaped: the page arrives as static HTML either way so LCP barely moves,
while 81 demos hydrating on load is precisely an INP/TBT story.

Reference routes are the ticket's four — `/docs/components/button` (the Shiki
worst case), a `/blocks/<group>/<category>` (the client-heaviest), `/`
(hand-tuned), one guide page — **plus `/docs/components/chart`**, the only docs
page that pulls recharts to the client and therefore the worst case for the
demo-hydration question decision 5 defers. It is already today's heaviest docs
HTML at 24.8 KB gzip.

**3. Both baselines are recorded, in different roles.** The Astro numbers above go
into the spec as **context, not as a target**: against a 173 KB floor a relative
budget is red on day one and teaches nothing. The budget itself is **absolute**,
derived from the port's own first measurement. The Astro table's job is to answer
"what was traded for what", which is a question the spec should be able to answer
and currently cannot.

**4. A signal, not a gate — measured once, at the end of the branch.** This
follows `02`'s build-time precedent, with one correction to the ticket's framing:
the cutover is a single deploy from a long-lived branch, so "regression" during
the migration means "stage N is worse than stage N-1", which no fixed number can
express usefully. The measurement is taken **once**, at the end of the branch,
recorded in the spec, and that recorded number becomes the baseline for
subsequent work. Nothing gates the cutover itself — `13` already decided that,
and this ticket is not the place to quietly reverse it.

**5. `06` is not reopened preemptively, and the ticket understates what reopening
would cost.** In Astro, `client:visible` defers *hydration* only; the bytes ship
either way. In Next the equivalent is `next/dynamic`, which splits the chunk out
— so scroll-gating would change **both** payload and main-thread time, making it
a larger change than the ticket implies rather than a smaller one. `06` set the
bar as "a measurement, not a preference"; the correct behaviour is to measure
`/docs/components/chart` and `/docs/components/button` and reopen only if the
measured INP on the fixed device profile is bad.
