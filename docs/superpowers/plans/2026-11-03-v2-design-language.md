# SevenUI v2 Design Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle all 66 SevenUI primitives in the v2 "D" language (layered surfaces, hairlines, electric-blue accent, offset focus ring, comfortable/compact density, equal-care light theme) on top of unchanged shadcn CSS variables.

**Architecture:** One new shared registry item, `sevenui-tokens`, ships only new CSS variables, a `focus-ring` utility and the density rules; every `registry:ui` item depends on it. New surface tokens are derived from shadcn variables so any shadcn theme or customizer preset still colours them. Primitives are then restyled in parallel batches against those tokens, each batch verified by tests, an API-freeze guard, and a visual "lab" page reviewed by subagents.

**Tech Stack:** React 19, Base UI 1.7, Tailwind CSS v4, class-variance-authority, shadcn registry CLI, Vitest 4 + jsdom + Testing Library, Next.js App Router (`apps/web`), pnpm workspace.

**Spec:** `docs/superpowers/specs/2026-11-03-v2-design-language-design.md` (read it first; visual target: `docs/superpowers/specs/2026-11-03-v2-design-language/reference-synthesis.html`).

## Global Constraints

- Branch `feat/v2` only. Never merge to `main`, never push, never open a PR, never stop a dev server the user started, unless the user says so in chat.
- Base UI only — no Radix, no react-aria. The four wrapper deps (react-day-picker, embla-carousel-react, recharts, react-resizable-panels) stay scoped to calendar, carousel, chart, resizable.
- shadcn CSS variables keep their names and meanings. `sevenui-tokens` never writes a shadcn variable.
- Public API is frozen, additive only: no renamed or removed export, variant, size, prop or `data-slot`. New optional variants are allowed.
- Never restructure `packages/registry` (byte-parity contract for `/r/*.json`, `/r/demo/*.json`, `/r/component/*.json`).
- Accent: dark `#4d7cff` (ring, switch, checkbox, indicators, links), dark filled-accent fill `#3a68f0`; light `#2f5ce8` for all uses. White text on accent fills.
- Focus: offset ring — control border unchanged, 2px gap, 1.5px accent ring. Replaces every `ring-3 ring-ring/50` halo.
- WCAG AA: text ≥ 4.5:1, focus ring and other non-text indicators ≥ 3:1, in both themes.
- Anti-goals: no gradients-for-decoration, glows, blooms, glassmorphism, emoji. Calm enough to adopt.
- Motion respects `prefers-reduced-motion` (`motion-reduce:` variants).
- Tailwind v4 traps (from layer-card): defaults via `[:where(&)]:[--x:…]`; radius via `--theme(--radius-*)` not `var(--radius-*)`; neutral base first in `color-mix()`; files using `useRender` need `"use client"`.
- English everywhere; kebab-case files; Conventional Commits; **no attribution trailers of any kind** in commit messages (AGENTS.md overrides any harness default).

## Review Focus

1. **Stock shadcn project, single primitive installed** — `npx shadcn add …/button.json` into a fresh shadcn app with the default neutral theme: tokens get written once, no shadcn variable changes, the button renders with the blue focus ring. Pinned by Task 15 (smoke test assertions).
2. **Customizer preset applied** (e.g. "rose" base, "none" radius) — derived surfaces follow the preset; nothing turns invisible or hard-coded grey; `radius: 0` does not produce invalid `calc()`. Pinned by Task 3 (`tokens-derive.test.ts`) and Task 14 (preset sweep).
3. **Compact density on a nested container only** — a `data-density="compact"` subtree tightens while siblings stay comfortable; popups portalled out of the subtree keep the density of their trigger's scope where Base UI allows a container, otherwise comfortable. Pinned by Task 3 (`density.test.tsx`) and each batch's lab matrix.
4. **Keyboard focus on every focusable part** (including menu items, tabs, slider thumbs, OTP slots, calendar days, sidebar items) shows the offset ring and nothing else. Pinned by each batch's `focus-ring` assertions.
5. **Reduced motion** — switch thumb spring, button press, overlay fades are removed or reduced under `prefers-reduced-motion`. Pinned by each batch's `motion-reduce:` class assertions.

---

## File structure

| Path | Responsibility |
|---|---|
| `packages/registry/registry.json` | Add `sevenui-tokens` item; add it to every `registry:ui` item's `registryDependencies` (Task 1 only — batches never touch this file). |
| `packages/registry/tests/tokens.test.ts` | Token item shape, key parity, contrast. |
| `packages/registry/tests/tokens-derive.test.ts` | Derived tokens reference shadcn vars only. |
| `packages/registry/tests/tokens-mirror.test.ts` | Site + demo CSS mirror the registry item exactly. |
| `packages/registry/tests/density.test.tsx` | Density attribute scoping. |
| `packages/registry/tests/api-freeze.test.ts` + `tests/__fixtures__/api-exports.json` | Export-name freeze. |
| `packages/registry/tests/helpers/contrast.ts` | `parseColor`, `contrastRatio` (oklch/hex → sRGB → WCAG). |
| `apps/web/app/globals.css`, `packages/registry/demos/theme.css` | Mirror tokens, utility, density rules; adopt reference neutrals in the SevenUI theme values. |
| `scripts/check-registry.mjs` | New rule: every `registry:ui` item depends on `sevenui-tokens`. |
| `apps/web/app/v2-lab/page.tsx`, `apps/web/app/v2-lab/[name]/page.tsx` | Dev-only lab: index + per-primitive state matrix in 2 themes × 2 densities. |
| `apps/web/components/v2-lab/lab-frame.tsx` | Renders children in the four theme/density cells. |
| `apps/web/components/v2-lab/matrices/<name>.tsx` | One matrix per primitive (each batch adds its own). |
| `packages/registry/registry/base/ui/<name>.tsx` | The restyle itself. |
| `packages/registry/tests/<name>.test.tsx` | Existing tests, updated + new style assertions. |
| `scripts/smoke-test.sh` | Extended with the stock-shadcn token assertions. |
| `docs/superpowers/notes/v2-followups.md` | Things found for project 2 (gallery/demos/site). |

