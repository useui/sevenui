# Theme Customizer — Design

**Date:** 2026-09-12
**Status:** Approved
**Scope:** Two repos — this one (`sevenui`, the public site + registry) and `sevenui-pro` (the private paid-blocks repo whose static previews render inside iframes on the `/blocks` gallery).

## Goal

Let a visitor customize the theme of every block preview on the `/blocks` gallery — primary color, base (neutral) color, and radius — the way ui.shadcn.com/create does, and have that customization apply to **both free and pro block previews live**, without reloading any iframe.

The customization affects **preview documents only**. The site's own chrome (gallery pages, docs, landing, account/profile pages) never changes: the applier script that turns the stored config into CSS is only ever loaded by preview documents, so the config is inert everywhere else.

The customization is **preview-only** in effect: it never changes registry output, installed block source, or the `/r/*.json` byte-parity contract. Blocks are written against shadcn design tokens, so a paying user gets their own theme in their own project automatically.

## Current state (verified 2026-09-12)

- Free block previews (`apps/web/pages/blocks/preview/[slug].astro`) are same-origin pages embedded by `block-frame.astro`. Light/dark sync already works via `localStorage["blume-theme"]` + the native `storage` event — no postMessage.
- Pro block previews are embedded **cross-origin**: `apps/web/pages/blocks/index.astro` renders `<iframe src="https://pro.sevenui.dev/previews/<name>/">` from the ungated manifest. Because of that, pro previews cannot see `blume-theme` and today only follow OS `prefers-color-scheme` — the site's theme toggle does not reach them. This is an existing bug this design fixes as a side effect.
- The paid-blocks infrastructure spec (`sevenui-pro/docs/specs/2026-09-08-paid-blocks-infrastructure-design.md`) already planned serving pro previews under the sevenui.dev domain via a rewrite; that rewrite has not been added yet. This design makes it a prerequisite.
- The full shadcn token set is currently defined in four places (`apps/web/theme.css`, `packages/registry/examples/theme.css`, and `sevenui-pro/previews/src/preview.css`, plus the values shipped in registry JSON). This design does **not** consolidate those; it adds preset data in exactly one place and both repos consume it.

## Prior art: how ui.shadcn.com/create works (researched from shadcn-ui/ui)

Findings that shaped this design:

- **Token model.** A *base color* is a full hand-authored token set (background, card, border, muted, sidebar-\*, chart-\*, …) in light and dark. A *theme* (the primary color) is a **partial overlay** containing only `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `chart-1..5`, `sidebar-primary`, `sidebar-primary-foreground` — merged over the base color, theme wins.
- **Nothing is computed.** Every value, including dark-mode variants and every `primary-foreground`, is hand-picked per theme per mode. There is no runtime contrast math; correct pairing is guaranteed because `primary` and `primary-foreground` always travel together in the same hand-authored overlay.
- **Application mechanism.** A runtime `<style>` tag whose text is plain CSS — one `:root { … }` rule for light values, one `.dark { … }` rule for dark — rewritten on every change. No inline styles for colors, no pregenerated per-combination CSS.

We adopt the token model and the runtime `<style>` tag. We do **not** adopt their transport (postMessage + URL preset codes): our previews become same-origin, so the `storage` event — the mechanism the free previews already use for dark mode — carries the config with zero protocol code.

## Decisions (approved)

| Decision | Choice |
| --- | --- |
| Scope | Customizer UI in this repo + config transport + pro-repo application, one contract |
| Customizable fields | Primary theme color, base (neutral) color, radius. No fonts, no chart color (YAGNI) |
| Effect | Previews only; installed code unchanged |
| UI placement | Global "Customize" panel on `/blocks` pages; applies to all previews (free + pro) |
| Color model | Hand-authored presets (shadcn-style), no free color picker |
| Persistence | `localStorage["preset-config"]`, validated with zod, silent fallback to default |
| Transport | Same-origin rewrite for pro previews + native `storage` events |
| Site chrome | Never affected — applier only loaded in preview documents |

## Architecture

```
┌─ sevenui.dev (Vercel #1, this repo) ─────────────────────────────┐
│  /blocks gallery page                                            │
│    ├─ Customize panel ──writes──▶ localStorage["preset-config"]  │
│    ├─ <iframe /blocks/preview/<slug>>          (free, existing)  │
│    └─ <iframe /previews/<name>/>               (pro, via NEW     │
│         rewrite → pro.sevenui.dev/previews/<name>/)              │
│                                                                  │
│  storage event (same origin) ──▶ every open preview iframe       │
│    └─ applier: readPresetConfig() → <style id="preset-vars">     │
└──────────────────────────────────────────────────────────────────┘
```

One write to `localStorage["preset-config"]`; every open preview document (free and pro alike, all same-origin after the rewrite) receives the native `storage` event and re-applies. The writing document itself receives no event — irrelevant, since the gallery chrome is not themed anyway.

## 1. Config contract

Key: `localStorage["preset-config"]`. Value: JSON.

```ts
{
  version: 1,
  baseColor: "neutral" | "stone" | "zinc" | "gray" | "slate",
  theme:  "neutral" | "blue" | "green" | "orange" | "red"
        | "rose" | "violet" | "yellow",
  radius: "none" | "small" | "default" | "large"
}
```

- Read path is always `readPresetConfig(storage)`: `JSON.parse` inside try/catch, then zod `safeParse`. Any failure — missing key, malformed JSON, unknown field value, unrecognized `version` — silently yields `DEFAULT_PRESET_CONFIG` (`{ version: 1, baseColor: "neutral", theme: "neutral", radius: "default" }`). A preview never breaks and never shows an error because of a bad config.
- The default config renders **byte-identical to today**: when the resolved config equals the default, the applier removes the `<style>` tag entirely instead of writing default values.
- `version` exists for forward evolution (e.g. adding fonts later). Readers only accept versions they know; unknown versions fall back to default rather than guessing.
- Radius steps (shadcn's values): none = `0`, small = `0.45rem`, default = `0.625rem` (current value), large = `0.875rem`.

## 2. Shared preset package — `packages/presets` (`@sevenui/presets`)

A new, small workspace package. It exists so preset data and the applier live in **exactly one place**; `apps/web` imports it directly, `sevenui-pro` imports it through its `vendor/sevenui/packages/presets/` submodule path. `packages/registry` is untouched — its internal layout is the `/r/*.json` byte-parity contract and never gains new responsibilities.

Dependency: `zod` (not currently in the workspace; scoped to this package).

### `schema.ts`

- `presetConfigSchema` (zod), `PresetConfig` type, `DEFAULT_PRESET_CONFIG`.
- `readPresetConfig(storage: Pick<Storage, "getItem">): PresetConfig` — the tolerant read described above. Takes the storage object as a parameter so tests need no DOM.

### `presets.ts`

Hand-authored oklch values, shadcn's split:

- `BASE_COLORS: Record<BaseColorName, { light: TokenMap; dark: TokenMap }>` — **full** token sets (all tokens that `theme.css` / `preview.css` define today: background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart-1..5, sidebar-\*). `neutral` reproduces today's values exactly.
- `THEMES: Record<ThemeName, { light: Partial<TokenMap>; dark: Partial<TokenMap> }>` — **partial** overlays: `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `chart-1..5`, `sidebar-primary`, `sidebar-primary-foreground` (shadcn's exact overlay key set — `ring` stays with the base color). Every `primary` ships with its hand-picked `primary-foreground` in the same object for both modes — that adjacency is the contrast guarantee. `neutral` is an empty overlay (base color's own primary shows through).
- `RADIUS: Record<RadiusName, string>`.
- `resolvePreset(config): { light: TokenMap; dark: TokenMap }` — pure merge: `{ ...base.light, ...theme.light }` (theme wins), plus `--radius` when not default.
- Values are picked from the same Tailwind-derived ramps shadcn uses; dark primaries are separately picked (usually a lightness-shifted step of the same hue), not derived.

### `apply.ts`

DOM applier, imported **only by preview documents**:

- `applyPresetConfig(doc?)` — reads the config, resolves it, and writes a `<style id="preset-vars">` element in `<head>` whose text is:

  ```css
  :root { --background: …; --primary: …; … }
  .dark, [data-theme="dark"] { … }
  ```

  Emitting both dark selectors keeps one applier valid in every preview context: free previews use Blume's `data-theme` convention, the pro workbench toggles a class. When the config is the default, the element is removed instead.
- `watchPresetConfig(doc?)` — calls `applyPresetConfig` once, then subscribes to `storage` events. Re-applies when `event.key === "preset-config"` or `event.key === null` (a `localStorage.clear()`), ignores every other key — same discrimination the existing blume-theme sync script uses.
- No framework dependency; plain DOM so both an Astro inline-module script and the pro Vite entries can use it.

## 3. Same-origin rewrite (prerequisite)

- `apps/web/vercel.json` gains: `{ "source": "/previews/:path*", "destination": "https://pro.sevenui.dev/previews/:path*" }`. The pro build already namespaces everything under `/previews/` (Vite `base: "/previews/"`), so pages **and** their assets are covered by the single rewrite.
- `apps/web/pages/blocks/index.astro` switches the pro iframe `src` to the relative `/previews/${item.name}/`.
- Consequence: pro previews run on the sevenui.dev origin and can read both `preset-config` and `blume-theme`. In local dev of `apps/web`, `/previews/*` does not resolve — acceptable, because the pro section is already hidden in dev (the manifest fetch fails and the section stays hidden).
- Direct visits to `pro.sevenui.dev/previews/*` keep working; there the localStorage keys are absent, so previews render the default theme with the system color scheme — correct degradation.

## 4. Consumers in this repo (`apps/web`)

### Free preview route (`pages/blocks/preview/[slug].astro`)

Add a module script that calls `watchPresetConfig()`. It complements the existing blume-theme sync script (which keeps handling light/dark); the two mechanisms compose because preset CSS defines *values* for both modes and the theme attribute selects *which set* applies.

### Customizer panel

- A `Customize` control on the `/blocks` pages (gallery header toolbar area), opening a panel/popover with three groups — theme color swatches, base color list, radius options — plus a **Reset** action.
- Its only side effect is writing `localStorage["preset-config"]` (Reset removes the key). Open iframes update via the storage event; nothing else on the page reacts, by design.
- Panel state initializes from `readPresetConfig(localStorage)` so it reflects the persisted choice after navigation.
- Styled with the site's own tokens (site chrome is not themed, so the panel stays visually stable while previews change).
- Implementation shape (Astro component + inline module script vs. a React island) is left to the implementation plan; the contract above is what matters.

## 5. Consumers in `sevenui-pro`

- New `previews/src/frame.tsx` bootstrap: calls `watchPresetConfig()` (imported from `vendor/sevenui/packages/presets/`) and exposes the shared mount helper; every per-block preview entry (`previews/src/<name>.tsx`) goes through it. The promotion workflow in AGENTS.md is updated so new preview entries use the bootstrap.
- **Dark-mode sync fix (existing bug):** the inline `prefers-color-scheme` script in `previews/<name>/index.html` is replaced with the free-preview pattern — resolve `localStorage["blume-theme"]` with system fallback, set `data-theme` on the root element, listen to `storage` for live toggles. `preview.css` already matches `[data-theme="dark"]`.
- **Workbench (dev-only):** the toolbar gains a preset picker writing the same `preset-config` key, so a block under development can be reviewed in every theme; the workbench frames are same-origin locally, so the same mechanism works unchanged.
- The Vite `resolve.dedupe` note in the pro AGENTS.md applies: if `zod` ends up in a shared runtime path, it must be added to the dedupe list. (`@sevenui/presets` is dependency-light on purpose; only zod.)

## 6. Testing

**Unit — `packages/presets` (vitest, this repo):**
- `readPresetConfig`: missing key, malformed JSON, unknown theme name, wrong version, valid config — first four yield the default, byte-equal to `DEFAULT_PRESET_CONFIG`.
- `resolvePreset`: theme overlay wins over base color; neutral theme leaves base primary; radius only emitted when non-default.
- Structural invariants over the data: every base color defines the full token list in both modes; every theme overlay defines `primary` and `primary-foreground` together in both modes; every name in the zod enums has a data entry and vice versa.
- CSS emission: generated text contains exactly the two rules with the expected selectors; default config produces removal.

**Pro repo:** extend `check-registry.mjs` (or a small vitest) with the invariant that every promoted preview entry imports the `frame` bootstrap.

**Manual verification checklist:**
- Gallery: change theme/base/radius → every free and pro iframe updates live, no reload.
- Combine with the dark toggle: both orders (customize then toggle, toggle then customize).
- Site chrome check: profile/account, docs, landing pages unaffected while a custom theme is active.
- Corrupt `localStorage["preset-config"]` by hand → previews render default, no console errors.
- Direct visit to a preview URL shows the customized theme (expected: it is a preview surface).

## Out of scope (deliberate)

- Font selection, chart color, menu accent — shadcn/create features we skip for v1.
- Shareable preset URLs (`?preset=` encoding). The `version` field and the single-contract design leave room; shadcn's bit-packed base62 scheme is the reference if this comes later.
- Account-level persistence (Clerk) — localStorage only.
- Theming the installed output (a "download my theme" preset) — previews only.
- Consolidating the four existing copies of the default token set — pre-existing duplication, separate concern.

## Rollout order

1. `packages/presets` with schema, data, applier, and unit tests (this repo) — pure addition, no visible change.
2. Pro repo: rewrite-ready previews — frame bootstrap, blume-theme dark sync fix, workbench picker (consumes the submodule bump).
3. This repo: the `/previews/:path*` rewrite + relative pro iframe src — fixes dark-mode sync for pro previews on its own.
4. This repo: applier in the free preview route + the Customize panel — the user-visible feature, last.

Each step ships independently and nothing user-visible changes until step 4.
