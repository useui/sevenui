# Stage 2 — Docs content pipeline and inline demos

Branch `feat/blume-to-nextjs`. Gates re-derived at `b704f58`; the four fix commits below land on
top and the numbers here are the **post-fix** state at `d90efc3`.

Evidence: `.superpowers/sdd/2026-09-19-blume-to-nextjs/stage-2-gate-sweep.md` and the ledger
`progress.md`. This file is the record, not the report.

## Proof obligations

| # | Obligation | Verdict |
|---|---|---|
| 1 | nested demo context module (no generated 137-entry thunk map) | **DISCHARGED** — `button/button-demo`'s own markup read out of static HTML (`data-sevenui-example` wrapper containing the real `<button data-slot="button">`), not an empty pane. Fallback unused. |
| 2 | `@shikijs/rehype` under Turbopack (no async RSC `pre`/`code` override) | **DISCHARGED** on real prerendered HTML: fence `class="shiki …"`, `rehype-slug` ids, autolink **wrap** shape, GFM tables through the Task 2.4 overrides, `target="_blank" rel="noopener noreferrer"` on the one external link and not on internal ones. Fallback unused. |

## Automated gates

| Gate | Result |
|---|---|
| 68 routes statically generated | **PASS** — 67 `.html` under `docs/` + `docs.html` (a sibling, not a child) = 68; cross-checked against 68 `.mdx` sources and 68 prerender-manifest entries |
| Five content kinds render | **PASS** — 311 `p`, 101 `table`, 282 `pre`, 137 demos, 67/68 install bars (one page has no install block; that is §17.6 #7 exactly) |
| Content index counts | **PASS** — **68 pages / 509 headings** (249 h2 + 260 h3), from a real run of the real modules |
| Toggle duplicate anchors | **PASS** — `examples` and `examples-1` both present |
| **Heading anchor IDs (hard gate)** | **PASS, EMPTY DIFF** — compared on **all 68** routes against production, not the three sampled; **0 mismatches** |
| Nav Primitives = live sidebar's 65 | **PASS** — set-, order- **and** label-identical; empty diff with a positive control |
| "exactly once" assertion in the build path | **PASS** — traced `generateStaticParams` → `getDocIndex` → `readAll` → `nav.ts`; shown to throw on both `found 0` and `found 2` |
| Forbidden-construct + JSX-tag assertions | **PASS** — both failed a real `pnpm build` (exit 1) on a deliberate violation and were restored byte-identically |
| Element map closed | **PASS after fix F3** — failed initially on two raw `<kbd>`; see Fixes |
| `blume-*` names | **PASS after fix R1** — 0 in shipped CSS. The literal `grep -c blume globals.css` is **4**, all inside comments, **0 outside** (comment-stripped, with an injected positive control). The DoD line's wording is the defect, not the file; §17.6 #5's contract is names *in effect* |
| `pnpm check:registry` | **PASS** — 67/137/40 unchanged |
| `pnpm test` | **PASS** — 571 (525 registry + 46 presets), unchanged |
| `/r/*.json` byte-identity (§17.4) | **PASS** — built `main`'s `/r` from a read-only worktree: **exactly 3** files differ, no fourth, no "Only in" lines, metadata identical. The three are the §17.6 #29 demos. *(Correction: each diff is **two** lines, the directive plus its blank separator, not the "one line" #29 says.)* |
| Link validator fails the build | **PASS** — exit 1 at `lib/docs/links.ts:84` with the correct line number; all five failure branches throw, all three valid cases pass |
| `calendar-range` two months | **PASS** — 2 month grids (June/July 2026), container `flex flex-col gap-4 md:flex-row` |
| Overlays cover the viewport | **DEFERRED TO PREVIEW** — runtime; cannot be measured from static HTML. Statically confirmed that no demo wrapper reimposes a containing block; the single `contain: layout paint` is `sidebar`'s documented opt-in on 1 of 65 pages. "Before" numbers are in `measured-overlay-before.json` |

## §17.2 extractor diff — production vs local, triaged

Run on `/docs/components/button` and then corpus-wide. The flight-payload trap was cleared with a
real positive control (92 `$L` / 82 `$undefined` in the raw HTML, **0** in the extracted fields).

Every difference mapped. Rows produced here as expected: **#4** (five links root-relative — the
corpus now has **0** absolute same-origin links), **#5**, **#7** (67 pages), **#8**, **#9**, **#10**,
**#17**, **#20**, **#29**. Differences owned by other stages and correctly absent here: the
sidebar / TOC / pagination / page-actions rail / breadcrumb (**Stage 3**), the search affordance
(Stage 7), `/account` (Stage 6), and `#blume-content` → `#content` (Stage 1). No unexplained residue.