## Token contract (decided — every batch consumes exactly these names)

Shipped by `sevenui-tokens` (`type: "registry:theme"`, `cssVars.light`, `cssVars.dark`, `cssVars.theme`, `css`). Values verbatim:

**`cssVars.light`**
```
brand: #2f5ce8            brand-foreground: #ffffff     brand-strong: #2f5ce8
surface-tray: color-mix(in oklch, var(--background) 40%, var(--muted))
surface-panel: var(--card)
surface-raised: var(--popover)
surface-inset: var(--background)
hairline: color-mix(in oklch, var(--foreground) 8%, transparent)
hairline-strong: color-mix(in oklch, var(--foreground) 13%, transparent)
elevation-highlight: inset 0 1px 0 rgb(255 255 255 / 0.9)
elevation-inset: inset 0 1px 2px rgb(0 0 0 / 0.05)
elevation-raised: 0 1px 2px rgb(0 0 0 / 0.06)
elevation-overlay: 0 0 0 1px var(--hairline-strong), 0 30px 60px -30px rgb(20 22 30 / 0.25)
```
**`cssVars.dark`**
```
brand: #4d7cff            brand-foreground: #ffffff     brand-strong: #3a68f0
surface-tray: color-mix(in oklch, var(--background) 30%, var(--card))
surface-panel: color-mix(in oklch, var(--card), var(--foreground) 4%)
surface-raised: color-mix(in oklch, var(--popover), var(--foreground) 7%)
surface-inset: color-mix(in oklch, var(--background), black 25%)
hairline: color-mix(in oklch, var(--foreground) 7%, transparent)
hairline-strong: color-mix(in oklch, var(--foreground) 12%, transparent)
elevation-highlight: inset 0 1px 0 rgb(255 255 255 / 0.06)
elevation-inset: inset 0 1px 2px rgb(0 0 0 / 0.4)
elevation-raised: 0 1px 2px rgb(0 0 0 / 0.3)
elevation-overlay: 0 0 0 1px var(--hairline-strong), 0 30px 60px -30px rgb(0 0 0 / 0.8)
```
**`cssVars.theme`** (becomes `@theme inline`)
```
--color-brand: var(--brand)   --color-brand-foreground: var(--brand-foreground)   --color-brand-strong: var(--brand-strong)
--color-surface-tray / -panel / -raised / -inset: var(--surface-*)
--color-hairline: var(--hairline)   --color-hairline-strong: var(--hairline-strong)
--shadow-highlight: var(--elevation-highlight)   --shadow-inset: var(--elevation-inset)
--shadow-raised: var(--elevation-raised)          --shadow-overlay: var(--elevation-overlay)
--ease-spring: cubic-bezier(0.3, 1.4, 0.5, 1)     --ease-snappy: cubic-bezier(0.2, 0, 0, 1)
```
**`css`**
```
"@utility focus-ring": { outline: "var(--focus-width) solid var(--focus-color)", "outline-offset": "var(--focus-gap)" }
":root": { --focus-width: 1.5px; --focus-gap: 2px; --focus-color: var(--brand);
           --control-h: 2.125rem; --control-px: 0.75rem; --control-gap: 0.5rem;
           --control-text: 0.8125rem; --panel-pad: 1.125rem; --item-h: 2rem }
"[data-density=compact]": { --control-h: 1.75rem; --control-px: 0.5625rem; --control-gap: 0.375rem;
           --control-text: 0.78125rem; --panel-pad: 0.75rem; --item-h: 1.625rem }
```
Size steps derive from `--control-h`: `xs = calc(var(--control-h) - 0.5rem)`, `sm = calc(var(--control-h) - 0.25rem)`, `lg = calc(var(--control-h) + 0.25rem)`; icon sizes are square of the same.

Usage idioms every batch follows:
- Focus: `outline-none focus-visible:focus-ring` (fields: `focus-within:focus-ring` / `has-focus-visible:` on the wrapper that carries the border). Remove `focus-visible:ring-*`/`focus-visible:border-ring`.
- Raised controls (buttons, select triggers, menus): `bg-surface-raised shadow-[var(--elevation-highlight),0_0_0_1px_var(--hairline-strong)]` or the `shadow-raised` token; fields: `bg-surface-inset shadow-[inset_0_0_0_1px_var(--hairline-strong),var(--elevation-inset)]`.
- Overlays (popover, menu, dialog content): tray-and-panel or single raised surface with `shadow-overlay`.
- Accent appears only where the spec allows (focus, selected indicator, on-state, highlight badge, link, chart emphasis, `variant="accent"`).
- Heights/padding/gaps: `h-(--control-h)`, `px-(--control-px)`, `gap-(--control-gap)`, `text-(length:--control-text)`, item rows `min-h-(--item-h)`.
- Every class that reads a token must still work if a hand-copied file lacks the tokens item: add `[:where(&)]:[--x:fallback]` only for the `--focus-*`, `--control-*`, `--panel-pad`, `--item-h` variables it reads (colour tokens fall back via `var(--brand, var(--ring))` where used in arbitrary values).

