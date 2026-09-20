# Blume → Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Blume 1.5.3 / Astro with a hand-rolled Next.js 16.3.5 App Router site in `apps/web`, every published URL frozen, so `/blocks` regenerates from the pro manifest on a 300-second ISR window instead of waiting for a manually dispatched full rebuild.

**Architecture:** One long-lived branch (`feat/blume-to-nextjs`), built in **twelve stages**, each pushed to its own Vercel preview and verified there before the next begins; `main` receives exactly **one** merge. Stage 0 is the only exception — three pre-ship commits land on `main` first (§20.3) so that a title, a card headline and a link never enter the cutover's diff. The site's shell is built first (Stage 1), then content (2–3), then each remaining surface in dependency order, then the retirements (10), then the gate, the performance record and the cutover (11). Nothing is "fixed forward": every difference between the old site and the new one must be either empty or a named row in §17.6.

**Tech Stack:** Next.js 16.3.5 (App Router, Turbopack), React 19.2, `@next/mdx` + remark-gfm + rehype-slug/autolink-headings/external-links + `@shikijs/rehype` 4.4.3, `next-themes`, `zod`, `vfile-matter`, `github-slugger`, `lucide-react` 1.41.0, `@clerk/clerk-js` 6.x, pnpm 12 workspace, Vercel. Unchanged: `packages/registry`, `packages/presets`, `shadcn` 4.19.1, the vitest suite.

**Spec:** `docs/superpowers/specs/2026-09-18-blume-to-nextjs-migration-design.md` — **locked, 22 sections, the only input to this plan.** Read it before starting any stage; every task below names the sections it implements and the spec carries the detail this plan does not repeat.
**ADR:** `docs/adr/0001-nextjs-replaces-astro-blume.md`
**Decision record:** `.scratch/blume-to-nextjs/issues/` (20 tickets), `.scratch/blume-to-nextjs/map.md`, `.scratch/blume-to-nextjs/route-inventory.md`

---

## Global Constraints

Every task's requirements implicitly include this section.

**Repo rules (`AGENTS.md`)**

- All repo content in English — docs, code, comments, commit messages, identifiers. Chat with the human may be Turkish.
- Files kebab-case. Commits are Conventional Commits, imperative mood. **No attribution trailers of any kind** — no `Co-Authored-By`, no AI/model/tool names, in commits and in the PR body.
- Vocabulary is frozen: **primitive** (`/docs/components/*`), **component** (`/components/*`), **block** (`/blocks/*`). Do not rename route segments, `@/components/ui/*` import paths, the `<Component />` MDX helper, or `registry:ui`.

**Human gates (do not cross without an explicit "başla" / "go")**

- No `git push`, no PR, no merge.
- No stopping a running dev server.
- No running the full gate suite (`pnpm build` / `pnpm test:smoke`) unprompted mid-stage — the per-task verification loop below is the default.
- No Vercel dashboard change (framework preset, env var) — those are named as human steps.

**Frozen contracts (spec §2) — nothing in this list may change**

| Contract | Value |
|---|---|
| Docs URLs | `/docs/*`, 68 MDX routes (69 after §11.3's new `/docs/components`) |
| Gallery | `/components` + 10 component pages |
| Blocks | `/blocks`, `/blocks/[group]`, `/blocks/[group]/[category]` — 18 live routes |
| Marketing / account / legal | `/`, `/pro`, `/account`, `/terms`, `/privacy` |
| Registry JSON | `/r/*.json`, `/r/demo/*.json`, `/r/component/*.json` — 247 files, **byte-identical** |
| Agent + SEO | `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`, per-page `/<route>.md` |
| OG cards | `/og/<pathname minus leading slash>.png`; `/` → `/og/index.png` |
| Dark-mode signal | `<html data-theme="dark">` |
| `localStorage` theme key | `theme` on the site, **plus a one-way mirror write to `blume-theme`** (§20.1 bridge) |
| TS path alias | `{"@/*": ["../../packages/registry/*"]}` — the registry import convention, does not move |
| Rewrites | `apps/web/vercel.json` is their single owner; **`next.config` declares none** (§3) |
| ISR ceiling | No `revalidate` anywhere exceeds **300** seconds (§15.7) |

**Scope walls (spec §19)**

- `packages/registry` and `packages/presets` are not touched. **One approved exception, one line:** `react-hook-form` moves `devDependencies` → `dependencies` in `packages/registry/package.json` (Task 2.7).
- The `sevenui-pro` repo is not touched. Only that `vercel.json`'s five rewrites keep resolving.
- No URL changes, no redirects, no i18n/RTL, no redesign beyond the two forced exceptions (search palette §9, `/docs/components` §11.3), no ISR beyond the pro manifest, no theme-dock move, no Geist switch, no runtime test harness for `apps/web`.

**Per-task verification loop (referenced below as "standard verify")**

```bash
pnpm install                 # only when a package.json / pnpm-workspace.yaml changed
pnpm typecheck               # apps/web now checks its WHOLE source tree (§14.2) — must be 0 errors
pnpm check:registry          # expected: unchanged item counts, no drift
pnpm --filter @sevenui/web build
```

`pnpm test` (registry vitest, 525 tests) and `pnpm test:smoke` are unaffected by web-side work; run them at a stage boundary, not per task. `pnpm build` at the repo root runs `build:registry` first — the 247 `/r/*.json` files must stay byte-identical for the whole migration (§17.4, absolute gate).

**Stage anatomy.** Every stage below carries six fixed parts, in this order:

1. **Tasks** — files, interfaces, checkbox steps, a commit per task.
2. **Definition of done** — what must be true for the stage to be over.
3. **Preview verification** — the human pushes; the stage is checked on its own Vercel preview URL, only over the routes the stage touched (§17.3).
4. **§17.6 rows expected here** — the intended diffs this stage introduces. **Any diff not on §17.6's list of 28 is a regression, at every stage.**
5. **Proof obligations** — the §20.2 checks that resolve in this stage, each with its fallback.
6. **Record** — a short checklist at `.scratch/blume-to-nextjs/verification/<stage>.md` (§17.7): one line per gate, plus the hand-reviewed routes and a verdict. Not a report.

---

## Stage map

| Stage | Name | Lands on | Spec sections |
|---|---|---|---|
| **0** | Pre-ship to `main`, freeze the baselines | `main` | §20.3, §17.4, §18.5, §22 |
| **1** | The Next.js shell | branch | §3, §8, §11.1, §11.2, §11.4, §11.7, §13, §14.2, §14.5, §14.6 |
| **2** | Docs content pipeline and inline demos | branch | §4, §6, §7, §8.4, §8.5, §14.4 |
| **3** | Docs chrome and page furniture | branch | §5, §11.3, §11.7 |
| **4** | Landing, gallery, legal | branch | §11.5 (example-card), §13.2, §14.6, §15.8 |
| **5** | `/blocks` and ISR — **the reason for the migration** | branch | §10, §11.5, §14.4 |
| **6** | Clerk, `/account`, `/pro` | branch | §12 |
| **7** | Search palette | branch | §9 |
| **8** | Agent-facing and SEO surface | branch | §15 |
| **9** | OG cards | branch | §16 |
| **10** | Retirement sweep | branch | §14.1, §14.2, §14.3, §14.6, §14.7 |
| **11** | Parity gate, performance record, cutover | branch → `main` | §17, §18, §22 |

Stages 4, 6 and 7 are independent of each other and of 5; 8 depends on 2/4/5 having shipped their content; 9 depends on 8's `lib/page-meta.ts` being complete. Everything else is a straight chain.

---

## Ledger 1 — §17.6's 28 intended diffs, assigned to stages

This is the migration's contract with itself: **every diff the gate finds must be empty or one of these 28 rows.** A row is "expected" in the stage that introduces it and is re-checked at Stage 11. A diff that appears in a stage where it is not expected is a regression even if it is on the list.

| # | Diff (spec §17.6) | Stage |
|---|---|---|
| 1 | `<InstallCommand>` stops leaking as raw JSX into `.md`; serializes to all four commands on 68 pages, in `.md` and `llms-full.txt` | 8 |
| 2 | `sitemap.xml` gains the 17 `/blocks` group and category routes; criterion becomes URL-set equality | 8 |
| 3 | The 17 block pages stop declaring a 404 `og:image` | 9 |
| 4 | Five absolute `https://sevenui.dev` markdown links become root-relative | 2 |
| 5 | `blume-heading-anchor` / `blume-table-scroll` become Tailwind utilities; no `blume-*` names survive | 2 |
| 6 | Sidebar scroll position persists across navigations | 3 |
| 7 | Docs install block gains a package-manager header bar on 67 of 68 pages — one uniform shape | 2 |
| 8 | Preview/Code tab toggle may now change page height | 2 |
| 9 | Inline demos resolve real viewport breakpoints — 26 of 137 demos change at `md` and above | 2 |
| 10 | Overlays from a demo cover the viewport instead of the frame — **the defect this migration fixes** | 2 |
| 11 | Search results may deep-link to a heading anchor; a new static index asset appears | 7 |
| 12 | Block toolbar tooltips gain Base UI's open delay and portal | 5 |
| 13 | `/account` renders its signed-out state server-side; the draw animation plays at first paint | 6 |
| 14 | Global focus ring declared as `var(--foreground)` instead of `var(--blume-accent)` | 1 |
| 15 | `copy-command.tsx` on the landing page and the `/components` cards follows the PM preference | 4 |
| 16 | 69 `/<route>.mdx` URLs are dropped | 8 |
| 17 | 68 docs `<title>`s move from hyphen to em dash, with `og:title` and `og:image:alt` | 2 |
| 18 | JSON-LD `headline` goes bare on 16 pages | 4 (13), 5 (`/blocks`), 6 (`/pro`, `/account`) |
| 19 | `llms.txt` gains 29 lines covering `/components` and the 18 blocks routes | 8 |
| 20 | `<blume-webmcp>` and its 2,709 B module are gone | 2 |
| 21 | OG card descriptions become per-page across all cards | 9 |
| 22 | Docs breadcrumb becomes a real trail (65 pages 1 → 3 items; `/docs/installation`, `/docs/theming` gain a 2-item trail) | 3 |
| 23 | `BreadcrumbList` JSON-LD added on docs and `/blocks` | 3 (docs), 5 (`/blocks`) |
| 24 | `/blocks` breadcrumb gains `nav > ol > li` + `aria-current` — a11y tree only, pixel-identical | 5 |
| 25 | The feedback event's `title` prop becomes the bare page title | 3 |
| 26 | One new route: `/docs/components` | 3 |
| 27 | `rounded-blume` (12px) becomes `rounded-lg` (10px) on four furniture elements | 3 |
| 28 | The 404 `<title>` gains the suffix: "Page not found — SevenUI" | 1 |

**Not diffs, expected in the inventory (spec §17.6 closing note):** `/blume-assets/*` is absent (it 404s today), and the 9 chrome anchors gain `target`/`rel` — the post-build pass already added them, so the built HTML is unchanged.

---

## Ledger 2 — §20.2's six remaining proof obligations

Obligation **#4** (`revalidateTag` invalidates the rendered route cache, not merely the tagged fetch entry) was **DISCHARGED on 2026-09-19** against Next 16.3.5's source — see spec §20.2. It needs no task. The other six are branching points: each is a **check step** with a **named fallback**, and taking a fallback means editing the spec to record it, not improvising.

| # | Claim | Stage / task | Check | Fallback if false |
|---|---|---|---|---|
| 1 | `` import(`@/registry/demos/${path}.tsx`) `` produces a Turbopack context module covering **nested** directories | 2 / Task 2.5 | First real build renders a nested demo (`button/button-demo`) | A build script emits `lib/docs/demos.ts`, a literal 137-entry map of `() => import(...)` thunks. The import expression changes, not §7.1 |
| 2 | `@shikijs/rehype` behaves under Turbopack with plain options | 2 / Task 2.3 | First real build of a page with a fence | Highlighting moves to an async RSC `pre`/`code` override (§4.4); the two code paths collapse and the five class-name differences vanish |
| 3 | `"use cache"` in Next 16.3.5 requires the `cacheComponents` flag | 5 / Task 5.1 | Read the installed Next source / try it | If it does **not** require the flag, record it — §10.1 is worth revisiting in a later effort. It does not change this migration's shape |
| 5 | `/previews/x/` (trailing slash) still resolves once Next owns the app | 5 / Task 5.7 | First preview deployment carrying block iframes | Platform rewrites run ahead of the Next function, so nothing should reach Next's trailing-slash handling — if something does, keep `trailingSlash` at its default and fix in `vercel.json`, which already carries both forms (§3) |
| 6 | Removing `publicHoistPattern` is safe | 10 / Task 10.1 | §14.1's three-step proof, naming five pages | Restore the block, record why in the spec. **The migration does not depend on removing it** |
| 7 | The widened `apps/web` tsconfig `include` surfaces a clearable error count | 1 / Task 1.2 | First `pnpm typecheck` after §14.2 | None. Clearing the errors is part of the migration; the include is **not** narrowed to keep the run quiet |

Two further branch points this plan adds, because the spec left the mechanism open and the wrong guess is expensive:

| # | Claim | Stage / task | Check | Fallback if false |
|---|---|---|---|---|
| P1 | The Vercel project's framework preset is **auto-detected per deployment**, so the branch can build Next while `main` keeps building Astro | 1 / Task 1.0 | Read the project's Build settings; push the first preview | If the preset is pinned to Astro, it **cannot** be flipped before cutover without breaking `main`'s production builds. Create a second Vercel project pointed at this branch for the duration, and fold the teardown into §22's checklist |
| P2 | The 68 per-page `.md` mirrors cannot be expressed as a Next route segment without colliding with `app/docs/[[...slug]]/page.tsx` | 8 / Task 8.2 | Reasoned in Task 8.2; verified by the fixture diff | Primary mechanism is a build-time emit into `public/` (the same shape `public/r/` already uses). If a collision-free route handler turns out to exist, it is a later simplification, not a cutover change |

---

## Ledger 3 — §20.3's pre-ship commits

Three changes land on today's Blume site as separate commits on `main`, **before** the branch merges, so they never enter §17.6's diff (Stage 0). What **cannot** be pre-shipped, and therefore lands in the cutover: the 68 hyphen-to-em-dash titles (Blume generates them), the JSON-LD `headline` normalization on 16 pages, and the per-page OG description (`og.description` is a single site-level string, so Blume cannot express it).

---

## Ledger 4 — §14.7's inventory of retired inputs

Everything below stops being read, is deleted, or becomes dead. **The stage column is where it actually dies; Task 10.5 walks this table row by row and asserts each one.** A row that is still live at Stage 11 is a migration defect, not a leftover.

| Input | Status (spec §14.7) | Dies in |
|---|---|---|
| `blume` package, `apps/web/blume.config.ts`, `apps/web/components.ts` | deleted (§14.3) | 10 |
| `patches/blume@1.5.3.patch`, `patchedDependencies` | deleted (§14.2) | 10 |
| `pnpm-workspace.yaml` `publicHoistPattern` | deleted (§14.1) | 10 |
| `apps/web/.blume/`, `.blume-verify/`, `apps/web/.gitignore` (the file) | deleted (§14.2) | 10 |
| `apps/web/assets/`, `apps/web/components/combination-mark.tsx` | deleted (§14.6) | 10 |
| `packages/registry/demos/theme.css` | **stays on disk, unused by the site**; `check-registry.mjs` still reads it. Comment at the read site, **not** in the file | 2 (unused), 10 (comment) |
| `/blume-assets/*` | 404s live; not reproduced | 1 (by construction) |
| WebMCP (`<blume-webmcp>` + 2,709 B module) | not ported (§15.14) | 2 |
| `rafThrottle` resize listener, postMessage height protocol, frame `ResizeObserver`, `100svh` viewport clamp | retired with the iframe (§7.3) | 2 |
| `ClientRouter`, `SWAP_STYLESHEET_INIT_SCRIPT`, `syncDrawerInert`, `astro:page-load` re-binds, `example-card`'s delegated-once pattern | retired with Astro (§11.1) | 1 (shell), 4 (example-card) |
| `<Banner>`, `BANNER_INIT_SCRIPT`, its dismiss branch, `--blume-drawer-top` | dead code today; deleted (§11.4) | 1 |
| Blume `page`-mode nav panels, `collapsed: false` | unreachable today; not ported (§5) | 3 |
| `blume-client-data` JSON island | nothing reads it; deleted (§11.1) | 1 |
| 69 `/<route>.mdx` endpoints | dropped (§15.1) | 8 |
| `⌘J` search binding | dead today; dropped (§9.5) | 7 |
| `rtl:-scale-x-100`, two `[dir="rtl"]` code rules | unreachable; dropped (§11.6) | 1 (css), 3 (pagination) |
| `--color-action`, `--color-action-foreground`, `--color-code`, `--radius-blume` | zero consumers; die (§8.3) | 1 |
| `body { background-* }` base rule | resolves to `none`; dropped (§8.3) | 1 |
| posthog / plausible / internal reporter / `blume:track` sinks | unconfigured or listener-less; dropped (§11.3) | 3 |
| `@vercel/analytics` | not enabled; leaves (§14.5) | 1 |

**A stale comment worth not copying:** `blocks-theme-dock.astro` cites a `renderProBlocks` that exists nowhere in the repo. Do not carry it into Stage 5.

---

# Stage 0 — Pre-ship to `main`, freeze the baselines

**Lands on `main`, not on the branch.** These three changes (§20.3) must be on `main` and **deployed to production** before Stage 1's first line of code, and they must be on `main` before the branch merges. The reason is attributability: a title, a card headline and a link are exactly the kinds of change that, bundled into a framework deploy, give every downstream difference two suspects.

Then — and only after those three are live — the baselines are captured. Ordering is load-bearing: pre-ship #3 rewrites four markdown links, which changes `.md` and `llms-full.txt` output. A fixture captured before that deploy would bake the old text in and make Stage 8's gate lie.

**Do not start Stage 1 until Stage 0 is merged and deployed.**

### Task 0.1: Gallery titles — `Button — SevenUI Components` → `Button Components — SevenUI`

**Files:**
- Modify: `apps/web/pages/components/accordion.astro`, `badge.astro`, `button.astro`, `card.astro`, `dialog.astro`, `dropdown-menu.astro`, `input.astro`, `select.astro`, `switch.astro`, `tabs.astro` — one line each

**Interfaces:**
- Produces: the 10 gallery `<title>`s already in §15.8's final form, so Stage 4 reproduces them rather than changing them, and they are absent from §17.6.

- [ ] **Step 1: Find the current title expression**

```bash
grep -rn 'SevenUI Components' apps/web/pages/components/
```

Expected: 10 hits, one per component page (the index page `apps/web/pages/components/index.astro` is **not** in scope — audit it and confirm its title already complies with "ends with `— SevenUI`"; if it does not, it is an 11th line, and record that in the task report).

- [ ] **Step 2: Rewrite each**

`Button — SevenUI Components` → `Button Components — SevenUI`. The pattern is `<Name> Components — SevenUI`: the em dash stays, the word `Components` moves in front of it, `SevenUI` ends the title. Apply to all 10.

- [ ] **Step 3: Verify locally**

```bash
pnpm --filter @sevenui/web build
grep -rho '<title>[^<]*</title>' apps/web/dist/components/*/index.html | sort
```

Expected: 10 lines, each `<title><Name> Components — SevenUI</title>`. No hyphen separator, no `SevenUI Components` suffix anywhere.

- [ ] **Step 4: Commit**

```bash
git add apps/web/pages/components
git commit -m "fix(web): end gallery titles with the site name

Every title ends with SevenUI after an em dash; the ten gallery pages
were the only routes reading '<Name> — SevenUI Components'."
```

### Task 0.2: `seo.og.titles` for the 12 divergent OG headlines

**Files:**
- Modify: `apps/web/blume.config.ts` — add a `seo.og.titles` block

**Interfaces:**
- Consumes: Task 0.1's new gallery titles (the card headline and the page title are decided separately, but reviewing them together is what makes the 12 obvious).
- Produces: `/terms`, `/privacy` and the 10 gallery routes draw the right headline **today**, leaving Stage 9 a 3-row OG diff instead of 15 (§16.1).

- [ ] **Step 1: Confirm the config key and its shape**

Blume's `seo.og.titles` is keyed by route and its own type comment says it is for exactly this: card headlines for custom pages. Confirm against the installed types before writing:

```bash
grep -rn 'og' node_modules/blume/dist/**/*.d.ts | grep -i 'titles' | head
```

If the key does not exist in the installed 1.5.3 typings, **stop and report** — this pre-ship becomes impossible and the 12 cards move into §17.6 as a 15-row OG diff instead of 3. Do not invent a different mechanism.

- [ ] **Step 2: Add the 12 entries**

In `apps/web/blume.config.ts`, inside the existing `defineConfig({...})`, add:

```ts
  seo: {
    og: {
      titles: {
        "/terms": "Terms of Service",
        "/privacy": "Privacy Policy",
        "/components/accordion": "Accordion",
        "/components/badge": "Badge",
        "/components/button": "Button",
        "/components/card": "Card",
        "/components/dialog": "Dialog",
        "/components/dropdown-menu": "Dropdown Menu",
        "/components/input": "Input",
        "/components/select": "Select",
        "/components/switch": "Switch",
        "/components/tabs": "Tabs",
      },
    },
  },
```

The headline is the page's **bare** title — no `Components` suffix, no site name (§16.4). `/terms` and `/privacy` get the real document names, which is the whole point: `humanizeSegment` was drawing "Terms" and "Privacy".

- [ ] **Step 3: Verify the cards redraw**

```bash
pnpm --filter @sevenui/web build
ls -la apps/web/dist/og/terms.png apps/web/dist/og/components/button.png
```

Expected: both exist, non-zero. Open `apps/web/dist/og/terms.png` and confirm the headline reads **Terms of Service**, and `apps/web/dist/og/components/button.png` reads **Button**.

- [ ] **Step 4: Commit**

```bash
git add apps/web/blume.config.ts
git commit -m "fix(web): draw real headlines on the twelve custom OG cards

The card headline for a custom page came from the last URL segment, so
/terms drew 'Terms' and the gallery pages drew their segment. seo.og.titles
is the documented per-route override for exactly this."
```

### Task 0.3: Rewrite the four base-relative MDX links

**Files:**
- Modify: `apps/web/docs/index.mdx:53` (`/components/field`), `apps/web/docs/index.mdx:56` (`/installation`), `apps/web/docs/components/field.mdx:55` (`/components/form`), `apps/web/docs/components/form.mdx:39` (`/components/field`)

**Interfaces:**
- Produces: a corpus where **all 45** internal links carry a literal `/docs/` prefix, so Stage 2's build-time link validator (§4.6) starts from a clean tree and Stage 1's "no `basePath`" decision (§3) cannot silently point four links outside the docs tree.

- [ ] **Step 1: Find them — do not trust the line numbers**

```bash
grep -rn '](/\(components\|installation\|theming\)' apps/web/docs --include='*.mdx'
```

Expected: exactly 4 hits, in the three files named above. If the count is not 4, reconcile against spec §11.7.3 before editing; the spec's count is the contract.

- [ ] **Step 2: Rewrite each to a literal `/docs/` prefix**

- `](/components/field)` → `](/docs/components/field)`
- `](/installation)` → `](/docs/installation)`
- `](/components/form)` → `](/docs/components/form)`

Blume's rewrite is **idempotent** — verified live: `](/docs/components/label)` renders as `/docs/components/label`, not double-prefixed — which is what makes this safe to ship on the Astro site today.

- [ ] **Step 3: Prove the HTML is byte-identical and the text surfaces are repaired**

```bash
pnpm --filter @sevenui/web build
# HTML: unchanged, because the rewrite is idempotent
curl -s https://sevenui.dev/docs/ | grep -o 'href="/docs/components/field"' | head -1
grep -o 'href="/docs/components/field"' apps/web/dist/docs/index.html | head -1
# Text surfaces: repaired
grep -c '](/components/' apps/web/dist/llms-full.txt   # expected: 0 (was 3)
grep -o '](/docs/components/field)' apps/web/dist/docs.md | head -1
```

Expected: the two `href` probes agree (the built page is unchanged); `llms-full.txt` now has **zero** `](/components/` occurrences where it had 3; the `.md` mirror carries the prefixed link.

- [ ] **Step 4: Commit**

```bash
git add apps/web/docs
git commit -m "fix(docs): write the four base-relative links with the /docs prefix

The corpus already writes 41 internal links with a literal /docs prefix;
these four relied on Blume's basePath rewrite, which repaired the HTML but
left /<route>.md and llms-full.txt pointing outside the docs tree."
```

### Task 0.4: Deploy Stage 0, then freeze the baselines

**Files:**
- Create: `.scratch/blume-to-nextjs/fixtures/llms.txt`, `llms-full.txt`, `sitemap.xml`, `robots.txt`, `index.md`, `agent-readability.json`, `md/<68 files>.md`
- Create: `.scratch/blume-to-nextjs/fixtures/MANIFEST.md` — what was captured, from where, when, and at which `main` commit
- Create: `.scratch/blume-to-nextjs/baseline/build-time.md` — the `blume build` measurement (§18.5)

**Interfaces:**
- Produces: the fixture set Stage 8 diffs against (§17.4), and the build-time number Stage 11 compares against (§18.5). **Both stop existing the moment Blume is removed**, which is why they are captured now.

- [ ] **Step 1: HUMAN GATE — push `main` and confirm production**

Tasks 0.1–0.3 are three commits on `main`. The human pushes and waits for the production deploy. Confirm before continuing:

```bash
curl -s https://sevenui.dev/components/button | grep -o '<title>[^<]*</title>'
# expected: <title>Button Components — SevenUI</title>
curl -s https://sevenui.dev/llms-full.txt | grep -c '](/components/'
# expected: 0
```

If either probe still shows the old value, the deploy has not landed. **Do not capture fixtures against a stale deploy.**

- [ ] **Step 2: Record today's build time (§18.5)**

From a clean tree on `main`, with no dev server running:

```bash
rm -rf apps/web/.blume apps/web/dist
/usr/bin/time -p pnpm --filter @sevenui/web build 2>&1 | tail -5
```

Run it twice and record both the cold and the warm number in `.scratch/blume-to-nextjs/baseline/build-time.md`, together with the machine (CPU, RAM), the Node version, and the `main` commit SHA. Stage 11 compares the Next build against this; **a >3x regression is a signal the shape is wrong, not a failing gate.**

- [ ] **Step 3: Capture the text fixtures from production**

```bash
mkdir -p .scratch/blume-to-nextjs/fixtures/md
cd .scratch/blume-to-nextjs/fixtures
for f in llms.txt llms-full.txt sitemap.xml robots.txt index.md agent-readability.json; do
  curl -sS --compressed "https://sevenui.dev/$f" -o "$f"
done
```

For the 68 per-page `.md` mirrors, derive the route list from the corpus rather than typing it — the rule is `<route>.md`, and `/docs/index.md` does **not** exist (§15.2):

```bash
cd /path/to/repo
node -e '
const {readdirSync} = require("node:fs");
const routes = ["/docs"];
for (const f of readdirSync("apps/web/docs")) if (f.endsWith(".mdx") && f !== "index.mdx") routes.push("/docs/" + f.slice(0, -4));
for (const f of readdirSync("apps/web/docs/components")) if (f.endsWith(".mdx")) routes.push("/docs/components/" + f.slice(0, -4));
console.log(routes.join("\n"));
' > /tmp/docs-routes.txt
wc -l /tmp/docs-routes.txt   # expected: 68
while read -r r; do
  out=".scratch/blume-to-nextjs/fixtures/md${r}.md"
  mkdir -p "$(dirname "$out")"
  curl -sS --compressed "https://sevenui.dev${r}.md" -o "$out"
done < /tmp/docs-routes.txt
find .scratch/blume-to-nextjs/fixtures/md -name '*.md' | wc -l   # expected: 68
```

- [ ] **Step 4: Sanity-check the capture before trusting it**

An empty or error-page fixture diffs clean against a broken generator — the vacuous-pass failure §21.3 names. Assert content, not existence:

```bash
cd .scratch/blume-to-nextjs/fixtures
wc -c llms.txt llms-full.txt sitemap.xml robots.txt index.md agent-readability.json
# expected, approximately: 9.3K, 297K, 5.7K, 120, 9.3K, 565
cmp llms.txt index.md && echo "llms.txt == index.md (expected, §15.2)"
grep -c '<loc>' sitemap.xml            # expected: 85
grep -c '^Content-Signal' robots.txt   # expected: 1
find md -name '*.md' -size -200c       # expected: no output — no truncated mirror
```

`llms.txt` and `index.md` must be byte-identical; if they are not, the capture raced a deploy — recapture.

- [ ] **Step 5: Write the manifest and commit**

`.scratch/blume-to-nextjs/fixtures/MANIFEST.md` records: the capture date, the `main` commit SHA that was live, the exact URLs, the byte counts from Step 4, and one line stating that these are the **pre-cutover** baseline for §17.4 and that Stage 8 diffs against them.

```bash
git add .scratch/blume-to-nextjs/fixtures .scratch/blume-to-nextjs/baseline
git commit -m "test(web): snapshot the pre-cutover agent surface and build time

The 74 text endpoints and the blume build time are the migration's parity
baseline; both stop existing once Blume is removed."
```

### Stage 0 — Definition of done

- Four commits on `main`: three pre-ship changes plus the baseline snapshot.
- Production serves the new gallery titles, the 12 corrected OG headlines, and a `llms-full.txt` with zero `](/components/` occurrences.
- `.scratch/blume-to-nextjs/fixtures/` holds 6 root endpoints + 68 `.md` files, all size-checked, with `llms.txt == index.md`.
- `.scratch/blume-to-nextjs/baseline/build-time.md` holds two `blume build` measurements with machine and commit recorded.

### Stage 0 — Preview verification

Production, not a preview. The three probes in Task 0.4 Step 1, plus visual confirmation of `/og/terms.png` and `/og/components/button.png` headlines.

### Stage 0 — §17.6 rows expected here

**None, by design.** That is the entire purpose of pre-shipping: these three changes are on the *old* site, so they are not in the cutover's diff. Stage 11 re-asserts that the gallery titles and the four links come out of the Next build **identical** to what `main` already serves.

### Stage 0 — Proof obligations

None. Task 0.2 Step 1 carries its own stop-condition (`seo.og.titles` must exist in Blume 1.5.3's typings).

### Stage 0 — Record

`.scratch/blume-to-nextjs/verification/stage-0.md` — the three probes, the two build-time numbers, the fixture byte counts, the `main` SHA that was live at capture.

---

# Stage 1 — The Next.js shell

The document, the token layer, the chrome and the gate's own instrument. Nothing here renders content; everything here is what content will land inside. Blume is **not** removed in this stage — only quarantined (Stage 10 removes it), because the Astro sources are the reference the next eight stages port from.

After this stage the branch's Vercel preview builds Next.js, so **Task 1.0 is the stage's first gate, not an afterthought.**

### Task 1.0: HUMAN GATE — Vercel framework preset (proof P1)

**Files:** none (Vercel dashboard)

**Interfaces:**
- Produces: a PASS/FAIL verdict on whether this branch can preview-deploy at all. Every later stage's "Preview verification" section depends on it.

- [ ] **Step 1: Read the project's build settings**

In the Vercel project for `sevenui.dev`, open Settings → Build and Deployment. Record the **Framework Preset** value and the **Root Directory** (expected: `apps/web`).

- [ ] **Step 2: Decide**

- **Preset is "Other" / auto-detect** → PASS. Each deployment detects its own framework from its own `package.json`, so `main` keeps building Astro while this branch builds Next. Nothing to change; §22's "Auto-detected; flips Astro → Next.js" is satisfied by the merge itself.
- **Preset is pinned to "Astro"** → FAIL, and it is **not** safe to flip it now: the setting is project-wide, so flipping it breaks `main`'s production builds for the whole duration of the branch. Take the fallback: create a second Vercel project on the same repo, Root Directory `apps/web`, preset auto-detect, **production branch set to `feat/blume-to-nextjs`**, with `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set (Stage 6 needs it) and no custom domain. Every "Preview verification" below then runs against that project's URL. Add its teardown to §22's cutover checklist.

- [ ] **Step 3: Record the verdict**

Write the verdict, the preset value and (on FAIL) the second project's URL into `.scratch/blume-to-nextjs/verification/stage-1.md`. Do not proceed to Task 1.2 without it — a stage with no preview has no verification.

### Task 1.1: Branch base — rebase onto Stage 0, commit the design record

**Files:**
- Create (from the untracked working tree): `docs/superpowers/specs/2026-09-18-blume-to-nextjs-migration-design.md`, `docs/adr/0001-nextjs-replaces-astro-blume.md`, `docs/superpowers/plans/2026-09-19-blume-to-nextjs.md`, `.scratch/blume-to-nextjs/issues/20-runtime-test-harness.md`
- Modify: `.scratch/blume-to-nextjs/map.md` (already modified in the working tree)

**Interfaces:**
- Produces: a branch whose base contains Stage 0's four commits, and whose first commit is the spec + ADR + this plan. Every later task's "read the spec" instruction resolves against a tracked file from here on.

- [ ] **Step 1: Rebase the branch onto the updated `main`**

```bash
git status --porcelain            # the design docs are untracked; keep them
git fetch origin
git rebase origin/main            # brings Stage 0's four commits under the branch
git log --oneline -6              # expected: Stage 0's four commits at the base
```

If the rebase conflicts, it is on `.scratch/blume-to-nextjs/` only — take the branch's version of `map.md` and the `main` version of `fixtures/`.

- [ ] **Step 2: Commit the design record**

```bash
git add docs/superpowers/specs/2026-09-18-blume-to-nextjs-migration-design.md \
        docs/adr/0001-nextjs-replaces-astro-blume.md \
        docs/superpowers/plans/2026-09-19-blume-to-nextjs.md \
        .scratch/blume-to-nextjs/
git commit -m "docs(migration): lock the Blume to Next.js design, ADR and plan

The spec closes 19 decision tickets; the ADR records why ISR on /blocks is
the whole justification; the plan stages the work behind one merge."
```

- [ ] **Step 3: Point `AGENTS.md` at the new spec**

Add one bullet to `AGENTS.md`'s spec list, after the restructure spec line:

```markdown
- Blume → Next.js migration spec (in flight): `docs/superpowers/specs/2026-09-18-blume-to-nextjs-migration-design.md`, plan `docs/superpowers/plans/2026-09-19-blume-to-nextjs.md`
```

Do **not** yet change `AGENTS.md`'s "Repo layout" paragraph, which still describes the Blume site correctly — Stage 10 rewrites it when that stops being true.

```bash
git add AGENTS.md
git commit -m "docs(repo): link the in-flight migration spec and plan"
```

### Task 1.2: Next.js installs, the tsconfig widens (proof #7)

**Files:**
- Modify: `apps/web/package.json` (deps + scripts), `apps/web/tsconfig.json` (rewritten)
- Create: `apps/web/next.config.ts`, `apps/web/next-env.d.ts` (generated, committed), `apps/web/app/layout.tsx` (temporary minimal shell, replaced in Task 1.4), `apps/web/app/page.tsx` (temporary stub, replaced in Stage 4)
- Move: `apps/web/pages/` → `apps/web/legacy/pages/`
- Modify: `.gitignore` (add `.next/`)

**Interfaces:**
- Consumes: Task 1.0's PASS.
- Produces: `pnpm --filter @sevenui/web build` runs `next build`; `pnpm typecheck` checks **the whole app** for the first time; the Astro routing directory no longer collides with Next's Pages Router. Every later task builds on these scripts.

- [ ] **Step 1: Quarantine the Astro routing directory**

`apps/web/pages/` is the name Next's Pages Router claims. The `.astro` files in it would be ignored, but a `pages/` directory alongside `app/` is a configuration ambiguity this migration should not carry for nine stages. Move it, keep it as reference, delete it in Stage 10:

```bash
git mv apps/web/pages apps/web/legacy-pages
git mv apps/web/components apps/web/legacy-components
mkdir -p apps/web/components
git mv apps/web/legacy-components/copy-command.tsx apps/web/components/copy-command.tsx
git mv apps/web/legacy-components/logomark.tsx apps/web/components/logomark.tsx
git mv apps/web/legacy-components/landing-showcase.tsx apps/web/components/landing-showcase.tsx
git mv apps/web/legacy-components/site-tabs.ts apps/web/lib/site-tabs.ts
```

Three `.tsx` files port, **not four** — `combination-mark.tsx` has no consumer anywhere in the repo and dies with `assets/` (§14.6). It stays in `legacy-components/` until Stage 10 deletes the directory.

- [ ] **Step 2: Rewrite `apps/web/package.json`**

```json
{
  "name": "@sevenui/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "pnpm build:registry && next build",
    "build:registry": "shadcn build -c ../../packages/registry -o ../../apps/web/public/r && shadcn build -c ../../packages/registry/demos -o ../../../apps/web/public/r/demo && shadcn build -c ../../packages/registry/components -o ../../../apps/web/public/r/component",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@clerk/clerk-js": "^6.31.0",
    "@sevenui/presets": "workspace:*",
    "lucide-react": "^1.41.0",
    "next": "16.3.5",
    "next-themes": "^0.4.6",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "zod": "^4.1.13"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.5",
    "blume": "^1.5.3",
    "shadcn": "^4.19.1",
    "typescript": "^7.0.2"
  }
}
```

`blume` **stays** for now — Stage 10 removes it with the patch and the generated directories. `@lucide/astro` and `@vercel/analytics` leave here (§14.4, §14.7). `next` is pinned exactly to `16.3.5`, not a caret range: the spec's Turbopack, `params`-is-a-promise and `revalidateTag` findings are all version-specific (§3, §16.7, §20.2 #4).

- [ ] **Step 3: Write `apps/web/next.config.ts`**

```ts
import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// The `@/*` alias points at packages/registry, outside this app directory, so
// Vercel's file tracing has to be told where the workspace actually starts
// (§3, §14.2). Turbopack needs nothing else; if a build ever falls back to
// webpack, `experimental.externalDir` is the escape hatch for the same reason.
const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: workspaceRoot,
  // `output: "export"` is OUT (§3): static export cannot do ISR, which is the
  // entire point of this migration. Everything except the three blocks routes,
  // sitemap.xml, llms.txt and the OG route is statically generated anyway.
  //
  // Rewrites live in vercel.json, which stays their single owner (§3). All
  // five targets are external, so nothing needs to compose with Next routing,
  // and re-expressing the /previews/:path* trailing-slash pair here would
  // reopen a debugged platform bug.
};

export default nextConfig;
```

- [ ] **Step 4: Rewrite `apps/web/tsconfig.json` — widen the include (§14.2)**

Today the file is `include: ["blume.config.ts"]` with no `extends`, so `pnpm typecheck` checks **one file**. The new one is Next's shape with the frozen alias carried over verbatim and the **default include**:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "allowJs": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["../../packages/registry/*"],
      "@docs/*": ["./docs/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "legacy-pages", "legacy-components", "blume.config.ts", "components.ts"]
}
```

`@/*` is the frozen registry import convention and does not move. `@docs/*` is new and is how `app/docs/[[...slug]]/page.tsx` reaches the content tree in Stage 2. The `exclude` list is **quarantine, not narrowing**: those four entries are Blume-era files that Stage 10 deletes, and `legacy-*` holds `.astro` files TypeScript cannot parse. **`lib/`, `components/` and `app/` are all included — that is the widening, and it is not undone.**

- [ ] **Step 5: Temporary shell so the build has something to build**

`apps/web/app/layout.tsx` — replaced wholesale by Task 1.4:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`apps/web/app/page.tsx` — the landing page is hand-tuned and pixel-near; Stage 4 ports it. Until then:

```tsx
// Placeholder. The landing page is ported in Stage 4 (spec §11, §13.2);
// this exists only so Stage 1's shell has a route to render.
export default function Home() {
  return <h1>SevenUI</h1>;
}
```

- [ ] **Step 6: Install, then measure the widened typecheck (PROOF OBLIGATION #7)**

```bash
pnpm install
cd apps/web && npx next telemetry disable && cd ../..
pnpm --filter @sevenui/web exec tsc --noEmit 2>&1 | tee /tmp/tsc-widened.txt
grep -c 'error TS' /tmp/tsc-widened.txt || true
```

**Record the error count** in `.scratch/blume-to-nextjs/verification/stage-1.md`. This is the first time `lib/clerk.ts`, `lib/package-manager.ts`, `lib/pro-manifest.ts`, `lib/registry.ts` and the three ported `.tsx` files have been typechecked at all.

**Clearing them is part of this task, not a follow-up.** Fix each error at its source. The one thing that is **not** allowed is narrowing the `include` to make the run quiet — that would make today's blind spot permanent in the new repo.

- [ ] **Step 7: Build and commit**

```bash
echo ".next/" >> .gitignore
pnpm --filter @sevenui/web build
```

Expected: `next build` succeeds, emits `.next/`, and reports `/` as a static route. The registry build runs first and must still emit 247 JSON files.

```bash
ls apps/web/public/r/*.json | wc -l          # 68
ls apps/web/public/r/demo/*.json | wc -l     # 138
ls apps/web/public/r/component/*.json | wc -l # 41
git add -A
git commit -m "feat(web): build apps/web with Next.js 16.3.5

The tsconfig takes Next's default include, so the app's own sources are
typechecked for the first time; the Astro routing directory moves aside
rather than being deleted, because it is the reference the port reads from."
```

### Task 1.3: `app/globals.css` — one file, the base layer swept once

**Files:**
- Create: `apps/web/app/globals.css`
- Read (source of truth, not modified): `apps/web/theme.css`, and the sweep inventory in spec §8.3

**Interfaces:**
- Produces: the site's only stylesheet entry. Every later stage's Tailwind utilities resolve against its `@theme`; §7.2's isolation rules depend on what it does **not** declare.

- [ ] **Step 1: Carry the palette over verbatim**

`apps/web/theme.css` is 353 lines and its `:root` / `[data-theme="dark"]` token blocks are the site's palette — including `--success` / `--warning`, which are correct and stay (§8.6). Copy both blocks unchanged into `apps/web/app/globals.css`, under:

```css
@import "tailwindcss";

/* Tailwind v4's automatic scan does not reach outside the app, and the
   registry sources the site imports live in packages/registry. These paths
   are relative to this file (apps/web/app/globals.css) — they were fragile
   only while they resolved against Blume's generated entry (§8.2). */
@source "../../../packages/registry/registry";
@source "../../../packages/registry/components";
```

- [ ] **Step 2: Delete on the way in**

Two blocks in `theme.css` do **not** come along (§8.2):

- the `--blume-*` re-pointing — 10 lines, two blocks of five (`--blume-background`, `-foreground`, `-muted`, `-muted-foreground`, `-border` in `:root` and in the dark block);
- the search-dialog `!important` overrides — 18 lines, the `[data-blume-search-*]` rules. Stage 7 rebuilds the palette on our own `command` primitive, so there is nothing left to fight.

After this step, `grep -c blume apps/web/app/globals.css` must be **0**.

- [ ] **Step 3: Add the 9 `@theme inline` entries that lived only in Blume's generated entry (§8.3)**

Of the 13 Blume-only entries, **9 port and 4 die**:

```css
@theme inline {
  /* …the 39 keys already carried over from theme.css… */

  /* Blume-only until now: all five are used by demos (§8.3). */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);

  /* font-mono has 15 authored call sites plus 3 in the registry; font-sans is
     the body font; font-display has no utility but §6's heading override reads
     it, and display is Inter too. */
  --font-sans: var(--font-inter);
  --font-mono: var(--font-ibm-plex-mono);
  --font-display: var(--font-sans);

  /* The 42rem docs measure. Killed on a "zero consumers" premise that §11's
     furniture falsifies — five max-w-content call sites on one live page. */
  --container-content: 42rem;
}
```

`--color-action`, `--color-action-foreground`, `--color-code` and `--radius-blume` are **not** written: zero consumers anywhere in `apps/web` or the registry, they fed Blume's own chrome and `.prose` only. `--radius-blume`'s 12px matches no SevenUI radius, so the four furniture elements using it snap to `rounded-lg` in Stage 3 (§17.6 #27).

`--font-inter` / `--font-ibm-plex-mono` are the CSS variables `next/font` exposes in Task 1.4; the `@theme` keys are what Tailwind's `font-sans` / `font-mono` utilities read.

- [ ] **Step 4: Write the base layer — six rules of seven**

```css
@layer base {
  /* Kept verbatim from theme.css: no framework ships a default border color,
     which is MORE necessary under Next.js, not less. */
  * {
    border-color: var(--border);
  }

  /* 1. The global flex/grid overflow defuse. Silent and site-wide. */
  * {
    min-width: 0;
  }

  /* 2. */
  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }

  /* 3. scroll-padding-top is load-bearing for §9's anchored search results,
     which would otherwise land under the sticky header. */
  html {
    scroll-behavior: smooth;
    scroll-padding-top: 4.5rem;
    text-rendering: optimizeLegibility;
  }

  /* 7. */
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }

  /* 5. §17.6 #14 — declared as var(--foreground), not var(--blume-accent).
     --blume-accent resolved to oklch(0.145 0 0) light / oklch(0.96 0 0) dark,
     which is --foreground to within 0.025 L; blocks-theme-dock already
     hardcodes outline-foreground, so this makes the site consistent. */
  :focus-visible {
    outline: 2px solid var(--foreground);
    outline-offset: 2px;
    border-radius: 2px;
  }
}
```

**Rule 4 does not port as a bare selector** and this is load-bearing, not an omission: Blume's bare `h1`-`h6` display-font + `-0.05em` rule is invisible today only because demo iframes never load Blume's entry. Inline (§7.2d) it would hit every heading a demo renders — and **4 demos do** render one: `separator-demo`, `hover-card-demo`, `scroll-area-demo`, `collapsible-demo`. The values move into §6's heading overrides in Stage 2; the chrome's headings carry their own classes.

**Rule 6 is dropped**: the `body { background-attachment/-image/-position/-repeat/-size }` block reads `--blume-background-image`, which resolves to `none`. Dead.

The two `[dir="rtl"]` code rules are dropped with §11.6's RTL call — the port has no locale and no `dir` switch.

- [ ] **Step 5: Carry the rest verbatim**

From `theme.css`, unchanged: `@theme inline`'s existing entries, the view-transition overrides, `::selection`, `scrollbar-gutter`, and **the full animation set**. The animations are self-contained — `--tw-duration` / `--tw-ease` come from Tailwind core, `--spacing` from Tailwind's defaults, `--accordion-panel-height` / `--collapsible-panel-height` from Base UI — so nothing depends on Blume's stylesheet ordering.

The file should land around **290 lines**. It is not split: `@utility` and `@theme` are order-sensitive in Tailwind v4, so splitting is not free.

- [ ] **Step 6: Verify and commit**

```bash
grep -c 'blume' apps/web/app/globals.css        # expected: 0
grep -c 'prefers-color-scheme' apps/web/app/globals.css  # expected: 0 (§4.4)
wc -l apps/web/app/globals.css                  # expected: ~290
pnpm --filter @sevenui/web build
git add apps/web/app/globals.css
git commit -m "feat(web): move the token layer into one globals.css

