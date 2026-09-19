# Stage 1 — The Next.js shell

Branch `feat/blume-to-nextjs`, commits `1181103..8906f2e` (nine on top of Stage 0's four).
Not pushed at the time of writing. Date: 2026-09-19.

## Proof obligations

| Proof | Verdict | Evidence |
|---|---|---|
| **P1** — Vercel framework preset | **PASS**, no fallback taken | Framework Preset = Other / auto-detect, Root Directory = `apps/web`. Each deployment detects its framework from its own `package.json`, so `main` keeps building Astro while this branch builds Next. No dashboard change was made; §22 gains no teardown row. |
| **#7** — widened tsconfig error count | **DISCHARGED**, no fallback taken | Pre-fix `tsc --noEmit`: **5 errors**. Post-fix: **0**, verified twice, once with `--incremental false` so a stale `tsbuildinfo` could not fake exit 0. The `include` was **not** narrowed; `--listFiles` confirmed `app/`, `components/` and `lib/` are genuinely in the program. No `@ts-expect-error`, `@ts-ignore`, `as any` or widened types anywhere in the diff. All five fixes were source-level. |

The five errors, for the record: `components/landing-showcase.tsx` ×2 (toast calls written
against a nonexistent sonner-shaped API — **a live production bug on sevenui.dev**, since
`createToastManager()` returns an object that has never been callable and never had
`.success`), `lib/clerk.ts` (`import.meta.env` → `process.env`), `lib/pro-manifest.ts`
(`@lucide/astro` → `lucide-react`), `lib/registry.ts` (an explicit `.ts` extension on a
relative import).

## Definition of done

| Item | Verdict |
|---|---|
| `pnpm --filter @sevenui/web build` succeeds, `.next/` gitignored, `public/r/` holds 247 JSON | **PASS** — 247 files counted; `pnpm check:registry` → `ok (67 ui, 137 demos, 40 components)`. Task 1.2's review additionally proved the 247 files **byte-identical** to the pre-change Astro output via `diff -rq apps/web/dist/r apps/web/public/r` (no output, no "Only in" lines). |
| `pnpm typecheck` green across the whole `apps/web` tree | **PASS** — `pnpm -r typecheck`, all three packages, exit 0. |
| `app/globals.css` — zero `blume`, zero `prefers-color-scheme`, ported entries present, dead tokens absent | **PASS** — bare `grep -c blume` = **0**; syntactic `grep -Ec '(--\|data-\|\.)blume-'` = **0**; `prefers-color-scheme` = **0**. |
| `<html>` carries `lang`, `data-theme`, `data-pm`, two font variables; toggle writes both keys | **PARTIAL — static half proven, interactive half deferred.** See "What is not yet proven" below. |
| Header, footer, drawer render on every route; drawer non-modal, `inert` from state, closes past 64rem | **PARTIAL** — same split. |
| `/nope` returns 404 with the real chrome, `noindex`, title `Page not found — SevenUI` | **PARTIAL** — content proven from built output; the HTTP status is deferred. |
| Extractor passes all four anti-vacuity assertions; inventory reports the route count | **PASS** — see below. |
| Task 1.0's verdict recorded | **PASS** — P1 above. |

### Deviation from the stated line count

The definition of done says `globals.css` is "one ~290-line file". It is **392 lines**. The
spec's figure (§8.2, "lands around 290") was already stale at Task 1.3, which landed 349 —
the delta being comments the brief itself mandated — and Task 1.6 added the 22-line
`.pm-only` block. No content is unaccounted for; the number in the spec is what is wrong.

## The extractor's four anti-vacuity assertions (§21.3)

Run against the **live** site, where the answers are already known. Reproduced
independently by the reviewer, not taken from the implementer's report.

| Assertion | Result |
|---|---|
| (a) Non-empty | `ok 10 headings, 114 links`, 4070 text characters |
| (b) Deterministic | byte-identical output on an independent second fetch |
| (c) Discriminating | `/docs/components/button` vs `/docs/components/dialog` differ |
| (d) Anchor IDs captured | **9 of 10** headings carry an ID; the one without is the `<h1>` |

The extractor was then **attacked** with eleven inputs, and three holes were found and
closed. All three are now demonstrated firing with a non-zero exit:

- an empty-bodied but structurally valid page used to extract clean at exit 0 — the exact
  vacuous pass §21.3 names — and now throws;
- the inventory used to accept an empty manifest (`blocks: ["/blocks"]`, exit 0) and an
  orphan category (`/blocks/ghost/c`), where the app's own loader refuses both ten lines of
  code away (`apps/web/lib/pro-manifest.ts:79-81`, `:95-97`); both guards are now ported;
- `fetch` used to follow redirects while labelling the result with the **requested** route.
  Astro serves `/docs/components/button/` with 200; Next's `trailingSlash: false`
  308-redirects it, so a real difference between the two sides would have diffed clean. It
  now refuses to follow.

Happy-path numbers were re-confirmed after the guards landed: unchanged.

## Route inventory

`node scripts/route-inventory.mjs` → **docs 68, gallery 11, blocks 22, standalone 5,
total 107** HTML routes with the 404.

**The definition of done's figure of 101 is wrong and was never reachable** — the brief's
own per-section numbers sum to 103, not 101. The real difference from the spec is the
blocks count: the live pro manifest holds **4 groups and 17 categories**
(`application`, `marketing`, `ai-and-agents`, `ecommerce`), so `1 + 4 + 17 = 22` where the
frozen-contract table says 18. At spec time the manifest evidently held 13 categories.

This is drift in live pro data, not a migration defect, and the plan predicted it in
writing when it justified deriving rather than freezing: *"the `/blocks` count moved from 16
to 18 during the spec effort. A frozen list rots the moment pro ships a category."* The
frozen contract is the route **shape**, which has not changed, and §17.6 #2's criterion is
already URL-set equality rather than a count.

Two spec numbers are therefore stale snapshots: §17.6 **#2** ("the 17 `/blocks` group and
category routes") and **#3** ("the 17 block pages") are 21 today, and the frozen-contract
table's "18 live routes" is 22. **Binding consequence: Stages 5, 8 and 9 must re-derive the
blocks route set from the manifest and must never hardcode 17, 18, 21 or 22.**

Corroboration from two directions: the live sitemap's 85 `<loc>` entries reconcile exactly
as 68 docs + 11 gallery + 5 standalone + the `/blocks` index, confirming the group and
category routes are genuinely absent from today's sitemap (which is what §17.6 #2 exists to
change); and diffing the inventory against the stale 242-file `apps/web/dist/` build shows
the only inventory-but-not-build routes are `/blocks/ecommerce` and
`/blocks/ecommerce/product-category` — that build predates the ecommerce group.

