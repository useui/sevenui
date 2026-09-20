# Stage 7 — Search palette and its index

Branch `feat/blume-to-nextjs`, HEAD `20a538d`, pushed. `main` untouched, no PR.
Preview: `sevenui-git-feat-blume-to-nextjs-oguzhan-yilmaz.vercel.app`. **112 routes** — 111 plus the
`/search-index.json` asset route, all static.

One of §19's two **forced redesign exceptions**. Blume's 866-line Orama dialog is not reproduced; the
replacement is what `theme.css` was already fighting with `!important` to reach, and those four
overrides are deleted in the same stage.

## Commits

```
3f9aeda feat(web): build a 383-entry docs search index                        (7.1)
c330f7f feat(web): rebuild the search palette on the command primitive        (7.2)
20a538d docs(spec): declare §17.6 #44 — the palette is absent from static HTML
```

## Definition of done

| Item | Result |
|---|---|
| The index is 382 entries (383 with `/docs/components`) | ✅ **383 = 69 pages + 314 headings**, measured on the deployed asset, matching the plan's own arithmetic (509 h2/h3 − 195 generic = 314) |
| ~30 KiB gzipped | ⚠️ **32.6 KiB** (33,389 bytes; 138,924 raw). Ruled acceptable — see "The size, and why 113 KiB was the wrong number" |
| Fetched on first open | ✅ **0 index requests after a full page load to `networkidle`; exactly 1 after the first `⌘K`** |
| All six Popular routes carry a literal `/docs/` prefix | ✅ all six, asserted at build time *and* read off the rendered empty state |
| Every row of Task 7.2 Step 7's table passes | ✅ **15 of 15 checks**, run against the live preview |
| `⌘J` is not bound anywhere | ✅ pressing `⌘J` opens nothing; the string appears in 0 of 110 prerendered pages |

## §21.2, stated plainly: this surface has no automated gate

§21.2 names it as one of §17's three blind spots — *"§9.3's matcher and index are invisible by
construction"*: the 136 KiB index is none of §17.1's four inventoried surfaces, the palette renders on
no route, and Blume's dialog is gone so **there is no old side to diff against**. Nothing here is a
differential gate. The checks below are the hand checks from the plan, executed rather than clicked so
the evidence outlives the session (`pw/stage7-palette.mjs`, results in
`stage7-verify/stage7-palette.json`).

## The nine hand checks — 15 assertions, 0 failing, 0 console errors

| # | Check | Result |
|---|---|---|
| 1 | `⌘K` twice | ✅ opens, then closes |
| 2 | `/` in the page | ✅ opens |
| 3 | `/` inside the search input | ✅ input reads `but/ton` — types a slash, does not re-open |
| 4 | Query `button` | ✅ `/docs/components/button` is **row 0**; the first heading on that page is row 2 |
| 5 | Query `with icon` | ✅ `/docs/components/badge#with-icon`, navigated **cross-page**, landing at **72px** from the viewport top against a header bottom of **64px** — i.e. exactly Stage 1's `scroll-padding-top: 4.5rem`, clear of the sticky header |
| 6 | Query `installation` | ✅ 12 rows, `/docs/installation` first, **0** rows ending `#installation` |
| 7 | Empty state | ✅ exactly 6 Popular links, all `/docs/`-prefixed, no "Ask AI" group |
| 8 | Section pills | ✅ three separate assertions — see below |
| 9 | Index fetch | ✅ 0 on page load, 1 on first open |
| + | `⌘J` | ✅ bound nowhere |
| + | Matrix | ✅ 390 and 1440 × light and dark, palette open with results — `stage7-verify/palette-*.png` |

**The plan's check 5 names a query that does not exist.** The corpus has `With icon`, singular
(`/docs/components/badge#with-icon`); `with icons` returns three weak body hits and no heading rows.
The check's *intent* — a heading entry deep-links to `route#slug` and lands below the sticky header —
is unaffected and was run with the string that exists.

### Two checks that would otherwise have measured nothing

**Check 6's counter-case.** "Does not flood with 67 results" passes trivially against a 12-result cap,
so the cap would have been credited for the ladder's work. The run therefore also measures the pool it
is beating: **66 page entries carry `installation` in their body text**, and the ladder is the only
reason `/docs/installation` outranks all of them. Without that number the check is a tautology.

