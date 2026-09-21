# Stage 11 — Parity gate, performance record, cutover preparation. Verification record

Branch `feat/blume-to-nextjs`, HEAD `49ae775`. `main` untouched, no PR, nothing merged. Seven
commits:

```
6445398 docs(spec): declare §17.6 #45 and #46, and date every manifest-derived number
d0d2e54 refactor(web): stop prose from emitting dead CSS rules                        (11.0b)
e950df5 test(web): record the Stage 11 differential gate over all 109 routes          (11.1a, 228 files)
01e5a86 docs(spec): record what Stage 11's gates measured, and settle every proof obligation
5f63cf1 docs(spec): declare what a human looking at a page found, and strike the premise that hid it
ec260d1 fix(web): restore the heading scale the prose sweep dropped                   (11.1e)
49ae775 test(web): record Stage 11's exact-diff gates, review matrix and performance run
```

**Two deployments, and which gate ran against which matters** (Ruling 109). The style-blind
text/DOM gate ran against **D1** = `2d3c5fa`; the `.static` sweep landed, and every
style-sensitive or byte-sensitive measurement ran against **D2** = `e950df5`, confirmed on the
wire first (`2_pgv_q9qwga4.css` at 221,297 B, `.static`/`.contents`/`.lowercase` absent,
`.blur`/`.invert` present).

Artefacts: `.scratch/blume-to-nextjs/verification/gate/` — `inventory.json`, `routes.txt`,
`old/` 110 + `new/` 110 extractions, `triage.json`, `anchors.json`, `antivacuity.json`,
`negative-paths.*`, `registry-gate.json`, `jsonld-sweep*.json`, `step5-iframe-srcs*.json`,
`rows-sweep.json`, `perf/`, `review/`, the Stage 8 and OG re-run logs, `scripts-11.2/`. The eleven
gate scripts are `task-11.1-*.mjs` under `.superpowers/sdd/2026-09-19-blume-to-nextjs/`.

## Inventory arithmetic — generated, never transcribed

`node scripts/route-inventory.mjs` → docs **69** / gallery **11** / blocks **24** / standalone
**5** / notFound **1** = **110**.

The gate asserts the arithmetic the generator computes — five disjoint arrays summing to `total` —
rather than any number written down (Ruling 99). The plan predicted 104; the delta is **+6 and
entirely the pro manifest** (blocks 18 → 24 = 1 index + 4 groups + 19 categories), nothing
attributable to §11.3 or §10. The live manifest, re-parsed independently by two agents on
2026-09-21, agrees: **4 groups / 19 categories / 113 items / 46,487 B raw**, and 1 + 4 + 19 = 24
matches the inventory's own path. `inventory.json` is the single surface every gate here asserts
itself against, `og-sweep.mjs --inventory` included.

## Route → diff → §17.6-row triage

**109 routes compared** (`/docs/components` skipped by name — §17.6 #26, no production side — and
counted). **`/404` included**, which no earlier text-diff gate had done. **706 text hunks, 24
whitespace-only, 2,765 differences across 17 classes, 0 unmapped.** Source: `triage.json`.

| §17.6 row | routes | hits | | §17.6 row | routes | hits |
|---|---|---|---|---|---|---|
| #44 search dialog chrome | 109 | 109 | | #10 inline demos | 61 | 151 |
| #5 `#blume-content` → `#content` | 109 | 109 | | #15 gallery | 11 | 43 |
| #32 | 77 | 322 | | #31 | 5 | 16 |
| #30 docs footer | 68 | 1,290 | | #4 | 2 | 5 |
| #34 | 68 | 136 | | #35 prev/next | 2 | 4 |
| #26 `/docs/components` links | 68 | 68 | | #29 | 2 | 3 |
| #22 breadcrumb | 67 | 199 | | #45 `/404` chrome | 1 | 33 |
| #7 | 67 | 136 | | #13 | 1 | 4 |
| #33 Preview/Code pairs | 65 | 137 | | **total** | | **2,765** |

The per-route assertions carried on top of the diff, and the checking of the gate itself, are set
out in the closing characterisation quoted at the end of this record and are not restated here.
Two measurements that are not in it:

- **Determinism, over the whole surface rather than one route.** A re-fetch 1 h 28 m later moved
  **24 of 110** of our HTML documents byte-wise while all 220 extractions, `triage.json` and
  `anchors.json` came back byte-identical — the extractor proving stable across real byte-level
  churn, which beats an unchanged summary over unchanged input.
- **The poisoned-corpus figure is 6/6 in its final shape.** The ledger also records 4/4 at first
  report and 15-groups-against-14 in round 2, once three previously invisible assertions were
  pushed into `unmapped`; they are three harness generations measuring different things, and the
  last is current.

**Four instrumentation findings are parked, unfixed and reproduced** (Ruling 128): `REQUIRED_BOTH`
unpinned at `gate.mjs:58`; N11's own sweep counting 7 `.every()`/`.some()` sites where there are
15, 2 of them unpinned and verdict-feeding; N12's two evasions (a comment-only mention, and
`process.env` entry points — already true of `negative.mjs` and `antivacuity.mjs`); and N4/N5/N7.

