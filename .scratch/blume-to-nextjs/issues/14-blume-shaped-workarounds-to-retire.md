# Blume-shaped workarounds to retire

Type: grilling
Status: resolved

## Question

Blume's presence shaped configuration well outside `apps/web`, and some of
those workarounds are load-bearing today. Each needs a decision: delete, keep,
or replace — and at least one of them can break the build if removed carelessly.

Settle, item by item:

1. **`publicHoistPattern` in `pnpm-workspace.yaml`** — eleven registry
   dependencies hoisted because, per its comment, "Blume SSR prerender
   externalizes registry deps; hoist them so Node's ancestor walk from
   apps/web/dist can resolve them." Next.js bundles differently. Does the hoist
   go away, and what proves it (a clean install plus a build of the demos that
   use `embla-carousel-react`, `recharts`, `react-day-picker`,
   `react-resizable-panels`)? Removing it wrongly breaks module resolution at
   build time, not lint time.
2. **`patchedDependencies: blume@1.5.3`** and `patches/blume@1.5.3.patch` —
   delete with Blume. Confirm the patch fixed something in *Blume* (a
   `rafThrottle` bug, upstream PR blume#245) and not something the site still
   needs in its own code.
3. **`apps/web/.blume/` and `apps/web/.blume-verify/`** — generated, gitignored.
   Delete, and remove both `.gitignore` entries.
4. **`blume.config.ts` and `components.ts`** — delete. But
   `blume.config.ts` is also the *only* place several live behaviours are
   declared: the 65-entry sidebar order with its collapsible "Primitives" group,
   the `search.popular` list, the GA4 analytics scripts, the external-link
   `rel` post-build pass, the site title/description/logo, and
   `deployment.site`. Each needs a new home named here or in another ticket.
5. **`@lucide/astro` dependency** — used by `lib/pro-manifest.ts` (`lucideIcon`)
   to resolve manifest icon keys to Astro components. The React port uses
   `lucide-react`, already a dependency. The kebab-to-Pascal resolution and its
   loud throw on an unknown key must survive; confirm the icon key set resolves
   identically in `lucide-react`.
6. **`packages/registry/demos/theme.css`** — goes dead when demos render
   inline. Registry changes are out of scope, so it stays unused on disk.
   Confirm, and record where that is written down so it is not mistaken for
   live code later.
7. **`apps/web/tsconfig.json`** — currently `include`s only `blume.config.ts`
   and maps `@/*` to `packages/registry/*`. The `@/*` alias is the registry
   import convention and is frozen; what does the Next.js tsconfig look like,
   and does the alias still resolve for both the app and the inline demos?
8. **`scripts/smoke-test.sh` and `scripts/check-registry.mjs`** — do either
   assume Blume's output shape (`dist/` layout, HTML structure)? CI runs both.

## Added items (from `07-theme-mechanism-and-token-ownership`)

9. **The `blume-theme` mirror write.** `07` renames the theme storage key to
   `theme` and, to keep `/blocks` previews in sync across the cutover, has the
   app also write the resolved value into `blume-theme`. It is temporary and
   one-way. Retirement condition is explicit: delete once the pro repo reads
   `theme`. Decide where that condition is recorded so it is not orphaned —
   this ticket, or a note in the spec.
10. **`scripts/check-registry.mjs` is no longer only a registry guard.** `07`
    extends its theme-parity loop to cover `apps/web/app/globals.css` as well as
    `packages/registry/demos/theme.css`, because once demos render inline the
    file a visitor actually sees is `globals.css` and nothing guards it. Item 8
    above should account for this when judging whether the script assumes
    Blume's output shape.

Note on item 6: `07` confirms `packages/registry/demos/theme.css` goes dead for
the site (its only consumer is `blume.config.ts:56`) but stays on disk, because
`scripts/check-registry.mjs` reads it to verify the published `cssVars`.

## Added items (from `03-sidebar-and-nav-source-of-truth`)

11. **Blume's `page`-mode nav panel machinery is unreachable code.**
    `components/blume/NavTree.astro` carries a whole second renderer — the
    `blume-nav` custom element, drill-in/back buttons, a 260ms slide with RTL
    handling — and `collectPanels` only emits a panel for a group whose
    `display` is `"page"`. SevenUI declares exactly one group and it is
    `display: "group"`, so **no panel is ever created and none of that code
    runs today**. `03` decided it is not ported: the new sidebar knows a page
    link and one collapsible group. Blume's `collapsed: false` hatch is
    likewise unused and does not come along. Nothing to retire beyond deleting
    the override with Blume — recorded so the slide animation is not mistaken
    for live behaviour to reproduce.

Note on item 4: the "65-entry sidebar order with its collapsible Primitives
group" now has its new home — `lib/docs/nav.ts`, with the set derived from the
content index and the order a slug sort (`03`, decisions 1 and 2), so the list
itself does not move anywhere. `search.popular` still needs a home; `08` owns
it. The remaining `blume.config.ts` residents in item 4 (GA4 scripts, the
external-link `rel` post-build pass, title/description/logo, `deployment.site`)
are untouched by `03`.

## Answer

Two of this ticket's own premises were wrong, and both are corrected before the
item list:

- **The patch is not only a Blume bug fix.** `patches/blume@1.5.3.patch` has two
  hunks. The first adds the missing `rafThrottle` import to
  `content/Component.astro` (the bug, upstream PR blume#245). The second adds a
  `layout?: Record<string, ComponentOverride>` prop to **`PageLayout.astro`** and
  resolves it through `resolveSlot(layout.Header, Header)` — that is a *feature*,
  and the site depends on it: `/`, `/pro`, `/account` and all three `/blocks`
  pages pass `layout={{ Header }}`. So item 2's question ("did it fix Blume or
  something the site needs?") answers **both**, and the reason it still deletes
  cleanly is that the port owns its own layouts, where a header override is not a
  capability to be granted but the default.
- **Item 1 already has a control case in the repo.** Of the 11 hoisted packages,
  `clsx`, `tailwind-merge` and `react-is` are **not** in
  `packages/registry/node_modules` at all — they are transitive (`cn` →
  clsx/tailwind-merge, `recharts` → react-is) and exist only because the hoist
  put them at the root. Meanwhile `cn`, which **65 registry source files import
  directly**, is *not* in the hoist list and is not reachable from `apps/web` by
  any node_modules ancestor walk — and the site builds today, because Vite
  bundles it. Direct imports therefore never needed the hoist; only Node's
  runtime resolution from `apps/web/dist` did.

### 1. `publicHoistPattern` is removed, and the proof is named page by page

The comment states the reason exactly: "Blume SSR prerender externalizes registry
deps; hoist them so Node's ancestor walk from apps/web/dist can resolve them."
Next.js has no equivalent step — server code is bundled (or traced), client code
is always bundled, and nothing resolves a bare specifier from a build-output
directory at runtime. The `cn` control case above shows the bundling path already
works for a direct registry import with no hoist.

Against that, one real risk: the hoist shapes the **whole workspace's**
`node_modules`, and `packages/registry`'s 525 tests resolve from that same
layout.

So the proof is three steps, run once during the migration:

1. Delete the block, then `rm -rf node_modules && pnpm install`.
2. Production build, and confirm the five surfaces that exercise the heavy
   dependencies actually render in the output — `carousel` (embla-carousel-react),
   `chart` (recharts), `calendar` (react-day-picker), `resizable`
   (react-resizable-panels), and the `field-rhf` demo (react-hook-form). Naming
   the pages is the point: removing the hoist wrongly fails at **build** time in
   one import, and "the build passed" is not evidence when the failing page might
   not have been built.
3. `pnpm test` (the registry suite, the other consumer of that layout) and
   `pnpm test:smoke`.

### 2. The patch and `patchedDependencies` are deleted

Both hunks die with Blume: the `rafThrottle` fix because `06` removes the only
caller (the postMessage height protocol), and the `PageLayout` header-override
hunk because the port has no slot system to extend. Nothing in the site's own
code depends on the patch surviving.

Recorded so the work is not lost: the upstream PR (blume#245) stands on its own
and stays submitted; this repo simply stops carrying the patch.

### 3. Generated directories and the `.gitignore` entries

`apps/web/.blume/` and `apps/web/.blume-verify/` are deleted. The root
`.gitignore` drops **both** `.blume/` and `.blume-verify/`; `apps/web/.gitignore`
contains nothing but a duplicate `.blume-verify/`, so that **file** is deleted
rather than edited. `dist/` is replaced by `.next/` (Astro's output directory has
no successor). `apps/web/public/r/` stays — it is the registry build output and
predates Blume.

### 4. `blume.config.ts` and `components.ts` are deleted; every resident has a named home

`components.ts` goes entirely: `defineComponents({ layout: { Header, Sidebar },
mdx: { InstallCommand } })` has no counterpart — the layouts are ours (`12`) and
the MDX component set is passed at render time (`02`/`04`).

`blume.config.ts`'s residents:

| Resident | New home |
| --- | --- |
| 65-entry sidebar order + collapsible Primitives group | `lib/docs/nav.ts`, set derived from the content index, order a slug sort (`03`) |
| `search.popular` (6 base-less routes) | `lib/docs/search.ts` with literal `/docs/` prefixes (`08`) |
| GA4 `analytics.scripts` | root layout, `next/script` + `afterInteractive`, production-gated (decision 14) |
| `title`, `description`, `deployment.site` | `lib/site.ts` (decision 12) |
| `logo: "assets/logomark.svg"` | the existing `Logomark` React component (decision 12) |
| external-link `rel` post-build pass | dies; `rehype-external-links` for MDX (`02`) + 9 literal attributes (decision 13) |
| `basePath: "/docs"` | nothing — `/docs` is a literal segment (`02`) |
| `content: { root, pages }` | nothing — the tree stays at `apps/web/docs/` (`02`) |
| `examples: { source, css }` | nothing — demos resolve by dynamic import (`06`) |
| `theme: { accent, radius, mode }` | `accent`/`radius` die with Blume's token layer (`12` decision 3); `mode: "system"` becomes `next-themes`' `defaultTheme` (`07`) |
| `github: { owner, repo }` | the header's GitHub link and `11`/`15`'s source URLs read it from `lib/site.ts` |
| the `sevenui-external-links` integration wrapper | dies with the pass it hosted |

### 5. `@lucide/astro` → `lucide-react`, verified rather than assumed

Both packages are at **1.41.0**, generated from the same upstream icon set:
`@lucide/astro` ships 1,808 files under `src/icons/` and exports
`export * as icons from './icons/index'`; `lucide-react`'s `icons` record has
1,807 Pascal-cased entries. The three keys the **live** manifest actually uses —
`layout-dashboard`, `megaphone`, `sparkles` (3 groups / 14 categories / 65 items,
matching `09`) — resolve as `LayoutDashboard`, `Megaphone`, `Sparkles` in both.

So `lucideIcon()` ports with one import line changed. The `kebabToPascal`
resolution and the loud `throw` on an unknown key survive verbatim — that throw
is what makes a pro-repo typo fail the web build instead of rendering a blank
card.

**One boundary rule comes with it:** `import { icons }` pulls the whole record, so
it must stay **server-only**. It is used in `lib/pro-manifest.ts` and the
`/blocks` pages, which `12` keeps as server components; a client component that
imported it would defeat tree-shaking and ship ~1,800 icons. The manifest's keys
are owned by the pro repo and therefore genuinely dynamic, so the full record is
the right shape — it just may not cross the client boundary.

`@lucide/astro` leaves `apps/web/package.json`; `lucide-react` is already there.

### 6. `packages/registry/demos/theme.css` stays on disk, unused, and is recorded twice

Confirmed: its only site consumer is `blume.config.ts:56` (`examples.css`), which
is deleted. Registry changes are out of scope, so the file is not deleted — and it
is not inert either: `scripts/check-registry.mjs:160` reads it to verify the
published `theme` item's `cssVars`.

Where it is written down, so it is not mistaken for live code: the spec's
inventory of retired inputs, and a comment in `check-registry.mjs` at the read
site naming it as the file's only remaining reader. A comment inside
`demos/theme.css` itself would be the obvious third place and is **not** taken —
that would be a registry edit.

`06` already moved the three things inline rendering needs out of it (the
`@source` line, the `[data-blume-example]` grid rule — landing as
`[data-sevenui-example]` per `12` — and the `outline-color` base rule).

### 7. `tsconfig.json`: the typecheck widens from one file to the whole app

Today `include: ["blume.config.ts"]`, with no `extends`. So `pnpm typecheck` in
`apps/web` checks **one file**: the four `.tsx` components, the four `lib/*.ts`
modules and every `.astro` frontmatter are unchecked by it (Blume compiles them
separately under its generated `.blume/tsconfig.json`, which extends
`astro/tsconfigs/strict`).

The new file is Next's generated tsconfig with `paths` carried over verbatim —
`{"@/*": ["../../packages/registry/*"]}` is the frozen registry import convention
and does not move — and the default `include`, which covers the whole app.

**The include is not narrowed to keep the first run quiet.** Narrowing would make
today's blind spot permanent in the new repo, which is exactly the kind of silent
debt a cutover should not carry forward. Measuring the error count is the first
task of this step, and clearing them is part of the migration rather than a
follow-up.

Two monorepo facts that come with the alias pointing outside the app root:
`outputFileTracingRoot` must name the workspace root for Vercel's file tracing,
and if the build ever falls back to webpack, `experimental.externalDir` is the
escape hatch for imports outside the project directory. Turbopack (the Next 16
default, per `01`) needs neither.

### 8. Both CI scripts survive; only one line changes, and it is `07`'s

Neither script assumes Blume's output shape — **neither reads `dist/` or any
HTML**.

`scripts/smoke-test.sh` reads `apps/web/public/r/**/*.json`, rewrites the URLs to
a local `http.server`, installs eight items with
`apps/web/node_modules/.bin/shadcn` into a scratch project and typechecks the
result. `public/` is Next's static directory too, and `shadcn` stays a devDependency
of `apps/web`, so the script needs **zero** changes. (Its one implicit
requirement is worth stating: the pinned local binary, deliberately not
`npx shadcn@latest`, keeps working only while that devDependency stays.)

`scripts/check-registry.mjs` reads `packages/registry/registry.json`,
`demos/registry.json`, the source files, `packages/registry/package.json` for
dependency ranges, `demos/theme.css` for theme parity, and
`DOCS_DIR = "apps/web/docs/components"` to assert every `registry:ui` item has an
MDX page. That last path stays valid because `02` keeps the authored content tree
where it is. The only edit is item 10's: `07` extends the theme-parity loop to
cover `apps/web/app/globals.css` as well, because once demos render inline the
file a visitor actually sees is `globals.css` and nothing guards it today.

### 9. The `blume-theme` mirror's removal condition lives in the spec

`07` made it temporary and one-way, with an explicit condition: delete once the
pro repo reads `theme`. Nothing automated can observe that condition — no build
step can tell whether another repo's code reads a storage key — so it has to be
remembered by a person.

It goes in a spec section named **"Temporary bridges and their removal
conditions"**, plus a comment at the write site repeating the condition. Not this
ticket: once the spec is locked, tickets stop being read, and the spec is the
document that outlives the migration. The section carries one entry today and is
the place any future bridge lands.

### 10. Covered by item 8. 11. Nothing to do

`03` already settled that Blume's `page`-mode nav panel machinery — the
`blume-nav` custom element, drill-in/back buttons, the 260ms RTL-aware slide — is
unreachable: `collectPanels` only emits a panel for a group whose `display` is
`"page"`, and SevenUI declares one group, `display: "group"`. It is deleted with
the override and reproduced nowhere. Recorded here so the slide animation is
never mistaken for live behaviour worth porting.

### 12. `apps/web/assets/` is deleted, and one `.tsx` is dead code

`assets/` is a Blume-shaped convention directory — Blume's generator resolves
config-referenced asset paths from the project root — holding two files, both
unnecessary:

- `assets/logomark.svg` is byte-identical in path data to `public/logomark.svg`
  **and** to `components/logomark.tsx`. The header switches to the `Logomark`
  component, which `site-footer.astro` and the landing page already use.
- `assets/combination-mark.svg` and `components/combination-mark.tsx` have **no
  consumer anywhere in the repo**.

`public/logomark.svg` stays — `avatar-demo` and `hover-card-demo` both load
`/logomark.svg`, and under `06` they render in the main document where that path
still resolves. `public/icon.svg` stays as the favicon (light/dark fills
hardcoded in the file); its `<link>` is `11`/`15`'s metadata call.

**This corrects `12`'s inventory**: three of the four `.tsx` files port directly,
not four. `combination-mark.tsx` is not ported.

`lib/site.ts` holds `name`, `description`, `url` and the GitHub owner/repo, read
by the layout's metadata, `metadataBase`, `11`'s OG route and `15`'s text
endpoints. Three surfaces need the same strings; without one module each would
hardcode them.

### 13. The external-link pass dies in two halves, and `02` only owned one

The `astro:build:done` regex rewrites every emitted HTML file, skipping anchors
that already declare `rel` or `target` and anchors pointing at `sevenui.dev`.
`02` settled the MDX half (`rehype-external-links` with plain options, and the 5
absolute self-links rewritten root-relative).

The other half is **9 anchors outside MDX**, none of which carry `target`/`rel`
today: `site-footer.astro` ×4 and `pages/index.astro` ×4 (github, base-ui.com,
ui.shadcn.com, tailwindcss.com in both) and `pages/privacy.astro` ×1 (Google's
opt-out page). They are hand-written JSX in the port, so they carry
`target="_blank" rel="noopener noreferrer"` literally. Re-running a regex over
built HTML to attach attributes to nine known links buys nothing and would need
its own post-build step in Next.

The two places that already declare `target="_blank"` are `block-frame.astro`
(open-in-tab, view-source) and the header's GitHub link — which carries only
`rel="noreferrer"` and gains `noopener` in the same pass.

### 14. GA4 loads through `next/script`, still production-only

Two scripts today: `<script async src="…gtag/js?id=G-8702Z28SMN">` and an inline
`gtag('js')` / `gtag('config')` pair, both in `<head>`, both gated on
`import.meta.env.PROD`.

`next/script` with `strategy="afterInteractive"` for both. The timing shift
(after hydration rather than async in head) changes nothing measurable: GA4's
enhanced measurement tracks history changes itself, which is why Blume's own
`Analytics.astro` adds SPA pageview capture for PostHog and not for GA4. **The
production gate is preserved** (`process.env.NODE_ENV === "production"`) —
without it, local development starts writing into the live property.

Nothing else in `Analytics.astro` comes along: `analytics.vercel` is not enabled
and PostHog is not configured, so `@vercel/analytics` leaves with Blume.

### 15. `react-hook-form` moves to `dependencies` — a scoped exception

`packages/registry/demos/field/field-rhf.tsx` imports it, that demo is one of the
live 137, and under `06` it renders **inline in a docs page** — so a production
page depends on a package declared in `packages/registry`'s `devDependencies`.
It works today because Vercel installs dev dependencies; a `pnpm install --prod`
build breaks.

The dev approved a one-line exception to the map's "no `packages/registry`
changes" rule: the entry moves from `devDependencies` to `dependencies`. The
version range is unchanged, so `check-registry.mjs`'s range check (which reads
both blocks) still passes and no registry item's `dependencies` array changes.
This is the exception's whole extent — no other registry file is touched.

## Findings

- **The Blume patch grants a feature, not just a fix.** Its `PageLayout` hunk is
  what lets every custom page override the header; six pages use it. Anyone
  reading `patchedDependencies` as "a vendor bug we work around" would have
  deleted half a capability.
- **`clsx`, `tailwind-merge` and `react-is` exist only at the workspace root.**
  They are transitive and absent from `packages/registry/node_modules`, so the
  hoist has been masking them. No registry source imports any of the three
  directly (only `cn`, 65 times), which is why removing the hoist is safe.
- **`pnpm typecheck` checks one file in `apps/web`.** `include:
  ["blume.config.ts"]` with no `extends`; the 4 `.tsx`, 4 `lib/*.ts` and every
  `.astro` frontmatter are outside it.
- **`components/combination-mark.tsx` and `assets/combination-mark.svg` are dead
  code** — no consumer in the repo. The same mark exists in three forms
  (`assets/`, `public/`, `.tsx`) with identical path data.
- **A production demo depends on a devDependency** (`react-hook-form`), fixed here
  by exception.
- **`blume-client-data` does ship on docs pages.** `12` recorded "no page passes
  `clientData`", which is true of the six custom pages but not of Blume's
  `RootLayout`: the live `/docs/components/button` HTML contains a
  `#blume-client-data` JSON script. Nothing reads it — only Blume's own
  `blume/hooks` islands would, and the site renders none — so it is still deleted,
  but the reason is "nothing consumes it", not "nothing emits it".
- **`/blume-assets/*` is a route in the build output and is not part of the URL
  surface.** Blume prerenders `src/pages/blume-assets/[...asset].ts`, but the
  live site returns **404** for it and `sitemap.xml` contains zero `blume`
  entries — consistent with `04`'s finding that the corpus uses no images. It is
  not reproduced.
- **`vercel.json` needs no change, but the Vercel project does.** The framework
  preset is auto-detected, so it flips from Astro to Next.js at cutover; the root
  directory stays `apps/web`. `next.config` gains `outputFileTracingRoot` for the
  workspace root because `@/*` resolves outside the app directory.

## Hand-offs

- **To `13`:** no intended-diff entries. Every decision here is either invisible
  in the output or already carried by another ticket. Two things the inventory
  will see, both expected: `/blume-assets/*` is absent (it 404s today) and the 9
  chrome anchors gain `target`/`rel` — which the post-build pass already added, so
  the built HTML is unchanged.
- **To `15`:** `lib/site.ts` is the single home for `title`, `description`,
  `deployment.site` and the GitHub owner/repo; read it rather than re-deriving.
  `public/icon.svg` is the favicon and is already light/dark aware internally.
- **To `12`:** two corrections. Three `.tsx` files port, not four
  (`combination-mark.tsx` is dead). And `clientData` *is* emitted on docs pages by
  `RootLayout` — it is deleted because nothing reads it.
- **To `16`:** nothing new, but `lib/site.ts` is where the card's title/site
  strings come from.
- **To the spec:** a new section, **"Temporary bridges and their removal
  conditions"**, carrying the `blume-theme` mirror write (decision 9). Also an
  inventory of retired inputs, which is where `demos/theme.css`'s unused-but-
  present status is written down (decision 6).
