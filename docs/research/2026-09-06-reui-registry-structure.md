# reUI registry structure — research notes

Date: 2026-09-06. Source: primary only — `keenthemes/reui` GitHub repo, default branch `main`
(default branch confirmed via https://api.github.com/repos/keenthemes/reui), plus in-repo docs
content (`content/docs/`). File citations are `path` on `keenthemes/reui@main` unless a full URL
is given. Repo version at time of research: `"version": "2.5.2"` (`package.json`), last push
2026-09-01 (GitHub API `pushed_at`).

## 1. Directory layout

reUI is a **single Next.js app at the repo root** (`app/`, `next.config.mjs`, `content/docs/`
with fumadocs) that contains the registry sources, plus a pnpm workspace
(`pnpm-workspace.yaml`) whose only workspace packages are **generated** preview bundles under
`packages/registry/` (full tree: https://api.github.com/repos/keenthemes/reui/git/trees/main?recursive=1, 8087 entries, not truncated).

Two separate registry source trees, both keyed by "base" (primitive library):

- `registry/bases/{base,radix}/{ui,hooks,lib}/` — **vendored shadcn v4 base primitives**, one
  full copy per primitive library. Each dir has a `_registry.ts` item manifest. Evidence that
  this mirrors upstream shadcn: item `meta.links.docs` point at
  `https://ui.shadcn.com/docs/components/base/accordion` and
  `https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/accordion-example.tsx`
  (`registry/bases/base/ui/_registry.ts`), and a comment in `scripts/build-registry.mts`:
  "`registry/bases.ts` mirrors upstream shadcn and lists every base it ships, including ones
  this repo has no source for (React Aria)".
- `registry-reui/bases/{base,radix}/{reui,components,hooks}/` — **reUI's own source of truth**:
  - `reui/` = 19 in-house primitives (data-grid, gantt, kanban, cascader, filters, stepper,
    timeline, tree, autocomplete, ...), each base flavor hand-maintained; manifest in
    `registry-reui/bases/base/reui/_registry.ts` (and `.../radix/reui/_registry.ts`).
  - `components/<category>/c-<category>-N.tsx` = ~1000 composed example blocks ("patterns"),
    e.g. `registry-reui/bases/base/components/accordion/c-accordion-1.tsx`, with per-category
    `meta.json` (name/title/description/order).
  - `registry-reui/_meta/components/registry.json` = generated category/count metadata
    (categories + totalComponents), `registry-reui/_meta/components/bases/{base}/<name>.json` =
    per-item metadata shards.
- `registry/` root also holds design-system config: `registry/bases.ts` (base list:
  `base` = Base UI, `aria` = React Aria, `radix` = Radix, each a `registry:style` item),
  `registry/styles.tsx`, `registry/themes.ts`, `registry/fonts.ts`, `registry/base-colors.ts`,
  `registry/icons/` (lucide/tabler/hugeicons/phosphor/remixicon loaders), and
  `registry/styles/style-{luma,lyra,maia,mira,nova,rhea,sera,vega}.css`.
- **App-level (site) hooks/lib are separate** from registry hooks/lib: top-level `hooks/`
  (`hooks/use-mobile.ts`, `hooks/use-config.ts`, ...) and `lib/` serve the docs site; registry
  consumers get `registry/bases/{base}/hooks/use-mobile.ts` and
  `registry/bases/{base}/lib/utils.ts` instead (tree listing).
- `packages/registry/bases/{base,radix}/components/<category>/` — generated esbuild-bundled
  workspace packages named `@reui/components-<base>-<category>` used only for live previews in
  the docs app ("Source of truth stays in `registry-reui/bases/<base>/components/`. Packages
  are derived artifacts." — header comment, `scripts/build-component-packages.mts`; package
  shape in `packages/registry/bases/base/components/accordion/package.json`, name
  `@reui/components-base-accordion`, `private: true`). All 140+ are `workspace:*` deps of the
  root app (`package.json`).
- Built consumer-facing registry JSON is committed under `public/r/styles/<style>/<name>.json`
  (tree listing; see §4).

## 2. Import aliases inside component sources

All registry source files import through the app-wide `@/` alias pointing at the **full
registry path**, never `@/components/ui/...` in source. Verbatim:

`registry/bases/radix/ui/alert-dialog.tsx`:

```tsx
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { cn } from "@/registry/bases/radix/lib/utils"
import { Button } from "@/registry/bases/radix/ui/button"
```

`registry/bases/base/ui/alert-dialog.tsx`:

```tsx
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"

import { cn } from "@/registry/bases/base/lib/utils"
import { Button } from "@/registry/bases/base/ui/button"
```

`registry/bases/base/ui/combobox.tsx`:

```tsx
import { cn } from "@/registry/bases/base/lib/utils"
import { Button } from "@/registry/bases/base/ui/button"
import { ... } from "@/registry/bases/base/ui/input-group"
import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder"
```

(`IconPlaceholder` is a build-time placeholder swapped per icon library; same import appears in
`registry/bases/base/ui/calendar.tsx`.)

reUI's own primitives import the vendored shadcn primitives the same way —
`registry-reui/bases/base/reui/autocomplete.tsx`:

```tsx
import { cn } from "@/registry/bases/base/lib/utils"
import { ScrollArea } from "@/registry/bases/base/ui/scroll-area"
```

Example blocks import both trees — `registry-reui/bases/base/components/accordion/c-accordion-1.tsx`
imports from `"@/registry/bases/base/ui/accordion"`;
`registry-reui/bases/base/components/data-grid/c-data-grid-1.tsx` imports from
`"@/registry-reui/bases/base/reui/data-grid/data-grid"` etc.

`cn` helper: `registry/bases/base/lib/utils.ts` is the standard `clsx` + `tailwind-merge` `cn`.
Registry hooks live at `registry/bases/{base}/hooks/use-mobile.ts` and are rewritten to
`@/hooks/` on publish (see §4 transform).

## 3. Local resolution (tsconfig / components.json)

`tsconfig.json`: single catch-all alias — `"baseUrl": ".", "paths": { "@/*": ["./*"] }` (plus a
`react` types pin). `packages` and `scripts` are excluded from the app tsconfig (they have
`tsconfig.scripts.json` / per-package tsconfigs). So `@/registry/bases/base/ui/button` resolves
to `<repo-root>/registry/bases/base/ui/button.tsx` with no per-registry alias.

`components.json` (the repo's own, for dogfooding): `"style": "new-york"`, standard aliases
(`"components": "@/components"`, `"utils": "@/lib/utils"`, `"ui": "@/components/ui"`,
`"lib": "@/lib"`, `"hooks": "@/hooks"`), `iconLibrary: "lucide"`, and a `registries` map
including `"@reui": "https://reui.io/r/{style}/{name}.json"` (also `@magicui`, `@diceui`,
`@svgl`).

## 4. registry.json shape and build pipeline

**No top-level `registry.json`; no `shadcn build`.** The registry is generated by three custom
`tsx` scripts (`package.json` scripts; script sources in `scripts/`):

1. `scripts/build-components.mts` (`pnpm components:build`, runs on `postinstall`/`predev`) —
   scans `registry-reui/` and emits metadata under `registry-reui/_meta/` (categories, counts,
   search payloads). It also defines `COMMON_PACKAGES = ["react","react-dom","next","@types/react","@types/react-dom"]`
   excluded from item `dependencies`.
2. `scripts/build-component-packages.mts` (`pnpm components:packages`) — emits the
   `packages/registry/**` preview bundles (docs-site only).
3. `scripts/build-registry.mts` (`pnpm registry:build`, run via `prebuild`→`registry:prod`
   before `next build`) — "Pre-compiles registry items into static JSON files in
   `public/r/styles/` ... served directly from the CDN edge" (header comment). Output
   (committed to the repo, verified in the git tree):
   - `public/r/styles/index.json` — style list: `default` + `{base,radix}-{vega,nova,maia,lyra,mira,luma,sera,rhea}` (16 named styles).
   - `public/r/styles/{style}/registry.json` — per-style catalog manifest
     (`{"name":"reui","homepage":"https://reui.io","items":[...]}` without file content;
     verified at `public/r/styles/base-nova/registry.json`).
   - `public/r/styles/{style}/{name}.json` — 78 style-aware reUI primitive items per style;
     the two `*-nova` styles additionally carry all ~1100 `c-*` example items (file counts from
     the git tree: 78 JSON in `base-luma`, 1187 in `base-nova`). `registry:verify` validates
     output; `next.config.mjs` redirects legacy `/r/default/*`, `/r/new-york/*`, `/r/:name.json`
     to `/r/styles/base-nova/*`.

   The script imports item types from the shadcn package (`import { type Registry } from
   "shadcn/schema"` in every `_registry.ts`; `shadcn/icons` in `registry/config.ts`); the
   `shadcn` CLI is a devDependency pinned at `"shadcn": "4.16.1"` (`package.json`).

**Item shape** (verified in `public/r/styles/base-nova/alert.json` and
`.../c-accordion-1.json`, `.../c-data-grid-1.json`):

- `$schema`: `https://ui.shadcn.com/schema/registry-item.json`.
- Primitives are `"type": "registry:ui"` with `files[].target` like
  `"components/reui/alert.tsx"`; example blocks are `"type": "registry:block"` with target
  `"components/examples/c-accordion-1.tsx"`; some items carry `cssVars.light/dark` (alert).
- `dependencies`: bare npm names, occasionally version-pinned in the source manifests
  (`"react-day-picker@latest"`, `"recharts@3.8.0"` in `registry/bases/radix/ui/_registry.ts`).
- `registryDependencies` come in **two flavors**:
  - bare names for vendored shadcn primitives — `["accordion"]` (c-accordion-1),
    `["scroll-area"]` (autocomplete) — left for the consumer's CLI/style to resolve;
  - namespaced `@reui/*` for reUI's own primitives —
    `["@reui/data-grid", "@reui/data-grid-pagination", ...]` (c-data-grid-1). Never full URLs.
- **Import rewriting at build time** (`transformImportPaths()` in `scripts/build-registry.mts`):
  `@/registry(-reui)/bases/{base}/ui/` → `@/components/ui/`, `.../reui/` → `@/components/reui/`,
  `.../hooks/` → `@/hooks/`, `.../lib/` → `@/lib/`, `.../components/` → `@/components/examples/`.
  Verified in output: `c-accordion-1.json` content imports
  `"@/components/ui/accordion"`; `alert.json` imports `"@/lib/utils"`;
  `c-data-grid-1.json` imports `"@/components/reui/data-grid/data-grid-pagination"`.

## 5. Primitive-library (Radix / Base UI) handling

- Radix items declare the **unified `radix-ui` package**, not `@radix-ui/react-*`:
  `dependencies: [..., "radix-ui"]` throughout `registry-reui/bases/radix/reui/_registry.ts`,
  and source imports `import { AlertDialog as AlertDialogPrimitive } from "radix-ui"`
  (`registry/bases/radix/ui/alert-dialog.tsx`). Root `package.json` has `"radix-ui": "^1.4.3"`
  (the individual `@radix-ui/react-*` entries there serve the docs site itself).
- **Base UI is a first-class base**: `registry/bases.ts` declares `base` (deps
  `["@base-ui/react"]`), `radix` (deps `["radix-ui"]`) and `aria` (deps
  `["react-aria-components"]`) as `registry:style` items; the repo ships full parallel source
  trees for `base` and `radix` only — React Aria is declared but skipped at build time
  ("Skipping mirrored base(s) not shipped by this repo", `scripts/build-registry.mts`).
  `@base-ui/react` is pinned to `1.5.0` (`package.json`). Base UI source imports use
  per-component subpaths: `from "@base-ui/react/alert-dialog"`
  (`registry/bases/base/ui/alert-dialog.tsx`).
- Even under the `radix` base, items with no Radix primitive keep Base UI: built
  `public/r/styles/radix-nova/autocomplete.json` has
  `dependencies: ["@base-ui/react", "class-variance-authority"]` and imports
  `@base-ui/react/autocomplete`.
- The base × style matrix is published as `{base}-{style}` registry styles
  (`base-nova`, `radix-nova`, ... — `public/r/styles/index.json`).

## 6. Consumer installation

From `content/docs/(root)/get-started.mdx` and `content/docs/(root)/registry.mdx`:

- Consumer adds the namespace to `components.json` and picks a style:

  ```json
  {
    "style": "base-nova",
    "registries": {
      "@reui": "https://reui.io/r/{style}/{name}.json"
    }
  }
  ```

  "The registry ships every component in multiple styles. Set your preferred style in
  `components.json` (for example `base-nova` or `radix-nova`) and the CLI pulls the matching
  source." (`registry.mdx`). The `{style}` placeholder in the registry URL is how one namespace
  serves both primitive libraries and all 8 visual styles.
- Install command uses the namespace, not raw URLs:
  `npx shadcn@latest add @reui/c-alert-1` (`registry.mdx`); README shows
  `npx shadcn@latest add @reui/c-button-10`, `@reui/c-data-grid-9`, `@reui/c-filters-5`
  (`README.md`, "Installation").
- "Some `c-*` items pull shared `@reui/*` primitives such as `@reui/alert` or
  `@reui/data-grid` as registry dependencies. Those supporting files are resolved
  automatically" (`registry.mdx`). No license key for free items; docs recommend the standard
  shadcn scaffold first (`get-started.mdx`).

## Takeaways relevant to SevenUI

- reUI solves multi-primitive support with **fully duplicated per-base source trees**
  (`bases/base` vs `bases/radix`) and encodes the base into the published *style name*
  (`base-nova`), so a single `{style}` URL placeholder in the consumer's `components.json`
  selects both primitive library and visual style.
- Source files import registry-absolute paths (`@/registry/bases/<base>/ui/...`) resolved by a
  single `@/*` tsconfig alias; a custom build rewrites them to consumer aliases
  (`@/components/ui/...`, `@/lib/utils`) — the same rewrite strategy shadcn's own repo uses,
  implemented here in `scripts/build-registry.mts` rather than `shadcn build`.
- registryDependencies mix bare shadcn names (delegated to the consumer's default registry)
  with `@reui/*` self-references; no absolute URLs anywhere.
- Registry output is pre-compiled static JSON committed under `public/r/` and served from CDN,
  with a per-style `registry.json` catalog (no file contents) alongside per-item files.