---

## Phase A — Foundation (sequential)

### Task 1: `sevenui-tokens` registry item and dependency wiring

**Files:**
- Modify: `packages/registry/registry.json`
- Modify: `scripts/check-registry.mjs`
- Create: `packages/registry/tests/helpers/contrast.ts`
- Create: `packages/registry/tests/tokens.test.ts`
- Create: `packages/registry/tests/tokens-derive.test.ts`

**Interfaces:**
- Produces: registry item `sevenui-tokens` with exactly the Token contract above; `https://sevenui.dev/r/sevenui-tokens.json` in every `registry:ui` item's `registryDependencies` (appended last, existing order preserved); `parseColor(value: string): {r:number,g:number,b:number}` and `contrastRatio(a: string, b: string): number` in `tests/helpers/contrast.ts` (supports `#rrggbb` and `oklch(L C H)` as used in `registry.json`).

- [ ] **Step 1: Write failing tests** in `tokens.test.ts`:
  - `it("ships a sevenui-tokens item of type registry:theme")`
  - `it("defines identical key sets in light and dark")`
  - `it("never writes a shadcn variable")` — none of the 32 `BASE_TOKEN_KEYS` from `packages/presets/presets.ts` nor `radius`, `success*`, `warning*` appear in `cssVars.light`/`dark`.
  - `it("every registry:ui item depends on sevenui-tokens")`
  - `it("meets AA")` — using `contrastRatio`: light `brand-strong`/`brand-foreground` ≥ 4.5; dark `brand-strong`/`brand-foreground` ≥ 4.5; light `brand` vs theme light `background` ≥ 3; dark `brand` vs theme dark `background` ≥ 3; dark `brand` vs dark `background` ≥ 4.5 (links).
  - In `tokens-derive.test.ts`: `it("derives every surface and hairline token from shadcn variables")` — each `surface-*`/`hairline*` value contains at least one `var(--<shadcn key>)` and no literal colour except `black`/`transparent`.
- [ ] **Step 2:** `pnpm --filter @sevenui/registry test -- tokens` → FAIL (item missing).
- [ ] **Step 3:** Implement `contrast.ts` (OKLCH → OKLab → linear sRGB → relative luminance; WCAG ratio).
- [ ] **Step 4:** Add the `sevenui-tokens` item to `registry.json` (after `animations`), values verbatim from the Token contract; append the dependency to all 66 `registry:ui` items with a one-off node script run from the scratchpad (not committed).
- [ ] **Step 5:** Add the rule to `check-registry.mjs`: every `registry:ui` item lists `https://sevenui.dev/r/sevenui-tokens.json`; error message `"<name>: missing sevenui-tokens dependency"`.
- [ ] **Step 6:** Run `pnpm --filter @sevenui/registry test` (all PASS), `pnpm check:registry` (exit 0), `pnpm build:registry` and confirm `apps/web/public/r/sevenui-tokens.json` exists and `apps/web/public/r/button.json` lists it.
- [ ] **Step 7: Commit** `feat(registry): add the sevenui-tokens item and depend on it everywhere`

### Task 2: Mirror tokens into site and demo CSS; adopt the reference neutrals in the SevenUI theme

**Files:**
- Modify: `apps/web/app/globals.css`
- Modify: `packages/registry/demos/theme.css`
- Modify: `packages/registry/registry.json` (the existing `theme` item: `ring` → brand; neutrals)
- Create: `packages/registry/tests/tokens-mirror.test.ts`

**Interfaces:**
- Consumes: Task 1 token contract.
- Produces: tokens, `@utility focus-ring`, `:root` density defaults and `[data-density=compact]` rules available in docs, demos and the lab.

- [ ] **Step 1: Write failing test** `tokens-mirror.test.ts`: `it("globals.css and demos/theme.css declare every sevenui-tokens variable with the registry value")` — for each key/value in `cssVars.light`, the light block of each CSS file contains `--key: value;`; same for dark (the `[data-theme="dark"]` / `.dark` block); both files contain `@utility focus-ring` and `[data-density="compact"]` (or `[data-density=compact]`).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Add the light block, dark block, `@theme inline` entries, the utility and density rules to both CSS files, values copied from the registry item.
- [ ] **Step 4:** In the `theme` item **and** both CSS files' SevenUI default values: set `ring` (light) to `#2f5ce8` and (dark) to `#4d7cff`, both stored as oklch converted exactly; retune neutrals toward the reference — dark `background #08090a`, `card #0e0f10`, `popover #131416`, `muted #191a1d`, `foreground #f7f8f8`, `muted-foreground #8a8f98`, `border`/`input` `rgba(255,255,255,.12)` expressed as oklch with alpha; light `background #fbfbfa`, `card #ffffff`, `popover #ffffff`, `muted #f3f3f1`, `foreground #16171a`, `muted-foreground #6b6f76`, `border`/`input` `rgba(0,0,0,.12)` as oklch with alpha. Leave `packages/presets` base colours untouched.
- [ ] **Step 5:** Extend `tokens.test.ts`: `it("theme muted-foreground meets 4.5:1 on background in both themes")`.
- [ ] **Step 6:** Run registry tests, `pnpm --filter @sevenui/presets test`, `pnpm typecheck`, `pnpm build:registry` — all pass.
- [ ] **Step 7: Commit** `feat(theme): ship v2 tokens to docs and demos and retune the neutral theme`