## Anchor IDs

**EMPTY.** 68 docs routes, **509** published IDs, sequence-identical, 1 generated ID excluded by
rule. `anchors.json`, whose `positiveControl` object is the reason the empty result means
something — it records not just the detection but the two ways a weaker control would have hidden:

```json
"method": "our IDs re-slugged with '_' for '-', then the same comparison",
"routesDetected": 68, "routesImmovableByThisSwap": [],
"routesWhereTheSwapChangedIdsAndWasStillNotSeen": [], "detectedEveryMovableRoute": true
```

Hardened twice: the gate's domain is derived from the extractor corpus on disk **and** from
arithmetic across the other four inventory arrays, so a shrunken `inv.docs` cannot silently narrow
it (demonstrated firing at `3 docs routes is not this site's docs corpus`).

## The six negative paths (§17.4)

All six **404**, asserted on the **body** against a declared class, not on the status line.
`negative-paths.txt`.

| path | class | text / h / links |
|---|---|---|
| `/docs/components/definitely-not-a-primitive` | **SHELL_46** | 0 / 0 / 0 |
| `/components/definitely-not-a-component` | REAL_BODY | 475 / 1 / 33 |
| `/blocks/marketing/definitely-not-a-category` | **SHELL_46** | 0 / 0 / 0 |
| `/og/definitely-not-a-route.png` | IMAGE — exempt by name, reason recorded | — |
| `/definitely-not-a-page` | REAL_BODY | 475 / 1 / 33 |
| `/components/field` | REAL_BODY | 475 / 1 / 33 |

Six live siblings answer 200 in the same run, so the deployment does not 404 everything, and both
predicates are cross-applied — real-on-shell false, shell-on-real false, real-on-wrong-page false
— so neither can say yes to anything.

**The two `SHELL_46` rows are a product defect this gate found, declared as §17.6 #46** — upstream
(`notFound()` throws past the Fizz pass into the `<html id="__next_error__">` shell), reproduced
in a pristine four-file app on four Next versions, vercel/next.js **#98954** / **#98295**,
accepted under Ruling 115 because the one-line fix cannot be applied to `/blocks` at all and it
self-resolves upstream. **With JavaScript every one renders correctly; without it those two are
blank**, where production serves a real 404 with no JS at all.

`0 / 0 / 0` is the exact triple `extract-page-features.mjs`'s own CLI guard throws on — **§21's
third blind spot in real output** — and these being 404s rather than 200s is the only reason
§17.4's list reached them. The shell paths are *asserted* to be that shape and attributed to #46,
so the upstream fix landing, or a new family joining them, fails here instead of printing another
six 404s.

## Registry JSON — byte comparison against `main`

`main` built in a **detached worktree** at `origin/main` = `dbe9ee4` (Ruling 100); this
workspace's `node_modules` was never touched. Both sides node 24.20.0 / pnpm 12.0.0 / shadcn
4.19.1. `registry-gate.json`, **5/5**:

```
PASS  fileset.equal               branch 247  main 247  onlyBranch []  onlyMain []
PASS  nonexception.byteIdentical  identical 244  differing 3  unexpected []
PASS  exception.demo/chart-demo.json       directive 1/0  reversesToMain  byteDelta 19
PASS  exception.demo/chart-line.json       directive 1/0  reversesToMain  byteDelta 19
PASS  exception.demo/field-validation.json directive 1/0  reversesToMain  byteDelta 19
```

The three differing files are exactly §17.4's three excepts (#29), and each is **asserted** rather
than skipped (Ruling 107): the `"use client"` directive occurs once here and zero times on
`main`'s, and deleting that one occurrence makes the files byte-identical — 19 B, the encoded
directive and nothing else.

**The two `node_modules` trees really did hoist differently** — 2 top-level entries against 11 —
and the output did not move. That is the answer a file-by-file comparison can give and an
aggregate hash cannot: a hoisting artefact would have shown on all 247.

## Agent fixtures and the OG sweep

| gate | result |
|---|---|
| Stage 8 fixture gate, live preview | **30/30**, 156 URLs fetched, 4 non-200 all named negatives, **0 unintended** — no regression from Stage 8. All 16 built-in control modes fire |
| `og-sweep.mjs --inventory gate/inventory.json` | **45/45 assertions, 51/51 controls** — identical to Stage 9. 109 cards, `swept 109 + notFound 1 = 110`, 0 routes excluded from the card-content law |

`EXPECT_BLOCKS_ROUTES` came from `inventory.json`, never hard-coded (Ruling 58). One control the
mode-controls cannot reach: og-sweep run against the **wrong base** (production) scored **26/45
with 19 FAILs**, exercising the fetch layer.

**Two gates were added because the ones that should have covered them did not.**