**Check 8's three properties, which need three queries.** The first draft asserted "pills absent on
`accordion`" and failed — correctly, because `accordion` spans two sections and the pills *should*
render. The query that tests the threshold was then chosen **against the built index rather than
guessed**: `questionnaire` is one of only two queries in this corpus whose whole match pool lives in a
single section.

| | Result |
|---|---|
| 8a — hidden below two sections | ✅ `questionnaire`: 7 rows, **0 pills** |
| 8b — shown across two | ✅ `installation` → `All 67 / Primitives 65 / Docs 2`; `accordion` → `All 5 / Primitives 3 / Docs 2` |
| 8c — counts **distinct pages**, not entries | ✅ `accordion` renders **9 rows across 5 distinct pages**, and the pills read **5** (3 + 2). An entry-counting implementation would have printed 9 |

## §17.2 — three tiers, and why one of them is not ours-vs-production

`stage7-gate.mjs`, 109 routes fetched from both origins. **`/docs/components` is skipped by name** —
§17.6 #26 makes it ours-only, production 404s it, and the extractor would be diffing a real page
against a 404 body. It is counted in the output rather than trimmed from the input: a route silently
missing from a gate's list is indistinguishable from a route that passed.

**Tier 1 — Stage 7's own surface, every route: 108/108, 0 failing.**

- `Search⌘K` present on **both** sides of all 108;
- the closed dialog's run `Esc↑↓navigate↵open⌘Jpreview` present in production on all 108 (so the
  subtraction is never a no-op) **and absent from ours** on all 108;
- Stage 6's `Signin` still on both sides of all 108.

**Tier 2 — exact text, heading and link equality with production, minus the one owned run: 26/26,
0 failing.** The 24 `/blocks` routes and `/pro` are **byte-identical** in extracted text; `/account`
carries exactly §17.6 #13's declared footprint (730 → 881 characters, nothing removed).