Blume's generated entry held 13 @theme entries and seven base rules that
theme.css never declared; nine and six of them port, the rest had zero
consumers or resolved to nothing. The focus ring becomes var(--foreground)."
```

### Task 1.4: The document — fonts, layout tree, analytics

**Files:**
- Rewrite: `apps/web/app/layout.tsx`
- Create: `apps/web/components/analytics.tsx`

**Interfaces:**
- Consumes: `app/globals.css` (Task 1.3), `lib/site.ts` (Task 1.7 — write that task first if ordering by dependency; the steps below assume it exists).
- Produces: `<html>`'s attribute surface (`lang`, `data-theme`, `data-pm`, the font variables), the skip link, `<main id="content">`, and the header/footer slots every later stage's pages render inside.

- [ ] **Step 1: Fonts (§11.2)**

Nobody owned this today: the resolved config is Blume's **defaults**, not anything written in `blume.config.ts` — Inter for body and display, IBM Plex Mono for mono.

```tsx
import { Inter, IBM_Plex_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});
```

**Geist is deliberately not used here.** It was deferred, not rejected: `/` and `/blocks` are held near pixel parity, and moving typography and framework in one deploy gives every drift the sampled review finds two suspects (§11.2). Stage 9 is separately told not to "fix" the card/site font mismatch by pulling the OG card onto Inter.

Next's own preload handling stands in for Astro's per-weight preload list; reproducing that list is not parity work under §17's bar.

- [ ] **Step 2: The layout tree (§11.1)**

```tsx
import "./globals.css";
import type { Metadata } from "next";
import { site } from "@/../lib/site";           // see Task 1.7 for the alias note
import { ThemeProvider } from "../components/theme-provider";
import { PackageManagerScript } from "../components/package-manager-script";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { Analytics } from "../components/analytics";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: site.description,
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <head>
        <PackageManagerScript />
      </head>
      <body>
        <ThemeProvider>
          <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2">
            Skip to content
          </a>
          <SiteHeader />
          <main id="content">{children}</main>
          <SiteFooter />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
```

`suppressHydrationWarning` on `<html>` is required by `next-themes`. The skip target is **`#content`**, not `#blume-content` (§13.3).

**Ten of Blume's fifteen shell pieces do not come along** and none of them is a loss (§11.1): `<ClientRouter>` and `SWAP_STYLESHEET_INIT_SCRIPT` (App Router owns soft navigation; the body-stylesheet race cannot occur), `<Banner>` and `BANNER_INIT_SCRIPT` (dead code — no `banner` is configured, so the dismiss branch has never run in production), the `blume-client-data` JSON island (emitted on docs pages; **nothing reads it**), `syncDrawerInert()` (React renders `inert` from state), `<Fonts>` (Step 1), `<WebMcp>` (§15.14 — no shipping browser implements `navigator.modelContext`), and the favicon/meta/OG/canonical block (Stage 8, Stage 9).

- [ ] **Step 3: Analytics, production-gated (§14.5)**

`apps/web/components/analytics.tsx`:

```tsx
import Script from "next/script";

const GA_ID = "G-8702Z28SMN";

// Two scripts today, both in <head>, both gated on import.meta.env.PROD. The
// gate is preserved: without it, local development writes into the live
// property. The timing shift (afterInteractive rather than async-in-head)
// changes nothing measurable — GA4's enhanced measurement tracks history
// changes itself, which is why Blume's own Analytics.astro adds SPA pageview
// capture for PostHog and not for GA4.
export function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
```

Nothing else in `Analytics.astro` comes along: `analytics.vercel` is not enabled and PostHog is not configured (§14.5, §14.7).

Note for the preview check: Vercel preview deployments run with `NODE_ENV=production`, so GA4 loads on previews — **exactly as it does today**, since `import.meta.env.PROD` is also true there. This is parity, not a regression.

- [ ] **Step 4: Verify and commit**

```bash
pnpm --filter @sevenui/web build
pnpm --filter @sevenui/web start &
sleep 3
curl -s http://localhost:3000/ | grep -o 'id="content"'
curl -s http://localhost:3000/ | grep -o 'class="[^"]*__variable[^"]*"' | head -1
kill %1
```

Expected: the skip target exists; the font variable classes are on `<html>`.

```bash
git add apps/web/app/layout.tsx apps/web/components/analytics.tsx
git commit -m "feat(web): own the document in the root layout

Fonts move to next/font, the GA4 pair to next/script with its production
gate intact, and ten of Blume's fifteen shell pieces are dropped — six of
them dead code on the live site."
```

### Task 1.5: Theme — `next-themes`, and the cross-repo mirror bridge

**Files:**
- Create: `apps/web/components/theme-provider.tsx`, `apps/web/components/theme-toggle.tsx`

**Interfaces:**
- Produces: `<html data-theme>`, the two-state toggle, and the `blume-theme` mirror write. `packages/presets/apply.ts` and the pro deployment read the mirror over the native `storage` event.

- [ ] **Step 1: The provider, on the frozen contract (§8.1)**

```tsx
"use client";

import { ThemeProvider as NextThemes, useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="data-theme"
      storageKey="theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme={false}
    >
      <BlumeThemeMirror />
      {children}
    </NextThemes>
  );
}
```

Every option is a contract, not a preference:

- `attribute="data-theme"` is **frozen** — `class="dark"` would ripple into `packages/presets`, `packages/registry` and the pro repo for no gain.
- `storageKey="theme"` is the rename from `blume-theme`. It resets every returning reader's preference once, to system — accepted.
- `enableColorScheme={false}` keeps the `color-scheme` CSS rules the single owner; they also work with JS off.
- `next-themes` is chosen over a hand-rolled inline script **for the `storage` event**, not for bundle size: the key is a cross-repo contract and `next-themes` gets write, read and cross-tab sync right in one place.

