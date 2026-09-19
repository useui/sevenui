# Chrome port: client and server boundaries

Type: grilling
Status: resolved
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

## Answer

Three of this ticket's premises were dead before it was worked, and are recorded
here so the question's own text is not read as fact later:

- **Item 1's frozen postMessage contract does not exist.** `block-frame.astro`
  contains zero `postMessage` calls, and `07` established there are none
  anywhere in `apps/web`. The pro previews are same-origin through the
  `/previews/*` rewrite and sync over `localStorage` plus the native `storage`
  event. There was never a message schema to write down.
- **Item 5 is settled by `02`.** No `basePath`; `/docs` is a literal route
  segment. `withBase()` has 8 call sites in 3 files — `Header.astro`,
  `NavTree.astro`, `site-drawer-tabs.astro` — all three deleted with Blume. After
  the port it has **zero** consumers and internal links are written literally.
- **Item 3's `NavTree` half is settled by `03`** (client sidebar in the docs
  layout, Primitives set slug-sorted, `page`-mode panel machinery unreachable and
  not ported). What remained here is the header.

Authored interactivity is smaller than the line counts suggest: **7 files carry
a `<script>`** — `block-frame.astro`, `blocks-theme-dock.astro`,
`blocks-prefs.astro`, `example-card.astro`, `blume/Header.astro` (two),
`blume/NavTree.astro`, `pages/pro.astro`, `pages/account.astro` — plus 4 `.tsx`
files that port directly. Everything else is static markup.

### 1. Layout tree: one root shell, three nested layouts

`app/layout.tsx` owns the document: `<html>` attributes, fonts, the theme
provider (`07`), the package-manager pre-paint script (decision 6), header,
footer, mobile drawer, skip link, `<main id="content">`, and analytics. Nested
layouts at `app/docs`, `app/(gallery)/components` and `app/blocks` add their
sidebars.

**All three sidebars follow `03` uniformly: a client component in the persistent
layout.** `03` was forced into it by `aria-current` — App Router does not
re-render a shared layout when navigating between its children. The same
constraint applies to the `/blocks` category rail (14 links) and the
`/components` list (10 links), and one rule for "chrome carrying an active
marker" is worth more than three different ones. The payload argument that made
`03` hesitate (65 serialized links) is an order of magnitude smaller here.

**What Blume's shell provided and what happens to each.** `PageLayout.astro`
renders 15 distinct things; the port keeps 5:

| Blume shell piece | Port |
| --- | --- |
| `<ClientRouter>` + `SWAP_STYLESHEET_INIT_SCRIPT` | **deleted** — App Router owns soft navigation; the body-stylesheet race the second script exists for cannot occur |
| `<Banner>` + `BANNER_INIT_SCRIPT` | **deleted, and it is dead code today** — `blume.config.ts` declares no `banner`, so the header script's dismiss branch has never run in production |
| `clientData` JSON island | **deleted** — no page passes it |
| `syncDrawerInert()` | **deleted** — React renders `inert` from state (decision 4) |
| `<Fonts>` | replaced by `next/font` (decision 2) |
| `<Favicon>`, meta/OG/canonical | `11` and `15` |
| JSON-LD (`structuredData`, default **on**) and `<WebMcp>` (default **on**) | `15` — both ship in production today and neither is declared in config |
| `THEME_INIT_SCRIPT` | `07` (`next-themes`) |
| `<Analytics>` | kept: the two GA4 scripts, still production-only (`import.meta.env.PROD` becomes a `process.env.NODE_ENV` check). `analytics.vercel` is not enabled, PostHog is not configured |
| skip link, `<main id>`, header, footer slot | kept |

The `#blume-content` skip target becomes `#content` (decision 8).

### 2. Fonts: today's fonts, on `next/font`

Nobody owned this. The resolved config is `fonts: { body: "inter", display:
"inter", mono: "ibm-plex-mono" }` — **Blume's defaults, not written in
`blume.config.ts`** — self-hosted by Astro's Fonts API: Inter at 400/500/600/700
with 400/500/600 preloaded, IBM Plex Mono 400 preloaded. They reach CSS only
through `--blume-font-body|display|mono`, which is why decision 3 has to declare
`--font-sans`/`--font-mono`/`--font-display` directly.

`next/font/google` for both, `display: "swap"`, exposed as `--font-sans` and
`--font-mono`, with `--font-display: var(--font-sans)` since display is Inter
too. Next's own preload handling stands in for Astro's per-weight preload list;
reproducing that list is not parity work under `13`'s bar.

