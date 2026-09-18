# Theme mechanism and token ownership

Type: grilling
Status: resolved
Assignee: Oğuzhan (this session)

## Question

`apps/web/theme.css` is the site's single palette source, and it is written
against Blume: Blume inlines it into a generated Tailwind entry
(`.blume/src/generated/app.css`) at highest priority, dark mode follows Blume's
`[data-theme="dark"]` convention, several Blume tokens are re-pointed at
SevenUI's, and two `@source` lines reach back to `packages/registry` because
Blume's scan only covers the app root. Post-Blume, all of that is the site's own
to own.

Settle:

1. **The dark-mode attribute.** `[data-theme="dark"]` is load-bearing far beyond
   the stylesheet: `packages/presets` applies themes against it, the block
   theme dock switches it, and the pro iframes are told about it over
   postMessage. Is the attribute and its exact value frozen? (Recommendation:
   yes — `next-themes` can be configured to write `data-theme`, and changing it
   would ripple into out-of-scope packages.)
2. **Which mechanism sets it?** `next-themes`, or a hand-written inline script?
   Both must avoid a flash of the wrong theme before first paint, which today is
   Blume's job. `mode: "system"` is the configured default and must survive.
3. **Where do the tokens live?** One `globals.css` imported by the root layout,
   or a split (tokens / base / utilities)? The file currently carries the shadcn
   token set, the Blume token re-pointing (which can be deleted), a
   `border-color` preflight fix, `@theme inline` mappings, view-transition
   overrides, `::selection`, `scrollbar-gutter`, the Blume search-dialog
   `!important` overrides (deletable — search is being rebuilt), and the full
   enter/exit animation utility set.
4. **`@source` scanning.** The two relative `@source` lines exist because
   `packages/registry` sits outside the Tailwind scan root. What replaces them
   in a Next.js app, and is the path still relative-and-fragile or can it be
   stated once?
5. **Theme customizer interaction.** `packages/presets` (`apply.ts`) writes
   tokens at runtime. Which element does it write to, and does the React port
   change that contract? Inline demos will now follow the customizer
   automatically (they previously needed frame sync) — confirm that is the
   intent.
6. **Animation utilities.** The `@utility` blocks (animate-in/out, fade, zoom,
   slide) and the accordion/collapsible keyframes are self-contained Tailwind v4
   utilities with no external package. They move verbatim — confirm, and confirm
   nothing in them depends on Blume's stylesheet ordering.

## Added facts (from `05-code-highlighting-parity`)

Two measured details the chosen mechanism must account for:

- **The persisted preference lives in `localStorage["blume-theme"]`.** Changing
  the key silently resets every returning reader's theme. If `next-themes` is
  chosen its `storageKey` must be set to this value, or a one-time migration
  written.
- **There are zero `prefers-color-scheme` rules in the live CSS bundle.** The OS
  preference is read once in JS by a head script that writes `data-theme`. So
  `mode: "system"` today means "JS resolves system once and writes the
  attribute", not "CSS follows the media query". Any replacement that switches
  to media queries changes behaviour for the code blocks, whose dual-theme
  tokens are selected purely by `:root[data-theme="dark"]`.

## Answer

### Three premises in the question were wrong — corrected first

- **There is no postMessage theme contract.** `apps/web` contains zero
  `postMessage` calls. `vercel.json` rewrites `/previews/:path*` to
  `pro.sevenui.dev`, so pro preview documents are **same-origin** and share
  `localStorage`; theming crosses that boundary over the native `storage`
  event (`packages/presets/apply.ts` names this mechanism explicitly). This
  promotes the theme storage key from a preference to a **cross-repo contract**.
- **The customizer does not theme inline demos, and must not theme chrome.**
  `apply.ts`: *"Only preview documents may import this module — the site chrome
  (gallery, docs, landing, account) is deliberately never themed."*
  `blocks-theme-dock.astro`: *"The dock's own page never re-themes."* Dropping
  the iframe therefore does not make demos follow the customizer — it removes
  the document that was allowed to be themed.
- **`theme.css` does not contain everything that must move.** Two load-bearing
  declarations live in Blume's generated entry (`.blume/src/generated/app.css`),
  not in `theme.css`:
  `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));`
  and the `color-scheme` pair. Registry components use `dark:` utilities
  heavily (`dark:bg-input`, `dark:border-input`, `dark:aria-invalid:*`, …), so
  omitting the custom variant kills dark mode **silently** — nothing fails to
  build.

### Decisions