## Regressions found and FIXED in this stage

| # | Finding | Fix |
|---|---|---|
| F1 | the frontmatter `description` rendered **nowhere** — production shows it as the lede under the `<h1>` on 68/68, this build emitted it only to `<meta>`/og/twitter/RSC. Root cause: Task 2.5's plan skeleton never had it | `5dd81b5` — lede now on **68/68**; em dashes inside `<article>` rise by exactly **8**, the four descriptions that contain one, which is what proves it renders once |
| F2 | SmartyPants transforms lost — Astro ran them, the locked chain did not | `c5bdc1e` — `remark-smartypants` after `remark-gfm`. Census now matches production: `’` 81, `“`/`”` 7/7, `…` 11, straight `'` and `"` **0**, em/en dashes unmoved. Fenced and inline code byte-identical before/after |
| F3 | two prose `<kbd>` (`number-field`, `toast`) rendered unstyled; the closed-map assertion structurally cannot see them (`JSX_TAG` is uppercase-only) | `d90efc3` — as a CSS element rule, **not** a 13th override: MDX flags an author-typed tag `_mdxExplicitJsx` and deliberately never routes it through `_components`, so an override would have been dead code. Verified: both prose keycaps styled, all 8 keycaps inside the `kbd` demo excluded and keeping the registry's own styling |
| R1 | `blume-nav-open` and `blume-drawer-top` survived in the **shipped CSS** (8 dead rules) — Tailwind's scan reading the quarantined `.astro` sources as text | `d90efc3` — `@source not` on `legacy-components` and `legacy-pages` |

## Differences with NO §17.6 row — awaiting the human's ratification

Each is a consequence of a decision the locked spec already made; none is fixable without
contradicting the spec. Proposed as **#30–#34**.

1. **The site footer now renders on docs pages** (production docs has **0** `<footer>`, ours 1).
   §11.1 explicitly assigns the footer to `app/layout.tsx`, i.e. every route.
2. **Inline demos add headings to the host outline** — 16 extras on 5 routes, one carrying a
   deterministic generated id (`command`'s `<h2 id="base-ui-_R_…">`). The unavoidable consequence of
   §7's iframe removal; fixing it would mean editing `packages/registry`, which §19 walls off.
   Authored anchor IDs are untouched (the hard gate above is empty on all 68).
3. **The code-block language label** changed from an icon to visible `TSX`/`Bash` text — measured
   deliberately in Stage 2 (`measured-lang-icons.json`), not a discovery.
4. **Preview/Code tab labels now ship in static HTML** where production injected them client-side.
5. **"Edit on GitHub" is repaired.** Production's link — which §15.10 and the plan both specify —
   points at `…/edit/main/docs/<slug>.mdx`, and **all 68 are broken**: the corpus lives at
   `apps/web/docs/` on `main`. The port emits the working path. Lands in Stage 3 with the rail.

## Hand-reviewed routes

**None yet — Stage 2's preview verification has not run.** The branch was unpushed for the whole
stage, so no deployment carried a docs route. The mandatory overlay check (§17.3, §17.6 #10 — a
Dialog, Sheet, Drawer and Command palette opened *inside a demo*, each confirmed to cover the
viewport) and the package-manager bar / stored-choice / `sidebar`-demo checks are outstanding.

**Verdict: the automated half of Stage 2 PASSES.** The stage is complete in code; its preview
verification is carried forward and must run before the cutover.
