# Map: Blume to Next.js

Label: wayfinder:map

## Destination

A locked design spec at `docs/superpowers/specs/2026-09-18-blume-to-nextjs-migration-design.md`,
plus an ADR recording why Next.js replaces Astro/Blume — with every migration
decision settled, so an implementation plan can be written afterwards without
reopening a choice.

The migration itself and its implementation plan are separate efforts. This map
ends when the spec is locked.

## Notes

**Domain.** `apps/web` only. Today it is a Blume 1.5.3 site (Astro-based docs
meta-framework, locally patched). Authored surface: 40 `.astro` files (6,238
lines), 68 `.mdx` docs, 4 `.tsx`, 9 `.ts`, plus `blume.config.ts`,
`components.ts`, `theme.css`.

**Why this effort exists.** `/blocks` is generated from the pro deployment's
manifest at build time (`apps/web/lib/pro-manifest.ts`), so a new pro block
reaches the site only when someone manually dispatches
`trigger-web-rebuild.yml` in the pro repo and waits for a full web rebuild.
ISR removes that step. Astro cannot; Next.js can. That is the whole
justification — no other staleness exists on the site.

**Skills every session should consult.** `mattpocock-skills:grilling` and
`mattpocock-skills:domain-modeling` by default. `mattpocock-skills:research`
for `research` tickets. `impeccable` or `frontend-design:frontend-design` when
a ticket touches visual parity.

**Settled framing (from the charting session — not tickets, do not reopen).**

- Destination is a spec, not the migration. Plan-writing is a separate effort.
- Next.js, App Router, on Vercel. Static output (`output: 'export'`) is out —
  ISR requires it.
- Scope is `apps/web` only. `packages/registry` and `packages/presets` are
  untouched; the pro repo and deployment are untouched.
- Every published URL is frozen: `/docs/*` (base path stays), `/components`,
  `/blocks/*`, `/pro`, `/account`, legal pages, `/r/*.json` (+ `/r/demo/*`,
  `/r/component/*`), and the root agent/SEO endpoints (`/llms.txt`,
  `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`, per-page `.md`).
- `/r/*.json` is produced by `shadcn build` and is framework-independent; it
  must come out byte-identical. This is a verification gate, not work.
- ISR covers the pro manifest only: `/blocks`, `/blocks/[group]`,
  `/blocks/[group]/[category]`. `revalidate: 300`. On a failed manifest fetch,
  serve the stale page. Everything else stays static.
- Docs pipeline is hand-rolled. No Fumadocs, no Nextra — the point of leaving
  Blume is not to re-enter someone else's meta-framework.
- The 137 docs demos render **inline**, not in iframes. Reason: an iframe is
  its own document, so a Dialog/Sheet/Drawer/Command overlay opened inside a
  demo is clipped to the frame instead of covering the viewport. Dropping the
  iframe fixes a real defect in the current site.
- `/blocks` previews stay iframes — license-gated pages served from
  `pro.sevenui.dev` via `vercel.json` rewrites. **Corrected by
  `07-theme-mechanism-and-token-ownership`:** the rewrite makes them
  *same-origin*, and there is no postMessage theming contract — `apps/web`
  contains zero `postMessage` calls. Theming crosses the iframe boundary over
  shared `localStorage` plus the native `storage` event. That contract is
  preserved; see `07` for the key rename and its bridge.
- Search is rebuilt on SevenUI's own `command` primitive. Blume's Orama dialog
  is not reproduced; `theme.css` already fights it with `!important` to reach a
  single-column palette, which is what the replacement should just be.
- Ask AI is not reproduced — `blume.config.ts` has no `ai.ask` block, so it is
  already off in production. i18n is not reproduced — no locales are
  configured.
- Parity bar: behaviour + layout parity. Information architecture, routes,
  interactions and overall visual layout must match; a few px of drift, font
  rendering differences and spacing rounding are acceptable. The landing page
  (`/`) and `/blocks` are held closer to pixel parity — both were hand-tuned in
  dedicated efforts. Deliberate fixes (the iframe overlay defect; the
  unserialized `<InstallCommand>` in agent Markdown) are exceptions recorded in
  the spec.
- No redesign. One cutover changing both framework and design would make
  regressions unattributable.
