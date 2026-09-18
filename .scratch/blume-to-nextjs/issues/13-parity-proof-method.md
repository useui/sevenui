# Parity proof method

Type: grilling
Status: resolved

## Question

One production cutover is settled, which makes the pre-cutover parity proof the
only thing standing between the migration and a user-visible regression. The
bar is settled (behaviour + layout parity; closer to pixel parity for `/` and
`/blocks`; deliberate exceptions recorded). The *method* is not, and it should
be settled early because it shapes how every stage is verified.

Settle:

1. **The route inventory.** What is the complete list of routes that must exist
   after the migration? It has to be derived, not typed from memory: 68 MDX
   pages, 11 `/components/*` pages, `/blocks` plus its group and category
   routes (from the pro manifest), `/`, `/pro`, `/account`, `/privacy`,
   `/terms`, 404, the agent/SEO endpoints, and the per-page `.md` for every
   docs route. `sitemap.xml` from production is one honest source. Is the
   inventory a checked-in file that the migration is tested against?
2. **How is a route compared?** Options, not exclusive: side-by-side in a
   browser at set breakpoints (the project has a browser-check workflow);
   automated DOM/text extraction from both builds and a diff; screenshot
   comparison; or hand review against a checklist. Each has a different cost and
   a different false-positive rate — font rendering alone makes naive
   screenshot diffing noisy.
3. **Which breakpoints and themes?** The site is responsive with a mobile nav
   drawer and has light/dark/system. The matrix of route x breakpoint x theme is
   large; what is the actual sample?
4. **The `/r/*.json` gate.** `shadcn build` output must be byte-identical. This
   is cheap and absolute: is it a script (`scripts/check-registry.mjs` already
   exists) run in CI on the migration branch, comparing against `main`'s
   output?
5. **The agent endpoints gate.** `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`,
   `/robots.txt` and the per-page `.md` are text. A diff against production is
   exact and nearly free — except where a deliberate fix changes it (the
   unserialized `<InstallCommand>`). How are intended diffs distinguished from
   regressions?
6. **Who verifies, and when?** Per stage on its preview URL, or accumulated to
   one sweep before cutover? (Framing says per stage; confirm and record what
   "verified" means as a recorded artifact.)
7. **What is explicitly not verified?** Naming the exclusions is what keeps the
   gate honest.

## Answer

Resolved 2026-09-18 with the dev. The derived inventory is
`.scratch/blume-to-nextjs/route-inventory.md`.

### The parity surface

**101 HTML routes, 74 text endpoints, ~85 OG images, 247 registry JSON files.**
Derived from production, not from memory. Breakdown and per-section sources in
the inventory file.

**`sitemap.xml` is not a sufficient inventory** and this is the headline
finding: it lists 85 URLs and omits the **16 live `/blocks` group and category
routes**, every agent-facing endpoint and every OG image. A gate built on the
sitemap would have declared parity with 16 published pages missing.

Two rules established by probe rather than assumption:

- Per-page Markdown is `<route>.md`, **only** for MDX content pages.
  `/docs.md`, `/docs/installation.md`, `/docs/components/button.md` → 200;
  `/docs/index.md` → 404, so the rule is not `<route>/index.md`; custom `.astro`
  pages produce nothing (`/components.md`, `/blocks.md`, `/pro.md`,
  `/privacy.md` all 404). `/index.md` is the root's stand-in.
- OG images are `/og/<route>.png` (`/og/index.png` for `/`).

### 1. The inventory is generated, never a frozen list

`scripts/route-inventory.mjs` derives it from the repo plus the live pro
manifest. The reason is the `/blocks` subtree: its 17 routes come from the
manifest, so any checked-in list rots the moment pro ships a category. The dev's
standing instruction is that a change in the pro repo must reflect on the site
and should be treated as automatic even while the manifest file there is still
updated by hand — which is exactly the property the inventory has to preserve
rather than freeze.

This gives the gate a second job beyond "no route disappeared": after cutover,
a category added to the manifest must appear **without a rebuild**. That is the
user-visible promise of the whole migration, and it is verified here.
`09-isr-shape-and-manifest-failure-semantics` owns how.

### 2. Comparison method: automated text/DOM diff everywhere, human eyes on samples

Both sides are static HTML, which makes the bulk gate nearly free.

**Automated, all 101 routes.** Extract from each route's HTML: visible text,
heading hierarchy **with its anchor IDs**, and link targets. Diff old build
against new. Catches content loss, structural change, broken links and missing
sections — the real risk on the 68 docs pages. Blind to styling, deliberately.

**Heading anchor IDs are part of this diff and are a hard gate.** Anchors are
published deep links, so a drift is a contract break. Extract every heading ID
per docs route on both sides; the diff must be empty.

