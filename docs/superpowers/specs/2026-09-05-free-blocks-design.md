# SevenUI — Free Blocks Design (v0.6.0)

**Date:** 2026-09-05
**Status:** Approved (design sections approved in conversation)
**Depends on:** `2026-09-05-monorepo-migration-design.md` (shipped: pnpm workspace, `apps/web` + `packages/registry`)
**Out of scope:** paid blocks platform (separate later spec), templates, app-shell/sidebar and dashboard block categories, in-gallery code viewer

## Summary

Add the first wave of free blocks — multi-component, copy-paste sections built exclusively from SevenUI components — as a new workspace package `packages/blocks` with its own registry, served under `https://sevenui.dev/r/blocks/<name>.json`, and presented on the site as a `/blocks` gallery with full-screen preview routes. Two categories, nine blocks, released as v0.6.0. Versioning stays 0.x: each phase continues to ship as a minor release; no v1.0 jump.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Phase decomposition | Free blocks only; paid platform is a separate later spec | Free blocks prove the format and become the paid tier's storefront; payment/licensing infra is an independent subsystem |
| Scope | Blocks only (no templates); 2 categories, 9 blocks | Narrow, provable first wave; templates and more categories iterate later |
| URL scheme | Tiered paths: `/r/<name>.json` (primitives, unchanged) · `/r/blocks/<name>.json` (this spec) · later `/r/templates/...` and `/r/pro/blocks/...` via rewrites to the private project | Clean product tiers in URL space; `/r/pro/*` door was left open by the migration spec; no collision with the flat public namespace |
| Nesting mechanism | `packages/blocks` has its OWN `registry.json` (simple item names like `login-01`); a second `shadcn build` pass outputs into `.../public/r/blocks` | Output-dir nesting keeps names simple; every tier owns its registry; the pro repo copies this exact pattern. (Slashed item names also verified to work — see Verified Tool Facts — but not used) |
| Item typing | Item `type: "registry:block"`; every file `type: "registry:component"` | `registry:block` is the CLI's purpose-built type; `registry:component` files land in the consumer's `components/` dir. `registry:page` deliberately NOT used — its mandatory `target` (e.g. `app/login/page.tsx`) assumes a Next app-router layout our consumers may not have |
| Component coupling | `registryDependencies` as full URLs (`https://sevenui.dev/r/button.json`), house style; block sources import components via the `@/registry/base/ui/*` alias | Same mechanism the existing registry uses; consumer-side CLI rewrites the imports (proven in production) |
| Presentation | `/blocks` gallery (custom page) + per-block full-screen preview route; NO per-block docs pages; code viewing = GitHub source link in v1 | Blocks are full-width experiences — docs preview iframes are too small; gallery reuses the landing's proven custom-page + React-island mechanism; YAGNI on an embedded code tab |
| Release | v0.6.0: CHANGELOG + git tag + blume `versions` bump | User decision: keep shipping a minor per phase; matches wave precedent |

## Verified Tool Facts (checked against installed shadcn CLI 4.19.1, 2026-09-05)

1. **The registry item type enum includes `registry:block`** (full dist grep: base, block, component, example, file, font, hook, internal, item, lib, null, page, style, theme, ui). Our blocks use it as the item type.
2. **File types map to consumer alias dirs:** `registry:ui` → `components/ui/`, `registry:component` → `components/`, `registry:lib` → `lib/`, `registry:hook` → `hooks/` (the sidebar `use-mobile.ts` smoke-test assertion is this mechanism); `registry:page` requires an explicit `target`.
3. **`shadcn build` accepts slashed item names** and writes nested output (empirical probe: `"name": "blocks/login-01"` → `out/blocks/login-01.json`, schema validation passes). We do NOT rely on this — nesting comes from the second build pass's `-o` — but it derisks the URL scheme end to end.
4. **The build copies the source `registry.json` into the output dir** (established during the migration) — so `/r/blocks/registry.json` will exist and serves as a free block index for the gallery and future tooling.

## Open Verifications (first tasks of the plan; each has a fallback)

1. **Slash-in-namespace install UX:** does `npx shadcn@latest add @sevenui/blocks/login-01` pass `blocks/login-01` into the `{name}` template? Verify against the installed CLI. Fallbacks, in order: document a second namespace `@sevenui-blocks` → `https://sevenui.dev/r/blocks/{name}.json`; or document direct-URL installs only.
2. **Blume custom-page dynamic routes:** can `apps/web/pages` express `blocks/preview/[slug].astro` with `getStaticPaths`? Fallback: one small `.astro` file per block (9 files — acceptable).
3. **Theme tokens on preview routes:** full-screen preview pages must pick up the site `theme.css` tokens (the landing does; confirm for new nested page paths).

## Block Set (9)

**auth** — `login-01` (card: email + password), `login-02` (split-screen with side visual), `login-03` (minimal, OTP-based), `signup-01` (card), `signup-02` (split-screen).
**marketing** — `hero-01`, `hero-02`, `pricing-01` (three-card), `pricing-02` (monthly/yearly toggle).

