# Performance budget

Type: grilling
Status: open

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