## §17.6 rows introduced in this stage

| # | Row | Status |
|---|---|---|
| **14** | Global focus ring declared as `var(--foreground)` instead of `var(--blume-accent)` | Implemented in Task 1.3. |
| **28** | The 404 `<title>` gains the suffix — `Page not found — SevenUI` | Implemented in Task 1.9, confirmed on disk, and confirmed **new**: the live page's `<title>` is a bare `Page not found`. |

Expected and correctly **not** a §17.6 row: the 404 gains the real header — `<nav>` count
goes from **0 live to 6 built** — because the generated `404.astro` never received the
header override. §11.7 records this as a defect corrected by structure.

## Lockfile side effect, accepted and now confirmed

Installing Tailwind re-resolved transitive `@types/node` from 26.4.0 down to 22.20.3 in
several snapshot blocks. 22.20.3 is what `apps/web/package.json`'s declared `^22.10.0`
permits and 26.4.0 never was, so the lock had drifted **above** the declared range and the
install corrected it.

Confirmed at this boundary: `pnpm test` → **525 passed (65 files)** for the registry and
**46 passed (4 files)** for presets. Nothing broke.

## What is **not** yet proven, and goes to the preview check

No server was started at any point in this stage — three Vite servers belonging to the
separate `sevenui-pro` checkouts are live on this machine, and server lifecycle is on the
human's gate list. Everything provable from built output on disk was proven there instead.
These remain:

| Check | Why it could not be proven locally |
|---|---|
| A toggle click actually flips `<html data-theme>` | `useTheme()` outside a provider is a **silent no-op** that builds clean — a dead button passes every static check |
| `localStorage.theme` **and** `localStorage["blume-theme"]` both update | Runtime only |
| No transition flash; OS change followed live with no stored preference | Runtime only |
| 390px drawer: opens, locks scroll, siblings `inert`, closes past 1024px | Runtime only; also whether `inert={!open}` serialises and whether the backdrop's conditional render leaves a click-through gap |
| No hydration warning from the pre-paint `data-pm` write | Console only |
| The first internal click is a **soft** navigation | Runtime only; this is what `next/link` was introduced for |
| `/nope` returns HTTP **404**, not 200 | Transport, not document |
| `/r/pro-manifest.json` still resolves through `vercel.json`'s rewrites | Preview only |
| Inter and IBM Plex Mono load with no FOIT | Runtime only |
| Deployment builds as Next.js while `main` stays Astro | Preview only — this is P1's live confirmation |

Proven from built output instead, and not repeated on the preview: the skip target and its
ordering; the font variable classes on `<html>`; **the package-manager pre-paint script
inside `<head>` at index 1486, with `<head>` spanning 127-1750 and `<body` at 1757**; the
`<header>` and `<footer>` landmarks; all five `target="_blank"` anchors carrying
`rel="noopener noreferrer"`; six `<nav>` elements; **the `.pm-only` rules unlayered,
verified by brace-matching** (`@layer utilities{` opens at 9844, closes at 202623,
`.pm-only` at 207651 at depth 0); zero `prefers-color-scheme` in either CSS chunk with all
~60 `dark:` rules compiling to `:where([data-theme=dark],[data-theme=dark] *)`; and all ten
dropped Blume shell pieces counting 0.

