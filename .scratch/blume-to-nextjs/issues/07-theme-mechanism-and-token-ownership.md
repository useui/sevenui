# Theme mechanism and token ownership

Type: grilling
Status: open

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
