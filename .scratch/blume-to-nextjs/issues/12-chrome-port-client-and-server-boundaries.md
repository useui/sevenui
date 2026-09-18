# Chrome port: client and server boundaries

Type: grilling
Status: open
Blocked by: 07

## Question

The site chrome is 6,238 lines of Astro across 40 files, with interactivity in
vanilla `<script>` blocks. In React it needs explicit client/server boundaries,
and the largest piece is also the most coupled.

The interactive files, by size: `block-frame.astro` (1,200 lines),
`NavTree.astro` (576), `pro.astro` (374), `Header.astro` (347),
`account.astro` (340), `blocks-theme-dock.astro` (339),
`blocks-prefs.astro` (104), `example-card.astro` (76). Plus four existing
`.tsx` files (`landing-showcase.tsx` 409 lines, `combination-mark.tsx`,
`copy-command.tsx`, `logomark.tsx`) that port directly.

Settle:

1. **`block-frame.astro` (1,200 lines).** What does it actually do, and how does
   it decompose? It hosts the cross-origin pro preview iframe, applies theme and
   presets into it over postMessage, and works with the theme dock and prefs.
   The postMessage contract is frozen (the pro side is out of scope) — write it
   down explicitly as a message schema before porting, because it is the one
   interface the migration cannot renegotiate.
2. **Theme dock and prefs state.** Where does it live — URL params, local
   storage, React context? Today it is `localStorage` plus DOM attributes.
   Whatever it becomes must keep working for the iframes *and* for the inline
   docs demos, which now follow the site tokens directly.
3. **`Header.astro` and `NavTree.astro` are Blume slot overrides** importing
   `blume:data`, `blume:ask`, Blume's `Search`, `NavSelector`,
   `LanguageSwitcher`, `Logo`, `base-path` and `i18n-ui`. They are rewritten,
   not ported. What is the actual feature list each must reproduce, stripped of
   the dead paths (Ask AI is off, i18n is unused)? The nav drawer unification
   and the auto-opening group are deliberate behaviours with recorded reasons.
4. **Which components are RSC and which are client?** The default should be
   server, with client boundaries named one by one: nav drawer, theme toggle,
   theme dock, install control, copy buttons, search trigger, carousel-ish
   landing pieces.
5. **`base-path` handling.** Blume's `withBase()` prefixes every internal link
   for the `/docs` base path. Next.js has `basePath`, but the site is not
   *entirely* under `/docs` — only the docs section is. So `basePath` in
   `next.config` is likely wrong. How are `/docs`-relative links built instead?
6. **The vanilla scripts.** Are any of them worth keeping as plain scripts
   rather than becoming components (the analytics snippet, a theme
   no-flash script)?
7. **`site-drawer.astro` / `site-drawer-tabs.astro` / `site-tabs.ts`** — the
   drawer was unified deliberately (one nav drawer for every page). Confirm the
   unified behaviour and that the React port keeps a single drawer
   implementation rather than one per section.
