# SevenUI — Blume to Next.js Migration Design

**Date:** 2026-09-19
**Status:** Locked — every migration decision is settled; the implementation plan is a separate effort
**Scope:** `apps/web` only
**Supersedes:** the Blume/Astro half of `2026-09-05-monorepo-migration-design.md`. That spec's workspace layout, package boundaries and registry byte-parity rules remain binding and are untouched here.
**Companion:** `docs/adr/0001-nextjs-replaces-astro-blume.md`
**Provenance:** 19 resolved decision tickets under `.scratch/blume-to-nextjs/issues/`. Where this spec compresses a decision, that ticket holds the reasoning and the measurements.

> `.scratch/` is **local to a working checkout** — git-ignored and deliberately not published. Every `.scratch/` path below records where the work was done; none of them is a link a reader of this repository can follow.
**Amended:** Stage 11, 2026-09-21, at the cutover gate — the widest of the stage amendments §17.6's closing paragraph records — Stage 8 had already reached §15.4 and §15.7 the same way — and like the earlier ones it changed no decision. §17.6 gained rows **#45** and **#46** (the first rows a gate in this plan caught rather than a reviewer) and edited **#5**, **#10**, **#18** and **#41**; §13.3's claim that the `#blume-content` rename "costs nothing at the gate" was corrected as a spec text defect; and a sweep re-dated the figures the pro manifest generates, across **§§2, 5, 10, 12, 14.4, 15.8, 16.6, 17.1, 17.2, 17.5, 19, 20.1, 20.3 and 21** — each now names its rule and carries a date, or cites the section that owns it. **The sweep's limit is declared with it:** it searched for sites stating a manifest set's *current* value, and a site stating a *wrong* one is invisible to that search — which is how #18 stood at 16 pages instead of 39 through two passes. §17.6's closing paragraph carries the table's own history; §2 carries a note of its own, because its preamble forbids the change its row records. **Stage 11.2, 2026-09-21**, then wrote the gate's own measurements in: nine rows (**#2/#3, #14, #18, #21, #23, #24, #39, #41**) gained the figure the gate produced, **#42 was corrected twice**, §15.8's title audit was corrected the way #18 was, §20.2 #5 was discharged **with a deviation**, and §17.4 gained the non-vacuity rule those measurements forced. It also wrote **#47**, ordered by a Stage 5 ruling and uncollected for five stages, corrected §20.2 #5 — *there is no `vercel.json` fix, and this document said there was* — and gave §20.2's five remaining obligations their verdicts. **Stage 11's browser matrix then added #48–#51 and corrected §6, §7.2(c), §7.2(d) and §8.3 entry 4, whose shared false premise had shipped a 16px docs `<h1>`. 51 rows.**

## 1. Summary

Replace Blume 1.5.3 (an Astro-based docs meta-framework, locally patched) with a hand-rolled Next.js 16.3.5 App Router site on Vercel. `packages/registry`, `packages/presets` and the `sevenui-pro` repo are untouched, with one approved one-line exception (§14.4). Every published URL is frozen. The migration is built in stages on a long-lived branch, each verified on its Vercel preview, and `main` receives **one** merge.

**The entire justification is ISR.** `/blocks` is generated at build time from the pro deployment's manifest (`apps/web/lib/pro-manifest.ts`), so a new pro block reaches the site only when someone manually dispatches `trigger-web-rebuild.yml` in the pro repo and waits for a full web rebuild. Astro cannot remove that step; Next.js can. No other staleness exists on the site, and no other benefit is claimed.

**This is not a redesign.** One cutover changing both framework and design would make every regression unattributable. Three exceptions are forced rather than chosen, and each is recorded where it lands: search (§9), `/docs/components` (§11.3), and the deliberate fixes listed in §17.6.

## 2. Frozen contracts

Nothing in this list may change during the migration.

| Contract | Value |
|---|---|
| Docs URLs | `/docs/*` — the base path stays; 68 MDX routes |
| Gallery | `/components` + 10 component pages |
| Blocks | `/blocks`, `/blocks/[group]`, `/blocks/[group]/[category]` — **the three URL shapes are the contract; the route set behind them is manifest-derived and grows.** 18 live routes when this table was written, **24 as of 2026-09-21** (`node scripts/route-inventory.mjs`). A category reaching the site without a rebuild is §10's mechanism and the whole reason this migration exists (§17.1), so the set growing is this contract being kept, not broken |
| Marketing / account / legal | `/`, `/pro`, `/account`, `/terms`, `/privacy` |
| Registry JSON | `/r/*.json`, `/r/demo/*.json`, `/r/component/*.json` — 247 files, **byte-identical** |
| Agent + SEO | `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`, per-page `/<route>.md` |
| OG cards | `/og/<pathname minus leading slash>.png`; `/` maps to `/og/index.png`; the `/docs` prefix sits *inside* the slug |
| Dark-mode signal | `<html data-theme="dark">` — attribute and values unchanged |

**One row in this table has been re-dated, and no contract in it has changed.** Stage 11 corrected `/blocks` from "18 live routes" to 24 (2026-09-21). What is frozen here is the three URL shapes; the route set behind them is manifest-derived, and growing it is §10's mechanism working rather than a contract breaking (§17.1). Nothing else in this table has been touched since it was locked.

`/r/*.json` is produced by `shadcn build` and is framework-independent. It is a verification gate, not work.

**The `/components` namespace is shared and stays that way.** The gallery occupies `/components/*` at the root while the primitives live at `/docs/components/*`. Renaming to `/primitives` was raised twice and dropped twice (§19).

## 3. Framework and runtime shape

Next.js **16.3.5**, App Router, deployed on Vercel. Turbopack has been the default bundler since 16.0.0, which constrains the content pipeline (§4.3).

`output: 'export'` is **out** — static export cannot do ISR, which is the point of the migration. Everything except the three blocks routes, `sitemap.xml`, `llms.txt` and the OG route is statically generated.

`next.config` gains `outputFileTracingRoot` naming the workspace root, because `@/*` resolves outside the app directory (§14.2). If the build ever falls back to webpack, `experimental.externalDir` is the escape hatch for the same reason; Turbopack needs neither.

**`basePath` is not used.** It would shift the entire site while only the docs section lives under `/docs`. `/docs` is a literal route segment — a folder. The consequences are tracked in §4.6, §9.6 and §11.7.

**Rewrites stay in `vercel.json`, which remains their single owner; `next.config` declares none.** All five targets are external (`pro.sevenui.dev`), so nothing needs to compose with Next's routing. More importantly the trailing-slash pair is a debugged platform fact, not a preference: `:path*` in a Vercel rewrite does not match a trailing slash, so `/previews/x/` 404'd while `/previews/x` worked, and the fix was a slashless iframe `src` plus an explicit second rule. Re-expressing that in Next's `rewrites()`, with its own path matching and its own `trailingSlash` interaction, reopens a solved bug. Preview deployments inherit `vercel.json`, which is what lets `/blocks` and the pro iframes verify against the live pro deployment with no pro staging environment.

## 4. Docs content pipeline

Hand-rolled. No Fumadocs, no Nextra — the point of leaving Blume is not to re-enter someone else's meta-framework.

**Corpus facts, measured.** 68 `.mdx` files. Frontmatter is exactly `title` + `description` on all 68, no other key anywhere. Tables in 57 of 68. Zero strikethrough, task lists, footnotes or HTML comments. Zero `# ` (h1) in any file. Exactly one duplicate heading text in the corpus (`toggle.mdx` → "Examples"). Zero headings containing a link.

### 4.1 Routing

One `app/docs/[[...slug]]/page.tsx` with `generateStaticParams`, loading content from `apps/web/docs/` by dynamic import. The authored content tree stays where it is.

Rejected: route-file MDX (would move 68 files into `app/`, cannot serve the `.md` endpoints from the same source, and forces shared layout data through per-file exports) and `next-mdx-remote-client/rsc` (its only advantage was `vfile.data.toc`, which §4.5 makes unnecessary).

### 4.2 Content index — no codegen

A server-only module under `lib/docs/` reading the filesystem with `vfile-matter` (~60 lines). Record shape: `{ route, title, description, headings[], sourcePath, raw }`.

Every consumer runs at build time on the server: page render, `generateStaticParams`, the nav tree, prev/next, the TOC, the search index, `sitemap.xml`, `llms.txt`, the `.md` endpoints and `lib/page-meta.ts`.

Typed with a `DocPage` type and a **zod** schema; missing or malformed frontmatter **fails the build**, as Blume's content collection schema does today. `description` feeds both `<meta>` and the OG card, so a silent empty string is a production regression. zod is taken as a dependency deliberately.

Rejected: a checked-in JSON (a drifting artifact plus watcher debt) and a content layer — `velite` is broken under Turbopack on a vendored Zod v3, `content-collections` routes MDX through `mdx-bundler` + `esbuild`, `contentlayer` is dead, and `next-mdx-remote` is archived with an open RSC-breaking bug on Next 15.2+.

**Vocabulary.** Three indexes exist and their names are kept apart: the **content index** (68 docs pages, this section), the **example index** (137 demos, §7), and the **search index** (382 entries, §9).

Dev-time: no watcher, no generate step. MDX bodies hot-reload through Turbopack HMR; the index is **memoized in production and re-read per request in dev** (reading 68 frontmatter blocks is a few ms). A new file is picked up because the catch-all matches any slug and the index re-reads; a deleted file 404s from the index.

### 4.3 The remark/rehype chain — locked

```
remark:  remark-frontmatter(['yaml'])  ->  remark-gfm
rehype:  rehype-slug  ->  rehype-autolink-headings(wrap)  ->  @shikijs/rehype  ->  rehype-external-links
```

`rehype-slug` must precede `rehype-autolink-headings` (it writes the `id` the anchor links to). Shiki emits no `<a>`, so its position is free. **Every option in this chain is plain data**, which satisfies Turbopack's constraint that loader options be JSON-serializable primitives, objects and arrays — the constraint that kills function-valued plugin options.

Element overrides are **not** in the chain; they are a plain object passed at render time. The TOC is **not** in the chain (§4.5). `remark-mdx-frontmatter` is not needed — `title`/`description` come from the index, and the chain's only frontmatter job is stripping it from the output.

**Heading anchors do not need a ported slug algorithm.** Blume's `heading-anchors.ts` and its `extractHeadings` both use **`github-slugger`**, the same library `rehype-slug` uses, so the IDs match by construction — verified live against three cases (`...radiogroup--contextmenuradioitem` preserves a double hyphen; `detached-triggers-createhandle`; `examples` / `examples-1`). The page title `<h1>` carries no `id` and does not advance the slugger. The anchor-ID diff stays in the gate (§17) as a cheap smoke test that catches an accidental slugger swap; it is not a porting requirement.

### 4.4 Syntax highlighting

`@shikijs/rehype` 4.4.3 in the chain, plain options: `themes: { light: 'github-light', dark: 'github-dark' }`, `defaultColor: false`. Dual-theme CSS variables (`--shiki-light` / `--shiki-dark`) selected by `:root[data-theme="dark"]`, with **no `prefers-color-scheme` rules at all** — matching today exactly.

**Two highlighter instances.** A highlighter instance is not JSON-serializable, so the loader cannot share the one used for demo sources, `<InstallCommand>` and the gallery cards. Both run the **4-grammar fine-grained bundle** (287 KB versus 11 MB for the full bundle; byte-identical output on all 214 real blocks). The languages are exactly `tsx`, `css`, `bash`, `json`, and there is **no fence meta anywhere** in the corpus — no titles, line numbers, ranges, `// [!code …]`, inline `{:ts}` or twoslash — so 7 of Blume's 8 transformers are moot and `rehype-pretty-code` buys nothing.

**One binding rule: highlight each unique source once and memoize it for the whole build.** The 137 demo sources recur across pages. Measured: 322 blocks / 207 KiB takes 740 ms with per-call `codeToHtml` versus 576 ms with a reused highlighter.

**Payload, not CPU, is the constraint.** Dual-theme output is ~2.0 MiB of HTML — 8.4x the source, +13% gzip over single-theme, and **33% of the live button page**. The App Router duplicates that into the RSC flight payload. This feeds §18.

**Declared fallback.** If `@shikijs/rehype` misbehaves under Turbopack, highlighting moves to an async RSC `pre`/`code` override. That collapses the two code paths and erases the five class-name differences, and the "no fence meta" finding makes it technically safe; it was rejected only because it moves highlighting from compile time to render time, losing Turbopack's per-file loader cache.

**`blume-source` is obsolete on arrival.** Its one job was making the `<pre>` a non-scrolling full-height flex column so the absolutely-pinned copy button never drifted — a height that came from the preview **iframe's** postMessage. Demos render inline now (§7), so the contract it served is gone.

**The copy button is client-injected today and has no server markup.** `copy-command.tsx` does **not** cover it — different UI (a `$ command` row), different timing, no live region, and used only by the landing page and the gallery cards. The port writes the code-block copy button as part of `CodeBlock`, reproducing today's behaviour: `absolute right-3 top-2` (`top-2.5` in tabs), 30px chip, lucide copy→check `scale-0` swap, 1500 ms hold that restarts on repeat, no flash on clipboard failure, `aria-label` swap, one shared `div[role="status"].sr-only`. The same component pretty-labels `data-language` (`tsx`→`TSX`) and puts `tabindex` on `<code>`, not `<pre>`.

### 4.5 Prev/next and the TOC

**Prev/next reads the nav tree** (§5), because that is what ships today and the file tree cannot express the "Primitives" group. Confirmed live: `/docs/theming` → next `/docs/components/accordion`.

**The TOC comes from the content index's text scan** of the raw MDX, not from compiled output: `vfile.data` is unreachable through `@next/mdx` (it is a loader — it stringifies and discards the VFile), the same scan already feeds search and link validation, and it keeps the TOC out of the RSC payload path. Depth is fixed at **h2 + h3**, as today. The scan is safe because no file contains an h1 and every heading is literal text — no `{frontmatter.title}` interpolation, no JSX-produced headings.

### 4.6 Internal and external links

**The external-link post-build pass dies in two halves.**

MDX links: `rehype-external-links` with plain options (`target: '_blank'`, `rel: ['noopener','noreferrer']`). This needs no function-valued `test` — which Turbopack would reject — because the 5 absolute `https://sevenui.dev` markdown links (`index.mdx` ×2, `installation.mdx` ×3) are rewritten root-relative. Those were a content defect anyway: absolute URLs to same-origin pages.

Non-MDX links: **5 anchors** carry the attributes literally in JSX (`site-footer` ×4, `privacy` ×1). This count was **9** until Stage 4: the landing page's own four were the same four URLs as the footer's, and Task 4.1 folded the landing's rail-framed footer and the plain one into a single component with two frames, so the four anchors are now written once instead of twice. **The rendered HTML is unchanged** — production's `/` carries five external anchors and so does ours — which is why this is bookkeeping and not a §17.6 row. Re-running a regex over built HTML to attach attributes to five known links buys nothing and would need its own post-build step. The header's GitHub link gains `noopener` alongside its existing `noreferrer`.

**A build-time link validator rejects any content link that does not resolve against the content index**, treating a base-relative link as an error rather than a warning — because the failure mode is a wrong page, not a missing one. See §11.7.

### 4.7 No `blume-*` class names, and no replacements

The two rendered-DOM hooks become inline Tailwind utilities. Both are expressible as plain data, so neither breaks the Turbopack constraint.

| Blume CSS today | Replacement |
|---|---|
| `.blume-heading-anchor` — inherit color/weight, no underline, `::after { content:"#" }` in `muted-foreground` at `.35em`, opacity 0→1 on hover/focus-visible over 150 ms | `text-inherit font-inherit no-underline after:content-['#'] after:ms-[0.35em] after:text-muted-foreground after:opacity-0 after:transition-opacity after:duration-150 hover:after:opacity-100 focus-visible:after:opacity-100` |
| `.blume-table-scroll` — `overflow-x:auto`, `margin:1.5rem 0`, 1px border, radius, `> table { margin:0 }`, `th { white-space:nowrap }`, `:is(th,td){ padding:.5rem .75rem }` | `my-6 overflow-x-auto rounded-lg border border-border [&>table]:m-0 [&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2` |

The `:is(th,td)` selector exists only to out-specify Blume Typography's `:where()`-scoped rules. With `.prose` gone (§6) that specificity war disappears, so this simplifies the CSS rather than carrying it over. The wrapper is produced by the `table` element override, not a rehype plugin.

## 5. Sidebar and navigation

**Hybrid: declare the shape, derive the set.** `lib/docs/nav.ts` declares the skeleton — `/docs`, `/docs/installation`, `/docs/theming`, then one group labelled `Primitives` whose children are every content-index route under `/docs/components/`. Labels come from the index's `title`. The 65-entry hand-maintained list dies; a new primitive reaches the sidebar by shipping its `.mdx` and nothing else.

**A build-time assertion requires every index route to appear in the nav exactly once.** Nothing checks this today, and Blume silently dumps an orphan page into `llms.txt`'s `## Other` section.

**Order is a slug sort, automatic.** Verified: today's config order is *exactly* slug-alphabetical and set-identical to the 65 files, so automatic ordering reproduces the live sidebar byte-for-byte. Two facts worth keeping: **filename sort is not slug sort** (`alert-dialog.mdx` sorts before `alert.mdx` because `-` < `.` — five pairs collide: `alert`, `button`, `input`, `message`, `toggle`), and title sort equals slug sort for all 65 today. The key is the **slug** anyway, because the slug is the frozen URL while `title` is content: editing a heading must not silently reorder 65 links.

If a hand-held order is ever wanted the extension is one line (an optional `order: string[]` prefix, slug-sorted tail). It is not built now.

**Labels can never become URLs, by type.** A link node is `{ label, href }`; a group node is `{ label, children }` and carries no `href` — except the one narrowing in §11.3, where the Primitives group gains an optional `href` whose value still comes only from the content index's `route`. No `slugify(label)`-shaped call exists anywhere. The label has exactly one legitimate output path: `llms.txt`'s `## Primitives` heading.

**All three sidebars are client components in their persistent layouts** — docs (65 links), `/components` (10), `/blocks` (**19 categories as of 2026-09-21**). The first two are repo-derived and move only when someone adds an MDX file or a gallery page, so they need no date; the third is the pro manifest's category count, so the rule binds and the number is dated — **§10 owns it** (14 when this section was written). App Router does not re-render a shared layout when navigating between its children, so `aria-current="page"` cannot be server-computed there; it needs `usePathname()`. The tree is still built on the server and handed down as serialized data (label + href per node); the content index and `fs` never reach the client. One rule for "chrome carrying an active marker" is worth more than three different ones. Rejected: rendering the sidebar from the page instead of the layout, which keeps it a server component but re-sends 65 links on every navigation and loses layout persistence.

**Group open state: controlled, one-way force.** `useState(activeInside)` plus an effect that forces the group open when the active page enters it and **never forces it closed**. Today's `<details open={active}>` is server-computed with zero persistence, but that is an artifact of every navigation being a document load. In a persistent layout an uncontrolled `defaultOpen` would be ignored after mount, so a user jumping from `/docs/theming` to `/docs/components/button` via the search palette would find the group **closed** — a real regression. Today's observable behaviour is reproduced exactly, and a manually-opened group now survives navigation. No `localStorage`: there is none today, and adding one would crowd §8's single-key contract.

**`site-tabs.ts` moves as data; one component renders both placements.** The array moves verbatim to `lib/site-tabs.ts` (already framework-free). `currentTabForRoute` is Blume's — the tabs' only logic dependency on it — and is reimplemented as a ~10-line longest-prefix helper beside the data. The `Primitives` tab's `href` stops being the hard-coded `/docs/components/accordion` and derives from the nav's first primitive child; hard-coding it is a latent bug the day a primitive sorts ahead of `accordion`.

**Blume's `page`-mode panel machinery is not ported.** `NavTree.astro` is half a drill-in panel stack: buttons, a back button, the `blume-nav` custom element, a 260 ms RTL-aware slide. Panels are created only for `display: "page"` groups and SevenUI declares one group, `display: "group"` — so **the entire mechanism is unreachable on this site today**. Nor is `collapsed: false`, also unused. The ported sidebar knows two row types: a page link and one `group` collapsible.

## 6. MDX content components and the prose layer

**The authored component surface is exactly two**, verified twice by independent methods: `<Component>` (137 uses, 65 files) and `<InstallCommand>` (68 uses, 67 files). The earlier "~40" was Blume's *available* set. A fence-only scan reports 15 more tags — **every one of them sits inside an inline code span**, prose about a component rather than a use of one. `<CodeBlock>` is a third component but not an added one: both `<InstallCommand>` and all 154 fences render through it, so it is the shared code-block primitive.

Plus exactly one new component, `<PrimitiveIndex />`, added by §11.3.