- **JSON-LD is read by nothing in this migration** — §17.2's extractor strips `script`, `style`
  and `template`, and `og-sweep.mjs` has one incidental match. That is how §17.6 #18 stood at
  **16** when the answer is **39**. A production sweep of `application/ld+json` and `<head>` over
  all 109 routes confirmed nine rows by measurement: #18's 39, #2's 23, **#3's 23 in size *and*
  shape** (resolved by fetching all 108 production `og:image` URLs, not by counting routes), #14,
  #24, #39, **#41** (8 open on `/blocks`, 2 open + 6 closed on each of the other 23, identical on
  both origins, **0 routes differing** — the row's claim of invisibility confirmed rather than
  assumed), #42, and **#23's first count ever, 91 pages**, every page but the two section roots,
  production 0. `jsonld-sweep*.json`.
- **The iframe `src` check** (Ruling 127), the evidence §20.2 obligation #5 never had: the **113**
  `/previews/*` paths our 24 blocks routes emit are set-equal **per route** against production,
  and **113/113 resolve 200 / `text/html` / non-vacuous**. An element count cannot see a broken
  `src`. `step5-iframe-srcs*.json`.

Both sweeps produced the §21-blind-spot shape *before* it produced a false result, and the paired
non-vacuity assertion is the only reason either was caught: a `\sopen(?=[\s>])` regex reported a
fabricated **0-open-disclosures regression on all 24 blocks routes** (the port writes `open=""`
where production writes bare `open`), and a literal `src` set-equality returned **true comparing
an empty set against an empty set** — neither origin puts a `src` on that iframe.

## The sampled review matrix (§17.3), and what only it could see

**192 matrix views** — 96 comparison pairs (pixel-near 4 routes × 5 widths × 2 themes; sampled 14
routes × 2 widths × 2 themes), 16 overlay measurements, 48 landmark/colour views, 16 `system`
views with 2 live-OS flips, and a **1-px-refined** breakpoint sweep on 5 routes × 2 origins.
`review/`, with 109 production and 109 port screenshots kept.

- **The drawer breakpoint is 1024 px on both origins, and 768 is not a breakpoint at all.** §17.3
  called 768 a guess and required it be measured. A second switch, the "On this page" rail, sits
  at 1280 on both.
- **#10 verified as *changed*, which is the one row that must be:** overlays escaping the frame,
  production **0/4**, port **4/4**; backdrop coverage 0.1489 @1440 / 0.279–0.299 @390 against
  **1.0000**. The control reported `opened:false` once on its own, so it can fail.
- Pixel-near set clean at 2 px tolerance, zero horizontal overflow; 17 §17.6 rows confirmed by
  observation.
- **Per Ruling 105 the pixel-near set was measured and not seen.** The human was away for the
  whole chain; the four-view human look is handed to `sevenui-stage-finish`.

**It found a real visual regression on 69 docs routes that nine stages of text gating could not
see**: the docs `<h1>` at **16 px / 400 / normal** against production's **48 px / 500 / −2.4 px**
— the page title at half the size of the `<h2>`s beneath it — plus `-0.05em` tracking lost on
every heading with no `tracking-*` class. Two rules dropped by one `.prose` sweep; §7.2(d)'s
premise that *"the chrome's headings carry their own classes"* is false, for 7 authored headings
and for registry-rendered gallery headings no `apps/web` class list can reach.
Fixed in `ec260d1`: a `className` on the docs `<h1>` and one rule restored in `@layer base`,
scoped `:is(h1,…,h6):not(:where(article [data-sevenui-example] *))`. Residual heading diffs
**128 → 58 → 3, of 352 paired headings** — the earlier-reported 122 → 52 → 3 is stale because
`cmp.py` keyed rows by `(tag, text)` and `/components/accordion` renders one question three times,
collapsing 19 rows to 16 keys so only the first instance of each was ever compared; the
replacement pairs by Nth instance and also compares height. Stylesheet delta exactly 9
accounted-for changes, second chunk byte-identical, +401 B raw / +65 B brotli. The positive
control has three steps — 16 px pre-fix, 48 px post-fix, **16 px again** after reverting to the
byte-identical baseline stylesheet, 48 px on restore. The 3 residuals are docs-demo `<h4>` widths
and they are #51: the frame loaded no stylesheet, so production's 137 demos draw in the OS font.

Four further divergences came out of the same instrument and became rows rather than fixes —
**#48**, **#49**, **#50**, **#51**. #48 is the consequential one: Ruling 137 reopened Ruling 131
when the matrix showed the dark-theme decision covered **five** aliased `--color-*` tokens and not
the one it had been taken on, `border` among them, inverting from dark-grey-80% to white-10%.

## The `.static` sweep (Task 11.0b, Ruling 109)

**8 dead rules found, 6 removed or narrowed, 2 left deliberately.** 24 files, 40 edits, **all
comment or doc-string text** — established exhaustively rather than sampled: each file parsed
twice with the TypeScript parser and the full leaf-token stream compared, all 24 identical. App
chunk **221,497 → 221,297 B (−200)**, font chunk byte-identical, no non-target rule changed,
verified end to end on the deployed stylesheet and not only at the build step. The set was
**computed** with `@tailwindcss/oxide@4.3.3`'s own `Scanner`, the extractor the build uses, over
the same 294 scanned files; of the controller's 18-word list 2 were dead, computation found a
third the list never named, and 16 were alive.