Three behavioural deltas, all deliberate: live OS following is **added** (today's `THEME_INIT_SCRIPT` reads `matchMedia` once with no `change` listener, so with no stored preference the site stays on whatever it loaded with — a gap, not a design choice); `astro:after-swap` re-application is **dropped** (App Router client navigation does not replace `<html>`); transition suppression is **kept** (`disableTransitionOnChange` is the same inject-`transition:none`, force reflow, remove-after-1ms behaviour).

- [ ] **Step 2: The `blume-theme` mirror (§20.1 — TEMPORARY BRIDGE)**

In the same file:

```tsx
// TEMPORARY BRIDGE (spec §20.1). The site's storage key is now `theme`, but
// the key is a cross-repo contract: the pro previews are served same-origin
// through vercel.json's /previews/* rewrite and sync theme over the native
// `storage` event, which packages/presets/apply.ts names explicitly. Without
// this one-way mirror, /blocks previews lose theme sync between the web
// cutover and the pro deploy — 16 pages, the site's most hand-tuned surface.
//
// DELETE THIS once the pro repo reads `theme`. Nothing automated can observe
// that condition; it has to be remembered by a person.
function BlumeThemeMirror() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (resolvedTheme) localStorage.setItem("blume-theme", resolvedTheme);
  }, [resolvedTheme]);
  return null;
}
```

One-way, resolved value only. The literal string `"system"` is never written anywhere — the pro preview documents do `root.dataset.theme = <value>` and would render neither light nor dark (§8.1).

- [ ] **Step 3: The toggle, CSS-driven (§11.4)**

`components/theme-toggle.tsx` is a client component whose icon swap is **CSS**, not a JS-read theme: `inline-flex dark:hidden` on the sun, `hidden dark:inline-flex` on the moon. That is what makes it SSR-safe with no hydration mismatch and no flash. The toggle stays **two-state** (light ⇄ dark) — a three-state toggle is a feature, not a migration.

Port the button's current markup and `aria-label` from `legacy-components/blume/Header.astro`'s theme-toggle block verbatim.

- [ ] **Step 4: Verify both halves of the contract**

```bash
pnpm --filter @sevenui/web build && pnpm --filter @sevenui/web start &
sleep 3
curl -s http://localhost:3000/ | grep -o 'suppresshydrationwarning\|data-theme' | head
```

Then in the browser at `http://localhost:3000/`: toggle the theme and confirm in DevTools that **both** `localStorage.theme` and `localStorage["blume-theme"]` update, that `<html data-theme>` flips, and that no transition flash occurs. With no stored preference, change the OS appearance and confirm the site follows live (the added behaviour).

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/theme-provider.tsx apps/web/components/theme-toggle.tsx
git commit -m "feat(web): move theming to next-themes on the frozen data-theme contract

The storage key becomes 'theme'; a one-way mirror keeps writing 'blume-theme'
until the pro repo reads the new key, because the pro previews are same-origin
and sync over the native storage event."
```

### Task 1.6: `data-pm` becomes a site-wide attribute

**Files:**
- Create: `apps/web/components/package-manager-script.tsx`
- Modify: `apps/web/app/globals.css` (the `.pm-only-*` rules)

**Interfaces:**
- Consumes: `lib/package-manager.ts` (already in the repo — `PACKAGE_MANAGER_KEY = "sevenui:package-manager"`, four managers, default `pnpm`).
- Produces: `<html data-pm>` on every page, and the CSS that selects one of four SSR'd commands. Stage 2's `<InstallCommand>` (§6.1), Stage 4's `copy-command.tsx` (§13.2) and Stage 5's install control all read it.

- [ ] **Step 1: The pre-paint script**

`is:inline` is **load-bearing** today — bundled, the script runs after first paint, which is the flash it exists to prevent. The Next equivalent is a raw inline `<script>` in `<head>`, not `next/script`:

```tsx
import { DEFAULT_PACKAGE_MANAGER, PACKAGE_MANAGER_KEY, PACKAGE_MANAGERS } from "../lib/package-manager";

// Pre-paint, deliberately uncompiled and unbundled: the whole point is that it
// runs before first paint. §13.2 promotes data-pm from a /blocks-local hook to
// a site-wide attribute beside data-theme, because §6.1 puts a package-manager
// bar on 67 docs pages.
const script = `(function(){try{var v=localStorage.getItem(${JSON.stringify(PACKAGE_MANAGER_KEY)});var ok=${JSON.stringify(PACKAGE_MANAGERS)};document.documentElement.dataset.pm=ok.indexOf(v)>-1?v:${JSON.stringify(DEFAULT_PACKAGE_MANAGER)};}catch(e){document.documentElement.dataset.pm=${JSON.stringify(DEFAULT_PACKAGE_MANAGER)};}})();`;

export function PackageManagerScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
```

The tolerant read mirrors `readPackageManager`'s contract: anything unrecognised yields the default, because a toolbar must never break on a bad preference.

- [ ] **Step 2: The selection rules, moved into `globals.css`**

Port the `.pm-only-*` rules from `legacy-components/blocks-prefs.astro` verbatim, changing only their home:

```css
/* All four commands ship in the HTML and CSS picks one. The React-shaped
   alternative — read localStorage in an effect and re-render — reintroduces
   exactly the post-hydration repaint the inline script was written to avoid,
   and would do it once per card (§13.2). */
.pm-only-npm,
.pm-only-pnpm,
.pm-only-yarn,
.pm-only-bun {
  display: none;
}
[data-pm="npm"] .pm-only-npm,
[data-pm="pnpm"] .pm-only-pnpm,
[data-pm="yarn"] .pm-only-yarn,
[data-pm="bun"] .pm-only-bun {
  display: revert-layer;
}
```

Read the live rules out of `blocks-prefs.astro` before writing these — the display value and any additional selectors must match what ships today, since Stage 5 reproduces the `/blocks` control unchanged.

- [ ] **Step 3: Verify and commit**

```bash
pnpm --filter @sevenui/web build && pnpm --filter @sevenui/web start &
sleep 3
curl -s http://localhost:3000/ | grep -o 'data-pm\|sevenui:package-manager' | head
```

Expected: the inline script is in the served HTML (it must be **in the document**, not in a chunk).

```bash
git add apps/web/components/package-manager-script.tsx apps/web/app/globals.css
git commit -m "feat(web): make data-pm a site-wide attribute

The pre-paint script and the .pm-only rules move from /blocks to the root
layout and globals.css, because the docs install block gains a package-manager
bar and the landing copy control follows the same preference."
```

### Task 1.7: `lib/site.ts`, the title rule, and the metadata registry

**Files:**
- Create: `apps/web/lib/site.ts`, `apps/web/lib/page-meta.ts`, `apps/web/components/json-ld.tsx`

**Interfaces:**
- Produces:
  - `site` — `{ name, description, url, github: { owner, repo } }`, read by the root layout's `metadataBase`, Stage 8's text endpoints, `/agent-readability.json`, `robots.txt`, `sitemap.xml`, and Stage 9's OG footer strings.
  - `pageTitle(bare: string): string` — §15.8's **one** application point.
  - `getPageMeta(route: string): { title: string; description: string } | undefined` — the **bare** title and the page's own description. Docs entries derive from Stage 2's content index, block entries from Stage 5's manifest, custom pages are declared here.
  - `<JsonLd>` — the `@graph` emitter; `WebSite` everywhere, `TechArticle` on every page except `/`, `BreadcrumbList` added by Stages 3 and 5.

- [ ] **Step 1: `lib/site.ts`**

```ts
export const site = {
  name: "SevenUI",
  description: "Base UI powered primitives, distributed through the shadcn registry.",
  url: "https://sevenui.dev",
  github: { owner: "useui", repo: "sevenui" },
} as const;

/**
 * §15.8: every <title> ends with `SevenUI`, separated by an em dash. The
 * landing page is the sole exception and stays bare `SevenUI`.
 *
 * Applied in exactly ONE place — each page's generateMetadata reads the bare
 * title from lib/page-meta.ts and passes it through here — so the OG card and
 * the tab can never disagree (§16.8).
 */
export const pageTitle = (bare: string): string =>
  bare === site.name ? site.name : `${bare} — ${site.name}`;
```

The three strings are the same ones `blume.config.ts` holds today (`title`, `description`, `deployment.site`) and the same `github: { owner, repo }` (§14.3). Without one module, three surfaces would hardcode them.

- [ ] **Step 2: `lib/page-meta.ts` — the registry**

Next has no API for reading another route's metadata, so "drawn equals declared" only holds if one source feeds both (§16.8).

```ts
import { site } from "./site";

export type PageMeta = { title: string; description: string };

/** Custom pages: declared explicitly. Docs come from the content index
 *  (Stage 2), blocks from the pro manifest (Stage 5). */
const CUSTOM: Record<string, PageMeta> = {
  "/": { title: site.name, description: site.description },
  "/components": { title: "Components", description: /* the live page's description, read from pages/components/index.astro */ "" },
  "/pro": { title: "Pro", description: "" },
  "/account": { title: "Account", description: "" },
  "/terms": { title: "Terms of Service", description: "" },
  "/privacy": { title: "Privacy Policy", description: "" },
};
```

**Fill each empty `description` from the live page's own `<meta name="description">`** before committing — do not invent one:

```bash
for r in /components /pro /account /terms /privacy; do
  echo -n "$r: "; curl -s "https://sevenui.dev$r" | grep -o '<meta name="description" content="[^"]*"' | head -1
done
```

`/account` may legitimately declare none — §16.4 names it as exactly what the site-description fallback is for. Record that rather than inventing text.

The 10 gallery children (`/components/<name>`) are added in Stage 4 from the same source their pages already read; the resolver signature does not change.

- [ ] **Step 3: The resolver**

```ts
export function getPageMeta(route: string): PageMeta | undefined {
  return CUSTOM[route];
}
```

Stages 2, 4 and 5 widen this one function — docs first, gallery children next, blocks last — so that by Stage 9 `getPageMeta` answers for all ~102 routes and the OG route can assert against it (§17.5's only automated proof that §16.4 held).

- [ ] **Step 4: `components/json-ld.tsx` (§15.8)**

An `@graph` with a `WebSite` node plus a `TechArticle` node on every page except the landing page, which carries `WebSite` alone.

**`headline` / `name` go bare** — the suffix belongs to the browser tab, not to the article. Today docs pages emit `"Button"` (already compliant) while the 16 non-docs `TechArticle` pages emit `"Button — SevenUI Components"`. The component therefore takes the **bare** title from `getPageMeta`, never the output of `pageTitle`. That is §17.6 #18, landing in Stages 4, 5 and 6 as those pages port.

`TechArticle` on a listing page like `/blocks` is imprecise schema; that is not a migration question and is left alone.

- [ ] **Step 5: Verify and commit**

```bash
pnpm --filter @sevenui/web typecheck
git add apps/web/lib/site.ts apps/web/lib/page-meta.ts apps/web/components/json-ld.tsx
git commit -m "feat(web): give the site one metadata registry

lib/page-meta.ts stores the bare title and the page's own description; the
em-dash suffix is applied in one place, so the tab title and the OG card
cannot desynchronise."
```

### Task 1.8: Header, footer, drawer

**Files:**
- Create: `apps/web/components/site-header.tsx`, `apps/web/components/site-footer.tsx`, `apps/web/components/site-drawer.tsx`, `apps/web/components/drawer-context.tsx`
- Modify: `apps/web/lib/site-tabs.ts` (moved in Task 1.2; add `currentTabForRoute`)
- Read (port from): `legacy-components/blume/Header.astro`, `legacy-components/site-footer.astro`, `legacy-components/site-drawer.astro`, `legacy-components/site-drawer-tabs.astro`

**Interfaces:**
- Consumes: `lib/site-tabs.ts`, `components/logomark.tsx`, `components/theme-toggle.tsx`.
- Produces: the chrome every page renders inside. **Two slots are deliberately empty in this stage and filled later:** the search trigger (Stage 7, §9.5) and the auth pill (Stage 6, §12). They are not placeholders — the header simply does not render them yet, and each later stage adds its own element.

- [ ] **Step 1: `site-tabs.ts` moves as data, plus a ~10-line helper (§5)**

The array is already framework-free and moves **verbatim**. `currentTabForRoute` is Blume's — the tabs' only logic dependency on it — and is reimplemented beside the data as a longest-prefix match:

```ts
export function currentTabForRoute(pathname: string): string | undefined {
  let best: { href: string } | undefined;
  for (const tab of SITE_TABS) {
    if (pathname === tab.href || pathname.startsWith(tab.href + "/")) {
      if (!best || tab.href.length > best.href.length) best = tab;
    }
  }
  return best?.href;
}
```

**The `Primitives` tab's `href` stops being hard-coded.** Today it is a literal `/docs/components/accordion`; it derives from the nav's first primitive child instead, because hard-coding it is a latent bug the day a primitive sorts ahead of `accordion`. Stage 3 wires the derivation once `lib/docs/nav.ts` exists; in this stage the tab renders from the constant and Task 3.1 replaces the value — record that as an open thread in the stage checklist.

- [ ] **Step 2: The header is ONE client component (§11.4)**

The tab bar needs `aria-current` inside a persistent layout — App Router does not re-render a shared layout when navigating between its children, so `aria-current` cannot be server-computed and needs `usePathname()`. A server header hosting four islands buys nothing when the serialized payload is five tabs.

Its feature list, stripped of dead paths, is exactly: **nav toggle (`lg:hidden`), logo, five `SITE_TABS` with `aria-current` (inline from `lg`), flexible spacer, search trigger (Stage 7), GitHub link, theme toggle, auth pill (Stage 6)**. What is not reproduced, because none of it is configured: `Ask` (no `ai.ask`), `LanguageSwitcher` / `localeSwitch` / the whole `i18n-ui` string merge (no locales), `NavSelector` / `versionSelector` (none configured), the banner.

**Blume's `tabsNavClass` deviation is kept:** inline tabs wait until `lg` on every page, not `md` for docs. The recorded reason — a hamburger plus a 294px tab bar in the same 768px row — still holds.

The GitHub link gains `noopener` alongside its existing `noreferrer` (§4.6).

The logo uses the existing `Logomark` React component, which the footer and landing page already use; `assets/logomark.svg` is byte-identical in path data and dies in Stage 10 (§14.6).

- [ ] **Step 3: The drawer, non-modal, from React state (§11.4)**

Today: one drawer per page, opened by pure CSS off an `<html>` attribute, with four attached behaviours. In React:

- open state is `useState` in a layout-level context (`drawer-context.tsx`) shared by the header button and the panel;
- `inert` renders from that state — `syncDrawerInert()`'s `MutationObserver` is deleted;
- the close-on-resize past `64rem` becomes a `matchMedia` listener;
- the scroll lock stays.

**`--blume-drawer-top` is deleted for a static `top-16`.** It exists only because a banner's text can wrap, so the header's bottom edge is not a constant — and **no banner is configured**. Its `getBoundingClientRect()` measurement, the re-measure-on-dismiss and the re-measure-on-resize all go with it (§14.7).

**The drawer stays hand-rolled rather than becoming the registry's `Sheet`.** Sheet is modal with a focus trap; this drawer is deliberately non-modal, a choice recorded in two places in the current source. A cutover whose whole point is attributable regressions is the wrong place to change focus behaviour on every page.

- [ ] **Step 4: The footer**

Port `site-footer.astro` markup verbatim to `site-footer.tsx`. Its **four external anchors carry `target="_blank" rel="noopener noreferrer"` literally in JSX** — the post-build regex pass dies with `blume.config.ts` (§4.6, §14.3). Nine anchors site-wide need this: footer ×4, landing ×4 (Stage 4), `privacy` ×1 (Stage 4).

- [ ] **Step 5: Verify and commit**

```bash
pnpm --filter @sevenui/web build && pnpm --filter @sevenui/web start &
sleep 3
curl -s http://localhost:3000/ | grep -c '<nav'            # header + footer navs
curl -s http://localhost:3000/ | grep -o 'rel="noopener noreferrer"' | wc -l   # expected: 4 (footer)
```

In the browser at 390px: the hamburger opens the drawer, the drawer's siblings go `inert`, body scroll locks, and resizing past 1024px closes it.

```bash
git add apps/web/components apps/web/lib/site-tabs.ts
git commit -m "feat(web): port the header, footer and drawer

The header is one client component because aria-current cannot be
server-computed inside a persistent layout; the drawer stays non-modal and
loses --blume-drawer-top, which existed only for a banner that is not
configured."
```

### Task 1.9: `app/not-found.tsx` (§11.7)

**Files:**
- Create: `apps/web/app/not-found.tsx`

**Interfaces:**
- Produces: the root 404 boundary. Stage 3 adds a second boundary at `app/docs/not-found.tsx`; the gallery and `/blocks` deliberately get none.

- [ ] **Step 1: Reproduce the content verbatim**

The 6xl muted "404", the `Page not found` h1, the sentence "We couldn't find the page you're looking for.", and an accent button to `/`. Read the exact markup and classes out of the live page rather than retyping:

```bash
curl -s https://sevenui.dev/this-path-does-not-exist | tee /tmp/live-404.html | wc -c   # expected: 21026
grep -o '<h1[^>]*>[^<]*</h1>' /tmp/live-404.html
```

- [ ] **Step 2: The chrome upgrade arrives for free**

The live 404 renders Blume's **default** header — logo plus GitHub only — because the generated `404.astro` never receives the `layout={{ Header }}` override the six custom pages pass. Measured against the landing page: 7,565 B / 2 links versus 9,882 B / 8 links, and **zero `<nav>` elements**. `app/not-found.tsx` sits under the root layout, so the real header arrives **without being asked for**. That is a defect corrected as a side effect of the port's structure, not as work.

- [ ] **Step 3: Two things must be written explicitly**

```tsx
import type { Metadata } from "next";
import { pageTitle } from "../lib/site";

// Blume sets noindex on its 404; Next does NOT add it to not-found.tsx
// automatically (§11.7).
export const metadata: Metadata = {
  title: pageTitle("Page not found"),
  robots: { index: false, follow: false },
};
```

The `<title>` gains the suffix — **"Page not found — SevenUI"** (§17.6 #28). §15.8 set that rule over the 85 live routes and the 404 sat outside that audit, but a rule with an exceptions list stops being a rule.

**Status codes need no work:** every miss probed today already returns 404 with this page, and Next's `not-found.tsx` returns 404 too.

- [ ] **Step 4: Verify and commit**

```bash
pnpm --filter @sevenui/web build && pnpm --filter @sevenui/web start &
sleep 3
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/nope     # expected: 404
curl -s http://localhost:3000/nope | grep -o '<title>[^<]*</title>'     # Page not found — SevenUI
curl -s http://localhost:3000/nope | grep -c 'noindex'                  # expected: >= 1
curl -s http://localhost:3000/nope | grep -c '<nav'                     # expected: >= 1 (the fix)
git add apps/web/app/not-found.tsx
git commit -m "feat(web): render the 404 inside the real chrome

The live 404 ships Blume's default header — two links, zero navs — because
the generated page never receives the header override. Under the root layout
it arrives correctly without being asked for; noindex and the title suffix
are declared explicitly."
```

### Task 1.10: The gate's own instrument (§17.2, §21.3)

**Files:**
- Create: `scripts/extract-page-features.mjs`, `scripts/route-inventory.mjs`
- Modify: root `package.json` (add `linkedom` devDependency and two scripts)

**Interfaces:**
- Produces:
  - `node scripts/extract-page-features.mjs <url-or-file>` → JSON `{ route, text, headings: [{depth, text, id}], links: [href] }`.
  - `node scripts/route-inventory.mjs` → the live route inventory, **derived** from the repo plus the live pro manifest, never transcribed.
- Consumed by: Stage 11's full gate, and by every stage's preview verification for the routes it touched.

**Why this is built in Stage 1 and not in Stage 11.** §21.3 names the failure mode precisely: §17's extractors are **new untested code whose worst failure is a vacuous pass** — an extractor returning nothing diffs clean against an extractor returning nothing, which would invalidate every other gate at once. Built now, the extractor can be proven against the **live Blume site on both sides**, where the right answer is already known.

- [ ] **Step 1: Add the parser**

```bash
pnpm add -D -w linkedom
```

A real DOM is required, not a regex: "visible text" means the document minus `<script>` and `<style>`, and heading IDs must come from parsed attributes.

- [ ] **Step 2: `scripts/extract-page-features.mjs`**

Extract exactly three things, per §17.2 — visible text, heading hierarchy **with anchor IDs**, and link targets. **Not arbitrary attributes**, which is what makes §13.3's `data-blume-*` → `data-sevenui-*` rename cost nothing at the gate.

```js
#!/usr/bin/env node
// §17.2's extractor. Deliberately blind to styling: the agreed bar accepts px
// drift and font-rendering differences, so screenshot diffing would manufacture
// false positives against a bar we already set.
import { parseHTML } from "linkedom";

export function extract(html, route) {
  const { document } = parseHTML(html);
  for (const el of document.querySelectorAll("script,style,template")) el.remove();
  const text = (document.body?.textContent ?? "").replace(/\s+/gu, " ").trim();
  const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => ({
    depth: Number(h.tagName.slice(1)),
    text: h.textContent.replace(/\s+/gu, " ").trim(),
    id: h.getAttribute("id") ?? null,
  }));
  const links = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
  return { route, text, headings, links };
}
```

The CLI half reads a URL or a file and prints the JSON.

- [ ] **Step 3: Prove it cannot pass vacuously**

Three assertions, all against the **live** site, where the answers are known:

```bash
# (a) Non-empty: a real page must produce real features.
node scripts/extract-page-features.mjs https://sevenui.dev/docs/components/button > /tmp/a.json
node -e 'const d=require("/tmp/a.json");if(!d.text.length||d.headings.length<5||d.links.length<20)throw new Error("vacuous extractor");console.log("ok", d.headings.length, "headings,", d.links.length, "links")'

# (b) Deterministic: the same page twice must be byte-identical.
node scripts/extract-page-features.mjs https://sevenui.dev/docs/components/button > /tmp/b.json
diff /tmp/a.json /tmp/b.json && echo "deterministic"

# (c) Discriminating: two DIFFERENT pages must differ.
node scripts/extract-page-features.mjs https://sevenui.dev/docs/components/dialog > /tmp/c.json
diff -q /tmp/a.json /tmp/c.json || echo "discriminates"

# (d) Anchor IDs are actually captured — the hard gate of §17.2.
node -e 'const d=require("/tmp/a.json");const withId=d.headings.filter(h=>h.id);if(withId.length<4)throw new Error("anchor IDs not captured");console.log("anchor ids:", withId.length)'
```

All four must pass before the extractor is trusted by any later stage. Record the numbers in the stage checklist.

- [ ] **Step 4: `scripts/route-inventory.mjs`**

Derives the inventory from the repo plus the live pro manifest — **never a checked-in list** (§17.1). It emits four sections: docs routes from `apps/web/docs/**/*.mdx`, gallery routes from the gallery page set, blocks routes from `https://pro.sevenui.dev/r/pro-manifest.json` (1 + groups + categories), and the standalone five plus 404.

The reason it must derive rather than freeze: the `/blocks` count moved from 16 to 18 **during the spec effort**. A frozen list rots the moment pro ships a category, and preserving that property is exactly the promise this migration exists to make.

```bash
node scripts/route-inventory.mjs | tee /tmp/inventory.json | node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const i=JSON.parse(s);
console.log("docs",i.docs.length,"gallery",i.gallery.length,"blocks",i.blocks.length,"standalone",i.standalone.length);});'
```

Expected today: docs 68, gallery 11, blocks 18, standalone 5 → **101 HTML routes with the 404**. If blocks is not 18, the pro manifest changed — that is information, not a failure; record the new number.

- [ ] **Step 5: Wire the scripts and commit**

Root `package.json` gains:

```json
    "inventory": "node scripts/route-inventory.mjs",
    "extract": "node scripts/extract-page-features.mjs"
```

```bash
git add scripts/extract-page-features.mjs scripts/route-inventory.mjs package.json pnpm-lock.yaml
git commit -m "test(repo): build the parity gate's extractor and route inventory

The extractor is new untested code whose worst failure is a vacuous pass, so
it is proven against the live site on both sides — non-empty, deterministic,
discriminating, and capturing anchor IDs — before any stage trusts it."
```

### Stage 1 — Definition of done

- `pnpm --filter @sevenui/web build` runs `next build` and succeeds; `.next/` is gitignored; `public/r/` still holds 247 JSON files.
- `pnpm typecheck` is **green across the whole `apps/web` tree** — proof obligation #7 measured, recorded and cleared, with the `include` not narrowed.
- `app/globals.css` is one ~290-line file containing **zero** occurrences of `blume` and zero `prefers-color-scheme` rules; the 9 ported `@theme` entries and the 6 ported base rules are present; the 4 dead tokens and the dead `body { background-* }` rule are absent.
- `<html>` carries `lang`, `data-theme`, `data-pm` and the two font variables; the theme toggle writes both `theme` and `blume-theme`.
- Header, footer and drawer render on every route; the drawer is non-modal, `inert`-syncs from state, and closes past `64rem`.
- `/nope` returns **404** with the real chrome, `noindex`, and the title `Page not found — SevenUI`.
- `scripts/extract-page-features.mjs` passes all four anti-vacuity assertions; `scripts/route-inventory.mjs` reports 101 HTML routes.
- Task 1.0's verdict is recorded, with the fallback taken if the preset was pinned.

### Stage 1 — Preview verification

Push the branch; verify on **this branch's own preview URL** (or the second project, on P1's fallback path):

| Check | Expectation |
|---|---|
| Deployment framework | Builds as Next.js; `main`'s production deploy is untouched and still Astro |
| `/` | The Stage 1 stub renders inside the real header/footer |
| `/nope` | 404 status, real header (`<nav>` present — the live site has zero), `noindex`, correct title |
| Theme | Toggle flips `data-theme`; `localStorage.theme` **and** `localStorage["blume-theme"]` both update; no transition flash; OS change followed live with no stored preference |
| `data-pm` | Present on `<html>` at first paint (view source, not DevTools — it must be in the document) |
| Drawer | 390px: opens, locks scroll, siblings `inert`; closes when the viewport passes 1024px |
| Rewrites | `/r/pro-manifest.json` still returns the pro manifest (preview inherits `vercel.json`) |
| Fonts | Inter and IBM Plex Mono load; no FOIT |

Widths 390 / 768 / 1440, themes light and dark (§17.3). Only the shell is reviewed — there is no content yet.

### Stage 1 — §17.6 rows expected here

- **#14** — the global focus ring is `var(--foreground)` instead of `var(--blume-accent)`; a ≤0.025 L difference, dark mode only.
- **#28** — the 404 `<title>` gains the suffix.