**The prose layer is hand-written element overrides — no `@tailwindcss/typography`.** The element set is exactly **9**: inline `code` (1823 uses / 68 files), `table`/`th`/`td` (507 rows / 57), `h3` (260 / 64), `h2` (249 / 68), `pre` (154 / 67), `a` (98 / 56), `strong` (90 / 17), `ul`/`li` (46 / **7**), `p` (68). **Absent from all 68 files:** `h1`, `h4`–`h6`, ordered lists, blockquote, `hr`, images, `em`, strikethrough, task lists, footnotes, HTML comments. **Every count in this paragraph — and the authored-surface counts above it — is a measurement of the 68-file corpus as it stood before §11.3 added `/docs/components`; the corpus is 69 `.mdx` files as of 2026-09-21 (§17.6 #26), and `mdx-components.tsx` says so at its own element-map comment.** The counts are left as measured rather than re-derived: nobody has re-run the scan over the 69th file, and inventing a number for it would be worse than dating the one that was measured. The **rule** the counts support is unchanged and is asserted on every build by the element check below. Thirteen element types the plugin would style and nothing would ever render. Taking the plugin would also mean inheriting its `.prose`-scoped descendant selectors, which Blume's own rules already fight with `!important` and an `:is()` specificity bump.

**There is no `.prose` class in the port.** This is load-bearing for §7's isolation rules.

**Values are read from computed styles on the live pages, not transcribed from Blume's override file.** Blume only *overrides* some properties; the rest fall through to the Typography plugin's defaults, so the rendered value is a merge. `h2` is the clear case: Blume sets `font-size`, `line-height` and `margin-top` and says nothing about `margin-bottom`, which the plugin supplies.

What Blume does set, and the port must reproduce:

- Body `0.875rem` / `1.7`, color **`muted-foreground`** — headings are `foreground`, body text is muted. A deliberate signature, not an accident.
- Headings weight `500`, `overflow-wrap: break-word`, display font, `-0.05em` tracking. `h2` `1.875rem`/`1.2` — **`1.625rem` at `width <= 640px`, and its `margin-bottom` is Typography's `1em`, so it tracks the font size (30px / 26px); `margin-top: 3rem` is a rem and does not step** — zeroed (with `border-top`) when first child. `h3` `1.25rem`/`1.35`, **no media step at any width**. **`h1` `3rem`/`1.1`, `2.25rem` at `width <= 640px`, `margin: 0 0 1rem`** — absent from every MDX body, so it is not an element override but the docs page's own literal `<h1>` in `app/docs/[[...slug]]/page.tsx`, which carries these as classes.
- `p`, `ul`, `ol`: `margin: 1rem 0`. `strong`: `600`.
- `a`: `foreground`, weight `500`, **dotted** underline, 1px, offset `0.2em`.
- `table`: `0.8125rem`. The scroll wrapper is §4.7's utility translation.
- `pre`: transparent background, 1px border, `--radius`, `0.8125rem`/`1.55`, `margin: 1.5rem 0`, `padding: 1rem 0`; the `<code>` inside is the scroller (`max-height: 24rem`, both axes, thin theme-colored scrollbars) so the `<pre>` stays static and the pinned copy button never drifts.

The heading anchor comes along in today's shape: `rehype-autolink-headings` with `wrap` plus a `#` revealed on hover/focus, shipped as part of the `h2`/`h3` element override rather than as page furniture.

**The element map is closed and asserted.** The root `mdx-components.tsx` declares exactly the 9 overrides plus `Component`, `InstallCommand` and `PrimitiveIndex`. A build-time check rides on the content index's **existing** text scan: if any MDX file introduces an element with no override, the build fails. Cost is zero, and it converts "the corpus is narrow" from a lucky fact into an invariant — the day someone writes a blockquote it is a build error rather than a silently unstyled page.

**Nothing else is ported. All 35 Blume content components are dropped**, and the general rule this settles is: **a component with zero uses does not get built during the migration.** Each candidate was measured rather than waved away:

- **`AutoTypeTable` provably cannot work here.** It resolves a *named* interface through the TypeScript compiler API, and **59 of 65** registry components have no named props type (`button.tsx` is `ButtonPrimitive.Props & VariantProps<typeof buttonVariants>`, an inline intersection). Making it work needs either named prop types across the registry (out of scope) or an extractor resolving a function parameter's type across the `node_modules` boundary and evaluating a cva generic — whose output would be ~250 native DOM attributes. Noise, not an API reference.
- **`TypeTable` is not a table** — it is a Fumadocs-style disclosure grid, one `<details>` per row, so "build it on our `table` primitive" would have meant `collapsible`. Zero uses. Its value appears when the 65 "API reference" sections stop linking to base-ui.com and document props instead: a content effort, not a migration one.
- **`Diff`** would have meant `@pierre/diffs`, a declarative shadow root and a second `light-dark()` theming bridge running parallel to §8's single contract. `@shikijs/transformers` already covers diff through the highlighter in the chain.
- **`GithubInfo`** is a build-time GitHub API call, rate-limited without `GITHUB_TOKEN`, degrading silently to a card with no counts.

If a docs page later wants an admonition, the answer is not to port Blume's `<Callout>` — the registry has an `alert` primitive.

### 6.1 `<InstallCommand>` gains a package-manager bar

Today it is npm-hard-coded: every one of the 68 blocks reads `npx`, while the site stores a preference (default **pnpm**) that only `/blocks` honours. The migration closes that gap rather than leaving it.

Shape: the block stays a Shiki-highlighted bash code block and the package-manager menu lives in its header bar — which means the install block *gains* the `data-language` header it does not have today (it goes through the non-fence path, so it never gets one, while all 154 fences do).

Mechanism: **all four commands are highlighted and embedded, and CSS selects one by `<html data-pm>`.** No client component, no hydration mismatch, no flash. This is the existing `install-control.astro` pattern driven by the same pre-paint script as `data-theme`. Payload cost is negligible — an install block is one short line.

This changes the install block on 67 of 68 docs pages. It is a large diff but a **uniform** one — a single declared shape repeated, not 67 different changes — so the gate carries it as **one** intended-diff entry. That is exactly the property the `/components` rename lacked.

**The three install surfaces do not overlap; they diverge**, and after §13.2 all three agree on the preference:

| Surface | Shape | PM today | PM after |
|---|---|---|---|
| docs (68 blocks) | bash code block | hard `npx` | `data-pm` |
| `/blocks` | fused 32px control, command head elided to `…` | 4-PM menu | unchanged |
| landing + `/components` | `$ command` row, React | hard `npx` | `data-pm` |

The `/blocks` control elides the command's head *because* it sits in a cramped toolbar; on a docs page the command is the content and stays whole.

## 7. Inline demo rendering

The 137 docs demos move from iframes to **inline** rendering. The reason is a real defect: an iframe is its own document, so a Dialog/Sheet/Drawer/Command overlay opened inside a demo is clipped to the frame instead of covering the viewport. `/blocks` previews stay iframes — they are license-gated pages served from `pro.sevenui.dev` through the `vercel.json` rewrites.

**This is not greenfield.** The `/components` gallery already renders registry components in-document today: 10 pages, 40 items, no iframe, a preview pane of `flex min-h-72 items-center justify-center bg-background p-6 sm:p-10` whose `min-h-72` is 288px — byte-for-byte Blume's own `MIN_PANE_PX`. The docs demos adopt that component; the two surfaces converge on one preview rather than growing a second.

### 7.1 Resolution and the client boundary

A **server component** resolves the demo by dynamic template import: ``await import(`../../../../packages/registry/demos/${path}.tsx`)``, where `path` is the frozen `"button/button-demo"` value — the literal relative prefix, matching the docs route's own MDX import; the aliased form `@/demos/${path}.tsx` resolves too once `@/*`'s doubled `registry/registry` segment is dropped, so the choice between the two is style, not capability. Turbopack builds a context module from the static prefix, so there is no codegen — consistent with §4.2. The Code tab's source is read from disk by the same server-only module that reads the content index: no `?raw`, no second mechanism, and the raw text ships unchanged including the `"use client"` line on 84 of 137 demos.

**Declared fallback (proof obligation, §20).** If the template import does not resolve to a context module covering nested directories on the first real build, a build script emits `lib/docs/demos.ts` — a literal 137-entry map of `() => import(...)` thunks. The import expression changes, not the decision.

**No forced client boundary.** The wrapper is an RSC, so the 53 demos with no directive render with zero client JS and the 84 `"use client"` demos become client islands automatically. **`client:visible` is not reproduced**: an IntersectionObserver wrapper would itself have to be a client component, dragging all 137 back across the boundary and defeating the split. The consequence is recorded: hydration moves from on-scroll to on-load, so a page with four interactive demos hydrates four islands immediately. §18 owns the number, and note that reopening this is *larger* than it looks — in Astro `client:visible` defers hydration only while the bytes ship either way, whereas Next's `next/dynamic` also splits the chunk, so scroll-gating would move payload and main-thread time both.

### 7.2 CSS isolation without a frame — four rules

`.prose` is gone (§6), so the descendant-cascade problem dissolves and what remains is two narrower channels: plain inheritance, and global element selectors. Both need an owner.

- **(a) Nothing inheritable is set on any ancestor of the demo.** §6's body typography (`0.875rem` / `1.7` / `muted-foreground`) lands on the `p`, `li` and `td` overrides, never on a container. Blume sets exactly these three on the `.prose` container today; only the iframe stops them reaching the demo.
- **(b) The preview container carries the layout contract.** `display: grid; width: 100%; justify-items: center`, plus `bg-background` and the 288px floor. This is `demos/theme.css`'s `[data-blume-example]` rule carried over verbatim (landing as `[data-sevenui-example]`, §13.3) — the hard-won fix without which the 64 `w-full` demos collapse to content width. Load-bearing regardless of (a).
- **(c) The container re-establishes the demo's root context.** `font-size: 1rem; line-height: normal; color: var(--foreground); background: var(--background)`, plus `font-family` and `letter-spacing` reset to the body values. This is not insurance — it is `demos/theme.css`'s `body { background-color; color }` rule with its selector changed. The frame's `body` gave every demo its typographic starting point; removing the frame means that rule needs a new owner. **It is scoped `article [data-sevenui-example]`: it belongs exactly where there used to be an iframe, and the `/components` gallery never had one** — unscoped, its `line-height: normal` overrode the 24px that surface inherits live, on 20 headings of `/components/accordion` alone. Rule (b) deliberately does **not** move with it, and that is measured: scoping (b) the same way produces 32 geometry differences against production, with `/components/card`'s demos collapsing 320px → 196.83px — (b) compensates for a structural difference this port has on *both* surfaces, since production's gallery puts `display: contents` between pane and demo where this port has a real wrapper div, and `display: grid; width: 100%` is what makes that wrapper transparent to layout. **And "parity work" overstates the `font-family` line:** measured, the live frame renders demos in `ui-sans-serif, system-ui, …` rather than Inter, because it loads no font either, so giving them the site font is a deliberate improvement of the same kind as §7.3's breakpoint fix (§17.6 #51), not a reproduction.
- **(d) `globals.css` declares no bare `h1`-`h6` selector.** Blume styles headings globally, not under `.prose`. Invisible today because the frame never loads Blume's entry; inline it would hit every heading a demo renders. No primitive renders `h1`-`h6` (`CardTitle` is a `div`), but **4 demos do** — `separator-demo`, `hover-card-demo`, `scroll-area-demo`, `collapsible-demo`. The rule therefore **ports with the demos excluded, not dropped**: `-0.05em` is the chrome's, and the chrome cannot be relied on to carry it as a class (§8.3 entry 4). The exclusion is **`article [data-sevenui-example] *` — the docs demos only, not every preview.** **It is ancestry-scoped, so demo content that portals out of the `<article>` is not excluded:** an overlay's `Dialog.Title` takes the rule where production's in-frame equivalent does not (§17.6 #51). No ancestry selector can reach a portal, so that is a property of the mechanism rather than a gap in this selector. The two preview surfaces differ live and the parity bar follows production per surface: the docs demos are iframes that never load Blume's entry (their `h4`s measure `letter-spacing: normal` live), while the `/components` gallery renders inline with no frame at all, so its preview content *does* get the rule — `/components/button`'s "Ready to get started?" `h3` measures −0.9px live. The two share a `[data-sevenui-example]` here only because Task 4.2 converged them on one `<PreviewPane>`, which must not change what either page renders.

(a) and (d) are both required and neither substitutes for the other: (a) stops what arrives by inheritance from a container, (d) stops what hits the element directly. (c) closes the gap left if a future layout class violates (a).

### 7.3 Height, breakpoints and the one containment flag

**The shared pane height is dropped.** Blume estimates server-side (≈21px/line, 288px floor, 400px ceiling), then the frame postMessages its measured height and both panes follow, so toggling never shifts the page. Inline, none of that has a job: the demo is server-rendered with its real markup, so its height is correct at first paint. The preview pane gets `min-h-72` and its natural height; the code pane gets `max-h-96 overflow-auto`. That is exactly what the 10 live gallery pages already do.

Retired with it: the estimate arithmetic, the postMessage height protocol, the frame-side `ResizeObserver`, the viewport clamp that exists only to park a `100svh` feedback loop, and the `rafThrottle` resize listener — the vendor file this repo patched upstream (blume#245).

**Inline demos resolve real viewport breakpoints, and that is a second deliberate fix.** The docs content column is 42rem (672px), so every demo today renders inside a ≤672px viewport and **`md:` and `lg:` resolve false in every frame**. The iframe does not only clip overlays; it lies about breakpoints. No demo uses `md:`/`lg:`/`xl:` itself (3 use `sm:`, true at both widths) — the exposure is entirely through 6 primitives: `calendar` (`md:flex-row`), `input` / `textarea` / `questionnaire` (`md:text-sm`), `drawer` (`md:text-left`), `sidebar` (`md:flex`). **26 of 137 demos** render at least one. Concretely: `calendar-range` shows its two months stacked today and side-by-side inline; inputs go from 16px to 14px; the drawer header stops being centered. Each is the form the component genuinely takes on a desktop page.

**Nothing needs a frame.** `sidebar.tsx` is the only viewport-reading primitive in the registry (`useIsMobile`, 768px) and the only one positioned against the viewport (`fixed inset-y-0 z-10 h-svh`). Inline at desktop width it would pin a full-height sidebar over the docs chrome. The escape hatch is **containment, not a frame**, and it is safe for one measured reason: **every overlay primitive portals to `document.body`** — dialog, sheet, drawer, popover, tooltip, dropdown-menu, select, context-menu, menubar, hover-card, alert-dialog, toast. They are not descendants of the preview container, so a containing block cannot clip them, and the defect this whole section exists to fix stays fixed.

Shape: opt-in per demo, `<Component path="sidebar/sidebar-demo" contain />`, applying `contain: layout paint`. **Opt-in rather than blanket**, because blanket containment is a silent trap — a future demo would start depending on it without saying so. One user today, and the flag says why it is there.

An iframe escape hatch was considered and rejected: two render paths, two theme bridges and two height stories, which is every problem this section just closed.

**Third-party demos need no special handling.** Carousel (embla), chart (recharts), calendar (react-day-picker) and resizable (react-resizable-panels) all size from their parent element, which inline is the preview pane — the same box the iframe gave them. A grep for `matchMedia` / `innerWidth` / `innerHeight` / `h-svh` / `100vh` across the registry returns `sidebar.tsx` and nothing else, and no demo anywhere uses a viewport unit.

### 7.4 `apps/web` must resolve the registry's runtime dependencies

`apps/web/package.json` declares only `react`, `react-dom`, `lucide-react`, `@clerk/clerk-js` and `@sevenui/presets`. Every demo's real dependency set — `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `cn`, `embla-carousel-react`, `recharts`, `react-day-picker`, `react-resizable-panels`, `react-hook-form` — belongs to `packages/registry` and reaches `apps/web` only through `publicHoistPattern`. See §14.1.

## 8. Theme mechanism and token ownership

### 8.1 The storage key is a cross-repo contract

There is **no postMessage theme contract** — `apps/web` contains zero `postMessage` calls. `vercel.json` rewrites `/previews/:path*` to `pro.sevenui.dev`, so pro preview documents are **same-origin** and share `localStorage`; theming crosses that boundary over the native `storage` event, which `packages/presets/apply.ts` names explicitly. That promotes the storage key from a preference to a contract with another repository.

| Item | Decision |
|---|---|
| Attribute | `data-theme` — **frozen**. `class="dark"` would ripple into `packages/presets`, `packages/registry` and the pro repo for no gain |
| Storage key | `blume-theme` → **`theme`** |
| Value vocabulary | **frozen** to `"light" \| "dark" \| absent`; `absent` means system |
| Mechanism | `next-themes`: `attribute="data-theme"`, `storageKey="theme"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`, `enableColorScheme={false}`, `<html suppressHydrationWarning>` |

The literal string `"system"` is never written, because the toggle stays two-state — the pro preview documents do `root.dataset.theme = <value>` and would render neither light nor dark. The toggle remaining two-state is a parity decision: a three-state toggle is a feature, not a migration. The rename resets every returning reader's preference once, to system — accepted.

`next-themes` is chosen over a hand-rolled inline script not for bundle size but for the `storage` event: the key is a cross-repo contract and `next-themes` gets write/read/cross-tab sync right in one place. `enableColorScheme` is off so the `color-scheme` CSS rules stay the single owner — they also work without JS.

**Three behavioural details of today's script:** live OS following is **added** (`THEME_INIT_SCRIPT` reads `matchMedia` once with no `change` listener, so with no stored preference the site stays on the theme it loaded with — a gap, not a design choice); `astro:after-swap` re-application is **dropped** (App Router client navigation does not replace `<html>`); transition suppression is **kept** (`disableTransitionOnChange` is the same behaviour as today's inject-`transition:none`, force reflow, remove after 1 ms).

### 8.2 One `app/globals.css`

Splitting is not free in Tailwind v4 (`@utility` / `@theme` are order-sensitive) and the file lands around 290 lines.

**Deleted on the way:** the `--blume-*` re-pointing (10 lines) and the search-dialog `!important` overrides (18 lines).

**Kept verbatim:** the `@layer base { * { border-color } }` preflight fix (more necessary in Next.js, not less — no framework ships a default either), `@theme inline`, view-transition overrides, `::selection`, `scrollbar-gutter`, and the full animation set. The animation set moves **verbatim** and is self-contained: `--tw-duration` / `--tw-ease` come from Tailwind core, `--spacing` from Tailwind's defaults, `--accordion-panel-height` / `--collapsible-panel-height` from Base UI. Nothing depends on Blume's stylesheet ordering.

**`@source` stays, relative to a hand-written file.** The five-level `../../../../../packages/registry/…` paths were fragile only because they resolved against a *generated* entry. From `apps/web/app/globals.css` they become `../../../packages/registry/registry` and `../../../packages/registry/components`, written once. The lines are still required — Tailwind v4's automatic scan does not reach outside the app.

### 8.3 The global base layer, swept once

Three separate investigations each found exactly one rule living in Blume's *generated* entry (`.blume/src/generated/app.css`) rather than in `apps/web/theme.css`. The pattern was the finding, so the whole file was diffed. It is **13** `@theme inline` entries and **seven** `@layer base` rules. **This inventory is taken once and is not to be rediscovered a rule at a time.**

`theme.css` declares 39 `@theme` keys. These 13 exist only in Blume's entry:

| Blume-only `@theme inline` entry | Port |
|---|---|
| `--color-background`, `--color-foreground`, `--color-border`, `--color-muted`, `--color-muted-foreground` | **yes** — all five are used by demos |
| `--font-sans`, `--font-mono` | **yes** — `font-mono` has 15 authored call sites plus 3 in the registry; `font-sans` is the body font |
| `--font-display` | yes, as `var(--font-sans)` — and it is read three ways, which is why it is emitted on `:root` rather than inlined: the `font-display` **utility** on §6's `h2` and `h3` overrides (`mdx-components.tsx`) and on the docs `<h1>` (`app/docs/[[...slug]]/page.tsx`), and **`var(--font-display)` directly** in entry 4's restored bare-heading rule in `@layer base`. This row read *"no utility uses it"* until 2026-09-21; Stage 11's own heading fix made that false, and it is corrected here rather than after the merge |
| `--color-action`, `--color-action-foreground`, `--color-code`, `--radius-blume` | **no — these die.** Zero consumers anywhere in `apps/web` or the registry; they fed Blume's own chrome and `.prose` only |
| `--container-content` | **yes, renamed** — see below |

`@layer base`, all seven:

1. `* { min-width: 0 }` — the global flex/grid overflow defuse. Silent and site-wide; **ports**.
2. `button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer }` — ports.
3. `html { scroll-behavior: smooth; scroll-padding-top: 4.5rem; text-rendering: optimizeLegibility }` — all three port. `scroll-padding-top` is load-bearing for §9's anchored search results, which would otherwise land under the sticky header.
4. The bare `h1`-`h6` display-font + `-0.05em` rule — **ports, scoped out of the docs demos** (§7.2d). The premise it was first dropped on, *"the chrome's headings carry their own classes"*, was measured in Stage 11 and is false: **seven authored headings carry no `tracking-*`** (`app/page.tsx` ×2, `components/landing-showcase.tsx` ×2, `app/not-found.tsx`, `app/components/page.tsx`, `components/mdx/primitive-index.tsx`), and the `/components` gallery renders registry components that emit their own headings — `accordion`'s trigger sits in Base UI's `Accordion.Header`, an `h3` — which **no class list in `apps/web` can reach**. Live, all of them get `-0.05em`. It lands as `:is(h1,…,h6):not(:where(article [data-sevenui-example] *))` in `@layer base`, at the bare selector's own `(0,0,1)`, so every `tracking-*` utility and `.legal h1` still win. **What it cost before it was measured:** the docs `<h1>` rendered at 16px/400 against production's 48px/500/−2.4px on all 69 docs routes — smaller than the `<h2>`s beneath it — and `-0.05em` was lost on every heading with no `tracking-*` class, `/` and `/components` included. Both are invisible to §17.2's extractor by construction, which is why nine stages of text gating did not see them and §17.3's first browser run did.
5. `:focus-visible { outline: 2px solid var(--blume-accent); outline-offset: 2px; border-radius: 2px }` — the site's global focus ring, and the one entry with a real choice. **`--blume-accent` resolves to `oklch(0.145 0 0)` light / `oklch(0.96 0 0)` dark — near-black and near-white, not the brand blue `theme.css`'s own comment claims.** That is `--foreground` to within 0.025 L, so it ports as `var(--foreground)`. `blocks-theme-dock.astro` already hardcodes `outline-foreground`, so this makes the site consistent rather than changing it.
6. `body { background-attachment/-image/-position/-repeat/-size }` — all read `--blume-background-image`, which resolves to `none`. **Dead; dropped.**
7. The `prefers-reduced-motion` `scroll-behavior: auto` guard — ports with (3).

Also Blume-only: two `[dir="rtl"]` code rules (`pre` forced LTR, inline `code` `unicode-bidi: isolate`). Dropped with §11.6's RTL call — the port has no locale and no `dir` switch.

**`--container-content` comes back under our own name.** It was killed on a "zero consumers" premise that §11's furniture falsifies: the 42rem docs measure is referenced by §6's element overrides, §7's demo panes and all four furniture pieces (5 `max-w-content` on one live page), yet after `.prose` was deleted nothing on the map owned it. `--radius-blume` genuinely dies: 12px matches no SevenUI radius while the furniture sits inches from primitives at 10px, so it snaps to `rounded-lg`. A 2px change on four elements, inside the parity bar.

### 8.4 Inline demos get a scoped preset applier

`packages/presets` is not touched. `resolvePreset()` is already exported, so `apps/web` builds its own rule: one `<style>` node in `<head>`, scoped selectors (`[data-preset-scope] { … }` and `[data-theme="dark"] [data-preset-scope] { … }`), updated from the same `storage` event `apply.ts` already uses. Selector-scoped rather than inline style objects, because inline styles cannot express the light/dark split without also watching `data-theme` from JS.

Applies to docs demo wrappers **and** the `/components` gallery. **Site chrome is never scoped:** `@sevenui/presets/apply` must never be imported from the root layout. This is the registry's own rule, stated in `apply.ts`: *"Only preview documents may import this module — the site chrome is deliberately never themed."*

The **control** stays on `/blocks` only. Moving the dock onto `/components` and the docs pages is a product change, out of scope (§19). Until that lands, the preference is chosen on `/blocks` and merely reflected elsewhere: it works, but is not discoverable.

Note the dropped-iframe consequence is the opposite of the intuitive one: removing the frame does not make demos follow the customizer — it removes the document that was *allowed* to be themed, which is why the scoped applier is forced rather than optional.

### 8.5 The registry theme guard is extended

`scripts/check-registry.mjs` asserts every published `cssVars` token appears in `packages/registry/demos/theme.css` with the same value. Once demos render inline, that file is no longer loaded by the site — the file a visitor actually sees becomes `globals.css`, which no guard covers. **The loop takes a second file.** The script is at the repo root, not under `packages/registry`, so this is in scope.

### 8.6 `--success` / `--warning`: evaluated, not a bug

The status tokens are in `apps/web/theme.css`, `packages/registry/demos/theme.css` **and** the published `theme` registry item (`/r/theme.json` carries all four: light 37 tokens, dark 36). `text-success` also needs `--color-success`, and shadcn's `update-theme` postcss plugin keeps no allowlist — for every `cssVars` key whose value is a color it emits `--color-<key>: var(--<key>)` into `@theme inline`, and `oklch()` qualifies. So `shadcn add .../r/theme.json` gives a consumer working status utilities. Keeping them out of `packages/presets` also remains correct: `buildPresetCss` emits a *partial* `:root` rule, so tokens it never names keep their stylesheet value under every preset.

**Found instead, and outside this map's scope:** no registry item declares `registryDependencies` on `theme.json`. For the free primitives that is correct (no free item uses `text-success` / `bg-warning`), but pro blocks do — so a consumer installing a pro block into a project without SevenUI's theme gets undefined vars. The fix belongs to the pro block's `registryDependencies`, in the pro repo (§19).

## 9. Search palette and its index

Rebuilt on SevenUI's own `command` primitive. Blume's Orama dialog is not reproduced — `theme.css` already fights it with `!important` to reach a single-column palette, which is what the replacement should simply be. This is one of the two forced redesign exceptions (§19).

**Measured first: full-text matching does not work on this corpus.** 65 of the 68 pages are the same skeleton, so body text is nearly non-selective — `installation` matches 67/68, `usage` 66/68, `props` 47/68, `base ui` 47/68, `variant` 26/68. That number decides most of this section.

**1. The index gains heading-level entries: 382 = 68 pages + 314 headings.** There are 509 `h2`/`h3` headings but only 261 distinct, and three of them — `Installation`, `Usage`, `API reference` — account for 195 occurrences. Those three are excluded; the remaining 314 are genuinely page-specific (`Loading`, `With icons`, `Controlled`). A heading entry deep-links to `route#slug`, which **cannot drift** because the slug comes from the same `github-slugger` pass `rehype-slug` runs at render (§4.3).

**2. Build-time static JSON, fetched on first open: 113 KiB raw / 30 KiB gzipped.** Derived from §4.2's content index — same server-only `fs` module, no second reader, no codegen — and written as a static asset. Body text stays, page-level only, weighted below title/heading/description. Measured for the record: dropping body text entirely takes the index to 31 KiB raw / **5 KiB gzipped**. That is a real lever, but it costs the one thing today's search does have, so it is not taken here.

**3. The matcher is ours; Base UI keeps everything else.** `command` is `Autocomplete.Root`, and `AutocompleteRootProps` does not omit `filteredItems` — the list uses those items instead of filtering internally. So a ranked array is handed in and Base UI renders it in our order while keeping the combobox roles, `aria-activedescendant`, highlight and keyboard handling.

Base UI's own filter could not do this: it is `Intl.Collator`-backed **substring `contains`** returning a boolean, with no score, and its sliding-window compare over 81 KiB of body text would run per keystroke.

The scorer is hand-written, no library — a field-weighted ladder: exact title > title prefix > title substring > heading substring > description substring > body substring, with a page's own entry ranked above its headings on ties so a page and its sections do not interleave. 12 results shown, as today.

**4. Scope is docs only — 68 pages, unchanged.** This is parity, not a restriction: Blume's index contains the 68 `.mdx` routes and nothing else. `/blocks` must stay out on its own merits — it is ISR-revalidated, so a build-time index of it is stale by construction. The gallery was raised and dropped: covering it is a product decision, not migration parity.

**5. Keyboard contract preserved minus one dead binding.** `⌘/Ctrl+K` **toggles** (pressing it with the dialog open closes it — deliberate, to avoid re-`showModal` on an open dialog), `/` opens only and is inert while focus is in any field, plus arrows, Enter and Escape. **`⌘J` is dropped**: it toggles a result-preview pane this site already hides with `!important`, so the binding is dead today. The trigger keeps its position and appearance exactly: an `h-9` rounded-full bordered pill, icon-only below `lg`, gaining the "Search" label and a `⌘K` kbd above it.

**6. `search.popular` survives and moves to `lib/docs/search.ts`.** Six links, rendered as a "Popular" group in the empty state, unchanged. **Landmine:** the routes in `blume.config.ts` are base-less (`/installation`, `/theming`, `/components/button`) because Blume prefixes them through `basePath` at render. There is no `basePath` (§3), so **all six must be written with a literal `/docs/` prefix**. `/components/button` is the dangerous one — unprefixed it resolves to a real but wrong page in the gallery's namespace rather than 404ing. The empty state's other group, "Ask AI", does not come along: `blume.config.ts` has no `ai.ask` block, so it is already off in production.

**7. Result rows keep today's shape; one template serves both entry kinds.** File icon, title, and a 2-line clamped excerpt, both title and excerpt carrying `<mark>` highlights. A **page** row is that unchanged. A **heading** row puts the heading text on the title line and its page's title on the second line, in place of the excerpt. The `breadcrumb` field is carried in the hit and never rendered — it exists for the section pills only. Section pills keep today's threshold (they render only when the result set spans two or more sections) and count **distinct pages**, not entries, so heading entries cannot inflate them.

**8. No no-JS story is lost, and a11y improves.** Blume's dialog is a custom element wrapping a native `<dialog>`; with JS off the trigger is already inert. `CommandDialog` is Base UI Dialog plus Autocomplete, so combobox roles, `aria-activedescendant` wiring and the focus trap come from the primitive rather than 866 lines of bespoke element.

**~60 lines of security-critical code have no successor, and that is a simplification.** Blume builds result rows as HTML strings and assigns them with `innerHTML`, so it needs `highlight()` (match on raw text, escape per segment, so a query like `amp` cannot mark the inside of an entity) and `sanitizeExcerpt()` (reduce provider markup to bare `<mark>`, splitting on angle-runs so a deletion cannot splice `<<b>script>` into `<script>`). In React the excerpt is an array of text nodes and `<mark>` elements — no HTML string, no escaping step, no sanitizer.

## 10. Blocks, ISR and manifest failure semantics

**Measured here, and maintained here.** §10 owns the ISR mechanism, so the manifest's shape is stated in this section and quoted from it (§2, §17.1) rather than copied. The figures are manifest-derived, so the rule binds and the number is dated: **as of 2026-09-21 the live manifest is 4 groups / 19 categories / 113 items — 46,487 B raw, 11,963 B gzip — so ISR covers 24 routes** (`/blocks`, 4 group pages, 19 category pages). `node scripts/route-inventory.mjs` counts 24 `blocks` routes from the repo side, so the two derivations agree. It was 3 groups / 14 categories / 65 items and 18 routes when this section was written; the growth is this mechanism working, and it is the reason the count is dated rather than frozen. The recorded "27.8 KB" did not say which instrument it came from, which is why both the raw and the gzip figure are given above. Today `pages/blocks/_data.ts` calls `await loadProManifest()` at module scope, so there is **one fetch per build** shared by all three routes. The target shape preserves that property.

**1. `fetch` with `next: { revalidate: 300, tags: ['pro-manifest'] }`, plus `export const revalidate = 300` on each of the three segments.** The Data Cache is keyed by URL, so one entry serves all three routes *and* `generateStaticParams` — the same single-fetch property the module singleton has today. The segment export is redundant with the fetch option and kept anyway: a reader of `page.tsx` should not have to open the loader to learn the route is ISR.

`"use cache"` / `cacheLife` is **not** used. In Next 16 it sits behind the `cacheComponents` flag, which changes rendering semantics application-wide — too large a blast radius for one data source.

The fetch goes **directly** to `https://pro.sevenui.dev/r/pro-manifest.json`, not through the site's own `/r/pro-manifest.json` rewrite: a server-side fetch to its own origin is a self-request through Vercel's edge, and on a cold build the site is not serving yet.

**2. Build-time failure stays hard; stale-serve applies to revalidation only — and it comes for free.** The current throw-everything loader already produces exactly the wanted semantics under ISR, so **no change to `loadProManifest` is needed**; only a statement of what the throw now means:

| When | Today | Under ISR |
|---|---|---|
| Build (`generateStaticParams`) | build fails | build fails — unchanged and wanted: a cold build has no previous good page, and publishing an empty `/blocks` is worse than failing |
| Background revalidation | n/a | last good page keeps serving; Next retries on the next request past the window |
| On-demand render of a *new* path | n/a | no previous version exists, so this one errors rather than serving stale |

**3. A shape violation is treated exactly like a non-200 — both serve stale.** It cannot be made louder *at the route level*: during revalidation Next keeps the last good page regardless of why the render threw. "Louder" therefore means an alert, not different page behaviour — which is decision 7's job. And stale is not wrong here: the previous manifest was valid, so the page it produced is correct, just behind.

**4. New groups and categories appear without a rebuild — and the mechanism is not the obvious one.** `generateStaticParams` runs **at build time only**; it does not re-run on revalidation, so a new category never enters the enumerated set. It becomes reachable like this:

1. `/blocks` and `/blocks/[group]` revalidate on their 300 s window and re-render from the fresh manifest, so their listings include the new category.
2. That listing links to `/blocks/<group>/<new>`, which is not enumerated — **`dynamicParams`** (Next's default, declared explicitly) renders it on demand and caches the result.

`dynamicParams` is not optional: with it off, a new category would 404 until someone rebuilt, which is the exact manual step this migration exists to remove.

**Its required consequence: the pages must call `notFound()`.** Today they use `groups.find(...)!` — a non-null assertion that was safe only because every rendered path came from `generateStaticParams`. Under `dynamicParams` an arbitrary path reaches the component and the assertion produces a **500 instead of a 404**. The same `notFound()` also handles *removal*: if pro deletes a group, its cached route stays until it revalidates, at which point the lookup misses and it becomes a 404.

**5. On-demand revalidation is deferred, but the tag ships now.** 300 seconds is the agreed SLA, so a webhook adds nothing today. The fetch carries `tags: ['pro-manifest']` anyway — one property — so a `revalidateTag` route handler with a shared secret is later a single-file addition rather than a refactor. The pro repo's `trigger-web-rebuild.yml` is the natural caller when that day comes.

**This deferral rests on tags invalidating the rendered page, not merely the fetch entry — now verified against Next 16.3.5's source (§20.2 #4).** Three API facts the future one-file addition needs, recorded while the source was open:

- **Single-argument `revalidateTag(tag)` is deprecated in 16.3.5.** It logs a console warning pointing at either a second argument or `updateTag`. The call is `revalidateTag('pro-manifest', 'max')`.
- **`updateTag` is Server-Action-only** and throws explicitly in a route handler (`workStore.page.endsWith('/route')`), so the webhook must use `revalidateTag`.
- **The second argument changes the semantics**, and the choice belongs to whoever builds the webhook: with **no** profile the tag is marked `expired: now`, a hard immediate expiry, so the next request re-renders and waits. With a profile the tag is marked `stale: now` **and** `expired: now + expire`, which is stale-while-revalidate — the next visitor gets the old page and triggers a background refresh. The second matches what `/blocks` already does on its 300 s window; the first makes a new block appear on the very next request at the cost of one slow response.

**6. CI builds against the fixture; production builds against the live manifest.** `ci.yml` runs a bare `pnpm build` today, so web CI reaches `pro.sevenui.dev` on every pull request. ISR removes the value of that coupling: a bad manifest no longer breaks the site, and Vercel's production build still fetches live and still fails hard. What remains is pure cost — a pro outage turning web pull requests red. CI sets `PRO_MANIFEST_URL=lib/pro-manifest.fixture.json` and becomes **hermetic**. The fixture (2 groups / 3 categories / 3 items) stays and becomes load-bearing rather than incidental.

**7. The signal CI gives up moves to a scheduled canary.** A workflow in this repo fetches the live manifest and runs `parseManifest` on it, failing on any violation. This is strictly better than what CI did: CI only ran on pull requests, while a bad manifest can land at any time — and stale-serve means nothing else would ever notice. A runtime health endpoint was considered and dropped: it requires someone to watch it, whereas a scheduled job reports through a channel the dev already reads.

**ISR is not extended beyond the pro manifest.** The other four data sources on the site do not go stale (§19). §15.7 attaches a site-wide ceiling: no `revalidate` anywhere exceeds 300 seconds.

## 11. Chrome, layouts and page furniture

### 11.1 Layout tree

One root shell plus three nested layouts.

`app/layout.tsx` owns the document: `<html>` attributes, fonts, the theme provider (§8.1), the package-manager pre-paint script (§13.2), header, footer, mobile drawer, skip link, `<main id="content">`, and analytics. Nested layouts at `app/docs`, `app/(gallery)/components` and `app/blocks` add their sidebars.

**What Blume's `PageLayout.astro` provided, and what happens to each.** It renders 15 distinct things; the port keeps 5:

| Blume shell piece | Port |
|---|---|
| `<ClientRouter>` + `SWAP_STYLESHEET_INIT_SCRIPT` | **deleted** — App Router owns soft navigation; the body-stylesheet race the second script exists for cannot occur |
| `<Banner>` + `BANNER_INIT_SCRIPT` | **deleted, and it is dead code today** — `blume.config.ts` declares no `banner`, so the dismiss branch has never run in production |
| `clientData` JSON island | **deleted** — it *is* emitted on docs pages by Blume's `RootLayout`, but nothing reads it; only Blume's own islands would, and the site renders none |
| `syncDrawerInert()` | **deleted** — React renders `inert` from state |
| `<Fonts>` | replaced by `next/font` (§11.2) |
| `<Favicon>`, meta/OG/canonical | §15, §16 |
| JSON-LD (default **on**) and `<WebMcp>` (default **on**) | §15.8, §15.14 — both ship in production today and neither is declared in config |
| `THEME_INIT_SCRIPT` | §8.1 |
| `<Analytics>` | kept — the two GA4 scripts, still production-only |
| skip link, `<main id>`, header, footer slot | kept |

The `#blume-content` skip target becomes `#content` (§13.3).

### 11.2 Fonts

Nobody owned this. The resolved config is `fonts: { body: "inter", display: "inter", mono: "ibm-plex-mono" }` — **Blume's defaults, not written in `blume.config.ts`** — self-hosted by Astro's Fonts API: Inter at 400/500/600/700 with 400/500/600 preloaded, IBM Plex Mono 400 preloaded. They reach CSS only through `--blume-font-*`, which is why §8.3 must declare `--font-sans` / `--font-mono` / `--font-display` directly.

`next/font/google` for both, `display: "swap"`, exposed as `--font-sans` and `--font-mono`, with `--font-display: var(--font-sans)` since display is Inter too. Next's own preload handling stands in for Astro's per-weight preload list; reproducing that list is not parity work under §17's bar.

**Geist / Geist Mono was raised and deliberately deferred, not rejected.** The technical cost is ~3 lines against the single seam this decision creates, so cost is not the reason. It is out of the cutover for **attributability**: `/` and `/blocks` are held near pixel parity and were hand-tuned in their own efforts, so if typography and framework move in one deploy, every drift the sampled human review finds has two suspects and the review cannot adjudicate. Two secondary costs: the global `-0.05em` heading tracking was matched visually against Inter and would need re-tuning, and `--font-mono` drives ~2.0 MiB of Shiki output in a 42rem column, where a different advance width changes where long lines wrap. A follow-up effort after the cutover (§19). **§16 is explicitly told not to "fix" the card/site font mismatch by pulling the OG card onto Inter.**

### 11.3 Docs page furniture

**The breadcrumb was not one.** `Breadcrumbs.astro` computes the full trail and renders only `crumbs[length-2]` — the parent group — as an eyebrow, and renders **nothing** when the trail is length ≤ 1. Verified live: 65 primitive pages emit the identical non-linked `<span>Primitives</span>` under a navigation landmark, while `/docs`, `/docs/installation` and `/docs/theming` emit no breadcrumb at all.

**Decision: draw the real trail**, adopting the idiom the site already ships on `/blocks` (`Blocks / Marketing / Hero`: linked ancestors, `mx-1.5` `/` separators, current page a non-linked `text-foreground` span) rather than inventing one.

- **Trail shape:** a synthetic `Docs` root, then the nav ancestors, then the page — `Docs / Primitives / Button`. Taking the nav trail as-is was rejected because it leaves `/docs/installation` with a one-item trail, which is the same defect relocated. `Docs` is the site's own word: the header tab for `/docs` is labelled exactly that.
- **Markup:** the semantically correct `nav > ol > li` with `aria-current="page"` on the last item, and **`/blocks` is brought along to it**. Copying the blocks markup verbatim would have propagated its two gaps (no list structure, no `aria-current`) to 68 more pages. `list-none` keeps it **pixel-identical**, so `/blocks`'s near-pixel parity is untouched and the diff is in the accessibility tree only. Docs position is unchanged: above the `<h1>`, `mb-2`, on §8.3's 42rem measure.
- **The docs index renders none.** A breadcrumb whose only item is the current page carries no information.

Net: 65 pages go from one word to a three-item trail, `/docs/installation` and `/docs/theming` **gain** a two-item trail, `/docs` stays bare.

**`BreadcrumbList` JSON-LD is added** as a third node in the `@graph` §15.8 establishes, on docs and on `/blocks` alike — `/blocks`'s trail is fully addressable, so excluding it would need an explanation that does not exist.

**`/docs/components` becomes a real page.** This is the effort's one deliberate scope bend and it is taken knowingly. The alternative — redirecting `/docs/components` to the first primitive — makes the *URL* honest, but Google follows the 308 and canonicalizes the breadcrumb `item` to `/docs/components/accordion`, which is Button's **sibling**, not its ancestor. That is the same structural lie laundered through a hop. §5's mapping of the "Primitives" *header tab* to the first primitive is a jump-into-a-section affordance; a breadcrumb is a hierarchy claim and cannot borrow it.

- **Mechanically it is `docs/components/index.mdx`** — a real content page with frontmatter, carrying one new `<PrimitiveIndex />`. That reopens §6's closed component set by exactly one entry, justified on §6's own terms: the set closed because nothing else had a use, and `AutoTypeTable` was dropped because it provably could not work. This has one use and provably can work, since all 65 labels and descriptions already sit in frontmatter. The alternative — `app/docs/components/page.tsx` — is cheaper to write and more expensive everywhere else: outside the content index it needs a special case in the nav, the search index, the `.md` mirror, `llms.txt` and `lib/page-meta.ts`, and would be the only route under `/docs` with no `.md`. As MDX, all of them handle it with **zero special cases**.
- **The Primitives group node gains an optional `href`**, narrowing §5's type boundary rather than breaking it: that boundary exists so a *label* cannot become a URL, and the group's `href` still comes only from the content index's `route`. The sidebar's `<details>` summary becomes a link with the toggle bound to the chevron. Rejected: making the index the group's first child, which keeps the boundary intact but forces the breadcrumb to find the group URL through a "the group's overview child" special case. The index is excluded from the group's derived children so it does not appear twice.
- **Content:** the 65 primitives as a card grid in `/components`'s existing idiom (`rounded-xl border`, label plus description), **alphabetical** — because §5 slug-sorts the nav and the page must agree with the sidebar. Grouping by wave would duplicate `/docs`'s hand-maintained Coverage section with a second list free to drift.

**"Was this page helpful?" is reproduced on its exact GA4 contract, with two corrections.** The event is `feedback` with props `{ helpful: "yes"|"no", path, title }`. `path` remains the series' real key. `title` is sent as the **bare page title** from `lib/page-meta.ts`, not `document.title` — §15.8 moves that value at cutover regardless, so if it must change once it should change to the value that carries no separator and will not move again. **Four dead sinks are dropped:** `track()` fans out to an internal reporter, `posthog.capture`, `gtag`, `plausible` and a `blume:track` CustomEvent — only gtag is configured (`G-8702Z28SMN`), and the CustomEvent has no listener anywhere. There is no dedup today either: the hide is DOM-only and `astro:after-swap` re-inits, so repeat votes are already possible.

**The TOC scroll-spy becomes one hook rendered twice.** The algorithm ports exactly: a 72px offset constant; active is the **last** heading whose `getBoundingClientRect().top <= 72`; at the document bottom the last link is forced. Today two independent `<blume-toc>` instances run — the mobile `<details>` and the desktop `<aside>` — each with its own observer and `aria-current` write. In React one `useActiveHeading` in the docs layout feeds both renderers: **one** scroll listener and **one** observer instead of two. The `IntersectionObserver` is kept even though its callback ignores its own entries and only triggers a recompute — it is not ceremony: §7.1 hydrates 84 demos on load, which moves headings with no scroll event, and the rAF-throttled scroll listener alone would miss that.

**Pagination is reproduced exactly**, markup, measurements and classes verbatim, the empty `<span />` placeholder included. The logical properties (`ms-auto`, `text-end`) stay — unconditional and simply correct. `rtl:-scale-x-100` is **dropped**: the variant only fires under `[dir="rtl"]`, and the port has no locale, no `dir` switch and i18n is ruled out map-wide. A variant that can never match is dead code, dropped on the same grounds as §5's unreachable panel machinery.

### 11.4 Header and drawer

Stripped of dead paths — `Ask` (no `ai.ask`), `LanguageSwitcher` / `localeSwitch` / the whole `i18n-ui` string merge (no locales), `NavSelector` / `versionSelector` (none configured), the banner — the header's feature list is exactly: nav toggle (`lg:hidden`), logo, five `SITE_TABS` with `aria-current` (inline from `lg`), flexible spacer, search trigger (§9), GitHub link, theme toggle, auth pill (§12).

**The header is one client component.** The tab bar needs `aria-current` inside a persistent layout, which is §5's constraint verbatim, so no server split saves it; and the alternative — a server header hosting four islands — buys nothing when the serialized payload is five tabs. The search *dialog* sits behind a **dynamic import** so the palette and its matcher stay out of the header chunk. The theme toggle keeps its CSS-driven icon swap (`inline-flex dark:hidden` / `hidden dark:inline-flex`) rather than branching on a JS-read theme — that is what makes it SSR-safe with no hydration mismatch and no flash.

Blume's `tabsNavClass` deviation is kept: inline tabs wait until `lg` on every page, not `md` for docs. The recorded reason (hamburger plus a 294px tab bar in the same 768px row) still holds.

**The drawer.** One drawer per page today, opened by pure CSS off an `<html>` attribute, with four attached behaviours: scroll lock, a measured `--blume-drawer-top`, close-on-resize past `64rem`, and `inert`/`aria-hidden` sync via `MutationObserver`. In React: open state is `useState` in a layout-level context shared by the header button and the panel; `inert` renders from that state; the resize close is a `matchMedia` listener; the scroll lock stays.

**`--blume-drawer-top` is deleted for a static `top-16`.** It exists only because a banner's text can wrap, so the header's bottom edge is not a constant — and **no banner is configured**. Its `getBoundingClientRect()` measurement, the re-measure-on-dismiss and the re-measure-on-resize all go with it.

**The drawer stays hand-rolled rather than becoming the registry's `Sheet`.** Sheet is modal with a focus trap; this drawer is deliberately non-modal, a choice recorded in two places in the current source. A cutover whose whole point is attributable regressions is the wrong place to change focus behaviour on every page of the site.

### 11.5 `/blocks` cards

`block-frame.astro`'s 1,200 lines decompose into three layers: **(a)** server-renderable markup (the `<article>`, heading plus optional badge, description, the whole toolbar, the track / clip layer / decorative ring, the `<iframe>` with `data-src`, the width readout); **(b)** per-card behaviour (width state and preset bucketing, drag with pointer capture, keyboard resize, fullscreen in two flavours, refresh, permalink and prompt copy); **(c)** page singletons (the lazy loader, the live region, the tooltip, the package-manager preference).

Today (b) and (c) are one document-level delegated script because Astro's alternative was ~54 islands on a six-card page. React has no such cost, so: **`<BlockCard>` (server) + `<BlockPreview>` (client) per card.**

- **The measured border delta stays a runtime measurement.** Width presets bucket against the **iframe's** content width through a runtime border delta, not the box's border-box width. The box↔iframe offset cannot be known at build time, and hard-coding "2" is what makes a "1024px" badge lie.
- **The concurrency cap survives as a layout-level context**, not as a per-card `IntersectionObserver` each doing its own thing: **the cap is the feature.** Six full applications booting at once is the difference between a gallery that scrolls and one that stalls. The context hands each visible card a "you may load now" grant and each card sets its own `src` on receipt.
- **The announcer stays one live region** in the blocks layout, exposed as an `announce()` context. Its two non-obvious rules travel with it as comments: it must exist and be empty before the text changes, and it must be cleared between writes or a repeated message is silent.
- **The tooltip becomes the registry's own `Tooltip`**, with one Provider in the blocks layout. The bespoke singleton existed to avoid one island per button; with per-card client components that reason is gone, and the site stops hand-rolling a primitive it publishes. It stays decorative — no `aria-describedby`, the `sr-only` accessible names unchanged — so the WCAG 1.4.13 reasoning holds.
- **Refresh keeps `contentWindow.location.reload()`**, not `src` re-assignment, which re-arms loading and pushes history.
- **Fullscreen keeps both flavours**: the Fullscreen API, plus the `[data-fs]` fixed overlay, because iOS iPhone has no Fullscreen API.

`install-control.astro` ports as a server component with its markup intact — including the `dir="rtl"` + `<bdi>` start-truncation, which is **load-bearing**: the tail is the only part distinguishing `dashboard-01` from `dashboard-02`. Its behaviour moves into `BlockPreview`'s subtree rather than a page-level handler.

`example-card.astro`'s Preview/Code toggle becomes a small client component wrapping server-rendered children — the highlighted code is server output (§4.4), and only `aria-selected` and `hidden` need state.

### 11.6 No i18n, no RTL

No locales are configured, so `i18n-ui`, `LanguageSwitcher` and `localeSwitch` are not reproduced. Consequently every `rtl:` variant and `[dir="rtl"]` rule in the ported chrome is dead code and dropped — §11.3's `rtl:-scale-x-100` and §8.3's two `[dir="rtl"]` code rules. The **logical** properties (`ms-auto`, `text-end`, `ms-[0.35em]`) stay: they are unconditional and simply correct. The one `dir="rtl"` that survives is §11.5's `install-control` start-truncation, which is a typographic trick, not a locale.

### 11.7 404 behaviour, and why there are no redirects

**Status codes are already correct and need no work.** Every miss probed returns 404 with the same 21,026 B page: root, `/docs/*`, `/docs/components/*`, `/components/*`, `/blocks/*`, `/blocks/<group>/*`, `/og/*`. Astro emits `404.html` at the output root and Vercel serves it with a 404 status.

**What *is* broken is chrome.** The live 404 renders Blume's **default** header — logo plus GitHub only — because the generated `404.astro` never receives the `layout={{ Header }}` override the six custom pages pass (§14.2's second patch hunk). Measured against the landing page: 7,565 B / 2 links versus 9,882 B / 8 links, and **zero `<nav>` elements**. The site's five tabs and the account link are absent, so the page is a dead end with one button out.

**1. Content reproduced verbatim; chrome upgraded for free.** The 6xl muted "404", the `Page not found` h1, "We couldn't find the page you're looking for.", and an accent button to `/` are kept exactly. `app/not-found.tsx` sits under the root layout, so the real header arrives **without being asked for** — correcting the defect as a side effect of the port's structure rather than as work.

`noindex` must be emitted **explicitly**: Blume sets it and Next does **not** add it to `not-found.tsx` automatically.

The `<title>` gains the suffix: **"Page not found — SevenUI"**. §15.8 set that rule over the 85 live routes and the 404 sat outside that audit, but a rule with an exceptions list stops being a rule.

**2. Two `not-found` boundaries: root and docs.** `app/docs/not-found.tsx` renders inside the docs layout, so a miss arrives with the sidebar — **the only thing on the site that lists all 65 primitives**, and the actual recovery affordance for what a docs miss overwhelmingly is (a mistyped or stale primitive slug). Today's bare page offers nothing. The sidebar renders with no active item, which under §5's one-way group force simply means no group is opened.

Boundaries for the gallery and `/blocks` are **declined**: 10 static pages and a manifest-driven category set respectively, where a sidebar's recovery value is low, while each extra `not-found.tsx` is one more surface §17 must verify.

**3. The four base-relative MDX links are fixed at source and pre-shipped to `main`.** Blume rewrites base-relative markdown links through `basePath`, so `](/components/field)` is served as `href="/docs/components/field"`. Four links in three files are written that way: `docs/index.mdx:53` (`/components/field`) and `:56` (`/installation`), `docs/components/field.mdx:55` (`/components/form`), `docs/components/form.mdx:39` (`/components/field`). With no `basePath` (§3) they would be left exactly as written and point outside the docs tree.

Two premise corrections matter here. **They 404 — they do not land on a wrong page.** The gallery namespace holds exactly 10 pages (`accordion`, `badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `select`, `switch`, `tabs`) and neither `field` nor `form` is among them; verified live, all three targets 404. The genuinely dangerous collisions — `/components/button` and `/components/dialog`, which return **200 on the wrong page** — belong to `search.popular`, and §9.6 already closed them.

The corpus already writes **41** internal links with a literal `/docs/` prefix against these **4** without one, so the four are an inconsistency, not a convention. And Blume's rewrite is **idempotent** — verified live: `](/docs/components/label)` renders as `/docs/components/label`, not double-prefixed — so rewriting the four at source produces **byte-identical HTML today**.

That is what makes it a better tool than a redirect: it repairs all three surfaces at once (HTML, `/<route>.md`, and `llms-full.txt`, which currently carries 3 occurrences of `](/components/`), where a redirect would repair only the first. §4.6's build-time link validator then keeps them fixed.

**4. No redirects are declared; `vercel.json` stays rewrite-only.** `/installation` and `/theming` have 404'd ever since the `/docs` base path landed in Wave 2, so a redirect now is a **new feature rather than parity** — added during a cutover whose entire point is that regressions stay attributable. A blanket rule for `/components/*` is impossible anyway, because the gallery occupies that namespace; what remains is per-path mappings, which is a maintenance trap. Nothing external can be linking to a working `/components/field` or `/components/form`, because neither was ever a valid URL on this site. §3's "`vercel.json` is the rewrites' single owner" is untouched.

**5. A fixed negative-path list joins the sweep** — §17.4.

## 12. Clerk, `/account` and `/pro`

**1. `@clerk/clerk-js` stays, client-only. No `@clerk/nextjs`, no `middleware.ts`.** `/account` is the only authenticated surface — one page out of the 110 §17.1 inventories as of 2026-09-21 — and `clerkMiddleware()` would run in front of the whole deployment to serve it. §10 has just finished keeping the request path clean for ISR; putting a middleware function in front of `/blocks`, `/r/*.json` and the agent endpoints to authenticate one page inverts that.

What the Next.js package would genuinely buy, stated so the decline is informed: `@clerk/nextjs` loads `clerk-js` from Clerk's CDN, and **that** build ships the UI components, so `<SignIn />` could mount inline instead of redirecting to Clerk's hosted page. That is a real capability. It is declined because the hosted redirect is a deliberate decision from the pro-infrastructure work, it works today, and `/account`'s signed-out state is designed around the click-to-redirect (an automatic bounce was rejected there as hostile).

**2. The laziness is two mechanisms, not one, and both survive.** A dynamic `import()` in `lib/clerk.ts`, so the bundle code-splits out of every page that imports the module (the header does, on every page); **and** a `__client_uat` cookie gate checked *before* calling `getClerk()`. Clerk sets that cookie (`"0"` when signed out) and it is not httpOnly, so it is the fastest signed-in hint available without paying for Clerk at all. Measured: `dist/clerk.mjs` is **1,525,892 bytes (1.46 MiB)**. The cookie gate is what keeps that off the common case; the dynamic import alone would not — it only moves the cost into a second request the header would still make.

**The gate belongs in `lib/clerk.ts`, not at each call site.** Three callers exist (header, `/account`, `/pro`) and only one gates today. `/account` is the correct exception: a visitor who navigated there deliberately should load Clerk regardless of the hint.

**3. `/account` stays a static shell filled client-side.** A server component cannot fetch the licenses: the request carries a Clerk session cookie, and turning it into the Bearer token `/api/me/licenses` expects needs a server-side Clerk context — which is `auth()`, which is `@clerk/nextjs`, which is decision 1. The three independent failure surfaces are preserved: a Clerk boot failure renders the whole-page retry, a licenses failure stays inside its own box with its own retry, and identity/sign-out resolve separately from licenses.

Ported to JSX, `account.astro`'s 340 lines of HTML-as-strings collapse: the `innerHTML` assignments, the manual escaping of interpolated user data (`clerk.user.fullName` goes straight into a template literal today) and the `querySelector`-then-`addEventListener` rebinding all disappear. Same shape as §9's sanitizer finding — work that exists only because the output path is `innerHTML`. `<AccountPanel>` is a client component with real state for four views (signed-out, identity + licenses loading, licenses, error). The static half — the `l-row` / `l-marks` crop-mark frame and the keyframes — stays static.

**4. Anonymous visitors stop paying for Clerk, on both `/account` and `/pro`.** Neither checks `__client_uat` today, so an anonymous visitor to either downloads 1.46 MiB; on `/account` they watch a skeleton until it lands, and on `/pro` — the marketing page a cold visitor lands on from an ad — the bundle is paid purely to decide there is no email to pre-fill.

The fix: **the signed-out hero is server-rendered as the default.** With no `__client_uat` cookie the signed-out state is the correct terminal state, so Clerk is never loaded and `/account` is zero-JS for anonymous visitors. The skeleton survives only on the cookie-present path, where it is honest. `/pro`'s buy-link enhancement takes the same gate. The cookie can also be absent because cookies are blocked — in which case Clerk could not have established a session either, so "signed out" remains correct.

**5. `/pro` is fully public; its Clerk use is progressive enhancement only.** `enhanceBuyLink` pre-fills `customer_email` and `reference_id` on the checkout link for a signed-in visitor; signed-out visitors keep the plain link. Nothing on the page is gated.

**Env.** `PUBLIC_CLERK_PUBLISHABLE_KEY` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`. It is the site's **only** environment variable — a full grep of `import.meta.env` across `lib/`, `components/` and `pages/` returns this one line plus `BASE_URL`. `.env.example` and the Vercel project both need the rename at cutover, and a missing value is **silent**: `new Clerk(undefined)` fails inside the lazy path, which the header swallows by design.

## 13. DOM vocabulary and site-wide attributes

### 13.1 `data-theme`

Frozen (§8.1). Written by `next-themes` in the root layout.

### 13.2 `data-pm` becomes a site-wide contract

Mechanism today: `localStorage["package-manager"]` → `data-pm` on `<html>`, written by an `is:inline` pre-paint script in `blocks-prefs.astro`, selecting one of four SSR'd commands through `.pm-only-*` CSS rules. **`is:inline` is load-bearing** — bundled, it runs after first paint, which is the flash it exists to prevent.

§6.1 forces the applier out of `/blocks`, so **the pre-paint script and the `.pm-only` rules move to the root layout and `globals.css`**, and `data-pm` becomes a documented site-wide attribute beside `data-theme`. `copy-command.tsx` keeps its shape but takes its command from the same four-command set, so all three surfaces agree.

**The CSS-selection mechanism is unchanged, deliberately:** all four commands ship in the HTML and CSS picks one. The React-shaped alternative — read `localStorage` in an effect and re-render — reintroduces exactly the post-hydration repaint the inline script was written to avoid, and would do it once per card.

### 13.3 `data-blume-*` is renamed

Surviving hooks become `data-sevenui-*`, and `#blume-content` becomes `#content`. §17's automated diff extracts visible text, heading hierarchy with anchor IDs, and link targets — **not arbitrary attributes** — so the `data-*` half of the rename costs nothing at the gate. **The claim that the rename as a whole costs nothing is a spec text defect, corrected here** (§17.6 #38 is the house precedent): `#blume-content` is the skip link's `href`, and link targets are one of the three things §17.2's extractor reads, so the id is a declared diff — §17.6 #5 carries it, on all 109 routes (§17.1's dated count, 2026-09-21). The reason for the rename is untouched and never rested on the gate: leaving `blume` in the DOM of a site that no longer contains Blume misleads every future reader.

§7.2's carried-over grid rule lands as `[data-sevenui-example]`. Most of the vocabulary simply vanishes with its script: `data-blume-nav-open`, `-nav-toggle`, `-header`, `-theme-toggle`, `-banner*`, `-search-open`, `--blume-drawer-top`.

**The one thing that does not get renamed is not a DOM attribute:** the `blume-theme` `localStorage` mirror write (§20.1). That is a cross-repo contract with the pro deployment.

## 14. Retirements, dependencies and configuration

### 14.1 `publicHoistPattern` is removed, and the proof is named page by page

The comment in `pnpm-workspace.yaml` states the reason exactly: *"Blume SSR prerender externalizes registry deps; hoist them so Node's ancestor walk from apps/web/dist can resolve them."* Next.js has no equivalent step — server code is bundled or traced, client code is always bundled, and nothing resolves a bare specifier from a build-output directory at runtime.

**The repo already contains the control case.** `cn` is imported directly by **65 registry source files**, is **not** in the hoist list, is unreachable from `apps/web` by any `node_modules` ancestor walk, and the site builds today — because Vite bundles it. Direct imports therefore never needed the hoist; only Node's runtime resolution from `dist/` did. Conversely `clsx`, `tailwind-merge` and `react-is` are **not in `packages/registry/node_modules` at all** — they are transitive and exist only because the hoist put them at the workspace root, which has been masking them.

Against that, one real risk: the hoist shapes the **whole workspace's** `node_modules`, and `packages/registry`'s 525 tests resolve from that same layout. So the proof is three steps, run once during the migration:

1. Delete the block, then `rm -rf node_modules && pnpm install`.
2. Production build, and confirm the five surfaces exercising the heavy dependencies actually render in the output — **`carousel`** (embla-carousel-react), **`chart`** (recharts), **`calendar`** (react-day-picker), **`resizable`** (react-resizable-panels), and the **`field-rhf`** demo (react-hook-form). Naming the pages is the point: removing the hoist wrongly fails at **build** time in one import, and "the build passed" is not evidence when the failing page might not have been built.
3. `pnpm test` (the registry suite, the other consumer of that layout) and `pnpm test:smoke`.

### 14.2 The Blume patch, generated directories and tsconfig

**`patches/blume@1.5.3.patch` and `patchedDependencies` are deleted.** The patch carries **two** hunks, not one: the missing `rafThrottle` import in `content/Component.astro` (the bug; upstream PR blume#245) **and** a `layout?: Record<string, ComponentOverride>` prop on `PageLayout.astro` resolved through `resolveSlot(layout.Header, Header)` — which is a *feature* six pages depend on (`/`, `/pro`, `/account` and all three `/blocks` pages pass `layout={{ Header }}`). Anyone reading `patchedDependencies` as "a vendor bug we work around" would have deleted half a capability. Both hunks die anyway: the fix because §7.3 removes the only caller, the feature because the port's layouts are its own, where a header override is not a capability to be granted but the default. **The upstream PR stands on its own and stays submitted**; this repo simply stops carrying the patch.

**Generated directories.** `apps/web/.blume/` and `.blume-verify/` are deleted. The root `.gitignore` drops both entries; `apps/web/.gitignore` contains nothing but a duplicate `.blume-verify/`, so that **file** is deleted rather than edited. `dist/` is replaced by `.next/`. `apps/web/public/r/` stays — it is the registry build output and predates Blume.

**`tsconfig.json`: the typecheck widens from one file to the whole app.** Today `include: ["blume.config.ts"]` with no `extends`, so `pnpm typecheck` in `apps/web` checks **one file** — the `.tsx` components, the `lib/*.ts` modules and every `.astro` frontmatter are unchecked by it (Blume compiles them separately under its generated tsconfig). The new file is Next's generated tsconfig with `paths` carried over verbatim (`{"@/*": ["../../packages/registry/*"]}` is the frozen registry import convention and does not move) and the **default `include`**, covering the whole app.

**The include is not narrowed to keep the first run quiet.** Narrowing would make today's blind spot permanent in the new repo, which is exactly the silent debt a cutover should not carry forward. Measuring the error count is the first task of this step, and clearing them is part of the migration rather than a follow-up.

Two facts that come with the alias pointing outside the app root: `outputFileTracingRoot` must name the workspace root for Vercel's file tracing (§3), and if the build ever falls back to webpack, `experimental.externalDir` is the escape hatch.

### 14.3 `blume.config.ts` and `components.ts` are deleted; every resident has a named home

`components.ts` goes entirely: `defineComponents({ layout: { Header, Sidebar }, mdx: { InstallCommand } })` has no counterpart — the layouts are ours (§11) and the MDX component set is passed at render time (§4, §6).

| `blume.config.ts` resident | New home |
|---|---|
| 65-entry sidebar order + collapsible Primitives group | `lib/docs/nav.ts`, set derived, order slug-sorted (§5) |
| `search.popular` (6 base-less routes) | `lib/docs/search.ts` with literal `/docs/` prefixes (§9.6) |
| GA4 `analytics.scripts` | root layout, `next/script` + `afterInteractive`, production-gated (§14.5) |
| `title`, `description`, `deployment.site` | `lib/site.ts` (§14.6) |
| `logo: "assets/logomark.svg"` | the existing `Logomark` React component (§14.6) |
| external-link `rel` post-build pass | dies; `rehype-external-links` for MDX + 9 literal attributes (§4.6) |
| `basePath: "/docs"` | nothing — `/docs` is a literal segment (§3) |
| `content: { root, pages }` | nothing — the tree stays at `apps/web/docs/` (§4.1) |
| `examples: { source, css }` | nothing — demos resolve by dynamic import (§7.1) |
| `theme: { accent, radius, mode }` | `accent`/`radius` die with Blume's token layer (§8.3); `mode: "system"` becomes `next-themes`' `defaultTheme` (§8.1) |
| `github: { owner, repo }` | `lib/site.ts`, read by the header link and §15/§16's source URLs |
| the `sevenui-external-links` integration wrapper | dies with the pass it hosted |

### 14.4 Dependency changes

- **`@lucide/astro` → `lucide-react`, verified rather than assumed.** Both are at **1.41.0**, generated from the same upstream set: `@lucide/astro` ships 1,808 icon files and exports `export * as icons`; `lucide-react`'s `icons` record has 1,807 Pascal-cased entries. The keys the **live** manifest actually uses are manifest-derived like everything else in that file, so the rule binds and the number is dated: **four as of 2026-09-21** — `layout-dashboard`, `megaphone`, `sparkles` and `shopping-bag`, resolving as `LayoutDashboard`, `Megaphone`, `Sparkles` and `ShoppingBag` in both. Three when this was written; `shopping-bag` arrived with the `ecommerce` group. `lucideIcon()` ports with one import line changed; `kebabToPascal` and the loud `throw` on an unknown key survive verbatim — that throw is what makes a pro-repo typo fail the web build instead of rendering a blank card. **It is also why this enumeration going stale cost nothing:** the keys are validated at build time, so a fifth group either resolves or fails the build loudly, and the list above is documentation of what the manifest holds rather than anything the site depends on. The same drift on a line the build does not check would not have been harmless — which is the argument for the `throw`.
  **One boundary rule comes with it:** `import { icons }` pulls the whole record, so it must stay **server-only** — `lib/pro-manifest.ts` and the `/blocks` pages, which §11 keeps as server components. A client component importing it would defeat tree-shaking and ship ~1,800 icons. The manifest's keys are owned by the pro repo and therefore genuinely dynamic, so the full record is the right shape; it just may not cross the client boundary.
- **`zod`** is added (§4.2).
- **`react-hook-form` moves from `devDependencies` to `dependencies` in `packages/registry/package.json`.** This is one of the map's **three** approved exceptions to "no registry changes" (§19), scoped to a single line. `demos/field/field-rhf.tsx` imports it, that demo is one of the live 137, and under §7 it renders **inline in a production docs page** — so a production page depends on a dev dependency. It works today only because Vercel installs dev dependencies; a `pnpm install --prod` build breaks. The version range is unchanged, so `check-registry.mjs`'s range check still passes and no registry item's `dependencies` array changes. **The other exception touches three further registry files** (§17.6 row 29).
- `blume`, `@lucide/astro` and `@vercel/analytics` leave `apps/web/package.json`. `shadcn` stays a devDependency — §17's smoke test pins its local binary deliberately.

### 14.5 Analytics

Two scripts today — the gtag loader and an inline `gtag('js')` / `gtag('config')` pair, both in `<head>`, both gated on `import.meta.env.PROD`. They become `next/script` with `strategy="afterInteractive"`. The timing shift (after hydration rather than async in head) changes nothing measurable: GA4's enhanced measurement tracks history changes itself, which is why Blume's own `Analytics.astro` adds SPA pageview capture for PostHog and not for GA4.

**The production gate is preserved** (`process.env.NODE_ENV === "production"`) — without it, local development starts writing into the live property `G-8702Z28SMN`.

Nothing else in `Analytics.astro` comes along: `analytics.vercel` is not enabled and PostHog is not configured.

### 14.6 `lib/site.ts` and dead assets

**`lib/site.ts`** holds `name`, `description`, `url`, the GitHub owner/repo and §15.8's title builder. It is read by the root layout's metadata and `metadataBase`, §16's OG route, §15's text endpoints, `/agent-readability.json`, `robots.txt` and `sitemap.xml`. Three surfaces need the same strings; without one module each would hardcode them.

**`apps/web/assets/` is deleted** — a Blume-shaped convention directory holding two unnecessary files. `assets/logomark.svg` is byte-identical in path data to `public/logomark.svg` **and** to `components/logomark.tsx`; the header switches to the `Logomark` component, which the footer and landing page already use. `assets/combination-mark.svg` and `components/combination-mark.tsx` have **no consumer anywhere in the repo**, so **three `.tsx` files port, not four.**

`public/logomark.svg` **stays** — `avatar-demo` and `hover-card-demo` both load `/logomark.svg`, and under §7 they render in the main document where that path resolves. `public/icon.svg` stays as the favicon (light/dark fills hardcoded inside the file).

**`component-wall.astro` carries a dead special case:** `SPECIAL_NAMES` maps `"form-rhf": "Form (RHF)"`, but `form-rhf` was removed from `registry.json`. It goes. The wall's row-fill property still holds: 65 `registry:ui` items plus the trailing docs cell = 66, divisible by 2, 3 and 6.

### 14.7 Inventory of retired inputs

Things that stop being read, are deleted, or become dead — recorded so none is mistaken for live code later.

| Input | Status |
|---|---|
| `blume` package, `blume.config.ts`, `components.ts` | deleted (§14.3) |
| `patches/blume@1.5.3.patch`, `patchedDependencies` | deleted (§14.2) |
| `pnpm-workspace.yaml` `publicHoistPattern` | deleted (§14.1) |
| `apps/web/.blume/`, `.blume-verify/`, `apps/web/.gitignore` | deleted (§14.2) |
| `apps/web/assets/`, `components/combination-mark.tsx` | deleted (§14.6) |
| `packages/registry/demos/theme.css` | **stays on disk, unused by the site.** Its only site consumer was `blume.config.ts`'s `examples.css`. Registry changes are out of scope so it is not deleted — and it is not inert either: `check-registry.mjs` reads it to verify the published `theme` item. §7.2 already moved the three things inline rendering needs out of it. Written down here and in a comment at the `check-registry.mjs` read site; **not** in a comment inside the file itself, which would be a registry edit |
| `/blume-assets/*` | **404s live** and is not reproduced. Blume prerenders the route, but the live site returns 404 and `sitemap.xml` contains zero `blume` entries |
| WebMCP (`<blume-webmcp>` + 2,709 B module) | not ported (§15.14) |
| `rafThrottle` resize listener, postMessage height protocol, frame `ResizeObserver`, `100svh` viewport clamp | retired with the iframe (§7.3) |
| `ClientRouter`, `SWAP_STYLESHEET_INIT_SCRIPT`, `syncDrawerInert`, `astro:page-load` re-binds, `example-card`'s delegated-once pattern | retired with Astro (§11.1) |
| `<Banner>`, `BANNER_INIT_SCRIPT`, its dismiss branch, `--blume-drawer-top` | **dead code today**; deleted (§11.4) |
| Blume `page`-mode nav panels, `collapsed: false` | unreachable today; not ported (§5) |
| `blume-client-data` JSON island | emitted on docs pages by Blume's `RootLayout`; **nothing reads it**; deleted (§11.1) |
| 69 `/<route>.mdx` endpoints | dropped (§15.1) |
| `⌘J` search binding | dead today; dropped (§9.5) |
| `rtl:-scale-x-100`, two `[dir="rtl"]` code rules | unreachable; dropped (§11.6) |
| `--color-action`, `--color-action-foreground`, `--color-code`, `--radius-blume` | zero consumers; die (§8.3) |
| `body { background-* }` base rule | resolves to `none`; dropped (§8.3) |
| posthog / plausible / internal reporter / `blume:track` sinks | unconfigured or listener-less; dropped (§11.3) |
| `@vercel/analytics` | not enabled; leaves (§14.5) |

**A stale code comment worth not copying:** `blocks-theme-dock.astro` cites "the same trap `renderProBlocks` in `pages/blocks/index.astro` works around"; there is no `renderProBlocks` anywhere in the repo. The trap it names (ClientRouter runs a module once) is real and is why the dock re-binds on `astro:page-load` — and that whole class of workaround dies with `ClientRouter`.

## 15. Agent-facing and SEO surface

**Two things the current deployment does *not* do, despite shipping the code for them:** the `x-markdown-tokens` response header (Blume's endpoint sets it; a static build writes the body to disk and the header is lost — verified absent in production), and `Accept: text/markdown` content negotiation (Blume ships dev middleware and a Vercel routing path; the static deployment runs neither — `Accept: text/markdown` on a docs page returns 157 KB of HTML). Neither is restored (§19).

### 15.1 Endpoint inventory

| Endpoint | Count | Decision |
|---|---|---|
| `/<route>.md` | 69 | Reproduced |
| `/<route>.mdx` | 69 | **Dropped** |
| `/llms.txt` | 1 | Reproduced, scope widened (§15.4) |
| `/index.md` | 1 | Reproduced — shares `/llms.txt`'s body, its own URL (§15.2) |
| `/llms-full.txt` | 1 | Reproduced, gains one section (§15.5, §17.6 #26) |
| `/sitemap.xml` | 1 | Reproduced, every `/blocks` group/category route added (§15.7) |
| `/robots.txt` | 1 | Reproduced verbatim (§15.6) |
| `/agent-readability.json` | 1 | Reproduced, two fields corrected (§15.11) |
| `/rss.xml`, MCP routes | 0 | Already 404; nothing to do |

**The `.mdx` mirrors are dropped because nothing reaches them.** No page links one, no `<link>` declares one, `agent-readability.json` advertises only the `.md` pattern, and the `.md` variant is a superset — same body, with `<Component>` downleveled to source. They exist because Blume emits them by default, not because the site chose them. 69 URLs leave the frozen contract; that is **one** line on the intended-diff list, not 69.

The reproduced set is therefore **75 text/JSON endpoints** — 69 `.md` mirrors, `/llms.txt`, `/index.md`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`, `/agent-readability.json` — one more than the **74** §17 recorded, by coincidence, since the live total is 143 (§17's inventory missed the 69 `.mdx` routes, `/agent-readability.json`, and `/index.md`). **Re-run the inventory generator after the drop; do not rely on the coincidence.**

### 15.2 The `.md` slug rule is not a quirk, and `/index.md` is `llms.txt`

Two premises corrected against source:

- Blume's generated endpoint maps a route to a slug with one expression: `route === "/" ? "index" : route.slice(1)`. `/docs` is a route in `raw-markdown.json`, `/docs/index` is not — so **`/docs.md` returns 200** (2,634 B, verified) and `/docs/index.md` 404s because nothing claims to serve it. **There is nothing to normalize.** Custom `.astro` pages produce nothing (`/components.md`, `/blocks.md`, `/pro.md`, `/privacy.md` all 404).
- **`/index.md` is `llms.txt` byte for byte** (both 9,299 B, verified). `buildRawMarkdown` has no MDX source for a landing-page home, so it substitutes `buildLlmsIndex()`. The two endpoints share one generator, and always will — so §15.4's growth applies to both.

### 15.3 `<InstallCommand>` serializes to all four commands

The tag currently reaches agents **verbatim** on 68 pages, so the Installation section of every primitive page is empty of instruction for a Markdown reader. **This is our gap, not Blume's:** its serializer registry is `Callout, Steps, Tabs, TypeTable, YouTube` plus `Component`, and it ships a documented extension point — `ai.markdownComponents` — that `blume.config.ts` never used. Which also means the port has no migration problem here: it writes both serializers itself.

The port emits one fenced `bash` block holding all four commands (npx / pnpm dlx / yarn dlx / bunx). This is the Markdown counterpart of §6.1's package-manager bar and a **deliberate, spec-recorded improvement over parity** — one uniform intended diff across 68 pages, in both `/<route>.md` and `llms-full.txt`.

`<Component>` keeps today's behaviour exactly: the example's source as a fenced block in the example's language. Verified non-defect: the fenced source uses `@/registry/base/ui/*`, which is what the page's own Code tab shows, so the two agree; only the hand-authored Usage block says `@/components/ui/*`, as it should.

Per §6 the authored surface was exactly two components when this was written, so the serializer registry was closed at two; §11.3 then added a third. **It is closed at three** — `Component`, `InstallCommand`, `PrimitiveIndex` — which is what `lib/docs/elements.ts` asserts on every build. Blume's other five have zero uses and are not ported. `<PrimitiveIndex />` serializes to the same link list it renders (one row per primitive, filtered and sorted on `route`, root-relative hrefs): `docs/components.mdx` is six lines whose whole body is that tag, so leaving it unrecognised would ship `/docs/components.md` as front matter plus raw JSX — the defect this section exists to repair, newly created on a page this migration adds (Stage 8, Ruling 61).

**`/<route>.md` keeps its front matter; `llms-full.txt` keeps stripping it.** Today `.md` emits the verbatim YAML block while `llms-full.txt` strips it and writes `# <title>` + `Source: <url>`. The split is kept: YAML front matter is the standard metadata carrier for a standalone Markdown document and flattening it loses `description` as structured data, while inside `llms-full.txt` the same block would be noise — 69 documents are concatenated there (68 in the pre-cutover fixture; §15.5 adds a 69th) and the `# <title>` / `Source:` pair is what separates them.

### 15.4 `/llms.txt` gains `/components` and every `/blocks` route

Today it mirrors the docs nav tree only (`## Docs`, `## Primitives`), because `buildLlmsIndex` walks Blume's navigation and the gallery and blocks surfaces are not Blume page records. The index gains both in full: `/components` plus its 10 component pages, and **every** blocks route — a count that is manifest-derived and drifts (18 when this was written, **24 as of 2026-09-21**), so the rule is what binds and not the number. It also gains `/docs/components`, §11.3's new page, without which the index would cover 68 of the 69 documents `llms-full.txt` carries (Stage 8, Ruling 69). And it gains **two sections**, `## Components` and `## Blocks`: listing `/blocks/marketing/hero` under `## Primitives` would misdescribe it, since that heading names the 65 Base UI components. **42 new lines as measured on 2026-09-21** (36 links, 2 headings, 4 blanks), and `/index.md` grows with it (§15.2).

The blocks half is only affordable because of §15.7: `sitemap.xml` is already fed from §10's manifest `fetch`, whose Data Cache entry is URL-keyed, so `llms.txt` reads the same entry for **no additional fetch and no additional ISR surface** — one more `revalidate: 300`. Listing those routes in the sitemap and not in `llms.txt`, from the same data, would have been arbitrary.

The `## Docs` heading must be **synthesized literally** — it is Blume's hard-coded string for loose root pages, not a configured label, so §5's nav tree keeps loose pages distinguishable from grouped ones for the emitter's benefit.

### 15.5 `/llms-full.txt` gains a 69th section, `/docs/components` (§17.6 #26)

The fixture — the pre-cutover baseline this file is diffed against — is 297,404 bytes, 68 sections, **59% fenced code** (175,231 bytes across 214 fences) — measured, confirming that demo sources dominate. §11.3's `/docs/components` is authored as MDX like every other docs page, so it is concatenated in here the same way as the other 68: the shipped file gains a 69th section, taking it to 315,554 bytes (measured on 2026-09-21) — one new intended diff, not an unchanged reproduction. Otherwise it stays whole: the file's purpose is the entire corpus in one fetch; dropping the demo sources (~120 KB remaining) would reduce it to a longer `llms.txt`, and a consumer who asks for this file is asking for everything.

### 15.6 `robots.txt` is reproduced verbatim, permanently

```
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /

Sitemap: https://sevenui.dev/sitemap.xml
```

Four lines, byte-identical. The `Content-Signal` stance is a policy statement, not a technical detail, and revisiting it during a framework cutover would add a diff the gate has to be told to expect for no migration reason. **No post-cutover follow-up is opened either** — the stance is settled, not deferred.

### 15.7 `sitemap.xml` gains every `/blocks` route and is ISR'd

Live today: 85 `<loc>` entries, bare — no `<lastmod>`, `<changefreq>` or `<priority>`. It carries `/blocks` but **none of its group or category routes**, so every one of them is in no sitemap at all — 17 pages when this was written, **23 as of 2026-09-21**; the figure is manifest-derived and `scripts/route-inventory.mjs` is the only place it is ever computed. Next's `sitemap.ts` reads §10's manifest through the shared Data Cache entry and declares `revalidate: 300`, taking the count to **109 as measured on 2026-09-21**, including §11.3's new `/docs/components`, which arrives automatically because it is authored as MDX.

**A site-wide rule is attached: no `revalidate` anywhere exceeds 300 seconds.** That matches §10's figure rather than introducing a second number, and it binds any future ISR surface.

**Entry order is not a contract.** Blume's current collation is visibly odd (`alert-dialog` before `alert`; `/components/tabs` before `/components`); the port sorts with a plain `localeCompare`. §17's criterion for this file is **URL-set equality, not byte identity** — which is the right criterion regardless, since every `/blocks` route addition changes that set on purpose — 17 when this was written, **23 as of 2026-09-21**.

### 15.8 Titles change site-wide; JSON-LD goes bare

JSON-LD is reproduced: `@graph` with a `WebSite` node plus a `TechArticle` node on every page except the landing page, which carries `WebSite` alone, plus §11.3's `BreadcrumbList` as a third node **on the 91 pages that have a trail** — docs and `/blocks` less their two section roots (§17.6 #23, measured 2026-09-21). The 11 gallery pages and the 5 standalone pages carry two nodes, not three. `TechArticle` on a listing page like `/blocks` is imprecise schema, but that is not a migration question and is left alone.

The two inconsistencies here resolve in **opposite directions**.

**Titles.** The original audit covered the **85 sitemap-listed** routes: 68 ASCII hyphens (`Button - SevenUI`, Blume's default), 16 em dashes (`Blocks — SevenUI`, hand-written Astro), 1 with no separator (`SevenUI`, the landing page). **Re-measured over production's 108 live routes on 2026-09-21 the split is 68 / 39 / 1** — the em-dash count was short by the same 23 `/blocks` group and category routes the sitemap never listed, so this is §17.6 #18's defect a second time on a second field: one sitemap-scoped audit, two undercounts, both of exactly 23. The rule is now:

> Every `<title>` ends with `SevenUI`, separated by an em dash. The landing page is the sole exception and stays bare `SevenUI`.

**No route violates it today, and that is this document's own doing.** When this section was written 10 did — the gallery component pages, which read `Button — SevenUI Components` — and §20.3 item 1 then shipped exactly that change to `main` ahead of the migration branch. Production now serves `Button Components — SevenUI` on all 10 (verified 2026-09-21 on `/components/button`, `/components/dialog` and `/components/tabs`), so **0 routes violate the rule and the port changes none of them**. A spec sentence invalidated by an action the same spec ordered is worth naming as such: the pre-ship list did its job, and the record of what it fixed has to move when it does. `og:title` and `og:image:alt` follow `<title>` on every page (verified), so they move with it; `<h1>` is bare everywhere and does not move.

**JSON-LD `headline`/`name` go bare on every page.** Today docs pages emit `"Button"` and gallery pages `"Button — SevenUI Components"`. The suffix belongs to the browser tab, not to the article: schema.org `headline` naming every article `… — SevenUI` is wrong. So the `TechArticle`-bearing non-docs pages drop the suffix — **39 as of 2026-09-21**: the 16 sitemap-scoped pages this section was written against, plus the **23** `/blocks` group and category pages the sitemap never listed (§15.7), a count that is manifest-derived and therefore dated, with §10 as its owner. The 68 docs pages already comply. The result aligns with the `<h1>` on every page.

The title builder lives in `lib/site.ts` and is applied in **one** place (§16.8).

### 15.9 Page titles stay bare in every agent artefact

The suffix rule governs `<title>`, `og:title`, `og:image:alt`, `twitter:title` and `twitter:image:alt` — the five fields that name the page to a human or a crawler, and no more. (This sentence read "`<title>`, `og:title` and `og:image:alt` only" until 2026-09-21: the two `twitter` fields were always suffixed, first as Next's implicit fallback from `openGraph` and then explicitly, and the sentence had simply never been checked against the emitted head.) The three places a page title appears in agent output keep the **bare** form: `llms.txt` link text, `llms-full.txt` section headings, and the `.md` front-matter `title:`. `llms.txt` already names the site once in its own `# SevenUI` header; repeating it on every listed route is pure token cost. **That was 85 lines when this was written and is no longer:** §15.4 added `/components`, its 10 gallery pages and **every** blocks route, so the count now tracks the manifest and grows with it — §17.6 #19's 42 new lines as of 2026-09-21, with §10 owning the blocks half.

### 15.10 The docs page-actions rail is ported whole

Found in the TOC aside and owned by no furniture ticket. Agent-facing, so it is decided here. All four items are ported, with all six chat providers:

1. **Edit on GitHub** → `https://github.com/useui/sevenui/edit/main/docs/<slug>.mdx`, built from `lib/site.ts`.
2. **Scroll to top.**
3. **Copy as Markdown** — fetches the page's `.md` URL and writes it to the clipboard. **This is the only visible consumer of the `.md` endpoints**, which is the main reason §15.1 reproduces them.
4. **Open in chat** — a dropdown over v0, ChatGPT, Claude, T3 Chat, Scira and Cursor. Hrefs are built client-side, so the static HTML ships anchors without one; the prompt is `Read <absolute .md URL> so I can ask you questions about this page.`

The rail stays **docs-only**, as today.

### 15.11 `/agent-readability.json`

Live, 565 B, pointed at from every docs page by `<link rel="describedby">`. Reproduced, with two fields corrected:

- `"generator": "blume@1.5.3"` → `"sevenui-web"`. Post-cutover the current value is simply false.
- `"artifacts.markdown.pattern": "https://sevenui.dev/{route}.md"` → `"https://sevenui.dev/docs/{route}.md"`. The universal pattern is **already a lie** — verified: `/components/button.md`, `/components.md`, `/blocks.md`, `/pro.md` and `/terms.md` all 404, because `.md` mirrors exist only for the 68 docs routes plus `/`. Nothing noticed because `llms.txt` never listed those routes; §15.4 makes it list them — 29 when this was written, **35 as of 2026-09-21** (manifest-derived; the rule binds, the number is dated), so the field has to become true.

Everything else — `contentUsage` (which mirrors §15.6's `Content-Signal`), `site`, `repository`, `name`, `description` — is reproduced as-is from `lib/site.ts`. The three per-docs-page `<link>` tags (`describedby` ×2, `alternate type="text/markdown"`) are reproduced unchanged and stay **docs-only**, verified absent on `/`, `/components/button` and `/blocks` today.

### 15.12 The newly-listed routes do **not** gain `.md` mirrors

`llms.txt` lists them as URLs; an agent that wants their content reads the HTML. Synthesizing Markdown for a gallery page is its own design problem — the page is a live component grid, not prose, so the output would be either empty or newly invented content to maintain. For `/blocks` it is worse: the previews are license-gated iframes served from another origin. §15.11's narrowed `pattern` makes the declaration match the reality.

### 15.13 The `x-markdown-tokens` header is not restored

Blume's endpoint sets it (`Math.ceil(length / 4)`, Cloudflare's Markdown-for-Agents convention) and the static deployment drops it. Next's route handler *could* send it, but adding a header that is not live today is a new feature wearing parity's clothes — and a 4-chars-per-token estimate is wrong silently. Declined; a post-cutover one-liner if ever wanted.

### 15.14 WebMCP is not ported

Every docs page ships `<blume-webmcp data-llms="true" data-search="true" hidden>` plus a **2,709-byte ES module** that registers `search_docs` and `get_page` tools on `navigator.modelContext ?? document.modelContext`. That API is an early W3C proposal **no shipping browser implements**, so the module downloads, executes, finds nothing and exits — on every docs page view. It has no visible behaviour and is not a URL, so dropping it costs one DOM-diff entry.

Incidental measurement for §18: the file named `WebMcp.DkviXZb4.css` is **not** a WebMCP cost — it is the site's single stylesheet (399,991 bytes, the only `rel="stylesheet"` on the page), named after whichever component the bundler saw first.

## 16. OG cards

**URL pattern (frozen).** `/og/<pathname minus leading slash>.png`; `/` maps to `/og/index.png`. The `/docs` base path sits *inside* the slug.

**`opengraph-image.tsx` cannot reproduce those URLs** — Next serves it at a generated hashed URL, and file-based metadata *overrides* `generateMetadata`, so the file cannot be kept while pointing `og:image` elsewhere. **A catch-all `app/og/[...slug]/route.tsx` is the only shape** that reproduces the pattern, `/og/index.png` included.

**Pixel-exact parity is not achievable** and is not attempted: today's card is rendered by Takumi (Rust), the Next.js one by Satori. Text metrics and line-breaking differ. Visual parity is the ceiling.

### 16.1 Three premises corrected

Read from Blume's **unminified source**, three of the question's premises fell:

1. **The drawn headline is two rules, not one.** `ogEndpointTemplate` builds from two sources, and a **custom page** wins over a **content route** sharing its path:

   | page kind | headline source | result |
   |---|---|---|
   | content route (68 docs `.mdx`) | `route.title` — the frontmatter title | `/docs` draws "Introduction"; `input-otp` draws "Input OTP" correctly |
   | custom page (17 `pages/*.astro`) | `humanizeSegment(last URL segment)` | `/terms` → "Terms" |
   | `/` | `config.title` | "SevenUI" |

   So the 68 docs cards are **already correct**, and the divergence is confined to **12 of 85 cards**: `/terms` ("Terms" vs *Terms of Service*), `/privacy`, and the 10 gallery pages. An order of magnitude smaller than assumed.

2. **The site-wide description is a Blume *limit*, not a bug.** The endpoint passes `og.description` — one site-level string, typed `string | false`. Blume has no per-page card description at all. Meanwhile 68 distinct descriptions exist in frontmatter (median 64 chars, max 156).

3. **The palette is 2 of 5 colors off, not 5.** Converting the light tokens: `--foreground` = **#0a0a0a**, `--muted-foreground` = **#737373**, `--border` = **#e5e5e5** — exact matches to the card's literals. Only two diverge: `#fafafa` against a `--background` of pure #ffffff, and `#a3a3a3` (footer-right), which has no token at all.

Two further source findings: `accent` is **dead code here** (it only paints the fallback used when no logo is configured, and we configure one), and `textWrap: "balance"` is on the **description** too, not just the headline.

So "reproduce or redraw" dissolved. Composition is kept verbatim; content is fixed.

### 16.2 Composition and type scale: reproduced verbatim

1200×630 PNG, RGB, ~15–18 KB, **light only**. Background `#fafafa`, padding 72, flex column with `space-between`. Header is the logomark alone at 32×32 (viewBox `0 0 64 64`, `currentColor` string-replaced with `#0a0a0a`, inlined as a base64 data URI), no wordmark. Headline `#0a0a0a`, weight 600, `letterSpacing -0.05em`, `lineHeight 1.05`, `maxWidth 1010`, `textWrap: balance`. Description `#737373`, 30px, `lineHeight 1.4`, `marginTop 28`, `maxWidth 900`, balance. Footer: a 1px `#e5e5e5` rule at y=500 spanning x 72–1127, then a 22px row with `useui/sevenui` left in `#737373` and `sevenui.dev` right in `#a3a3a3`. Footer strings come from `lib/site.ts`.

The 76/64/52 size tiers are **dead code for us** — the longest title on the site is "Message Scroller" (16 chars) and even a fully suffixed form stays under the 40-char threshold, so every card renders at 76. Blume's `-0.05em` is, by its own comment, "tuned for Inter" while the card draws in Geist; that mismatch ships today and is kept.

### 16.3 Font: Geist 400 + 600 as local TTFs

Google Fonts serves Geist v5 as **TTF** to a non-woff2 UA — 72,916 B at 400 and 73,048 B at 600, so **146 KB** of `ImageResponse`'s **500 KB** budget (which counts fonts). Read as raw bytes at module scope; `next/font` inside `ImageResponse` is unsupported. Verified by parsing the `cmap`: **729 glyphs**, full latin + latin-ext, including U+2014 and U+2026.

The card **stays on Geist** rather than moving to Inter, per §11.2 — when the deferred Geist-for-the-site effort lands, card and site converge for free. The Google v5 build may differ in metrics from Takumi's embedded copy; absorbed by "visual parity is the ceiling".

### 16.4 Content is fixed: bare title, own description

**Headline: the page's bare title, everywhere.** One rule replaces two. Docs cards stay byte-identical in content; the 12 divergent cards are fixed. The declared `og:title` is **not** used verbatim — the site name already appears twice on the card (logomark, `sevenui.dev` footer) and a third would be redundant. This aligns with §15.8, which took JSON-LD's `headline` bare on every page to match every `<h1>`; the card's headline is a visual `<h1>`.

**Description: the page's own, site description as fallback.** Today the card spends its only content line on a string identical across all 85 cards — production's *resolving* set, 108 live routes less the 23 whose card 404s (§16.6), against the port's 109 (§16.7); the two are different sets, not a change of scope (§17.6 #21) — zero information. `/account` declares no description and is exactly what the fallback is for. This is the single largest quality gain available and the one place where reproducing actively costs something.

**Truncation: description 160, title 64 unchanged.** 160 is the smallest cap that leaves every live description whole (max 156). The cap is a safety net, not a typographic limit: the content box is 486 px (630 − 144 padding) and fixed furniture takes ~195 px, so a 4-line description at 168 px totals 363 px with 123 px to spare — 5 lines still fit. A cap stays because the registry will accept new descriptions later and an unbounded one would overflow silently. `truncate(title, 64)` never fires after the bare-title decision and is kept as-is.

### 16.5 Palette and variants

**The five literals are kept, `#fafafa` included.** The card is light-only and baked at build, so it can never follow the theme — "reading tokens" would be a one-time copy either way, and it would add a build-time coupling from the OG route into `globals.css`, which §8 established as the token owner for the *runtime*. The off-white also does real work: it separates the card from a white chat bubble. The two literals with no token counterpart are named as such.

**No dark variant.** No social platform honours `prefers-color-scheme` for OG images, so a dark card could only be selected by a query param nothing sets — while doubling the surface §17 must verify.

### 16.6 Every block route gets a card, and that forces the rest

**Production bug, pre-existing:** the dynamic block pages ship a **404 `og:image`** — Blume's `customOgRoutes` skips any `[param]` pattern so no card is generated, while `PageLayout` emits the tag anyway. Correcting the count: **17** cards are missing, not 16 (§10 measured 3 groups / 14 categories) — **23 as of 2026-09-21** (4 groups / 19 categories), because the set is manifest-derived and drifts by design. The rule is what binds; §17.6 #3 carries the dated number.

This is a binding constraint, not an incidental fix. §10 established that `generateStaticParams` does not re-run on revalidation and that new categories render via `dynamicParams`, so an OG route with `dynamicParams = false` would **404 the card for every newly added category — reintroducing this exact bug on a delay.**

### 16.7 Render strategy

`app/og/[...slug]/route.tsx`. `generateStaticParams` enumerates the known slugs — ~102 when this was written, **109 as of 2026-09-21** — from the registry's three sources, reading the manifest off §10's Data Cache entry — same URL, so free. Those three sources were assembled once in Stage 8 as `lib/site-index.ts`'s `sitemapRoutes()`, so the route calls that rather than re-deriving them: the card set and the sitemap are the same question asked twice. **`dynamicParams: true`** (forced by §16.6) and **`revalidate: 300`**, matching §15.7's site-wide ceiling.

Blume's `Cache-Control: public, max-age=31536000, immutable` is **dropped**: `immutable` on an ISR-revalidated asset is a lie, and Vercel already owns the CDN tier for the prerendered ones.

Rejected: two routes (a dynamic `app/og/blocks/[...slug]` beside a fully-static catch-all) — two honest cache policies, but bought with a fragile assumption about which of two nested catch-alls wins.

**Unknown slug: registry lookup, else `notFound()`.** This is what makes the strategy safe rather than a sequel to the bug. Without the lookup, `dynamicParams: true` plus humanization would turn `/og/<anything>.png` into **an image generator hosted on sevenui.dev, looking like ours, with text the caller chooses** — a real abuse surface for a social preview card. It is also parity: a missing file 404s in today's static build.

Edge runtime is not required and is **deprecated in 16**; `params` is a promise in 16. `ImageResponse` limits: flexbox only (`display: grid` does not work), 500 KB total including fonts, `ttf`/`otf`/`woff` only. `textWrap: "balance"` **is** implemented by Satori (a binary search for the narrowest width that does not increase height), so both the headline's and the description's balancing carry over; break points will not match Takumi's exactly.

### 16.8 One metadata registry: `lib/page-meta.ts`

Next has no API for reading another route's metadata, so "drawn equals declared" only holds if **one source feeds both**. Docs entries derive from §4.2's content index, block entries from §10's manifest, custom pages are declared explicitly — and each `page.tsx`'s `generateMetadata` reads **from the registry** rather than declaring inline. The registry stores the **bare** title; §15.8's suffix is applied in one place. Without this, the first edit to a page description silently desynchronises its card.

`lib/page-meta.ts` is also read by §11.3's feedback `title` prop, so the site has exactly one answer to "what is this page called".

## 17. Parity proof

The bar is **behaviour + layout parity**. Information architecture, routes, interactions and overall visual layout must match; a few px of drift, font-rendering differences and spacing rounding are acceptable. `/` and `/blocks` are held closer to pixel parity — both were hand-tuned in dedicated efforts. **That closer bar now holds in dark as well as light.** A dark exception was measured and declared as §17.6 #48 — the five aliased `--color-*` tokens taking the design system's own dark values, one of which inverted the border from dark-grey-80% to white-10%, on exactly these two surfaces — and it was **withdrawn on 2026-09-21** rather than accepted. The bar is stated here, not only where the exception was declared, because a reader checking the standard reads the standard.

### 17.1 The surface

**109 HTML routes compared by the gate, 75 text endpoints (after §15.1), 109 OG cards, 247 registry JSON files — both 109s measured 2026-09-21.** The HTML and OG figures are both manifest-derived, so the rule binds and the number is dated — the same shape §17.6 #2, #3 and #19 use. **§16.7 is where the card count is maintained** (it enumerates the slugs from `sitemapRoutes()`, and already carries "~102 when this was written, 109 as of 2026-09-21"); this section quotes it rather than keeping a second copy. `node scripts/route-inventory.mjs` reports **110** routes today (docs 69 / gallery 11 / blocks 24 / standalone 5 / notFound 1); 109 of them have an old side to compare against, the 110th being `/docs/components`, which production does not serve (§11.3, §17.6 #26). **This section was written against 101**, and the delta is `/docs/components` plus the pro manifest taking `/blocks` from 18 routes to 24 — which is this section's own rule operating exactly as it says it will, not a change of scope. Derived from production, not from memory; the working inventory is `.scratch/blume-to-nextjs/route-inventory.md`.

**`sitemap.xml` is not a sufficient inventory** and that is the headline finding: it lists 85 URLs and omits the live `/blocks` group and category routes, every agent-facing endpoint and every OG image. A gate built on the sitemap would have declared parity with 17 published pages missing — **17 being what that audit found when it ran**; the live figure is 23 (§17.6 #2 and #3), and the gap between the two is the same manifest growth, which only sharpens the point.

**The inventory is generated at cutover time, never transcribed.** `scripts/route-inventory.mjs` derives it from the repo plus the live pro manifest, because the `/blocks` subtree comes from the manifest and any checked-in list rots the moment pro ships a category. This is not theoretical: the count moved from 16 to 18 *during this effort*, and from 18 to 24 since. The standing instruction is that a change in the pro repo must reflect on the site automatically, and that is exactly the property the inventory has to preserve rather than freeze.

That gives the gate a second job beyond "no route disappeared": **after cutover, a category added to the manifest must appear without a rebuild.** That is the user-visible promise of the whole migration, and it is verified here.

### 17.2 Comparison method

Both sides are static HTML, which makes the bulk gate nearly free.

**Automated, all compared routes — 109 as of 2026-09-21, on §17.1's manifest-derived count rather than a transcribed one.** Extract from each route's HTML: visible text, heading hierarchy **with anchor IDs**, and link targets. Diff old build against new. Catches content loss, structural change, broken links and missing sections — the real risk on the 68 docs pages. Blind to styling, deliberately.

**Heading anchor IDs are a hard gate.** Anchors are published deep links, so a drift is a contract break. The diff must be empty. Per §4.3 this is a **smoke test, not a porting requirement** — the IDs match by construction, and the gate exists to catch an accidental slugger swap.

**Screenshot diffing is explicitly rejected.** The agreed bar accepts px drift and font-rendering differences; a screenshot differ reports exactly those as failures, so it would manufacture false positives against a bar we already set.

**Human review is sampled, not exhaustive** — 3–5 pages per surface rather than every primitive, component and block.

### 17.3 The review set and matrix

**Pixel-near set** — the hand-tuned surfaces, full matrix: `/`, `/blocks`, one `/blocks/<group>`, one `/blocks/<group>/<category>`. 3 widths × 2 themes = 24 views. **The 12 dark views carry §17.6 #48's declared exception** — canvas, body text and border all move, the border by inversion — so on those views the reviewer is confirming that nothing *beyond* #48 moved, which is a different question from the one the 12 light views ask.

**Sampled content set** — 2 widths (390, 1440) × 2 themes: `/docs` and `/docs/installation`; **4 `/docs/components/*` chosen to cover distinct demo shapes** — a plain one (button), an **overlay** one (dialog), a third-party wrapper (chart or carousel), a composite (sidebar or field); `/components` plus 3 children; `/pro`, `/account`, one legal page, 404. ~15 routes, ~60 views.

Widths: **390** (mobile drawer), **768** (the drawer switch neighbourhood), **1440** (desktop). The drawer's real breakpoint must be **measured** — 768 is a guess and both sides of the actual switch have to be seen. Themes light and dark, with `system` spot-checked.

**Overlay check, mandatory on the 4 docs samples.** Open a Dialog, Sheet, Drawer and Command palette inside a demo and confirm each covers the viewport. This is the defect the iframe removal exists to fix, so it is the one behaviour that must be verified as **changed**, not preserved.

Per stage, only the routes that stage touched are reviewed, so the matrix spreads across the migration instead of landing in one sitting.

**A computed-style capture is a measurement of one page at one width, and a map built from it inherits both limits.** §6's element map came from `measured-docs-computed-styles.json`, taken **at a single width and from a corpus containing no `h1`** — and both gaps shipped: the `h2`'s mobile step was missed because nothing was captured at 390, and the docs `<h1>` was missed because no MDX body contains one, so the capture never saw the element the page actually renders. Two rules follow, and they are cheap: **capture per-breakpoint**, at every width §17.3 reviews, and **enumerate what the page renders, not what the corpus contains** — the two defects above are one omission each, and neither needed a browser to prevent, only a capture that asked the right question.

### 17.4 Exact-diff gates

**Registry JSON — absolute, four named diffs excepted.** `shadcn build` output must be **byte-identical** against `main`'s; any diff outside the four below is a regression. `scripts/check-registry.mjs` already exists and CI already runs it. The three: `field-validation.tsx`, `chart-demo.tsx` and `chart-line.tsx` gain a `"use client"` directive, so each demo's `/r/demo/*.json` content changes by exactly one line. The cause is §7 — inline rendering puts these demos into a real RSC tree for the first time, and each passes an inline function prop (`validate`, `tickFormatter`) to a Client Component without the directive that used to be moot inside an iframe (§17.6 row 29). The fourth: `aspect-ratio-demo.tsx`, `navigation-menu-demo.tsx` and `sidebar-demo.tsx` change class strings to fix three pre-existing layout defects (§17.6 row 52).

**Agent and SEO endpoints — fixture plus a declared-diff list.** Snapshot production's text output (`/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`, the 68 `.md`) into the repo as fixtures **at the start of the migration**, and diff against them. Every diff must be either empty or named in §17.6. `sitemap.xml`'s criterion is URL-set equality, not byte identity (§15.7).

**A fixed negative-path list.** The inventory lists only *live* routes and cannot see a miss, and the risk here is the inverse of the usual one: §4.1's catch-all and §10's `dynamicParams` both make it easy to accidentally return **200 with a plausible fallback**, which is exactly what makes a stale link look healthy to a crawler. **Six paths, each asserted 404:** a docs miss, a gallery miss, a blocks category miss (§10's `notFound()`), an OG miss (§16.7's registry lookup), a root miss, and `/components/field` — the last proving §11.7's old target still 404s rather than quietly becoming something.

**Every set-equality or count assertion carries a non-vacuity assertion beside it.** Stage 11.2 produced two near-misses of exactly the §17.6 #46 shape, and the pairing is the only reason either was caught. A `\sopen(?=[\s>])` regex over the `<details>` state reported **0 open disclosures on all 24 blocks routes** — a fabricated regression, because the port writes `open=""` where production writes a bare `open`. And a literal `src` set-equality check over the blocks preview iframes returned **true, comparing an empty set against an empty set**: neither origin puts a `src` on that iframe. An assertion that cannot tell "equal" from "nothing was measured" is §21's third blind spot in miniature, and it is a gate rule rather than an anecdote because both of these passed review as written.

### 17.5 The OG surface's own method

§17.2's text/DOM diffing does not apply to an image, and screenshot diffing is rejected site-wide. Three layers instead:

- **Automated sweep over every card — 109 as of 2026-09-21, on §16.7's count rather than a transcribed one**: 200 status, `image/png` content type, byte length above a floor. This alone would have caught the live 404 `og:image` bug.
- **Diff the card's input, not its output.** The drawn text is unreadable from the PNG, but the registry is text: asserting `lib/page-meta.ts`'s `{title, description}` against the same route's `generateMetadata` output turns "did the card draw the right words" into a text diff the existing machinery already runs. **This is the only automated check that proves §16.4 held.**
- **A fixed — not random — 6-card human review**: landing, one docs primitive, one docs guide, one gallery page, one block category, one legal page. Fixed matters: every card changes deliberately, so the reviewer is confirming the rule held, not that nothing moved.

### 17.6 Declared intended diffs

Every diff must be empty or appear here. This list is what separates "we fixed a bug" from "we broke the output".

| # | Diff | Where it comes from |
|---|---|---|
| 1 | `<InstallCommand>` stops leaking into per-page `.md` as raw JSX; serializes to all four package-manager commands on 68 pages, in `.md` and `llms-full.txt` | §15.3 |
| 2 | `sitemap.xml` gains **every** `/blocks` group and category route it never listed — 17 when this row was written, **23 as of 2026-09-21**, taking the file to 109 entries; the count is manifest-derived, so the rule binds and the number is dated. Criterion becomes URL-set equality | §15.7 |
| 3 | Every `/blocks` group and category page stops declaring a 404 `og:image` — cards now exist for them. **17 when this row was written, 23 as of 2026-09-21** (4 group + 19 category, measured against the live manifest); the set is manifest-derived, so the rule binds and the number is dated. The original 17 was wrong in shape as well as size — 3 of them were group-level, not `[group]/[category]`, and production 404s `/og/blocks/marketing.png` exactly as it 404s `/og/blocks/marketing/hero.png`. **Stage 11.2 re-derived the set from production itself** — resolving all 108 live `og:image` URLs rather than counting routes, the instrument distinction #18 forced — and both the size and the shape hold: 4 group + 19 category, 23 cards. #2's 23 is that same set counted for the sitemap | §16.6 |
| 4 | Five absolute `https://sevenui.dev` markdown links become root-relative, so their `href` changes. **The edit is in the MDX source, so it reaches three surfaces, not one**: the rendered HTML, `/<route>.md` (`docs.md` ×2, `docs/installation.md` ×3) and `llms-full.txt` | §4.6 |
| 5 | `blume-heading-anchor`, `blume-table-scroll` and the `#blume-content` skip-link target are renamed — the two classes to Tailwind utilities, the id to `#content` (§13.3); no `blume-*` names survive and no new bespoke names are coined. **The id is the set's one gate-visible member.** §17.2's extractor reads visible text, headings with anchor IDs and link targets, so the two class names are invisible to it; the skip link's `href` is a link target and it changes on all **109** routes (§17.1's dated count, 2026-09-21) — with #44, one of only two rows that reach every inventoried route. Stage 7 absorbed it into a gate constant rather than declaring it, and #44's own text settles that a gate constant is not a declaration | §4.7, §13.3 |
| 6 | Sidebar **scroll position now persists** across navigations — a free consequence of layout persistence | §5 |
| 7 | The docs install block gains a package-manager header bar on 67 of 68 pages. **One uniform shape**, not 67 different changes | §6.1 |
| 8 | Switching a demo's Preview/Code tabs may now change the page height | §7.3 |
| 9 | Inline demos resolve real viewport breakpoints, changing **26 of 137** demos at `md` and above | §7.3 |
| 10 | Overlays opened from a demo now cover the viewport instead of the frame — **the defect this migration fixes** — and the same removal puts every demo's own text into the extraction, because an iframe is a second document and production's extractor never reached inside one. Stage 11's gate mapped **151 runs of inline-demo text on 61 routes** to this row: the extractor-visible half of §7's iframe removal, matched contiguously against the **137 demos production actually framed**. Stage 2's reviewed record set that mapping, so the reach was always this wide and only the wording was narrow. One cause, one row — the overlay fix is what a reader sees and the 151 runs are what the gate sees | §7 |
| 11 | Search results may deep-link to a heading anchor; a new static index asset appears | §9.1 |
| 12 | The block toolbar's tooltips become the registry's own `Tooltip`, and the change is larger than "delay and portal". Measured against `@base-ui/react@1.7.0` and `blocks-prefs.astro`: the open delay becomes Base UI's default **600 ms** (`tooltip/utils/constants.js`) with a **400 ms** provider grouping window and `mouseOnly: true`, where the bespoke singleton opened immediately on focus or hover; the popup is portalled; the palette moves from `bg-foreground` / `text-background` / `px-2 py-1` / `font-medium` / `shadow-md` to `bg-primary` / `text-primary-foreground` / `px-3 py-1.5` with no shadow; the measure changes from `max-w-[min(22rem,90vw)]` to `max-w-xs`; an **arrow** is added and a `scale`+`opacity` transition (150 ms); `role="presentation"` is dropped for no role at all; and every trigger is stamped with an `id` and `data-base-ui-tooltip-trigger`. The **rendered gap shrinks, it does not grow**: `sideOffset` is 8 against the source's 6, but it measures to the popup edge while the arrow sits 5px outside it, so the visible space between control and tip goes from ~6px to ~3px plus an arrow. What does NOT change: it stays decorative — no `aria-describedby`, no `role="tooltip"`, and every `sr-only` accessible name is untouched, so WCAG 1.4.13 still holds (the bespoke tip was `pointer-events-none` so it could never be hovered away from; Base UI's is hoverable instead, which satisfies the same criterion the other way) | §11.5 |
| 13 | `/account` renders its signed-out state server-side, so its draw animation plays at first paint rather than after Clerk boots | §12.4 |
| 14 | The global focus ring is declared as `var(--foreground)` instead of `var(--blume-accent)` — a ≤0.025 L difference, dark mode only. Measured from the **served CSS** on 2026-09-21: **ΔL 0 in light, 0.025 in dark**. No HTML carries it, so no gate in §17 can observe this row at all; it is a CSS-value diff and the measurement had to come from the stylesheet | §8.3 |
| 15 | `copy-command.tsx` on the landing page and the `/components` cards now follows the package-manager preference | §13.2 |
| 16 | 69 `/<route>.mdx` URLs are dropped | §15.1 |
| 17 | 68 docs `<title>`s are re-separated from hyphen to em dash, with their `og:title`, `og:image:alt`, **`twitter:title` and `twitter:image:alt`**. Five surfaces, not three: when this row was written the `twitter` block was Next's implicit fallback from `openGraph`; §16.8's builder declares it outright, so the suffix reaches it by the same route as the rest. Measured production against the port on 2026-09-21, all 109 routes × 17 head fields: **340 differing lines, 68 routes × 5 fields**, and one more line for #26's new page — every other declared value byte-identical | §15.8 |
| 18 | JSON-LD `headline` goes bare on every `TechArticle`-bearing non-docs page — **39 as of 2026-09-21**, not the 16 this row carried until Stage 11. The 16 was the sitemap-scoped set (85 − 68 docs − the landing page); it missed **every `/blocks` group and category page, 23 today**, which is manifest-derived, so the rule binds and the number is dated (§10 owns the route count). Verified on production: `/blocks/marketing/hero` emits `"headline":"Hero blocks — SevenUI"`, `/blocks/marketing` `"Marketing blocks — SevenUI"`, `/blocks/ecommerce` `"eCommerce blocks — SevenUI"` — all suffixed, all made bare by §15.8's one rule. **The undercount was bookkeeping, not behaviour:** `scripts/extract-page-features.mjs:73` strips `script`, `style` and `template` before extracting, so JSON-LD is invisible to §17.2's gate by construction. The port always behaved as §15.8 says; only this row's count of *where* was wrong, which is also why no gate would ever have reported it. Stage 11.2 re-measured across all 108 production routes and got **39 exactly** | §15.8 |
| 19 | `llms.txt` gains `/components`, its 10 gallery pages, **every** blocks route, `/docs/components`, and a `## Components` and `## Blocks` section — 29 lines when this row was written, **42 as of 2026-09-21**. Manifest-derived; the rule binds, the number is dated | §15.4 |
| 20 | `<blume-webmcp>` and its module are gone | §15.14 |
| 21 | OG card descriptions become per-page across all cards. **Reach, measured 2026-09-21: production draws 85 cards and the port draws 109.** The 85 is production's *resolving*-card count — 108 live routes less the 23 whose card 404s (#3) — not a smaller version of ours, so §16.4's "all 85 cards" and this row's "all cards" name two different sets and neither is a scope change | §16.4 |
| 22 | The docs breadcrumb becomes a real trail: 65 pages go from one word to three items, `/docs/installation` and `/docs/theming` gain a two-item trail | §11.3 |
| 23 | `BreadcrumbList` JSON-LD is added on docs and `/blocks`. **Reach counted for the first time by Stage 11.2, 2026-09-21: 91 pages — 68 of 69 docs and 23 of 24 `/blocks`, every page except the two section roots — against 0 on production.** The `/blocks` half is manifest-derived and §10 owns that count; the docs half is repo-derived. Like #18 this is JSON-LD, which `extract-page-features.mjs:73` strips before extracting, so the number came from a production sweep and no gate here will ever re-check it | §11.3 |
| 24 | `/blocks`'s breadcrumb gains `nav > ol > li` + `aria-current` — **accessibility tree only, pixel-identical** under `list-none`. Measured 2026-09-21: it holds on the **23** group and category routes, and **`/blocks` root has no breadcrumb on either side** — the row's reach is 23 of the 24, which it did not say | §11.3 |
| 25 | The feedback event's `title` prop becomes the bare page title | §11.3 |
| 26 | One new route: `/docs/components`. **The page is authored as MDX, so it reaches four surfaces, not one**: the HTML route, its `.md` mirror (§15.1), a 69th `llms-full.txt` section (§15.5), and an `llms.txt` row under `## Primitives` (§15.4) | §11.3 |
| 27 | `rounded-blume` (12px) becomes `rounded-lg` (10px) on four furniture elements | §8.3 |
| 28 | The 404 `<title>` gains the suffix: **"Page not found — SevenUI"** — and its `og:title` and `twitter:title` move with it, exactly as #17 moves the docs `og:title` with the `<title>`. The rest of that head is reproduced unchanged: production declares a **reduced** set on a missing page — `og:type`, `og:site_name`, `og:title`, `og:description`, `twitter:card` = `summary` (not `summary_large_image`), `twitter:title`, `twitter:description`, with no `og:url`, no `og:image` and no canonical — correctly, since a missing page has no card to point at | §11.7 |
| 29 | Three demos (`field-validation.tsx`, `chart-demo.tsx`, `chart-line.tsx`) gain a `"use client"` directive; their `/r/demo/*.json` content changes by one line each. **The serializer embeds the same files, so the same line also lands in two `.md` mirrors** (`chart` ×2, `field` ×1) **and in `llms-full.txt`** | §7 |
| 30 | The site footer renders on docs pages; production has none there | §11.1 |
| 31 | Inline demos contribute 16 headings to the outline on 5 routes, one of them with a generated id | §7 |
| 32 | The code block's language label is a real text node wherever the shared code block renders. On docs pages production drew an **icon**; on the 10 `/components` pages production drew **nothing at all** — its `CodeBlock.astro` call passes no title, so its own `::before` rule never fires. §17.2's extractor reads `body.textContent`, which sees neither an icon nor a pseudo-element, so this **adds extractable text**: production's extraction of `/docs/components/button` and `/components/button` contains zero occurrences of `TSX`, ours contains 6 and 4 | §11.5 |
| 33 | The Preview/Code labels ship in the static HTML instead of being written by script | §7.3, §11.5 |
| 34 | **"Edit on GitHub" is repaired** — production's 68 links all point at a path that has not existed since the monorepo move; the port emits the working one | §11.3 |
| 35 | prev/next gains one hop, through `/docs/components` | consequence of #26 |
| 36 | **RESOLVED 2026-09-23 — the regression is repaired, not carried.** The docs `<aside>` nested inside `<main>`, so "Skip to content" landed the reader in front of the docs navigation on 69 routes. The remedy was deferred past cutover; it is now done. `<main id="content">` moves out of the root layout and into each section's own layout or page, so a section's navigation aside is a **sibling** of `<main>` rather than its first child — the same shape #49 already gave the drawer. **The repair reached two surfaces the row never claimed:** `/blocks` (24 routes) and `/components` (11 routes) carried the identical defect through their own sidebars. Asserted across the built corpus: **111 documents, 110 with exactly one `<main id="content">`** (the exception is Next's internal `_global-error` shell, which renders no site chrome and no skip link) and **0 with an `<aside>` inside `<main>`**. No text node moved — only wrapper elements were renamed or relocated — so §17.2's extractor output is unchanged and no gate result is disturbed | §11.1 |
| 37 | Each docs page carries ~5.3 KB gzip of serialized heading data | §11.1 |
| 38 | §11.3's `docs/components/index.mdx` is the wrong path — `routeFor` maps it to `/docs/components/index`; the file is `docs/components.mdx` | spec text defect |
| 39 | The `/components` nav marks its active link with `aria-current="page"` — **accessibility tree only, pixel-identical**: the two class strings are reproduced verbatim from `component-gallery-nav.astro` rather than re-expressed as `aria-[current=page]:` utilities. Measured on `/components/button`: 2 occurrences today (the site tabs, in the header and the drawer) against 4 (the same two, plus the desktop column and the drawer's tree) — re-confirmed live on 2026-09-21, production 2 against our 4 | §5, same reasoning as #24 |
| 40 | The gallery's code pane grows by the shared code block's header band. Production caps the whole panel (`max-h-96 overflow-auto` on `[data-panel="code"]`); the port caps the `<code>` and sits it under the same chrome the docs pages use, so the pane gains **exactly 42px** — a 60px header band and 16px of padding around a cap that binds sooner. Measured on the live deployments: `/components/button` 362.25px → 404.25px, `/components/dialog` and `/components/dropdown-menu` 418px → 460px. Extractor-invisible; the alternative was a second code-block shape | §7.3, §11.5 |

| 41 | The `/blocks` category tree's `<details>` state now **survives a navigation**. Production's disclosures are reset on every page swap: ClientRouter is enabled on `/blocks` (`<meta name="astro-view-transitions-enabled" content="true">`) and **no element on the page carries `data-astro-transition-persist`**, so each swap replaces the tree with freshly server-rendered markup and a group the reader collapsed springs open again at the next click. Measured on the live pages **2026-09-21**: `/blocks` ships 8 open disclosures (4 groups × the two mounts, desktop column and drawer) and a category page ships 2 open + 6 closed. Those counts are manifest-derived — one disclosure per group per mount — so the rule binds and the figures are evidence from a particular day rather than properties of the page: a fifth group makes them 10, and 2 open + 8 closed. **The behaviour claim does not depend on the count** and holds at any number of groups; the dating matters here because this row exists precisely because no gate in this plan will ever observe it, so nothing but a reader will catch these figures drifting. The port's tree is a React component whose `open` is derived from the pathname and thereafter owned by the element, so a manually collapsed group stays collapsed across navigations within that group. **Invisible to every automated check this migration runs** — the initial HTML is identical, the extractor reads text rather than disclosure state, and no pixel comparison can reach a second navigation — which is why it is declared here rather than left to be discovered. Stage 11.2 measured the initial HTML on both origins: 8 open on `/blocks`, 2 open + 6 closed on each of the other 23, **identical on both and 0 routes differing** — the row's claim of invisibility confirmed rather than assumed | §5, §14.7 |

| 42 | The block card drops the attributes that existed **only** to feed Astro's one delegated document listener: `data-tip` on every toolbar control, `data-title` and the four `data-cmd-{npm,pnpm,yarn,bun}` on the install control, `data-src` on the iframe, `data-preset` on the width buttons, and on the theme dock twelve of the thirteen this row first listed: `data-panel`, `data-rail`, `data-cap`, `data-chevron`, `data-rail-glyph`, `data-readout`, `data-rail-readout`, `data-field`, `data-value`, `data-label`, `data-glyph` and `data-action`. **The thirteenth, `data-bound`, was never a drop** — Stage 11.2 measured 0 occurrences of it on production too, so it was not in the markup to lose and this row over-claimed by one. **The line is whether an attribute addresses the component from outside**: `data-customizer` on the dock root is kept for that reason even though its only known reader was the deleted script, and `id="blocks-theme-panel"` is kept because it is the rail's `aria-controls` target. React holds those values in the component that uses them, so re-emitting them would be writing state into the DOM for a reader that no longer exists. Invisible to §17.2's extractor (it reads text, headings and links) and to any pixel comparison; declared because the install control's four commands were named load-bearing and this is where they stopped being markup. **Two attributes are renamed rather than dropped, declared here by Stage 11.2** (2026-09-21, 113 occurrences each, on the same elements): `data-resize-wrapper` → `data-block-preview`, and `data-fullscreen` → `data-fullscreen-button`. The first satisfies the line above — about 14 `globals.css` selectors read `data-block-preview`, so it addresses the component from outside. **The second does not, and the row records that rather than reconciling it:** `data-fullscreen-button`'s only reader is a `querySelector` inside the component that owns the element, which is precisely the pattern the rest of this row removes. It survived under a new name because renaming was mechanical and dropping it was never attempted — not because it passes the test. So either it should go the way `data-tip` went, or the line is drawn one notch away from where this row states it; that is a follow-up after the cutover, and naming which of the two it is costs less than re-justifying the attribute | §11.5, §14.7 |

| 43 | **`/account`'s whole-page retry is repaired.** After a Clerk boot failure, §12.3's boot-failure surface renders a "Try again" button — and in production that button cannot work. `lib/clerk.ts` memoises with `clerkPromise ??= (async () => …)()`, so a *rejected* boot promise is not nullish and is kept forever: every later call hands back the same rejection, the retry falls straight into its own `catch`, and it re-renders the identical error view with no in-flight state, so it visibly does nothing. The same trap then sits on the signed-out hero's "Sign in" button. The port clears the memo when a boot rejects, so a retry genuinely re-attempts, and gives the button a busy state so a failed retry says so. Reproducing the defect was the alternative: §12.3 requires the surface to render *"the whole-page retry"*, the stage's Definition of done requires the three failure surfaces to be **independently reachable**, and this is the one surface Stage 6 verifies live on a preview deployment — where Clerk's production instance answers `400 origin_invalid` to every boot, so the surface is permanently reached and its only action would have been permanently inert. Same class as #34 | §12.3, Stage 6 |

| 44 | **The search palette's markup is absent from the static HTML, and `⌘J` is bound nowhere.** `Search.astro` server-renders its *whole closed* `<dialog>` into every page — the `Esc` kbd beside the input and the `↑↓ navigate` / `↵ open` / `⌘J preview` footer — so production's extracted text carries the contiguous run `Esc↑↓navigate↵open⌘Jpreview` on all 109 inventoried routes (§17.1's dated count, 2026-09-21), inert but extractable. §11.4 puts the port's dialog behind a **dynamic import** so the palette and its matcher stay out of the header chunk, and §9.5 drops `⌘J` outright because the result-preview pane it toggles is already hidden with `!important` (§14.7). The port's static HTML can therefore only ever carry the trigger's own `Search⌘K`. **This retires half of the owned text run Stage 5 opened and Stage 6 halved**: `Search⌘K` is now asserted *positively on both sides* of the same 109, the way #13's stage asserted the auth pill, and only the closed dialog's chrome is subtracted from production's side. The remainder is permanent rather than debt, which is why it is declared here instead of living on as a gate constant. Measured: production `/docs/components/button` carries `…BlocksProSearch⌘KEsc↑↓navigate↵open⌘JpreviewSignin…`; ours carries the same string with the 27-character dialog run removed. The four `theme.css` `!important` rules that fought the two-column dialog are deleted in the same stage — the geometry they produced (`min(40rem, 94vw)`, single column, no preview pane) moves into the replacement's own class list | §9.5, §11.4, §14.7 |

| 45 | **The 404 gains the site chrome.** Production's 404 renders Blume's *default* header — logo plus GitHub, nothing else — because the generated `404.astro` never receives the `layout={{ Header }}` override the six custom pages pass; §11.7 measures it at 7,565 B / 2 links / **zero `<nav>`** against the landing page's 9,882 B / 8 links. `app/not-found.tsx` sits under the root layout, so the real header arrives **without being asked for**, and the footer with it. Stage 11's gate measured **33 differences on `/404`**: production renders 0 `<nav>` and 0 `<footer>`, ours renders **6 `<nav>` and 1 `<footer>`**, plus the auth pill. §11.7 declares the repair in prose — "correcting the defect as a side effect of the port's structure rather than as work" — but no row carried it: #28 is head-only (title, `og:title`, `twitter:title`) and #30 is scoped to docs pages. The two other rows that *repair* something, #34 and #43, both got one | §11.7 |

| 46 | **`notFound()` serves an empty body in the static HTML, and on two of §17.4's six negative paths the gate's own extractor comes back with nothing** — an upstream Next.js defect, accepted rather than worked around. `notFound()` throws; the only thing that catches it, `HTTPAccessFallbackBoundary`, is a React **client** error boundary; React does not run error boundaries during server rendering; so the throw escapes the whole Fizz pass and `app-render.js` substitutes its hard-coded `<html id="__next_error__">` recovery shell — whose `<body>` is `null` outside dev — while inlining the original, correct flight payload. **Measured with `scripts/extract-page-features.mjs`, §17.2's own instrument, against the live preview and live production on 2026-09-21** (text chars / headings / links): `/definitely-not-a-page`, `/components/field` and `/components/zzz-not-a-component` each answer 404 with **475 / 1 / 33**; `/docs/components/definitely-not-a-primitive` and `/blocks/marketing/definitely-not-a-category` each answer 404 with **0 / 0 / 0**; production's docs miss answers 404 with **139 / 1 / 4**. **`0 / 0 / 0` is not a short body — it is the exact triple the extractor's own CLI guard throws on** (`vacuous extraction: … produced no text, no headings and no links`), written in Task 1.10 to refuse precisely this and named in §21's third blind spot as the failure that *"would invalidate every other gate at once"*: an extractor returning nothing diffs clean against an extractor returning nothing. The finding is therefore not that characters are missing but that **two negative paths produce, in real output, the vacuous shape this gate was built to refuse** — and their being 404s rather than 200s is the only reason §17.4's negative-path list reached them at all. **In a browser — a different instrument measuring a different thing — every one of them renders correctly**: the docs miss hydrates to 504 chars with 6 nav and 2 asides, the blocks miss to 459 chars with 5 nav, the docs miss arriving with its sidebar exactly as §11.7 promises. **Without JavaScript those two are blank**, and production serves a real 404 with no JS at all, so that is a regression. The three healthy paths are healthy because Next never renders a throwing page on them: an unmatched URL and a `dynamicParams: false` miss are both answered with the prerendered `_not-found.html`, and on the preview those two documents are byte-identical — which also accounts for the React #418 hydration mismatch on `/components/zzz-not-a-component` as the same mechanism rather than a second defect. Scope honestly: **every `notFound()` in the app is affected**; only `/docs/*` and `/blocks/*` are reachable today, and that is a property of the current route table, not a guarantee. Reproduced in a pristine four-file Next app containing none of this repo's code, on **15.5.24, 15.5.25, 16.3.2 and 16.4.0-canary.18** — vercel/next.js **#98954** and **#98295**. Rejected: patching Next's render path, the only route to a no-JS body *with the sidebar*, but the repo has no `pnpm.patchedDependencies` (Stage 10 deleted the last one), so it is new machinery at the cutover gate; `dynamicParams = false` on `app/docs/[[...slug]]`, one line and §10-compatible, which would serve the same prerendered `_not-found.html` the healthy paths already get but still has no sidebar without JS, imports the #418 mismatch onto docs misses, and **cannot be applied to `/blocks` at all** (§10 requires `dynamicParams` on, and that requirement is the reason this migration exists), so the row has to be written either way; a `loading.tsx`, which turns `notFound()` into **HTTP 200 plus a skeleton**, precisely §17.4's inverted risk; and rendering the 404 body from the page, 200 by construction, same objection. **When #98954 is fixed this resolves itself with no change on our side**, which is what makes accepting it cheap | §11.7, §17.4, §21, upstream |

| 47 | **`/previews/x/` — the trailing-slash form — answers 308 on our origin where production answers directly.** Both forms are declared in `apps/web/vercel.json` (`/previews/:path*` **and** `/previews/:path*/`), so this is not a missing rewrite: the 308 is **Next's internal trailing-slash redirect**, contributed to the redirect phase *ahead of* `vercel.json`'s rewrites, and no `vercel.json` key reorders those phases. Measured: `/previews/x` **200 on both origins**; `/previews/x/` **200 on production, 308 → 200 on ours** (Stage 5); and across the 24 blocks routes the **113** emitted preview paths are set-equal per route against production, **113/113 resolving 200 / `text/html` / non-vacuous** (Stage 11.2, 2026-09-21). **Nothing in the system requests the failing form:** every emitted path is slash-less — the document pro serves at `/previews/dashboard-01` contains zero URLs ending in `/`, and the ported `<iframe data-src>` carries production's non-slash form verbatim — so anyone who reaches the 308 typed it, and lands on a 200 in one hop. The remedies are both worse than the defect: `skipTrailingSlashRedirect: true` would strip the trailing-slash redirect from **all 85 routes** to repair a form nothing requests, and `"trailingSlash": true` would invert the redirect and break the form the iframes do use. Declined, and the one-key remedy stays available after cutover. Cost if wrong: one extra round trip on a hand-typed URL | §3, §20.2 #5, Stage 5 Ruling 21 |

| 48 | **WITHDRAWN 2026-09-21 — the dark chrome keeps the palette the site already had.** As measured, `globals.css` let the design system's own dark values paint the chrome, moving all five aliased tokens: canvas `oklch(0.085 0 0)` = rgb(2,2,2) → rgb(10,10,10); body text `oklch(0.96 0 0)` → `lab(98.26 0 0)`; and **`border` `oklch(0.24 0 0 / 0.8)`, dark grey at 80%, → `lab(100 0 0 / 0.1)`, white at 10% — an inversion, not a shift.** **Light mode was byte-identical throughout.** The row was first accepted on the argument that #5 forbids coining a replacement vocabulary. **The owner rejected that trade: no colour change was asked for, and the migration is not the place to make one.** Reverted by restoring the mechanism the old site used — `:root[data-theme="dark"]` (0,2,0) outranks the palette block (0,1,0), so dark takes the previous values and light is untouched — with the design system's values restored under `[data-theme="dark"] [data-sevenui-example]`, which is what the old site showed inside its iframes. Confirmed in the built stylesheet: `#020202`, `#f2f2f2`, `#1f1f1fcc`. **The row is kept rather than deleted** so the numbering holds and the decision stays findable; as of the revert it declares no live difference on `/` or `/blocks` | §8.3, §17.3 |

| 49 | **The drawer `<aside>` leaves `<main>` on every non-docs route** — the same mechanism as #36 pointing the other way. Production nests it inside `<main>`; the port renders it as a sibling, so "Skip to content" now skips the drawer navigation on those routes instead of landing the reader in front of it. **Pixel-identical**, and invisible to §17.2, which reads text, headings and links rather than where a landmark sits; found by §17.3's browser matrix on 2026-09-21. **It is a row rather than a widening of #36**, for two reasons: #36 is a declared *regression* on the docs routes carrying a remedy deferred past cutover, and folding an improvement into it would blur both halves of that commitment; and the two reach disjoint sets — #36 the 69 docs routes, this one everything else. Same cause, opposite sign, different surface | §11.1, inverse of #36 |

| 50 | **Live OS theme following is added.** With no stored preference, flipping the operating system from light to dark leaves production on the theme it loaded with and flips the port immediately: Blume's `THEME_INIT_SCRIPT` reads `matchMedia` once and registers no `change` listener, while `next-themes` with `enableSystem` subscribes to it. §8.1 already calls today's behaviour *"a gap, not a design choice"*; this row is where that prose becomes a declared diff. Unobservable to every automated gate here — the initial HTML is identical and no extractor can flip an OS setting — and measured by §17.3's browser matrix, 2026-09-21 | §8.1 |

| 51 | **The 137 docs demos render in the site font instead of the reader's OS font.** Measured inside the live frame: the computed `font-family` is `ui-sans-serif, system-ui, …`, because the iframe document loads no stylesheet — so every demo on production draws in whatever the OS supplies, and inline they draw in Inter like the page around them. The frame did not only clip overlays (#10) and lie about breakpoints (#9, §7.3); it also withheld the site's own typeface. **A deliberate fix of the same kind, not a reproduction:** matching production would mean forcing 137 demos back into a system font no design decision ever chose, and §11.2's deferral of Geist is about which site font, not whether the demos get one. This is also the residue behind the last heading differences §17.3's review measured against production. **One case runs the other way, measured and accepted:** a portaled `Dialog.Title` `<h2>` opened from a docs demo computes `letter-spacing: -0.8px` where production's in-frame equivalent computes `normal`. §7.2(d)'s exclusion is DOM-ancestry-scoped — `article [data-sevenui-example] *` — and overlay content portals to `document.body` (#10's portal, seen from the typography side), so it leaves the `<article>` entirely and **no ancestry selector could reach it**. The heading is Base UI's default for `Dialog.Title`, and `DialogTitle` passes `text-base leading-none font-medium` with no `tracking-*`, so it is one more heading no class list in this app reaches — the same category that made §8.3 entry 4 a rule rather than seven class edits. It is declared here rather than left in a code comment because this table minted rows for a pixel-identical landmark move (#49) and an OS behaviour no gate can observe (#50); a visible typographic difference on every docs-demo overlay cannot be the one that stays undeclared. Extractor-invisible, declared because it changes what every docs demo looks like | §7.2, §7.3 |

| 52 | **Three demos change shape: `aspect-ratio-demo.tsx`, `navigation-menu-demo.tsx` and `sidebar-demo.tsx`** (`a430160`, 2026-09-23, after the cutover gate ran). Each fixes a layout defect that predates the migration, in the demo and not the primitive, so all 66 primitives stay byte-identical to `main`: the aspect-ratio box stops overflowing frames narrower than 384px (`w-96 max-w-full` → `w-full max-w-96`), the navigation-menu links stack title over description (`flex-col items-start gap-1`), and the collapsed sidebar logo holds 32×32 on the icon column's centre (`shrink-0`). Their `/r/demo/*.json` content changes by those class strings. **The serializer embeds the same files, so the same lines also land in three `.md` mirrors** (`aspect-ratio`, `navigation-menu`, `sidebar`) **and in `llms-full.txt`**. The rendered docs pages change in layout only, not in text | §7, §19 |

Rows #30–#40 were added after Stage 3, each a consequence of a decision taken earlier in this document rather than a new choice. #34 and #43 are the only rows that *repair* something, and #36 the only one that costs the reader anything. #41 and #42 were added during Stage 5 and are the first rows whose differences **no gate in this plan can observe**: they are here because a reviewer asked where else they would be written down. #12 was rewritten in the same stage — it had promised only "delay and portal", and adopting a published component changes more than its timing. #43 was added during Stage 6 and joins #41 and #42 as unobservable to every gate here — a reviewer found it by reading the retry path, not by running it. #44 was added during Stage 7 and runs the other way: it is the only row a gate *measures on every route*, because retiring half of its own owned token is what made the measurement stronger than the stage before it. **Stage 8 added no rows and corrected five.** #2 and #19 stated counts the pro manifest had already moved past — 18 blocks routes are 24 — so both now name the rule and date the number, and §15.4 and §15.7 do the same; #4, #26 and #29 each named one surface fewer than the change actually reaches, which is how a stage one removed calls a declared diff a regression, and it did. Nothing about the site changed for any of the five: the rows were behind the repository, not ahead of it. **Stage 11 added two rows and edited three.** #45 and #46 are the first rows a *gate in this plan actually caught* rather than rows a reviewer asked where to write down: the 33 differences on `/404` are §11.7's free chrome repair, which no row carried, and the empty `notFound()` body is an upstream defect this repo can only declare and wait out. #5 and #10 were widened on Stage 8's pattern rather than split — #5 to name `#blume-content`, the one member of §4.7's set the extractor can see, and #10 to carry the 151 runs of demo text the frame used to hide; Stage 2's reviewed record already listed #10 among the rows its text/DOM diff produced, so minting a new row would have contradicted it. #18 was corrected in the same stage and is the sharpest of the four: it claimed 16 pages where the answer is 39, because every `/blocks` group and category page carries a suffixed `TechArticle` headline as well. Nothing about the port was wrong — JSON-LD is stripped before §17.2's extractor sees it, so no gate here could ever have reported it — which makes it a defect in this table rather than in the site, and it survived two manifest-count sweeps because both searched for the current value and a wrong number matches no such search. #41 was edited too, for a different reason: its disclosure counts are manifest-derived and carried no date, and #41 is the worst row in the table to leave one in, since it exists precisely because no gate here can observe it — nothing but a reader will ever catch those figures drifting. §13.3's claim that the rename "costs nothing at the gate" was corrected in place as a spec text defect of #38's kind: the skip link's `href` is a link target, Stage 7 papered it over with a gate constant, and #44's own text settles that a gate constant is not a declaration. The stage also re-dated §17.1's inventory, which the rest of the document had been quoting at **101 HTML routes** long after `/docs/components` and six new pro categories made it 109 compared routes of 110 — the same manifest drift #2, #3 and #19 already carry, arriving this time in the section that states the rule. That sweep reached fourteen further sections outside this table, and the header's **Amended** line records them, because a table's own paragraph is the wrong place to look for an edit to §2. **Stage 11.2 added no rows and edited ten.** #2, #3, #14, #18, #21, #23, #24, #39 and #41 gained the measurement the gate finally produced — #23's reach (91 pages) and #14's ΔL (0 light, 0.025 dark) had never been counted at all — and #42 was corrected twice: two renames it never declared, and `data-bound`, which it listed as dropped though production never emitted it. Almost every row that gained a number is one no gate here can observe, so each was measured with an instrument chosen for it — #14 from the served CSS, #18 and #23 from production's JSON-LD, #42 from its attributes — which is the method #18 forced and the only reason those numbers exist. **Stage 11's browser review added #48 to #51, and they are the first rows this table owes to a human looking at a page.** Every earlier row came from reading the source or diffing text; these four came from §17.3's matrix on its first run — the dark theme's five tokens with an inverted border (#48), the drawer landmark moving the other way from #36 (#49), live OS following (#50), and 137 demos leaving the OS font for the site's (#51). The same run falsified the premise under §7.2(d) and §8.3 entry 4 — *"the chrome's headings carry their own classes"* — which had shipped a 48px docs `<h1>` as 16px on all 69 docs routes; those two sections and §6's heading values are corrected, and §17.3 gained the capture rule the defect turned on. **None of it was reachable by §17.2**, which is the argument for the matrix existing at all. **#47 is the only row in this table written to someone else's instruction.** Stage 5's Ruling 21 closed with *"This earns a §17.6 row, to be written with these numbers at the end of the stage"*, and nobody collected it until Stage 11.2 went looking for §20.2's missing discharges and read the ruling by accident. Five stages passed between the order and the row, and the lesson is the obvious one: a row ordered is not a row written, and the ruling that orders it should write the stub. **#52 was added on 2026-09-23, after the gate had run,** because a registry change landed on the branch after it: three demo fixes that change `/r/demo/*.json`, and a row is the only way the cutover gate's expected-diff list stays complete. The table is **52 rows**.

**Two inventory observations that are expected and are not diffs:** `/blume-assets/*` is absent (it 404s today), and the 9 chrome anchors gain `target`/`rel` — which the post-build pass already added, so the built HTML is unchanged.

### 17.7 What is recorded, and what is not verified

**Recorded:** one short checklist per stage at `.scratch/blume-to-nextjs/verification/<stage>.md` — the automated gate results (text/DOM diff, anchor IDs, registry JSON, agent fixtures, negative paths, OG sweep) and the hand-reviewed routes with a verdict. One line per gate, not a report.

**Explicitly outside the gate** — a gate is only honest when it says what it does not measure:

- **Performance.** See §18; it is a recorded measurement, not a gate.
- Font rendering and antialiasing.
- Px-level spacing on docs pages (the sampled pixel-near routes are the exception).
- OG image pixel identity — impossible anyway (Takumi vs Satori).
- Anything behind Clerk beyond "`/account` loads and lists licenses".
- The pro deployment's own pages — out of scope; only that the rewrites still resolve.
- **Runtime unit tests of `apps/web`'s own logic.** There are none and none are added; see §21.

## 18. Performance budget

### 18.1 Both baselines, measured

Today's site, measured live from the CDN with `Accept-Encoding: gzip`:

| route | HTML gzip | JS gzip |
|---|---|---|
| `/` | 19.9 KB | 6.8 KB |
| `/docs` | 19.0 KB | 12.5 KB |
| `/docs/installation` | 21.6 KB | 12.5 KB |
| `/docs/components/button` | 23.7 KB | 15.0 KB |
| `/docs/components/chart` | 24.8 KB | 15.0 KB |
| `/blocks/marketing/hero` | 21.6 KB | 28.5 KB |

**The port's floor**, measured directly rather than estimated — Next 16.3.5 and React installed fresh, a hello-world App Router app built (one root layout, one static server page, one nested layout carrying a single `'use client'` component with 65 serialized nav nodes), production build, no dev markers: **566 KB raw / 173 KB gzip across 7 chunks, all executed** (`src=`; preload-only totals zero). Measured with `gzip -9` against CDN-gzip for the Astro side, so the comparison is like for like; Vercel serves brotli, which would take roughly 15% off both.

**So every route's JS regresses 6–25x by construction, before a line of our own code.** That figure, not any input, is what decides this section.

### 18.2 A recorded measurement, not a CI gate

A CI check needs a stable measurement environment and a number to fail on, and neither exists until the port does. More decisively, §17.7 puts performance **outside** the cutover gate, so a CI gate would block a release on something nobody agreed blocks it.

Recording nothing is the worse option: the 6–25x arrives by construction, and a spec that does not say it out loud turns a known cost into a post-cutover discovery.

### 18.3 What is measured

**Three numbers per route, and INP rather than LCP.** Compressed transfer (HTML plus the RSC flight payload), compressed JS executed on first load, and one field metric. **INP** is the right one because the change is hydration-shaped, not render-shaped: the page arrives as static HTML either way so LCP barely moves, while 84 demos hydrating on load is precisely an INP/TBT story.

**Reference routes:** `/docs/components/button` (the Shiki worst case), one `/blocks/<group>/<category>` (the client-heaviest), `/` (hand-tuned), one guide page, **plus `/docs/components/chart`** — the only docs page that pulls recharts to the client and therefore the worst case for the demo-hydration question §7.1 defers. It is already today's heaviest docs HTML at 24.8 KB gzip.

**Both baselines are recorded, in different roles.** The Astro table above goes into the spec as **context, not as a target**: against a 173 KB floor a relative budget is red on day one and teaches nothing. The budget itself is **absolute**, derived from the port's own first measurement. The Astro table's job is to answer "what was traded for what", which is a question this spec should be able to answer.

**Measured once, at the end of the branch.** The cutover is a single deploy from a long-lived branch, so "regression" during the migration means "stage N is worse than stage N-1", which no fixed number expresses usefully. The measurement is taken once, recorded here, and that number becomes the baseline for subsequent work. Nothing gates the cutover itself.

### 18.4 The known contributors

- **~2.0 MiB of dual-theme Shiki HTML**, 33% of the live button page, duplicated into the RSC flight payload (§4.4).
- **84 of 137 demos hydrate on load** rather than on scroll (§7.1).
- 65 serialized nav nodes per docs page (§5); five serialized tabs in the header (§11.4).
- A 30 KiB gzipped search index, **fetched on first open** rather than bundled (§9.2), with a measured 5 KiB alternative if body text is ever dropped.
- Clerk's 1.46 MiB is **off** the anonymous path on every page, including `/pro` and `/account`, which is a net improvement over today (§12.4).

**§7.1 is not reopened preemptively** — and the cost of reopening it is *larger* than it looks: in Astro `client:visible` defers hydration only while the bytes ship either way, whereas Next's `next/dynamic` also splits the chunk, so scroll-gating would move payload **and** main-thread time. The correct behaviour is to measure `/docs/components/chart` and `/docs/components/button` and reopen only if the measured INP on the fixed device profile is bad. **It was measured and it is not bad enough: §18.6 records the numbers, the threshold that was set before the run, and the verdict.**

### 18.5 Build time

Measure the current `blume build` once before cutover and record it. The Next build may be slower; a **>3x regression is a signal the shape is wrong**, not a failing gate. One rule is binding and is stated in §4.4: highlight each unique source once and memoize it for the whole build.

**Measured 2026-09-21, and the build is faster, not slower.** Same machine as the Stage 0 baseline (Apple M1 Pro, 10 cores, 32 GB, macOS 26.6.2 build 25G83, Node v24.20.0) and the same command, `/usr/bin/time -p pnpm --filter @sevenui/web build`, with the same three unrelated Vite dev servers left running on 5173 / 5199 / 5207 — the caveat the baseline states, honoured rather than removed, because removing it would have made the two numbers less comparable, not more.

| run | this branch, real | baseline `blume build`, real | ratio | user | sys |
|---|---|---|---|---|---|
| cold | **18.7 s** (18.67, 18.80) | 23.26 s | **0.80x** | 61.7 / 64.5 | 10.9 / 10.6 |
| warm | **6.0 s** (5.80, 5.99, 6.10) | 23.80 s | **0.25x** | 18.2-18.9 | 4.3-4.6 |

Cold clears `.next` — the port's analogue of the baseline's `rm -rf .blume dist`; warm is a consecutive run with it left in place. Both builds emit all 227 prerendered pages; nothing is skipped on the warm run, and the whole of the speedup is Turbopack's persistent cache turning a 12.5 s compile into 501 ms while the prerender stays at ~1.75 s. **The baseline had no warm speedup at all** (23.26 → 23.80), so the port's second build is the larger of the two wins and the one a developer feels.

The breakdown separates the framework-to-framework part from the three `shadcn build` invocations that are identical on both sides, which is the comparison the baseline's own record asks for — it is titled a `blume build` measurement but timed a script that runs `build:registry` first: **`build:registry` 1.65 s, `build-md-mirrors.ts` 0.15 s, `next build` 17.40 s cold.** So Blume's own 21.6 s becomes Next's 17.4 s. §4.4's memoization rule needed no rescue; nothing here is near the 3x line.

### 18.6 The measurement, taken 2026-09-21

Taken once, at the cutover gate, as §18.3 says it would be. The new side is the branch preview built from **`e950df5`** — identified by the CSS chunk it serves, `2_pgv_q9qwga4.css` at 221,297 B — and the old side is live `https://sevenui.dev`, which is still Astro/Blume. **Identify a build by commit plus content hash, never by chunk name.** The same bytes carry two names here: the deployed chunk is `2_pgv_q9qwga4.css` and the local build of the same commit emits `2clkgyeviy2s6.css`, both 221,297 B and both md5 `784722509430710c0cbdce60b33dd334` — identical content, different file name, because the local and Vercel builds name chunks differently. Two records of this stage name the chunk differently for that reason and neither is wrong; an hour is available to anyone who assumes otherwise. Raw data, the five scripts that produced it and the six build logs are in `.scratch/blume-to-nextjs/verification/gate/perf/`.

**Every figure below names its instrument, and one of the instruments is wrong about what its own column heading says.** §18.1's JS column counts the `<script src=>` entries in the served HTML. On the port that *is* the hydration bundle — Turbopack emits every chunk the page needs as a script tag, which is why the floor measurement could say "`src=`; preload-only totals zero" and be complete. On Astro it is the island **loader**: the real chunks arrive by dynamic `import()` from it, and on docs pages the demos are `<iframe>`s whose JavaScript never enters the top document at all. The same method therefore measures a different thing on each side. Both readings are recorded below, because the first is the only one comparable with §18.1 and the second is the only one that is true.

**The instrument was checked against a known answer before it was trusted.** Run against production with `Accept-Encoding: gzip` and KB = 1000 bytes, it reproduces §18.1's Astro table exactly on four of five shared rows — `/` 19.9 / 6.8, `/docs/installation` 21.6 / 12.5, `/docs/components/button` 23.7 / 15.0, `/docs/components/chart` 24.8 / 15.0 — and differs on the fifth, `/blocks/marketing/hero`, by 0.5 KB of HTML, which is the one page in the set whose content is manifest-driven. A method that could not have reproduced those numbers would not have been allowed to produce new ones.

**Compressed transfer — CDN wire bytes, `Accept-Encoding: gzip`, KB = 1000 B.** The brotli column is what a real browser gets and is the honest number; the gzip column exists so this table and §18.1's can be read against each other.

| route | HTML+flight gzip, Astro / port | HTML+flight brotli, Astro / port | `<script src=>` JS gzip, Astro / port |
|---|---|---|---|
| `/` | 19.9 / **23.7** | 19.0 / 20.2 | 6.8 / **351.4** |
| `/docs/installation` | 21.6 / **30.1** | 21.2 / 27.0 | 12.5 / **655.2** |
| `/docs/components/button` | 23.7 / **35.6** | 22.6 / 30.7 | 15.0 / **655.2** |
| `/docs/components/chart` | 24.8 / **37.0** | 23.7 / 32.2 | 15.0 / **655.2** |
| `/blocks/marketing/hero` | 22.1 / **27.1** | 18.5 / 19.9 | 28.4 / **256.2** |

**Where the flight payload lives: inline, inside the HTML, so the HTML column already contains it** — App Router serialises the initial flight into `<script>self.__next_f.push(…)</script>` blocks in the document, and there is no second request to add. Deleting those blocks and re-compressing gives its marginal cost: **8.6 / 13.4 / 15.6 / 15.9 / 9.1 KB** in the table's row order, which is **36-46% of the port's compressed HTML** and the direct reading of §4.4's duplicated Shiki output. Fetched on its own — which is what a prefetch does — the same payload is 8.5 / 13.6 / 15.9 / 16.5 / 9.6 KB gzip.

**JavaScript that actually executes — browser-measured, brotli, cold profile, third-party excluded, router prefetch suppressed.** Every script request the browser makes for the page, iframes included, counted the same way on both sides. Prefetch is suppressed by aborting requests carrying `Next-Router-Prefetch: 1`, so this column is the page's own cost and not its neighbours'; the Astro side has no such requests to abort, which is the control that says the abort is not doing something else. Third-party is excluded because it is the same tag on both sides and would drown the comparison: Google's `gtag.js` measures **175.8 KB on Astro and 176.0 KB on the port** — identical bytes, moved from a render-blocking `<script src=>` to `next/script` at `afterInteractive`, which is a small unbudgeted improvement.

| route | Astro | port | ratio |
|---|---|---|---|
| `/` | 294.8 KB | **321.6 KB** | 1.1x |
| `/docs/installation` | 27.9 KB | **631.1 KB** | 22.6x |
| `/docs/components/button` | 121.3 KB | **723.0 KB** | 6.0x |
| `/docs/components/chart` | 225.6 KB | **723.0 KB** | 3.2x |
| `/blocks/marketing/hero` | 332.5 KB | **604.9 KB** | 1.8x |

**1.1-22.6x, and §18.1's prediction of 6-25x holds** — but only against this reading. Read through §18.1's own `<script src=>` method the same five routes come out at 23-44x, and that number is an artefact of the method rather than a finding about the site: it divides the port's whole bundle by Astro's island loader. The two routes where the port is nearly free, `/` at 1.1x and `/blocks/marketing/hero` at 1.8x, are not places the port got cheaper; they are places **today's site is already expensive** — the landing page hydrates four islands that pull 143 chunks, and the blocks page iframes a whole second application. The guide page is the port at its worst, 22.6x, because it is the route where Astro ships almost nothing and the port still pays the floor.

**The floor, restated against the measurement**: 173 KB gzip of framework arrives before a line of our own code, and the port's lightest measured route carries 321.6 KB brotli. The absolute budget §18.3 asks for is therefore **the port's own first measurement, the second column of the table above**, and a later run is a regression when it exceeds those numbers — not when it exceeds Astro's.

**Lab INP under a fixed device profile, not a field metric.** §18.3 asks for "one field metric". **Neither origin has RUM**, so there is no field data on either side and there never was; a number produced here and labelled "field" would be a lab number wearing a false label. What follows is a lab metric, reported under that name, on a profile written down so it can be re-run:

- Chromium 153.0.8010.12 (Playwright 1.63.0, headless), viewport **1440x900**, deviceScaleFactor 1, a fresh context per run so every run is a cold cache.
- CPU throttled **4x** via CDP `Emulation.setCPUThrottlingRate`. Network **unthrottled** — both origins are the same CDN reached from the same machine on the same connection, and INP is main-thread-bound, so a synthetic link would add variance without adding signal.
- **Nine interactions per phase, always the same nine:** click the header search trigger, 400 ms, `Escape`, 300 ms; click the theme toggle, 300 ms, click it again, 300 ms; five `Tab` presses 120 ms apart.
- **Two phases, and the difference between them is the finding.** Phase A begins the moment the search trigger is clickable after `domcontentloaded` — the hydration window. Phase B repeats the identical nine on a page settled for 3 s past `load`.
- INP is the maximum per-`interactionId` `event` duration inside the phase window; with nine interactions the 98th percentile *is* the maximum. **Five runs per route per origin; the median is reported.** Total blocking time is long-task time over the first 5 s.

| route | INP phase A, hydration (Astro / port) | INP phase B, settled (Astro / port) | TBT first 5 s (Astro / port) |
|---|---|---|---|
| `/` | 112 / **200 ms** | 64 / **48 ms** | 73 / **192 ms** |
| `/docs/installation` | 80 / **96 ms** | 40 / **40 ms** | 59 / **81 ms** |
| `/docs/components/button` | 88 / **144 ms** | 56 / **40 ms** | 66 / **139 ms** |
| `/docs/components/chart` | 96 / **288 ms** | 48 / **40 ms** | 114 / **290 ms** |
| `/blocks/marketing/hero` | 104 / **168 ms** | 64 / **48 ms** | 62 / **192 ms** |

**The whole regression lives in the first second, and after it the port is the faster site.** Settled INP is 40-48 ms against Astro's 40-64 ms on every route measured — the port wins or ties five times out of five. Phase A is where 84 demos hydrating on load shows up, worst on `/docs/components/chart` at 288 ms median (spread 176-400 across five runs) against Astro's 96 ms, which is precisely the recharts island §18.4 names.

**§7.1 stays closed, and here is the number that would have reopened it.** The threshold was set before the run: **reopen if median phase-A INP exceeds 500 ms — Google's "poor" boundary — on `/docs/components/chart` or `/docs/components/button` at this profile.** Measured: 288 ms and 144 ms. Both sit inside "needs improvement", neither is poor, and both are 4x-throttled numbers that an unthrottled desktop divides by roughly four. The most `next/dynamic` could recover is the TBT gap on the worst page, 290 − 114 = **176 ms**, and §18.4's objection still stands against paying for it: scroll-gating in Next moves payload *and* main-thread time, so it is a real refactor of §7.1's inline rendering rather than an attribute. Reopen when a route crosses 500 ms, not before.

**The component wall's 66 prefetching `next/link`s cost 438.8 KB and nothing else.** Stage 5 deferred this here by name, on the grounds that the RSC payload is real — 154 KB uncompressed per docs route — and nobody had measured what the wall does with it. Measured on `/`, cold cache, 1440x900, CPU 4x, three runs each, scrolling the whole page so every cell enters the viewport:

| variant | requests | transfer | JS | prefetch requests |
|---|---|---|---|---|
| as shipped | 138 | 1,611.1 KB | 948.8 KB | 86 / 512.6 KB |
| `prefetch={false}` on the 66 | 71 | **1,172.3 KB** | 948.9 KB | 20 / 75.0 KB |
| all prefetch suppressed | 27 | 645.9 KB | 497.5 KB | 0 |

**So `prefetch={false}` on the wall would save 438.8 KB and 67 requests, and zero JavaScript.** The 66 `/docs/components/*` prefetches are RSC documents averaging 6,633 B brotli each — 154 KB of mostly-repeated Shiki markup compresses about 23x — and the route's JS chunks are not among the savings, because the header's own `/docs` link prefetches the same `app/docs/[[...slug]]` route either way: JS is 948.8 KB with the wall prefetching and 948.9 KB without. Main-thread cost is nil: TBT is 117-137 ms as shipped against 116-159 ms suppressed, the same number twice.

**Two facts decide it.** First, the wall is **below the fold**: at 1440x900 exactly one of the page's 77 `/docs/components/*` anchors is in the initial viewport and it is the header's, not a cell — without scrolling the wall costs **0 KB**, and the premise that "the whole wall is in-viewport on the front door" is not what the viewport shows. Second, with prefetch suppressed entirely the port's front door transfers **645.9 KB against today's Astro front door at 699.4 KB** — the port is already the lighter page there, and the 438.8 KB is spent buying instant navigation into the 65 routes the wall exists to advertise. **It is therefore left on**, and this row records the price rather than changing it: a reader who scrolls the landing page pays 438.8 KB of prefetch, once, on a cold cache. Revisit it if the registry grows the wall much past 66 cells, since the cost is linear in cells and the benefit is not.

**A standing caveat on all of the above.** These are single-machine, single-session numbers with Vercel's cache warm and three unrelated Vite dev servers running; run-to-run spread on the byte columns is under 0.1% and on INP is the 176-400 ms band `/docs/components/chart` shows, which is why the byte figures are quoted flat and the timing figures are quoted as medians of five with their spread. Nothing here gates anything (§17.7). It is the baseline the next measurement is compared against.


## 19. Non-goals and out of scope

- **Changes to `packages/registry` or `packages/presets`.** They are React sources packaged by `shadcn build`, blind to the site framework; touching them only widens the migration. **Three approved exceptions.** One scoped to a single line: `react-hook-form` moves from `devDependencies` to `dependencies` (§14.4). One scoped to three files: `field-validation.tsx`, `chart-demo.tsx` and `chart-line.tsx` gain a `"use client"` directive, forced by §7's inline rendering putting them into a real RSC tree for the first time (§17.6 row 29). And one added after the gate, also three files: `aspect-ratio-demo.tsx`, `navigation-menu-demo.tsx` and `sidebar-demo.tsx` fix pre-existing layout defects in the demo rather than the primitive (§17.6 row 52).
- **The `sevenui-pro` repo and its deployment.** Only the rewrite contract in `apps/web/vercel.json` is in scope, and only to keep it working.
- **URL changes of any kind, including removing the `/docs` base path.** Renaming `/components` → `/primitives` was raised and dropped. Two corrections worth keeping: install commands are **indifferent** to the docs route (`registry.json` references only `/r/*.json`, verified), and redirects were never the expensive part (three `:slug` wildcards). What makes a rename expensive is §17's parity gate — 65 renamed routes turn every canonical URL, `llms.txt` line, `.md` `Source:` line, sitemap entry and OG URL into an intended diff, growing the list from 51 into the hundreds. That is the migration's parity gate spent on a cosmetic segment. No follow-up ticket; the segment lives in one named constant so a later effort is a one-line flip.
- **UI redesign.** Two exceptions, both forced rather than chosen: the search palette, which is rebuilt on our own `command` primitive because Blume's dialog cannot be carried over at all (§9); and the one new page, `/docs/components` (§11.3) — a real breadcrumb needs a real ancestor, and the alternative resolves the crumb to a sibling.
- **Extending ISR beyond the pro manifest.** The other four data sources on the site do not go stale (§10).
- **Moving the theme customizer dock onto `/components` and the docs pages.** A pre-existing product gap, not migration parity: it changes the layout of 11 gallery pages during a cutover whose whole point is attributable regressions, and the dock's behaviour there (rail vs. the gallery sidebar, the mobile drawer) is its own design work. The migration ships the scoped applier — forced by the iframe removal — and the control stays on `/blocks` (§8.4).
- **Teaching the pro repo to read the renamed `theme` storage key**, and **giving pro blocks a `registryDependencies` entry on `/r/theme.json`** so `text-success` / `bg-warning` resolve for consumers (§8.6). Both are pro-repo changes; the web side covers the first with a temporary mirror write (§20.1).
- **Switching the site to Geist / Geist Mono.** ~3 lines against the single seam §11.2 creates, so cost is not the reason — attributability is. A follow-up effort after the cutover, and §16.3 is told not to "fix" the card/site font mismatch by pulling the OG card onto Inter.
- **Agent-surface additions that are not live today:** the `x-markdown-tokens` header (§15.13), `Accept: text/markdown` content negotiation, and `.md` mirrors for the newly-listed routes (§15.12). Each is a post-cutover choice, not parity.
- **Post-cutover 404 niceties:** `not-found` boundaries for the gallery and `/blocks`, and redirects for the base-less legacy shapes `/installation` and `/theming` (§11.7).
- **A runtime test harness for `apps/web`** — see §21.
- **Writing the implementation plan.** A separate effort, after this spec is locked.

## 20. Temporary bridges, proof obligations, and pre-cutover ships

### 20.1 Temporary bridges and their removal conditions

Nothing automated can observe these conditions, so they have to be remembered by a person. This section is where any future bridge lands.

**At the cutover gate this is the only item in §20 with no verdict, and it structurally cannot have one.** §20.2's seven obligations are all settled and §20.3's three ships are all confirmed on `main`; the bridge below is neither discharged nor refuted, because its removal condition is a fact about **another repository** that nothing here can read. That is not a reason to soften it into "remove later": it is exactly why this is the item most likely to outlive its purpose — every other line in §20 has something that will eventually contradict it, and this one has only a person who remembers.

| Bridge | Why it exists | Removal condition |
|---|---|---|
| The app mirrors the resolved theme into `localStorage["blume-theme"]` on every theme change (~5 lines in an effect), one-way | §8.1 renames the key to `theme`, but the storage key is a **cross-repo contract**: the pro previews are same-origin through the `/previews/*` rewrite and sync over the native `storage` event. Without the mirror, `/blocks` previews lose theme sync between the web cutover and the pro deploy — 24 routes as of 2026-09-21 (§10's count), the site's most hand-tuned surface | **Delete once the pro repo reads `theme`.** A comment at the write site repeats this condition |

### 20.2 Proof obligations

Claims that could not be verified from this repository. Each is written as something to check during the migration, not as an assumption, and each has a named fallback. **All seven are settled as of 2026-09-21**: five discharged clean, #5 discharged **false and declared** (§17.6 #47), and #7 discharged with a **standing caveat** that does not expire.

| # | Claim | Check | If false |
|---|---|---|---|
| 1 | A template-literal ``import(`@/registry/demos/${path}.tsx`)`` produces a Turbopack context module covering **nested** directories | **DISCHARGED at Task 2.6** — `/docs/components/button`'s prerendered HTML carries the nested `button/button-demo`'s own markup, not an empty pane | n/a — the 137-entry thunk map was **not taken and is not owed**. The one failure was a specifier that doubled a path segment; both import forms are now known to work, and §7.1 always allowed the expression to change while the decision did not |
| 2 | `@shikijs/rehype` behaves under Turbopack with plain options | **DISCHARGED at Task 2.6** — every element of the chain verified on **real prerendered HTML** rather than on a successful compile: Shiki's `shiki-themes github-light github-dark` classes, `rehype-slug`'s ids, `rehype-autolink-headings`' wrap shape | n/a — plain options held, so the §4.4 async RSC override was not needed |
| 3 | `"use cache"` in Next 16.3.5 requires the `cacheComponents` flag | **DISCHARGED in Stage 5** — re-derived independently, with its own probe and its own build: `Error: To use "use cache", please enable the feature flag 'cacheComponents' in your Next.js config.`, an actual build failure | n/a — the flag is required, so §10.1 stands. Worth keeping for anyone re-checking: that string lives in the **SWC native binary**, so a grep over `next/dist` finds nothing and was never going to answer this |
| 4 | `revalidateTag` invalidates the **rendered route cache**, not merely the tagged fetch entry | **DISCHARGED 2026-09-19** — read from Next 16.3.5's source, see below | n/a — the claim held, so §10.5's deferral stands |
| 5 | `/previews/x/` (trailing slash) still resolves once Next owns the app | **FALSE, DECLARED — found in Stage 5 (Ruling 21), measured at scale by Stage 11.2, 2026-09-21.** `/previews/x` 200 on both origins; `/previews/x/` 200 on production, **308 → 200** on ours. See below | The "should" failed again, in the same place, for the same reason (§3). **No fix is taken, and none exists in `vercel.json`** — see below. Declared as §17.6 #47 |
| 6 | Removing `publicHoistPattern` is safe | **DISCHARGED at Task 10.1 (Stage 10)** — §14.1's five-page proof, each page named by a string only its own dependency could have emitted, plus a clean-machine second leg (`rm -rf node_modules && pnpm install`, 1,525 packages) with `pnpm-lock.yaml` **byte-identical** | n/a — the block is gone and stays gone; nothing was restored |
| 7 | `apps/web`'s widened tsconfig `include` surfaces a clearable error count | **DISCHARGED at Task 1.2 (Stage 1), with a standing caveat** — pre-fix `tsc --noEmit` **5 errors**, post-fix **0**; the `include` was not narrowed and no `@ts-expect-error`, `@ts-ignore` or `as any` was used. One of the five was a real pre-existing bug the narrow tsconfig had hidden, which is what this obligation exists to surface | n/a — cleared inside the migration as intended. **The caveat does not expire:** `skipLibCheck: true` means "typecheck is 0" has a permanent blind spot for `.d.ts` files. All five cleared errors were `.ts`/`.tsx`, so this discharge is unaffected, but the flag must not be dropped quietly and no future claim may read past it |

**#4, discharged.** A prerendered page's collected fetch tags are written onto its cache entry as the `x-next-cache-tags` header — `app-render.js` sets `collectedTags: prerenderStore.tags`, which becomes `metadata.fetchTags`, which `export/routes/app-page.js` writes as `headers[NEXT_CACHE_TAGS_HEADER]` (the constant resolves to the literal `x-next-cache-tags`). On every read the cache handler splits that header back into `cacheTags` and runs `areTagsExpired(cacheTags, lastModified)` against the tags manifest, treating an expired tag as a miss. So the tag reaches the **rendered page**, not only the Data Cache entry, and §10.5's "later a single-file addition" holds. Verified against the default file-system handler; on Vercel the handler differs but `x-next-cache-tags` is the same contract it consumes.

**#5, false and declared — found in Stage 5, sized in Stage 11.2.** `stage-5.md` already records it as *"FAIL, declared"*; the later stage did not discover it, it measured its reach. **There is no `vercel.json` fix**, and Ruling 21 established why: both forms are already declared in `apps/web/vercel.json` (`/previews/:path*` **and** `/previews/:path*/`), so the failure is not a missing rule; the 308 is **Next's internal trailing-slash redirect**, contributed to the redirect phase *ahead of* `vercel.json`'s rewrites, and no `vercel.json` key reorders those phases. `"trailingSlash": true` would invert the redirect and break the non-slash form the iframes actually use. The only remedy is **`skipTrailingSlashRedirect: true` in `next.config`**, which strips the trailing-slash redirect from **all 85 routes** to repair a form nothing requests — in Ruling 21's words, the blast radius the plan's prohibition exists to avoid, arriving through a different option name — and it is declined. Stage 11.2 then measured the reach: the **113** `/previews/*` paths the 24 blocks routes emit are set-equal per route against production, and **113/113 resolve 200 / `text/html` / non-vacuous** on our origin, every one of them slash-less. Cost if wrong is one extra round trip on a hand-typed URL, and the one-key remedy stays available after cutover. Declared as **§17.6 #47**.

### 20.3 Shipped to `main` before the migration branch merges

Three changes landed on today's Blume site as separate commits, deliberately, so they never enter §17.6's diff. This holds the attributability rule at its weakest points — a title, a card headline and a link are exactly the kinds of change that, bundled into a framework deploy, give every downstream difference two suspects.

**All three are on `main` as of 2026-09-21, each verified by a different instrument** — §22's cutover checklist cites this section as the evidence for its first row, so the verdicts belong here rather than in a stage record. The "why it can go first" column is kept as written: it is the reasoning that let each one be separated, and it stays readable after the fact.

| # | Change | Why it can go first |
|---|---|---|
| 1 | **SHIPPED.** The 10 gallery `<title>`s: `Button — SevenUI Components` → `Button Components — SevenUI` — verified against **production's served HTML** (`/components/button`, `/components/dialog`, `/components/tabs` all carry the new form), which is why §15.8 now records 0 routes violating the suffix rule rather than 10 | Hand-written `.astro`, one line each (§15.8) |
| 2 | **SHIPPED.** `seo.og.titles` entries for `/terms`, `/privacy` and the 10 gallery routes — the 12 divergent OG headlines; verified in the **source on `main`**, `apps/web/blume.config.ts` carrying all 12 keys | Blume's `seo.og.titles` is keyed by route and its own type comment says it is for exactly this: card headlines for custom pages. Leaves §17.6 a **3-row** OG diff instead of 15 (§16.1) |
| 3 | **SHIPPED.** The 4 base-relative MDX links rewritten to `/docs/...` — verified by **searching the corpus on `main`**: every internal link in `apps/web/docs/*.mdx` carries the `/docs/` prefix and none is base-relative | Blume's rewrite is **idempotent**, verified live, so the HTML is byte-identical today while `.md` and `llms-full.txt` are repaired (§11.7) |

**What cannot be pre-shipped**, and therefore lands in the cutover: the 68 hyphen-to-em-dash titles (Blume generates them), the JSON-LD `headline` normalization on 39 pages (§17.6 #18 — 16 when this was written, the balance being the manifest-derived `/blocks` set), and the OG description fix (`og.description` is a single site-level string, so Blume cannot express per-page).

## 21. What this migration deliberately does not add

**`apps/web` gets no runtime test harness, and that is a decision rather than an omission.**

It has none today: zero test files, no `vitest` in its `package.json`; all 66 test files in the repo live in `packages/registry`. §14.2 closes the *static* half of the gap — the new tsconfig takes Next's default `include`, so `apps/web`'s own sources are typechecked for the first time — and §17 is the verification this cutover gets. The **runtime** half was investigated and then scoped out: whether the site keeps a standing test harness is a practice decision that outlives the cutover, and it is taken up after the migration ships.

Because the investigation ran before the scope call, its result is stated here rather than discarded — a known limit is not a hole:

**§17's gate is *differential* (old build vs. new build, over an inventory of live routes), and that shape has three remaining blind spots.** §17.4's negative-path list already closed two others.

1. **Nothing anywhere executes §10.2's stale-serve path.** CI is hermetic on the fixture and the live signal is a scheduled canary that watches the manifest, not the behaviour. Note that stale-serve is **Next's Data Cache semantics, not our code** (§10.2 says so: no code is needed), so it is not unit-testable in any case. What *would* be testable is what it depends on — `parseManifest` is a pure function with 11 distinct throw sites, and its real failure mode is a validation that *silently passes* a malformed manifest, after which stale-serve never triggers and a wrong `/blocks` publishes.
2. **§9.3's matcher and index are invisible by construction.** The inventory is 109 HTML (§17.1's dated count) + 75 text + 109 OG (§16.7's) + 247 registry JSON; the 113 KiB search index is none of those, the palette renders on no route, and Blume's Orama dialog is gone so there is no old side to diff against. §9 deliberately rejected Base UI's filter to own the ranking ladder, and nothing verifies it.
3. **§17's own extractors are new untested code** whose worst failure is a **vacuous pass** — an extractor returning nothing diffs clean against an extractor returning nothing, which would invalidate every other gate at once.

Anyone picking this up later starts from `.scratch/blume-to-nextjs/issues/20-runtime-test-harness.md`, which carries the measurements and the questions left open.

## 22. Execution and cutover

**One long-lived branch, staged, with a single production deploy.** The migration is built in stages, each verified on its own Vercel preview URL, and `main` receives **one** merge at the end. Removing Blume and flipping the domain is the last stage.

Preview deployments inherit the `vercel.json` rewrites, so `/blocks` and the pro iframes verify against the **live** pro deployment — no pro staging environment is needed.

Per stage, only the routes that stage touched are reviewed (§17.3), so the verification matrix spreads across the migration instead of landing in one sitting. Each stage records a short checklist at `.scratch/blume-to-nextjs/verification/<stage>.md` (§17.7).

**Before the branch starts:** snapshot production's text output into the repo as fixtures (§17.4), and record today's `blume build` time (§18.5). Both are baselines that stop existing the moment Blume is removed.

**Cutover checklist — the things that are not code:**

| Item | Action |
|---|---|
| Vercel framework preset | Auto-detected; flips Astro → Next.js. Root directory stays `apps/web` |
| Env var | `PUBLIC_CLERK_PUBLISHABLE_KEY` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in both `.env.example` and the Vercel project. A missing value is **silent** (§12) |
| `ci.yml` | Add `PRO_MANIFEST_URL=lib/pro-manifest.fixture.json` to the build step (§10.6) |
| New workflow | Scheduled manifest canary running `parseManifest` against the live manifest (§10.7) |
| `vercel.json` | **No change.** Five rewrite rules, unchanged (§3) |
| Pre-cutover commits | The three in §20.3 must already be on `main` |

**The one thing the cutover must prove, beyond parity:** a category added to the pro manifest appears on the site **without a rebuild** (§17.1). That is the entire reason this migration exists.