1. **`data-theme` is frozen.** The signal stays `<html data-theme="dark">`,
   attribute and value unchanged. `class="dark"` would ripple into
   `packages/presets`, `packages/registry` and the pro repo for no gain.

2. **The storage key changes to `theme`; its value vocabulary is frozen to
   `"light" | "dark" | absent`.** `absent` means system. The literal string
   `"system"` is never written, because the toggle stays two-state — the
   pro preview documents do `root.dataset.theme = <value>` and would render
   neither light nor dark. The toggle remaining two-state is a parity
   decision: a three-state toggle is a feature, not a migration. The rename
   resets every returning reader's preference once, to system — accepted.

3. **`next-themes`, configured to that contract**, rather than a hand-rolled
   inline script: `attribute="data-theme"`, `storageKey="theme"`,
   `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`,
   `enableColorScheme={false}`, and `<html suppressHydrationWarning>`.
   The deciding factor is not bundle size but the `storage` event: the key is
   a cross-repo contract, and `next-themes` gets write/read/cross-tab sync
   right in one place. `enableColorScheme` is off so the `color-scheme` CSS
   rules stay the single owner — they also work without JS.

4. **A mirror write bridges the key rename.** Until the pro repo moves to
   `theme`, the app mirrors the resolved value into `blume-theme` on every
   theme change (~5 lines in an effect). Without it, `/blocks` previews lose
   theme sync between the web cutover and the pro deploy — 16 pages, the
   site's most hand-tuned surface. The mirror is temporary, one-way, and its
   removal condition is explicit: delete once the pro repo reads `theme`.
   Recorded as a retirement item on `14-blume-shaped-workarounds-to-retire`.

5. **Three behavioural details of today's script:**
   - *Live OS following is added.* `THEME_INIT_SCRIPT` reads `matchMedia` once
     with no `change` listener, so with no stored preference the site stays on
     the OS theme it was loaded with. That is a gap, not a design choice;
     `enableSystem` closes it.
   - *`astro:after-swap` re-application is dropped.* App Router client
     navigation does not replace `<html>`, so it has no counterpart.
   - *Transition suppression is kept.* Today `Header.astro`'s click script
     injects `*{transition:none!important}`, forces reflow via
     `getComputedStyle(d).opacity`, and removes it after 1ms.
     `disableTransitionOnChange` is the same behaviour.

6. **Tokens live in one `app/globals.css`.** Splitting is not free in
   Tailwind v4 (`@utility` / `@theme` are order-sensitive) and the file lands
   around 290 lines. Deleted on the way: the `--blume-*` re-pointing (10 lines)
   and the search-dialog `!important` overrides (18 lines). Added:
   `@import "tailwindcss"`, `@custom-variant dark`, the `color-scheme` pair.
   Kept verbatim: the `@layer base { * { border-color } }` preflight fix (more
   necessary in Next.js, not less — no framework ships a default either),
   `@theme inline`, view-transition overrides, `::selection`,
   `scrollbar-gutter`, and the full animation set.

7. **`@source` stays, but relative to a hand-written file.** The five-level
   `../../../../../packages/registry/…` paths are fragile only because they
   resolve against a *generated* entry. From `apps/web/app/globals.css` they
   become `../../../packages/registry/registry` and
   `../../../packages/registry/components`, written once. The lines are still
   required — Tailwind v4's automatic scan does not reach outside the app.

8. **The animation set moves verbatim.** `@utility animate-in/out`, `fade-*`,
   `zoom-*`, `slide-*`, the `enter`/`exit` keyframes and the
   accordion/collapsible keyframes are self-contained: `--tw-duration` /
   `--tw-ease` come from Tailwind core, `--spacing` from Tailwind's defaults,
   `--accordion-panel-height` / `--collapsible-panel-height` from Base UI.
   Nothing depends on Blume's stylesheet ordering.

9. **Inline demos get a scoped preset applier.** `packages/presets` is not
   touched: `resolvePreset()` is already exported, so `apps/web` builds its own
   rule. One `<style>` node in `<head>`, scoped selectors
   (`[data-preset-scope] { … }` and
   `[data-theme="dark"] [data-preset-scope] { … }`), updated from the same
   `storage` event `apply.ts` already uses. Selector-scoped rather than inline
   style objects, because inline styles cannot express the light/dark split
   without also watching `data-theme` from JS. Applies to docs demo wrappers
   **and** the `/components` gallery (already inline today — `client:visible`
   islands, no iframe). Site chrome is never scoped: `@sevenui/presets/apply`
   must never be imported from the root layout.

   The **control** stays on `/blocks` only. Moving the dock onto `/components`
   and the docs pages is a product change, ruled out of scope — see the map.
   Until that separate effort lands, the preference is chosen on `/blocks` and
   merely reflected elsewhere: it works, but is not discoverable.