- Cutover: a single production deploy. The migration is built in stages on a
  long-lived branch, each stage verified on its Vercel preview URL; `main`
  receives one merge at the end. Removing Blume and flipping the domain is the
  last stage. Preview deployments inherit the `vercel.json` rewrites, so
  `/blocks` and the pro iframes verify against the live pro deployment — no pro
  staging needed.

## Decisions so far

<!-- one line per resolved ticket: gist + link -->

- [Next.js MDX pipeline options](issues/01-nextjs-mdx-pipeline-options.md): the
  authored custom-MDX surface is **2 components, not ~40**; Next 16.3.5 defaults
  to Turbopack, whose loader options must be plain data (killing
  function-valued rehype/Shiki options, with a local-wrapper escape hatch);
  `next-mdx-remote` and `contentlayer` are dead, `next-mdx-remote-client` and
  `content-collections` alive; six option shapes documented. Its slug-drift
  finding was **refuted** by `02` — see that ticket.
- [OG image parity](issues/11-og-image-parity.md): `/og/<route>.png`, one
  1200x630 light-only design for every page type with hard-coded colors and
  Geist (while pages render Inter); `opengraph-image.tsx` **cannot** reproduce
  the frozen URLs — a catch-all route handler is the only shape; pixel-exact
  parity impossible (Takumi vs Satori); found a production bug — the 16 block
  pages declare a 404 `og:image`.
- [Code highlighting parity](issues/05-code-highlighting-parity.md):
  `github-light`/`github-dark` on Shiki 4.4.3, dual-theme CSS variables selected
  by `:root[data-theme="dark"]` with **no `prefers-color-scheme` rules at all**;
  exactly 4 languages and **no fence meta anywhere**, so 7 of 8 transformers are
  moot; `blume-source` is obsolete (its height came from the iframe); the copy
  button is client-injected and `copy-command.tsx` does not cover it; payload,
  not CPU, is the constraint — 2.0 MiB of dual-theme HTML, 33% of a live page.
- [Docs content pipeline decision](issues/02-docs-content-pipeline-decision.md):
  catch-all `app/docs/[[...slug]]/page.tsx` + dynamic import, **no `basePath`**;
  content index is a server-only `fs` + `vfile-matter` module, **no codegen**,
  typed with zod and failing the build on bad frontmatter; chain is
  `remark-frontmatter → remark-gfm` / `rehype-slug → rehype-autolink-headings →
  @shikijs/rehype → rehype-external-links`, every option plain data;
  prev/next from the nav tree, TOC from the index's text scan (h2+h3);
  **refuted `01`'s slug-drift requirement** — Blume uses `github-slugger` too,
  so `rehype-slug` matches by construction (verified live).
- [Parity proof method](issues/13-parity-proof-method.md): surface is 101 HTML
  routes + 74 text endpoints + ~85 OG images + 247 JSON files;
  **`sitemap.xml` is not a sufficient inventory** (omits 16 live `/blocks`
  routes); inventory is generated, never frozen; automated text/DOM + anchor-ID
  diff on all routes, human review sampled 3-5 per surface, screenshot diffing
  rejected; registry JSON byte-identical, agent endpoints gated by fixtures plus
  a declared intended-diff list (5 known entries).
- [Theme mechanism and token ownership](issues/07-theme-mechanism-and-token-ownership.md):
  `data-theme` frozen, but the storage key is renamed `blume-theme` -> `theme`
  with its vocabulary frozen to `"light"|"dark"|absent` — and **the key is a
  cross-repo contract**, not a preference: the pro previews are same-origin via
  the `/previews/*` rewrite and sync over the native `storage` event (the
  question's "postMessage" premise is wrong — `apps/web` has zero
  `postMessage`), so a temporary mirror write into `blume-theme` bridges the
  cutover. `next-themes` configured to that contract; live OS following added,
  `astro:after-swap` dropped, transition suppression kept. One
  `app/globals.css`; `@custom-variant dark` and `color-scheme` must move too —
  they live in Blume's generated entry, not `theme.css`, and omitting the
  variant kills dark mode **silently**. Inline demos get a selector-scoped
  preset applier built from the already-exported `resolvePreset()` (docs +
  `/components`, never chrome); the registry theme guard is extended to
  `globals.css`. Evaluated `--success`/`--warning` as a suspected bug: **not
  one** — both are in the published `theme` item and shadcn maps every color
  `cssVars` key into `@theme inline`. Found instead: no registry item declares
  a `theme.json` dependency, so pro blocks using `text-success` can install
  into a project with the var undefined (pro repo's fix).
- [Sidebar and nav source of truth](issues/03-sidebar-and-nav-source-of-truth.md):
  hybrid — `lib/docs/nav.ts` declares the skeleton, the Primitives set is derived
  from the content index and **slug-sorted** (today's config order is exactly
  that; filename sort is wrong in 5 places, title sort is identical for all 65);
  the sidebar is a **client component in the layout** because App Router cannot
  server-compute `aria-current` in a persistent layout, so group open state is
  controlled with a one-way force; groups carry no `href` so a label cannot
  become a URL; Blume's `page`-mode panel machinery is **unreachable code** and
  is not ported. Rename of `/components` -> `/primitives` was raised and
  **dropped** — corrected the map's reason (install commands do not depend on
  the docs route) and priced the real cost (`13`'s intended-diff list, not
  redirects). Found a landmine: **4 base-relative markdown links** in 3 files
  that Blume rewrites through `basePath` and `02`'s no-basePath decision leaves
  pointing into the gallery's occupied `/components/*` namespace.
