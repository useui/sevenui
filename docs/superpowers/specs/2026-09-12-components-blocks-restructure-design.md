# Components / Blocks Restructure — Design

Date: 2026-09-12
Status: Approved

## Goal

Split the site's gallery surfaces into three clear tiers:

- **`/docs`** — unchanged. The leanest form of every component, documented
  with its demos.
- **`/components`** — new. A free gallery of richer, block-scale examples
  of the docs components (modeled on reui.io/components/accordion).
- **`/blocks`** — repurposed. Pro-only blocks with a full ReUI-style
  directory (group tabs, category cards, live previews).

The 9 existing free blocks (login/signup/hero/pricing) are retired
entirely. No redirects for removed URLs — the site has no traffic on
them; search index gets cleaned manually.

## URL map

| Route | Content |
|---|---|
| `/docs`, `/docs/components/*` | Unchanged; fed by the renamed `demos` folder. |
| `/components` | Index: grid of pilot components, each with example count. |
| `/components/[component]` | Per-component gallery: component-list sidebar, example cards (live render + code + install command + anchor). Only components with produced examples are listed. |
| `/blocks` | Pro directory: group tabs + category cards. |
| `/blocks/[group]` | Group page: its category cards. |
| `/blocks/[group]/[category]` | Category page: pro blocks as live iframes with Pro badge, install command, Get Pro CTA. Theme customizer panel stays here. |
| `/blocks/preview/[slug]` | Deleted (was the free-block preview route). Pro previews come from the pro origin via the existing `/previews/*` rewrite. |

Header tabs: `Docs → /docs`, `Components → /components` (currently points
at `/docs/components/button`), `Blocks → /blocks`, `Pro → /pro`. The
Blume sidebar/nav inside docs is untouched.

## Registry namespaces

| Namespace | Content | Source |
|---|---|---|
| `/r/<name>.json` | ui primitives + theme/style only | `packages/registry` (registry.json trimmed to ui) |
| `/r/demo/<name>.json` | docs demos | `packages/registry/demos` (own registry.json) |
| `/r/component/<name>.json` | /components gallery items | `packages/registry/components` (own registry.json) |
| `/r/pro/<name>.json` | pro blocks | pro repo (existing rewrite, unchanged) |

The same item name may exist in two namespaces; collisions are
structurally impossible. Demo item names stay descriptive
(`accordion-demo`); gallery items are numbered (`accordion-01`) with
descriptive titles ("Accordion with icons").

### `examples → demos` rename

1. `git mv packages/registry/examples packages/registry/demos`.
2. Demo item definitions move out of the main `registry.json` into
   `packages/registry/demos/registry.json`; file paths become relative to
   that root (`accordion/accordion-demo.tsx`) — the pattern proven by
   `packages/blocks`.
3. `apps/web/blume.config.ts` `examples.source`/`examples.css` point at
   `demos` (the `examples:` key itself is Blume API, stays).
4. `demos/theme.css`: its `@source ".../examples"` line becomes
   `.../demos` (keep the five `../` segments — paths resolve relative to
   `.blume/src/generated`); comments updated.
5. `scripts/check-registry.mjs` loads three registries (ui, demos,
   components) and applies the same checks (lucide dep, version pins,
   theme parity against `demos/theme.css`). Blocks references removed.
6. Demo `registryDependencies` already use full URLs
   (`https://sevenui.dev/r/accordion.json`) — unchanged. Any docs UI that
   prints a demo install command switches to the `/r/demo/` URL.
7. MDX `<Component path="accordion/accordion-demo" />` paths are relative
   to `examples.source` — unchanged. Tests import `@/registry/base/ui/*`
   — unaffected.

Old `/r/accordion-demo.json` URLs move to `/r/demo/...` with no
redirects.

### Build

`build:registry` becomes three shadcn builds:

```
shadcn build -c ../../packages/registry            -o ../../apps/web/public/r
shadcn build -c ../../packages/registry/demos      -o ../../apps/web/public/r/demo
shadcn build -c ../../packages/registry/components -o ../../apps/web/public/r/component
```

The `packages/blocks` build line is deleted.

## `/components` — free gallery

**Content folder:** `packages/registry/components/<component>/<example>.tsx`
(e.g. `components/accordion/accordion-01.tsx`).

**Registry items:** type `registry:component` (single-file,
component-scale; `registry:block` stays reserved for page-section scale
on the pro side). `registryDependencies` points at the ui component.
Install: `npx shadcn add https://sevenui.dev/r/component/accordion-01.json`.
Demo conventions apply: English content, `/placeholder.svg`, animation
CSS in the example's own file.

**Pages (Astro, static):**

- `/components/index.astro` — grid of pilot components with example
  counts.
- `/components/[component].astro` — component-list sidebar (reuse the
  blocks-sidebar pattern); example cards with live render (React island,
  `client:visible` — no iframes at component scale), Preview/Code toggle
  (source read at build, highlighted with Shiki), copyable install
  command, per-example anchor.

**Tailwind:** the new folder is outside the app root — add
`@source ".../packages/registry/components"` to `apps/web/theme.css`
(dev-server restart required; known trap).

**Pilot scope:** 10 components × 4–6 examples ≈ 40–60 items:
`accordion, button, badge, card, dialog, dropdown-menu, input, select,
switch, tabs`. Later waves extend coverage; the index only lists
components that have examples.

## `/blocks` — pro directory

### Data flow (decision: build-time manifest)