10. **The registry theme guard is extended to cover `globals.css`.**
    `scripts/check-registry.mjs:158` asserts every published `cssVars` token
    appears in `packages/registry/demos/theme.css` with the same value. Once
    demos render inline, `demos/theme.css` is no longer loaded by the site —
    the file a visitor actually sees becomes `globals.css`, which no guard
    covers. The loop takes a second file. The script is at the repo root, not
    under `packages/registry`, so this is in scope.

### Facts established

- **`THEME_INIT_SCRIPT`** (`blume/src/components/layout/head-scripts.ts:34`):
  `localStorage.getItem("blume-theme") ?? (mode === "system" ? prefers-color-scheme : mode)`,
  re-run on `astro:after-swap`. `blume.config.ts:47` sets `mode: "system"`.
  Only `data-theme` is set on the main document; the `dark` **class** is set
  only inside Blume's example iframe, so nothing in the site depends on it.
- The toggle (`components/blume/Header.astro:247`) is two-state (sun/moon,
  styled by `dark:hidden` / `dark:inline-flex`). After the first click the
  stored value is pinned and "system" is unreachable — consistent with the
  frozen vocabulary above.
- `packages/registry/demos/theme.css` (300 lines) is a near-duplicate of
  `apps/web/theme.css` (353 lines). It exists because the iframe is a separate
  document with its own Tailwind entry. It stays (out of scope, and the
  registry guard reads it) but the site stops loading it — its only consumer
  is `blume.config.ts:56`.
- `buildPresetCss` hard-codes its selectors
  (`:root` and `.dark, [data-theme="dark"]`) and emits only the 32
  `BASE_TOKEN_KEYS` as a **partial** `:root` rule.
- `/components` gallery pages already render demos inline as `client:visible`
  islands (`pages/components/button.astro:58`) — no iframe, and not themed by
  the customizer today.

### `--success` / `--warning`: evaluated, not a bug

The status tokens are not web-only. They are in `apps/web/theme.css`,
`packages/registry/demos/theme.css`, **and** the published `theme` registry
item — `apps/web/public/r/theme.json` carries all four (light 37 tokens, dark
36). `text-success` also needs `--color-success`: shadcn's `update-theme`
postcss plugin (`shadcn@4.19.1`, `chunk-JKB2HING.js`) keeps no allowlist — for
every `cssVars` key whose value is a color it emits
`--color-<key>: var(--<key>)` into `@theme inline`, and `oklch()` qualifies.
So `shadcn add .../r/theme.json` gives a consumer working status utilities.

Keeping them out of `packages/presets` also remains correct: `buildPresetCss`
emits a partial `:root` rule, so tokens it never names keep their stylesheet
value under every preset. Putting them in presets would mean defining the same
two colors across 5 base colors x 8 themes.

**Two findings, both outside this map's scope, recorded so they are not lost:**

- No registry item declares `registryDependencies` on `theme.json` — not in
  `packages/registry/registry.json`, not in `components/registry.json`. For the
  free primitives this is correct (they stay within standard shadcn tokens; no
  free item uses `text-success` / `bg-warning`). But pro blocks *do* use them,
  so a consumer installing a pro block into a project without SevenUI's theme
  gets undefined vars. The fix belongs to the pro block's
  `registryDependencies`, in the **pro repo**.
- The radius scale the site uses and the one shadcn writes for consumers
  differ: `calc(var(--radius) - 4px) … + 4px` here versus
  `calc(var(--radius) * 0.6) … * 1.4` from the CLI. Pre-existing, not caused by
  the migration.

### What the site ships vs what it uses

They are deliberately different, and only the **token values** overlap.
`/r/theme.json` is `cssVars` alone. `globals.css` additionally carries
`@source`, `@custom-variant dark`, `color-scheme`, the border-color preflight
fix, `::selection`, `scrollbar-gutter`, `@theme inline` and the animation set.
Even the dark selector differs by design: `docs/theming.mdx` tells consumers
`@custom-variant dark (&:is(.dark *))` (the shadcn class strategy) while the
site uses `[data-theme="dark"]`. The animation utilities are published
separately as the `animations` registry item (it carries a `css` field), and
`dialog` and friends depend on it — that path is already sound.