Left: `.blur` and `.invert` (~431 B) and eleven utility names quoted verbatim in rendered docs
prose (~520 B) — Ruling 129, the docs exist in order to name those utilities. **No §17.6 row for
any of it**: these rules live only in the port's own stylesheet, so their presence is an
intra-branch matter the parity gate could never report.

## Performance (§18, recorded — not a gate)

§18.1's Astro table and the 173 KB floor are intact; the measurement is added, not substituted.
`perf/`.

**Transfer, CDN gzip, KB, Astro → port.** The flight payload is inline in the HTML and is 36–46%
of the port's compressed HTML.

| route | HTML+flight | JS (`<script src=>`) | JS executed, brotli, prefetch off |
|---|---|---|---|
| `/` | 19.9 → **23.7** | 6.8 → 351.4 | 294.8 → **321.6** (1.1x) |
| `/docs/installation` | 21.6 → **30.1** | 12.5 → 655.2 | 27.9 → **631.1** (22.6x) |
| `/docs/components/button` | 23.7 → **35.6** | 15.0 → 655.2 | 121.3 → **723.0** (6.0x) |
| `/docs/components/chart` | 24.8 → **37.0** | 15.0 → 655.2 | 225.6 → **723.0** (3.2x) |
| `/blocks/marketing/hero` | 22.1 → **27.1** | 28.4 → 256.2 | 332.5 → **604.9** (1.8x) |

**The instrument was checked against a known answer before it was trusted**, which is why the
Astro column can be read against §18.1's: it reproduces §18.1 exactly on four of the five shared
rows and differs on the fifth, `/blocks/marketing/hero`, by **0.5 KB of HTML** — 21.6 → 22.1, the
one page in the set whose content is manifest-driven, and the same growth that moved 18 blocks
routes to 24. That confirms the instrument rather than disagreeing with the baseline.

§18.1's prediction of 6–25x holds against the executed-JS reading; through §18.1's own
`<script src=>` method the same routes read 23–44x, an artefact of dividing the port's whole
bundle by Astro's island loader (143 chunks / 272.9 KB behind 7.0 KB on `/`). Both are in the spec.

**Lab INP under a fixed profile (Ruling 106 — neither origin has RUM, so no field metric exists).**
Chromium 153, 1440×900, CPU 4×, nine fixed interactions, five runs, median.

| route | phase A, hydration (Astro / port) | phase B, settled | TBT first 5 s |
|---|---|---|---|
| `/` | 112 / **200 ms** | 64 / **48** | 73 / **192** |
| `/docs/installation` | 80 / **96** | 40 / **40** | 59 / **81** |
| `/docs/components/button` | 88 / **144** | 56 / **40** | 66 / **139** |
| `/docs/components/chart` | 96 / **288** | 48 / **40** | 114 / **290** |
| `/blocks/marketing/hero` | 104 / **168** | 64 / **48** | 62 / **192** |

The whole regression lives in the first second: **settled INP is 40–48 ms port against 40–64 ms
Astro — the port wins or ties on all five.** §7.1 is not reopened, and the 500 ms phase-A
threshold was set before the measurement rather than after (chart 288, button 144).

**Build time: the port is faster.** Cold **18.7 s against 23.26 (0.80x)**, warm **6.0 s against
23.80 (0.25x)**, same machine, both emitting all **227** prerendered pages.

And the number §18 has owed since Stage 5: `prefetch={false}` on the component wall's 66 links
would save **438.8 KB and 67 requests, zero JavaScript** (948.8 against 948.9 KB — the header's
own `/docs` link already prefetches the same chunks) and no TBT. But the wall is below the fold —
1 of the page's 77 `/docs/components/*` anchors is in the initial viewport at 1440×900, and it is
the header's — so it costs **0 KB without scrolling**. Left on. Stage 5 declined to add it "on the
strength of a number nobody has measured"; the number now exists and says Stage 5 was right.

## §17.6 reconciliation — 51 rows

The table entered this stage at 44 and leaves at **51**. Added: **#45** (`/404` gains the site
chrome), **#46** (`notFound()`'s empty static body), **#47** (the `/previews/x/` 308 — a row
Ruling 21 ordered five stages ago and nobody collected), **#48**–**#51**. Widened: **#5**, to name
`#blume-content` → `#content`, the one gate-visible member of the `blume-*` set (109/109), and
**#10**, to its real load of 151 runs of inline-demo text on 61 routes. §13.3's claim that the
rename "costs nothing at the gate" was false and is corrected in place; §7.2(d)'s premise is
struck in four places. Every manifest-derived number in the spec is now dated, owner-cited or
marked historical — 22 sites across three derivations.