Also expected and **not** a §17.6 row: the 404 gains the real header (§11.7 records this as a defect corrected by structure), and `/blume-assets/*` is absent (it 404s today — spec §17.6's closing note).

### Stage 1 — Proof obligations

- **P1 (Vercel framework preset)** — Task 1.0. Fallback: a second Vercel project on the branch.
- **#7 (widened tsconfig error count)** — Task 1.2 Step 6. No fallback; clearing the errors is the task.

### Stage 1 — Record

`.scratch/blume-to-nextjs/verification/stage-1.md`: the P1 verdict, the `tsc` error count before and after clearing, the `globals.css` line count and the `grep -c blume` result, the four extractor assertions with their numbers, the route-inventory counts, and the preview table above with a verdict per row.

---

# Stage 2 — Docs content pipeline and inline demos

68 routes render their real content: prose, code, install blocks and **inline** demos. No sidebar, no TOC, no breadcrumb — Stage 3 adds the furniture. This is the stage that carries **eight** of §17.6's 28 rows and **two** of the six proof obligations, because it is where the port stops being structural.

**Corpus facts, measured, that this stage may rely on (§4):** 68 `.mdx` files; frontmatter is exactly `title` + `description` on all 68, no other key anywhere; tables in 57 of 68; zero strikethrough, task lists, footnotes or HTML comments; zero `# ` (h1) in any file; exactly one duplicate heading text (`toggle.mdx` → "Examples"); zero headings containing a link; no fence meta anywhere.

### Task 2.1: The content index (§4.2)

**Files:**
- Create: `apps/web/lib/docs/index.ts`, `apps/web/lib/docs/schema.ts`, `apps/web/lib/docs/headings.ts`

**Interfaces:**
- Produces:
  - `type DocPage = { route: string; title: string; description: string; headings: Heading[]; sourcePath: string; raw: string }`
  - `type Heading = { depth: 2 | 3; text: string; id: string }`
  - `getDocIndex(): Promise<DocPage[]>` — **server-only**, memoized in production, re-read per request in dev.
  - `getDoc(route: string): Promise<DocPage | undefined>`
- Consumed by: the page render, `generateStaticParams`, the nav tree, prev/next, the TOC, the search index, `sitemap.xml`, `llms.txt`, the `.md` endpoints and `lib/page-meta.ts`. **Every consumer runs at build time on the server.** `fs` never reaches the client.

- [ ] **Step 1: Install the two readers**

```bash
pnpm --filter @sevenui/web add vfile-matter vfile github-slugger
```

`zod` is already a dependency from Task 1.2.

- [ ] **Step 2: The schema fails the build (§4.2)**

`lib/docs/schema.ts`:

```ts
import { z } from "zod";

// Missing or malformed frontmatter FAILS THE BUILD, as Blume's content
// collection schema does today. `description` feeds both <meta> and the OG
// card, so a silent empty string is a production regression, not a warning.
export const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});
```

`.strict()` is deliberately **not** used: the corpus has exactly these two keys today, but rejecting an unknown key would be a new rule the spec did not set.

- [ ] **Step 3: The index — ~60 lines, no codegen**

`lib/docs/index.ts` reads `apps/web/docs/` with `fs`, parses frontmatter with `vfile-matter`, validates with the schema, and derives `route` from the path: `docs/index.mdx` → `/docs`, `docs/installation.mdx` → `/docs/installation`, `docs/components/button.mdx` → `/docs/components/button`.

```ts
import "server-only";
```

as the first line. Memoization:

```ts
let cached: Promise<DocPage[]> | undefined;

export function getDocIndex(): Promise<DocPage[]> {
  if (process.env.NODE_ENV === "production" && cached) return cached;
  const p = readAll();
  if (process.env.NODE_ENV === "production") cached = p;
  return p;
}
```

**No watcher, no generate step.** MDX bodies hot-reload through Turbopack HMR; reading 68 frontmatter blocks is a few ms, so dev re-reads per request. A new file is picked up because the catch-all matches any slug and the index re-reads; a deleted file 404s from the index.

Four alternatives were measured and rejected (§4.2) and none may be reintroduced: a checked-in JSON (a drifting artifact plus watcher debt), `velite` (broken under Turbopack on a vendored Zod v3), `content-collections` (routes MDX through `mdx-bundler` + `esbuild`), `contentlayer` (dead) and `next-mdx-remote` (archived, open RSC-breaking bug on Next 15.2+).

- [ ] **Step 4: The heading scan (§4.5)**

`lib/docs/headings.ts` scans the **raw MDX text**, not compiled output. Three reasons, all binding: `vfile.data` is unreachable through `@next/mdx` (it is a loader — it stringifies and discards the VFile); the same scan already feeds search and link validation; and it keeps the TOC out of the RSC payload path.

Depth is fixed at **h2 + h3**, as today. IDs come from **`github-slugger`** — the same library `rehype-slug` uses — so the IDs match by construction:

```ts
import GithubSlugger from "github-slugger";

export function scanHeadings(raw: string): Heading[] {
  const slugger = new GithubSlugger();       // one instance per document
  const out: Heading[] = [];
  for (const line of stripFences(raw).split("\n")) {
    const m = /^(#{2,3})\s+(.+?)\s*$/u.exec(line);
    if (!m) continue;
    const text = m[2];
    out.push({ depth: m[1].length as 2 | 3, text, id: slugger.slug(text) });
  }
  return out;
}
```

`stripFences` must remove fenced code blocks before scanning — a `## ` inside a bash fence is not a heading. The scan is otherwise safe because **no file contains an h1** and **every heading is literal text**: no `{frontmatter.title}` interpolation, no JSX-produced headings.

The page title `<h1>` carries **no `id`** and must **not** advance the slugger. Verified live against three cases: `...radiogroup--contextmenuradioitem` preserves a double hyphen, `detached-triggers-createhandle`, and `examples` / `examples-1` (the corpus's one duplicate, in `toggle.mdx`).

- [ ] **Step 5: Verify against the live site**

```bash
pnpm --filter @sevenui/web exec node --experimental-strip-types -e '
import("./lib/docs/index.ts").then(async (m) => {
  const idx = await m.getDocIndex();
  console.log("pages:", idx.length);
  console.log("headings:", idx.reduce((n, p) => n + p.headings.length, 0));
  const toggle = idx.find((p) => p.route === "/docs/components/toggle");
  console.log(toggle.headings.filter((h) => h.text === "Examples").map((h) => h.id));
})'
```

Expected: **68** pages, **509** headings, and the toggle duplicate emitting `["examples","examples-1"]`. Cross-check three IDs against production:

```bash
curl -s https://sevenui.dev/docs/components/context-menu | grep -o 'id="[^"]*radiogroup--contextmenuradioitem"'
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/docs apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): read the docs corpus into a typed content index

A server-only fs read with a zod schema that fails the build on malformed
frontmatter, memoized in production and re-read per request in dev. Heading
IDs come from github-slugger, the same library rehype-slug uses, so anchors
match by construction."
```

### Task 2.2: The nav tree — declare the shape, derive the set (§5)

**Files:**
- Create: `apps/web/lib/docs/nav.ts`
- Modify: `apps/web/lib/site-tabs.ts` (derive the Primitives tab's `href`)

**Interfaces:**
- Produces:
  - `type NavLink = { label: string; href: string }`
  - `type NavGroup = { label: string; children: NavLink[]; href?: string }` — **a group carries no `href` except the one narrowing §11.3 introduces**
  - `type NavNode = NavLink | NavGroup` — the union every consumer walks
  - `getNavTree(): Promise<(NavLink | NavGroup)[]>`
  - `getPrevNext(route: string)` — prev/next reads the **nav tree**, not the file tree, because that is what ships today and the file tree cannot express the "Primitives" group.
- Consumed by: Stage 3's sidebar and pagination, Stage 7's palette, Stage 8's `llms.txt`.

- [ ] **Step 1: Declare the skeleton, derive the children**

```ts
// Hybrid: the shape is declared, the set is derived. The 65-entry
// hand-maintained list in blume.config.ts dies — a new primitive reaches the
// sidebar by shipping its .mdx and nothing else.
const SKELETON = ["/docs", "/docs/installation", "/docs/theming"] as const;
const PRIMITIVES_GROUP = "Primitives";
```

Labels come from the index's `title`. The group's children are every content-index route under `/docs/components/`, **slug-sorted**.

- [ ] **Step 2: Sort by slug, and know why**

Order is a slug sort, automatic. Two facts travel with it as comments:

- **Filename sort is not slug sort.** `alert-dialog.mdx` sorts before `alert.mdx` because `-` < `.`, and five pairs collide: `alert`, `button`, `input`, `message`, `toggle`. Sort the **route**, not the filename.
- **The key is the slug, not the title.** Title sort equals slug sort for all 65 today, but the slug is the frozen URL while `title` is content: editing a heading must not silently reorder 65 links.

Verified: today's config order is *exactly* slug-alphabetical and set-identical to the 65 files, so automatic ordering reproduces the live sidebar byte-for-byte.

If a hand-held order is ever wanted the extension is one line (an optional `order: string[]` prefix, slug-sorted tail). **It is not built now.**

- [ ] **Step 3: The build-time assertion (§5)**

```ts
// Nothing checks this today, and Blume silently dumps an orphan page into
// llms.txt's "## Other" section.
function assertNavCoversIndex(index: DocPage[], tree: NavNode[]): void {
  const inNav = new Map<string, number>();
  walk(tree, (href) => inNav.set(href, (inNav.get(href) ?? 0) + 1));
  for (const page of index) {
    const n = inNav.get(page.route) ?? 0;
    if (n !== 1) throw new Error(`nav must contain ${page.route} exactly once, found ${n}`);
  }
}
```

Every index route must appear in the nav **exactly once**. Throw, do not warn.

- [ ] **Step 4: Labels can never become URLs, by type**

A link node is `{ label, href }`; a group node is `{ label, children }` and carries no `href`. **No `slugify(label)`-shaped call exists anywhere in the port** — the label has exactly one legitimate output path, `llms.txt`'s `## Primitives` heading (§15.4). Stage 3 adds the group's optional `href`, whose value still comes only from the content index's `route`.

Keep loose root pages distinguishable from grouped ones in the tree's shape: §15.4's `## Docs` heading is Blume's hard-coded string for loose root pages, not a configured label, and Stage 8's emitter needs to tell them apart.

- [ ] **Step 5: Close Stage 1's open thread — the Primitives tab derives its href**

In `lib/site-tabs.ts`, the `Primitives` tab's `href` stops being the hard-coded `/docs/components/accordion` and comes from the nav's **first primitive child**. Hard-coding it is a latent bug the day a primitive sorts ahead of `accordion`. Since `SITE_TABS` is plain data consumed by a client component, resolve the href on the server (in the layout) and pass it down, or export a `getSiteTabs()` that takes the first-primitive route — **do not** import the content index from the client component.

- [ ] **Step 6: Verify against the live sidebar and commit**

```bash
curl -s https://sevenui.dev/docs/components/button | node scripts/extract-page-features.mjs - \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const d=JSON.parse(s);
  const nav=d.links.filter(h=>h.startsWith("/docs/components/"));
  console.log("live sidebar links:", new Set(nav).size);});'
```

Expected: 65 distinct primitive links. Compare the derived tree's children array against that set — it must be **set-identical and order-identical**.

```bash
git add apps/web/lib/docs/nav.ts apps/web/lib/site-tabs.ts
git commit -m "feat(web): derive the docs nav from the content index

The skeleton is declared and the Primitives set derived, slug-sorted; a
build-time assertion requires every index route to appear exactly once, which
nothing checks today. The Primitives tab's href stops being hard-coded."
```

### Task 2.3: The remark/rehype chain and the two highlighters (PROOF #2)

**Files:**
- Create: `apps/web/lib/shiki.ts`, `apps/web/mdx.d.ts`
- Modify: `apps/web/next.config.ts`

**Interfaces:**
- Produces: `.mdx` files are importable modules whose default export is a React component; `highlight(code, lang): Promise<string>` for the non-MDX code paths (demo sources, `<InstallCommand>`, Stage 4's gallery cards).

- [ ] **Step 1: Install the chain — exactly these, in this order**

```bash
pnpm --filter @sevenui/web add @next/mdx @mdx-js/loader @mdx-js/react \
  remark-frontmatter remark-gfm rehype-slug rehype-autolink-headings \
  @shikijs/rehype@4.4.3 rehype-external-links shiki@4.4.3
```

The chain is **locked** (§4.3):

```
remark:  remark-frontmatter(['yaml'])  ->  remark-gfm
rehype:  rehype-slug  ->  rehype-autolink-headings(wrap)  ->  @shikijs/rehype  ->  rehype-external-links
```

`rehype-slug` **must** precede `rehype-autolink-headings` — it writes the `id` the anchor links to. Shiki emits no `<a>`, so its position is free.

**Every option in this chain is plain data**, which satisfies Turbopack's constraint that loader options be JSON-serializable primitives, objects and arrays. That constraint is what kills function-valued plugin options, and it is why `rehype-external-links` needs no function-valued `test` (Task 2.9 removes the five same-origin absolute links that would have required one).

Not in the chain, deliberately: element overrides (a plain object passed at render time, Task 2.4), the TOC (Task 2.1's text scan), and `remark-mdx-frontmatter` (`title`/`description` come from the index; the chain's only frontmatter job is stripping it from the output).

- [ ] **Step 2: Wire it into `next.config.ts`**

```ts
import createMDX from "@next/mdx";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import rehypeExternalLinks from "rehype-external-links";

const withMDX = createMDX({
  options: {
    remarkPlugins: [[remarkFrontmatter, ["yaml"]], remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypeShiki, {
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
      }],
      [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
    ],
  },
});

export default withMDX(nextConfig);
```

`pageExtensions` is **not** extended: route-file MDX was rejected (§4.1) — the 68 files stay in `apps/web/docs/` and are imported as modules.

`apps/web/mdx.d.ts`:

```ts
declare module "*.mdx" {
  import type { MDXProps } from "mdx/types";
  export default function MDXContent(props: MDXProps): JSX.Element;
}
```

- [ ] **Step 3: Dual-theme CSS, with no `prefers-color-scheme` anywhere**

`defaultColor: false` makes Shiki emit `--shiki-light` / `--shiki-dark` variables. Select them with `:root[data-theme="dark"]` and **no `prefers-color-scheme` rules at all** — matching today exactly. Add the selection rules to `globals.css`:

```css
:root[data-theme="dark"] .shiki,
:root[data-theme="dark"] .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}
```

Read the live rules out of the current stylesheet before writing these and reproduce them, rather than inventing a variant.

- [ ] **Step 4: The second highlighter — one instance, memoized for the whole build (§4.4)**

A highlighter instance is not JSON-serializable, so the loader cannot share the one used for demo sources, `<InstallCommand>` and the gallery cards. Both run the **4-grammar fine-grained bundle** — 287 KB versus 11 MB for the full bundle, byte-identical output on all 214 real blocks.

`apps/web/lib/shiki.ts`:

```ts
import "server-only";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

// The languages are exactly these four, and there is NO fence meta anywhere in
// the corpus — no titles, line numbers, ranges, `// [!code …]`, inline {:ts} or
// twoslash — so 7 of Blume's 8 transformers are moot and rehype-pretty-code
// buys nothing (§4.4).
const highlighterPromise = createHighlighterCore({
  themes: [import("@shikijs/themes/github-light"), import("@shikijs/themes/github-dark")],
  langs: [
    import("@shikijs/langs/tsx"),
    import("@shikijs/langs/css"),
    import("@shikijs/langs/bash"),
    import("@shikijs/langs/json"),
  ],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

// THE ONE BINDING RULE (§4.4, §18.5): highlight each unique source once and
// memoize it for the whole build. The 137 demo sources recur across pages.
// Measured: 322 blocks / 207 KiB takes 740 ms with per-call codeToHtml versus
// 576 ms with a reused highlighter.
const cache = new Map<string, string>();

export async function highlight(code: string, lang: "tsx" | "css" | "bash" | "json"): Promise<string> {
  const key = `${lang} ${code}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const hl = await highlighterPromise;
  const html = hl.codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
  cache.set(key, html);
  return html;
}
```

- [ ] **Step 5: PROOF OBLIGATION #2 — `@shikijs/rehype` under Turbopack**

````bash
cat > apps/web/docs/probe.mdx <<'EOF'
---
title: Probe
description: Chain probe.
---

## Heading with a [link](https://example.com)

```tsx
export const x = <div className="a" />;
```

| a | b |
| - | - |
| 1 | 2 |
EOF
pnpm --filter @sevenui/web build
````

Expected: the build succeeds, and the emitted HTML for `/docs/probe` contains `class="shiki"`, both `--shiki-light` and `--shiki-dark` custom properties, an `<h2 id="heading-with-a-link">` wrapped in an `<a>`, `target="_blank"` on the example.com link, and a `<table>`.

**If it fails** (loader-option serialization, a Turbopack/Shiki interaction, or a WASM resolution error), take the declared fallback: highlighting moves to an **async RSC `pre`/`code` override** (§4.4). That collapses the two code paths and erases the five class-name differences, and the "no fence meta" finding makes it technically safe. It was rejected only because it moves highlighting from compile time to render time, losing Turbopack's per-file loader cache. **Record the verdict in the spec** if the fallback is taken — do not improvise a third approach.

```bash
rm apps/web/docs/probe.mdx
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/next.config.ts apps/web/lib/shiki.ts apps/web/mdx.d.ts apps/web/app/globals.css apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): lock the remark/rehype chain and the two highlighters

Every plugin option is plain data, which is what Turbopack's JSON-serializable
loader-option constraint requires. The non-MDX code paths share one
fine-grained 4-grammar highlighter whose output is memoized for the build."
```

### Task 2.4: The prose layer — nine element overrides and `CodeBlock`

**Files:**
- Create: `apps/web/mdx-components.tsx`, `apps/web/components/mdx/code-block.tsx`, `apps/web/components/mdx/copy-button.tsx`, `apps/web/lib/docs/elements.ts`

**Interfaces:**
- Produces: `useMDXComponents()` returning the **closed** element map; `<CodeBlock>` as the shared code-block primitive for all 154 fences **and** `<InstallCommand>`.

- [ ] **Step 1: Nine overrides, and no `@tailwindcss/typography`**

The element set is exactly **9**, measured: inline `code` (1823 uses / 68 files), `table`/`th`/`td` (507 rows / 57), `h3` (260 / 64), `h2` (249 / 68), `pre` (154 / 67), `a` (98 / 56), `strong` (90 / 17), `ul`/`li` (46 / **7**), `p` (68).

**Absent from all 68 files:** `h1`, `h4`–`h6`, ordered lists, blockquote, `hr`, images, `em`, strikethrough, task lists, HTML comments. Thirteen element types the plugin would style and nothing would ever render — and taking the plugin would also mean inheriting its `.prose`-scoped descendant selectors, which Blume's own rules already fight with `!important` and an `:is()` specificity bump.

**There is no `.prose` class in the port.** This is load-bearing for Task 2.6's isolation rules.

- [ ] **Step 2: Read the values from computed styles, not from Blume's override file**

Blume only *overrides* some properties; the rest fall through to the Typography plugin's defaults, so the rendered value is a **merge**. `h2` is the clear case: Blume sets `font-size`, `line-height` and `margin-top` and says nothing about `margin-bottom`, which the plugin supplies. Open a live docs page and read `getComputedStyle` for each of the nine before writing a class.

What Blume does set, and the port must reproduce (§6):

- Body `0.875rem` / `1.7`, color **`muted-foreground`** — headings are `foreground`, body text is muted. A deliberate signature, not an accident. **These three land on the `p`, `li` and `td` overrides, never on a container** (Task 2.6's rule (a)).
- Headings weight `500`, `overflow-wrap: break-word`, display font, `-0.05em` tracking. `h2` `1.875rem`/`1.2`, `margin-top: 3rem` zeroed (with `border-top`) when first child. `h3` `1.25rem`/`1.35`.
- `p`, `ul`, `ol`: `margin: 1rem 0`. `strong`: `600`.
- `a`: `foreground`, weight `500`, **dotted** underline, 1px, offset `0.2em`.
- `table`: `0.8125rem`.
- `pre`: transparent background, 1px border, `--radius`, `0.8125rem`/`1.55`, `margin: 1.5rem 0`, `padding: 1rem 0`; **the `<code>` inside is the scroller** (`max-height: 24rem`, both axes, thin theme-colored scrollbars) so the `<pre>` stays static and the pinned copy button never drifts.

The display font and the `-0.05em` tracking live **here**, in the heading overrides, because Stage 1 deliberately did not declare a bare `h1`-`h6` rule (§7.2d).

- [ ] **Step 3: The two `blume-*` classes become inline utilities (§4.7, §17.6 #5)**

Both are expressible as plain data, so neither breaks the Turbopack constraint. Copy these verbatim:

Heading anchor (part of the `h2`/`h3` override, via `rehype-autolink-headings`' `wrap`):

```
text-inherit font-inherit no-underline after:content-['#'] after:ms-[0.35em] after:text-muted-foreground after:opacity-0 after:transition-opacity after:duration-150 hover:after:opacity-100 focus-visible:after:opacity-100
```

Table scroll wrapper (produced by the **`table` element override**, not a rehype plugin):

```
my-6 overflow-x-auto rounded-lg border border-border [&>table]:m-0 [&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2
```

The `:is(th,td)` selector in Blume's CSS exists only to out-specify Blume Typography's `:where()`-scoped rules. With `.prose` gone that specificity war disappears, so this **simplifies** the CSS rather than carrying it over. **No new bespoke class names are coined** — that is the second half of §17.6 #5.

- [ ] **Step 4: `CodeBlock` — the copy button has no server markup today**

`copy-command.tsx` does **not** cover this: different UI (a `$ command` row), different timing, no live region, and used only by the landing page and the gallery cards. Write the code-block copy button as part of `CodeBlock`, reproducing today's behaviour exactly:

- `absolute right-3 top-2` (`top-2.5` in tabs), a **30px** chip;
- lucide copy → check with a `scale-0` swap;
- a **1500 ms** hold that **restarts on repeat**;
- **no flash on clipboard failure**;
- `aria-label` swap;
- **one shared `div[role="status"].sr-only`** — one per page, not one per block.

The same component pretty-labels `data-language` (`tsx` → `TSX`) and puts `tabindex` on **`<code>`, not `<pre>`** — because the `<code>` is the scroller.

`blume-source` is **obsolete on arrival** and is not ported: its one job was making the `<pre>` a non-scrolling full-height flex column so the absolutely-pinned copy button never drifted — a height that came from the preview **iframe's** postMessage. Demos render inline now, so the contract it served is gone.

- [ ] **Step 5: Close the element map and assert it (§6)**

`mdx-components.tsx` declares exactly the 9 overrides plus `Component`, `InstallCommand` and (Stage 3) `PrimitiveIndex`. `lib/docs/elements.ts` rides on the content index's **existing** text scan:

```ts
// If any MDX file introduces an element with no override, the build fails.
// Cost is zero, and it converts "the corpus is narrow" from a lucky fact into
// an invariant — the day someone writes a blockquote it is a build error
// rather than a silently unstyled page (§6).
const FORBIDDEN: Array<[RegExp, string]> = [
  [/^\s*>\s/mu, "blockquote"],
  [/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/mu, "hr"],
  [/^\s*#{4,6}\s/mu, "h4-h6"],
  [/^\s*#\s/mu, "h1"],
  [/^\s*\d+\.\s/mu, "ordered list"],
  [/!\[[^\]]*\]\(/u, "image"],
  [/~~[^~]+~~/u, "strikethrough"],
  [/^\s*[-*]\s+\[[ x]\]/mu, "task list"],
  [/<!--/u, "html comment"],
];
```

Run it over the raw MDX with fences stripped, and throw naming the file and the construct. Also assert the **JSX tag set**: every `<Tag` outside an inline code span must be one of `Component`, `InstallCommand`, `PrimitiveIndex`. A fence-only scan reports 15 more tags in the corpus — **every one of them sits inside an inline code span**, prose about a component rather than a use of one — so the scan must exclude inline code, or it will produce 15 false failures.

- [ ] **Step 6: Nothing else is ported (§6)**

**All 35 Blume content components are dropped.** The general rule this settles: **a component with zero uses does not get built during the migration.** Do not reopen `AutoTypeTable` (provably cannot work: 59 of 65 registry components have no named props type), `TypeTable` (a Fumadocs-style disclosure grid, zero uses), `Diff` (would mean a declarative shadow root and a second theming bridge) or `GithubInfo` (a rate-limited build-time API call). If a docs page later wants an admonition, the answer is the registry's `alert` primitive, not Blume's `<Callout>`.

- [ ] **Step 7: Commit**

```bash
pnpm --filter @sevenui/web typecheck
git add apps/web/mdx-components.tsx apps/web/components/mdx apps/web/lib/docs/elements.ts
git commit -m "feat(web): hand-write the prose layer as nine element overrides

Measured against the corpus: nine element types render, thirteen never do.
The element map is closed and asserted at build time, the two blume-* classes
become inline utilities, and the code-block copy button gains server markup."
```

### Task 2.5: The docs route (§4.1)

**Files:**
- Create: `apps/web/app/docs/[[...slug]]/page.tsx`

**Interfaces:**
- Consumes: `getDocIndex`, `getDoc`, `useMDXComponents`.
- Produces: 68 statically generated routes. Stage 3 wraps them in `app/docs/layout.tsx`; Stage 8 reads the same index for the `.md` mirrors.

- [ ] **Step 1: One catch-all, `generateStaticParams`, dynamic import**

```tsx
import { notFound } from "next/navigation";
import { getDoc, getDocIndex } from "../../../lib/docs";

export async function generateStaticParams() {
  const index = await getDocIndex();
  return index.map((p) => ({
    slug: p.route === "/docs" ? [] : p.route.slice("/docs/".length).split("/"),
  }));
}

export default async function DocPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;            // params is a Promise in Next 16
  const route = slug.length ? `/docs/${slug.join("/")}` : "/docs";
  const doc = await getDoc(route);
  if (!doc) notFound();
  const { default: MDXContent } = await import(`../../../docs/${slug.length ? slug.join("/") : "index"}.mdx`);
  return (
    <article>
      <h1>{doc.title}</h1>
      <MDXContent />
    </article>
  );
}
```

The specifier is **relative and literally prefixed** — Turbopack builds the context module from the static prefix `../../../docs/`. The `@docs/*` alias exists for static imports and type resolution; it is deliberately not used in the dynamic specifier.

Rejected shapes, not to be revisited (§4.1): route-file MDX (would move 68 files into `app/`, cannot serve the `.md` endpoints from the same source, and forces shared layout data through per-file exports) and `next-mdx-remote-client/rsc` (its only advantage was `vfile.data.toc`, which the text scan makes unnecessary).

- [ ] **Step 2: Metadata, through the one title rule (§15.8, §17.6 #17)**

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const doc = await getDoc(routeFrom(await params));
  if (!doc) return {};
  return {
    title: pageTitle(doc.title),                // "Button — SevenUI", em dash
    description: doc.description,
    openGraph: {
      title: pageTitle(doc.title),             // og:title follows <title>
      description: doc.description,
      images: [{ url: `/og${doc.route}.png`, alt: pageTitle(doc.title) }],
    },
  };
}
```

This is where the 68 docs `<title>`s move from Blume's ASCII hyphen to the em dash, taking `og:title` and `og:image:alt` with them (verified: they follow `<title>` on every page today). `<h1>` is bare everywhere and does **not** move.

Widen `lib/page-meta.ts`'s resolver to answer for docs routes from the content index in this step, so Stage 9's OG route reads the same `{title, description}` the page declares (§16.8).

- [ ] **Step 3: Verify the first render**

```bash
pnpm --filter @sevenui/web build 2>&1 | grep -E '/docs|Generating static pages'
```

Expected: 68 `/docs/...` entries in the static route list.

```bash
pnpm --filter @sevenui/web start &
sleep 3
curl -s http://localhost:3000/docs/theming | grep -o '<title>[^<]*</title>'
# expected: <title>Theming — SevenUI</title>
curl -s http://localhost:3000/docs/theming | grep -c 'class="shiki"'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/docs/not-a-page   # 404
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/docs
git commit -m "feat(web): render the 68 docs routes from one catch-all

generateStaticParams walks the content index; the MDX body is a dynamic
import with a literal static prefix, so Turbopack builds the context module
without codegen. Titles pick up the em-dash rule in one place."
```

### Task 2.6: Inline demos (PROOF #1)

**Files:**
- Create: `apps/web/components/mdx/component.tsx` (server), `apps/web/components/demo/preview-pane.tsx` (server), `apps/web/components/demo/demo-tabs.tsx` (client)
- Modify: `apps/web/app/globals.css` (the `[data-sevenui-example]` rules)

**Interfaces:**
- Produces: `<Component path="button/button-demo" />` and `<Component path="sidebar/sidebar-demo" contain />`. Stage 4's gallery adopts the **same** `PreviewPane`.

**The reason this exists.** The 137 docs demos move from iframes to inline rendering because of a real defect: an iframe is its own document, so a Dialog/Sheet/Drawer/Command overlay opened inside a demo is clipped to the frame instead of covering the viewport. `/blocks` previews stay iframes — they are license-gated pages served from `pro.sevenui.dev` through the `vercel.json` rewrites.

**This is not greenfield.** The `/components` gallery already renders registry components in-document today: 10 pages, 40 items, no iframe, a preview pane of `flex min-h-72 items-center justify-center bg-background p-6 sm:p-10` whose `min-h-72` is 288px — byte-for-byte Blume's own `MIN_PANE_PX`. The docs demos adopt **that** component; the two surfaces converge on one preview rather than growing a second.

- [ ] **Step 1: Resolve the demo in a server component (PROOF OBLIGATION #1)**

```tsx
// A server component. No forced client boundary: the 56 demos with no
// directive render with zero client JS, and the 81 "use client" demos become
// client islands automatically (§7.1).
export async function Component({ path, contain = false }: { path: string; contain?: boolean }) {
  const { default: Demo } = await import(`@/registry/demos/${path}.tsx`);
  const source = await readDemoSource(path);   // same server-only fs module as the content index
  ...
}
```

`path` is the frozen `"button/button-demo"` value. The Code tab's source is read **from disk by the same server-only module that reads the content index** — no `?raw`, no second mechanism — and the raw text ships unchanged **including the `"use client"` line on 81 of 137 demos**.

**The check:** the first real build must render a **nested** demo (`button/button-demo` is one directory deep — that nesting is the claim). Verify the built HTML for `/docs/components/button` contains the demo's own markup, not an empty pane.

**If it fails:** take the declared fallback — a build script emits `lib/docs/demos.ts`, a literal 137-entry map of `() => import(...)` thunks. **The import expression changes, not §7.1's decision.** Record the verdict in the spec.

- [ ] **Step 2: `client:visible` is not reproduced, and that is recorded, not accidental**

An IntersectionObserver wrapper would itself have to be a client component, dragging all 137 demos back across the boundary and defeating the split. The consequence: hydration moves from on-scroll to on-load, so a page with four interactive demos hydrates four islands immediately. §18 owns the number.

**Do not reopen this preemptively** — reopening is *larger* than it looks: in Astro `client:visible` defers hydration only while the bytes ship either way, whereas Next's `next/dynamic` also splits the chunk, so scroll-gating would move payload **and** main-thread time. The correct behaviour is to measure `/docs/components/chart` and `/docs/components/button` in Stage 11 and reopen only if the measured INP is bad.

- [ ] **Step 3: CSS isolation without a frame — all four rules (§7.2)**

`.prose` is gone, so the descendant-cascade problem dissolves and what remains is two narrower channels — plain inheritance, and global element selectors. Both need an owner:

**(a) Nothing inheritable is set on any ancestor of the demo.** Task 2.4's body typography (`0.875rem` / `1.7` / `muted-foreground`) lands on the `p`, `li` and `td` overrides, never on a container. Audit this after writing Task 2.4's overrides: `grep` the docs layout and page for `text-sm`, `leading-`, `text-muted-foreground` on any wrapping element.

**(b) The preview container carries the layout contract.** In `globals.css`:

```css
/* demos/theme.css's [data-blume-example] rule, carried over verbatim under
   the renamed hook (§13.3). The hard-won fix without which the 64 w-full
   demos collapse to content width. Load-bearing regardless of (a). */
[data-sevenui-example] {
  display: grid;
  width: 100%;
  justify-items: center;
}
```

**(c) The container re-establishes the demo's root context.** This is **parity work, not a guard**: it is `demos/theme.css`'s `body { background-color; color }` rule with its selector changed. The frame's `body` gave every demo its typographic starting point; removing the frame means that rule needs a new owner.

```css
[data-sevenui-example] {
  font-size: 1rem;
  line-height: normal;
  color: var(--foreground);
  background: var(--background);
  font-family: var(--font-sans);
  letter-spacing: normal;
}
```

**(d) `globals.css` declares no bare `h1`-`h6` selector.** Already satisfied by Stage 1 Task 1.3 Step 4 — re-assert it here with `grep`, because **4 demos render a heading**: `separator-demo`, `hover-card-demo`, `scroll-area-demo`, `collapsible-demo`.

(a) and (d) are both required and neither substitutes for the other: (a) stops what arrives by inheritance from a container, (d) stops what hits the element directly. (c) closes the gap left if a future layout class violates (a).

- [ ] **Step 4: Height — the shared pane height is dropped (§7.3, §17.6 #8)**

Inline, the demo is server-rendered with its real markup, so its height is correct at first paint. The preview pane gets `min-h-72` and its natural height; the code pane gets `max-h-96 overflow-auto`. That is exactly what the 10 live gallery pages already do.

**Retired with it** (§14.7): the estimate arithmetic (≈21px/line, 288px floor, 400px ceiling), the postMessage height protocol, the frame-side `ResizeObserver`, the viewport clamp that exists only to park a `100svh` feedback loop, and the `rafThrottle` resize listener — the vendor file this repo patched upstream (blume#245).

The consequence is §17.6 #8: switching a demo's Preview/Code tabs **may now change the page height**.

- [ ] **Step 5: The one containment flag (§7.3)**

`sidebar.tsx` is the only viewport-reading primitive in the registry (`useIsMobile`, 768px) and the only one positioned against the viewport (`fixed inset-y-0 z-10 h-svh`). Inline at desktop width it would pin a full-height sidebar over the docs chrome.

The escape hatch is **containment, not a frame**, and it is safe for one measured reason: **every overlay primitive portals to `document.body`** — dialog, sheet, drawer, popover, tooltip, dropdown-menu, select, context-menu, menubar, hover-card, alert-dialog, toast. They are not descendants of the preview container, so a containing block cannot clip them, and the defect this whole section exists to fix stays fixed.

`contain` applies `contain: layout paint`. **Opt-in, not blanket** — blanket containment is a silent trap a future demo would start depending on without saying so. One user today: `sidebar/sidebar-demo`.

An iframe escape hatch was considered and **rejected**: two render paths, two theme bridges and two height stories, which is every problem this section just closed.

- [ ] **Step 6: The tabs are a small client component**

`demo-tabs.tsx` wraps server-rendered children; only `aria-selected` and `hidden` need state. The highlighted code is server output (Task 2.3).

- [ ] **Step 7: Verify the four things that changed, not just that it renders**

```bash
pnpm --filter @sevenui/web build && pnpm --filter @sevenui/web start &
sleep 3
# Proof #1: a nested demo's real markup is in the static HTML
curl -s http://localhost:3000/docs/components/button | grep -c 'data-sevenui-example'
curl -s http://localhost:3000/docs/components/button | grep -o 'class="[^"]*inline-flex[^"]*"' | head -1
# 81 demos keep their directive in the SOURCE, not in the rendered output
curl -s http://localhost:3000/docs/components/dialog | grep -c '&quot;use client&quot;'
```

Then **in the browser, and this is the mandatory check of the whole migration** (§17.3): open `/docs/components/dialog`, open the Dialog **from inside the demo**, and confirm it covers the **viewport** rather than the pane. Repeat for Sheet, Drawer and the Command palette on their pages. This is the one behaviour that must be verified as **changed**, not preserved.

Also confirm the breakpoint fix (§17.6 #9) on a named case: `/docs/components/calendar`'s `calendar-range` demo shows its two months **side by side** at desktop width, where today it stacks. 26 of 137 demos change at `md` and above, entirely through 6 primitives — `calendar` (`md:flex-row`), `input` / `textarea` / `questionnaire` (`md:text-sm`), `drawer` (`md:text-left`), `sidebar` (`md:flex`).

Third-party demos need no special handling: carousel (embla), chart (recharts), calendar (react-day-picker) and resizable (react-resizable-panels) all size from their parent element, which inline is the preview pane — the same box the iframe gave them. Spot-check all four.

- [ ] **Step 8: Commit**

```bash
git add apps/web/components apps/web/app/globals.css
git commit -m "feat(web): render the 137 docs demos inline

An iframe is its own document, so an overlay opened inside a demo was clipped
to the frame; inline it covers the viewport. The four CSS isolation rules
replace what the frame's body used to provide, and sidebar-demo opts into
containment rather than a frame, because every overlay portals to body."
```

### Task 2.7: `<InstallCommand>` gains a package-manager bar (§6.1, §17.6 #7)

**Files:**
- Create: `apps/web/components/mdx/install-command.tsx`, `apps/web/components/package-manager-menu.tsx`

**Interfaces:**
- Consumes: `lib/registry.ts`'s `installCommand(item, pm)` (already in the repo, already parameterised by package manager), `lib/package-manager.ts`, Task 2.3's `highlight`, Stage 1's `data-pm`.
- Produces: the install block on 67 of 68 docs pages, and the shared `<PackageManagerMenu>` that Stage 5's `/blocks` control and Stage 4's gallery cards agree with.

- [ ] **Step 1: Understand the gap being closed**

Today `<InstallCommand>` is **npm-hard-coded**: every one of the 68 blocks reads `npx`, while the site stores a preference (default **pnpm**) that only `/blocks` honours. The migration closes that rather than leaving it.

The three install surfaces do not overlap; they diverge — and after this task all three agree on the preference:

| Surface | Shape | PM today | PM after |
|---|---|---|---|
| docs (68 blocks) | bash code block | hard `npx` | `data-pm` |
| `/blocks` | fused 32px control, command head elided to `…` | 4-PM menu | unchanged |
| landing + `/components` | `$ command` row, React | hard `npx` | `data-pm` (Stage 4) |

The `/blocks` control elides the command's head *because* it sits in a cramped toolbar; **on a docs page the command is the content and stays whole.**

- [ ] **Step 2: All four commands ship; CSS selects one**

```tsx
export async function InstallCommand({ item }: { item: string }) {
  const blocks = await Promise.all(
    PACKAGE_MANAGERS.map(async (pm) => ({ pm, html: await highlight(installCommand(item, pm), "bash") })),
  );
  return (
    <CodeBlock language="bash" header={<PackageManagerMenu />}>
      {blocks.map(({ pm, html }) => (
        <div key={pm} className={`pm-only-${pm}`} dangerouslySetInnerHTML={{ __html: html }} />
      ))}
    </CodeBlock>
  );
}
```

**No client component in the rendering path, no hydration mismatch, no flash.** This is the existing `install-control.astro` pattern driven by the same pre-paint script as `data-theme`. Payload cost is negligible — an install block is one short line.

The block **gains the `data-language` header it does not have today**: it goes through the non-fence path, so it never gets one, while all 154 fences do.

- [ ] **Step 3: The menu is the one interactive part**

`components/package-manager-menu.tsx` is a small client component that writes `localStorage[PACKAGE_MANAGER_KEY]` and sets `document.documentElement.dataset.pm`, plus a `storage` listener so other tabs follow. It does **not** re-render the commands — all four are already in the DOM and CSS picks one. Build it on the registry's own `dropdown-menu`, matching the four-entry menu `/blocks` already ships.

- [ ] **Step 4: Verify — one uniform shape, not 67 changes**

```bash
pnpm --filter @sevenui/web build && pnpm --filter @sevenui/web start &
sleep 3
for p in button dialog calendar; do
  curl -s "http://localhost:3000/docs/components/$p" | grep -c 'pm-only-pnpm'
done
```

Expected: exactly 1 per page. Then in the browser: switch the package manager on `/docs/components/button` and confirm the visible command changes with **no flicker and no re-fetch**, that `/docs/components/dialog` shows the same choice on first paint after a hard reload, and that the choice survives a navigation.

This is §17.6 #7 — a large diff but a **uniform** one, a single declared shape repeated across 67 pages, which is exactly the property the gate carries as **one** entry.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components
git commit -m "feat(web): give the docs install block a package-manager bar

Every one of the 68 install blocks read npx while the site stored a pnpm
preference only /blocks honoured. All four commands are highlighted and
embedded; CSS selects one off data-pm, so there is no flash and no hydration."
```

### Task 2.8: The registry seam — one approved line, one extended guard, one scoped applier

**Files:**
- Modify: `packages/registry/package.json` (**the map's one approved exception**), `scripts/check-registry.mjs`
- Create: `apps/web/components/preset-scope.tsx`

**Interfaces:**
- Produces: `react-hook-form` resolvable in a production install; a theme guard that covers the file visitors actually load; and the scoped preset applier the docs demos and (Stage 4) the gallery both use.

- [ ] **Step 1: `react-hook-form` moves to `dependencies` (§14.4, §19)**

```bash
# packages/registry/package.json: move exactly this one line from
# devDependencies to dependencies, version range UNCHANGED.
"react-hook-form": "^7.87.0"
```

`demos/field/field-rhf.tsx` imports it, that demo is one of the live 137, and under §7 it renders **inline in a production docs page** — so a production page depends on a dev dependency. It works today only because Vercel installs dev dependencies; a `pnpm install --prod` build breaks.

The version range is unchanged, so `check-registry.mjs`'s range check still passes and **no registry item's `dependencies` array changes**. **No other registry file is touched** — this is the single approved exception to "no registry changes".

```bash
pnpm install
pnpm check:registry     # must be unchanged
pnpm test               # 525 registry tests must be unchanged
```

- [ ] **Step 2: The theme guard takes a second file (§8.5)**

`scripts/check-registry.mjs` asserts every published `cssVars` token appears in `packages/registry/demos/theme.css` with the same value. **Once demos render inline, that file is no longer loaded by the site** — the file a visitor actually sees becomes `apps/web/app/globals.css`, which no guard covers. Extend the loop to take a second file.

The script is at the repo root, not under `packages/registry`, so this is in scope.

At the `demos/theme.css` read site, add the comment §14.7 requires:

```js
// demos/theme.css stays on disk but the site no longer loads it: its only
// site consumer was blume.config.ts's examples.css, and demos now render
// inline (§7). It is not inert — this check still reads it to verify the
// published `theme` registry item. Registry changes are out of scope, so the
// file is not deleted and carries no comment of its own (that would be a
// registry edit).
```

- [ ] **Step 3: The scoped preset applier (§8.4)**

`packages/presets` is **not** touched. `resolvePreset()` is already exported, so `apps/web` builds its own rule: one `<style>` node in `<head>`, **selector-scoped**:

```
[data-preset-scope] { … }
[data-theme="dark"] [data-preset-scope] { … }
```

updated from the same `storage` event `apply.ts` already uses. Selector-scoped rather than inline style objects, because inline styles cannot express the light/dark split without also watching `data-theme` from JS.

Applies to docs demo wrappers **and** (Stage 4) the `/components` gallery.

**Site chrome is never scoped: `@sevenui/presets/apply` must never be imported from the root layout.** This is the registry's own rule, stated in `apply.ts`: *"Only preview documents may import this module — the site chrome is deliberately never themed."*

The **control** stays on `/blocks` only. Moving the dock onto `/components` and the docs pages is a product change, out of scope (§19). Until that lands the preference is chosen on `/blocks` and merely reflected elsewhere: it works, but is not discoverable.

Note the dropped-iframe consequence is the opposite of the intuitive one: removing the frame does not make demos follow the customizer — **it removes the document that was *allowed* to be themed**, which is why the scoped applier is forced rather than optional.

- [ ] **Step 4: Verify and commit**

Set a non-default preset on `/blocks` (live site or a local build of Stage 5 later); reload a docs page and confirm the demo follows it while the header, sidebar and footer do **not**.

```bash
pnpm check:registry && pnpm test
git add packages/registry/package.json scripts/check-registry.mjs apps/web/components/preset-scope.tsx pnpm-lock.yaml
git commit -m "fix(registry): depend on react-hook-form at runtime

field-rhf is one of the 137 live demos and now renders inline in a production
docs page, so its import must not resolve through devDependencies. The theme
guard gains globals.css, which is the stylesheet a visitor actually loads once
demos stop rendering in frames."
```

### Task 2.9: Internal links — fix five, validate all (§4.6)

**Files:**
- Modify: `apps/web/docs/index.mdx` (2 links), `apps/web/docs/installation.mdx` (3 links)
- Create: `apps/web/lib/docs/links.ts`

**Interfaces:**
- Produces: a build that **fails** on any content link that does not resolve against the content index.

- [ ] **Step 1: Rewrite the five absolute same-origin links (§17.6 #4)**

```bash
grep -rn 'https://sevenui.dev' apps/web/docs --include='*.mdx'
```

Expected: 5 hits — `index.mdx` ×2, `installation.mdx` ×3. Rewrite each to root-relative. **These were a content defect anyway**: absolute URLs to same-origin pages. Their `href` changes, which is why this is a declared diff rather than a silent fix.

This is also what lets `rehype-external-links` run with **plain options and no function-valued `test`** — the option shape Turbopack would otherwise reject.

- [ ] **Step 2: The build-time link validator**

```ts
// A base-relative link is an ERROR, not a warning, because the failure mode is
// a WRONG PAGE, not a missing one (§4.6, §11.7). Blume rewrote them through
// basePath; there is no basePath here (§3).
export function validateLinks(index: DocPage[]): void {
  const routes = new Set(index.map((p) => p.route));
  for (const page of index) {
    for (const href of internalLinksOf(page.raw)) {
      const [path, hash] = href.split("#");
      if (!path) continue;                               // pure fragment
      if (!routes.has(path)) throw new Error(`${page.sourcePath}: link ${href} resolves to no docs route`);
      if (hash && !hasHeading(index, path, hash)) throw new Error(`${page.sourcePath}: anchor ${href} does not exist`);
    }
  }
}
```

Call it from `getDocIndex()` so it runs on every build and every dev request.

- [ ] **Step 3: Prove the validator bites**

Temporarily add `[bad](/docs/components/nope)` to `apps/web/docs/theming.mdx` and run the build. It must **fail** naming the file and the link. Remove it. A validator that has never failed is not known to work.

- [ ] **Step 4: Non-MDX links stay literal**

The external-link post-build pass dies in two halves (§4.6). MDX links are handled by `rehype-external-links`; the **9 non-MDX anchors** carry the attributes literally in JSX — `site-footer` ×4 (Stage 1), landing ×4 and `privacy` ×1 (Stage 4). Re-running a regex over built HTML to attach attributes to nine known links buys nothing and would need its own post-build step.

- [ ] **Step 5: Commit**

```bash
git add apps/web/docs apps/web/lib/docs/links.ts
git commit -m "fix(docs): make the five same-origin links root-relative and validate the rest

Absolute URLs to our own pages were a content defect; removing them also lets
rehype-external-links run with the plain options Turbopack requires. A
build-time validator now rejects any content link that resolves to no route."
```

### Stage 2 — Definition of done

- 68 docs routes are statically generated and render prose, tables, fences, install blocks and inline demos.
- The content index reports **68 pages / 509 headings**; the toggle duplicate emits `examples` / `examples-1`; three sampled anchor IDs match production exactly.
- The nav tree's Primitives children are **set- and order-identical** to the live sidebar's 65 links; the "exactly once" assertion is in the build path.
- The element map is closed; the forbidden-construct and JSX-tag assertions both run and both have been seen to fail on a deliberate violation.
- `grep -c blume apps/web/app/globals.css` is **0**; no new bespoke class names were coined.
- Every overlay opened from a demo covers the **viewport**; `calendar-range` renders two months side by side.
- `pnpm check:registry` and `pnpm test` (525 tests) unchanged; `/r/*.json` still byte-identical.
- The link validator fails the build on a deliberately broken link.

### Stage 2 — Preview verification

Push; review on the preview, **docs routes only** (§17.3's sampled content set): `/docs`, `/docs/installation`, plus **four `/docs/components/*` covering distinct demo shapes** — a plain one (`button`), an **overlay** one (`dialog`), a third-party wrapper (`chart` or `carousel`), a composite (`sidebar` or `field`). 2 widths (390, 1440) × 2 themes.

**Mandatory on the 4 samples:** open a Dialog, Sheet, Drawer and Command palette **inside a demo** and confirm each covers the viewport. This is the defect the iframe removal exists to fix, so it is the one behaviour verified as **changed**, not preserved.

Also on the preview: the package-manager bar switches all install blocks with no flash; a hard reload shows the stored choice at first paint; the `sidebar` demo does not pin itself over the chrome.

### Stage 2 — §17.6 rows expected here

**#4** (five links root-relative), **#5** (`blume-*` classes → utilities), **#7** (install block gains the PM bar on 67 pages), **#8** (tab toggle may change page height), **#9** (26 of 137 demos change at `md`+), **#10** (overlays cover the viewport — *the* fix), **#17** (68 titles hyphen → em dash, with `og:title` / `og:image:alt`), **#20** (`<blume-webmcp>` and its module are gone, by construction).

**Anything else the extractor reports on a docs route is a regression.** Run it now on one docs page against production and triage every difference into one of the eight rows above.

### Stage 2 — Proof obligations

- **#1 (nested demo context module)** — Task 2.6 Step 1. Fallback: a generated 137-entry `lib/docs/demos.ts` thunk map.
- **#2 (`@shikijs/rehype` under Turbopack)** — Task 2.3 Step 5. Fallback: an async RSC `pre`/`code` override.

### Stage 2 — Record

`.scratch/blume-to-nextjs/verification/stage-2.md`: both proof verdicts; the index counts; the nav set comparison; the overlay check per primitive; the breakpoint check on `calendar-range`; the extractor diff on one docs page with each difference mapped to a §17.6 row.

---

# Stage 3 — Docs chrome and page furniture

The persistent docs layout and everything in it: sidebar, TOC with scroll-spy, the real breadcrumb, pagination, the page-actions rail, the feedback control, a docs-scoped 404 — and the one new page the migration adds. **Six of §17.6's rows land here, five of them from §11.3 alone**, because this is where the port stops reproducing and starts correcting a structural lie.

### Task 3.1: `app/docs/layout.tsx` and the sidebar (§5)

**Files:**
- Create: `apps/web/app/docs/layout.tsx`, `apps/web/components/docs/sidebar.tsx`

**Interfaces:**
- Consumes: `getNavTree()` (Task 2.2).
- Produces: a persistent layout wrapping all 68 (soon 69) docs routes; the serialized nav data every child navigation reuses.

- [ ] **Step 1: The tree is built on the server, rendered on the client**

**All three sidebars are client components in their persistent layouts** — docs (65 links), `/components` (10), `/blocks` (14). App Router does not re-render a shared layout when navigating between its children, so `aria-current="page"` cannot be server-computed there; it needs `usePathname()`. **The tree is still built on the server and handed down as serialized data (label + href per node); the content index and `fs` never reach the client.**

One rule for "chrome carrying an active marker" is worth more than three different ones. **Rejected:** rendering the sidebar from the page instead of the layout, which keeps it a server component but re-sends 65 links on every navigation and loses layout persistence.

- [ ] **Step 2: Group open state — controlled, one-way force**

```tsx
const [open, setOpen] = useState(activeInside);
useEffect(() => {
  if (activeInside) setOpen(true);     // forces open; NEVER forces closed
}, [activeInside]);
```

Today's `<details open={active}>` is server-computed with zero persistence, but that is an artifact of every navigation being a document load. In a persistent layout an uncontrolled `defaultOpen` would be ignored after mount, so a user jumping from `/docs/theming` to `/docs/components/button` via the search palette would find the group **closed** — a real regression. This reproduces today's observable behaviour exactly, and a manually-opened group now survives navigation.

**No `localStorage`:** there is none today, and adding one would crowd §8's single-key contract.

- [ ] **Step 3: Two row types, and no panel machinery**

The ported sidebar knows exactly two row types: a **page link** and one **`group` collapsible**. Blume's `page`-mode panel machinery — buttons, a back button, the `blume-nav` custom element, a 260 ms RTL-aware slide — is **not ported**: panels are created only for `display: "page"` groups and SevenUI declares one group with `display: "group"`, so **the entire mechanism is unreachable on this site today**. Nor is `collapsed: false`, also unused (§14.7).

- [ ] **Step 4: Verify and commit**

In the browser: navigate from `/docs/theming` to `/docs/components/button` via a link; the Primitives group opens and `aria-current="page"` moves. Navigate between two primitives; **the sidebar's scroll position persists** (§17.6 #6 — a free consequence of layout persistence). Manually collapse the group and navigate; it stays collapsed.

```bash
git add apps/web/app/docs/layout.tsx apps/web/components/docs/sidebar.tsx
git commit -m "feat(web): put the docs sidebar in a persistent layout

The tree is built on the server and serialized; the client half exists only
because aria-current cannot be server-computed inside a layout App Router does
not re-render. Group state forces open and never forces closed."
```

### Task 3.2: TOC and scroll-spy — one hook, two renderers (§11.3)

**Files:**
- Create: `apps/web/components/docs/toc.tsx`, `apps/web/components/docs/use-active-heading.ts`

- [ ] **Step 1: Port the algorithm exactly**

A **72px** offset constant; active is the **last** heading whose `getBoundingClientRect().top <= 72`; at the document bottom the **last link is forced**.

- [ ] **Step 2: One observer, not two**

Today two independent `<blume-toc>` instances run — the mobile `<details>` and the desktop `<aside>` — each with its own observer and `aria-current` write. In React **one** `useActiveHeading` in the docs layout feeds both renderers: one scroll listener and one observer.

**Keep the `IntersectionObserver`** even though its callback ignores its own entries and only triggers a recompute. It is not ceremony: Stage 2 hydrates 81 demos on load, which **moves headings with no scroll event**, and the rAF-throttled scroll listener alone would miss that.

- [ ] **Step 3: Verify and commit**

Scroll `/docs/components/button` and confirm the active TOC entry tracks the last heading past 72px in both the desktop aside and the mobile `<details>`; scroll to the bottom and confirm the last link is active. Load the page and confirm the active entry is correct **after** the demos hydrate and shift the layout.

```bash
git add apps/web/components/docs
git commit -m "feat(web): drive both TOC renderers from one scroll-spy hook"
```

### Task 3.3: The breadcrumb becomes a real trail, and `/docs/components` becomes a real page (§11.3)

**Files:**
- Create: `apps/web/components/docs/breadcrumb.tsx`, `apps/web/docs/components/index.mdx`, `apps/web/components/mdx/primitive-index.tsx`
- Modify: `apps/web/lib/docs/nav.ts` (the group gains an optional `href`), `apps/web/mdx-components.tsx` (register `PrimitiveIndex`), `apps/web/components/json-ld.tsx` (add `BreadcrumbList`)

**Interfaces:**
- Produces: `/docs/components` as a 69th MDX route, and the breadcrumb markup Stage 5 brings `/blocks` onto.

- [ ] **Step 1: Know what is being replaced**

**The breadcrumb was not one.** `Breadcrumbs.astro` computes the full trail and renders only `crumbs[length-2]` — the parent group — as an eyebrow, and renders **nothing** when the trail is length ≤ 1. Verified live: 65 primitive pages emit an identical non-linked `<span>Primitives</span>` under a navigation landmark, while `/docs`, `/docs/installation` and `/docs/theming` emit no breadcrumb at all.

- [ ] **Step 2: Draw the real trail, in the idiom the site already ships**

Adopt `/blocks`'s idiom (`Blocks / Marketing / Hero`: linked ancestors, `mx-1.5` `/` separators, current page a non-linked `text-foreground` span) rather than inventing one.

- **Trail shape:** a synthetic `Docs` root, then the nav ancestors, then the page — `Docs / Primitives / Button`. Taking the nav trail as-is was rejected: it leaves `/docs/installation` with a one-item trail, the same defect relocated. `Docs` is the site's own word — the header tab for `/docs` is labelled exactly that.
- **Markup:** the semantically correct `nav > ol > li` with `aria-current="page"` on the last item. `list-none` keeps it **pixel-identical**.
- **Position unchanged:** above the `<h1>`, `mb-2`, on the 42rem measure (`max-w-content`).
- **The docs index renders none** — a breadcrumb whose only item is the current page carries no information.

Net (§17.6 #22): 65 pages go from one word to a three-item trail, `/docs/installation` and `/docs/theming` **gain** a two-item trail, `/docs` stays bare.

- [ ] **Step 3: `BreadcrumbList` JSON-LD as a third `@graph` node (§17.6 #23)**

Added on docs here, and on `/blocks` in Stage 5 — `/blocks`'s trail is fully addressable, so excluding it would need an explanation that does not exist.

- [ ] **Step 4: `/docs/components` — the effort's one deliberate scope bend**

The alternative — redirecting `/docs/components` to the first primitive — makes the *URL* honest, but **Google follows the 308 and canonicalizes the breadcrumb `item` to `/docs/components/accordion`, which is Button's *sibling*, not its ancestor.** That is the same structural lie laundered through a hop. §5's mapping of the "Primitives" *header tab* to the first primitive is a jump-into-a-section affordance; a breadcrumb is a hierarchy claim and cannot borrow it.

**Mechanically it is `docs/components/index.mdx`** — a real content page with frontmatter, carrying one new `<PrimitiveIndex />`. That reopens §6's closed component set by exactly one entry, justified on §6's own terms: the set closed because nothing else had a use, and `AutoTypeTable` was dropped because it provably could not work. This has one use and provably can work, since all 65 labels and descriptions already sit in frontmatter.

**Rejected: `app/docs/components/page.tsx`** — cheaper to write and more expensive everywhere else. Outside the content index it needs a special case in the nav, the search index, the `.md` mirror, `llms.txt` and `lib/page-meta.ts`, and would be the only route under `/docs` with no `.md`. As MDX, all of them handle it with **zero special cases** — and Stage 8 must confirm that `/docs/components.md` and its `llms.txt` line appear without any code written for them.

- [ ] **Step 5: The group node gains an optional `href`, narrowing the type rather than breaking it**

The Primitives group's `href` **still comes only from the content index's `route`** — the §5 boundary exists so a *label* cannot become a URL, and that holds. The sidebar's `<details>` summary becomes a link with the toggle bound to the chevron. **Rejected:** making the index the group's first child, which keeps the boundary intact but forces the breadcrumb to find the group URL through a "the group's overview child" special case.

**The index is excluded from the group's derived children so it does not appear twice** — and Task 2.2's "exactly once" assertion must be updated to account for it, not bypassed.

- [ ] **Step 6: `<PrimitiveIndex />` content**

The 65 primitives as a card grid in `/components`'s existing idiom (`rounded-xl border`, label plus description), **alphabetical** — because §5 slug-sorts the nav and the page must agree with the sidebar. **Grouping by wave would duplicate `/docs`'s hand-maintained Coverage section with a second list free to drift.**

- [ ] **Step 7: Verify and commit**

```bash
pnpm --filter @sevenui/web build 2>&1 | grep -c '/docs'    # expected: 69 routes now
pnpm --filter @sevenui/web start &
sleep 3
curl -s http://localhost:3000/docs/components | grep -c 'rounded-xl'
curl -s http://localhost:3000/docs/components/button | grep -o 'aria-current="page"'
curl -s http://localhost:3000/docs | grep -c '<nav aria-label="Breadcrumb"' # expected: 0
```

```bash
git add apps/web/docs/components/index.mdx apps/web/components apps/web/lib/docs/nav.ts apps/web/mdx-components.tsx
git commit -m "feat(docs): draw a real breadcrumb trail and give it a real ancestor

Blume rendered only the parent group as an eyebrow, and nothing at all on
three pages. /docs/components becomes an authored MDX page rather than a
redirect, because a 308 canonicalizes the crumb to Button's sibling."
```

### Task 3.4: Pagination, the page-actions rail, feedback, and the docs 404

**Files:**
- Create: `apps/web/components/docs/pagination.tsx`, `apps/web/components/docs/page-actions.tsx`, `apps/web/components/docs/feedback.tsx`, `apps/web/app/docs/not-found.tsx`

- [ ] **Step 1: Pagination, reproduced exactly**

Markup, measurements and classes **verbatim**, the empty `<span />` placeholder included. Prev/next reads the **nav tree** (Task 2.2) — confirmed live: `/docs/theming` → next `/docs/components/accordion`.

The logical properties (`ms-auto`, `text-end`) stay — unconditional and simply correct. **`rtl:-scale-x-100` is dropped**: the variant only fires under `[dir="rtl"]`, and the port has no locale, no `dir` switch and i18n is ruled out map-wide. A variant that can never match is dead code, dropped on the same grounds as §5's unreachable panel machinery (§14.7).

- [ ] **Step 2: The page-actions rail is ported whole (§15.10)**

Found in the TOC aside. All four items, with all six chat providers:

1. **Edit on GitHub** → `https://github.com/useui/sevenui/edit/main/docs/<slug>.mdx`, built from `lib/site.ts`.
2. **Scroll to top.**
3. **Copy as Markdown** — fetches the page's `.md` URL and writes it to the clipboard. **This is the only visible consumer of the `.md` endpoints**, which is the main reason Stage 8 reproduces them.
4. **Open in chat** — a dropdown over v0, ChatGPT, Claude, T3 Chat, Scira and Cursor. Hrefs are built **client-side**, so the static HTML ships anchors without one; the prompt is `Read <absolute .md URL> so I can ask you questions about this page.`

The rail stays **docs-only**, as today.

Note the ordering dependency: item 3 fetches a URL Stage 8 creates. Until then it 404s on the preview — record that in the stage checklist and re-verify it in Stage 8.

- [ ] **Step 3: Feedback, on its exact GA4 contract (§17.6 #25)**

The event is `feedback` with props `{ helpful: "yes"|"no", path, title }`.

- `path` remains the series' real key.
- `title` is sent as the **bare page title** from `lib/page-meta.ts`, **not `document.title`** — §15.8 moves that value at cutover regardless, so if it must change once it should change to the value that carries no separator and will not move again.

**Four dead sinks are dropped:** `track()` fans out to an internal reporter, `posthog.capture`, `gtag`, `plausible` and a `blume:track` CustomEvent — **only gtag is configured** (`G-8702Z28SMN`), and the CustomEvent has no listener anywhere (§14.7).

There is no dedup today either: the hide is DOM-only and `astro:after-swap` re-inits, so repeat votes are already possible. Do not add one — that would be a new behaviour.

- [ ] **Step 4: The docs `not-found` boundary (§11.7.2)**

`app/docs/not-found.tsx` renders inside the docs layout, so a miss arrives **with the sidebar** — the only thing on the site that lists all 65 primitives, and the actual recovery affordance for what a docs miss overwhelmingly is (a mistyped or stale primitive slug). Today's bare page offers nothing.

The sidebar renders with no active item, which under Task 3.1's one-way group force simply means **no group is opened** — verify that, it is the one interaction the boundary can get wrong.

**Boundaries for the gallery and `/blocks` are declined**: 10 static pages and a manifest-driven category set respectively, where a sidebar's recovery value is low, while each extra `not-found.tsx` is one more surface §17 must verify.

- [ ] **Step 5: Sweep `rounded-blume` out of the ported furniture (§17.6 #27)**

```bash
grep -rn 'rounded-blume\|--radius-blume\|var(--radius-blume)' apps/web/legacy-components apps/web/legacy-pages
```

§8.3 expects **four** furniture elements. Replace each with `rounded-lg` as that element ports. `--radius-blume`'s 12px matches no SevenUI radius while the furniture sits inches from primitives at 10px; a 2px change on four elements is inside the parity bar. **If the count is not four, record the real number** — the row stays one §17.6 entry either way, but the spec's figure should be corrected.

- [ ] **Step 6: Verify and commit**

```bash
pnpm --filter @sevenui/web build && pnpm --filter @sevenui/web start &
sleep 3
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/docs/components/nope   # 404
curl -s http://localhost:3000/docs/components/nope | grep -c '/docs/components/button' # sidebar present
curl -s http://localhost:3000/docs/theming | grep -o 'href="/docs/components/accordion"' | head -1
git add apps/web/components/docs apps/web/app/docs
git commit -m "feat(web): port the docs furniture

Pagination verbatim minus a variant that can never match; the page-actions
rail whole; the feedback event on its exact GA4 contract with four
unconfigured sinks dropped; and a docs-scoped 404 that arrives with the only
list of all 65 primitives on the site."
```

### Stage 3 — Definition of done

- 69 docs routes build (68 + `/docs/components`), each inside the persistent docs layout.
- Sidebar: `aria-current` tracks navigation, the group forces open and never closed, scroll position persists.
- TOC: one hook, two renderers, correct **after** demo hydration shifts the layout.
- Breadcrumb: 65 primitive pages show three items, `/docs/installation` and `/docs/theming` two, `/docs` none; `nav > ol > li` with `aria-current="page"`; `BreadcrumbList` in the `@graph`.
- `/docs/components` renders 65 cards alphabetically and appears in the nav **once**, not twice.
- The docs 404 arrives with the sidebar and no group opened.
- `rounded-blume` appears nowhere in ported code.

### Stage 3 — Preview verification

`/docs`, `/docs/installation`, `/docs/components` (new), and the same four sampled primitives from Stage 2 — 2 widths × 2 themes. Plus: a docs miss (`/docs/components/nope`), keyboard navigation through the sidebar and the rail, and the feedback control firing exactly one `feedback` event with a **bare** `title` (check the GA4 debug view or the network tab).

### Stage 3 — §17.6 rows expected here

**#6** (sidebar scroll persists), **#22** (real breadcrumb trail), **#23** (`BreadcrumbList` JSON-LD — the docs half), **#25** (feedback `title` becomes bare), **#26** (one new route: `/docs/components`), **#27** (`rounded-blume` → `rounded-lg` on four furniture elements).

### Stage 3 — Proof obligations

None resolve here. Carry forward: the page-actions rail's "Copy as Markdown" depends on Stage 8's `.md` endpoints and cannot be green until then — record it as an open thread, not as a pass.

### Stage 3 — Record

`.scratch/blume-to-nextjs/verification/stage-3.md`: route count (69), the breadcrumb shape on three sampled routes, the `rounded-blume` sweep count, the feedback event payload, the docs-404 sidebar check, and the open thread for the rail.

---

# Stage 4 — Landing, gallery, legal

Three Astro page families port to React: `/` (hand-tuned, held near pixel parity), `/components` plus its 10 children, and the two legal pages. The gallery adopts the **same** `PreviewPane` the docs demos already use (Stage 2) — the two surfaces converge on one preview rather than growing a second.

### Task 4.1: The landing page

**Files:**
- Create: `apps/web/app/page.tsx` (replaces Task 1.2's stub), `apps/web/components/landing/*.tsx`
- Read (port from): `legacy-pages/index.astro`, `legacy-components/landing-ruler.astro`, `legacy-components/component-wall.astro`, `legacy-components/pro-offer.astro`
- Modify: `apps/web/components/copy-command.tsx`

- [ ] **Step 1: Port the markup verbatim**

`/` is one of the two surfaces held **closer to pixel parity** (§17). Port class-for-class; do not simplify markup, do not re-order sections, do not substitute a primitive for a hand-written element.

`landing-showcase.tsx` already exists as React and was moved in Task 1.2 — it needs no rewrite, only its imports checked.

- [ ] **Step 2: `component-wall` drops a dead special case (§14.6)**

`SPECIAL_NAMES` maps `"form-rhf": "Form (RHF)"`, but `form-rhf` was removed from `registry.json`. **It goes.** The wall's row-fill property still holds: 65 `registry:ui` items plus the trailing docs cell = 66, divisible by 2, 3 and 6 — assert that after porting.

- [ ] **Step 3: `copy-command.tsx` follows the preference (§13.2, §17.6 #15)**

It keeps its shape — the `$ command` row — but takes its command from the same four-command set `<InstallCommand>` uses, selected by `data-pm`. All three install surfaces now agree on the preference.

- [ ] **Step 4: Four literal external anchors**

The landing page carries **4** of the 9 non-MDX anchors that must declare `target="_blank" rel="noopener noreferrer"` literally in JSX (§4.6). Count them after porting: footer 4 (Stage 1) + landing 4 + privacy 1 = 9.

- [ ] **Step 5: Metadata — the landing page is the one bare title**

`getPageMeta("/")` returns `{ title: "SevenUI", description: site.description }`, and `pageTitle` returns it unchanged. The landing page carries **`WebSite` alone** in the `@graph` — no `TechArticle`.

- [ ] **Step 6: Verify and commit**

Compare against production at 390 / 768 / 1440 in both themes, side by side. This is a pixel-near surface: differences beyond a few px, font rendering and spacing rounding are **regressions**, not drift.

```bash
node scripts/extract-page-features.mjs https://sevenui.dev/ > /tmp/old-root.json
node scripts/extract-page-features.mjs http://localhost:3000/ > /tmp/new-root.json
diff <(node -e 'console.log(require("/tmp/old-root.json").links.join("\n"))' | sort) \
     <(node -e 'console.log(require("/tmp/new-root.json").links.join("\n"))' | sort)
```

Expected: empty. Any link difference on `/` is a regression — no §17.6 row covers it.

```bash
git add apps/web/app/page.tsx apps/web/components
git commit -m "feat(web): port the landing page

Markup and classes verbatim — / is held near pixel parity. The component
wall drops a special case for an item removed from registry.json, and the
copy control follows the site's package-manager preference."
```

### Task 4.2: The `/components` gallery

**Files:**
- Create: `apps/web/app/(gallery)/components/layout.tsx`, `apps/web/app/(gallery)/components/page.tsx`, `apps/web/app/(gallery)/components/[name]/page.tsx` **or** 10 explicit page files
- Read (port from): `legacy-pages/components/*.astro`, `legacy-components/component-gallery*.astro`, `legacy-components/example-card.astro`

- [ ] **Step 1: Keep the page set fixed at 10**

The gallery's *contents* derive at build time from `packages/registry/components/registry.json` (41 items), but **the page set is 10 hand-written pages**: accordion, badge, button, card, dialog, dropdown-menu, input, select, switch, tabs. Adding a registry item does **not** add a route — reproduce that. A `[name]` dynamic segment is acceptable only with `generateStaticParams` returning exactly those 10 and `dynamicParams: false`; if that reads as accidental, ten explicit files are the honest shape.

- [ ] **Step 2: The gallery sidebar is the third client sidebar (§5)**

10 links, same rule as Task 3.1: built on the server, serialized, `usePathname()` for `aria-current`.

- [ ] **Step 3: `example-card`'s Preview/Code toggle**

Becomes a small client component wrapping server-rendered children — the highlighted code is server output (Task 2.3), and only `aria-selected` and `hidden` need state. The `astro:page-load` delegated-once pattern dies with Astro (§14.7).

- [ ] **Step 4: The gallery adopts the shared `PreviewPane` and the scoped applier**

Same component as the docs demos (Task 2.6), same `[data-sevenui-example]` rules, same `[data-preset-scope]` (Task 2.8). The theme **control** does not come here — that is §19's out-of-scope item.

- [ ] **Step 5: Titles and JSON-LD**

The 10 titles are already `<Name> Components — SevenUI` **because Stage 0 pre-shipped them to `main`** — reproduce them, do not re-derive a different form. Add the 10 children plus `/components` to `lib/page-meta.ts` with their bare titles (`Button`, not `Button Components`) and their live descriptions.

**JSON-LD `headline` goes bare on these 11 pages** (§17.6 #18): today they emit `"Button — SevenUI Components"`.

- [ ] **Step 6: Verify and commit**

```bash
curl -s http://localhost:3000/components/button | grep -o '<title>[^<]*</title>'
# expected: <title>Button Components — SevenUI</title>  (identical to production after Stage 0)
curl -s http://localhost:3000/components/button | grep -o '"headline":"[^"]*"'
# expected: "headline":"Button"
git add apps/web/app apps/web/components
git commit -m "feat(web): port the components gallery

Ten hand-written pages, as today — a registry item does not add a route. The
gallery adopts the shared preview pane the docs demos use, and JSON-LD
headline goes bare to match every h1 on the site."
```

### Task 4.3: `/terms` and `/privacy`

**Files:**
- Create: `apps/web/app/terms/page.tsx`, `apps/web/app/privacy/page.tsx`, `apps/web/components/legal-page.tsx`
- Read (port from): `legacy-pages/terms.astro`, `legacy-pages/privacy.astro`, `legacy-components/legal-page.astro`

- [ ] **Step 1: Port content verbatim**

Legal copy is not migration territory — not a word changes. `privacy` carries the 9th literal external anchor.

- [ ] **Step 2: Titles**

`Terms of Service — SevenUI` and `Privacy Policy — SevenUI`. The bare titles are what Stage 0 already wrote into `seo.og.titles`, so the OG card and the page title agree from the start.

- [ ] **Step 3: Verify and commit**

```bash
diff <(curl -s https://sevenui.dev/terms | node scripts/extract-page-features.mjs - | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).text))') \
     <(curl -s http://localhost:3000/terms | node scripts/extract-page-features.mjs - | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).text))')
```

Expected: differences confined to the chrome (header/footer), never to the legal body.

```bash
git add apps/web/app/terms apps/web/app/privacy apps/web/components/legal-page.tsx
git commit -m "feat(web): port the legal pages"
```

### Stage 4 — Definition of done

- `/`, `/components`, 10 gallery children, `/terms`, `/privacy` all render; the Stage 1 landing stub is gone.
- The extractor's **link set** on `/` is identical to production.
- The component wall totals 66 cells and contains no `Form (RHF)`.
- All three install surfaces follow `data-pm`; nine non-MDX anchors carry `target`/`rel` literally.
- The 10 gallery titles match production **exactly** (Stage 0 pre-shipped them); JSON-LD `headline` is bare on 11 pages.
- `lib/page-meta.ts` now answers for `/`, `/components`, the 10 children, `/terms`, `/privacy`.

### Stage 4 — Preview verification

**Pixel-near, full matrix, on `/`:** 3 widths (390, 768, 1440) × 2 themes = 6 views, compared side by side with production. **Sampled:** `/components` plus 3 children, `/terms` — 2 widths × 2 themes.

The drawer's real breakpoint must be **measured** here, not assumed: 768 is a guess and both sides of the actual switch have to be seen (§17.3).

### Stage 4 — §17.6 rows expected here

**#15** (`copy-command` follows the PM preference), **#18** (JSON-LD `headline` bare — 13 of the 16 pages: the 10 gallery children, `/components`, `/terms`, `/privacy`).

### Stage 4 — Proof obligations

None.

### Stage 4 — Record

`.scratch/blume-to-nextjs/verification/stage-4.md`: the `/` link-set diff (must be empty), the 6-view pixel-near verdict, the measured drawer breakpoint, the wall cell count, the title and headline probes.

---

# Stage 5 — `/blocks` and ISR

**This is the stage the migration exists for.** Everything before it is parity; this is the capability. 18 routes regenerate from the pro manifest on a 300-second window, and a category added in the pro repo reaches the site **without a rebuild**.

**Measured:** the live manifest is 3 groups / 14 categories / 65 items, 27.8 KB — so ISR covers **18 routes** (`/blocks`, 3 group pages, 14 category pages). Today `pages/blocks/_data.ts` calls `await loadProManifest()` at module scope, so there is **one fetch per build** shared by all three routes. **The target shape preserves that property.**

### Task 5.1: The manifest loader under ISR (§10.1, PROOF #3)

**Files:**
- Modify: `apps/web/lib/pro-manifest.ts`

- [ ] **Step 1: One fetch, three routes, one Data Cache entry**

```ts
const res = await fetch("https://pro.sevenui.dev/r/pro-manifest.json", {
  next: { revalidate: 300, tags: ["pro-manifest"] },
});
```

The Data Cache is keyed by URL, so **one entry serves all three routes *and* `generateStaticParams`** — the same single-fetch property the module singleton has today. Stage 8's `sitemap.xml` and `llms.txt` and Stage 9's OG route read the same entry for free.

The fetch goes **directly** to `https://pro.sevenui.dev/...`, **not** through the site's own `/r/pro-manifest.json` rewrite: a server-side fetch to its own origin is a self-request through Vercel's edge, and on a cold build the site is not serving yet.

- [ ] **Step 2: Declare `revalidate` on each segment too, and know it is redundant**

`export const revalidate = 300` on all three `page.tsx` files. It is redundant with the fetch option and **kept anyway**: a reader of `page.tsx` should not have to open the loader to learn the route is ISR.

- [ ] **Step 3: PROOF OBLIGATION #3 — `"use cache"` and the `cacheComponents` flag**

```bash
grep -rn 'cacheComponents' apps/web/node_modules/next/dist/server/config-shared.js | head
grep -rn 'use cache' apps/web/node_modules/next/dist/server/use-cache/*.js | head
```

Then try adding `"use cache"` to a trivial module and building. **The expected result is that it requires the flag**, which is why it is not used: in Next 16 `cacheComponents` changes rendering semantics application-wide — too large a blast radius for one data source.

**If it turns out not to require the flag**, record that in the spec: `"use cache"` becomes cheap and §10.1 is worth revisiting in a later effort. **It does not change this migration's shape** — do not switch mid-stage.

- [ ] **Step 4: `loadProManifest` itself needs no change (§10.2)**

The current throw-everything loader already produces exactly the wanted semantics under ISR. Only a statement of what the throw now means, as a comment at the throw site:

| When | Today | Under ISR |
|---|---|---|
| Build (`generateStaticParams`) | build fails | build fails — unchanged and wanted: a cold build has no previous good page, and publishing an empty `/blocks` is worse than failing |
| Background revalidation | n/a | last good page keeps serving; Next retries on the next request past the window |
| On-demand render of a *new* path | n/a | no previous version exists, so this one errors rather than serving stale |

**A shape violation is treated exactly like a non-200 — both serve stale.** It cannot be made louder *at the route level*: during revalidation Next keeps the last good page regardless of why the render threw. "Louder" therefore means an alert, not different page behaviour — which is Task 5.6's job. And stale is not wrong here: the previous manifest was valid, so the page it produced is correct, just behind.

- [ ] **Step 5: The tag ships now, the webhook does not (§10.5)**

300 seconds is the agreed SLA, so a webhook adds nothing today. The fetch carries `tags: ['pro-manifest']` anyway — one property — so a `revalidateTag` route handler with a shared secret is later a **single-file addition rather than a refactor**. The pro repo's `trigger-web-rebuild.yml` is the natural caller when that day comes.

Record the three API facts the future addition needs as a comment beside the tag (verified against 16.3.5's source, §20.2 #4, **DISCHARGED**):

- **Single-argument `revalidateTag(tag)` is deprecated in 16.3.5** — it warns, pointing at a second argument or `updateTag`. The call is `revalidateTag('pro-manifest', 'max')`.
- **`updateTag` is Server-Action-only** and throws explicitly in a route handler, so the webhook must use `revalidateTag`.
- **The second argument changes the semantics:** with no profile the tag is marked `expired: now` — a hard immediate expiry, so the next request re-renders and waits. With a profile it is marked `stale: now` **and** `expired: now + expire` — stale-while-revalidate. The second matches what `/blocks` already does on its window; the first makes a new block appear on the very next request at the cost of one slow response.

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/pro-manifest.ts
git commit -m "feat(web): fetch the pro manifest through the Data Cache

One URL-keyed entry serves all three blocks routes, generateStaticParams,
the sitemap and llms.txt — the same single-fetch property the module
singleton had. The revalidateTag tag ships now so the webhook is later a
one-file addition."
```

### Task 5.2: The three routes, `dynamicParams`, and `notFound()` (§10.4)

**Files:**
- Create: `apps/web/app/blocks/layout.tsx`, `apps/web/app/blocks/page.tsx`, `apps/web/app/blocks/[group]/page.tsx`, `apps/web/app/blocks/[group]/[category]/page.tsx`

- [ ] **Step 1: New categories appear without a rebuild — and the mechanism is not the obvious one**

`generateStaticParams` runs **at build time only**; it does **not** re-run on revalidation, so a new category never enters the enumerated set. It becomes reachable like this:

1. `/blocks` and `/blocks/[group]` revalidate on their 300 s window and re-render from the fresh manifest, so their listings include the new category.
2. That listing links to `/blocks/<group>/<new>`, which is not enumerated — **`dynamicParams`** (Next's default, **declared explicitly**) renders it on demand and caches the result.

```ts
export const dynamicParams = true;   // not optional: with it off, a new category
                                     // 404s until someone rebuilds — the exact
                                     // manual step this migration removes.
```

- [ ] **Step 2: The required consequence — the pages must call `notFound()`**

Today the pages use `groups.find(...)!` — a non-null assertion that was safe only because every rendered path came from `generateStaticParams`. Under `dynamicParams` an arbitrary path reaches the component and **the assertion produces a 500 instead of a 404**.

```ts
const group = manifest.groups.find((g) => g.slug === params.group);
if (!group) notFound();
```

The same `notFound()` handles **removal**: if pro deletes a group, its cached route stays until it revalidates, at which point the lookup misses and it becomes a 404.

- [ ] **Step 3: Port the page bodies**

From `legacy-pages/blocks/index.astro`, `[group]/index.astro`, `[group]/[category].astro` and `legacy-components/blocks-sidebar*.astro`, `category-card.astro`. The blocks sidebar (14 links) is the third client sidebar under §5's rule.

The breadcrumb is Task 3.3's component — **`/blocks` is brought onto the docs markup** (`nav > ol > li` + `aria-current`), which is **pixel-identical under `list-none`** and changes the accessibility tree only (§17.6 #24). Copying the blocks markup verbatim would have propagated its two gaps to 68 more pages.

`BreadcrumbList` JSON-LD is added here too (§17.6 #23's second half); `headline` goes bare on `/blocks` (§17.6 #18).

- [ ] **Step 4: Verify and commit**

```bash
pnpm --filter @sevenui/web build 2>&1 | grep -c '/blocks'   # expected: 18 routes
pnpm --filter @sevenui/web start &
sleep 3
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/blocks/marketing/not-a-category  # 404, not 500
git add apps/web/app/blocks
git commit -m "feat(web): render /blocks from the manifest with ISR

dynamicParams is declared rather than defaulted, because it is what lets a new
pro category render without a rebuild; the non-null assertions become
notFound(), which under dynamicParams is the difference between a 404 and a
500 and is also how a removed group stops resolving."
```

### Task 5.3: `<BlockCard>` and `<BlockPreview>` (§11.5)

**Files:**
- Create: `apps/web/components/blocks/block-card.tsx` (server), `block-preview.tsx` (client), `install-control.tsx` (server), `blocks-announcer.tsx`, `blocks-load-gate.tsx`
- Read (port from): `legacy-components/block-frame.astro` (1,200 lines), `install-control.astro`, `blocks-theme-dock.astro`

- [ ] **Step 1: Decompose the 1,200 lines into three layers**

- **(a) server-renderable markup** — the `<article>`, heading plus optional badge, description, the whole toolbar, the track / clip layer / decorative ring, the `<iframe>` with `data-src`, the width readout;
- **(b) per-card behaviour** — width state and preset bucketing, drag with pointer capture, keyboard resize, fullscreen in two flavours, refresh, permalink and prompt copy;
- **(c) page singletons** — the lazy loader, the live region, the tooltip, the package-manager preference.

Today (b) and (c) are one document-level delegated script because Astro's alternative was ~54 islands on a six-card page. **React has no such cost**, so: `<BlockCard>` (server) + `<BlockPreview>` (client) per card.

- [ ] **Step 2: Six rules that travel with the port**

- **The measured border delta stays a runtime measurement.** Width presets bucket against the **iframe's** content width through a runtime border delta, not the box's border-box width. The box↔iframe offset cannot be known at build time, and hard-coding "2" is what makes a "1024px" badge lie.
- **The concurrency cap survives as a layout-level context**, not a per-card `IntersectionObserver` each doing its own thing: **the cap is the feature.** Six full applications booting at once is the difference between a gallery that scrolls and one that stalls. The context hands each visible card a "you may load now" grant and each card sets its own `src` on receipt.
- **The announcer stays one live region** in the blocks layout, exposed as an `announce()` context. Its two non-obvious rules travel **as comments**: it must exist and be empty **before** the text changes, and it must be **cleared between writes** or a repeated message is silent.
- **The tooltip becomes the registry's own `Tooltip`**, one Provider in the blocks layout. The bespoke singleton existed to avoid one island per button; with per-card client components that reason is gone, and the site stops hand-rolling a primitive it publishes. It stays **decorative** — no `aria-describedby`, the `sr-only` accessible names unchanged — so the WCAG 1.4.13 reasoning holds. This is §17.6 #12: the toolbar tooltips gain Base UI's open delay and portal.
- **Refresh keeps `contentWindow.location.reload()`**, not `src` re-assignment, which re-arms loading and pushes history.
- **Fullscreen keeps both flavours**: the Fullscreen API, plus the `[data-fs]` fixed overlay, because iOS iPhone has no Fullscreen API.

- [ ] **Step 3: `install-control` ports with its markup intact**

A server component, **including the `dir="rtl"` + `<bdi>` start-truncation**, which is **load-bearing**: the tail is the only part distinguishing `dashboard-01` from `dashboard-02`. This is the one surviving `dir="rtl"` on the site — a typographic trick, not a locale (§11.6). Its behaviour moves into `BlockPreview`'s subtree rather than a page-level handler.

The `/blocks` PM control is **unchanged** (§6.1's table) — it keeps its fused 32px shape and its elided command head.

- [ ] **Step 4: Do not copy the stale comment**

`blocks-theme-dock.astro` cites "the same trap `renderProBlocks` in `pages/blocks/index.astro` works around". **There is no `renderProBlocks` anywhere in the repo.** The trap it names (ClientRouter runs a module once) is real and is why the dock re-binds on `astro:page-load` — and that whole class of workaround dies with `ClientRouter` (§14.7).

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/blocks
git commit -m "feat(web): split the block frame into a server card and a client preview

Astro's 1,200-line delegated script existed because ~54 islands on a six-card
page was the alternative. The concurrency cap becomes a layout context because
the cap is the feature, and the bespoke tooltip becomes the primitive the site
publishes."
```

### Task 5.4: `lucide-react` replaces `@lucide/astro` (§14.4)

**Files:**
- Modify: `apps/web/lib/pro-manifest.ts` (the `lucideIcon()` helper)

- [ ] **Step 1: One import line changes**

Both packages are at **1.41.0**, generated from the same upstream set: `@lucide/astro` ships 1,808 icon files and exports `export * as icons`; `lucide-react`'s `icons` record has 1,807 Pascal-cased entries. The three keys the **live** manifest uses — `layout-dashboard`, `megaphone`, `sparkles` — resolve as `LayoutDashboard`, `Megaphone`, `Sparkles` in both.

`kebabToPascal` and the loud `throw` on an unknown key **survive verbatim** — that throw is what makes a pro-repo typo fail the web build instead of rendering a blank card.

- [ ] **Step 2: One boundary rule comes with it**

`import { icons }` pulls the **whole record**, so it must stay **server-only** — `lib/pro-manifest.ts` and the `/blocks` pages, which §11 keeps as server components. **A client component importing it would defeat tree-shaking and ship ~1,800 icons.** Add `import "server-only"` to the module and a comment stating why.

The manifest's keys are owned by the pro repo and therefore genuinely dynamic, so the full record is the right shape; it just may not cross the client boundary.

- [ ] **Step 3: Verify and commit**

```bash
pnpm --filter @sevenui/web build
# The three live keys must render; an unknown key must fail the build:
node -e 'const {icons}=require("lucide-react");for(const k of ["LayoutDashboard","Megaphone","Sparkles"])if(!icons[k])throw new Error(k);console.log("ok")'
grep -c 'server-only' apps/web/lib/pro-manifest.ts   # expected: >= 1
git add apps/web/lib/pro-manifest.ts
git commit -m "refactor(web): resolve manifest icons through lucide-react

Both packages are 1.41.0 from the same upstream set and the three live keys
resolve in both. The icons record must stay server-only — importing it from a
client component would ship ~1,800 icons."
```

### Task 5.5: CI becomes hermetic (§10.6)

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Point CI at the fixture**

`ci.yml` runs a bare `pnpm build` today, so **web CI reaches `pro.sevenui.dev` on every pull request**. ISR removes the value of that coupling: a bad manifest no longer breaks the site, and Vercel's production build still fetches live and still fails hard. What remains is pure cost — a pro outage turning web pull requests red.

```yaml
      - run: pnpm build
        env:
          PRO_MANIFEST_URL: lib/pro-manifest.fixture.json
```

The loader must accept a path as well as a URL. The fixture (2 groups / 3 categories / 3 items) **stays and becomes load-bearing rather than incidental** — say so in a comment at the fixture.

- [ ] **Step 2: Verify and commit**

Run the build with the env var set and with the network blocked (or the URL pointed at a dead host) — it must still succeed.

```bash
git add .github/workflows/ci.yml apps/web/lib/pro-manifest.ts apps/web/lib/pro-manifest.fixture.json
git commit -m "ci: build the web app against the manifest fixture

CI reached pro.sevenui.dev on every pull request, so a pro outage turned web
PRs red. Under ISR a bad manifest no longer breaks the site and the production
build still fetches live, so the coupling is pure cost."
```

### Task 5.6: The scheduled manifest canary (§10.7)

**Files:**
- Create: `.github/workflows/manifest-canary.yml`

- [ ] **Step 1: The signal CI gives up has to move, not vanish**

A workflow in **this** repo fetches the live manifest and runs `parseManifest` on it, failing on any violation.

This is **strictly better than what CI did**: CI only ran on pull requests, while a bad manifest can land at any time — and stale-serve means nothing else would ever notice.

```yaml
name: manifest-canary
on:
  schedule:
    - cron: "17 */6 * * *"
  workflow_dispatch:
jobs:
  parse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22.12, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: node scripts/check-pro-manifest.mjs
```

`scripts/check-pro-manifest.mjs` fetches `https://pro.sevenui.dev/r/pro-manifest.json`, runs the loader's `parseManifest`, and exits non-zero on any of its **11 distinct throw sites**.

A runtime health endpoint was considered and dropped: it requires someone to watch it, whereas a scheduled job reports through a channel the dev already reads.

- [ ] **Step 2: Prove the canary bites**

Run the script against a deliberately malformed local copy of the manifest and confirm a non-zero exit naming the violated rule. **A canary that has never failed is not known to work** — and §21.1 names the real risk precisely: `parseManifest`'s failure mode is a validation that *silently passes* a malformed manifest, after which stale-serve never triggers and a wrong `/blocks` publishes.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/manifest-canary.yml scripts/check-pro-manifest.mjs
git commit -m "ci: watch the live pro manifest on a schedule

CI only ran on pull requests, but a bad manifest can land at any time and
stale-serve means nothing else would notice."
```

### Task 5.7: PROOF #5 — the `/previews/` trailing slash

**Files:** none (verification only)

- [ ] **Step 1: Check both forms on the preview deployment**

```bash
PREVIEW=https://<this-branch-preview>.vercel.app
curl -s -o /dev/null -w '%{http_code} %{url_effective}\n' "$PREVIEW/previews/dashboard-01"
curl -s -o /dev/null -w '%{http_code} %{url_effective}\n' "$PREVIEW/previews/dashboard-01/"
```

Both must return 200. Then open `/blocks/application/dashboard` on the preview and confirm the iframes actually load pro content — preview deployments inherit `vercel.json`, which is what lets `/blocks` verify against the **live** pro deployment with no pro staging environment.

- [ ] **Step 2: If a form fails**

Platform rewrites run ahead of the Next function and `/previews/*` is not a Next route, so nothing *should* reach Next's trailing-slash handling — but "should" is what failed last time. If something does: leave `trailingSlash` at its default, keep `vercel.json` as the rewrites' single owner, and fix it there (both forms are already declared). **Do not add a `rewrites()` block to `next.config`** — that reopens the solved bug §3 describes.

### Stage 5 — Definition of done

- 18 blocks routes build from one manifest fetch; the build log shows a single fetch, not three.
- `dynamicParams = true` is declared on the category route and a bogus category returns **404, not 500**.
- Each card boots under the concurrency cap; drag, keyboard resize, both fullscreen flavours, refresh, permalink and prompt copy all work.
- The announcer is one live region and repeated messages are announced.
- `install-control`'s start-truncation still distinguishes `dashboard-01` from `dashboard-02`.
- `lucide-react` resolves the three live icon keys; `lib/pro-manifest.ts` is `server-only`.
- CI builds hermetically against the fixture; the canary fails on a malformed manifest.
- Both `/previews/x` and `/previews/x/` return 200 on the preview.

### Stage 5 — Preview verification

**Pixel-near, full matrix:** `/blocks`, one `/blocks/<group>`, one `/blocks/<group>/<category>` — 3 widths × 2 themes = 18 views, side by side with production.

**And the one check that is not parity:** confirm ISR works. With the preview live, wait past the 300 s window and confirm `x-vercel-cache` transitions (`MISS` → `HIT` → `STALE`) on `/blocks`:

```bash
for i in 1 2 3; do curl -sI "$PREVIEW/blocks" | grep -i 'x-vercel-cache\|age'; sleep 2; done
```

The full promise — **a category added to the manifest appears without a rebuild** — is verified in Stage 11 against production (§17.1), because it needs a real manifest change.

### Stage 5 — §17.6 rows expected here

**#12** (block toolbar tooltips gain Base UI's open delay and portal), **#18** (`/blocks`'s JSON-LD `headline` goes bare — 1 of the 16), **#23** (`BreadcrumbList` on `/blocks`), **#24** (`/blocks` breadcrumb gains `nav > ol > li` + `aria-current`, pixel-identical).

**Row #3 (the 17 block pages stop declaring a 404 `og:image`) is Stage 9's**, not this stage's — the pages will still point at a card that does not exist until the OG route ships. Record that as an open thread.

### Stage 5 — Proof obligations

- **#3 (`"use cache"` needs `cacheComponents`)** — Task 5.1 Step 3. If false: record; do not change shape.
- **#5 (`/previews/x/` trailing slash)** — Task 5.7. If false: fix in `vercel.json`, never in `next.config`.

### Stage 5 — Record

`.scratch/blume-to-nextjs/verification/stage-5.md`: the route count (18), the single-fetch evidence, the 404-not-500 probe, the `x-vercel-cache` transitions, both `/previews/` forms, the canary's deliberate failure, the 18-view pixel-near verdict, and the open thread for row #3.

---

# Stage 6 — Clerk, `/account`, `/pro`

Two pages, one library that must stay off the anonymous path. **`@clerk/clerk-js` stays, client-only. No `@clerk/nextjs`, no `middleware.ts`** — `/account` is the only authenticated surface, one page out of 101, and `clerkMiddleware()` would run in front of the whole deployment to serve it. Stage 5 has just finished keeping the request path clean for ISR; putting a middleware function in front of `/blocks`, `/r/*.json` and the agent endpoints to authenticate one page inverts that.

What the Next.js package would genuinely buy, stated so the decline is informed: `@clerk/nextjs` loads `clerk-js` from Clerk's CDN, and **that** build ships the UI components, so `<SignIn />` could mount inline instead of redirecting to Clerk's hosted page. That is a real capability. It is declined because the hosted redirect is a deliberate decision from the pro-infrastructure work, it works today, and `/account`'s signed-out state is designed around the click-to-redirect (an automatic bounce was rejected there as hostile).

### Task 6.1: The gate moves into `lib/clerk.ts` (§12.2)

**Files:**
- Modify: `apps/web/lib/clerk.ts`

- [ ] **Step 1: Both mechanisms survive, and they are not one mechanism**

- a dynamic `import()` in `lib/clerk.ts`, so the bundle code-splits out of every page that imports the module (**the header does, on every page**);
- **and** a `__client_uat` cookie gate checked *before* calling `getClerk()`. Clerk sets that cookie (`"0"` when signed out) and it is **not httpOnly**, so it is the fastest signed-in hint available without paying for Clerk at all.

Measured: `dist/clerk.mjs` is **1,525,892 bytes (1.46 MiB)**. **The cookie gate is what keeps that off the common case**; the dynamic import alone would not — it only moves the cost into a second request the header would still make.

- [ ] **Step 2: The gate belongs in the module, not at each call site**

Three callers exist — header, `/account`, `/pro` — and only one gates today. **`/account` is the correct exception**: a visitor who navigated there deliberately should load Clerk regardless of the hint. Express that as an explicit parameter, not as a duplicated check:

```ts
export async function getClerkIfLikelySignedIn(): Promise<Clerk | undefined>;
export async function getClerkAlways(): Promise<Clerk>;   // /account only
```

- [ ] **Step 3: Env rename**

`PUBLIC_CLERK_PUBLISHABLE_KEY` → **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**. It is the site's **only** environment variable — a full grep of `import.meta.env` across `lib/`, `components/` and `pages/` returns this one line plus `BASE_URL`.

```bash
sed -i '' 's/^PUBLIC_CLERK_PUBLISHABLE_KEY=/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=/' apps/web/.env.example
grep -rn 'PUBLIC_CLERK_PUBLISHABLE_KEY' apps/web --include='*.ts' --include='*.tsx'
```

**A missing value is silent**: `new Clerk(undefined)` fails inside the lazy path, which the header swallows by design. The Vercel project also needs the rename — that is a §22 cutover item (Task 11.5), and the **preview** environment needs it now for this stage to be verifiable.

The grep also returns `import.meta.env.BASE_URL`, which is **not** an environment variable — it is Astro's `basePath` echo. It needs no replacement: there is no `basePath` (§3), `/docs` is a literal segment, and every file that read it is rewritten by Stages 1–5. Confirm it survives nowhere:

```bash
grep -rn 'BASE_URL\|import.meta.env' apps/web --include='*.ts' --include='*.tsx'   # expected: no output
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/clerk.ts apps/web/.env.example
git commit -m "refactor(web): gate Clerk on the client hint inside lib/clerk.ts

The dynamic import and the __client_uat cookie gate are two mechanisms, not
one: the import splits 1.46 MiB out of the header's chunk, the cookie keeps it
off the anonymous request entirely. Only /account may bypass the hint."
```

### Task 6.2: `/account` — a static shell filled client-side (§12.3, §12.4)

**Files:**
- Create: `apps/web/app/account/page.tsx`, `apps/web/components/account/account-panel.tsx`
- Read (port from): `legacy-pages/account.astro`

- [ ] **Step 1: Why it cannot be a server component**

A server component cannot fetch the licenses: the request carries a Clerk session cookie, and turning it into the Bearer token `/api/me/licenses` expects needs a server-side Clerk context — which is `auth()`, which is `@clerk/nextjs`, which is Task 6.1's declined decision.

- [ ] **Step 2: Preserve the three independent failure surfaces**

- a Clerk **boot** failure renders the whole-page retry;
- a **licenses** failure stays inside its own box with its own retry;
- **identity** and **sign-out** resolve separately from licenses.

`<AccountPanel>` is a client component with real state for four views: signed-out, identity + licenses loading, licenses, error.

- [ ] **Step 3: 340 lines of HTML-as-strings collapse**

Ported to JSX, `account.astro`'s `innerHTML` assignments, the manual escaping of interpolated user data (`clerk.user.fullName` goes straight into a template literal today) and the `querySelector`-then-`addEventListener` rebinding **all disappear**. Same shape as §9's sanitizer finding: work that exists only because the output path is `innerHTML`.

The static half — the `l-row` / `l-marks` crop-mark frame and the keyframes — **stays static**.

- [ ] **Step 4: The signed-out hero is server-rendered as the default (§17.6 #13)**

Neither `/account` nor `/pro` checks `__client_uat` today, so an anonymous visitor to either downloads **1.46 MiB**; on `/account` they watch a skeleton until it lands.

With no `__client_uat` cookie the signed-out state is the **correct terminal state**, so Clerk is never loaded and **`/account` is zero-JS for anonymous visitors**. The skeleton survives only on the cookie-present path, where it is honest.

The cookie can also be absent because cookies are blocked — in which case Clerk could not have established a session either, so "signed out" remains correct.

The visible consequence, and the reason this is a declared diff: the page's draw animation now plays **at first paint** rather than after Clerk boots.

- [ ] **Step 5: Verify both paths and commit**

With no `__client_uat` cookie: the signed-out hero renders server-side, and the network panel shows **no `clerk.mjs` request at all**. With a signed-in session: identity and licenses load, sign-out works, and killing `/api/me/licenses` (block it in DevTools) leaves the licenses box in its own error state while identity stays fine.

```bash
git add apps/web/app/account apps/web/components/account
git commit -m "feat(web): render the signed-out account state on the server

An anonymous visitor downloaded 1.46 MiB of Clerk to be told they are signed
out. With no __client_uat cookie the signed-out state is the correct terminal
state, so /account is zero-JS for them and its draw animation plays at first
paint. The three independent failure surfaces are preserved."
```

### Task 6.3: `/pro` (§12.5)

**Files:**
- Create: `apps/web/app/pro/page.tsx`
- Read (port from): `legacy-pages/pro.astro`, `legacy-components/pro-offer.astro`

- [ ] **Step 1: Fully public; Clerk is progressive enhancement only**

`enhanceBuyLink` pre-fills `customer_email` and `reference_id` on the checkout link for a signed-in visitor; signed-out visitors keep the plain link. **Nothing on the page is gated.**

- [ ] **Step 2: The buy-link enhancement takes the same cookie gate**

`/pro` is the marketing page a cold visitor lands on from an ad; today the 1.46 MiB bundle is paid purely to decide there is no email to pre-fill.

- [ ] **Step 3: Verify and commit**

Anonymous: no `clerk.mjs` request, plain checkout link. Signed in: the link carries `customer_email` and `reference_id`.

```bash
git add apps/web/app/pro
git commit -m "feat(web): port /pro with Clerk behind the client hint"
```

### Stage 6 — Definition of done

- `/account` and `/pro` render; `middleware.ts` does not exist and `@clerk/nextjs` is not installed.
- An anonymous visit to either page issues **zero** Clerk requests.
- `/account`'s three failure surfaces are independently reachable.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is the only env var in `.env.example`, and it is set in the preview environment.

### Stage 6 — Preview verification

`/pro` and `/account` — 2 widths × 2 themes, anonymous and signed in. **Anything behind Clerk beyond "`/account` loads and lists licenses" is explicitly outside the gate** (§17.7); do not expand the check.

### Stage 6 — §17.6 rows expected here

**#13** (`/account`'s signed-out state renders server-side, so its draw animation plays at first paint), **#18** (`headline` bare on `/pro` and `/account` — the last 2 of 16).

### Stage 6 — Proof obligations

None.

### Stage 6 — Record

`.scratch/blume-to-nextjs/verification/stage-6.md`: the anonymous no-Clerk-request evidence for both pages, the three failure surfaces, the env-var grep, the four `/account` views.

---

# Stage 7 — Search palette

One of the **two forced redesign exceptions** (§19). Blume's Orama dialog is not reproduced — `theme.css` already fights it with `!important` to reach a single-column palette, which is what the replacement should simply *be*. Rebuilt on SevenUI's own `command` primitive.

**Measured first, and this number decides most of the stage:** full-text matching does not work on this corpus. 65 of the 68 pages are the same skeleton, so body text is nearly non-selective — `installation` matches 67/68, `usage` 66/68, `props` 47/68, `base ui` 47/68, `variant` 26/68.

### Task 7.1: The index — 382 entries, built at build time (§9.1, §9.2)

**Files:**
- Create: `apps/web/lib/docs/search.ts`, `apps/web/scripts/build-search-index.mjs` (or a build-time route that writes the asset)

**Interfaces:**
- Produces: a **static JSON asset**, 113 KiB raw / 30 KiB gzipped, fetched on first open.

- [ ] **Step 1: 382 = 68 pages + 314 headings**

There are 509 `h2`/`h3` headings but only 261 distinct, and three of them — **`Installation`, `Usage`, `API reference`** — account for **195** occurrences. Those three are excluded; the remaining 314 are genuinely page-specific (`Loading`, `With icons`, `Controlled`).

A heading entry deep-links to `route#slug`, which **cannot drift** because the slug comes from the same `github-slugger` pass `rehype-slug` runs at render (Task 2.1).

- [ ] **Step 2: Derived from the content index, no second reader**

Same server-only `fs` module, **no codegen of a checked-in artifact** — the asset is build output, like `public/r/`.

Body text stays, **page-level only**, weighted below title/heading/description. Recorded for the future: dropping body text entirely takes the index to 31 KiB raw / **5 KiB gzipped**. That is a real lever, but it costs the one thing today's search does have, so **it is not taken here**.

- [ ] **Step 3: Scope is docs only — 68 pages, unchanged**

This is **parity, not a restriction**: Blume's index contains the 68 `.mdx` routes and nothing else. `/blocks` must stay out on its own merits — it is ISR-revalidated, so a build-time index of it is stale by construction. The gallery was raised and dropped: covering it is a product decision, not migration parity.

(`/docs/components` joins as a 69th page automatically, since it is authored MDX.)

- [ ] **Step 4: `search.popular` moves, with its landmine defused (§9.6)**

Six links, rendered as a "Popular" group in the empty state, unchanged. **Landmine:** the routes in `blume.config.ts` are **base-less** (`/installation`, `/theming`, `/components/button`) because Blume prefixes them through `basePath` at render. There is no `basePath`, so **all six must be written with a literal `/docs/` prefix**.

`/components/button` is the dangerous one — unprefixed it resolves to a **real but wrong page** in the gallery's namespace rather than 404ing. `/components/dialog` is the same trap.

The empty state's other group, **"Ask AI", does not come along**: `blume.config.ts` has no `ai.ask` block, so it is already off in production.

- [ ] **Step 5: Verify and commit**

```bash
pnpm --filter @sevenui/web build
ls -la apps/web/.next/static/**/search-index.json 2>/dev/null || ls -la apps/web/public/search-index.json
gzip -9 -c <the index> | wc -c     # expected: ~30 KiB
node -e '
const idx = require("./apps/web/public/search-index.json");
console.log("entries:", idx.length);                                  // expected: 383 (382 + /docs/components)
const pages = idx.filter((e) => !e.hash).length;                      // expected: 69
const heads = idx.length - pages;                                     // expected: 314
console.log("pages:", pages, "headings:", heads);
for (const bad of ["Installation", "Usage", "API reference"])
  if (idx.some((e) => e.hash && e.title === bad)) throw new Error("generic heading not excluded: " + bad);
const { POPULAR } = require("./apps/web/lib/docs/search.ts");
for (const p of POPULAR) if (!p.href.startsWith("/docs/")) throw new Error("base-less popular route: " + p.href);
console.log("ok");'
```

```bash
git add apps/web/lib/docs/search.ts apps/web/scripts
git commit -m "feat(web): build a 382-entry docs search index

68 pages plus 314 page-specific headings; Installation, Usage and API
reference are excluded because three strings account for 195 of 509
occurrences. The six popular routes gain the /docs prefix they got from
basePath, one of which resolved to a real but wrong page without it."
```

### Task 7.2: The matcher and the palette (§9.3, §9.5, §9.7)

**Files:**
- Create: `apps/web/components/search/command-dialog.tsx`, `apps/web/components/search/scorer.ts`, `apps/web/components/search/search-trigger.tsx`
- Modify: `apps/web/components/site-header.tsx` (add the trigger + its dynamic import)

- [ ] **Step 1: The matcher is ours; Base UI keeps everything else**

`command` is `Autocomplete.Root`, and `AutocompleteRootProps` does **not** omit `filteredItems` — the list uses those items instead of filtering internally. So a **ranked array is handed in** and Base UI renders it in our order while keeping the combobox roles, `aria-activedescendant`, highlight and keyboard handling.

**Base UI's own filter could not do this:** it is `Intl.Collator`-backed **substring `contains`** returning a boolean, with no score, and its sliding-window compare over 81 KiB of body text would run per keystroke.

- [ ] **Step 2: The scorer — hand-written, no library**

A field-weighted ladder:

```
exact title > title prefix > title substring > heading substring > description substring > body substring
```

with **a page's own entry ranked above its headings on ties**, so a page and its sections do not interleave. **12 results shown**, as today.

- [ ] **Step 3: The keyboard contract, minus one dead binding (§9.5)**

- **`⌘/Ctrl+K` toggles** — pressing it with the dialog open **closes** it. This is deliberate, to avoid re-`showModal` on an open dialog; reproduce the toggle, not an open-only binding.
- **`/` opens only**, and is **inert while focus is in any field**.
- Arrows, Enter, Escape as today.
- **`⌘J` is dropped**: it toggles a result-preview pane this site already hides with `!important`, so the binding is dead today (§14.7).

- [ ] **Step 4: The trigger keeps its position and appearance exactly**

An `h-9` rounded-full bordered pill, **icon-only below `lg`**, gaining the "Search" label and a `⌘K` kbd above it.

The **dialog** sits behind a **dynamic import** so the palette and its matcher stay out of the header chunk (§11.4).

- [ ] **Step 5: Result rows — one template, two entry kinds (§9.7)**

File icon, title, and a **2-line clamped** excerpt, both title and excerpt carrying `<mark>` highlights.

- A **page** row is that, unchanged.
- A **heading** row puts the heading text on the title line and **its page's title on the second line**, in place of the excerpt.

The `breadcrumb` field is carried in the hit and **never rendered** — it exists for the section pills only. Section pills keep today's threshold (they render only when the result set spans two or more sections) and count **distinct pages, not entries**, so heading entries cannot inflate them.

- [ ] **Step 6: ~60 lines of security-critical code have no successor, and that is the point (§9.8)**

Blume builds result rows as HTML strings and assigns them with `innerHTML`, so it needs `highlight()` (match on raw text, escape per segment, so a query like `amp` cannot mark the inside of an entity) and `sanitizeExcerpt()` (reduce provider markup to bare `<mark>`, splitting on angle-runs so a deletion cannot splice `<<b>script>` into `<script>`).

**In React the excerpt is an array of text nodes and `<mark>` elements** — no HTML string, no escaping step, no sanitizer. **Do not port either function.** If a reviewer asks where the escaping went, the answer is that the output path that required it is gone.

No no-JS story is lost: Blume's dialog is a custom element wrapping a native `<dialog>`; with JS off the trigger is already inert. `CommandDialog` is Base UI Dialog plus Autocomplete, so combobox roles, `aria-activedescendant` wiring and the focus trap come from the primitive rather than **866 lines** of bespoke element.

- [ ] **Step 7: Verify and commit**

Nothing in §17's differential gate covers this — §21.2 says so explicitly: the index is none of the four inventoried surfaces, the palette renders on no route, and Blume's dialog is gone so there is no old side to diff against. **So verify it by hand, deliberately:**

| Check | Expectation |
|---|---|
| `⌘K` twice | opens, then closes |
| `/` in the page | opens |
| `/` inside the search input | types a `/`, does not re-open |
| Query `button` | the `Button` page ranks above every heading on it |
| Query `with icons` | heading entries deep-link to `route#slug` and the browser lands **below** the sticky header (Stage 1's `scroll-padding-top`) |
| Query `installation` | does **not** flood with 67 results — the three generic headings are excluded |
| Empty state | six Popular links, all `/docs/`-prefixed; no "Ask AI" group |
| Section pills | appear only across ≥2 sections; count distinct pages |
| Index fetch | happens on **first open**, not on page load |

```bash
git add apps/web/components/search apps/web/components/site-header.tsx
git commit -m "feat(web): rebuild the search palette on the command primitive

Blume's Orama dialog was already being fought with !important to reach a
single-column palette. The ranked array is handed to Base UI's Autocomplete
so the combobox roles and focus trap come from the primitive, and the two
sanitizer helpers have no successor because the innerHTML path is gone."
```

### Stage 7 — Definition of done

- The index is 382 entries (383 with `/docs/components`), ~30 KiB gzipped, fetched on first open.
- All six Popular routes carry a literal `/docs/` prefix.
- Every row of Task 7.2 Step 7's table passes.
- `⌘J` is not bound anywhere.

### Stage 7 — Preview verification

The palette on `/docs`, one primitive page and `/components` (the trigger is in the site header, so it is reachable everywhere) — 2 widths × 2 themes, plus keyboard-only operation end to end.

### Stage 7 — §17.6 rows expected here

**#11** (search results may deep-link to a heading anchor; a new static index asset appears).

### Stage 7 — Proof obligations

None. But record §21.2 explicitly in the stage checklist: **this surface has no automated gate**, by construction, and the hand checks above are the whole verification.

### Stage 7 — Record

`.scratch/blume-to-nextjs/verification/stage-7.md`: the index entry count and gzip size, the nine hand checks with a verdict each, and a line naming §21.2's blind spot.

---

# Stage 8 — Agent-facing and SEO surface

74 text/JSON endpoints, diffed against Stage 0's fixtures. **Every diff must be empty or one of §17.6's rows** — this is the stage where the fixture gate does most of its work.

**Two things the current deployment does *not* do despite shipping the code for them**, and neither is restored (§19): the `x-markdown-tokens` response header (Blume's endpoint sets it; a static build writes the body to disk and the header is lost — verified absent in production), and `Accept: text/markdown` content negotiation (Blume ships dev middleware and a Vercel routing path; the static deployment runs neither).

**Re-run the inventory generator after the `.mdx` drop; do not rely on the coincidence** that 74 was also §17's recorded number — the live total is 143, because §17's inventory missed the 69 `.mdx` routes and `/agent-readability.json`.

### Task 8.1: The two serializers (§15.3)

**Files:**
- Create: `apps/web/lib/docs/serialize-md.ts`

**Interfaces:**
- Produces: `toMarkdown(doc: DocPage): string` — the body of both the `.md` mirrors and `llms-full.txt`.

- [ ] **Step 1: The registry is closed at two**

Per §6 the authored surface is exactly `<Component>` and `<InstallCommand>`, so **the serializer registry is closed at two.** Blume's other five (`Callout, Steps, Tabs, TypeTable, YouTube`) have zero uses and are not ported.

- [ ] **Step 2: `<Component>` keeps today's behaviour exactly**

The example's source as a fenced block in the example's language. **Verified non-defect:** the fenced source uses `@/registry/base/ui/*`, which is what the page's own Code tab shows, so the two agree; only the hand-authored Usage block says `@/components/ui/*`, as it should.

- [ ] **Step 3: `<InstallCommand>` serializes to all four commands (§17.6 #1)**

The tag currently reaches agents **verbatim** on 68 pages, so the Installation section of every primitive page is **empty of instruction** for a Markdown reader.

**This is our gap, not Blume's:** its serializer registry is `Callout, Steps, Tabs, TypeTable, YouTube` plus `Component`, and it ships a documented extension point — `ai.markdownComponents` — that `blume.config.ts` never used. Which also means the port has no migration problem here: it writes both serializers itself.

The port emits **one fenced `bash` block holding all four commands** (npx / pnpm dlx / yarn dlx / bunx) — the Markdown counterpart of Task 2.7's package-manager bar, and a **deliberate, spec-recorded improvement over parity**. One uniform intended diff across 68 pages, in both `/<route>.md` and `llms-full.txt`.

- [ ] **Step 4: Front matter — kept in `.md`, stripped in `llms-full.txt`**

Today `.md` emits the verbatim YAML block while `llms-full.txt` strips it and writes `# <title>` + `Source: <url>`. **The split is kept**: YAML front matter is the standard metadata carrier for a standalone Markdown document and flattening it loses `description` as structured data, while inside `llms-full.txt` the same block would be noise — 68 documents are concatenated there and the `# <title>` / `Source:` pair is what separates them.

Page titles stay **bare** in every agent artefact (§15.9): `llms.txt` link text, `llms-full.txt` section headings, and the `.md` front-matter `title:`. The suffix rule governs `<title>`, `og:title` and `og:image:alt` **only**.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/docs/serialize-md.ts
git commit -m "feat(web): serialize the two authored MDX components for agents

<InstallCommand> reached agents as raw JSX on 68 pages, leaving every
Installation section empty of instruction. It now emits all four package
managers in one bash fence; <Component> keeps emitting the example source."
```

### Task 8.2: The 69 `.md` mirrors (§15.1, §15.2, PROOF P2)

**Files:**
- Create: `apps/web/scripts/build-md-mirrors.mjs`
- Modify: `apps/web/package.json` (`build` runs it), `.gitignore`

- [ ] **Step 1: Choose the mechanism, and record why**

The URL shape is `<page path>.md` — `/docs.md`, `/docs/components/button.md`. That **cannot be expressed as a Next route segment**: `app/docs/[[...slug]]/page.tsx` already matches `["components","button.md"]`, so a root-level catch-all `route.ts` would never be reached for those paths, and a segment folder cannot carry a `.md` suffix after a dynamic bracket.

**Mechanism: a build-time emit into `public/`**, run before `next build` — the same shape `public/r/` already uses for the registry output, and byte-for-byte what the Astro build does today (it writes these files to disk). The emitted tree is **gitignored build output**, never committed.

```bash
# apps/web/package.json
"build": "pnpm build:registry && node scripts/build-md-mirrors.mjs && next build"
```

Vercel infers `text/markdown` from the `.md` extension, matching production's current content type.

Root-level text endpoints are **not** emitted this way — they are route handlers (Task 8.3), because two of them need ISR.

- [ ] **Step 2: The slug rule is not a quirk**

Blume maps a route to a slug with one expression: `route === "/" ? "index" : route.slice(1)`. `/docs` is a route, `/docs/index` is not — so **`/docs.md` returns 200** (2,634 B, verified) and **`/docs/index.md` 404s** because nothing claims to serve it. **There is nothing to normalize.** Reproduce exactly that: emit `public/docs.md`, `public/docs/installation.md`, `public/docs/components/button.md`, and **no** `public/docs/index.md`.

Custom `.astro` pages produce nothing today (`/components.md`, `/blocks.md`, `/pro.md`, `/privacy.md` all 404) and produce nothing here either (§15.12).

`/docs/components.md` appears **automatically** because §11.3's new page is authored MDX — confirm it does, with no special case written for it.

- [ ] **Step 3: Verify against the fixtures**

```bash
pnpm --filter @sevenui/web build
for f in $(cd .scratch/blume-to-nextjs/fixtures/md && find . -name '*.md'); do
  diff "apps/web/public/${f#./}" ".scratch/blume-to-nextjs/fixtures/md/$f" > /dev/null || echo "DIFF $f"
done
```

**Every reported diff must be row #1** — `<InstallCommand>` serializing to four commands instead of leaking raw JSX. Inspect at least three by hand; anything else is a regression. `/docs/components.md` has no fixture (it is the new route) and is expected to be listed as missing on the old side.

- [ ] **Step 4: Commit**

```bash
echo "apps/web/public/docs/" >> .gitignore
echo "apps/web/public/*.md" >> .gitignore
git add apps/web/scripts/build-md-mirrors.mjs apps/web/package.json .gitignore
git commit -m "feat(web): emit the 69 per-page markdown mirrors at build time

<page path>.md cannot be a Next route segment without colliding with the docs
catch-all, so the mirrors are build output under public/, which is what the
static Astro build already produced and what public/r already does."
```

### Task 8.3: `llms.txt`, `/index.md`, `llms-full.txt`, `robots.txt`, `sitemap.xml`, `agent-readability.json`

**Files:**
- Create: `apps/web/app/llms.txt/route.ts`, `apps/web/app/index.md/route.ts`, `apps/web/app/llms-full.txt/route.ts`, `apps/web/app/agent-readability.json/route.ts`, `apps/web/app/sitemap.ts`, `apps/web/app/robots.ts`

- [ ] **Step 1: `/llms.txt` gains 29 lines, and `/index.md` is the same bytes (§15.2, §15.4, §17.6 #19)**

**`/index.md` is `llms.txt` byte for byte** (both 9,299 B, verified): `buildRawMarkdown` has no MDX source for a landing-page home, so it substitutes `buildLlmsIndex()`. **The two endpoints share one generator, and always will** — so the growth applies to both. Implement one generator and two route handlers that return it.

Today it mirrors the docs nav tree only (`## Docs`, `## Primitives`). It gains **`/components` plus its 10 component pages, and all 18 blocks routes — 29 new lines.**

The blocks half is only affordable because of Step 4: `sitemap.xml` is already fed from Stage 5's manifest `fetch`, whose Data Cache entry is URL-keyed, so `llms.txt` reads **the same entry for no additional fetch and no additional ISR surface** — one more `revalidate: 300`. Listing 18 routes in the sitemap and not in `llms.txt`, from the same data, would have been arbitrary.

The **`## Docs` heading must be synthesized literally** — it is Blume's hard-coded string for loose root pages, not a configured label, which is why Task 2.2 kept loose pages distinguishable from grouped ones.

```ts
export const revalidate = 300;
```

on both handlers.

- [ ] **Step 2: `/llms-full.txt` is reproduced unchanged (§15.5)**

296,471 bytes, 68 sections, **59% fenced code** (175,231 bytes across 214 fences) — measured, confirming that demo sources dominate. **It stays whole.** The file's purpose is the entire corpus in one fetch; dropping the demo sources (~120 KB remaining) would reduce it to a longer `llms.txt`, and a consumer who asks for this file is asking for everything.

It needs no ISR (`export const dynamic = "force-static"`), because nothing in it comes from the manifest.

- [ ] **Step 3: `robots.txt` is reproduced verbatim, permanently (§15.6)**

```
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /

Sitemap: https://sevenui.dev/sitemap.xml
```

Four lines, **byte-identical**. The `Content-Signal` stance is a policy statement, not a technical detail, and revisiting it during a framework cutover would add a diff the gate has to be told to expect for no migration reason. **No post-cutover follow-up is opened either** — the stance is settled, not deferred.

If `app/robots.ts` cannot emit `Content-Signal` (it is not a field Next's `MetadataRoute.Robots` models), use a route handler at `app/robots.txt/route.ts` returning the literal four lines. Byte-identity wins over the idiomatic API.

- [ ] **Step 4: `sitemap.xml` gains 17 routes and is ISR'd (§15.7, §17.6 #2)**

Live today: **85** `<loc>` entries, **bare** — no `<lastmod>`, `<changefreq>` or `<priority>`. It carries `/blocks` but **none of the 3 group or 14 category routes**, so 17 live pages are in no sitemap at all.

`app/sitemap.ts` reads Stage 5's manifest through the shared Data Cache entry and declares `revalidate = 300`, taking the count to **102** — plus §11.3's new `/docs/components`, which arrives automatically because it is authored as MDX, for **103**.

**Entry order is not a contract.** Blume's current collation is visibly odd (`alert-dialog` before `alert`; `/components/tabs` before `/components`); the port sorts with a plain `localeCompare`. **The criterion for this file is URL-set equality, not byte identity** — which is right regardless, since the 17 additions change that set on purpose.

Emit **bare** `<loc>` entries: adding `lastmod` would be a new feature wearing parity's clothes.

- [ ] **Step 5: `/agent-readability.json`, two fields corrected (§15.11)**

Live, 565 B, pointed at from every docs page by `<link rel="describedby">`. Reproduced, with exactly two changes:

- `"generator": "blume@1.5.3"` → **`"sevenui-web"`**. Post-cutover the current value is simply false.
- `"artifacts.markdown.pattern": "https://sevenui.dev/{route}.md"` → **`"https://sevenui.dev/docs/{route}.md"`**. The universal pattern is **already a lie** — verified: `/components/button.md`, `/components.md`, `/blocks.md`, `/pro.md` and `/terms.md` all 404, because `.md` mirrors exist only for the 68 docs routes plus `/`. Nothing noticed because `llms.txt` never listed those routes; Step 1 makes it list 29 of them, so the field has to become true.

Everything else — `contentUsage` (which mirrors `robots.txt`'s `Content-Signal`), `site`, `repository`, `name`, `description` — is reproduced as-is from `lib/site.ts`.

The **three per-docs-page `<link>` tags** (`describedby` ×2, `alternate type="text/markdown"`) are reproduced unchanged and stay **docs-only** — verified absent on `/`, `/components/button` and `/blocks` today. Add them in the docs layout, not the root layout.

- [ ] **Step 6: The 29 newly-listed routes do NOT gain `.md` mirrors (§15.12)**

`llms.txt` lists them as URLs; an agent that wants their content reads the HTML. Synthesizing Markdown for a gallery page is its own design problem — the page is a live component grid, not prose, so the output would be either empty or newly invented content to maintain. For `/blocks` it is worse: the previews are license-gated iframes served from another origin. Step 5's narrowed `pattern` makes the declaration match the reality.

- [ ] **Step 7: Two more things that are not restored**

- **`x-markdown-tokens`** (§15.13): Blume's endpoint sets it (`Math.ceil(length / 4)`) and the static deployment drops it. Next's route handler *could* send it, but adding a header that is not live today is a new feature wearing parity's clothes — and a 4-chars-per-token estimate is wrong silently. **Declined.**
- **WebMCP** (§15.14): every docs page ships `<blume-webmcp …>` plus a **2,709-byte ES module** registering tools on `navigator.modelContext ?? document.modelContext` — an early W3C proposal **no shipping browser implements**, so the module downloads, executes, finds nothing and exits, on every docs page view. **Not ported** (§17.6 #20).

- [ ] **Step 8: Diff everything against the fixtures**

```bash
pnpm --filter @sevenui/web build && pnpm --filter @sevenui/web start &
sleep 3
for f in llms.txt llms-full.txt robots.txt index.md agent-readability.json; do
  curl -s "http://localhost:3000/$f" > "/tmp/new-$f"
  diff "/tmp/new-$f" ".scratch/blume-to-nextjs/fixtures/$f" > "/tmp/diff-$f" || echo "== $f =="; head -40 "/tmp/diff-$f"
done
# sitemap: URL-SET equality, not byte identity
diff <(grep -o '<loc>[^<]*</loc>' /tmp/new-sitemap.xml | sort) \
     <(grep -o '<loc>[^<]*</loc>' .scratch/blume-to-nextjs/fixtures/sitemap.xml | sort)
cmp /tmp/new-llms.txt /tmp/new-index.md && echo "llms.txt == index.md still holds"
```

Expected, and **nothing else**:

| File | Allowed diff |
|---|---|
| `llms.txt`, `index.md` | +29 lines (row #19), and only those |
| `llms-full.txt` | row #1 only (the four-command install blocks) |
| `robots.txt` | **empty** |
| `agent-readability.json` | the two corrected fields, and only those |
| `sitemap.xml` | +17 blocks routes and +1 `/docs/components` (rows #2, #26); no removals |

- [ ] **Step 9: Commit**

```bash
git add apps/web/app
git commit -m "feat(web): reproduce the agent-facing and SEO surface

llms.txt and /index.md share one generator and gain the gallery and the 18
blocks routes off the manifest's existing cache entry; sitemap.xml gains the
17 blocks routes it never listed; agent-readability.json's markdown pattern
stops claiming mirrors that 404."
```

### Stage 8 — Definition of done

- `pnpm inventory` (re-run after the `.mdx` drop) reports the reproduced text/JSON set; **the 69 `.mdx` URLs are gone** (§17.6 #16).
- Every fixture diff is empty or a named §17.6 row, per the table in Task 8.3 Step 8.
- `llms.txt` and `/index.md` are byte-identical to each other.
- `robots.txt` is byte-identical to the fixture.
- `sitemap.xml` is URL-set equal to the fixture **plus** the 17 blocks routes and `/docs/components`; entries are bare.
- Stage 3's open thread closes: "Copy as Markdown" on the page-actions rail fetches a **200**.

### Stage 8 — Preview verification

Curl every root endpoint on the preview and re-run the diff table against the fixtures. Then, in the browser, use the docs rail's **Copy as Markdown** and **Open in chat** on two pages and confirm the clipboard content and the prompt URL are correct.

### Stage 8 — §17.6 rows expected here

**#1** (InstallCommand serializes to four commands), **#2** (sitemap gains 17 routes; criterion becomes URL-set equality), **#16** (69 `.mdx` URLs dropped), **#19** (llms.txt gains 29 lines).

### Stage 8 — Proof obligations

- **P2 (the `.md` mirrors cannot be a Next route segment)** — Task 8.2 Step 1. Primary mechanism is the build-time emit; a collision-free route handler, if one is found later, is a simplification and not a cutover change.

### Stage 8 — Record

`.scratch/blume-to-nextjs/verification/stage-8.md`: the full diff table with a verdict per file, the `llms.txt == index.md` check, the sitemap URL-set delta (must be exactly +18), the rail's two actions, and the re-run inventory counts.

---

# Stage 9 — OG cards

**URL pattern (frozen):** `/og/<pathname minus leading slash>.png`; `/` maps to `/og/index.png`. The `/docs` prefix sits *inside* the slug.

**Pixel-exact parity is not achievable and is not attempted:** today's card is rendered by Takumi (Rust), the Next.js one by Satori. Text metrics and line-breaking differ. **Visual parity is the ceiling.**

### Task 9.1: The route shape and the fonts (§16.3, §16.7)

**Files:**
- Create: `apps/web/app/og/[...slug]/route.tsx`, `apps/web/lib/og/fonts/Geist-Regular.ttf`, `Geist-SemiBold.ttf`, `apps/web/lib/og/card.tsx`

- [ ] **Step 1: A catch-all route is the only shape that works**

`opengraph-image.tsx` **cannot** reproduce those URLs — Next serves it at a generated hashed URL, and file-based metadata *overrides* `generateMetadata`, so the file cannot be kept while pointing `og:image` elsewhere. **A catch-all `app/og/[...slug]/route.tsx` is the only shape** that reproduces the pattern, `/og/index.png` included.

**Rejected:** two routes (a dynamic `app/og/blocks/[...slug]` beside a fully-static catch-all) — two honest cache policies, but bought with a fragile assumption about which of two nested catch-alls wins.

Edge runtime is not required and is **deprecated in 16**; `params` is a promise in 16.

- [ ] **Step 2: Fetch Geist as TTF and commit the two files**

Google Fonts serves Geist v5 as **TTF** to a non-woff2 UA — **72,916 B at 400 and 73,048 B at 600**, so **146 KB** of `ImageResponse`'s **500 KB** budget (which counts fonts). Verified by parsing the `cmap`: **729 glyphs**, full latin + latin-ext, including U+2014 and U+2026.

```bash
mkdir -p apps/web/lib/og/fonts
UA='Mozilla/5.0'   # no woff2 support advertised
curl -sS -A "$UA" "https://fonts.googleapis.com/css2?family=Geist:wght@400;600"
# follow the two src: url(...) entries, download both, then:
ls -la apps/web/lib/og/fonts/*.ttf   # expected: 72916 and 73048 bytes
```

Read as **raw bytes at module scope**; `next/font` inside `ImageResponse` is unsupported.

**The card stays on Geist** rather than moving to Inter, per §11.2 — when the deferred Geist-for-the-site effort lands, card and site converge for free. **§16.3 is explicitly told not to "fix" the card/site font mismatch by pulling the card onto Inter.** The Google v5 build may differ in metrics from Takumi's embedded copy; absorbed by "visual parity is the ceiling".

- [ ] **Step 3: `generateStaticParams`, `dynamicParams`, `revalidate`**

`generateStaticParams` enumerates the ~102 known slugs (85 today + 17 block) from the registry's three sources, reading the manifest off Stage 5's **Data Cache entry — same URL, so free**.

**`dynamicParams: true` is forced** (§16.6): §10 established that `generateStaticParams` does not re-run on revalidation and that new categories render via `dynamicParams`, so an OG route with `dynamicParams = false` would **404 the card for every newly added category — reintroducing the exact bug this stage fixes, on a delay.**

`revalidate = 300`, matching §15.7's site-wide ceiling.

Blume's `Cache-Control: public, max-age=31536000, immutable` is **dropped**: `immutable` on an ISR-revalidated asset is a lie, and Vercel already owns the CDN tier for the prerendered ones.

- [ ] **Step 4: Unknown slug — registry lookup, else `notFound()`**

**This is what makes the strategy safe rather than a sequel to the bug.** Without the lookup, `dynamicParams: true` plus humanization would turn `/og/<anything>.png` into **an image generator hosted on sevenui.dev, looking like ours, with text the caller chooses** — a real abuse surface for a social preview card.

It is also parity: a missing file 404s in today's static build.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/og apps/web/lib/og
git commit -m "feat(web): render OG cards from a catch-all route

opengraph-image.tsx cannot produce /og/<path>.png and would override
generateMetadata, so a catch-all route is the only shape. dynamicParams is
forced on by the blocks routes, which makes the registry lookup mandatory —
without it the route is an open image generator on our own domain."
```

### Task 9.2: Composition, content and palette (§16.2, §16.4, §16.5)

**Files:**
- Modify: `apps/web/lib/og/card.tsx`

- [ ] **Step 1: Composition reproduced verbatim**

1200×630 PNG, RGB, ~15–18 KB, **light only**. Background `#fafafa`, padding 72, flex column with `space-between`.

- **Header:** the logomark alone at 32×32 (viewBox `0 0 64 64`, `currentColor` string-replaced with `#0a0a0a`, inlined as a base64 data URI). **No wordmark.**
- **Headline:** `#0a0a0a`, weight 600, `letterSpacing -0.05em`, `lineHeight 1.05`, `maxWidth 1010`, `textWrap: balance`.
- **Description:** `#737373`, 30px, `lineHeight 1.4`, `marginTop 28`, `maxWidth 900`, balance — `textWrap: "balance"` is on the **description too**, not just the headline.
- **Footer:** a 1px `#e5e5e5` rule at y=500 spanning x 72–1127, then a 22px row with `useui/sevenui` left in `#737373` and `sevenui.dev` right in `#a3a3a3`. Footer strings come from `lib/site.ts`.

The **76/64/52 size tiers are dead code for us** — the longest title on the site is "Message Scroller" (16 chars) and even a fully suffixed form stays under the 40-char threshold, so **every card renders at 76**. Blume's `-0.05em` is, by its own comment, "tuned for Inter" while the card draws in Geist; **that mismatch ships today and is kept.**

`ImageResponse` limits to respect: **flexbox only** (`display: grid` does not work), **500 KB total including fonts**, `ttf`/`otf`/`woff` only. `textWrap: "balance"` **is** implemented by Satori (a binary search for the narrowest width that does not increase height), so both balancings carry over; break points will not match Takumi's exactly.

- [ ] **Step 2: Content is fixed — bare title, own description (§17.6 #21)**

**Headline: the page's bare title, everywhere.** One rule replaces two. Today the headline has two sources and a **custom page wins over a content route sharing its path**: content routes draw `route.title` (so the 68 docs cards are **already correct**), custom pages draw `humanizeSegment(last URL segment)`, and `/` draws `config.title`. Stage 0 pre-shipped the 12 divergent headlines, so the remaining diff is small.

The declared `og:title` is **not** used verbatim — the site name already appears twice on the card (logomark, `sevenui.dev` footer) and a third would be redundant. This aligns with §15.8, which took JSON-LD's `headline` bare on every page; **the card's headline is a visual `<h1>`.**

**Description: the page's own, site description as fallback.** Today the card spends its only content line on a string identical across all 85 cards — zero information. Blume has no per-page card description at all (`og.description` is typed `string | false`), while **68 distinct descriptions exist in frontmatter** (median 64 chars, max 156). `/account` declares none and is exactly what the fallback is for.

This is the single largest quality gain available and the one place where reproducing actively costs something.

**Truncation: description 160, title 64, unchanged.** 160 is the smallest cap that leaves every live description whole. The cap is a safety net, not a typographic limit: the content box is 486 px and fixed furniture takes ~195 px, so a 4-line description at 168 px totals 363 px with 123 px to spare — 5 lines still fit. A cap stays because the registry will accept new descriptions later and an unbounded one would overflow silently. `truncate(title, 64)` never fires after the bare-title decision and is **kept as-is**.

- [ ] **Step 3: Palette — the five literals are kept, `#fafafa` included (§16.5)**

Converting the light tokens: `--foreground` = **#0a0a0a**, `--muted-foreground` = **#737373**, `--border` = **#e5e5e5** — exact matches to the card's literals. Only two diverge: `#fafafa` against a `--background` of pure `#ffffff`, and `#a3a3a3` (footer-right), which has **no token at all**. Name those two as such in a comment.

The card is light-only and baked at build, so it can never follow the theme — "reading tokens" would be a one-time copy either way, and it would add a build-time coupling from the OG route into `globals.css`, which §8 established as the token owner for the *runtime*. The off-white also does real work: **it separates the card from a white chat bubble.**

**No dark variant.** No social platform honours `prefers-color-scheme` for OG images, so a dark card could only be selected by a query param nothing sets — while doubling the surface §17 must verify.

`accent` is **dead code here** (it only paints the fallback used when no logo is configured, and we configure one) — do not port it.

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/og/card.tsx
git commit -m "feat(web): draw every OG card from the page's own title and description

The card spent its only content line on a string identical across all 85
cards while 68 distinct descriptions sat in frontmatter. Composition, type
scale and the five colour literals are reproduced verbatim."
```

### Task 9.3: The OG surface's own gate (§17.5, §16.6)

**Files:**
- Create: `scripts/og-sweep.mjs`

- [ ] **Step 1: Automated sweep over all ~102**

200 status, `image/png` content type, byte length above a floor (say 8 KB — the live cards are 15–18 KB). **This alone would have caught the live 404 `og:image` bug.**

```bash
node scripts/route-inventory.mjs | node scripts/og-sweep.mjs --base "$PREVIEW"
```

- [ ] **Step 2: Diff the card's input, not its output**

The drawn text is unreadable from the PNG, but the registry is text: assert `lib/page-meta.ts`'s `{title, description}` against the same route's `generateMetadata` output. **This is the only automated check that proves §16.4 held** — make it part of the sweep script, not a manual step.

- [ ] **Step 3: A fixed — not random — 6-card human review**

Landing, one docs primitive, one docs guide, one gallery page, one block category, one legal page. **Fixed matters:** every card changes deliberately, so the reviewer is confirming the rule held, not that nothing moved.

- [ ] **Step 4: The 17 block cards, and why they force the rest (§16.6, §17.6 #3)**

**Production bug, pre-existing:** the dynamic block pages ship a **404 `og:image`** — Blume's `customOgRoutes` skips any `[param]` pattern so no card is generated, while `PageLayout` emits the tag anyway. Correcting the count: **17** cards are missing, not 16.

Verify the fix directly:

```bash
curl -sI "$PREVIEW/og/blocks/marketing/hero.png" | head -3   # 200, image/png
```

Stage 5's open thread closes here.

- [ ] **Step 5: Commit**

```bash
git add scripts/og-sweep.mjs
git commit -m "test(repo): sweep every OG card and diff the card's input

The drawn text is unreadable from the PNG, so the gate asserts page-meta
against each route's declared metadata — the only automated proof that the
card draws the page's own words."
```

### Stage 9 — Definition of done

- All ~102 cards return 200 `image/png` above the byte floor, including the **17 block cards that 404 in production today**.
- `/og/index.png` renders the landing card; `/og/docs/components/button.png` renders "Button".
- An unknown slug (`/og/not-a-route.png`) returns **404**, not a generated image.
- The page-meta ↔ `generateMetadata` assertion passes for every route.
- **Every route declares the full `og:*` / `twitter:*` set, and the assertion is over the TAG SET, not just the image URL.** Added after Stage 4 measured the shortfall, because nothing in this stage's three tasks owned it and the gap is site-wide rather than confined to one surface. Production emits **10 `og:*` + 5 `twitter:*`** on every page — measured on `/`, `/docs/components/button` and `/components/button` alike. Against that, at the end of Stage 4 the branch stands at: docs routes **4 og + 5 twitter** (Stage 2 wrote `og:title`, `og:description`, `og:image`, `og:image:alt` and stopped); `/` and the **11 `/components` routes 0 and 0**. The six tags no route declares are `og:type`, `og:site_name`, `og:url`, `og:image:type`, `og:image:width`, `og:image:height`.
- **The routes are enumerated, not sampled.** The non-docs set is `/`, `/components`, its 10 children, `/pro`, `/account`, `/terms`, `/privacy`, `/blocks` and its 17 group and category routes. Stage 0 pre-shipped `seo.og.titles` for the 10 gallery children precisely so this stage reproduces them, so a gallery route shipping bare would silently discard that pre-ship.
- The 6-card human review is done and recorded.

### Stage 9 — Preview verification

The sweep, plus the six fixed cards opened and eyeballed. Compare each against its production counterpart **for composition, not pixels** — Takumi vs Satori line-breaking differences are expected and are **not** findings (§17.7).

### Stage 9 — §17.6 rows expected here

**#3** (the 17 block pages stop declaring a 404 `og:image`), **#21** (OG card descriptions become per-page across all cards).

### Stage 9 — Proof obligations

None.

### Stage 9 — Record

`.scratch/blume-to-nextjs/verification/stage-9.md`: the sweep output (count, any failures), the input-diff result, the unknown-slug 404, and the six-card verdict.

---

# Stage 10 — Retirement sweep

Blume leaves the repository. **Ledger 4 (§14.7) is the checklist**, and Task 10.5 walks it row by row — nothing on that table may still be live when this stage ends.

This stage is last among the code stages **because its riskiest item touches the whole workspace's `node_modules`**, and doing that while nine other things are in flight would make any failure unattributable.

### Task 10.1: Remove `publicHoistPattern` (PROOF #6)

**Files:**
- Modify: `pnpm-workspace.yaml`

**Interfaces:**
- Produces: a workspace whose `node_modules` layout is plain pnpm. `packages/registry`'s 525 tests resolve from that same layout, which is why this is a three-step proof and not a one-line delete.

- [ ] **Step 1: Know why it existed and why it should not**

The comment in `pnpm-workspace.yaml` states the reason exactly: *"Blume SSR prerender externalizes registry deps; hoist them so Node's ancestor walk from apps/web/dist can resolve them."* **Next.js has no equivalent step** — server code is bundled or traced, client code is always bundled, and nothing resolves a bare specifier from a build-output directory at runtime.

**The repo already contains the control case.** `cn` is imported directly by **65 registry source files**, is **not** in the hoist list, is unreachable from `apps/web` by any `node_modules` ancestor walk, **and the site builds today** — because the bundler bundles it. Direct imports therefore never needed the hoist; only Node's runtime resolution from `dist/` did.

Conversely `clsx`, `tailwind-merge` and `react-is` are **not in `packages/registry/node_modules` at all** — they are transitive and exist only because the hoist put them at the workspace root, **which has been masking them**. Expect those three to be the failure mode if there is one.

- [ ] **Step 2: Delete the block and reinstall from scratch**

```bash
# Remove the publicHoistPattern block from pnpm-workspace.yaml, comment included.
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

- [ ] **Step 3: Production build, and confirm the five named surfaces actually render**

**Naming the pages is the point:** removing the hoist wrongly fails at **build** time in one import, and *"the build passed"* is not evidence when the failing page might not have been built.

```bash
pnpm --filter @sevenui/web build && pnpm --filter @sevenui/web start &
sleep 4
for p in carousel chart calendar resizable field; do
  echo -n "$p: "; curl -s "http://localhost:3000/docs/components/$p" | grep -c 'data-sevenui-example'
done
```

| Page | Heavy dependency being proven |
|---|---|
| `/docs/components/carousel` | `embla-carousel-react` |
| `/docs/components/chart` | `recharts` |
| `/docs/components/calendar` | `react-day-picker` |
| `/docs/components/resizable` | `react-resizable-panels` |
| `/docs/components/field` (the **`field-rhf`** demo) | `react-hook-form` |

Each must render its demo markup, not an empty pane. Open the chart and calendar pages in a browser — a recharts failure can be a runtime error rather than a build error.

- [ ] **Step 4: The other consumer of that layout**

```bash
pnpm test         # packages/registry: 525 tests
pnpm test:smoke
pnpm check:registry
```

- [ ] **Step 5: If any of Steps 3–4 fails**

**Restore the block and record why in the spec.** The migration does not depend on removing it. Do not chase individual missing packages by adding them to `packages/registry`'s dependencies — that is a registry change, which is out of scope (§19), and the hoist is the cheaper correct answer if the proof fails.

- [ ] **Step 6: Commit**

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "chore(repo): drop publicHoistPattern

It existed so Node's ancestor walk from apps/web/dist could resolve registry
deps during Blume's SSR prerender. Next.js has no such step, and cn — imported
by 65 registry files and never hoisted — was already the control case."
```

### Task 10.2: The Blume patch, the generated directories, the dependencies

**Files:**
- Delete: `patches/blume@1.5.3.patch`
- Modify: `pnpm-workspace.yaml` (drop `patchedDependencies`), `apps/web/package.json` (drop `blume`), `.gitignore`
- Delete: `apps/web/.gitignore`, `apps/web/.blume/`, `apps/web/.blume-verify/`

- [ ] **Step 1: The patch carries TWO hunks, not one**

Anyone reading `patchedDependencies` as "a vendor bug we work around" would have deleted half a capability:

1. the missing `rafThrottle` import in `content/Component.astro` — **the bug**, upstream PR **blume#245**;
2. a `layout?: Record<string, ComponentOverride>` prop on `PageLayout.astro` resolved through `resolveSlot(layout.Header, Header)` — **a feature six pages depend on** (`/`, `/pro`, `/account` and all three `/blocks` pages pass `layout={{ Header }}`).

**Both die anyway:** the fix because §7.3 removed the only caller, the feature because the port's layouts are its own, where a header override is not a capability to be granted but the default.

**The upstream PR stands on its own and stays submitted.** This repo simply stops carrying the patch.

- [ ] **Step 2: Generated directories**

```bash
git rm -r --cached apps/web/.blume apps/web/.blume-verify 2>/dev/null || true
rm -rf apps/web/.blume apps/web/.blume-verify
git rm apps/web/.gitignore
```

The root `.gitignore` drops `.blume/` and `.blume-verify/`; `dist/` is replaced by `.next/` (added in Stage 1). `apps/web/.gitignore` contains **nothing but a duplicate `.blume-verify/`**, so that **file is deleted rather than edited**.

**`apps/web/public/r/` stays** — it is the registry build output and predates Blume.

- [ ] **Step 3: Dependencies leave**

`blume`, `@lucide/astro` and `@vercel/analytics` leave `apps/web/package.json` (the last two already left in Stage 1 — verify). **`shadcn` stays a devDependency** — §17's smoke test pins its local binary deliberately.

- [ ] **Step 4: Verify and commit**

```bash
pnpm install
grep -rn 'blume' apps/web/package.json pnpm-workspace.yaml package.json   # expected: no output
pnpm --filter @sevenui/web build && pnpm check:registry && pnpm test && pnpm test:smoke
git add -A
git commit -m "chore(repo): stop carrying the Blume patch and its generated directories

The patch had two hunks — the rafThrottle bug and a header-override feature
six pages used. The fix's only caller is gone with the iframes and the
feature is the default in layouts we own; the upstream PR stays submitted."
```

### Task 10.3: `blume.config.ts`, `components.ts`, the legacy trees, `assets/`

**Files:**
- Delete: `apps/web/blume.config.ts`, `apps/web/components.ts`, `apps/web/legacy-pages/`, `apps/web/legacy-components/`, `apps/web/assets/`, `apps/web/theme.css`
- Modify: `apps/web/tsconfig.json` (drop the quarantine `exclude` entries)

- [ ] **Step 1: Every resident of `blume.config.ts` has a named home — verify each before deleting (§14.3)**

| Resident | New home | Verify |
|---|---|---|
| 65-entry sidebar order + Primitives group | `lib/docs/nav.ts`, derived, slug-sorted | Stage 2 Task 2.2 |
| `search.popular` (6 base-less routes) | `lib/docs/search.ts`, literal `/docs/` prefixes | Stage 7 Task 7.1 |
| GA4 `analytics.scripts` | root layout, `next/script`, production-gated | Stage 1 Task 1.4 |
| `title`, `description`, `deployment.site` | `lib/site.ts` | Stage 1 Task 1.7 |
| `logo: "assets/logomark.svg"` | the existing `Logomark` component | Stage 1 Task 1.8 |
| external-link `rel` post-build pass | dies; `rehype-external-links` + 9 literal attributes | Stage 2 Task 2.9 |
| `basePath: "/docs"` | **nothing** — `/docs` is a literal segment | Stage 2 Task 2.5 |
| `content: { root, pages }` | **nothing** — the tree stays at `apps/web/docs/` | Stage 2 Task 2.1 |
| `examples: { source, css }` | **nothing** — demos resolve by dynamic import | Stage 2 Task 2.6 |
| `theme: { accent, radius, mode }` | `accent`/`radius` die with Blume's token layer; `mode: "system"` is `next-themes`' `defaultTheme` | Stage 1 Tasks 1.3, 1.5 |
| `github: { owner, repo }` | `lib/site.ts` | Stage 1 Task 1.7 |
| `seo.og.titles` (Stage 0 added these) | **nothing** — §16.4's bare-title rule replaces the override table | Stage 9 Task 9.2 |
| the `sevenui-external-links` integration wrapper | dies with the pass it hosted | Stage 2 Task 2.9 |

`components.ts` goes **entirely**: `defineComponents({ layout: { Header, Sidebar }, mdx: { InstallCommand } })` has no counterpart — the layouts are ours and the MDX component set is passed at render time.

- [ ] **Step 2: Delete the legacy trees**

```bash
git rm -r apps/web/legacy-pages apps/web/legacy-components apps/web/assets
git rm apps/web/blume.config.ts apps/web/components.ts apps/web/theme.css
```

`apps/web/assets/` is a Blume-shaped convention directory holding **two unnecessary files**: `logomark.svg` is byte-identical in path data to `public/logomark.svg` **and** to `components/logomark.tsx`, and `combination-mark.svg` plus `components/combination-mark.tsx` have **no consumer anywhere in the repo** — which is why **three `.tsx` files ported, not four** (Stage 1 Task 1.2).

**`public/logomark.svg` stays** — `avatar-demo` and `hover-card-demo` both load `/logomark.svg`, and under §7 they render in the main document where that path resolves. **`public/icon.svg` stays** as the favicon (light/dark fills hardcoded inside the file).

`theme.css` goes only once `globals.css` demonstrably owns everything it held — re-run Stage 1 Task 1.3's checks before deleting it.

- [ ] **Step 3: Narrow nothing when the quarantine ends**

Remove `legacy-pages`, `legacy-components`, `blume.config.ts` and `components.ts` from the tsconfig `exclude`. **The `include` is untouched** — it stays Next's default, which is the entire point of §14.2.

- [ ] **Step 4: Verify and commit**

```bash
grep -rn 'blume' apps/web --include='*.ts' --include='*.tsx' --include='*.css' --include='*.json' \
  | grep -v 'blume-theme'     # the §20.1 mirror is the ONE allowed survivor
```

Expected: only the `blume-theme` mirror write in `theme-provider.tsx`, with its removal-condition comment. **That is not a DOM attribute** — it is a cross-repo `localStorage` contract with the pro deployment (§13.3).

```bash
pnpm --filter @sevenui/web build && pnpm typecheck && pnpm check:registry && pnpm test && pnpm test:smoke
git add -A
git commit -m "chore(web): delete the Blume config, the Astro sources and the assets directory

Every resident of blume.config.ts has a named home or is deliberately gone;
components.ts has no counterpart at all. The only surviving 'blume' string is
the temporary localStorage mirror, which is a cross-repo contract."
```

### Task 10.4: Repo documentation catches up

**Files:**
- Modify: `AGENTS.md`, `README.md` (if it describes the site's framework)

- [ ] **Step 1: Rewrite the "Repo layout" paragraph**

It still says *"`apps/web` (`@sevenui/web`) is the Blume docs site"*. It becomes a Next.js App Router site; published content still lives in `apps/web/docs/` and is still served under `/docs`; custom pages are now routes under `apps/web/app/`.

- [ ] **Step 2: Point the spec list at the migration record**

Promote the in-flight line added in Stage 1 Task 1.1 to a normal entry, and add the ADR.

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md README.md
git commit -m "docs(repo): describe apps/web as a Next.js App Router site"
```

### Task 10.5: Walk Ledger 4 row by row (§14.7)

**Files:** none (verification only)

**This task exists so that no retired input is discovered later and mistaken for live code.** Assert each row of Ledger 4 with a command, and record the result. Nothing is taken on trust.

- [ ] **Step 1: Deletions**

```bash
test ! -e apps/web/blume.config.ts && test ! -e apps/web/components.ts && echo "config gone"
test ! -e patches/blume@1.5.3.patch && echo "patch gone"
grep -c 'patchedDependencies\|publicHoistPattern' pnpm-workspace.yaml   # expected: 0
test ! -e apps/web/.blume && test ! -e apps/web/.blume-verify && test ! -e apps/web/.gitignore && echo "generated gone"
test ! -e apps/web/assets && test ! -e apps/web/legacy-components/combination-mark.tsx && echo "assets gone"
```

- [ ] **Step 2: The one file that stays on disk and unused**

```bash
test -e packages/registry/demos/theme.css && echo "demos/theme.css still on disk (correct)"
grep -n 'demos/theme.css' scripts/check-registry.mjs   # the comment must be at the READ SITE
grep -c 'no longer loaded by the site' packages/registry/demos/theme.css   # expected: 0 — a comment
                                                                          # inside the file would be a registry edit
```

- [ ] **Step 3: Things that must be absent from the built output**

```bash
pnpm --filter @sevenui/web build && pnpm --filter @sevenui/web start &
sleep 3
curl -s http://localhost:3000/docs/components/button > /tmp/p.html
grep -c 'blume-webmcp' /tmp/p.html                  # 0 — WebMCP
grep -c 'blume-client-data' /tmp/p.html             # 0 — the JSON island
grep -c 'data-blume-' /tmp/p.html                   # 0 — the renamed hooks
grep -c 'rafThrottle' /tmp/p.html                   # 0
grep -c 'blume-heading-anchor\|blume-table-scroll' /tmp/p.html   # 0
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/blume-assets/anything   # 404, as today
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/docs/components/button.mdx  # 404 — the 69 dropped
```

- [ ] **Step 4: Things that must be absent from the source**

```bash
grep -rn 'posthog\|plausible\|blume:track' apps/web --include='*.ts' --include='*.tsx'   # 0
grep -rn '@vercel/analytics' apps/web                                                     # 0
grep -rn 'rtl:-scale-x-100' apps/web                                                      # 0
grep -rn 'radius-blume\|color-action\|--color-code' apps/web                              # 0
grep -rn 'renderProBlocks' apps/web                                                       # 0 — the stale comment
grep -rn 'BANNER_INIT_SCRIPT\|--blume-drawer-top\|syncDrawerInert\|ClientRouter' apps/web # 0
grep -rn 'collapsed: false\|blume-nav' apps/web                                            # 0
```

- [ ] **Step 5: The one survivor, and the reason it survives**

```bash
grep -rn 'blume-theme' apps/web --include='*.tsx'
```

Expected: exactly one write site, in `theme-provider.tsx`, carrying the §20.1 removal condition as a comment. **Copy that removal condition into the stage record and into the PR body** — nothing automated can observe when the pro repo starts reading `theme`, so it has to be remembered by a person.

- [ ] **Step 6: Record and commit**

Write every command and its result into `.scratch/blume-to-nextjs/verification/stage-10.md` as a table mirroring Ledger 4.

```bash
git add .scratch/blume-to-nextjs/verification/stage-10.md
git commit -m "test(repo): assert every retired input is actually gone"
```

### Stage 10 — Definition of done

- `publicHoistPattern` removed **and** the five named pages proven to render, or the block restored with the reason recorded in the spec.
- `blume` appears in no manifest, no lockfile entry, no source file — with the single `blume-theme` mirror as the named exception.
- `pnpm typecheck && pnpm check:registry && pnpm test && pnpm build && pnpm test:smoke` all green, with the registry's 525 tests and the item counts unchanged.
- Ledger 4 is walked row by row and recorded.
- `AGENTS.md` no longer calls `apps/web` a Blume site.

### Stage 10 — Preview verification

A full-site smoke pass on the preview, because `node_modules` was rebuilt from scratch: one route per surface (`/`, `/docs`, one primitive, `/components`, one gallery child, `/blocks`, one category, `/pro`, `/account`, `/terms`, 404) plus the five heavy-dependency pages from Task 10.1. Light and dark, 1440 only — this pass is looking for **things that stopped working**, not for drift.

### Stage 10 — §17.6 rows expected here

**None.** Every row this stage's deletions cause was already declared in the stage that made the deletion observable (#5, #16, #20 and the rest). **If the extractor reports a new diff here, a retirement removed something live** — that is the failure mode this stage's own gate exists to catch.

### Stage 10 — Proof obligations

- **#6 (removing `publicHoistPattern` is safe)** — Task 10.1. Fallback: restore the block, record why.

### Stage 10 — Record

`.scratch/blume-to-nextjs/verification/stage-10.md`: the five-page hoist proof, the test/check counts, the Ledger 4 table with a command and a result per row, and the §20.1 removal condition copied out verbatim.

---

# Stage 11 — Parity gate, performance record, cutover

Nothing new is built here. The gate runs over the whole surface, the performance number is taken once, the non-code cutover items are executed, and `main` receives its single merge.

**The bar, restated:** behaviour + layout parity. Information architecture, routes, interactions and overall visual layout must match; a few px of drift, font-rendering differences and spacing rounding are acceptable. `/` and `/blocks` are held closer to pixel parity — both were hand-tuned in dedicated efforts.

### Task 11.1: Generate the inventory and run the differential gate (§17.1, §17.2)

**Files:**
- Create: `.scratch/blume-to-nextjs/verification/gate/` (extractor output, both sides)

- [ ] **Step 1: Generate the inventory — never transcribe it**

```bash
pnpm inventory > .scratch/blume-to-nextjs/verification/gate/inventory.json
```

Expected: **101 HTML routes** (68 docs + the new `/docs/components` = 69, 11 gallery, 18 blocks, 5 standalone, 404 → **104**; reconcile the exact number against §11.3's and §10's additions and **record the arithmetic**, because §17.1's "101" predates the new route and the 16→18 blocks correction).

**`sitemap.xml` is not a sufficient inventory** and that is the headline finding: it lists 85 URLs and omits the live `/blocks` group and category routes, every agent-facing endpoint and every OG image. **A gate built on the sitemap would have declared parity with 17 published pages missing.**

- [ ] **Step 2: Extract both sides**

Old side: production (still Blume until the merge). New side: the branch preview.

```bash
GATE=.scratch/blume-to-nextjs/verification/gate
mkdir -p "$GATE"/{old,new}
node -e '
const i = require("./'"$GATE"'/inventory.json");
console.log([...i.docs, ...i.gallery, ...i.blocks, ...i.standalone].join("\n"));
' > "$GATE/routes.txt"
wc -l "$GATE/routes.txt"
while read -r route; do
  name="${route//\//_}"; name="${name:-_root}"
  node scripts/extract-page-features.mjs "https://sevenui.dev$route" > "$GATE/old/$name.json"
  node scripts/extract-page-features.mjs "$PREVIEW$route"            > "$GATE/new/$name.json"
done < "$GATE/routes.txt"
```

Before diffing, **re-run Task 1.10's four anti-vacuity assertions on the new side too.** §21.3: an extractor returning nothing diffs clean against an extractor returning nothing, and that would invalidate every other gate at once.

- [ ] **Step 3: Diff, and triage every difference into §17.6**

Catches content loss, structural change, broken links and missing sections — the real risk on the 68 docs pages. **Blind to styling, deliberately.**

**Screenshot diffing is explicitly rejected.** The agreed bar accepts px drift and font-rendering differences; a screenshot differ reports exactly those as failures, so it would manufacture false positives against a bar we already set. Do not add one.

Produce a table: route → difference → §17.6 row. **Every row must map. A difference that maps to nothing is a regression and blocks the merge.**

- [ ] **Step 4: Heading anchor IDs are a hard gate**

Anchors are published deep links, so a drift is a contract break. **The diff must be empty.**

```bash
# compare only the headings[].id arrays across all 69 docs routes
```

Per §4.3 this is a **smoke test, not a porting requirement** — the IDs match by construction because both sides run `github-slugger` — and the gate exists to catch an accidental slugger swap.

- [ ] **Step 5: The fixed negative-path list (§17.4)**

The inventory lists only *live* routes and cannot see a miss, and **the risk here is the inverse of the usual one**: §4.1's catch-all and §10's `dynamicParams` both make it easy to accidentally return **200 with a plausible fallback**, which is exactly what makes a stale link look healthy to a crawler.

**Six paths, each asserted 404:**

```bash
for p in /docs/components/definitely-not-a-primitive \
         /components/definitely-not-a-component \
         /blocks/marketing/definitely-not-a-category \
         /og/definitely-not-a-route.png \
         /definitely-not-a-page \
         /components/field; do
  printf '%s -> %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' "$PREVIEW$p")"
done
```

All six must be **404**. The last proves §11.7's old target still 404s rather than quietly becoming something — the gallery namespace holds exactly 10 pages and neither `field` nor `form` is among them.

- [ ] **Step 6: Human review, sampled — not exhaustive**

Most of the matrix has already been spent across Stages 2–9 (§17.3: "per stage, only the routes that stage touched"). What remains here is the **re-check** of anything a later stage could have disturbed:

- **Pixel-near set, full matrix:** `/`, `/blocks`, one `/blocks/<group>`, one `/blocks/<group>/<category>` — 3 widths × 2 themes = **24 views**.
- **Sampled content set,** 2 widths (390, 1440) × 2 themes: `/docs`, `/docs/installation`, the 4 chosen `/docs/components/*`, `/components` + 3 children, `/pro`, `/account`, one legal page, 404 — ~15 routes, **~60 views**.
- `system` theme spot-checked.
- **Overlay check, mandatory on the 4 docs samples** — Dialog, Sheet, Drawer, Command palette opened inside a demo, each covering the viewport.

### Task 11.2: The exact-diff gates (§17.4, §17.5)

- [ ] **Step 1: Registry JSON — absolute**

```bash
pnpm build:registry
git stash && git checkout main && pnpm install && pnpm build:registry
# hash both outputs and compare
```

`shadcn build` output must be **byte-identical** against `main`'s; **any diff at all is a regression.** 247 files. `scripts/check-registry.mjs` already exists and CI already runs it.

- [ ] **Step 2: Agent and SEO endpoints — re-run Stage 8's diff table against the fixtures**

Every diff must be empty or named in §17.6. `sitemap.xml`'s criterion is URL-set equality, not byte identity.

- [ ] **Step 3: OG — re-run Stage 9's sweep and input-diff across all ~102 cards**

### Task 11.3: The performance measurement (§18)

**Files:**
- Modify: `docs/superpowers/specs/2026-09-18-blume-to-nextjs-migration-design.md` (§18 gains the measured table)

- [ ] **Step 1: Understand what this is and is not**

**A recorded measurement, not a CI gate.** §17.7 puts performance **outside** the cutover gate, so a CI gate would block a release on something nobody agreed blocks it. And a CI check needs a stable measurement environment and a number to fail on, neither of which exists until the port does.

**Recording nothing is the worse option:** the 6–25x arrives by construction, and a spec that does not say it out loud turns a known cost into a post-cutover discovery.

- [ ] **Step 2: Three numbers per route, and INP rather than LCP**

Compressed transfer (HTML **plus the RSC flight payload**), compressed JS executed on first load, and one field metric. **INP** is the right one because the change is hydration-shaped, not render-shaped: the page arrives as static HTML either way so LCP barely moves, while 81 demos hydrating on load is precisely an INP/TBT story.

- [ ] **Step 3: Five reference routes**

| Route | Why |
|---|---|
| `/docs/components/button` | the Shiki worst case |
| one `/blocks/<group>/<category>` | the client-heaviest |
| `/` | hand-tuned |
| one guide page | the light case |
| **`/docs/components/chart`** | the only docs page that pulls recharts to the client — the worst case for the demo-hydration question §7.1 defers; already today's heaviest docs HTML at 24.8 KB gzip |

- [ ] **Step 4: Record both baselines, in different roles**

The Astro table (§18.1: `/` 19.9/6.8, `/docs` 19.0/12.5, `/docs/installation` 21.6/12.5, `/docs/components/button` 23.7/15.0, `/docs/components/chart` 24.8/15.0, `/blocks/marketing/hero` 21.6/28.5 KB gzip HTML/JS) goes in as **context, not as a target**: against a **173 KB floor** a relative budget is red on day one and teaches nothing.

The port's floor was measured directly: a hello-world App Router build is **566 KB raw / 173 KB gzip across 7 chunks, all executed**. **So every route's JS regresses 6–25x by construction, before a line of our own code.**

**The budget itself is absolute**, derived from the port's own first measurement. The Astro table's job is to answer *"what was traded for what"*.

Measure with `gzip -9` against CDN-gzip so the comparison is like for like; note that Vercel serves brotli, which takes roughly 15% off both sides.

- [ ] **Step 5: Reopen §7.1 only on evidence**

**§7.1 is not reopened preemptively.** The cost of reopening is *larger* than it looks: in Astro `client:visible` defers hydration only while the bytes ship either way, whereas Next's `next/dynamic` also splits the chunk, so scroll-gating would move payload **and** main-thread time. The correct behaviour is to measure `/docs/components/chart` and `/docs/components/button` and reopen **only if the measured INP on the fixed device profile is bad**.

- [ ] **Step 6: Build time**

```bash
/usr/bin/time -p pnpm --filter @sevenui/web build
```

Compare against Stage 0's recorded `blume build` numbers on the **same machine**. The Next build may be slower; **a >3x regression is a signal the shape is wrong, not a failing gate** — and the first thing to check is §4.4's binding rule: highlight each unique source once and memoize it for the whole build.

- [ ] **Step 7: Write the numbers into the spec and commit**

```bash
git add docs/superpowers/specs/2026-09-18-blume-to-nextjs-migration-design.md
git commit -m "docs(migration): record the measured performance and build-time numbers

The 6-25x JS regression arrives by construction and was accepted knowingly;
these measurements become the baseline for subsequent work."
```

### Task 11.4: What the gate does not measure — state it

- [ ] **Step 1: Copy §17.7's exclusions into the final record**

A gate is only honest when it says what it does not measure:

- **Performance** — a recorded measurement, not a gate.
- Font rendering and antialiasing.
- Px-level spacing on docs pages (the sampled pixel-near routes are the exception).
- OG image pixel identity — impossible anyway (Takumi vs Satori).
- Anything behind Clerk beyond "`/account` loads and lists licenses".
- The pro deployment's own pages — only that the rewrites still resolve.
- **Runtime unit tests of `apps/web`'s own logic.** There are none and none are added (§21).

- [ ] **Step 2: Copy §21's three remaining blind spots into the record too**

1. **Nothing anywhere executes §10.2's stale-serve path.** CI is hermetic on the fixture and the live signal is a scheduled canary that watches the manifest, not the behaviour. Stale-serve is **Next's Data Cache semantics, not our code**, so it is not unit-testable in any case. What *would* be testable is `parseManifest` — a pure function with **11 distinct throw sites** whose real failure mode is a validation that *silently passes* a malformed manifest.
2. **§9's matcher and index are invisible by construction** — the 113 KiB index is on none of the four inventoried surfaces, the palette renders on no route, and there is no old side to diff against.
3. **§17's own extractors are new untested code** whose worst failure is a vacuous pass (mitigated by Task 1.10's four assertions, re-run in Task 11.1).

Anyone picking the runtime-harness question up later starts from `.scratch/blume-to-nextjs/issues/20-runtime-test-harness.md`.

### Task 11.5: The cutover checklist — the things that are not code (§22)

**HUMAN IN THE LOOP. Nothing in this task is automated.**

| # | Item | Action | Verified by |
|---|---|---|---|
| 1 | **Pre-cutover commits** | The three in §20.3 must **already be on `main`** | `git log origin/main --oneline` shows Stage 0's commits below the merge base |
| 2 | **Vercel framework preset** | Auto-detected; flips Astro → Next.js at merge. **Root directory stays `apps/web`** | Task 1.0's verdict; if the P1 fallback was taken, flip the primary project's preset **at merge time** and delete the second project |
| 3 | **Env var** | `PUBLIC_CLERK_PUBLISHABLE_KEY` → **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** in the Vercel project (all three environments) and in `.env.example` | `/account` signs in on the production deploy. **A missing value is silent** |
| 4 | **`ci.yml`** | `PRO_MANIFEST_URL=lib/pro-manifest.fixture.json` on the build step | Stage 5 Task 5.5 — already committed; confirm it is on the merged tree |
| 5 | **New workflow** | Scheduled manifest canary | Stage 5 Task 5.6 — confirm one scheduled run has succeeded before merge |
| 6 | **`vercel.json`** | **No change.** Five rewrite rules, unchanged | `git diff main -- apps/web/vercel.json` is empty |
| 7 | **§20.1 bridge** | The `blume-theme` mirror ships and its removal condition is in the PR body | Stage 10 Task 10.5 Step 5 |

- [ ] **Step 1: Walk the table and tick every row before opening the PR.**

- [ ] **Step 2: HUMAN GATE — open the PR**

One PR, squash-merged, targeting `main`. The body carries: the goal in one paragraph, a link to the spec and the ADR, **the full §17.6 table with a per-row verified/not-applicable mark**, the performance numbers, the §17.7 exclusions, and the §20.1 bridge's removal condition. **No attribution trailers.**

- [ ] **Step 3: HUMAN GATE — merge**

`main` receives **one** merge. Wait for the production deploy.

### Task 11.6: POST-MERGE — prove the thing the migration exists for

- [ ] **Step 1: Re-run the gates against production**

The negative-path list, the registry-JSON byte check, the agent-fixture diffs, the OG sweep, and the extractor over a sample of each surface. Anything that passed on the preview and fails here is a deployment-configuration problem, not a code one — start with the env var and the framework preset.

- [ ] **Step 2: The one thing the cutover must prove, beyond parity**

**A category added to the pro manifest appears on the site without a rebuild.** That is the entire reason this migration exists (§17.1, §22).

This needs a real manifest change, which is a pro-repo action:

1. Record `/blocks`'s current category set and the current production deployment ID.
2. Have the pro repo publish a new category (or, if none is pending, a temporary one).
3. **Without dispatching `trigger-web-rebuild.yml` and without any web deploy**, wait past 300 s and reload `/blocks` and `/blocks/<group>`: the new category must appear in the listings.
4. Follow the listing's link to `/blocks/<group>/<new>` — it must render (via `dynamicParams`), not 404.
5. Confirm the production deployment ID is **unchanged** throughout. That is the proof.

Record the timestamps and the deployment ID in `.scratch/blume-to-nextjs/verification/stage-11.md`.

- [ ] **Step 3: Sign off the temporary bridge**

Open a note (wherever this project tracks follow-ups) naming §20.1's condition verbatim: **delete the `blume-theme` mirror write once the pro repo reads `theme`.** Nothing automated can observe this.

- [ ] **Step 4: Note the deferred follow-ups, without opening work**

From §19, each deliberately **not** done and each a separate future effort: Geist for the site (§11.2), the theme dock on `/components` and docs (§8.4), on-demand `revalidateTag` for the manifest (§10.5), a runtime test harness for `apps/web` (§21), the pro repo reading `theme` and `/r/theme.json` gaining `registryDependencies` for pro blocks (§8.6), and the post-cutover 404 niceties (§11.7). **`robots.txt`'s `Content-Signal` stance gets no follow-up at all** — it is settled, not deferred.

### Stage 11 — Definition of done

- The inventory is generated (not transcribed) and its arithmetic is recorded.
- The extractor passes its anti-vacuity assertions on **both** sides, then the text/DOM diff over every HTML route maps **entirely** into §17.6's 28 rows.
- The heading-anchor-ID diff is **empty**.
- All six negative paths return 404.
- Registry JSON is byte-identical to `main`'s.
- Agent fixtures and the OG sweep pass with only declared diffs.
- The performance table and the build-time comparison are written into the spec.
- Every row of §22's cutover checklist is ticked.
- `main` has exactly one merge from this branch.
- Post-merge: a new pro category reaches the site with **no web deploy**.

### Stage 11 — §17.6 rows expected here

**All 28, as a final reconciliation** — each marked verified in the stage where it landed, and re-confirmed on production. No new rows.

### Stage 11 — Proof obligations

None outstanding. Reconcile all seven (six plus the discharged #4) in the record, each with its verdict and, where a fallback was taken, the spec edit that recorded it.

### Stage 11 — Record

`.scratch/blume-to-nextjs/verification/stage-11.md`: the inventory arithmetic, the full route → diff → §17.6-row triage table, the anchor-ID result, the six negative paths, the registry hash comparison, the fixture and OG results, the performance table, the cutover checklist with ticks, the post-merge ISR proof with its deployment ID, and the §20.1 bridge note.

---

## Whole-plan definition of done

1. `main` carries Stage 0's three pre-ship commits **and** exactly one merge from `feat/blume-to-nextjs`.
2. `sevenui.dev` runs Next.js 16.3.5; every URL in §2's frozen-contract table resolves as it did.
3. `/r/*.json`, `/r/demo/*.json`, `/r/component/*.json` — 247 files — are **byte-identical** to what `main` served before the merge.
4. Every observed difference is one of §17.6's **28** rows. None is unexplained.
5. All six outstanding §20.2 proof obligations are discharged, with any fallback recorded in the spec rather than improvised.
6. Every row of §14.7's retired-input inventory is asserted gone, with the single named exception of the `blume-theme` mirror.
7. The performance numbers and the build-time comparison are in the spec as a measurement, not as a gate.
8. A category added to the pro manifest appears on the site **without a rebuild** — the capability the whole migration was for.

---

## Notes for whoever executes this

- **Read the spec section a task names before writing the code.** This plan is the order and the done-criteria; the spec is the reasoning, and it settles arguments this plan does not repeat.
- **A fallback is a recorded decision, not an improvisation.** Each of the eight branch points in Ledgers 2 names exactly one fallback. Taking it means editing the spec to say so.
- **Never fix forward past a gate failure.** If a diff appears that maps to no §17.6 row, stop and find the cause. The whole value of the staged shape is that a regression's blast radius is one stage.
- **The human holds five gates:** pushing, the Vercel dashboard, the PR, the merge, and stopping a dev server. Ask; do not assume.