**Geist / Geist Mono was raised and deliberately deferred**, not rejected. The
technical cost is ~3 lines (`geist/font/sans`, `geist/font/mono`) against the
single seam this decision creates. It is out of the cutover for attributability:
`/` and `/blocks` are held near pixel parity and were hand-tuned in their own
efforts, so if tipografi and framework move in one deploy, every drift the
sampled human review finds has two suspects and the review cannot adjudicate.
Two secondary costs: the global `-0.05em` heading tracking was matched visually
against Inter and would need re-tuning, and `--font-mono` drives ~2.0 MiB of
Shiki output in a 42rem column, where a different advance width changes where
long lines wrap. Recorded in the map's **Out of scope** section as a follow-up
effort, and handed to `16` as context — the card/site font mismatch is **not**
to be "fixed" by pulling the OG card onto Inter.

### 3. The global base layer, swept once instead of one rule per ticket

Three tickets had each found exactly one rule living in Blume's generated entry
(`.blume/src/generated/app.css`) rather than in `apps/web/theme.css`: `07`
(`@custom-variant dark`, `color-scheme`), `06` (five `--color-*`), `08`
(`scroll-padding-top`). The pattern was the finding, so the whole file was
diffed against `theme.css`. It is **13** `@theme inline` entries, not five, plus
seven `@layer base` rules.

`theme.css` declares 39 `@theme` keys. These 13 exist only in Blume's entry:

| Blume-only `@theme inline` entry | Port |
| --- | --- |
| `--color-background`, `--color-foreground`, `--color-border`, `--color-muted`, `--color-muted-foreground` | yes — `06` found these five |
| `--font-sans`, `--font-mono` | **yes** — `font-mono` has 15 authored call sites plus 3 in the registry; `font-sans` is the body font, set on `<body>` by Blume's own markup |
| `--font-display` | yes, as `var(--font-sans)` — no utility uses it, but `04`'s heading override reads it |
| `--color-action`, `--color-action-foreground`, `--color-code`, `--container-content`, `--radius-blume` | **no — these die.** Zero `text-action`/`bg-action`/`bg-code`/`text-code`/`max-w-content`/`rounded-blume` anywhere in `apps/web` or the registry; they fed Blume's own chrome and `.prose` only |

`@layer base`, all seven rules:

1. `* { min-width: 0 }` — the global flex/grid overflow defuse. Silent and
   site-wide; **ports**.
2. `button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer }` —
   ports.
3. `html { scroll-behavior: smooth; scroll-padding-top: 4.5rem; text-rendering:
   optimizeLegibility }` — all three port (`08` found the middle one).
4. The bare `h1`-`h6` display-font + `-0.05em` rule — **does not port as a bare
   selector**, per `06`(3d) and `04`: the values move into the prose heading
   overrides, and the chrome's headings carry their own classes.
5. `:focus-visible { outline: 2px solid var(--blume-accent); outline-offset: 2px;
   border-radius: 2px }` — the site's global focus ring, and the one entry with
   a real choice. **`--blume-accent` is `oklch(0.145 0 0)` light /
   `oklch(0.96 0 0)` dark — near-black and near-white, not the brand blue
   `theme.css`'s own comment claims.** That is `--foreground` to within 0.025 L,
   so it ports as `var(--foreground)`. `blocks-theme-dock.astro` already
   hardcodes `outline-foreground`, so this makes the site consistent rather than
   changing it.
6. `body { background-attachment/-image/-position/-repeat/-size }` — all read
   `--blume-background-image`, which resolves to `none`. **Dead; dropped.**
7. The `prefers-reduced-motion` `scroll-behavior: auto` guard — ports with (3).

Also Blume-only: two `[dir="rtl"]` code rules (`pre` forced LTR, inline `code`
`unicode-bidi: isolate`). Handed to `17`, which already owns the RTL question.

**This closes the sweep.** The `globals.css` inventory is the diff of both files,
taken once, and is not to be rediscovered a rule at a time.

### 4. Header: one client component. Drawer: React state, and the measurement dies

Stripped of dead paths — `Ask` (no `ai.ask` in config), `LanguageSwitcher` /
`localeSwitch` / the whole `i18n-ui` string merge (no locales), `NavSelector` /
`versionSelector` (none configured), the banner — the header's feature list is
exactly: nav toggle (`lg:hidden`), logo, five `SITE_TABS` with `aria-current`
(inline from `lg`, hidden below), flexible spacer, search trigger (`08`), GitHub
link, theme toggle, auth pill (`10`).