The web build fetches the enriched manifest from the pro origin
(`PRO_MANIFEST_URL` env, default
`https://pro.sevenui.dev/r/pro-manifest.json`) and statically generates
all `/blocks` pages. Build **fails hard** if the manifest is unreachable
— safer than silently publishing an empty `/blocks`. The current
client-side pro fetch script is removed. The pro repo triggers a web
rebuild via a Vercel deploy hook on every pro deploy.

Rejected alternatives: runtime client rendering (SEO loss, sidebar/count
flicker, client routing complexity) and hybrid taxonomy-in-web
(two-repo sync for every new category).

### Manifest schema (single source of truth: pro repo)

```json
{
  "groups": [
    {
      "id": "application",
      "label": "Application",
      "description": "Blocks for product interfaces.",
      "icon": "layout-dashboard"
    }
  ],
  "categories": [
    {
      "id": "dashboard",
      "group": "application",
      "label": "Dashboard",
      "description": "...",
      "cover": {
        "type": "image",
        "src": "https://pro.sevenui.dev/assets/blocks/dashboard.png",
        "darkSrc": "https://pro.sevenui.dev/assets/blocks/dashboard-dark.png"
      }
    }
  ],
  "items": [
    {
      "name": "dashboard-01",
      "title": "Dashboard 01",
      "description": "Overview dashboard with stat cards and a recent-orders table.",
      "category": "dashboard",
      "previewHeight": 720
    }
  ]
}
```

- **Group `icon`:** a lucide icon key as a plain string. The web side
  renders it from `lucide-react`; the build validates the key against the
  lucide icon set and fails naming any unknown key.
- **Category `cover`:** `Asset = { type: "image" | "svg", src, darkSrc? }`.
  Both types render via `<img>`; production priority is image. Cards use
  a fixed `aspect-ratio: 16/9` box with `object-cover`. `darkSrc` is
  optional — shown in dark theme when present, otherwise `src` serves
  both themes.
- **Cover fallback:** a category without a `cover` uses the project's
  `/placeholder.svg` in the same 16:9 box. Missing fields never block
  the build; present fields are validated (`type` valid, `src` an
  absolute `https` URL) and fail the build otherwise.
- Asset files are served by the pro origin (absolute URLs; no CORS issue
  for `<img>`).

### Web-side loader (`pages/blocks/_data.ts` rewrite)

Preserves the current guard patterns, now against the manifest: every
item's `category` must exist, every category's `group` must exist,
duplicate ids fail the build, group id `preview` stays reserved
(shadowed by the static route segment).

### Pages

- `/blocks/index.astro` — group tabs (with lucide icons and counts) +
  category cards (16:9 cover, label, block count).
- `/blocks/[group]/index.astro` — the group's category cards.
- `/blocks/[group]/[category].astro` — blocks as live iframes
  (`/previews/<name>`, `previewHeight`), Pro badge, title/description,
  copyable `npx shadcn add https://sevenui.dev/r/pro/<name>.json`
  (install is already license-gated; the command is not secret), Get Pro
  CTA. The theme customizer panel carries over (proven against pro
  preview iframes).
- Viewport toggles (desktop/tablet/mobile): out of scope for v1.

### Work delegated to the sevenui-pro session (prerequisite)

1. Extend `pro-manifest.json` to the schema above (`dashboard-01` gets
   `category: "dashboard"`; groups/categories defined).
2. Serve category cover assets; fill `cover` fields (image priority).
3. Set up the Vercel deploy hook: pro deploy → web rebuild (manual
   dashboard step; provide the user a walkthrough).
4. (Later, separate task) automated preview screenshots for richer
   cards.

The pro manifest schema must be live before the web build can pass.

## Free-block teardown

1. Delete the `packages/blocks` package (and its workspace entry).
2. Delete `apps/web/pages/blocks/preview/[slug].astro`; replace
   `index`/`[group]`/`[category]` with the pro versions (old taxonomy and
   `PREVIEW_STAGES` go away; guard patterns migrate to the new loader).
3. Remove the blocks line from `build:registry` and the `public/r/blocks`
   output.
4. Remove `BLOCKS_ROOT` and related checks from `check-registry.mjs`.
5. In `apps/web/theme.css`, replace
   `@source ".../packages/blocks/blocks/**/*.tsx"` with
   `@source ".../packages/registry/components"`.
6. `block-frame.astro`, `category-illustration.astro`,
   `blocks-sidebar*.astro`, `blocks-customizer.astro` are reused by the
   pro pages where they fit; free-only leftovers are cleaned up.
   (`category-illustration` may become unused once covers ship — delete
   if nothing references it.)

## Verification

- **Build:** `pnpm build` (three registry namespaces + Astro) passes;
  `check-registry.mjs` green across all three registries.
- **Registry parity:** ui items in `/r/*.json` byte-identical before and
  after the rename; demo payloads content-diffed (fields identical, only
  location moved).
- **Install smoke test:** one ui item, one `/r/demo/` item, one
  `/r/component/` item install cleanly into a fresh project
  (smoke-test.sh pattern).
- **Browser check** (established workflow): `/components` index + one
  component page in light/dark; `/blocks` index/group/category + the
  customizer applying to a pro iframe; docs demos intact after the
  rename.
- **Tests:** the 525-test suite passes untouched (ui imports don't
  change).

## Sequencing

1. sevenui-pro: manifest schema + assets + deploy hook (prerequisite).
2. Web: registry namespace split + `demos` rename (independent of pro).
3. Web: `/components` skeleton + pilot content waves.
4. Web: `/blocks` pro rebuild + free-block teardown (needs step 1 live).