**The table has two classes of row and nothing in it marks them** (Ruling 136), so the
classification is stated here and in the PR body, enumerated so it can be re-derived:

- **19 rows** carry an explicit 2026-09-21 measurement in the row's own text: #2, #3, #5, #14,
  #17, #18, #19, #21, #23, #24, #39, #41, #42, #44, #46, #47, #48, #49, #50.
- **7 rows** state a measurement with no date: #9, #10, #12, #32, #40, #45, #51.
- **24 rows** carry neither: #1, #4, #6, #7, #8, #11, #13, #15, #16, #20, #22, #25, #26, #27, #28,
  #29, #30, #31, #33, #34, #35, #36, #37, #43.
- **#38** is a spec text defect, not a site diff. 19 + 7 + 24 + 1 = **51**.

Un-measured is not un-verified — most were verified in the stage that created them — but a reader
cannot tell which is which, and **#18 is the standing proof**: 16 where the answer was 39,
through two sweeps, caught only by reading what production emits.

## §20.2 proof obligations — all seven reconciled

| # | verdict |
|---|---|
| 1 | DISCHARGED — nested demo in prerendered HTML; the thunk-map fallback was not taken and is not owed |
| 2 | DISCHARGED — chain verified on real prerendered HTML |
| 3 | DISCHARGED (Stage 5) — confirmed by an actual build failure; the flag string lives in the **SWC native binary**, which is why the plan's `next/dist` grep was never going to answer it |
| 4 | DISCHARGED 2026-09-19 — already in the spec |
| 5 | **FALSE, declared** — found in Stage 5 (Ruling 21), sized in 11.2 at 113/113. There is **no `vercel.json` fix**: both forms are declared, and the 308 is Next's internal trailing-slash redirect in the redirect phase ahead of the rewrites. Now §17.6 #47 |
| 6 | DISCHARGED — Stage 10 Task 10.1's five-page proof, with a clean-machine second leg leaving `pnpm-lock.yaml` byte-identical |
| 7 | DISCHARGED with a **non-expiring** caveat — 5 errors → 0, no suppressions, one of the five a real pre-existing bug; `skipLibCheck: true` must not be dropped quietly |

## Test and check counts

| command | result |
|---|---|
| `pnpm -r typecheck` | clean across all three workspace packages |
| `pnpm check:registry` | `ok (67 ui, 137 demos, 40 components)` |
| `pnpm test` | registry **525/525**, presets **46/46** |
| `pnpm --filter @sevenui/web build` | **227/227** routes, 0 errors (four clean builds this stage) |
| `pnpm test:smoke` | `Smoke test passed.` |
| `node scripts/route-inventory.mjs` | **110** (69 / 11 / 24 / 5 / 1) |

## The cutover checklist, with its ticks

Walked row by row against the repository, not against a context table (Task 11.5).