**Tier 3 — the other 82 routes are gated against *ourselves*, not production, and that is the point.**
§17.3 reviews only the routes a stage touched, and docs/gallery/landing routes already carry ~30
intended diffs from Stages 1-6 (#1, #4, #7, #22, #31, #32, #34, #35, …). Re-deriving that ledger here
would re-bless the earlier stages rather than measure this one. So `stage7-delta.mjs` asks the question
that belongs to Stage 7: **ours-now against ours-before**, using the post-Stage-5 capture of our own
HTML — taken before Stage 6 and Stage 7 touched the header.

> **83 routes, 0 failing.** Removing exactly one `Search⌘K` and one `Signin` from today's extracted
> text reproduces the post-Stage-5 text **character for character** on every route.

That vintage is a feature: the run has to account for precisely two insertions across two stages, and a
third difference anywhere would fail. Each run is removed **once**, not globally, so a duplicate
trigger (one rendered into the drawer, say) survives the strip and fails.

**Both tiers were given positive controls.** Dropping `Search⌘K` from the expected set fails **83/83**;
replacing it with a near-miss `Search⌘X` fails **83/83** and reports the missing run by name. Each
failure names the exact character index at which the two sides diverge — a boolean that cannot point at
the byte it disagreed on is not a diagnosis.

## §17.6 rows

- **#11** — search results deep-link to a heading anchor; a new static index asset appears. Landed:
  `/search-index.json`, 383 entries, and check 5 above is the deep link.
- **#44** — **new this stage.** The palette's markup is absent from the static HTML and `⌘J` is bound
  nowhere. This is the row that **retires half of the owned text run** Stage 5 opened and Stage 6
  halved: `Search⌘K` is now a positive assertion on both sides of every route, and only the closed
  dialog's chrome is subtracted from production's side. The remainder is permanent rather than debt —
  `Search.astro` server-renders its whole dialog into every page, §11.4 puts ours behind a dynamic
  import, §9.5 drops `⌘J` — so it belongs in the spec rather than living on as a gate constant.

## The size, and why 113 KiB was the wrong number

Deployed asset: **138,924 bytes raw / 33,389 gzipped**, against the plan's 113 KiB / ~30 KiB. The
arithmetic closes exactly, and it closes on the plan's side:

- **Body text totals 80,402 characters** — and §9.3 independently states this corpus carries
  *"81 KiB of body text"*. The reducer is at or just under the spec's own measurement of the same
  quantity, so that half is right.
- **The body-free index is 56.4 KiB raw / 7.1 KiB gzipped**, against §9.2's claimed 31 KiB / 5 KiB.
  The whole overshoot lives here, and the reason is structural: §9.2's figure describes **Blume's**
  index — 68 page documents, **no heading entries at all** — while ours carries 314 heading entries at
  ~120 bytes apiece, ~37 KiB before a single page entry exists. 113 KiB is unreachable under the entry
  shape §9.1's heading entries require.

The levers that would close it are the entry shape, not the reducer (dropping `section` from heading
entries, ~8 KiB raw; interning `route` into a page table, ~10 KiB raw), and both are nearly free after
gzip. One lever was **refused**: dropping GFM table rows takes the body to 65,393 characters and the
total to ~124 KiB, but the prop tables are where `hiddenUntilFound`, `swipe-direction` and
`disablePointerDismissal` live — the selective vocabulary §9's own measurement says this corpus is
starved of.

## Named differences from production, none of them gate-visible

1. **The palette's own chrome is a redesign, not a port** (§19). Rows land on the primitive's
   `rounded-lg` (10px) where production drew `rounded-blume` (12px); the shell is `rounded-xl`, which
   in this theme is 14px. −2px on rows, +2px on the shell, against a component that no longer exists.
2. **The backdrop scrim, the group-label styling, query-reset-on-close and the initial highlight**
   come from the registry's `Dialog`/`Autocomplete` rather than from bespoke markup.
3. **The first `⌘K` on a cold cache shows nothing for one round trip.** Production's dialog markup was
   already in the page; ours cannot be, because §11.4 requires the palette and its matcher out of the
   header chunk and a fallback that drew the shell would put the shell back in it. Declared here rather
   than fought; it is §18's territory, not §17's.
4. **The `error` string is ported although the parity reference filed it dead.** Blume's provider errors
   cannot occur in a static build; ours fetches 136 KiB over the network on first open, so the path is
   live, and reporting a failed fetch as "No results found." is a *wrong* answer rather than an
   unavailable one — the same argument §17.6 #43 made about `/account`'s inert retry.

## Measured for Stage 11's performance record

`/search-index.json` is served with **`cache-control: public, max-age=0, must-revalidate`** (`x-vercel-cache: HIT`).
The first reviewer predicted this before it was measured. It is **left as it is**: the URL is not
content-hashed and the index changes on every deploy, so a longer `max-age` would serve a stale search
index after a cutover. The cost is one conditional request per session, answered 304. The fix for
*that* — a content-hashed asset URL — is §18 work, not §9 work.

## Proof obligations

None, per the plan.

## Deferred minors, carried to the final whole-branch review

1. `search-index.ts` — nested JSX leaves the outer tag in body text; `[^\n<>]*` cannot span an inner
   match. 8 occurrences (`bubble.mdx:30`, `toolbar.mdx:86-88`, `navigation-menu.mdx:75`). Named in the
   reducer's own docstring rather than claimed absent.
2. `search-index.ts` — 46 list-marker lines leave stray `- ` tokens in 7 page bodies.
3. `search-index.ts` — `MARKDOWN_EMPHASIS_MARKER` strips `_`/`*` word-internally, so a future
   `snake_case` prop name would become unsearchable by its real spelling. Zero occurrences today.
4. `scorer.ts` — the excerpt can be windowed on a field that scored nothing: `firstMatchIndex` returns
   on any single token while `scoreField` requires all of them.
5. `scorer.ts` — overlapping occurrences of the whole-query needle are not all marked (`banana` under
   `ana` renders `b[ana]na`).
6. `scorer.ts` — segments and excerpts are built for every hit, not the twelve that render; a
   one-character query builds 297 windows and discards 285. Measured at ~0.1 ms.
7. `command-dialog.tsx` — no `AbortController` or timeout on the index fetch; a request that hangs
   rather than settling pins the palette at `…` until a reload.
8. `command-dialog.tsx` — four states exist where `statusRef` is terminal but `status`/`entries` never
   catch up; every one requires `mountedRef` false while state and refs survive, i.e. React's
   `<Activity>`/offscreen effect-detach. No `<Activity>` exists in `apps/web` today.
9. The lifecycle model that proved the Critical fixed lives in a session scratchpad, not the repo, so
   it is not re-runnable evidence for a later reviewer. §21 already records that this surface has no
   automated gate.
10. `pnpm-lock.yaml`'s `apps/web` → `@base-ui/react` importer edge is **hand-written**, not
    pnpm-generated — pnpm 12.0.0 wrote a dangling one. Correct today by five independent measures;
    worth a glance the next time pnpm and Base UI move together.
