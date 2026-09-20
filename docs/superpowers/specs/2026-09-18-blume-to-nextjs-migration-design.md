# SevenUI — Blume to Next.js Migration Design

**Date:** 2026-09-19
**Status:** Locked — every migration decision is settled; the implementation plan is a separate effort
**Scope:** `apps/web` only
**Supersedes:** the Blume/Astro half of `2026-09-05-monorepo-migration-design.md`. That spec's workspace layout, package boundaries and registry byte-parity rules remain binding and are untouched here.
**Companion:** `docs/adr/0001-nextjs-replaces-astro-blume.md`
**Provenance:** 19 resolved decision tickets under `.scratch/blume-to-nextjs/issues/`. Where this spec compresses a decision, that ticket holds the reasoning and the measurements.

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
| Blocks | `/blocks`, `/blocks/[group]`, `/blocks/[group]/[category]` — 18 live routes |
| Marketing / account / legal | `/`, `/pro`, `/account`, `/terms`, `/privacy` |
| Registry JSON | `/r/*.json`, `/r/demo/*.json`, `/r/component/*.json` — 247 files, **byte-identical** |
| Agent + SEO | `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`, per-page `/<route>.md` |
| OG cards | `/og/<pathname minus leading slash>.png`; `/` maps to `/og/index.png`; the `/docs` prefix sits *inside* the slug |
| Dark-mode signal | `<html data-theme="dark">` — attribute and values unchanged |

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

**All three sidebars are client components in their persistent layouts** — docs (65 links), `/components` (10), `/blocks` (14). App Router does not re-render a shared layout when navigating between its children, so `aria-current="page"` cannot be server-computed there; it needs `usePathname()`. The tree is still built on the server and handed down as serialized data (label + href per node); the content index and `fs` never reach the client. One rule for "chrome carrying an active marker" is worth more than three different ones. Rejected: rendering the sidebar from the page instead of the layout, which keeps it a server component but re-sends 65 links on every navigation and loses layout persistence.

**Group open state: controlled, one-way force.** `useState(activeInside)` plus an effect that forces the group open when the active page enters it and **never forces it closed**. Today's `<details open={active}>` is server-computed with zero persistence, but that is an artifact of every navigation being a document load. In a persistent layout an uncontrolled `defaultOpen` would be ignored after mount, so a user jumping from `/docs/theming` to `/docs/components/button` via the search palette would find the group **closed** — a real regression. Today's observable behaviour is reproduced exactly, and a manually-opened group now survives navigation. No `localStorage`: there is none today, and adding one would crowd §8's single-key contract.

**`site-tabs.ts` moves as data; one component renders both placements.** The array moves verbatim to `lib/site-tabs.ts` (already framework-free). `currentTabForRoute` is Blume's — the tabs' only logic dependency on it — and is reimplemented as a ~10-line longest-prefix helper beside the data. The `Primitives` tab's `href` stops being the hard-coded `/docs/components/accordion` and derives from the nav's first primitive child; hard-coding it is a latent bug the day a primitive sorts ahead of `accordion`.

**Blume's `page`-mode panel machinery is not ported.** `NavTree.astro` is half a drill-in panel stack: buttons, a back button, the `blume-nav` custom element, a 260 ms RTL-aware slide. Panels are created only for `display: "page"` groups and SevenUI declares one group, `display: "group"` — so **the entire mechanism is unreachable on this site today**. Nor is `collapsed: false`, also unused. The ported sidebar knows two row types: a page link and one `group` collapsible.

## 6. MDX content components and the prose layer

**The authored component surface is exactly two**, verified twice by independent methods: `<Component>` (137 uses, 65 files) and `<InstallCommand>` (68 uses, 67 files). The earlier "~40" was Blume's *available* set. A fence-only scan reports 15 more tags — **every one of them sits inside an inline code span**, prose about a component rather than a use of one. `<CodeBlock>` is a third component but not an added one: both `<InstallCommand>` and all 154 fences render through it, so it is the shared code-block primitive.

Plus exactly one new component, `<PrimitiveIndex />`, added by §11.3.

**The prose layer is hand-written element overrides — no `@tailwindcss/typography`.** The element set is exactly **9**: inline `code` (1823 uses / 68 files), `table`/`th`/`td` (507 rows / 57), `h3` (260 / 64), `h2` (249 / 68), `pre` (154 / 67), `a` (98 / 56), `strong` (90 / 17), `ul`/`li` (46 / **7**), `p` (68). **Absent from all 68 files:** `h1`, `h4`–`h6`, ordered lists, blockquote, `hr`, images, `em`, strikethrough, task lists, footnotes, HTML comments. Thirteen element types the plugin would style and nothing would ever render. Taking the plugin would also mean inheriting its `.prose`-scoped descendant selectors, which Blume's own rules already fight with `!important` and an `:is()` specificity bump.

**There is no `.prose` class in the port.** This is load-bearing for §7's isolation rules.

**Values are read from computed styles on the live pages, not transcribed from Blume's override file.** Blume only *overrides* some properties; the rest fall through to the Typography plugin's defaults, so the rendered value is a merge. `h2` is the clear case: Blume sets `font-size`, `line-height` and `margin-top` and says nothing about `margin-bottom`, which the plugin supplies.

What Blume does set, and the port must reproduce:

- Body `0.875rem` / `1.7`, color **`muted-foreground`** — headings are `foreground`, body text is muted. A deliberate signature, not an accident.
- Headings weight `500`, `overflow-wrap: break-word`, display font, `-0.05em` tracking. `h2` `1.875rem`/`1.2`, `margin-top: 3rem` zeroed (with `border-top`) when first child. `h3` `1.25rem`/`1.35`.
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
- **(c) The container re-establishes the demo's root context.** `font-size: 1rem; line-height: normal; color: var(--foreground); background: var(--background)`, plus `font-family` and `letter-spacing` reset to the body values. This is not insurance — it is `demos/theme.css`'s `body { background-color; color }` rule with its selector changed. The frame's `body` gave every demo its typographic starting point; removing the frame means that rule needs a new owner. Parity work, not a guard.
- **(d) `globals.css` declares no bare `h1`-`h6` selector.** Blume styles headings globally, not under `.prose`. Invisible today because the frame never loads Blume's entry; inline it would hit every heading a demo renders. No primitive renders `h1`-`h6` (`CardTitle` is a `div`), but **4 demos do** — `separator-demo`, `hover-card-demo`, `scroll-area-demo`, `collapsible-demo`. Per §6 the display font and the `-0.05em` tracking live in the heading *overrides*; the chrome's headings carry their own classes.

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
| `--font-display` | yes, as `var(--font-sans)` — no utility uses it, but §6's heading override reads it |
| `--color-action`, `--color-action-foreground`, `--color-code`, `--radius-blume` | **no — these die.** Zero consumers anywhere in `apps/web` or the registry; they fed Blume's own chrome and `.prose` only |
| `--container-content` | **yes, renamed** — see below |

`@layer base`, all seven:

1. `* { min-width: 0 }` — the global flex/grid overflow defuse. Silent and site-wide; **ports**.
2. `button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer }` — ports.
3. `html { scroll-behavior: smooth; scroll-padding-top: 4.5rem; text-rendering: optimizeLegibility }` — all three port. `scroll-padding-top` is load-bearing for §9's anchored search results, which would otherwise land under the sticky header.
4. The bare `h1`-`h6` display-font + `-0.05em` rule — **does not port as a bare selector** (§7.2d). The values move into §6's heading overrides; the chrome's headings carry their own classes.
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

**Measured.** The live manifest is 3 groups / 14 categories / 65 items, 27.8 KB — so ISR covers **18 routes** (`/blocks`, 3 group pages, 14 category pages). Today `pages/blocks/_data.ts` calls `await loadProManifest()` at module scope, so there is **one fetch per build** shared by all three routes. The target shape preserves that property.

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

**1. `@clerk/clerk-js` stays, client-only. No `@clerk/nextjs`, no `middleware.ts`.** `/account` is the only authenticated surface — one page out of 101 — and `clerkMiddleware()` would run in front of the whole deployment to serve it. §10 has just finished keeping the request path clean for ISR; putting a middleware function in front of `/blocks`, `/r/*.json` and the agent endpoints to authenticate one page inverts that.

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

Surviving hooks become `data-sevenui-*`, and `#blume-content` becomes `#content`. §17's automated diff extracts visible text, heading hierarchy with anchor IDs, and link targets — **not arbitrary attributes** — so the rename costs nothing at the gate, and leaving `blume` in the DOM of a site that no longer contains Blume misleads every future reader.

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

- **`@lucide/astro` → `lucide-react`, verified rather than assumed.** Both are at **1.41.0**, generated from the same upstream set: `@lucide/astro` ships 1,808 icon files and exports `export * as icons`; `lucide-react`'s `icons` record has 1,807 Pascal-cased entries. The three keys the **live** manifest actually uses — `layout-dashboard`, `megaphone`, `sparkles` — resolve as `LayoutDashboard`, `Megaphone`, `Sparkles` in both. `lucideIcon()` ports with one import line changed; `kebabToPascal` and the loud `throw` on an unknown key survive verbatim — that throw is what makes a pro-repo typo fail the web build instead of rendering a blank card.
  **One boundary rule comes with it:** `import { icons }` pulls the whole record, so it must stay **server-only** — `lib/pro-manifest.ts` and the `/blocks` pages, which §11 keeps as server components. A client component importing it would defeat tree-shaking and ship ~1,800 icons. The manifest's keys are owned by the pro repo and therefore genuinely dynamic, so the full record is the right shape; it just may not cross the client boundary.
- **`zod`** is added (§4.2).
- **`react-hook-form` moves from `devDependencies` to `dependencies` in `packages/registry/package.json`.** This is one of the map's **two** approved exceptions to "no registry changes" (§19), scoped to a single line. `demos/field/field-rhf.tsx` imports it, that demo is one of the live 137, and under §7 it renders **inline in a production docs page** — so a production page depends on a dev dependency. It works today only because Vercel installs dev dependencies; a `pnpm install --prod` build breaks. The version range is unchanged, so `check-registry.mjs`'s range check still passes and no registry item's `dependencies` array changes. **The other exception touches three further registry files** (§17.6 row 29).
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
| `/llms-full.txt` | 1 | Reproduced unchanged (§15.5) |
| `/sitemap.xml` | 1 | Reproduced, 17 routes added (§15.7) |
| `/robots.txt` | 1 | Reproduced verbatim (§15.6) |
| `/agent-readability.json` | 1 | Reproduced, two fields corrected (§15.11) |
| `/rss.xml`, MCP routes | 0 | Already 404; nothing to do |

**The `.mdx` mirrors are dropped because nothing reaches them.** No page links one, no `<link>` declares one, `agent-readability.json` advertises only the `.md` pattern, and the `.md` variant is a superset — same body, with `<Component>` downleveled to source. They exist because Blume emits them by default, not because the site chose them. 69 URLs leave the frozen contract; that is **one** line on the intended-diff list, not 69.