- [MDX content component parity set](issues/04-mdx-content-component-parity-set.md):
  the authored surface is **exactly 2 components** (re-verified — the 15 extra
  tags a fence-only scan reports all sit inside inline code spans), plus
  `CodeBlock` as the primitive both render through; the prose layer is
  **hand-written element overrides, no `@tailwindcss/typography`**, because the
  corpus needs exactly **9 elements** and never uses 13 others (no `h1`, `h4`-`h6`,
  ordered lists, blockquote, `hr`, images, `em`); values match Blume's rendered
  output, which is a **merge of plugin defaults and Blume's overrides** — read
  from computed styles, not from its CSS file. `<InstallCommand>` **gains a
  package-manager bar** (deliberate: the `pnpm` preference is honoured on 1 of 3
  install surfaces today), embedded as 4 highlighted commands selected by
  `<html data-pm>` — one uniform intended diff across 67 pages, not 67 different
  ones. **Nothing is added**: `TypeTable`, `AutoTypeTable`, `GithubInfo` and
  `Diff` were each raised and dropped — `AutoTypeTable` provably **cannot work**
  here (59 of 65 registry components have no named props type). Element map is
  closed and asserted on `02`'s existing text scan.

- [Inline demo rendering contract](issues/06-inline-demo-rendering-contract.md):
  the inline preview **already ships** — `/components` renders registry
  components in-document with a `min-h-72` pane (288px, Blume's own
  `MIN_PANE_PX`), and the docs demos adopt that component; an RSC resolves the
  frozen `path` by dynamic template import (no codegen, generated map as the
  named fallback) and reads the Code tab's source with `fs`; **no forced client
  boundary** — 56 demos ship zero JS, `client:visible` is not reproduced.
  Isolation is four rules, and "never inside `.prose`" is not among them since
  `04` deleted `.prose`: no inheritable typography on any ancestor, the
  `[data-blume-example]` grid rule carried over, a container-level root reset
  (the frame's `body` rule under a new selector), and **no bare `h1`-`h6` in
  `globals.css`** — Blume styles headings globally and 4 demos render raw ones.
  The shared pane height, the postMessage protocol and the `rafThrottle`
  listener are all **retired**. Found two deliberate fixes, not one: the 42rem
  column means the iframe **lies about breakpoints** (`md:`/`lg:` false in
  every frame), so 26 of 137 demos change at `md` and above. Nothing needs a
  frame — every overlay portals to `document.body`, so `contain: layout paint`
  is safe, and `sidebar-demo` (the registry's only viewport-reading, `fixed`
  primitive) takes it as an opt-in flag.

- [Search palette and its index](issues/08-search-palette-and-its-index.md):
  full-text matching **measurably does not work** on this corpus — 65 of 68
  pages are one skeleton, so `installation` matches 67/68 and `props` 47/68.
  So the index gains **heading-level entries**: 382 entries = 68 pages + 314
  headings, after excluding the three boilerplate headings that account for 195
  of 509 occurrences; a heading result deep-links to `route#slug`, which cannot
  drift because the slug comes from `02`'s `github-slugger` pass. Static JSON
  fetched on first open, 113 KiB raw / **30 KiB gzipped** (5 KiB if body text
  were dropped — measured, not taken). The matcher is **ours**: `command`'s
  `Autocomplete.Root` accepts `filteredItems`, so a hand-written weighted
  ladder ranks and Base UI keeps combobox roles, highlight and keyboard. Base
  UI's own filter could not do it — collator substring, boolean, no score.
  Scope stays docs-only (the gallery and `/blocks` are not searchable today,
  and `/blocks` is ISR so a build-time index of it is stale by construction).
  `⌘K` toggle and `/` preserved; **`⌘J` dropped** — it toggles a preview pane
  this site already hides with `!important`. Found: the six `search.popular`
  routes are base-less and `/components/button` unprefixed lands on a real but
  wrong gallery page; and ~60 lines of `innerHTML` sanitizing have **no
  successor** in React.

- [ISR shape and manifest failure semantics](issues/09-isr-shape-and-manifest-failure-semantics.md):
  `fetch` with `next: { revalidate: 300, tags: ['pro-manifest'] }` plus a
  segment `revalidate` — the Data Cache is URL-keyed, so one entry serves all
  three routes *and* `generateStaticParams`, preserving today's single-fetch
  module singleton; `"use cache"` rejected because Next 16 gates it behind
  `cacheComponents`, which changes rendering app-wide. **Stale-serve needs no
  code**: the existing throw-everything loader already means "build fails cold,
  last good page survives revalidation". A shape violation is treated exactly
  like a non-200 — it *cannot* be made louder at the route level, so louder
  means an alert, not different page behaviour. The "no manual rebuild" promise
  runs through a non-obvious chain: `generateStaticParams` **does not re-run on
  revalidation**, so a new category appears only because the revalidated
  listings link to it and `dynamicParams` renders it on demand — which forces
  today's `groups.find(...)!` to become `notFound()`, or an arbitrary path 500s
  instead of 404ing. CI goes hermetic on the fixture and the signal it gives up
  moves to a **scheduled manifest canary**, which also closes stale-serve's
  silence. Live manifest is 3 groups / 14 categories / 65 items = **18 routes**,
  two more than `13` recorded.

- [Clerk integration approach](issues/10-clerk-integration-approach.md):
  `@clerk/clerk-js` stays **client-only** — no `@clerk/nextjs`, no
  `middleware.ts`, because `/account` is 1 authenticated page out of 101 and
  `clerkMiddleware()` would sit in front of ISR, `/r/*.json` and the agent
  endpoints to serve it. What that declines is named: the CDN build the Next
  package loads *does* ship UI components, so `<SignIn/>` could mount inline —
  but the hosted redirect is a deliberate pro-session decision and `/account`'s
  signed-out state is designed around it. The laziness is **two** mechanisms,
  both preserved: the dynamic import *and* a `__client_uat` cookie gate that
  keeps the measured **1.46 MiB** off every anonymous request. Rewrites stay in
  `vercel.json` as their single owner — the trailing-slash pair is a debugged
  platform fact (`:path*` does not match a trailing slash) and all five targets
  are external, so `next.config` gains nothing and splitting them is the trap.
  `/account` stays a static shell filled client-side: a server fetch of
  `/api/me/licenses` would need `auth()`, which is the package we just declined.
  Found: **`/pro` loads the full 1.46 MiB for every anonymous visitor** — it has
  the dynamic import but not the cookie gate. Only env var on the site,
  `PUBLIC_CLERK_PUBLISHABLE_KEY` -> `NEXT_PUBLIC_*`.

- [Chrome port: client and server boundaries](issues/12-chrome-port-client-and-server-boundaries.md):
  one root shell + three nested layouts, and **all three sidebars follow `03`** —
  client components in persistent layouts, because `aria-current` cannot be
  server-computed there. The header is **one** client component (five tabs; the
  search dialog a dynamic import) and the drawer's measured `--blume-drawer-top`
  dies with the banner, which is **dead code today**. `block-frame.astro` becomes
  a server card plus one client `BlockPreview` per card, keeping the
  concurrency-3 loader as a context (the cap is the feature) and replacing the
  bespoke tooltip singleton with the registry's own `Tooltip`. The
  package-manager preference becomes a site-wide `data-pm` contract applied in
  the root layout — CSS-selected, not effect-driven — so all **three** install
  surfaces agree. Fonts are today's Inter + IBM Plex Mono on `next/font`;
  **Geist was deferred, not rejected** (attributability, plus re-tuned heading
  tracking and 2.0 MiB of mono-metric Shiki output). Swept the global base layer
  once instead of one rule per ticket: **13** unowned `@theme inline` entries
  (not five — `--font-sans`/`--font-mono` among them; five others have zero
  consumers and die) and seven `@layer base` rules. Found: the global focus ring
  is near-black, **not** the brand blue `theme.css` claims; `/account` loads
  1.46 MiB for anonymous visitors and shows them only a skeleton, fixed by
  server-rendering the signed-out state behind the `__client_uat` gate.

- [Blume-shaped workarounds to retire](issues/14-blume-shaped-workarounds-to-retire.md):
  `publicHoistPattern` goes, and the repo already contains the control case —
  `cn` is imported directly by 65 registry files, is **not** hoisted, is
  unreachable from `apps/web` by any node_modules walk, and builds today, so only
  Node's runtime resolution from `dist/` ever needed the hoist; proof is a clean
  install plus a build naming five specific pages, not "the build passed". The
  Blume patch turns out to carry **two** hunks — the `rafThrottle` fix *and* a
  `PageLayout` header-override feature six pages depend on — and both still die
  because the port's layouts are its own. Every `blume.config.ts` resident now has
  a named home (a 13-row table), with `title`/`description`/`site`/`github`
  landing in one `lib/site.ts` that `11` and `15` read too. `@lucide/astro` →
  `lucide-react` **verified**, not assumed (same 1.41.0 icon set, the 3 live
  manifest keys resolve), with one rule attached: the `icons` record stays
  server-only. Both CI scripts survive untouched — neither reads `dist/` or HTML —
  so the only edit is `07`'s `globals.css` extension. Found: `pnpm typecheck`
  checks **one file** in `apps/web` today, and the new tsconfig deliberately
  widens it rather than preserving the blind spot; `combination-mark.tsx` +
  `assets/` are dead code (so three `.tsx` port, not four); a production demo
  depends on a devDependency (`react-hook-form`), fixed by an approved one-line
  exception to the registry scope rule; `/blume-assets/*` 404s live and is not
  reproduced.

- [Agent-facing and SEO surface](issues/15-agent-facing-and-seo-surface.md): three
  premises corrected — the `.md` 404 "asymmetry" is one expression
  (`route === "/" ? "index" : route.slice(1)`, so `/docs.md` 200s and there is
  nothing to normalize), `/index.md` **is `llms.txt` byte for byte**, and
  `<InstallCommand>` reaching agents raw is **our** gap, not Blume's — its
  `ai.markdownComponents` extension point was never used. Found three live
  surfaces the ticket didn't know about: 69 `.mdx` endpoints (**dropped** —
  nothing links them and `.md` is a superset), `/agent-readability.json`
  (reproduced, but its `generator` and its **already-false** universal
  `{route}.md` pattern are corrected), and the docs **page-actions rail**
  (ported whole — 4 items, 6 chat providers; `17` doesn't own it). Everything
  else reproduced: `robots.txt` verbatim and **permanently** (no follow-up),
  `llms-full.txt` whole at 296 KB / 59% fenced demo source, `.md` keeps front
  matter while `llms-full.txt` keeps stripping it. `llms.txt` and `sitemap.xml`
  both learn the blocks surface off `09`'s Data Cache entry (+29 lines, +17
  routes, `revalidate: 300` — now a **site-wide ceiling**), and sitemap parity
  becomes URL-set equality, not byte identity. Two audits: `<InstallCommand>`
  serializes to all four package-manager commands on 68 pages, and **all 85
  titles** — 68 ASCII hyphen, 16 em dash, 1 bare — collapse to one rule
  (`<page> — SevenUI`, landing exempt), which lands in two places on purpose: the
  10 offending gallery titles ship to `main` **before** the cutover so they never
  enter `13`'s diff, the 68 re-separated ones can't. JSON-LD resolved the other
  way — `headline` goes **bare everywhere**, matching every `<h1>`. WebMCP not
  ported (2,709 B of dead JS per docs page for an API no browser ships).

