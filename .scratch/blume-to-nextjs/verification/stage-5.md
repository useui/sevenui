# Stage 5 — `/blocks` and ISR

Branch `feat/blume-to-nextjs`. This is the stage the migration exists for: everything before it was
parity, this is capability. **24 routes regenerate from the pro manifest on a 300-second window, and
a category added in the pro repo reaches the site without a rebuild.**

Every gate below was run against the **live preview deployment**, not a local build, except where a
local build is the only thing that can answer (page counts, typecheck, file tracing).

Commits: `749f3a7` (the §17.2 extractor) · `6aaf6c9` (Data Cache + schema split + hermetic CI) ·
`8a098f8` (blocks chrome + shared drawer) · `3464548` (block frame) · `670a192` (theme dock) ·
`61c24eb` (**the routes + ISR**) · `da84f3a` (manifest canary) · `24623e3` (heading tracking).
Spec/plan amendments: `3c774bf` (#41), `179104f` (#12 rewritten), `757c8ae` (#42), `0a1553f` and
`5299a21` (cutover checklist row 8).

## Gates

| Gate | Result |
|---|---|
| `pnpm --filter @sevenui/web build` | PASS — 85 → **109** static pages; the 24 new routes are the manifest's own `1 + 4 + 19`, read out of the build's Data Cache entry, not a literal |
| `pnpm -r typecheck` | PASS — clean |
| `dynamicParams` declared and on | PASS — `fallback=null` on both dynamic blocks routes against `fallback=false` on `/components/[name]` as the control |
| §17.2 links, all 24 routes | PASS — **0 unowned extra, 0 unowned gone**; sequence identical position-for-position |
| §17.2 heading arrays, all 24 routes | PASS — **byte-identical as JSON**: depth, text and anchor id |
| §17.2 text, all 24 routes | PASS — **identical** after removing exactly one occurrence per route of the owned header chrome run |
| Breadcrumb separator whitespace | **42 differences, all declared** — 0 on `/blocks`, 1 per group page, 2 per category page, every one at a separator (§17.6 #24) |
| Manifest fetch | PASS — **one Data Cache entry; zero network requests on a warm cache; zero from any of the 109 renders**; two concurrent misses on a cold build from `generateStaticParams` in separate workers |
| §17.4 negative paths, **navigated** | PASS — bogus category, bogus group, bogus group + real category, and **a real category id under the wrong group** all **404**; three 200 controls pass |
| ISR cache states | PASS — PRERENDER → HIT → **STALE at age 397** → HIT with age reset to 11 |
| `/previews/` both forms (PROOF #5) | **FAIL, declared** — `/previews/x` 200, `/previews/x/` **308** then 200. See below |
| `"use cache"` needs `cacheComponents` (PROOF #3) | PASS — confirmed by an actual build failure; §10.1 unchanged |
| Client boundary | PASS — **0 of 29** `"use client"` modules reach `lib/blocks.ts` or `lib/pro-manifest.ts` by value, on a transitive walk with a positive control |
| Pre-existing routes unchanged | PASS — **83 of 83** byte-identical in stripped `<body>` between the pre- and post-stage deployments |
| Function file tracing | PASS — `public/r` 247 → **0**, `dist/**` 26.9 MB → **0**, non-`node_modules` 1705 → **91**; `docs/**` deliberately still **69/69** |
| Eager client JS on `/blocks` | PASS — 14 chunks, 752 KB raw, **no zod**; docs control 32 chunks / 2032 KB, also none; positive control finds zod in exactly one chunk, in neither eager set |
| CI hermetic against the fixture | PASS — build green with the network to pro unreachable, proven by the fixture's own 2/3/3 shape against the live 4/19/113 |
| Canary bites | PASS — 11 of 11 throw sites reachable, each with its own fixture; control exits 0 against the unmodified live manifest |
| Registry JSON (§17.4, absolute) | untouched this stage — no task wrote to `packages/registry` |

Owned tokens excluded everywhere: `#blume-content` → `#content` (Stage 1 §13.3), `/account`
(Stage 6 §12), and — new this stage, the first owned token that is **text** — the header's search
affordance and auth pill, which §11.1 says the header does not render yet.

## Routes reviewed by hand, in the browser

**The pixel-near matrix.** `/blocks`, `/blocks/marketing`, `/blocks/marketing/cta` × 390/768/1440 ×
light/dark × both origins = 18 views, 36 captures, **1,638 landmark comparisons**.

**Largest delta anywhere: 0.00 px, with no exclusions.** Every total page height is identical to the
pixel. The matrix initially reported an 11.19 px maximum with a single cause (see finding A below);
that cause was fixed inside this stage and re-measured on the deployment, where production and the
port now compute `-0.7px` on every affected heading and every width matches to the pixel.

The two known differences were confirmed by measurement rather than assumed: production's header
carries the search affordance and the "Sign in" pill and ours carries neither, and **nothing outside
the header moves** — site-header, main and `h1` all 0.00 px — with only the GitHub link shifting
inside it, by +77.34 px. §17.6 #12 and #42 were confirmed element by element.

**The eight frame-driven checks, all PASS**, on `/blocks/application/dashboard`:

| # | Check | Evidence |
|---|---|---|
| 1 | concurrency cap | exactly 3 started in the same millisecond, peak in-flight **3, never 4**; the 4th waited **6,391 ms**, starting 46 ms after the first release |
| 2 | drag resize | iframe document width 1098 → 618 px, readout and `aria-valuenow` tracking; `pointer-events` auto → none → auto across six phases |
| 3 | keyboard resize | three ArrowLefts = exactly 3 × 24 px; `aria-valuenow` **and** `aria-valuetext` match at every step; Home 360, End 1098 |
| 4 | both fullscreen flavours | API path with `fullscreenElement === wrapper`; overlay path **with `fullscreenEnabled` forced false**, the real iPhone condition |
| 5 | refresh | marker gone (a real reload), **0** `src` mutations, `history.length` 2 → 2; control: a deliberate `src` write gives 1 mutation and 2 → 3 |
| 6 | the live region | **verified for the first time in this migration** — present and empty at first paint, and a **repeated identical message produced two DOM writes 17 ms apart** |
| 7 | all three "Copied" confirmations | popup stays open (`open=1`) and the text swaps, including the agent prompt that had never been measured; control: the width preset dismisses (`open=0`) |
| 8 | install start-truncation | at 390 px, `scrollWidth` 223 vs `clientWidth` 145; visible text `nui/pro/dashboard-01` vs `nui/pro/dashboard-02`; control: not truncated at 1440 px |

## PROOF #5 is FALSE, and is declared rather than fixed

`/previews/dashboard-01` answers 200 on both origins. `/previews/dashboard-01/` answers 200 on
production and **308 → 200** on ours. Both forms are already declared in `vercel.json`; the redirect
is Next's internal trailing-slash rule, which runs ahead of platform rewrites, and no `vercel.json`
key reorders those phases. The only `next.config` remedy removes the trailing-slash redirect from
**all** routes.

Impact measured, not assumed: the document pro serves at `/previews/dashboard-01` contains **zero**
URLs ending in `/` — every asset reference is the absolute non-slash form, and one was fetched
through our preview and returned 200. Our own iframes use the non-slash form, ported from production.

## Two undeclared differences the verification found

**A — the bare `h1`–`h6` tracking rule. FIXED (`24623e3`).** The design document drops the global
rule on the stated assumption that the chrome's headings carry their own spacing class. That is false
for exactly three elements — the category card's `h3`, the block card's `h2`, and the badge that
inherits from it — which rendered 8–13% wider. Fixed on those two elements; no bare heading selector
was added, so the recorded decision stands.

**B — the dark-mode chrome background. NOT fixed, and NOT a §17.6 row.** Production carries a
second, chrome-only token at `oklch(8.5% 0 0)` = rgb(2,2,2) that `--color-background` points at; the
port keeps only the design system's `--background` = rgb(10,10,10). `--background` itself and all
sixteen other theme tokens match on both origins in both themes — only the redirect is missing.
Verified three ways including a pixel readback from the captured PNGs. It predates this stage,
touches every route in dark mode, and **nobody chose it**, so it is on §22's cutover checklist as
**row 8, a decision rather than a tick**.

## Not verified, and named as such

No screen reader was driven — only the live region's DOM mechanics. The iOS fullscreen path was
simulated by forcing `fullscreenEnabled` false rather than run on an iPhone. The *reason* the
`pointer-events` suppression exists (an iframe swallowing `pointermove`) was not reproduced, only the
suppression itself. The full promise — **a category added to the manifest appears without a
rebuild** — is Stage 11's against production (§17.1), because it needs a real manifest change.

## Open thread into Stage 9

§17.6 **row #3** — the 17 block pages still declare a 404 `og:image` — is **not this stage's**. The
pages point at a card that does not exist until the OG route ships. Stage 9's Definition of done
already enumerates every non-docs route.

## Verdict

**Stage 5 is complete.** Seven planned tasks plus two unplanned ones (the §17.2 extractor repair that
had to precede everything, and the heading-tracking fix the verification surfaced). Every task passed
review; five needed one fix round, one needed two, one passed first time. The capability the
migration was undertaken for is live on the preview and measured: 24 routes on a 300-second window,
a 404 rather than a 500 on every miss shape, and the manifest fetched once for the whole section.