The reproduced set is therefore **74 text/JSON endpoints** — which is exactly the number §17 recorded, *by coincidence*, since the live total is 143 (§17's inventory missed the 69 `.mdx` routes and `/agent-readability.json`). **Re-run the inventory generator after the drop; do not rely on the coincidence.**

### 15.2 The `.md` slug rule is not a quirk, and `/index.md` is `llms.txt`

Two premises corrected against source:

- Blume's generated endpoint maps a route to a slug with one expression: `route === "/" ? "index" : route.slice(1)`. `/docs` is a route in `raw-markdown.json`, `/docs/index` is not — so **`/docs.md` returns 200** (2,634 B, verified) and `/docs/index.md` 404s because nothing claims to serve it. **There is nothing to normalize.** Custom `.astro` pages produce nothing (`/components.md`, `/blocks.md`, `/pro.md`, `/privacy.md` all 404).
- **`/index.md` is `llms.txt` byte for byte** (both 9,299 B, verified). `buildRawMarkdown` has no MDX source for a landing-page home, so it substitutes `buildLlmsIndex()`. The two endpoints share one generator, and always will — so §15.4's growth applies to both.

### 15.3 `<InstallCommand>` serializes to all four commands

The tag currently reaches agents **verbatim** on 68 pages, so the Installation section of every primitive page is empty of instruction for a Markdown reader. **This is our gap, not Blume's:** its serializer registry is `Callout, Steps, Tabs, TypeTable, YouTube` plus `Component`, and it ships a documented extension point — `ai.markdownComponents` — that `blume.config.ts` never used. Which also means the port has no migration problem here: it writes both serializers itself.

The port emits one fenced `bash` block holding all four commands (npx / pnpm dlx / yarn dlx / bunx). This is the Markdown counterpart of §6.1's package-manager bar and a **deliberate, spec-recorded improvement over parity** — one uniform intended diff across 68 pages, in both `/<route>.md` and `llms-full.txt`.

`<Component>` keeps today's behaviour exactly: the example's source as a fenced block in the example's language. Verified non-defect: the fenced source uses `@/registry/base/ui/*`, which is what the page's own Code tab shows, so the two agree; only the hand-authored Usage block says `@/components/ui/*`, as it should.

Per §6 the authored surface is exactly two components, so **the serializer registry is closed at two.** Blume's other five have zero uses and are not ported.

**`/<route>.md` keeps its front matter; `llms-full.txt` keeps stripping it.** Today `.md` emits the verbatim YAML block while `llms-full.txt` strips it and writes `# <title>` + `Source: <url>`. The split is kept: YAML front matter is the standard metadata carrier for a standalone Markdown document and flattening it loses `description` as structured data, while inside `llms-full.txt` the same block would be noise — 68 documents are concatenated there and the `# <title>` / `Source:` pair is what separates them.

### 15.4 `/llms.txt` gains `/components` and all 18 `/blocks` routes

Today it mirrors the docs nav tree only (`## Docs`, `## Primitives`), because `buildLlmsIndex` walks Blume's navigation and the gallery and blocks surfaces are not Blume page records. The index gains both in full: `/components` plus its 10 component pages, and all 18 blocks routes. **29 new lines**, and `/index.md` grows with it (§15.2).

The blocks half is only affordable because of §15.7: `sitemap.xml` is already fed from §10's manifest `fetch`, whose Data Cache entry is URL-keyed, so `llms.txt` reads the same entry for **no additional fetch and no additional ISR surface** — one more `revalidate: 300`. Listing 18 routes in the sitemap and not in `llms.txt`, from the same data, would have been arbitrary.

The `## Docs` heading must be **synthesized literally** — it is Blume's hard-coded string for loose root pages, not a configured label, so §5's nav tree keeps loose pages distinguishable from grouped ones for the emitter's benefit.

### 15.5 `/llms-full.txt` is reproduced unchanged

296,471 bytes, 68 sections, **59% fenced code** (175,231 bytes across 214 fences) — measured, confirming that demo sources dominate. It stays whole. The file's purpose is the entire corpus in one fetch; dropping the demo sources (~120 KB remaining) would reduce it to a longer `llms.txt`, and a consumer who asks for this file is asking for everything.

### 15.6 `robots.txt` is reproduced verbatim, permanently

```
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /

Sitemap: https://sevenui.dev/sitemap.xml
```

Four lines, byte-identical. The `Content-Signal` stance is a policy statement, not a technical detail, and revisiting it during a framework cutover would add a diff the gate has to be told to expect for no migration reason. **No post-cutover follow-up is opened either** — the stance is settled, not deferred.

### 15.7 `sitemap.xml` gains 17 routes and is ISR'd

Live today: 85 `<loc>` entries, bare — no `<lastmod>`, `<changefreq>` or `<priority>`. It carries `/blocks` but **none of the 3 group or 14 category routes**, so 17 live pages are in no sitemap at all. Next's `sitemap.ts` reads §10's manifest through the shared Data Cache entry and declares `revalidate: 300`, taking the count to **102** (plus §11.3's new `/docs/components`, which arrives automatically because it is authored as MDX).

**A site-wide rule is attached: no `revalidate` anywhere exceeds 300 seconds.** That matches §10's figure rather than introducing a second number, and it binds any future ISR surface.

**Entry order is not a contract.** Blume's current collation is visibly odd (`alert-dialog` before `alert`; `/components/tabs` before `/components`); the port sorts with a plain `localeCompare`. §17's criterion for this file is **URL-set equality, not byte identity** — which is the right criterion regardless, since the 17 additions change that set on purpose.

### 15.8 Titles change site-wide; JSON-LD goes bare

JSON-LD is reproduced: `@graph` with a `WebSite` node plus a `TechArticle` node on every page except the landing page, which carries `WebSite` alone, plus §11.3's `BreadcrumbList` as a third node. `TechArticle` on a listing page like `/blocks` is imprecise schema, but that is not a migration question and is left alone.

The two inconsistencies here resolve in **opposite directions**.

**Titles.** Audited all 85 live routes: 68 use an ASCII hyphen (`Button - SevenUI`, Blume's default), 16 an em dash (`Blocks — SevenUI`, hand-written Astro), 1 has no separator (`SevenUI`, the landing page). The rule is now:

> Every `<title>` ends with `SevenUI`, separated by an em dash. The landing page is the sole exception and stays bare `SevenUI`.

Exactly **10 routes violate it** — the gallery component pages, which read `Button — SevenUI Components`. They become `Button Components — SevenUI`. `og:title` and `og:image:alt` follow `<title>` on every page (verified), so they move with it; `<h1>` is bare everywhere and does not move.

**JSON-LD `headline`/`name` go bare on every page.** Today docs pages emit `"Button"` and gallery pages `"Button — SevenUI Components"`. The suffix belongs to the browser tab, not to the article: schema.org `headline` naming every article `… — SevenUI` is wrong. So the 16 `TechArticle`-bearing non-docs pages drop the suffix; the 68 docs pages already comply. The result aligns with the `<h1>` on every page.

The title builder lives in `lib/site.ts` and is applied in **one** place (§16.8).

### 15.9 Page titles stay bare in every agent artefact

The suffix rule governs `<title>`, `og:title` and `og:image:alt` only. The three places a page title appears in agent output keep the **bare** form: `llms.txt` link text, `llms-full.txt` section headings, and the `.md` front-matter `title:`. `llms.txt` already names the site once in its own `# SevenUI` header; repeating it on 85 lines is pure token cost.

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
- `"artifacts.markdown.pattern": "https://sevenui.dev/{route}.md"` → `"https://sevenui.dev/docs/{route}.md"`. The universal pattern is **already a lie** — verified: `/components/button.md`, `/components.md`, `/blocks.md`, `/pro.md` and `/terms.md` all 404, because `.md` mirrors exist only for the 68 docs routes plus `/`. Nothing noticed because `llms.txt` never listed those routes; §15.4 makes it list 29 of them, so the field has to become true.

Everything else — `contentUsage` (which mirrors §15.6's `Content-Signal`), `site`, `repository`, `name`, `description` — is reproduced as-is from `lib/site.ts`. The three per-docs-page `<link>` tags (`describedby` ×2, `alternate type="text/markdown"`) are reproduced unchanged and stay **docs-only**, verified absent on `/`, `/components/button` and `/blocks` today.

### 15.12 The 29 newly-listed routes do **not** gain `.md` mirrors

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

**Description: the page's own, site description as fallback.** Today the card spends its only content line on a string identical across all 85 cards — zero information. `/account` declares no description and is exactly what the fallback is for. This is the single largest quality gain available and the one place where reproducing actively costs something.

**Truncation: description 160, title 64 unchanged.** 160 is the smallest cap that leaves every live description whole (max 156). The cap is a safety net, not a typographic limit: the content box is 486 px (630 − 144 padding) and fixed furniture takes ~195 px, so a 4-line description at 168 px totals 363 px with 123 px to spare — 5 lines still fit. A cap stays because the registry will accept new descriptions later and an unbounded one would overflow silently. `truncate(title, 64)` never fires after the bare-title decision and is kept as-is.

### 16.5 Palette and variants

**The five literals are kept, `#fafafa` included.** The card is light-only and baked at build, so it can never follow the theme — "reading tokens" would be a one-time copy either way, and it would add a build-time coupling from the OG route into `globals.css`, which §8 established as the token owner for the *runtime*. The off-white also does real work: it separates the card from a white chat bubble. The two literals with no token counterpart are named as such.

**No dark variant.** No social platform honours `prefers-color-scheme` for OG images, so a dark card could only be selected by a query param nothing sets — while doubling the surface §17 must verify.

### 16.6 The 17 block routes get cards, and that forces the rest

**Production bug, pre-existing:** the dynamic block pages ship a **404 `og:image`** — Blume's `customOgRoutes` skips any `[param]` pattern so no card is generated, while `PageLayout` emits the tag anyway. Correcting the count: **17** cards are missing, not 16 (§10 measured 3 groups / 14 categories).

This is a binding constraint, not an incidental fix. §10 established that `generateStaticParams` does not re-run on revalidation and that new categories render via `dynamicParams`, so an OG route with `dynamicParams = false` would **404 the card for every newly added category — reintroducing this exact bug on a delay.**

### 16.7 Render strategy

`app/og/[...slug]/route.tsx`. `generateStaticParams` enumerates the ~102 known slugs (85 today + 17 block) from the registry's three sources, reading the manifest off §10's Data Cache entry — same URL, so free. **`dynamicParams: true`** (forced by §16.6) and **`revalidate: 300`**, matching §15.7's site-wide ceiling.

Blume's `Cache-Control: public, max-age=31536000, immutable` is **dropped**: `immutable` on an ISR-revalidated asset is a lie, and Vercel already owns the CDN tier for the prerendered ones.

Rejected: two routes (a dynamic `app/og/blocks/[...slug]` beside a fully-static catch-all) — two honest cache policies, but bought with a fragile assumption about which of two nested catch-alls wins.

**Unknown slug: registry lookup, else `notFound()`.** This is what makes the strategy safe rather than a sequel to the bug. Without the lookup, `dynamicParams: true` plus humanization would turn `/og/<anything>.png` into **an image generator hosted on sevenui.dev, looking like ours, with text the caller chooses** — a real abuse surface for a social preview card. It is also parity: a missing file 404s in today's static build.

Edge runtime is not required and is **deprecated in 16**; `params` is a promise in 16. `ImageResponse` limits: flexbox only (`display: grid` does not work), 500 KB total including fonts, `ttf`/`otf`/`woff` only. `textWrap: "balance"` **is** implemented by Satori (a binary search for the narrowest width that does not increase height), so both the headline's and the description's balancing carry over; break points will not match Takumi's exactly.

### 16.8 One metadata registry: `lib/page-meta.ts`

Next has no API for reading another route's metadata, so "drawn equals declared" only holds if **one source feeds both**. Docs entries derive from §4.2's content index, block entries from §10's manifest, custom pages are declared explicitly — and each `page.tsx`'s `generateMetadata` reads **from the registry** rather than declaring inline. The registry stores the **bare** title; §15.8's suffix is applied in one place. Without this, the first edit to a page description silently desynchronises its card.

`lib/page-meta.ts` is also read by §11.3's feedback `title` prop, so the site has exactly one answer to "what is this page called".

## 17. Parity proof

The bar is **behaviour + layout parity**. Information architecture, routes, interactions and overall visual layout must match; a few px of drift, font-rendering differences and spacing rounding are acceptable. `/` and `/blocks` are held closer to pixel parity — both were hand-tuned in dedicated efforts.

### 17.1 The surface

**101 HTML routes, 74 text endpoints (after §15.1), ~102 OG images, 247 registry JSON files.** Derived from production, not from memory; the working inventory is `.scratch/blume-to-nextjs/route-inventory.md`.

**`sitemap.xml` is not a sufficient inventory** and that is the headline finding: it lists 85 URLs and omits the live `/blocks` group and category routes, every agent-facing endpoint and every OG image. A gate built on the sitemap would have declared parity with 17 published pages missing.

**The inventory is generated at cutover time, never transcribed.** `scripts/route-inventory.mjs` derives it from the repo plus the live pro manifest, because the `/blocks` subtree comes from the manifest and any checked-in list rots the moment pro ships a category. This is not theoretical: the count moved from 16 to 18 *during this effort*. The standing instruction is that a change in the pro repo must reflect on the site automatically, and that is exactly the property the inventory has to preserve rather than freeze.

That gives the gate a second job beyond "no route disappeared": **after cutover, a category added to the manifest must appear without a rebuild.** That is the user-visible promise of the whole migration, and it is verified here.

### 17.2 Comparison method

Both sides are static HTML, which makes the bulk gate nearly free.

**Automated, all 101 routes.** Extract from each route's HTML: visible text, heading hierarchy **with anchor IDs**, and link targets. Diff old build against new. Catches content loss, structural change, broken links and missing sections — the real risk on the 68 docs pages. Blind to styling, deliberately.

**Heading anchor IDs are a hard gate.** Anchors are published deep links, so a drift is a contract break. The diff must be empty. Per §4.3 this is a **smoke test, not a porting requirement** — the IDs match by construction, and the gate exists to catch an accidental slugger swap.

**Screenshot diffing is explicitly rejected.** The agreed bar accepts px drift and font-rendering differences; a screenshot differ reports exactly those as failures, so it would manufacture false positives against a bar we already set.

**Human review is sampled, not exhaustive** — 3–5 pages per surface rather than every primitive, component and block.

### 17.3 The review set and matrix

**Pixel-near set** — the hand-tuned surfaces, full matrix: `/`, `/blocks`, one `/blocks/<group>`, one `/blocks/<group>/<category>`. 3 widths × 2 themes = 24 views.

**Sampled content set** — 2 widths (390, 1440) × 2 themes: `/docs` and `/docs/installation`; **4 `/docs/components/*` chosen to cover distinct demo shapes** — a plain one (button), an **overlay** one (dialog), a third-party wrapper (chart or carousel), a composite (sidebar or field); `/components` plus 3 children; `/pro`, `/account`, one legal page, 404. ~15 routes, ~60 views.

Widths: **390** (mobile drawer), **768** (the drawer switch neighbourhood), **1440** (desktop). The drawer's real breakpoint must be **measured** — 768 is a guess and both sides of the actual switch have to be seen. Themes light and dark, with `system` spot-checked.

**Overlay check, mandatory on the 4 docs samples.** Open a Dialog, Sheet, Drawer and Command palette inside a demo and confirm each covers the viewport. This is the defect the iframe removal exists to fix, so it is the one behaviour that must be verified as **changed**, not preserved.

Per stage, only the routes that stage touched are reviewed, so the matrix spreads across the migration instead of landing in one sitting.

### 17.4 Exact-diff gates

**Registry JSON — absolute, three named diffs excepted.** `shadcn build` output must be **byte-identical** against `main`'s; any diff outside the three below is a regression. `scripts/check-registry.mjs` already exists and CI already runs it. The three: `field-validation.tsx`, `chart-demo.tsx` and `chart-line.tsx` gain a `"use client"` directive, so each demo's `/r/demo/*.json` content changes by exactly one line. The cause is §7 — inline rendering puts these demos into a real RSC tree for the first time, and each passes an inline function prop (`validate`, `tickFormatter`) to a Client Component without the directive that used to be moot inside an iframe (§17.6 row 29).

**Agent and SEO endpoints — fixture plus a declared-diff list.** Snapshot production's text output (`/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`, the 68 `.md`) into the repo as fixtures **at the start of the migration**, and diff against them. Every diff must be either empty or named in §17.6. `sitemap.xml`'s criterion is URL-set equality, not byte identity (§15.7).

**A fixed negative-path list.** The inventory lists only *live* routes and cannot see a miss, and the risk here is the inverse of the usual one: §4.1's catch-all and §10's `dynamicParams` both make it easy to accidentally return **200 with a plausible fallback**, which is exactly what makes a stale link look healthy to a crawler. **Six paths, each asserted 404:** a docs miss, a gallery miss, a blocks category miss (§10's `notFound()`), an OG miss (§16.7's registry lookup), a root miss, and `/components/field` — the last proving §11.7's old target still 404s rather than quietly becoming something.

### 17.5 The OG surface's own method

§17.2's text/DOM diffing does not apply to an image, and screenshot diffing is rejected site-wide. Three layers instead:

- **Automated sweep over all ~102**: 200 status, `image/png` content type, byte length above a floor. This alone would have caught the live 404 `og:image` bug.
- **Diff the card's input, not its output.** The drawn text is unreadable from the PNG, but the registry is text: asserting `lib/page-meta.ts`'s `{title, description}` against the same route's `generateMetadata` output turns "did the card draw the right words" into a text diff the existing machinery already runs. **This is the only automated check that proves §16.4 held.**
- **A fixed — not random — 6-card human review**: landing, one docs primitive, one docs guide, one gallery page, one block category, one legal page. Fixed matters: every card changes deliberately, so the reviewer is confirming the rule held, not that nothing moved.

### 17.6 Declared intended diffs

Every diff must be empty or appear here. This list is what separates "we fixed a bug" from "we broke the output".

| # | Diff | Where it comes from |
|---|---|---|
| 1 | `<InstallCommand>` stops leaking into per-page `.md` as raw JSX; serializes to all four package-manager commands on 68 pages, in `.md` and `llms-full.txt` | §15.3 |
| 2 | `sitemap.xml` gains the 17 `/blocks` group and category routes; criterion becomes URL-set equality | §15.7 |
| 3 | The 17 block pages stop declaring a 404 `og:image` — cards now exist | §16.6 |
| 4 | Five absolute `https://sevenui.dev` markdown links become root-relative, so their `href` changes | §4.6 |
| 5 | `blume-heading-anchor` and `blume-table-scroll` are replaced by Tailwind utilities; no `blume-*` names survive and no new bespoke names are coined | §4.7 |
| 6 | Sidebar **scroll position now persists** across navigations — a free consequence of layout persistence | §5 |
| 7 | The docs install block gains a package-manager header bar on 67 of 68 pages. **One uniform shape**, not 67 different changes | §6.1 |
| 8 | Switching a demo's Preview/Code tabs may now change the page height | §7.3 |
| 9 | Inline demos resolve real viewport breakpoints, changing **26 of 137** demos at `md` and above | §7.3 |
| 10 | Overlays opened from a demo now cover the viewport instead of the frame — **the defect this migration fixes** | §7 |
| 11 | Search results may deep-link to a heading anchor; a new static index asset appears | §9.1 |
| 12 | Block toolbar tooltips gain Base UI's open delay and portal | §11.5 |
| 13 | `/account` renders its signed-out state server-side, so its draw animation plays at first paint rather than after Clerk boots | §12.4 |
| 14 | The global focus ring is declared as `var(--foreground)` instead of `var(--blume-accent)` — a ≤0.025 L difference, dark mode only | §8.3 |
| 15 | `copy-command.tsx` on the landing page and the `/components` cards now follows the package-manager preference | §13.2 |
| 16 | 69 `/<route>.mdx` URLs are dropped | §15.1 |
| 17 | 68 docs `<title>`s are re-separated from hyphen to em dash, with their `og:title` and `og:image:alt` | §15.8 |
| 18 | JSON-LD `headline` goes bare on 16 pages | §15.8 |
| 19 | `llms.txt` gains 29 lines covering `/components` and the 18 blocks routes | §15.4 |
| 20 | `<blume-webmcp>` and its module are gone | §15.14 |
| 21 | OG card descriptions become per-page across all cards | §16.4 |
| 22 | The docs breadcrumb becomes a real trail: 65 pages go from one word to three items, `/docs/installation` and `/docs/theming` gain a two-item trail | §11.3 |
| 23 | `BreadcrumbList` JSON-LD is added on docs and `/blocks` | §11.3 |
| 24 | `/blocks`'s breadcrumb gains `nav > ol > li` + `aria-current` — **accessibility tree only, pixel-identical** under `list-none` | §11.3 |
| 25 | The feedback event's `title` prop becomes the bare page title | §11.3 |
| 26 | One new route: `/docs/components` | §11.3 |
| 27 | `rounded-blume` (12px) becomes `rounded-lg` (10px) on four furniture elements | §8.3 |
| 28 | The 404 `<title>` gains the suffix: **"Page not found — SevenUI"** | §11.7 |
| 29 | Three demos (`field-validation.tsx`, `chart-demo.tsx`, `chart-line.tsx`) gain a `"use client"` directive; their `/r/demo/*.json` content changes by one line each | §7 |
| 30 | The site footer renders on docs pages; production has none there | §11.1 |
| 31 | Inline demos contribute 16 headings to the outline on 5 routes, one of them with a generated id | §7 |
| 32 | The code block's language label is a real text node on **both** surfaces that carry one — the docs pages, where production drew an icon, and the 10 `/components` pages, where production drew it with a CSS `::before`. §17.2's extractor reads `body.textContent`, which sees neither an icon nor a pseudo-element, so this **adds extractable text**: production's extraction of `/docs/components/button` and `/components/button` contains zero occurrences of `TSX`, ours contains 6 and 4 | §11.5 |
| 33 | The Preview/Code labels ship in the static HTML instead of being written by script | §7.3, §11.5 |
| 34 | **"Edit on GitHub" is repaired** — production's 68 links all point at a path that has not existed since the monorepo move; the port emits the working one | §11.3 |
| 35 | prev/next gains one hop, through `/docs/components` | consequence of #26 |
| 36 | The docs `<aside>` is nested inside `<main>`, so **"Skip to content" no longer skips the docs navigation** — a declared accessibility regression, remedy deferred past cutover | §11.1 |
| 37 | Each docs page carries ~5.3 KB gzip of serialized heading data | §11.1 |
| 38 | §11.3's `docs/components/index.mdx` is the wrong path — `routeFor` maps it to `/docs/components/index`; the file is `docs/components.mdx` | spec text defect |

Rows #30–#38 were added after Stage 3, each a consequence of a decision taken earlier in this document rather than a new choice. #34 is the only row that *repairs* something, and #36 the only one that costs the reader anything.

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

**§7.1 is not reopened preemptively** — and the cost of reopening it is *larger* than it looks: in Astro `client:visible` defers hydration only while the bytes ship either way, whereas Next's `next/dynamic` also splits the chunk, so scroll-gating would move payload **and** main-thread time. The correct behaviour is to measure `/docs/components/chart` and `/docs/components/button` and reopen only if the measured INP on the fixed device profile is bad.

### 18.5 Build time

Measure the current `blume build` once before cutover and record it. The Next build may be slower; a **>3x regression is a signal the shape is wrong**, not a failing gate. One rule is binding and is stated in §4.4: highlight each unique source once and memoize it for the whole build.

## 19. Non-goals and out of scope

- **Changes to `packages/registry` or `packages/presets`.** They are React sources packaged by `shadcn build`, blind to the site framework; touching them only widens the migration. **Two approved exceptions.** One scoped to a single line: `react-hook-form` moves from `devDependencies` to `dependencies` (§14.4). The other scoped to three files: `field-validation.tsx`, `chart-demo.tsx` and `chart-line.tsx` gain a `"use client"` directive, forced by §7's inline rendering putting them into a real RSC tree for the first time (§17.6 row 29).
- **The `sevenui-pro` repo and its deployment.** Only the rewrite contract in `apps/web/vercel.json` is in scope, and only to keep it working.
- **URL changes of any kind, including removing the `/docs` base path.** Renaming `/components` → `/primitives` was raised and dropped. Two corrections worth keeping: install commands are **indifferent** to the docs route (`registry.json` references only `/r/*.json`, verified), and redirects were never the expensive part (three `:slug` wildcards). What makes a rename expensive is §17's parity gate — 65 renamed routes turn every canonical URL, `llms.txt` line, `.md` `Source:` line, sitemap entry and OG URL into an intended diff, growing the list from 28 into the hundreds. That is the migration's parity gate spent on a cosmetic segment. No follow-up ticket; the segment lives in one named constant so a later effort is a one-line flip.
- **UI redesign.** Two exceptions, both forced rather than chosen: the search palette, which is rebuilt on our own `command` primitive because Blume's dialog cannot be carried over at all (§9); and the one new page, `/docs/components` (§11.3) — a real breadcrumb needs a real ancestor, and the alternative resolves the crumb to a sibling.
- **Extending ISR beyond the pro manifest.** The other four data sources on the site do not go stale (§10).
- **Moving the theme customizer dock onto `/components` and the docs pages.** A pre-existing product gap, not migration parity: it changes the layout of 11 gallery pages during a cutover whose whole point is attributable regressions, and the dock's behaviour there (rail vs. the gallery sidebar, the mobile drawer) is its own design work. The migration ships the scoped applier — forced by the iframe removal — and the control stays on `/blocks` (§8.4).
- **Teaching the pro repo to read the renamed `theme` storage key**, and **giving pro blocks a `registryDependencies` entry on `/r/theme.json`** so `text-success` / `bg-warning` resolve for consumers (§8.6). Both are pro-repo changes; the web side covers the first with a temporary mirror write (§20.1).
- **Switching the site to Geist / Geist Mono.** ~3 lines against the single seam §11.2 creates, so cost is not the reason — attributability is. A follow-up effort after the cutover, and §16.3 is told not to "fix" the card/site font mismatch by pulling the OG card onto Inter.
- **Agent-surface additions that are not live today:** the `x-markdown-tokens` header (§15.13), `Accept: text/markdown` content negotiation, and `.md` mirrors for the 29 newly-listed routes (§15.12). Each is a post-cutover choice, not parity.
- **Post-cutover 404 niceties:** `not-found` boundaries for the gallery and `/blocks`, and redirects for the base-less legacy shapes `/installation` and `/theming` (§11.7).
- **A runtime test harness for `apps/web`** — see §21.
- **Writing the implementation plan.** A separate effort, after this spec is locked.

## 20. Temporary bridges, proof obligations, and pre-cutover ships

### 20.1 Temporary bridges and their removal conditions

Nothing automated can observe these conditions, so they have to be remembered by a person. This section is where any future bridge lands.

| Bridge | Why it exists | Removal condition |
|---|---|---|
| The app mirrors the resolved theme into `localStorage["blume-theme"]` on every theme change (~5 lines in an effect), one-way | §8.1 renames the key to `theme`, but the storage key is a **cross-repo contract**: the pro previews are same-origin through the `/previews/*` rewrite and sync over the native `storage` event. Without the mirror, `/blocks` previews lose theme sync between the web cutover and the pro deploy — 16 pages, the site's most hand-tuned surface | **Delete once the pro repo reads `theme`.** A comment at the write site repeats this condition |

### 20.2 Proof obligations

Claims that could not be verified from this repository. Each is written as something to check during the migration, not as an assumption, and each has a named fallback.

| # | Claim | Check | If false |
|---|---|---|---|
| 1 | A template-literal ``import(`@/registry/demos/${path}.tsx`)`` produces a Turbopack context module covering **nested** directories | First real build renders a nested demo | A build script emits `lib/docs/demos.ts`, a literal 137-entry map of `() => import(...)` thunks. The import expression changes, not §7.1 |
| 2 | `@shikijs/rehype` behaves under Turbopack with plain options | First real build | Highlighting moves to an async RSC `pre`/`code` override (§4.4) |
| 3 | `"use cache"` in Next 16.3.5 requires the `cacheComponents` flag | Read the Next source / try it | If it does not, `"use cache"` becomes cheap and §10.1 is worth revisiting |
| 4 | `revalidateTag` invalidates the **rendered route cache**, not merely the tagged fetch entry | **DISCHARGED 2026-09-19** — read from Next 16.3.5's source, see below | n/a — the claim held, so §10.5's deferral stands |
| 5 | `/previews/x/` (trailing slash) still resolves once Next owns the app | First preview deployment | Platform rewrites run ahead of the Next function and `/previews/*` is not a Next route, so nothing should reach Next's trailing-slash handling — but "should" is what failed last time (§3) |
| 6 | Removing `publicHoistPattern` is safe | The three-step proof in §14.1, naming five pages | Restore the block and record why; the migration does not depend on removing it |
| 7 | `apps/web`'s widened tsconfig `include` surfaces a clearable error count | First `pnpm typecheck` after §14.2 | Clearing them is part of the migration, not a follow-up. The include is **not** narrowed to keep the run quiet |

**#4, discharged.** A prerendered page's collected fetch tags are written onto its cache entry as the `x-next-cache-tags` header — `app-render.js` sets `collectedTags: prerenderStore.tags`, which becomes `metadata.fetchTags`, which `export/routes/app-page.js` writes as `headers[NEXT_CACHE_TAGS_HEADER]` (the constant resolves to the literal `x-next-cache-tags`). On every read the cache handler splits that header back into `cacheTags` and runs `areTagsExpired(cacheTags, lastModified)` against the tags manifest, treating an expired tag as a miss. So the tag reaches the **rendered page**, not only the Data Cache entry, and §10.5's "later a single-file addition" holds. Verified against the default file-system handler; on Vercel the handler differs but `x-next-cache-tags` is the same contract it consumes.

### 20.3 Shipped to `main` before the migration branch merges

Three changes land on today's Blume site as separate commits, deliberately, so they never enter §17.6's diff. This holds the attributability rule at its weakest points — a title, a card headline and a link are exactly the kinds of change that, bundled into a framework deploy, give every downstream difference two suspects.

| # | Change | Why it can go first |
|---|---|---|
| 1 | The 10 gallery `<title>`s: `Button — SevenUI Components` → `Button Components — SevenUI` | Hand-written `.astro`, one line each (§15.8) |
| 2 | `seo.og.titles` entries for `/terms`, `/privacy` and the 10 gallery routes — the 12 divergent OG headlines | Blume's `seo.og.titles` is keyed by route and its own type comment says it is for exactly this: card headlines for custom pages. Leaves §17.6 a **3-row** OG diff instead of 15 (§16.1) |
| 3 | The 4 base-relative MDX links rewritten to `/docs/...` | Blume's rewrite is **idempotent**, verified live, so the HTML is byte-identical today while `.md` and `llms-full.txt` are repaired (§11.7) |

**What cannot be pre-shipped**, and therefore lands in the cutover: the 68 hyphen-to-em-dash titles (Blume generates them), the JSON-LD `headline` normalization on 16 pages, and the OG description fix (`og.description` is a single site-level string, so Blume cannot express per-page).

## 21. What this migration deliberately does not add

**`apps/web` gets no runtime test harness, and that is a decision rather than an omission.**

It has none today: zero test files, no `vitest` in its `package.json`; all 66 test files in the repo live in `packages/registry`. §14.2 closes the *static* half of the gap — the new tsconfig takes Next's default `include`, so `apps/web`'s own sources are typechecked for the first time — and §17 is the verification this cutover gets. The **runtime** half was investigated and then scoped out: whether the site keeps a standing test harness is a practice decision that outlives the cutover, and it is taken up after the migration ships.

Because the investigation ran before the scope call, its result is stated here rather than discarded — a known limit is not a hole:

**§17's gate is *differential* (old build vs. new build, over an inventory of live routes), and that shape has three remaining blind spots.** §17.4's negative-path list already closed two others.

1. **Nothing anywhere executes §10.2's stale-serve path.** CI is hermetic on the fixture and the live signal is a scheduled canary that watches the manifest, not the behaviour. Note that stale-serve is **Next's Data Cache semantics, not our code** (§10.2 says so: no code is needed), so it is not unit-testable in any case. What *would* be testable is what it depends on — `parseManifest` is a pure function with 11 distinct throw sites, and its real failure mode is a validation that *silently passes* a malformed manifest, after which stale-serve never triggers and a wrong `/blocks` publishes.
2. **§9.3's matcher and index are invisible by construction.** The inventory is 101 HTML + 74 text + ~102 OG + 247 registry JSON; the 113 KiB search index is none of those, the palette renders on no route, and Blume's Orama dialog is gone so there is no old side to diff against. §9 deliberately rejected Base UI's filter to own the ranking ladder, and nothing verifies it.
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
