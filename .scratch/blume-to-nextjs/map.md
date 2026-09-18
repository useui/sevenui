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
- `/blocks` previews stay iframes — they are cross-origin, license-gated pages
  served from `pro.sevenui.dev` via `vercel.json` rewrites. The
  `block-frame.astro` + `blocks-theme-dock.astro` postMessage theming contract
  is preserved as-is.
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

## Not yet specified

- **Docs prose typography.** Blume owns the `.prose` styles that render the 68
  MDX pages today. Once its stylesheet is gone, docs typography is defined from
  scratch. How closely it must match, and whether it derives from the site
  tokens or its own scale, sharpens once the content component set
  (`04-mdx-content-component-parity-set`) and the demo rendering contract
  (`06-inline-demo-rendering-contract`) are settled. Sharpened by
  `02-docs-content-pipeline-decision`: no bespoke class names are coined for
  content elements — they carry Tailwind utilities — so this patch is about a
  type scale and spacing rhythm, not a `.prose` stylesheet.
- **404 and redirect behaviour** under and around the `/docs` base path.
- **Performance budget.** Today's output is static Astro HTML with almost no
  client JS; the React chrome plus RSC payload will not be free. Sharpened by
  `05-code-highlighting-parity`: dual-theme Shiki output is ~2.0 MiB of HTML —
  33% of the live button page — and the App Router duplicates it into the RSC
  flight payload, so this is a real number, not a worry. Whether a budget is a
  gate, and what it measures, is still worth stating only once the chrome port
  shape is known. Explicitly outside the cutover gate per
  `13-parity-proof-method`. `02-docs-content-pipeline-decision` fixed one input:
  highlighting runs once per unique source and is memoized for the whole build,
  and a >3x build-time regression is a signal, not a gate.

## Out of scope

- Changes to `packages/registry` or `packages/presets` — React sources packaged
  by `shadcn build`, blind to the site framework. Touching them only widens the
  migration.
- The `sevenui-pro` repo and its deployment. Only the rewrite contract in
  `apps/web/vercel.json` is in scope, and only to keep it working.
- URL changes of any kind, including removing the `/docs` base path. 65
  primitive pages, published install commands and SEO depend on them; this is a
  separate effort, after the migration.
- UI redesign. The one exception is search, which is rebuilt on SevenUI's own
  `command` primitive because Blume's dialog cannot be carried over at all.
- Writing the implementation plan. Separate effort, after this spec is locked.
- Extending ISR beyond the pro manifest. The other four data sources on the site
  do not go stale.