**Corrected 2026-09-19 by `02-docs-content-pipeline-decision`.** The reason
stated here was wrong. `01-nextjs-mdx-pipeline-options` reported that Blume
slugs with its own Unicode-class `slugify`; it does not. Blume's
`markdown/heading-anchors.ts` and its `extractHeadings` both use
**`github-slugger`**, the same library `rehype-slug` uses, so the IDs do **not**
drift by default — verified live (`...radiogroup--contextmenuradioitem`,
`examples`/`examples-1`). The gate stays: it is cheap and it catches an
accidental slugger swap. It is a smoke test, not a porting requirement.

**Screenshot diffing is explicitly rejected.** The agreed bar is behaviour +
layout parity, which accepts px drift and font-rendering differences.
A screenshot differ reports exactly those as failures, so it would manufacture
false positives against a bar we already set.

**Human review is sampled, not exhaustive** (the dev's call): 3-5 pages per
surface rather than every primitive, component and block.

### 3. The review set and matrix

Pixel-near set — the hand-tuned surfaces, full matrix:
`/`, `/blocks`, one `/blocks/<group>`, one `/blocks/<group>/<category>`.
3 widths x 2 themes = 24 views.

Sampled content set — 2 widths (390, 1440) x 2 themes:
`/docs` and `/docs/installation` (guides); **4 `/docs/components/*` chosen to
cover distinct demo shapes** — a plain one (button), an **overlay** one
(dialog), a third-party wrapper (chart or carousel), a composite (sidebar or
field); `/components` plus 3 children; `/pro`, `/account`, one legal page, 404.
~15 routes, ~60 views.

Widths: **390** (mobile drawer), **768** (the drawer switch neighbourhood),
**1440** (desktop). The drawer's real breakpoint must be measured — 768 is a
guess and both sides of the actual switch have to be seen. Themes: light and
dark, with `system` spot-checked.

**Overlay check, mandatory on the 4 docs samples.** Open a Dialog, Sheet,
Drawer and Command palette inside a demo and confirm each covers the viewport.
This is the defect the iframe removal is meant to fix, so it is the one
behaviour that must be verified as *changed*, not preserved.

Per stage, only the routes that stage touched are reviewed, so the matrix
spreads across the migration instead of landing in one sitting.

### 4. Exact-diff gates, and how intended diffs are declared

**Registry JSON — absolute.** `shadcn build` output must be byte-identical
against `main`'s; any diff at all is a regression. `scripts/check-registry.mjs`
already exists and CI already runs it.

**Agent and SEO endpoints — fixture plus a declared-diff list.** Snapshot
production's text output (`/llms.txt`, `/llms-full.txt`, `/sitemap.xml`,
`/robots.txt`, the 68 `.md`) into the repo as fixtures at the start of the
migration, and diff against them. Every diff must be either empty or named in
an **intended diffs** list in the spec. Known entries already:

1. `<InstallCommand item="…" />` currently leaks into per-page `.md` as raw JSX
   instead of the install command — a defect, fixed, not preserved.
2. `sitemap.xml` currently omits the 16 `/blocks` group and category routes —
   fixed.
3. The 16 block pages currently declare a **404 `og:image`** (Blume's
   `customOgRoutes` skips `[param]` patterns while `PageLayout` emits the tag
   anyway) — incidentally fixed by generating cards for them. See
   `16-og-card-reproduce-or-redraw`.
4. Five absolute `https://sevenui.dev` markdown links (`docs/index.mdx` x2,
   `docs/installation.mdx` x3) become root-relative, so their `href` changes.
   Per `02-docs-content-pipeline-decision`: it removes the need for a
   function-valued `rehype-external-links` `test` under Turbopack, and absolute
   URLs to same-origin pages were a content defect.
5. The rendered-DOM class hooks `blume-heading-anchor` and `blume-table-scroll`
   are replaced by Tailwind utility classes — no `blume-*` names survive and no
   new bespoke names are coined. Per `02-docs-content-pipeline-decision`.

This list is what separates "we fixed a bug" from "we broke the output", and it
lives in one place.

### 5. What is recorded, and what is not verified

**Recorded:** one short checklist per stage at
`.scratch/blume-to-nextjs/verification/<stage>.md` — the automated gate results
(text/DOM diff, anchor IDs, registry JSON, agent fixtures) and the hand-reviewed
routes with a verdict. One line per gate, not a report.

**Explicitly outside the gate** — and this belongs in the spec, because a gate
is only honest when it says what it does not measure:

- Performance. The current output is static Astro HTML with almost no client JS;
  React chrome plus an RSC payload will not match it. Tracked as fog, not a
  cutover gate.
- Font rendering and antialiasing.
- Px-level spacing on docs pages (the sampled pixel-near routes are the
  exception).
- OG image pixel identity — impossible anyway (Takumi vs Satori), and the design
  question belongs to `16-og-card-reproduce-or-redraw`.
- Anything behind Clerk beyond "`/account` loads and lists licenses".
- The pro deployment's own pages — out of scope; only that the rewrites still
  resolve.