Every block: SevenUI components + Tailwind v4 utilities only — the existing dependency allowlist applies unchanged; no new third-party dependencies. Blocks may not depend on other blocks.

## Architecture

### `packages/blocks` (`@sevenui/blocks`)

```
packages/blocks/
├── registry.json              # blocks-only; simple names (login-01); $schema shadcn registry
├── blocks/
│   ├── auth/login-01/login-01.tsx        # main file; helpers as siblings when needed
│   ├── auth/…
│   └── marketing/…
├── tsconfig.json              # "@/registry/*" → "../registry/registry/*" (blocks import components house-style)
└── package.json               # @sevenui/blocks; typecheck script only
```

`packages/blocks/package.json` declares as devDependencies exactly what `tsc` needs to check block sources that import component sources through the alias: `typescript`, `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@base-ui/react` (and nothing at runtime — blocks ship as source through the registry, never as a package).

Registry item shape (canonical example):

```json
{
  "name": "login-01",
  "type": "registry:block",
  "title": "Login 01",
  "description": "Card-based login form with email and password.",
  "registryDependencies": [
    "https://sevenui.dev/r/button.json",
    "https://sevenui.dev/r/card.json",
    "https://sevenui.dev/r/field.json",
    "https://sevenui.dev/r/input.json"
  ],
  "files": [
    { "path": "blocks/auth/login-01/login-01.tsx", "type": "registry:component" }
  ]
}
```

Multi-file blocks list helper files after the main file, all `registry:component`. Registry `dependencies` (npm) should never be needed — blocks compose SevenUI components; if a block seems to need a new library, it is out of scope for this wave.

### Build wiring

`apps/web` `build:registry` becomes two passes:

```
shadcn build -c ../../packages/registry -o ../../apps/web/public/r
shadcn build -c ../../packages/blocks  -o ../../apps/web/public/r/blocks
```

The first pass is untouched — the existing 116-file `/r/*.json` output stays byte-identical (the migration's parity manifest remains valid; blocks live in a subdirectory the first pass never writes). `pnpm-workspace.yaml`'s `publicHoistPattern` needs no additions: blocks introduce no new SSR-externalized dependencies.

### Site: gallery + previews (`apps/web`)

- `pages/blocks/index.astro` — the gallery: category sections, one card per block with a live scaled-down preview (iframe onto the preview route), the install command, and a GitHub source link. Block metadata is imported from `../../packages/blocks/registry.json` (same pattern the landing uses with the components registry).
- `pages/blocks/preview/<name>.astro` (or `[slug].astro` per Open Verification 2) — full-screen render of the block as a React island; serves as the iframe source and as a shareable URL.
- Header nav gains a "Blocks" link; `docs/installation.mdx` gains a short "Blocks" section (tiered URL scheme + install command). No docs sidebar entries for blocks.

## Quality and Pipeline

- **check-registry extension:** run the same integrity checks over `packages/blocks/registry.json` — files exist, names unique, `registryDependencies` are full `https://sevenui.dev/r/<name>.json` URLs that resolve to items in the COMPONENTS registry (blocks may not depend on blocks) — plus: every block has a preview route file under `apps/web/pages/blocks/preview/`. The components-side "docs page exists" rule does NOT apply to blocks.
- **Smoke test extension:** install one block (`login-01`) from the local nested path, assert the block file lands under `components/`, its `registryDependencies` chain pulls the component files, and consumer `tsc` passes.
- **Typecheck:** `packages/blocks` joins `pnpm -r typecheck`.
- **No vitest for blocks** (composition, no novel behavior); visual verification via batched browser checkpoints in the plan (gallery, each category's blocks, dark mode, mobile-width spot check).
- CI unchanged (root script names stable).

## Release

v0.6.0: CHANGELOG entry, git tag, blume `versions` bump (v0.5.0 moves to archived — config entries only, consistent with existing practice of not cutting snapshot dirs). Post-merge verification: `/r/blocks/*.json` served correctly, the 116-file components parity manifest still matches production (blocks must not perturb it), live block install from the deployed domain, gallery/preview routes green.

## Execution

Wave pattern: this spec → implementation plan (writing-plans) → one PR, worktree + subagent-driven development; Global Constraints carry the dependency allowlist, English/Conventional Commits/no attribution trailers, and the components-parity guard; browser checkpoints batched; read-only re-verification gates before risk items (gallery/preview wiring); final docs/changelog/release task; post-merge deploy verification task.

## Non-Goals

- Paid blocks, licensing, payments, `/r/pro/*` implementation (separate spec; this spec only keeps the URL tiers consistent with that future).
- Templates (`/r/templates/...`), dashboard/sidebar/app-shell categories, feature-card blocks.
- In-gallery code viewer, per-block docs pages, block-level unit tests.
- Any change to existing component registry items or their URLs.