## Not yet specified

- **No test harness in `apps/web`.** Zero test files and no `vitest` in its
  `package.json`; all 66 test files live in `packages/registry`.
  `13-parity-proof-method` settled how the cutover is verified (route diffing)
  and never touched unit testing, so nothing on the map owns this. Surfaced by
  `04-mdx-content-component-parity-set`, where it was one reason not to build a
  component with zero uses: the parity gate cannot see a component that renders
  on no route, and there is nothing else to exercise it. Whether the migrated
  app gets a harness at all, and what it would cover, is unspecified.
  Sharpened by `14-blume-shaped-workarounds-to-retire`: `apps/web` has no
  *typecheck* over its own sources either — `tsconfig.json` includes exactly one
  file (`blume.config.ts`), so the 4 `.tsx`, the 4 `lib/*.ts` and every `.astro`
  frontmatter are unchecked by `pnpm typecheck` today. `14` closes that half by
  taking Next's default `include` and clearing whatever it surfaces, which leaves
  this patch owning only the runtime-test question.

## Out of scope

- Changes to `packages/registry` or `packages/presets` — React sources packaged
  by `shadcn build`, blind to the site framework. Touching them only widens the
  migration. **One approved exception**, scoped to a single line: `react-hook-form`
  moves from `devDependencies` to `dependencies` in `packages/registry/package.json`,
  because `field-rhf` is a live demo that `06` renders inline on a production docs
  page. See
  [Blume-shaped workarounds to retire](issues/14-blume-shaped-workarounds-to-retire.md)
  decision 15; no other registry file is touched.