## Carried into later stages

- **Stage 2** — an explicit decision item: `/docs/blume-examples/*` is **137 live 200
  routes**, about 57% of what the site serves, excluded from the gate's inventory because
  the site's own sitemap contains zero of them. Whether they may simply stop returning 200
  needs a written answer: a §17.6 row, a redirect, or neither. §17.6 #10 declares the iframe
  removal as a behaviour change while the frozen-contract table says "no URL changes".
- **Stage 2 and Stage 4** — `display: inline` on the revealed `.pm-only` element is a harder
  constraint than it looks: both `globals.css:240` and `:243-249` are unlayered, so a
  consumer cannot override the revealed display with a Tailwind utility. A revealed element
  that must be anything other than inline needs its own unlayered rule.
- **Stage 3 and Stage 5** — `SiteDrawer` has no `children` API, but **14 of 18 live pages
  project a tree into the Astro slot**. The component is now mounted at layout level, where
  a page segment cannot pass children, so the interface must be **redesigned** (a second
  context slot, or a portal), not extended. Dropped with it: the
  `mb-4 border-border border-b pb-4` separator wrapper, a rendered element on those pages.
- **Stage 5** — the two remaining `@lucide/astro` call sites
  (`legacy-components/blocks-sidebar-nav.astro:17`, `legacy-pages/blocks/index.astro:66`);
  the module-level swap is already done. Also: every route reaching `<JsonLd>` must be
  registered by the **same source that generated the route**, because
  `lib/pro-manifest.ts:113` fetches the manifest from a remote URL and a throw at ISR
  revalidation time becomes a 500 rather than a missing graph node.
- **Stage 5, 8, 9** — re-derive the blocks route set; never hardcode a count.
- **Stage 7** — `Header.astro:281-292`'s `<style is:global>` forcing `flex-shrink: 0` on the
  search trigger went with the drop and must be restored when the trigger lands.
- **Stage 8** — `dir="ltr"` on `<html>` is not reproduced; `icons: { icon: "/icon.svg" }`
  adds a `<link rel="icon">` the legacy build never emitted; and the 404's `noindex` now
  relies on **Next's automatic injection** rather than a declaration, which Stage 8 owns
  re-checking.
- **Stage 9** — §17.6 #18 covers `name` as well as `headline`: the table row is shorthand,
  but §15.8's body says "`headline`/`name` go bare on every page". Both move by design.
- **Stage 11 / Task 11.3** — `baseline/build-time.md` times the whole pipeline
  (`build:registry`'s three `shadcn build` runs plus `blume build`), not `blume build`
  alone. Stage 11 must time the same command or state plainly that it is comparing a
  narrower one.
- **Stage 11 / Task 11.5 (§22)** — the cutover note must carry the theme storage-key
  rename: every returning reader who had chosen dark loses that choice exactly once and
  lands on their OS setting. One-shot, irreversible, user-visible. Paired with it: the site
  now follows the OS live until the reader clicks the toggle.

## Plan-text corrections earned by this stage

1. Task 1.4's Step 2 snippet imports `site` from `@/../lib/site`, which does not resolve —
   `@/*` maps to `../../packages/registry/*`. The "alias note in Task 1.7" it cites was
   never written. It must be `"../lib/site"`.
2. Task 1.4's Step 2 layout tree omits `<DrawerProvider>` and `<SiteDrawer />`, so as
   written it **crashes at render on every route**.
3. Task 1.8's Step 1 `currentTabForRoute` snippet matches `tab.href`; it must match
   `tab.path`, or the brief's own Step 5 test case fails.
4. Task 1.8's Step 5 says the drawer's **siblings** go `inert`. They do not — the drawer
   itself is inerted when closed.
5. Task 1.9's Step 3 asserts "Next does **NOT** add [`noindex`] to `not-found.tsx`
   automatically". Empirically false, disproven twice.
6. Task 1.10's Step 4 states counts that sum to 103 and concludes 101.
7. **Neither the plan nor the spec ever mentions `tailwindcss`, `@tailwindcss/postcss` or
   `postcss`** — installed in Task 1.4, since that is the commit that first imports
   `globals.css`.
8. §8.2's "~290 lines" for `globals.css` is stale; the file is 392.

## Verdict

**Stage 1's static surface is done and its gates pass.** The shell builds, typechecks
clean across the whole tree, keeps the 247 registry files byte-identical, and carries both
of its §17.6 rows. The gate's own instrument exists and has been attacked rather than
merely exercised.

**The stage is not fully verified until the preview runs** — ten interactive checks are
outstanding, and one of them (the theme toggle) has a known silent-failure mode that no
static check can see.