**The header is one client component.** The tab bar needs `aria-current` inside a
persistent layout, which is `03`'s constraint verbatim, so no server split saves
it; and the alternative — a server header hosting four islands — buys nothing
when the serialized payload is five tabs. The search *dialog* sits behind a
dynamic import so the palette and its matcher stay out of the header chunk
(`08`'s index is already fetched on first open). The theme toggle keeps its
CSS-driven icon swap (`inline-flex dark:hidden` / `hidden dark:inline-flex`)
rather than branching on a JS-read theme — that is what makes it SSR-safe with
no hydration mismatch and no flash.

Blume's `tabsNavClass` deviation is kept: inline tabs wait until `lg` on every
page, not `md` for docs. The recorded reason (hamburger + a 294px tab bar in the
same 768px row) still holds.

**The drawer.** One `[data-blume-nav-drawer]` per page today, opened by pure CSS
off `data-blume-nav-open` on `<html>`, with four attached behaviours: scroll
lock, a measured `--blume-drawer-top`, close-on-resize past `64rem`, and the
`inert`/`aria-hidden` sync via `MutationObserver`. In React: open state is
`useState` in a layout-level context shared by the header button and the panel;
`inert` renders from that state; the resize close is a `matchMedia` listener; the
scroll lock stays.

**`--blume-drawer-top` is deleted for a static `top-16`.** It exists only because
a banner's text can wrap, so the header's bottom edge is not a constant — and no
banner is configured. Its `getBoundingClientRect()` measurement, the
re-measure-on-dismiss and the re-measure-on-resize all go with it.

**The drawer stays hand-rolled rather than becoming the registry's `Sheet`.**
Sheet is modal with a focus trap; this drawer is deliberately non-modal
(`site-drawer.astro` and the theme dock both record that choice). A cutover whose
whole point is attributable regressions is the wrong place to change focus
behaviour on every page of the site.

`blume/Header.astro`'s `is:global` style block — reinstating `flex-shrink: 0` on
Blume's `Search` slot — dies with the slot: the search trigger becomes ours and
carries `shrink-0` directly.

### 5. `block-frame.astro`: a server card plus one client preview per card

Decomposed, the 1,200 lines are three layers:

- **(a) Server-renderable markup.** The `<article>`, heading + optional badge,
  description, the whole toolbar (three width presets, prompt, permalink,
  refresh, fullscreen, open-in-tab, optional GitHub, install control), the track
  / clip layer / decorative ring, the `<iframe>` with `data-src`, and the width
  readout. All of it is static HTML with `data-*` hooks today.
- **(b) Per-card behaviour.** Width state and preset bucketing — measured
  against the **iframe's** content width through a runtime border delta, not the
  box's border-box width; drag with pointer capture and the `data-dragging`
  pointer-events suppression; keyboard resize; fullscreen in two flavours (API,
  plus the `[data-fs]` fixed overlay because iOS iPhone has no Fullscreen API);
  refresh through `contentWindow.location.reload()` (not `src` re-assignment,
  which re-arms loading and pushes history); permalink and agent-prompt copy.
- **(c) Page singletons.** The IntersectionObserver lazy loader with
  `MAX_CONCURRENT = 3`; the `#sevenui-announcer` live region; the `#sevenui-tip`
  tooltip; the package-manager preference.

Today (b) and (c) are one document-level delegated script because Astro's
alternative was ~54 islands on a six-card page. React has no such cost, so:

**`<BlockCard>` (server) + `<BlockPreview>` (client) per card.** `BlockPreview`
holds width, dragging and fullscreen state. The measured border delta stays a
runtime measurement — the box↔iframe offset cannot be known at build time, and
hard-coding "2" is what makes a "1024px" badge lie.

**The concurrency cap survives as a layout-level context**, not as a per-card
`IntersectionObserver` each doing its own thing: the cap is the feature — six
full applications booting at once is the difference between a gallery that
scrolls and one that stalls. The context hands each visible card a "you may load
now" grant and each card sets its own `src` on receipt.

**The announcer stays one live region** in the blocks layout, exposed as an
`announce()` context. Its two non-obvious rules travel with it as comments: it
must exist and be empty before the text changes, and it must be cleared between
writes or a repeated message is silent.

**The tooltip becomes the registry's own `Tooltip`**, with one Provider in the
blocks layout. The bespoke singleton existed to avoid one island per button; with
per-card client components that reason is gone, and the site stops hand-rolling a
primitive it publishes. It stays decorative — no `aria-describedby`, the
`sr-only` accessible names are unchanged — so the WCAG 1.4.13 reasoning holds.
Deltas for `13`: Base UI's open delay replaces immediate `pointerover`, and its
portal replaces the single fixed-position node.

`install-control.astro` ports as a server component with its markup intact
(including the `dir="rtl"` + `<bdi>` start-truncation, which is load-bearing:
the tail is the only part distinguishing `dashboard-01` from `dashboard-02`).
Its behaviour moves into `BlockPreview`'s subtree rather than a page-level
handler.

`example-card.astro`'s Preview/Code toggle becomes a small client component
wrapping server-rendered children — the highlighted code is server output
(`05`), and only `aria-selected` and `hidden` need state.

### 6. The package-manager preference becomes a site-wide contract

Mechanism today: `localStorage["package-manager"]` → `data-pm` on `<html>`,
written by an `is:inline` pre-paint script in `blocks-prefs.astro`, selecting one
of four SSR'd commands through `.pm-only-*` CSS rules. `is:inline` is
load-bearing — bundled, it runs after first paint, which is the flash it exists
to prevent.

Three install surfaces exist and **one** honours the preference: the blocks
toolbar (`install-control.astro`), the docs `<InstallCommand>` (67 pages; `04`
gives it a package-manager bar driven by this same `data-pm`), and
`copy-command.tsx` (landing ×2, plus one per `/components` gallery card, with a
single hardcoded command).

`04`'s decision already forces the applier out of `/blocks`. So: **the pre-paint
script and the `.pm-only` rules move to the root layout and `globals.css`**, and
`data-pm` becomes a documented site-wide attribute beside `data-theme`.
`copy-command.tsx` keeps its shape but takes its command from the same
four-command set, so all three surfaces agree.

The CSS-selection mechanism is unchanged, deliberately: all four commands ship in
the HTML and CSS picks one. The React-shaped alternative — read `localStorage` in
an effect and re-render — reintroduces exactly the post-hydration repaint the
inline script was written to avoid, and would do it once per card.

### 7. `/account`: componentized, and anonymous visitors stop paying for Clerk

The page ships a skeleton (three `aria-hidden` pulse rows) and builds everything
else from template strings after `getClerk()` resolves: the signed-out hero with
its self-drawing SVG, the identity row, license cards with per-card copy
buttons, and two independent error/retry paths. The static half is the `l-row` /
`l-marks` crop-mark frame and the keyframes; the `.draw` / `.ink` / `.license-card`
rules are already written as `:global()` against script-injected markup.

**It never checks `__client_uat`.** Unlike the header, `/account` calls
`getClerk()` unconditionally — so an anonymous visitor downloads the measured
1.46 MiB and watches a skeleton until it lands. `10` found the same gap on
`/pro`.

The port: `<AccountPanel>` as a client component with real state for the four
views (signed-out, identity + licenses loading, licenses, error), and **the
signed-out hero server-rendered as the default**. With no `__client_uat` cookie
the signed-out state is the correct terminal state, so Clerk is never loaded and
`/account` is zero-JS for anonymous visitors. The skeleton survives only on the
cookie-present path, where it is honest. `/pro`'s buy-link enhancement gets the
same gate, closing `10`'s finding here rather than leaving it to the plan.

The cookie can also be absent because cookies are blocked — in which case Clerk
could not have established a session either, so "signed out" remains correct.
`10` already accepted this trade for the header.

### 8. The `data-blume-*` DOM vocabulary is renamed

Surviving hooks become `data-sevenui-*`, and `#blume-content` becomes
`#content`. `13`'s automated diff extracts visible text, heading hierarchy with
anchor IDs, and link targets — **not arbitrary attributes** — so the rename
costs nothing at the gate, and leaving `blume` in the DOM of a site that no
longer contains Blume misleads every future reader.

`06`'s carried-over grid rule lands as `[data-sevenui-example]`. Most of the
vocabulary simply vanishes with its script: `data-blume-nav-open`,
`-nav-toggle`, `-header`, `-theme-toggle`, `-banner*`, `-search-open`,
`--blume-drawer-top`. `.blume-heading-anchor` is `04`/`02` territory.

**The one thing that does not get renamed is not a DOM attribute:** the
`blume-theme` `localStorage` mirror write from `07`. That is a cross-repo
contract with the pro deployment and stays exactly as `07` specified, with `14`
owning its retirement condition.

## Findings

- **The global focus ring is not the brand blue.** `theme.css`'s header comment
  says Blume's accent/action is "the brand blue driving links and active nav",
  but the generated entry resolves `--blume-accent` to `oklch(0.145 0 0)` in
  light and `oklch(0.96 0 0)` in dark. The comment is stale; every global focus
  outline on the site is near-black/near-white today.
- **Eight more unowned `@theme inline` entries**, beyond `06`'s five — including
  `--font-sans` and `--font-mono`, which every `font-mono` utility on the site
  depends on. Five of the eight (`--color-action`, `--color-action-foreground`,
  `--color-code`, `--container-content`, `--radius-blume`) have zero consumers
  and die.
- **The banner is dead code today.** No `banner` key in `blume.config.ts`, so
  `BANNER_INIT_SCRIPT`, `<Banner>`, the header script's dismiss branch, its
  `localStorage["blume-banner:*"]` write and the `data-blume-banner-hidden`
  attribute have never done anything in production. The `--blume-drawer-top`
  measurement exists solely to accommodate it.
- **`/account` loads 1.46 MiB for anonymous visitors** — the same defect `10`
  found on `/pro`, and worse here because the visitor sees only a skeleton until
  it resolves.
- **A stale code comment points at deleted code.** `blocks-theme-dock.astro:252`
  cites "the same trap `renderProBlocks` in `pages/blocks/index.astro` works
  around"; there is no `renderProBlocks` anywhere in the repo. The trap it names
  (ClientRouter runs a module once) is real and is why the dock re-binds on
  `astro:page-load`; that whole class of workaround dies with `ClientRouter`.
- **`component-wall.astro` carries a dead special case.** `SPECIAL_NAMES` maps
  `"form-rhf": "Form (RHF)"`, but `form-rhf` was removed from `registry.json`
  (`field-base-ui-rewrite`). The wall's row-fill property still holds: 65
  `registry:ui` items + the trailing docs cell = 66, divisible by 2, 3 and 6.
- **Blume's `Analytics` is production-only** (`import.meta.env.PROD`). The port
  must keep that gate or local development starts writing into GA4 property
  `G-8702Z28SMN`.

## Hand-offs

- **To `14`:** the banner path is dead code, not a workaround to weigh — delete
  it. `data-blume-*` is renamed (decision 8), so nothing in the DOM keeps the
  name; the `blume-theme` storage mirror is the sole exception and `14` already
  owns its retirement. Item 4's remaining `blume.config.ts` residents get homes
  here: the GA4 `analytics.scripts` pair moves into the root layout
  production-gated, and `title`/`description`/`logo`/`deployment.site` are
  `15`/`11` metadata inputs. `example-card.astro`'s ClientRouter-shaped
  "delegated once on document" pattern, the dock's `astro:page-load` re-bind,
  `syncDrawerInert` and `SWAP_STYLESHEET_INIT_SCRIPT` all retire together.
  `component-wall.astro`'s `form-rhf` entry should go with them.
- **To `13`:** four intended-diff entries. (i) Block toolbar tooltips gain Base
  UI's open delay and portal. (ii) `/account` renders its signed-out state
  server-side, so its draw animation plays at first paint rather than after
  Clerk boots. (iii) The global focus ring is declared as `var(--foreground)`
  instead of `var(--blume-accent)` — a ≤0.025 L difference in dark mode only.
  (iv) `copy-command.tsx` on the landing page and the `/components` cards now
  follows the package-manager preference. Not diffs, but worth the reviewer's
  attention: `/account` and `/pro` ship no Clerk bundle at all for anonymous
  visitors.
- **To `16`:** the site stays on Inter for the cutover, and Geist is a
  post-migration effort. So the card/site font mismatch must **not** be resolved
  by moving the OG card onto Inter — if the site later moves to Geist, a
  Geist card is already right.
- **To `17`:** the two `[dir="rtl"]` code rules (`pre` forced LTR, inline `code`
  `unicode-bidi: isolate`) are Blume-only and unowned; they belong with that
  ticket's RTL call.
- **To `18-performance-budget` (graduated from the map's fog by this ticket):**
  the chrome shape is now known. The header is one client component with five
  tabs; all three sidebars are client components in persistent layouts; blocks
  pages ship one client component per card plus a concurrency-3 loader context;
  the search dialog is a dynamic import; `/account` and `/pro` are zero-JS for
  anonymous visitors.
- **To `19-404-and-redirect-behaviour` (graduated from the map's fog by this
  ticket):** a 404 now has a concrete chrome — `app/not-found.tsx` at the root,
  and optionally one inside `app/docs`, which is what makes "what does the docs
  404 render" answerable.