| # | item | verdict |
|---|---|---|
| 1 | §20.3's three pre-cutover commits on `main` | ✅ `merge-base` = `dbe9ee4`; `67730e2`, `61cbf1c`, `865bb77` all ancestors |
| 2 | Vercel framework preset | ✅ **and §22 is wrong about the mechanism** — the preset is **pinned in `vercel.json`** (`"framework": "nextjs"`, `"outputDirectory": null`), not auto-detected. No dashboard change needed |
| 3 | Env var `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ❌ **human action required.** The repo half lands with the merge; the Vercel-project half cannot be done or verified from here, and a missing value is **silent** |
| 4 | `ci.yml` `PRO_MANIFEST_URL` | ✅ `ci.yml:35`, on the build step |
| 5 | Scheduled canary succeeded before merge | ❌ **unsatisfiable, with the cause reproduced.** `git ls-tree origin/main .github/workflows/` returns only `ci.yml`; `gh workflow run` answers `HTTP 404: workflow manifest-canary.yml not found on the default branch`. Both `schedule:` and `workflow_dispatch` resolve against the default branch (Ruling 102) |
| 6 | `vercel.json` unchanged | ✅ on substance, criterion corrected — the diff is not empty (row 2), but `grep -c '"source"'` = **5** and the five rewrite blocks are byte-identical to `main`'s |
| 7 | §20.1's removal condition in the PR body | ✅ quoted verbatim from `theme-provider.tsx:29-30` |
| 8 | Dark-mode chrome — *a decision, not a tick* | ✅ **ACCEPT, declared as §17.6 #48.** Taken twice: once on one token, re-taken on five after the browser matrix. **#5 forbids the alternative** — re-pointing `--color-border` in dark only would fork the design system inside `apps/web`. Light mode is byte-identical |

**Net: five ticks, one decision discharged, one item requiring a human before the cutover is
useful (row 3), one structurally unsatisfiable (row 5).**

Five §22 rows no longer describe this branch and are corrected **in the PR body rather than in
§22** (Ruling 135) — the PR body is what a human reads at the cutover. All five err in the safe
direction: they would make a reader look for work already done, never skip work that is not.

`ci.yml`'s Ruling 98 canary step has **never executed on a GitHub runner** — `ci.yml` triggers on
`push: main` and `pull_request`, there is no PR, and `gh run list` shows zero runs for this
branch. The PR is its first execution.

## The §20.1 bridge

Copied verbatim from the spec, which now carries the sharpened framing:

> **At the cutover gate this is the only item in §20 with no verdict, and it structurally cannot
> have one.** §20.2's seven obligations are all settled and §20.3's three ships are all confirmed
> on `main`; the bridge below is neither discharged nor refuted, because its removal condition is
> a fact about **another repository** that nothing here can read. That is not a reason to soften
> it into "remove later": it is exactly why this is the item most likely to outlive its purpose —
> every other line in §20 has something that will eventually contradict it, and this one has only
> a person who remembers.
>
> | Bridge | Why it exists | Removal condition |
> |---|---|---|
> | The app mirrors the resolved theme into `localStorage["blume-theme"]` on every theme change (~5 lines in an effect), one-way | §8.1 renames the key to `theme`, but the storage key is a **cross-repo contract**: the pro previews are same-origin through the `/previews/*` rewrite and sync over the native `storage` event. Without the mirror, `/blocks` previews lose theme sync between the web cutover and the pro deploy — 24 routes as of 2026-09-21 (§10's count), the site's most hand-tuned surface | **Delete once the pro repo reads `theme`.** A comment at the write site repeats this condition |

Minor, at HEAD `49ae775`: the comment at the write site still says "16 pages" where §20.1 says 24
routes. A repair is in the working tree at the time of writing — it re-derives the figure as a
rule (1 index + 1 per group + 1 per category = **24 routes**, of which only the **19 category
routes** embed previews, so 19 is the bridge's blast radius and 24 the surface it sits on) rather
than transcribing a number. **The removal condition is unaffected either way**, which is the only
part of this row the checklist asks for.

## The post-merge ISR proof — **not run, and it cannot be**

Every step of Task 11.6 needs a merge and a production deploy, both human-gated (Ruling 132), and
Step 2 — **a category added to the pro manifest appears on the site without a rebuild, the entire
reason this migration exists** — needs a real pro-repo manifest change, so it cannot be simulated
even after the merge. **Nothing in this record observes it.** It is written out with its commands,
expected values, failure branches and the deployment ID it must compare against, at
**`stage-11-post-merge-runbook.md`** beside this file; its results belong back here when it runs.

---

# What this stage does not measure

A gate is only honest when it says what it does not measure. Three lists: the spec's standing
exclusions, the spec's declared blind spots, and what Stage 11 learned about its own limits.

## §17.7's exclusions, copied

- **Performance.** §18 is a recorded measurement, not a gate — including every number in the
  performance table above.
- **Font rendering and antialiasing.**
- **Px-level spacing on docs pages**, except the sampled pixel-near routes.
- **OG image pixel identity** — impossible anyway, Takumi against Satori.
- **Anything behind Clerk** beyond "`/account` loads and lists licenses". After the merge, the
  *first* proof that Clerk works on production will be a human signing in.
- **The pro deployment's own pages** — out of scope; only that the rewrites still resolve.
- **Runtime unit tests of `apps/web`'s own logic.** There are none and none are added.

## §21's three blind spots, copied

1. **Nothing anywhere executes §10.2's stale-serve path.** CI is hermetic on the fixture and the
   live signal is a scheduled canary watching the manifest, not the behaviour. Stale-serve is
   **Next's Data Cache semantics, not our code**, so it is not unit-testable in any case. What
   *would* be testable is what it depends on: `parseManifest` is a pure function with **11 distinct
   throw sites**, and its real failure mode is a validation that **silently passes** a malformed
   manifest, after which stale-serve never triggers and a wrong `/blocks` publishes.
2. **§9.3's matcher and index are invisible by construction.** The 113 KiB search index is in none
   of the four inventories, the palette renders on no route, and Blume's Orama dialog is gone, so
   there is no old side to diff against.
3. **§17's own extractors are new untested code** whose worst failure is a **vacuous pass** — an
   extractor returning nothing diffs clean against an extractor returning nothing, which would
   invalidate every other gate at once. §17.6 #46 is that shape arriving in real output.

## What Stage 11 learned about its own limits

The gate's closing characterisation, written by the final re-reviewer and kept **verbatim** from
`review-task-11.1a-fix4-report.md` because it is the honest boundary:

> ### What the Stage 11 parity gate establishes
>
> Across **110 routes** captured from production (`sevenui.dev`) and from the preview deployment,
> with `redirect: "manual"` on both sides so a 308 is a hard error rather than a silently-followed
> hop, every route's **visible text, heading hierarchy with anchor IDs, and link targets** are
> extracted by one shared extractor and differentially compared. **109 routes** are diffed
> (`/docs/components` is new and has no production side, skipped by name and counted). The result:
> **706 text hunks, 24 whitespace-only, 2,765 differences across 17 classes, and 0 unmapped.**
> Every surviving difference lands on a declared §17.6 row; a hunk that matches no rule is reported
> as a regression, not absorbed.
>
> On top of the diff the gate asserts, per route and with zero exceptions on all 109: the search
> trigger and auth pill present on **both** sides; production's `⌘J`-preview run present in
> production and absent from ours; the package-manager block multiplied from production's one
> command to four; **250 production iframes − 137 demo frames = 113, and ours = 113**; and 137
> Preview/Code pairs against 137 framed demos. Site-wide it asserts the prev/next chain
> (68 → 69 routes, `/docs/components` spliced at one position, ours-minus-new identical to
> production, reverse edges consistent both sides), the footer object identical across
> 109 routes, and breadcrumb and pagination cross-checked against production on **68/68** docs
> routes. **Published heading anchors are a hard gate: 509 IDs across 68 docs routes, diff empty**,
> with a positive control (re-slug `-` → `_`) that must light up on every movable route — it
> detects **68/68**, so the empty result means something. Six named negative paths are asserted on
> the **body**, not the status line, each against a declared class, with six live siblings proving
> the deployment does not 404 everything, and with the two body predicates cross-applied so each
> must be able to say no.
>
> **The gate is also checked, and the checking is the unusual part.** Nine entry points are
> enumerated from disk and every one must assert its **domain** before it asserts anything about
> the domain's contents — a truncated or empty route list is a loud throw, not a green run over
> three routes. A **meta-control runs 14 scenarios that each corrupt one thing and require the
> relevant gate to exit non-zero *and to name the specific check under test*** — not merely to
> fail. A poisoned-corpus harness injects six realistic regressions and requires all six to
> surface. Every collection-wide verdict in `negative`, `antivacuity` and the two `gate` sites the
> round-4 sweep reached is paired with a length pin, so no verdict passes by iterating over an
> empty set. Seven distinct "checks that cannot fail" were found and closed over four rounds, each
> by a different reader; the durable lesson is recorded in `task-11.1-domain.mjs`: **a check must
> assert its domain, not only its verdict — and a derived expectation cannot drift from the thing
> it checks, while a typed one eventually will.**
>
> ### What it structurally cannot see
>
> The boundary is not incidental; most of it is deliberate, and the rest is worth naming.
>
> - **Anything in `<head>`.** The extractor reads `document.body` only. `<title>`, meta
>   description, canonical, OG and Twitter tags are outside every comparison here.
> - **JSON-LD, by construction.** The extractor removes `script, style, template` before reading.
>   Structured data is invisible to this gate and always will be; it cannot be added without
>   changing what §17.2 means.
> - **All styling, layout and visual rendering.** §17.2 is style-blind on purpose — the agreed bar
>   accepts px drift and font-rendering differences, so screenshot diffing would manufacture false
>   positives against a bar already set. Nothing here observes CSS, computed styles, spacing, or
>   how anything looks.
> - **Whitespace differences**, by the comparison's own definition: 24 hunks equal-once-collapsed
>   are counted, not triaged.
> - **Every attribute except `href` and heading `id`.** No `src`, `alt`, `aria-*`, `data-*`, `rel`,
>   `loading`, no form control values. Concretely: **the 113 iframes we render are counted, never
>   resolved.** 24 correct-looking tags whose every `src` 404s would satisfy the count exactly as
>   today's do. Production's 137 framed documents *are* fetched and asserted 200; ours are not.
>   A `src`-level check — set-equality of `src` attributes per route, then each distinct `src`
>   requested on our own origin for 200, non-vacuous body, `text/html` — is **specified and not
>   implemented**, and is the check that would prove `vercel.json`'s pro rewrites still resolve.
>   It belongs with Task 11.2's sweeps.
> - **Everything that requires a browser.** The corpus is server HTML; no JavaScript executes.
>   Hydration, interactivity, the search dialog's behaviour, the drawer, focus management, keyboard
>   handling and client-side navigation are all outside it. ISR revalidation behaviour — the
>   migration's whole reason — is likewise not observed by this gate.
> - **A missing inline demo's own text**, because production never had that text in the document to
>   diff against. The standing proxy is #33's Preview/Code pair count (137, per route on all 65).
> - **Routes with no production side.** `/docs/components` is diffed against nothing.
> - **§17.6 #41, #42 and #43**, which exist precisely because no automated check here can observe
>   them, and **#9**, which turned out extractor-invisible in practice (all 151 #10 residuals
>   matched production's frame text contiguously).
> - **The `<head>`-level half of #28** (the 404's title/OG), recognised in the gate's comments so it
>   is reported precisely rather than silently absorbed.
> - **Status codes are asserted at capture time, not at gate time.** `task-11.1-fetch.mjs` checks
>   every route's status on both sides with exceptions allowed by name and exits 1 on a problem;
>   the gate then trusts the corpus that run produced and does not re-assert it.
> - **Two known gate-side gaps carried forward by ruling, not oversight:** N4 (`/404` absorbs any
>   extra link into #45 unconditionally; #26 absorbs unlimited `/docs/components` links), N5 (the
>   poisoned-corpus harness matches an injection by route, so a route that fails for the wrong
>   reason still counts as caught), N7 (the negative gate's predicate cross-check `TypeError`s
>   instead of failing by name if no row classifies), and the round-4 residual in §7
>   (`REQUIRED_BOTH` has no length pin, so its `.some()` verdict could be emptied into silence).
>
> **In one sentence:** this gate proves, with demonstrated-failing controls behind every assertion,
> that the migrated site's **text, headings, published anchors and link graph** are production's
> across 110 routes with every difference accounted for on a declared row — and it proves nothing
> about how the site **looks**, how it **behaves in a browser**, what is in its **`<head>`**, or
> whether the **URLs it points at actually resolve**.

One correction of record against that text, in the gate's favour: the `src`-level check it names
as *specified and not implemented* **was** implemented, in Task 11.2 — 113/113 resolving, set-equal
per route on all 24 blocks routes. Production's 137 frame srcs were already fetched and asserted
200 by `task-11.1-frames.mjs`, so the gap was one-sided and is now closed.

### §17.7's exclusion list turned out to have teeth

The browser matrix found, on its **first run**, a **16 px docs `<h1>` on all 69 docs routes** —
smaller than the `<h2>`s beneath it — together with `-0.05em` tracking dropped from every heading
carrying no `tracking-*` class. Both are invisible to §17.2's extractor by construction: it reads
text, headings and links, and the class strings were byte-identical on both sides. **Nine stages of
text gating could not have found either.**

That is the strongest single argument in this migration for why the sampled visual review was not
optional, and it belongs here rather than in the results: **the thing the gate excluded is the
thing that was broken.** The same instrument then found #48's inverted border, #49, #50 and #51,
which is why §17.6 calls #48–#51 *"the first rows this table owes to a human looking at a page"* —
and why Ruling 105's admission that the pixel-near set was **measured and not seen** stands
unsmoothed.

### Three limits of instruments, recorded because they are transferable

- **A check that cannot fail.** Eleven instances this stage, each introduced or revealed by the
  fix for the previous one. *A check must assert its DOMAIN, not only its VERDICT — an exit code
  hides "did it run" and "did it run over what it says it ran over", and both come back 0.*
- **A control that cannot prove its aim.** Task 11.0b's probe sat in a `.ts` file because the
  instrument read `.ts` files. Three instruments with three implementations shared one blind spot,
  all asking a TypeScript question about a file set containing MDX. Diversity of implementation
  bought nothing; only diversity of **domain assumption** would have.
- **An input capture narrower than what it was used to describe.**
  `measured-docs-computed-styles.json`, from which the whole element map was derived, was taken at
  **one width and with no `h1` in it**; both gaps became shipped defects on the same 69 routes.
  §17.3 now requires captures to be per-breakpoint and to enumerate what the page renders.

And a coverage claim computed from the things it covers is satisfied by missing one: the spec's
manifest-number sweep was falsified **twice** before its verdict was narrowed to what its method
supports — *"it does not certify that no wrong number remains."*

---

## Closing the record against the final deployment (controller)

Measured through a real browser against the live preview of **`49ae775`**, Vercel `success`,
after everything above was already green — the same shape Stage 10's record closes with.

| | production | preview @ `49ae775` |
|---|---|---|
| `/docs/components/button` `h1` | 48 px / 500 / −2.4 px | **48 px / 500 / −2.4 px** |
| same page `h2` | 30 px / −1.5 px | **30 px / −1.5 px** |
| `/` `h3` | 16 px / 500 / −0.8 px | **16 px / 500 / −0.8 px** |

**What makes this worth having is the before.** That `h1` was **16 px / 400 / normal** when the
stage opened, on all 69 docs routes, and no gate in nine stages could see it. The chain closes end
to end on the deployed artefact rather than on a local build: the browser matrix found it,
systematic debugging named the mechanism (two rules dropped by one `.prose` sweep, and §7.2(d)'s
premise false), a task review verified the fix by **reverting** it and reproducing the baseline
chunk byte for byte, and it now measures right on the deployment.

## Verdict

Every gate this stage owns is green with a demonstrated failure mode behind it: 2,765 differences
across 109 routes with **0 unmapped**, the anchor diff **empty** with a control that fires on
68/68, six negative paths asserted on the body against declared classes, registry
**247 / 244 / 3** with each exception asserted rather than skipped, fixtures **30/30**, OG
**45/45 and 51/51**, and the two sweeps added because nothing else covered them.

Two product defects were found here and neither was fixed forward past the gate: **#46** is
upstream, accepted with its self-resolution condition; the heading regression was debugged to its
mechanism, fixed in `ec260d1`, and measures right on the deployment. Seven rows added, two
widened, the table reconciled at **51** with its two classes marked.

**The one thing the cutover exists to prove is not proved here and cannot be.** It is Step 2 of the
runbook.

No `git commit` was run from the task that wrote this record; the controller commits.