- The `sevenui-pro` repo and its deployment. Only the rewrite contract in
  `apps/web/vercel.json` is in scope, and only to keep it working.
- URL changes of any kind, including removing the `/docs` base path. 65
  primitive pages and SEO depend on them; this is a separate effort, after the
  migration. Reaffirmed by
  [Sidebar and nav source of truth](issues/03-sidebar-and-nav-source-of-truth.md)
  after the dev raised renaming `/components` -> `/primitives` and dropped it:
  the *install commands* clause above is **wrong** (`registry.json` references
  only `/r/*.json`, never a docs route), and redirects are cheap (three `:slug`
  wildcards). What makes a rename expensive is `13`'s parity gate — 65 renamed
  routes turn every canonical URL, `llms.txt` line, `.md` `Source:` line,
  sitemap entry and OG URL into an intended diff. No follow-up ticket; the
  segment does live in one named constant so a later effort is a one-line flip.
- UI redesign. The one exception is search, which is rebuilt on SevenUI's own
  `command` primitive because Blume's dialog cannot be carried over at all.
- Writing the implementation plan. Separate effort, after this spec is locked.
- Extending ISR beyond the pro manifest. The other four data sources on the site
  do not go stale.
- Moving the theme customizer dock onto `/components` and the docs pages. A
  pre-existing product gap, not migration parity: it changes the layout of 11
  gallery pages during a cutover whose whole point is that regressions stay
  attributable, and the dock's behaviour there (rail vs. the gallery sidebar,
  the mobile drawer) is its own design work. Settled by
  [Theme mechanism and token ownership](issues/07-theme-mechanism-and-token-ownership.md):
  the migration ships the scoped applier (forced by the iframe removal), the
  control stays on `/blocks`.