### Task 3: Density scoping, API-freeze guard

**Files:**
- Create: `packages/registry/tests/density.test.tsx`
- Create: `packages/registry/tests/api-freeze.test.ts`
- Create: `packages/registry/tests/__fixtures__/api-exports.json`

**Interfaces:**
- Produces: `api-exports.json` = `{ "<file name without .tsx>": ["SortedExportName", …] }` captured from `main` state (before any restyle) — the freeze baseline.

- [ ] **Step 1:** Generate the fixture from the current sources (dynamic `import()` of each `registry/base/ui/*.tsx`, `Object.keys` sorted) with a scratchpad script; commit only the JSON.
- [ ] **Step 2: Write** `api-freeze.test.ts`: `it.each(modules)("%s keeps every export", …)` — current exports ⊇ fixture exports.
- [ ] **Step 3: Write** `density.test.tsx`: inject the density CSS from the registry item into `document.head`, render `<div data-density="compact"><span data-testid="a"/></div><span data-testid="b"/>`; assert `getComputedStyle(a).getPropertyValue("--control-h").trim() === "1.75rem"` and for `b` `"2.125rem"`. (If jsdom does not resolve custom properties through selectors, assert via `document.querySelector('[data-density="compact"]')` matching the parsed rule's selector and record the limitation in the test name.)
- [ ] **Step 4:** Run → PASS (guards pass on unchanged code; density rule exists from Task 1).
- [ ] **Step 5: Commit** `test(registry): guard exports and density scoping for the v2 restyle`

### Task 4: v2 lab (dev-only visual harness)

**Files:**
- Create: `apps/web/app/v2-lab/page.tsx`, `apps/web/app/v2-lab/[name]/page.tsx`
- Create: `apps/web/components/v2-lab/lab-frame.tsx`
- Create: `apps/web/components/v2-lab/matrices/button.tsx` (pilot matrix, proves the harness)

**Interfaces:**
- Produces: `LabFrame({ children }: { children: React.ReactNode }): JSX.Element` — 2×2 grid: dark/comfortable, dark/compact, light/comfortable, light/compact; each cell wraps children in `<div data-theme="dark|light" data-density="comfortable|compact" className="bg-background text-foreground p-6">` with a mono caption. `LabSection({ title, children })` for labelled rows of states.
- Produces: matrix module contract — `apps/web/components/v2-lab/matrices/<name>.tsx` default-exports a client component rendering every variant × size × state (default, disabled, invalid/`aria-invalid`, open where applicable, selected/checked, with icon, long text) inside `LabSection`s. Index page lists all `registry:ui` names from `packages/registry/registry.json`, marking those without a matrix.
- `[name]/page.tsx` loads the matrix with `next/dynamic(() => import(\`@/components/v2-lab/matrices/${name}\`))`, wraps it in `LabFrame`, and calls `notFound()` when `process.env.NODE_ENV === "production"` or no matrix exists. Both pages export `metadata.robots = { index: false }` and are excluded from `sitemapRoutes` and route inventory.

- [ ] **Step 1:** Implement the frame, index, dynamic page and the button pilot matrix.
- [ ] **Step 2:** `pnpm dev`, open `/v2-lab` and `/v2-lab/button`; confirm four cells render, dark cells are dark, compact cells use `--control-h: 1.75rem` (DevTools computed style). Tab through a cell: current (pre-restyle) focus halo appears.
- [ ] **Step 3:** `pnpm build` → the two routes are absent from the output's static route list and `/sitemap.xml` has no `v2-lab` entry; `pnpm inventory`, `pnpm check:home` pass.
- [ ] **Step 4: Commit** `chore(web): add a dev-only v2 lab for primitive state matrices`

---

## Phase B — Primitive batches (parallel)

Run Tasks 5–13 **in parallel**, each in its own git worktree off `feat/v2` at the end of Phase A (`Agent` with `isolation: "worktree"`). Batches touch disjoint files: their own `ui/<name>.tsx`, `tests/<name>.test.tsx` and `v2-lab/matrices/<name>.tsx` only. **No batch edits `registry.json`, the CSS mirrors, or another batch's files.** If a batch needs a token that does not exist, it stops and reports — the controller adds it to Task 1's contract on `feat/v2` and rebases the batches.

Merge order back into `feat/v2` (fast-forward/rebase, one at a time, full test suite after each): 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13.

### Shared per-primitive procedure (every batch, every primitive)

- [ ] **a. Read** the primitive source, its current test, its docs page `apps/web/docs/components/<name>.mdx`, and its demos in `packages/registry/demos` (`grep -l "ui/<name>"`).
- [ ] **b. Write the lab matrix** `matrices/<name>.tsx` covering every variant, size and state.
- [ ] **c. Write failing style assertions** in `tests/<name>.test.tsx` (add, never delete behaviour tests):
  - focusable parts: `className` contains `focus-visible:focus-ring` (or `focus-within:focus-ring` on field wrappers) and does **not** contain `ring-3`;
  - density: root/control contains `h-(--control-h)` (or `min-h-(--item-h)` for list rows; `p-(--panel-pad)` for panels) — per the batch table;
  - surfaces: contains the surface token named in the batch table;
  - motion (where the table lists motion): contains the `motion-reduce:` counterpart;
  - accent: on-state/selected uses `brand` (`bg-brand`, `data-checked:bg-brand`, `border-brand`, …) only where the table says so.
- [ ] **d. Run** `pnpm --filter @sevenui/registry test -- <name>` → new assertions FAIL.
- [ ] **e. Restyle** per the batch table and the Token contract idioms. Keep every export, variant key, size key, prop and `data-slot` (api-freeze test enforces exports; the reviewer diffs variant/size keys).
- [ ] **f. Run** the primitive's tests, `api-freeze`, and `pnpm --filter @sevenui/registry typecheck` → PASS.
- [ ] **g. Commit** per primitive: `feat(<name>): restyle in the v2 design language`.

### Shared batch review (dispatch as subagents after the batch's implementer reports done)

Two fresh reviewers in parallel, each given the spec, this plan's Global Constraints + Token contract + the batch table, and the batch's commit range:

1. **Code reviewer** — for each primitive: `git diff feat/v2...HEAD -- packages/registry/registry/base/ui/<name>.tsx`; confirms no variant/size key renamed or removed; no hard-coded colour (`grep -nE "#[0-9a-fA-F]{3,8}|oklch\(|rgb\(|bg-(blue|zinc|neutral|gray|slate)-"` → only inside token fallbacks); no `ring-3`/`ring-ring`; accent only where allowed; `dark:` overrides only where a token can't express the difference; `"use client"` present if `useRender`/hooks used; tests assert what the procedure requires.
2. **Visual reviewer** — with the dev server running, opens `/v2-lab/<name>` for every primitive in the batch, takes screenshots of all four cells, tabs through every focusable part, and compares against `reference-synthesis.html` (open it from disk). Checks: looks like the reference family (layered, hairline, calm); light theme equally finished; compact is coherent (no clipped text/icons); offset ring visible and unclipped (watch `overflow-hidden` parents — use `outline-offset` room or move the ring to an inner element); disabled/invalid readable; no anti-goal decoration. Reports issues with screenshot paths.

Implementer fixes, reviewers re-check only the reported items; repeat until both approve. Then the controller merges the batch.

### Task 5: Batch B1 — Actions (button, button-group, toggle, toggle-group, toolbar, kbd)

| Primitive | Surfaces & shape | Density | Accent | Motion | Notes |
|---|---|---|---|---|---|
| button | `default`: `bg-primary` + `shadow-highlight`; `outline`: `bg-surface-raised` + hairline-strong ring shadow + highlight; `secondary`: `bg-surface-panel`; `ghost`: transparent, hover `bg-surface-panel`; `destructive`: tinted (keep); `link`: `text-brand` + `decoration-brand/40`. **Add** `variant="accent"`: `bg-brand-strong text-brand-foreground` | sizes from `--control-h` steps; `px-(--control-px)`, `gap-(--control-gap)`, `text-(length:--control-text)` | `accent` variant, `link` | `active:scale-[0.985] active:translate-y-px transition-[transform,box-shadow,background-color] duration-100 motion-reduce:transform-none` | Replace `rounded-[min(var(--radius-md),…)]` with `--theme(--radius-md)`-based classes; keep `in-data-[slot=button-group]` rules |
| button-group | joins children; separators use `bg-hairline-strong` | inherits | — | — | ensure ring of a focused child is not clipped by siblings (`focus-visible:z-10`) |
| toggle | off: ghost-like; pressed: `bg-surface-raised` + highlight + hairline ring | control steps | none (pressed stays neutral) | press as button | |
| toggle-group | segmented: tray `bg-surface-tray` + `shadow-inset` hairline; items like toggle | control steps; item `h-[calc(var(--control-h)-4px)]` inside a 2px-padded tray | selected item may show 2px bottom brand indicator only for `variant="underline"` if it exists; else none | — | matches reference "seg" control |
| toolbar | `bg-surface-tray`, hairline ring, `p-0.5`, separators hairline | gap `--control-gap` | — | — | |
| kbd | `bg-surface-raised`, `shadow-[inset_0_0_0_1px_var(--hairline),inset_0_-1px_0_var(--hairline-strong)]`, mono 10.5px | fixed size, unaffected by density | — | — | |

Steps: run the shared per-primitive procedure for each row, then the shared batch review. Commit per primitive.

### Task 6: Batch B2 — Text inputs (input, textarea, input-group, input-otp, number-field, label)

| Primitive | Surfaces & shape | Density | Accent | Motion | Notes |
|---|---|---|---|---|---|
| input | `bg-surface-inset` + `shadow-[inset_0_0_0_1px_var(--hairline-strong),var(--elevation-inset)]`; placeholder `text-muted-foreground/70` | `h-(--control-h) px-(--control-px) text-(length:--control-text)` | focus ring only | — | `aria-invalid`: hairline becomes `destructive/60`, ring colour `--focus-color: var(--destructive)` via `aria-invalid:[--focus-color:var(--destructive)]` |
| textarea | as input, `py-[calc(var(--control-px)*0.66)]`, min-h `calc(var(--control-h)*2.5)` | yes | focus | — | |
| input-group | wrapper owns surface + `has-[[data-slot=input-group-control]:focus-visible]:focus-ring`; inner control borderless | yes | — | — | addons `text-muted-foreground`; inline buttons use button `ghost` `xs` |
| input-otp | each slot an inset cell; active slot shows `focus-ring` on the slot | slot size = `--control-h` square | caret colour `bg-foreground` | caret blink keeps `motion-reduce:animate-none` | |
| number-field | group as input surface; steppers ghost buttons inside, `tabular-nums` value | yes | — | — | matches reference "Number Field" docs preview |
| label | `text-(length:--control-text) font-medium text-foreground`; disabled peer → `opacity-60` | text only | — | — | |

### Task 7: Batch B3 — Choice controls (checkbox, radio-group, switch, slider, native-select, select)

| Primitive | Surfaces & shape | Density | Accent | Motion | Notes |
|---|---|---|---|---|---|
| checkbox | off: `bg-surface-inset` + hairline-strong inset; on/indeterminate: `bg-brand text-brand-foreground`, no ring shadow | 16px (comfortable) / 14px (compact) via `size-[calc(var(--control-h)*0.47)]` clamped `min-size-3.5` | on-state | check icon `transition-opacity motion-reduce:transition-none` | |
| radio-group | indicator dot `bg-brand-foreground` on `bg-brand` | as checkbox | on-state | — | |
| switch | track off `bg-hairline-strong`; on `bg-brand`; thumb `bg-white shadow-raised` | track `h-[19px] w-8` comfortable, `h-4 w-7` compact (via `[data-density=compact]_&` or a `--switch-*` var set in the switch root) | on-state | thumb `transition-transform duration-200 ease-spring motion-reduce:transition-none` | reference "sw" |
| slider | track `bg-hairline-strong`, range `bg-brand`, thumb `bg-white shadow-raised` + `focus-visible:focus-ring` | thumb size steps with density | range + thumb ring | — | |
| native-select | as input surface, chevron `text-muted-foreground` | control | — | — | |
| select | trigger = raised (outline-button look); popup = overlay surface (`bg-surface-raised shadow-overlay rounded-(--theme(--radius-lg))`, `p-1`); items `min-h-(--item-h)`, highlighted `bg-surface-panel`, selected check `text-brand` | trigger + items | selected check | popup `data-starting-style:opacity-0 data-starting-style:scale-[0.98]` + `motion-reduce:` none | keep Base UI 1.7 positioning classes untouched |

### Task 8: Batch B4 — Composite pickers (combobox, command, calendar)

| Primitive | Surfaces & shape | Density | Accent | Motion | Notes |
|---|---|---|---|---|---|
| combobox | input as B2 input; popup/items as B3 select | yes | selected check | as select | `className→root` mapping trap from wave 4 stays |
| command | dialog/panel: tray `bg-surface-tray` + inner panel; search row hairline bottom; items `min-h-(--item-h)`, highlighted `bg-surface-panel`; group headings mono 11px uppercase `text-muted-foreground/80` tracking-wide | items | shortcut kbd uses B1 kbd look (classes only, no import change) | — | reference ⌘K feel |
| calendar | day cells `size-(--control-h)` square, `rounded-(--theme(--radius-md))`; today: hairline ring; selected: `bg-brand text-brand-foreground`; range middle `bg-brand/12`; nav buttons ghost | cells follow density | selected/range | — | react-day-picker v10 class map only |

### Task 9: Batch B5 — Form structure (field, form, questionnaire)

| Primitive | Surfaces & shape | Density | Accent | Motion | Notes |
|---|---|---|---|---|---|
| field | label/description spacing `gap-(--control-gap)`; description `text-muted-foreground text-xs`; error `text-destructive text-xs`; horizontal layout uses reference "field row" (label column + control, hairline divider between rows when inside `FieldGroup`) | gap | — | — | `children: undefined` merge trap (field rewrite memory) unchanged |
| form | no visual; confirm no classes need change; add matrix showing a form with fields + errors | — | — | — | test asserts no style change needed (skip c–d if none) |
| questionnaire | step container = layer-card-like tray/panel; progress = B10 progress look; option rows as B3 radios in `Item` rows | panel pad | progress range + selected option | step transition fade `motion-reduce:` none | |

### Task 10: Batch B6 — Overlays (dialog, alert-dialog, sheet, drawer, popover, hover-card, tooltip)

| Primitive | Surfaces & shape | Density | Accent | Motion | Notes |
|---|---|---|---|---|---|
| dialog | backdrop `bg-black/40` (dark `bg-black/60`), no blur; popup = tray (`bg-surface-tray p-1 rounded-(--theme(--radius-xl)) shadow-overlay`) holding a panel (`bg-surface-panel rounded-[calc(--theme(--radius-xl)-4px)] p-(--panel-pad)`); title 16px `font-semibold tracking-[-0.01em]`; footer in tray bar | panel pad | — | open: fade + `scale-[0.98]`→1, 150ms `ease-snappy`; `motion-reduce:` fade only | reference "Delete workspace?" dialog; Base UI 1.7 overlay landmines (wave 3 memory) — keep stacking/portal classes |
| alert-dialog | as dialog | | | | |
| sheet | single raised panel edge-attached, `shadow-overlay`, hairline inner edge | panel pad | — | slide 200ms `ease-snappy`, reduce → fade | |
| drawer | as sheet + handle `bg-hairline-strong` | | | | |
| popover | single raised surface `bg-surface-raised shadow-overlay p-(--panel-pad)` | panel pad | — | as select popup | |
| hover-card | as popover | | | | |
| tooltip | inverted: `bg-foreground text-background text-xs px-2 py-1 rounded-md`, no arrow shadow | fixed | — | fade 100ms | |

### Task 11: Batch B7 — Menus (dropdown-menu, context-menu, menubar, navigation-menu)

| Primitive | Surfaces & shape | Density | Accent | Motion | Notes |
|---|---|---|---|---|---|
| dropdown-menu | popup as select popup; items `min-h-(--item-h) px-2 rounded-(--theme(--radius-sm))`, highlighted `bg-surface-panel`, destructive item `text-destructive`; shortcuts mono `text-muted-foreground`; separators `bg-hairline`; checkbox/radio items use `text-brand` indicators | items | indicators | as select | |
| context-menu | as dropdown-menu | | | | |
| menubar | bar = toolbar tray; triggers like ghost toggles; menus as dropdown | control | — | — | |
| navigation-menu | triggers ghost; viewport overlay surface; links `rounded-(--theme(--radius-md))`, active `bg-surface-panel` | control | active indicator 2px `bg-brand` under trigger only if currently styled with an indicator | viewport size transition kept, `motion-reduce:` none | |

### Task 12: Batch B8 — Surfaces & display (card, layer-card, item, empty, alert, badge, avatar, separator, skeleton, spinner, aspect-ratio, marker, direction)

| Primitive | Surfaces & shape | Density | Accent | Motion | Notes |
|---|---|---|---|---|---|
| card | single panel: `bg-surface-panel shadow-[0_0_0_1px_var(--hairline),var(--elevation-raised)]`, highlight on dark | `p-(--panel-pad)`, header/footer gaps | — | — | spacing follows reference "shell" |
| layer-card | re-point its variables to tokens: tray `--surface-tray`, panel `--surface-panel`, border `--hairline` | `--layer-card-inset` unchanged; panel padding follows `--panel-pad` | — | — | keep every `--layer-card-*` variable and `:where()` default; this is the house pattern |
| item | rows `min-h-(--item-h)`, media slot, hairline separators | item | — | — | |
| empty | dashed hairline border optional; icon tile = small raised square; title/desc type scale | panel pad | — | — | |
| alert | tinted panel per tone using `color-mix(in oklch, var(--<tone>) 8%, var(--surface-panel))` + tone hairline | panel pad | — | — | |
| badge | `rounded-full px-2 text-[11px]`; default hairline outline; `secondary` panel fill; status tones = tinted + dot; **add** `variant="highlight"` (`bg-brand/14 text-brand ring-brand/30`) | fixed | `highlight` | — | reference badges |
| avatar | `ring-1 ring-hairline` inner; fallback `bg-surface-panel text-muted-foreground` | sizes unchanged | — | — | |
| separator | `bg-hairline` | — | — | — | |
| skeleton | `bg-hairline-strong` pulse; `motion-reduce:animate-none` | — | — | pulse | |
| spinner | `text-muted-foreground`; `motion-reduce:` slow | — | — | spin | |
| aspect-ratio | no visual | — | — | — | matrix only; skip c–d |
| marker | inline chip like badge `secondary`; icon `text-muted-foreground` | fixed | — | — | |
| direction | no visual (DirectionProvider re-export) | — | — | — | matrix shows an RTL row using other primitives; skip c–g |

### Task 13: Batch B9–B11 — Navigation, data, feedback, chat (tabs, accordion, collapsible, breadcrumb, pagination, scroll-area, sidebar, table, chart, progress, meter, toast, carousel, resizable, message, message-scroller, bubble, attachment)

This is the largest batch; split across **three parallel implementers** inside the task, one per sub-batch, each with its own worktree and the shared review:

**B9 Navigation & disclosure**

| Primitive | Surfaces & shape | Density | Accent | Motion | Notes |
|---|---|---|---|---|---|
| tabs | list = segmented tray (as toggle-group); active tab raised + `inset 0 -2px 0 var(--brand)` indicator; `variant="line"` (if present): hairline baseline, active 2px `bg-brand` | control | active indicator | indicator slide uses Base UI indicator vars, `motion-reduce:` none | reference tabs |
| accordion | rows separated by `border-hairline`; trigger `min-h-(--item-h)`; chevron `text-muted-foreground` | item | — | keep keyframes, `motion-reduce:` none | |
| collapsible | no surface; keyframes as accordion | — | — | — | |
| breadcrumb | `text-muted-foreground`, current `text-foreground`; separators `text-muted-foreground/60` | text | — | — | |
| pagination | links = ghost buttons; current = outline/raised button | control | — | — | |
| scroll-area | thumb `bg-hairline-strong` hover `bg-muted-foreground/40`; track transparent | — | — | — | |
| sidebar | container `bg-surface-tray` + right hairline; menu buttons `min-h-(--item-h) rounded-(--theme(--radius-md))`, active = raised (`bg-surface-raised` + hairline + highlight); group labels mono 11px uppercase; inset variant = panel with hairline | items | none (active neutral, as reference) | collapse width transition kept, `motion-reduce:` none | 723 lines: restyle tokens only, do not refactor structure |

**B10 Data & feedback**

| Primitive | Surfaces & shape | Density | Accent | Motion | Notes |
|---|---|---|---|---|---|
| table | header `text-muted-foreground text-xs font-medium`; row dividers `border-hairline`; hover `bg-surface-panel/60`; numeric cells `tabular-nums` | cell padding `py-[calc(var(--control-h)/4)] px-(--control-px)` | — | — | reference members table |
| chart | grid/axis `stroke-hairline-strong`, tick text `fill-muted-foreground`; tooltip = popover surface; keep pinned chart palette | — | chart emphasis may use `--brand` only when a demo opts in | — | recharts 3 `TooltipContentProps` untouched |
| progress | track `bg-hairline-strong`, indicator `bg-brand` | height 4px/3px | indicator | width transition, `motion-reduce:` none | |
| meter | as progress, indicator `bg-foreground` (neutral) with tones via data attrs if present | | — | | |
| toast | raised surface `bg-surface-raised shadow-overlay`; status icon tones; actions = button `outline xs` | panel pad | — | enter/exit kept; `motion-reduce:` fade | reference toast |
| carousel | nav buttons = outline icon buttons; dots `bg-hairline-strong`, active `bg-foreground` | — | — | — | embla untouched |
| resizable | handle `bg-hairline`; grip `bg-surface-raised` + hairline; `focus-visible:focus-ring` | — | — | — | rrp v4 API untouched |

**B11 Chat**

| Primitive | Surfaces & shape | Density | Accent | Motion | Notes |
|---|---|---|---|---|---|
| message | header meta `text-muted-foreground text-xs`; avatar per B8 | gap | — | — | |
| message-scroller | viewport plain; "jump to latest" = outline icon button, raised | — | — | scroll button fade, `motion-reduce:` none | |
| bubble | user bubble `bg-surface-raised` + hairline (reference "me" bubble); assistant bubble plain text; tones via data attrs unchanged | panel-ish padding `px-(--control-px) py-[calc(var(--control-px)*0.66)]` | — | — | |
| attachment | tile = panel with hairline, media radius concentric; remove button = ghost xs | — | — | — | |

---

## Phase C — Integration (sequential, after all batches merged)

### Task 14: Presets, gallery and demos sweep

**Files:**
- Create: `docs/superpowers/notes/v2-followups.md`
- Modify (only if a regression is found): the offending primitive.

- [ ] **Step 1:** Run the full suite: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm check:registry`, `pnpm check:docs-imports`, `pnpm build:registry`, `pnpm build`. All pass.
- [ ] **Step 2:** Dispatch a **visual sweep subagent**: with `pnpm dev`, walk every `/components` category page and every `/docs/components/*` page in dark and light; then apply customizer presets `neutral`, `zinc`, `rose`, `blue` and radius `none` and `1.0` on three docs pages (button, select, dialog). Report: broken layouts, invisible elements, clipped focus rings, invalid `calc()` from `radius: 0`, demos whose hard-coded classes fight the new look.
- [ ] **Step 3:** Fix primitive-level regressions (new commits, per primitive). Gallery/demo-level issues go into `v2-followups.md` grouped by component with file paths — they belong to project 2.
- [ ] **Step 4: Commit** `docs(notes): record v2 follow-ups for the site project` (+ any `fix(<name>): …` commits).

### Task 15: Stock-shadcn install proof

**Files:**
- Modify: `scripts/smoke-test.sh`

- [ ] **Step 1:** Extend the smoke test (it already serves `apps/web/public/r` rewritten to localhost and installs into a temp project): after `shadcn add` of `button`, assert with `grep` that the project's global CSS now contains `--brand:` and `@utility focus-ring`, that it contains `--brand:` exactly once after also adding `select` and `dialog`, and that every shadcn variable value present before the install is byte-identical after (capture the `:root`/`.dark` blocks before and diff).
- [ ] **Step 2:** `pnpm build:registry && pnpm test:smoke` → PASS.
- [ ] **Step 3: Commit** `test(smoke): prove v2 tokens install cleanly into a stock shadcn project`

### Task 16: Whole-branch review

- [ ] **Step 1:** Dispatch a fresh reviewer subagent on the most capable model with: the spec, this plan, and `git diff main...feat/v2`. Ask for spec compliance (every Goal/Success item mapped to evidence), Global Constraints violations, AA spot-checks in the lab, and anti-goal violations. Findings ranked by severity.
- [ ] **Step 2:** Fix confirmed findings (one commit each), re-run Task 14 Step 1.
- [ ] **Step 3:** Report to the user: what changed, review outcome, follow-ups file. **Stop — do not push, merge or open a PR.**

---

## Execution notes for the controller

- Phase A strictly sequential (1 → 2 → 3 → 4). Phase B: launch Tasks 5–12 and Task 13's three sub-batches together (11 implementers), each `isolation: "worktree"` from the Phase A tip. Phase C sequential.
- Implementers run the shared per-primitive procedure; reviewers are always fresh subagents (code + visual in parallel per batch).
- Only one dev server at a time on the main checkout for visual reviews; reviewers of different batches review after the batch is merged into a local integration branch `v2/lab-integration` (rebuilt from `feat/v2` + the batches under review), so they share one server. Never stop a server the user started.
- Keep a progress ledger in the git-excluded `.superpowers/` folder, not in this file.
- The site chrome (header, search, customizer, code blocks) imports primitives, so it will partly take the new look during this project. That is expected on `feat/v2`; the site is restyled properly in project 2. Do not add scoping to prevent it.
- The customizer accent picker is deferred to project 2 (spec leaves it to the builder).