- Teaching the pro repo to read the renamed `theme` storage key, and giving pro
  blocks a `registryDependencies` entry on `/r/theme.json` so `text-success` /
  `bg-warning` resolve for consumers. Both are pro-repo changes; the web side
  covers the first with a temporary mirror write.
- Switching the site to Geist / Geist Mono. Raised while porting the chrome and
  deliberately deferred by
  [Chrome port: client and server boundaries](issues/12-chrome-port-client-and-server-boundaries.md):
  the change is ~3 lines against the single `--font-sans`/`--font-mono` seam that
  ticket creates, so cost is not the reason. Moving typography and framework in
  one deploy gives every drift on the hand-tuned `/` and `/blocks` two suspects,
  which is the one thing the sampled human review cannot adjudicate. A follow-up
  effort after the cutover; `16` is told not to "fix" the card/site font mismatch
  by pulling the OG card onto Inter.
- Agent-surface additions that are not live today. Declined by
  [Agent-facing and SEO surface](issues/15-agent-facing-and-seo-surface.md):
  the `x-markdown-tokens` response header (Blume's endpoint sets it; a static
  build drops it, so production has never sent it), `Accept: text/markdown`
  content negotiation (Blume ships the middleware, the static deployment does
  not run it), and `.md` mirrors for the 29 routes `llms.txt` newly lists — a
  gallery page is a live component grid and a block preview is a license-gated
  cross-origin iframe, so both would be newly invented content to maintain.
  Each is a post-cutover choice, not parity.
