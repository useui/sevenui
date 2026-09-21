# Stage 10 — Ledger 4 verification record

Branch `feat/blume-to-nextjs`, HEAD `7fcfee7` (the fourth and last retirement commit). The four
commits that did the retiring:

```
fdfe40e chore(repo): drop publicHoistPattern
b853102 chore(repo): stop carrying the Blume patch and its generated directories
c64566e chore(web): delete the Blume config, the Astro sources and the assets directory
7fcfee7 docs(repo): describe apps/web as a Next.js App Router site
```

`git show --name-only --diff-filter=D --format=` file counts: `fdfe40e` 0 (line edit inside
`pnpm-workspace.yaml`, no file deletion), `b853102` 2 (`apps/web/.gitignore`,
`patches/blume@1.5.3.patch`), `c64566e` 48 (`blume.config.ts`, `components.ts`, `theme.css`,
`assets/*`, `legacy-pages/**`, `legacy-components/**`), `7fcfee7` 0 (docs only).

This task exists so that no retired input is discovered later and mistaken for live code. Every
row of §14.7's table is walked below, in the table's own order, each with a command, a result, and
— per Addendum A7 — a paired positive control proving the same command shape is capable of
printing a non-zero result. **Do not fix anything found here** (A10): none of the twenty rows
failed.

## Five-page hoist proof (Task 10.1, Proof obligation #6)

Carried here because Stage 10 — Definition of done cites it. Performed in Task 10.1, not
re-performed by this task (which does not touch `pnpm-workspace.yaml`): `node_modules` rebuilt
from scratch after `publicHoistPattern` was removed, `pnpm-lock.yaml` diff empty, and the five
pages whose heavy dependency was hoisted (`carousel` → `embla-carousel-react`, `chart` →
`recharts`, `calendar` → `react-day-picker`, `resizable` → `react-resizable-panels`, `field` →
`react-hook-form`) each render that dependency's own library-generated markup in the prerendered
`.next/server/app/...html`, read off disk rather than assumed — `data-slot="carousel"` +
`aria-roledescription="carousel"`, `class="recharts-wrapper"`, `rdp-day_button`/`rdp-month`,
`data-panel="true"` with library-computed inline `style`, and the `field-rhf` demo's own
`useForm`-bound form markup, respectively. Full detail: `task-10.1-report.md`.

## Generated-output exclusions (fix round 1)

**Every recursive absence-check below excludes `.next` and `node_modules` explicitly, and the
whole-repo sweep (row 1) also excludes `dist` and `.claude`.** This is not cosmetic — an earlier
draft of this record ran several of these commands unfiltered and got contaminated results, which
is the mirror image of Addendum A7's failure mode: not a check that cannot fail, but **a check
that can fail for a reason having nothing to do with the thing under test**.

- **`.next/` is generated output, not source, and this task's own Step 3 build created it.** Its
  server-chunk `*.js.map` files embed the *original* source text verbatim (that is what a source
  map is for), so a grep for retired identifiers finds every comment that mentions them a second
  time, inside a file nobody reads as source. `.next/required-server-files.json`/`.js` add a
  second, sharper failure: they are Next's own build manifest, and one of its real config keys,
  `instrumentationClientRouterTransitionEvents`, contains the literal substring `ClientRouter`
  with **nothing whatsoever to do with Blume's `<ClientRouter>`**. Kept in this record by name
  because the next person who greps `ClientRouter` in a Next.js repo will hit it too.
- **`node_modules/` and `packages/registry/dist/`** are vendored/generated code and this
  migration's own out-of-scope Claude Design sync output respectively; `dist/ds.css` does contain
  one `[data-blume-example]` selector, inherited from `demos/theme.css` (row 6's documented
  survivor) through whatever bundles that sync output — expected, not a new leak, and irrelevant
  to `apps/web`'s source tree regardless.
- **`.claude/worktrees/`** holds four registered git worktrees on unrelated branches (`feat/blocks`,
  three `research/*` branches, confirmed via `git worktree list`) that predate this migration's
  retirement commits, plus one subdirectory, `refactor-monorepo`, that is **not** a registered
  worktree at all — it has no `.git`, just stray `.woff2` font files under a leftover
  `apps/web/.blume/.astro/fonts/` path from an old pre-monorepo snapshot. All five are real files
  on disk, but none is this branch's tree, and none is source by any definition that matters here.
- **A portability note, not a footnote:** this environment's `grep` is a shell function that
  wraps `ugrep` with `--ignore-files` (gitignore-style auto-exclusion), which is *why* row 1's
  original repo-rooted sweep (`grep … .`) came back clean of `.next`/`node_modules`/`dist` without
  any of those three named explicitly — `.` is where the root `.gitignore` lives, so ugrep found
  and applied it. The exact same pattern rooted at `apps/web` (rows 9–17) does **not** get that
  protection, because `apps/web/.gitignore` was itself one of this migration's retirements (row
  4) and no `.gitignore` remains anywhere under `apps/web` for a subtree-rooted search to find.
  Every command below now carries its exclusions **explicitly** so the result does not depend on
  which `.gitignore` happens to be reachable from the search root, or on this shell having ugrep's
  auto-exclusion at all — a plain POSIX `grep` understands none of this and needs the flags
  spelled out regardless. `.superpowers/`, `.scratch/` and `docs/superpowers/` hold this
  migration's own planning prose and would match almost any retired identifier by design; no row
  below searches those trees, so no exclusion is needed for them, but a future row that did would
  need the same treatment.

## The Ledger 4 walk (§14.7, one row per table line)

| # | Input (§14.7) | Command | Result | Paired positive control |
|---|---|---|---|---|
| 1 | `blume` package, `blume.config.ts`, `components.ts` | `test ! -e apps/web/blume.config.ts && test ! -e apps/web/components.ts && echo "config gone"` — plus `grep -n '"blume"' apps/web/package.json pnpm-lock.yaml`, plus a whole-repo sweep `grep -rln 'blume' . --include='*.ts' --include='*.tsx' --include='*.mjs' --include='*.json' --include='*.css' --include='*.yaml' --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude-dir=docs --exclude-dir=.superpowers --exclude-dir=.scratch --exclude-dir=dist --exclude-dir=.claude` with every hit inspected (`dist` and `.claude` added in fix round 1 — see the exclusions note above) | `config gone`. Zero matches in `package.json`/`pnpm-lock.yaml` (grep exit 1 on both). The whole-repo sweep returns exactly 24 files on this branch, and every one is a comment **except three named exceptions**: the documented write site (`theme-provider.tsx:36`'s `blume-theme` write — row 5 below and §20.1), the documented registry survivor (`packages/registry/demos/theme.css:153`'s `[data-blume-example]` selector — row 6, out of migration scope), and **`packages/presets/tests/apply.test.ts:64`**, which is live test code, not a comment: `window.dispatchEvent(new StorageEvent("storage", { key: "blume-theme" }))`, deliberately using the bridge's real key to prove `watchPresetConfig` ignores storage events for keys other than its own. `packages/presets/apply.ts:27` is a comment describing the same mechanism by analogy; the function's actual live code reacts to `PRESET_CONFIG_KEY`, never the literal string `"blume-theme"`. None of the three is a new leak — all three are the documented bridge's write side, read-side test, and out-of-scope registry survivor | `grep -n '"next"' apps/web/package.json` → line 24 found; `grep -c "lucide-react" pnpm-lock.yaml` → 4. Both prove the grep mechanism reaches real content in the files it just cleared |
| 2 | `patches/blume@1.5.3.patch`, `patchedDependencies` | `test ! -e patches/blume@1.5.3.patch && echo "patch gone"`; `grep -c 'patchedDependencies\|publicHoistPattern' pnpm-workspace.yaml` | `patch gone`. Count: `0` | `grep -c 'packages:' pnpm-workspace.yaml` → `1`, proving the file and the grep both still work |
| 3 | `pnpm-workspace.yaml` `publicHoistPattern` | same command as row 2 | `0` (same run) | same control as row 2 |
| 4 | `apps/web/.blume/`, `.blume-verify/`, `apps/web/.gitignore` | `test ! -e apps/web/.blume && test ! -e apps/web/.blume-verify && test ! -e apps/web/.gitignore && echo "generated gone"` | `generated gone` | (absence-of-file check; the paired control for this shape is row 5's `assets gone` succeeding for a different, also-real path, and the failed-branch behavior was confirmed by first running the check against a path known to exist, `apps/web/package.json`, which correctly fails `test ! -e`) |
| 5 | `apps/web/assets/`, `components/combination-mark.tsx` | `test ! -e apps/web/assets && test ! -e apps/web/legacy-components/combination-mark.tsx && echo "assets gone"` | `assets gone` | `test -e apps/web/components/logomark.tsx && echo present` → `present` (the file `assets/logomark.svg` was byte-identical to and replaced by) |
| 6 | `packages/registry/demos/theme.css` | `test -e packages/registry/demos/theme.css && echo "still on disk (correct)"`; `grep -n 'demos/theme.css' scripts/check-registry.mjs`; `grep -c 'no longer loaded by the site' packages/registry/demos/theme.css` | `still on disk (correct)`. Comment found at the **read site**, `scripts/check-registry.mjs:159,161` (not inside the registry file). In-file grep: `0` — confirming the required comment lives at the read site and not as a registry edit | `grep -c '\[data-blume-example\]' packages/registry/demos/theme.css` → `1`, proving the file itself is intact and the grep isn't just missing everything |
| 7 | `/blume-assets/*` | `curl -s -o /dev/null -w '%{http_code}' -H "x-vercel-protection-bypass: $VERCEL_BYPASS" "$PREVIEW_URL/blume-assets/anything"` | **404** — controller, over the wire, against the preview deployment (`$PREVIEW_URL`), 2026-09-21 | `curl … "$PREVIEW_URL/docs/components/button"` → **200** (the page itself, same run) |
| 8 | WebMCP (`<blume-webmcp>` + 2,709 B module) | `grep -rn 'webmcp\|WebMCP' apps/web/app apps/web/components apps/web/lib`; built-doc sweep: `find apps/web/.next/server/app -name '*.html' -exec grep -l 'blume-webmcp' {} \;` (111 files) | Source: one comment hit (`page-actions.tsx:20`, "§15.14 retires WebMCP outright"), no module file exists anywhere in the tree. Built docs: `0` over **111** files | `find apps/web/.next/server/app -name '*.html' -exec grep -l 'data-sevenui-example' {} \;` → **75** files, over the same 111-file set, proving the sweep isn't scanning an empty or wrong tree |
| 9 | `rafThrottle` resize listener, postMessage height protocol, frame `ResizeObserver`, `100svh` viewport clamp | `grep -rn 'rafThrottle' apps/web packages --exclude-dir=.next --exclude-dir=node_modules --exclude-dir=dist`; `grep -rn 'postMessage' apps/web/components apps/web/lib apps/web/app --exclude-dir=.next --exclude-dir=node_modules`; `grep -rn 'ResizeObserver' apps/web --exclude-dir=.next --exclude-dir=node_modules`; `grep -rn '100svh' apps/web --exclude-dir=.next --exclude-dir=node_modules`; built-doc sweep for `rafThrottle` over all 111 `*.html` | Source: 2 comment hits for `rafThrottle` (`demo-tabs.tsx:33`, `page-actions.tsx:209`), 2 comment hits for `postMessage` (`demo-tabs.tsx:32`, `code-block.tsx:111`) — all describing the retirement, none live. `100svh`: **0** hits, comment or otherwise (unfiltered, this string also matches `.next/static/chunks/*.css` — build-generated Tailwind output, excluded). **`ResizeObserver` is a genuine live hit, and it is not this row's retirement**: `apps/web/components/blocks/block-preview.tsx:253` (`const observer = new ResizeObserver(…)`) is the `/blocks` preview frame's own resize-handle measurement — a still-live, unrelated feature, since `/blocks` previews genuinely use an iframe (§20.1's cross-repo bridge exists for exactly that surface), unlike the docs-demo iframe §7.3 retired. The other 4 `ResizeObserver` hits, all in the same file, are its own comments. Built docs: `rafThrottle` count `0` over 111 files | `grep -rln '100vh\|100dvh' apps/web --include='*.tsx'` → 5 files found (`docs/layout.tsx`, `components/layout.tsx`, `drawer-shell.tsx`, `blocks-sidebar.tsx`, `docs/sidebar.tsx`), proving the grep shape finds real viewport-unit usage when it's actually there and isn't just failing silently on `100svh` |
| 10 | `ClientRouter`, `SWAP_STYLESHEET_INIT_SCRIPT`, `syncDrawerInert`, `astro:page-load` re-binds, `example-card`'s delegated-once pattern | `grep -rn 'BANNER_INIT_SCRIPT\|--blume-drawer-top\|syncDrawerInert\|ClientRouter' apps/web --exclude-dir=.next --exclude-dir=node_modules` (plan's Step 4 command, covers `syncDrawerInert`/`ClientRouter`); plus bespoke `grep -rn 'SWAP_STYLESHEET_INIT_SCRIPT\|astro:page-load\|delegated-once' apps/web --exclude-dir=.next --exclude-dir=node_modules` | 16 hits across 10 files for the plan's grep, **every one a `//` or `/* */` comment** explaining what App Router does instead (`app/layout.tsx`, `component-wall.tsx`, `site-header.tsx`, `site-footer.tsx`, `drawer-shell.tsx`, `blocks-load-gate.tsx`, `pro/buy-link.tsx`, `theme-dock-controls.tsx`, `docs/sidebar.tsx`, `account-panel.tsx`). Run unfiltered (no exclusions), the same command additionally matches `.next/required-server-files.json` and `.next/required-server-files.js` — **a genuine false positive, not noise to wave away**: both files contain Next's own build-config key `instrumentationClientRouterTransitionEvents`, which has nothing to do with Blume's `<ClientRouter>` and would have hit even on a repo that never carried Blume. `SWAP_STYLESHEET_INIT_SCRIPT`/`astro:page-load`/`delegated-once`, filtered: 5 files (`app/layout.tsx`, `site-header.tsx`, `theme-dock-controls.tsx`, `pro/buy-link.tsx`, `gallery/example-card.tsx`), all comments — `SWAP_STYLESHEET_INIT_SCRIPT` appears only inside `app/layout.tsx`'s `ClientRouter` comment (already counted above); `astro:page-load` in `site-header.tsx:68`, `theme-dock-controls.tsx:32`, `example-card.tsx:31`; `delegated-once` once, `example-card.tsx:32`. Unfiltered, this second command also picks up 5 `.next` chunk `*.js.map` files (source maps re-embedding the same comment text) — excluded, not a separate finding | `grep -c 'useRouter\|usePathname' apps/web/components/site-header.tsx` → non-zero, proving Next's own navigation hooks (the actual replacement) are present in the same file the retired name is only commented on |
| 11 | `<Banner>`, `BANNER_INIT_SCRIPT`, dismiss branch, `--blume-drawer-top` | plan's Step 4 command (row 10) plus bespoke `grep -rn '<Banner>\|BANNER_INIT_SCRIPT' apps/web --exclude-dir=.next --exclude-dir=node_modules` | One hit, `app/layout.tsx:56`, a comment naming both `<Banner>` and `BANNER_INIT_SCRIPT` as retired dead code, not live JSX/script (unfiltered, this command also matches one `.next` chunk `*.js.map` — the same source-map noise as row 10, excluded). `--blume-drawer-top`: 2 comment hits (`drawer-shell.tsx:37`, `docs/sidebar.tsx:173`), both describing the `top-16` static replacement | `grep -c 'top-16' apps/web/components/drawer-shell.tsx` → 1, the actual static replacement value the comment describes, proving it really did land |
| 12 | Blume `page`-mode nav panels, `collapsed: false` | plan's Step 4 command: `grep -rn 'collapsed: false\|blume-nav' apps/web --exclude-dir=.next --exclude-dir=node_modules` | 11 comment hits, all in `docs/sidebar.tsx`/`drawer-context.tsx`/`drawer-shell.tsx`, documenting the retired `data-blume-nav-*` attributes and `collapsed: false`'s non-use; zero live occurrences of the literal `collapsed: false` prop assignment (unfiltered, this command also matches 2 `.next` chunk `*.js.map` files — the same source-map noise as rows 10/11, excluded) | `grep -c 'aside\|nav' apps/web/components/docs/sidebar.tsx` → non-zero, confirming the file that supposedly has no live `blume-nav` really is the file the check should be pointed at |
| 13 | `blume-client-data` JSON island | plan's Step 3 command, run as the built-doc sweep: `0` over 111 `*.html` files; source: `grep -rn 'blume-client-data' apps/web` | Built docs: **0** over 111 files. Source: one comment hit, `app/layout.tsx:58`, describing what the island used to emit and that "nothing reads it" | positive control shared with row 8: `data-sevenui-example` → 75/111 files |
| 14 | 69 `/<route>.mdx` endpoints | `curl … "$PREVIEW_URL/docs/components/button.mdx"` | **404** — controller, over the wire, against the preview deployment (`$PREVIEW_URL`), 2026-09-21. Source-level cross-check: no `route.ts` anywhere under `apps/web/app` emits a `.mdx` extension; the only `.mdx` strings in source (`docs/[[...slug]]/page.tsx`, `llms-full.txt/route.ts`, `globals.css`) refer to the **content file extension** used by the `.md`-serving catch-all, not a served URL | `curl … "$PREVIEW_URL/docs/components/button.md"` → **200** (the reproduced mirror, one character away from the row above); `curl … "$PREVIEW_URL/docs/components/button"` → **200** (the page itself) |
| 15 | `⌘J` search binding | `grep -rn "KeyJ\|'j'" apps/web/components apps/web/lib` | `0` hits | `grep -n "event.key ===" apps/web/components/search/search-trigger.tsx` → finds `event.key === "k"`/`"K"`, the site's real (and different) `⌘K` binding — proving the keyboard-shortcut grep shape does find bindings when they exist, and that `⌘J` really isn't one of them |
| 16 | `rtl:-scale-x-100`, two `[dir="rtl"]` code rules | plan's Step 4 command: `grep -rn 'rtl:-scale-x-100' apps/web --exclude-dir=.next --exclude-dir=node_modules`; bespoke for the two code rules: `grep -rn '\[dir="rtl"\]' apps/web --exclude-dir=.next --exclude-dir=node_modules` | `0` hits anywhere in source for both commands (`.next` never contained a match for either pattern, so filtering changed nothing here — confirmed by re-running unfiltered) | `grep -rn 'dir="rtl"' apps/web/components/blocks/install-control.tsx` → 3 hits, all comment, describing the one `dir="rtl"` typographic trick that **does** survive (a truncation trick, not the retired `[dir="rtl"]` CSS rules) — proving the `dir="rtl"` grep shape isn't universally silent |
| 17 | `--color-action`, `--color-action-foreground`, `--color-code`, `--radius-blume` | plan's Step 4 command: `grep -rn 'radius-blume\|color-action\|--color-code' apps/web --exclude-dir=.next --exclude-dir=node_modules` | One hit, `components/docs/toc.tsx:95`, a comment ("Blume's 12px radius token dies with `--radius-blume`"), not a live CSS declaration. Zero hits in `globals.css` itself. **Unfiltered, this command also matches `.next/server/chunks/ssr/apps_web_components_docs_0j1skvx._.js.map`** — the same source map, embedding `toc.tsx`'s comment a second time; excluded, not a second source-level hit | `grep -c -- '--color-success\|--radius' apps/web/app/globals.css` → `7`, proving the token grep shape finds real custom properties in the same file it found zero retired ones in |
| 18 | `body { background-* }` base rule | `awk '/^body/{f=1} f{print} f&&/}/{exit}' apps/web/app/globals.css` (prints the `body` rule block, if any) | No output — there is no `body { … }` rule in `globals.css` at all; the base rule was dropped entirely, not merely emptied | `grep -c 'data-theme' apps/web/app/globals.css` → `7`, proving the file and the read mechanism both work |
| 19 | posthog / plausible / internal reporter / `blume:track` sinks | plan's Step 4 command: `grep -rn 'posthog\|plausible\|blume:track' apps/web --include='*.ts' --include='*.tsx' --exclude-dir=.next --exclude-dir=node_modules` | 3 hits, all comments (`docs/[[...slug]]/page.tsx:83` — an unrelated use of the English word "plausible"; `components/docs/feedback.tsx:34-36` — a comment naming all the sinks Blume could have used and that "only gtag is configured on this site"). The `--include` filters already excluded `.next`/`.json`/`.map` content before this fix round; adding the exclude-dirs is belt-and-suspenders and changes nothing here — confirmed by re-running both ways | `grep -n 'G-8702Z28SMN' apps/web/components/analytics.tsx` → found, the one sink that **is** configured, in the same search family |
| 20 | `@vercel/analytics` | plan's Step 4 command: `grep -rn '@vercel/analytics' apps/web --exclude-dir=.next --exclude-dir=node_modules` | `0` hits anywhere, including `apps/web/package.json`, filtered and unfiltered alike — this pattern never appeared in `.next` either | `grep -n 'previews' apps/web/vercel.json` → `2` hits, proving `vercel.json` (a real, present, vercel-related file) is reachable by the same kind of search and the zero above isn't a file-not-found false negative |

### The two controller-owned rows (Addendum A5), filled in

Rows 7 and 14 above carry the results **the controller ran against the preview deployment and
reported back**, attributed exactly as specified:

> controller, over the wire, against the preview deployment (`$PREVIEW_URL`), 2026-09-21

| path | status | role |
|---|---|---|
| `/blume-assets/anything` | **404** | the row's assertion — §14.7 says this 404s live and is not reproduced |
| `/docs/components/button.mdx` | **404** | the row's assertion — the 69 dropped `.mdx` mirrors (§15.1) |
| `/docs/components/button.md` | **200** | positive control — the `.md` mirror that *is* reproduced, one character away |
| `/docs/components/button` | **200** | positive control — the page itself, proving the prober reaches real content |
| `/not-a-real-page` | **404** | control for the 404 path itself, so a 404 above isn't just "everything 404s" |

Observation (not an assertion): `/blume-assets/` — trailing slash, no path — answers **308**, not
404; Next's own trailing-slash normalization answers before any route does. The ledger's row is
about `/blume-assets/*`, which `/blume-assets/anything` covers directly; recorded so a later
reader probing the bare prefix isn't surprised by the 308.

**Command shape used by the controller** (bypass header elided):

```bash
curl -s -o /dev/null -w '%{http_code}' -H "x-vercel-protection-bypass: $VERCEL_BYPASS" "$PREVIEW_URL<path>"
```

This task did not attempt either check locally, per Addendum A5/A2 (no server start, no probing
the preview from inside this task).

## Step 5 — the one survivor, and the §20.1 removal condition (verbatim)

```
grep -rn 'blume-theme' apps/web --include='*.tsx'
```

Result — **exactly one write site**:

```
apps/web/components/theme-provider.tsx:36:        localStorage.setItem("blume-theme", resolvedTheme);
```

Positive control: the same file's `localStorage` usage is itself the proof the grep reaches the
right file (`grep -rn 'localStorage' apps/web/components/theme-provider.tsx` → the same line).

The write site carries the §20.1 removal condition as a comment (lines 21–29 of
`theme-provider.tsx`), and §20.1's table row is copied here **verbatim, in full**, from
`docs/superpowers/specs/2026-09-18-blume-to-nextjs-migration-design.md` line ~1064:

> | Bridge | Why it exists | Removal condition |
> |---|---|---|
> | The app mirrors the resolved theme into `localStorage["blume-theme"]` on every theme change (~5 lines in an effect), one-way | §8.1 renames the key to `theme`, but the storage key is a **cross-repo contract**: the pro previews are same-origin through the `/previews/*` rewrite and sync over the native `storage` event. Without the mirror, `/blocks` previews lose theme sync between the web cutover and the pro deploy — 16 pages, the site's most hand-tuned surface | **Delete once the pro repo reads `theme`.** A comment at the write site repeats this condition |

**This must be copied into the PR body** — nothing automated can observe when the pro repo starts
reading `theme`; it has to be remembered by a person.

The read side of the same bridge lives outside `apps/web`, in `packages/presets/apply.ts:27`
(comment) and is exercised by `packages/presets/tests/apply.test.ts:64`
(`new StorageEvent("storage", { key: "blume-theme" })`) — the pro-side consumer this bridge exists
for, not a second leak.

## Two things beyond the plan's list (Ruling 92)

Not in §14.7 because no inventory in this migration had them — a second, pre-monorepo `.blume/`
at the **repository root** (2.9 MB) and a root `dist/` were both deleted; an ignore rule
(`.git/info/exclude`, not `.gitignore`) had hidden the root `.blume/` from every earlier sweep.

```
test ! -e .blume && echo "root .blume gone"      # → root .blume gone
test ! -e dist && echo "root dist gone"          # → root dist gone
```

`packages/registry/dist/` was deliberately left alone — it is Claude Design sync output, unrelated
to this migration, which is why `.gitignore` keeps its `dist/` line:

```
$ ls -la packages/registry/dist
drwxr-xr-x@ 7 … .
… (present, untouched)
```

## `globals.css`'s two `@source not` exclusions

`c64566e` also removed `globals.css`'s two `@source not "../legacy-components"` /
`@source not "../legacy-pages"` exclusions, together with the directories they excluded (Tailwind
was lifting `[data-blume-nav-open]` and `--blume-drawer-top` out of the uncompiled `.astro` files
under those directories into the shipped stylesheet before this task's predecessor closed that
gap). Whether a `blume-*` identifier leaked back into the shipped stylesheet was re-checked here:

```bash
grep -n '@source' apps/web/app/globals.css
#  7:@source "../../../packages/registry/registry";
#  8:@source "../../../packages/registry/components";
grep -rn 'blume-nav-open\|blume-drawer-top\|data-blume-example' apps/web --include='*.css' --include='*.tsx' --include='*.ts'
```

Result: only two `@source` lines remain (the `not` exclusions and the directories they pointed at
are both gone — `legacy-components/`, `legacy-pages/` confirmed absent). Every `blume-nav-open` /
`blume-drawer-top` / `data-blume-example` hit is inside a `/* */` or `//` comment
(`drawer-context.tsx`, `drawer-shell.tsx`, `docs/sidebar.tsx`, `preview-pane.tsx`, `globals.css`
itself) — no live selector, attribute value, or custom-property declaration. **Nothing leaked
back.**

## `AGENTS.md` no longer calls `apps/web` a Blume site

```
grep -n 'Blume\|Astro' AGENTS.md
grep -n 'Next.js\|App Router' AGENTS.md
```

Line 5: "`apps/web` … Docs site (Next.js, `apps/web`)". Line 13: "`apps/web` (`@sevenui/web`) is a
Next.js App Router site". Line 12 (the only remaining `Blume` mention) names the migration spec/
plan/ADR themselves, not the app's identity. Satisfied.

## Test / check counts (Stage 10 — Definition of done)

| Command | Result |
|---|---|
| `pnpm -r typecheck` | clean across all three workspace packages (`apps/web`, `packages/registry`, `packages/presets`) |
| `pnpm check:registry` | `check-registry: ok (67 ui, 137 demos, 40 components)` |
| `pnpm test` | `packages/registry`: 65 test files, **525/525** passed. `packages/presets`: 4 test files, **46/46** passed |
| `pnpm --filter @sevenui/web build` | Compiled successfully; **227/227** routes generated, 0 errors |
| `pnpm test:smoke` | `scripts/smoke-test.sh` — 13 files installed through the pinned local `shadcn` CLI binary into a scratch project. `Smoke test passed.` |

`node scripts/route-inventory.mjs`: docs **69** / gallery **11** / blocks **24** / standalone **5**
/ notFound **1** = **110**, matching the expected total exactly.

## Verdict

All twenty §14.7 rows walked, none red. Both DoD bullets that are this task's own responsibility
(`blume` in no manifest/lockfile/source file except the three named exceptions; the Ledger 4 walk
itself) hold. The `publicHoistPattern` proof and `AGENTS.md` wording were re-confirmed rather than
re-derived, since they belong to Tasks 10.1 and a prior commit respectively. The two HTTP rows are
filled with the controller's over-the-wire results against the preview, attributed as specified,
not executed locally by this task (Addendum A2/A5).

**Fix round 1** corrected five rows (9, 10, 11, 12, 17) whose commands, run literally against the
state this task's own build leaves behind, print a bigger and noisier result than the record had
claimed — `.next/`'s source maps and build manifest, not source, were the difference — and named
the `ClientRouter` / `instrumentationClientRouterTransitionEvents` collision as a standing false
positive worth remembering. It also corrected row 9 to include an explicit `ResizeObserver` check
(previously only inferred from a comment), which surfaced a genuine live hit unrelated to this
row's retirement (`/blocks`' own preview-frame resize handle), and corrected row 1's "every one a
comment" claim to name three exceptions instead of two (`packages/presets/tests/apply.test.ts:64`
is live test code). No row's substantive verdict changed — every hit reclassified above was
already comment-only or already-explained; the fix is to the record's precision, not to a
retirement that turned out to have failed.

No `git commit` was run from this task, per Addendum A1 — file changes and the record are left for
the controller/PR flow.

## Stage 10 — preview verification (controller, Ruling 89)

Written by the controller, not by the task's implementer: this pass has no diff of its own, and
Ruling 89 assigns it here for the same reason Stage 9's Ruling 81 assigned its card review. Run
against the preview deployment of `9e1ec3f`, for which GitHub reports the Vercel check `success`.
**The commit status is what says which build answered** — this stage's commits are output-neutral
for the most part, so a fetch alone could not distinguish them.

The plan asks for "one route per surface plus the five heavy-dependency pages, light and dark, 1440
— looking for **things that stopped working**, not for drift."

### HTTP pass, 13 surfaces

All 200 except the deliberate miss. Byte sizes and a per-surface content needle:

| route | status | bytes | needle |
|---|---|---|---|
| `/` | 200 | 212,669 | `SevenUI` |
| `/docs` | 200 | 160,055 | `Introduction` ×2 |
| `/docs/components/button` | 200 | 325,696 | `data-sevenui-example` ×5 |
| `/components` | 200 | 40,997 | `href="/components/button"`, `Accordion`, `Dropdown Menu` — production's own `/components` is 38,347 B with the same link |
| `/components/dialog` | 200 | 214,879 | `data-sevenui-example` ×4 |
| `/blocks` | 200 | 126,843 | category cards |
| `/blocks/marketing` | 200 | 98,985 | `href="/blocks/marketing…"` |
| `/blocks/marketing/hero` | 200 | 257,459 | `iframe` |
| `/pro` | 200 | 104,745 | — |
| `/account` | 200 | 72,939 | `Sign` |
| `/terms` | 200 | 90,699 | `Terms of Service` |
| `/privacy` | 200 | 92,097 | `Privacy` |
| `/not-a-real-page` | **404** | 25,457 | `Page not found` |

One needle in the first run returned zero — `data-slot` on `/components` — and it was the needle
that was wrong, not the page: the gallery index is a link grid, not a demo surface, and it carries
every link and label it should. Recorded rather than quietly re-run, because "the check found
nothing" and "the check was pointed at the wrong thing" look identical in a table.

### Browser pass, 17 routes × 2 themes = 34 loads, Chromium at 1440×900

Every load: correct status, `data-theme` actually applied, a distinct computed `body` background per
theme (`lab(100 0 0)` light / `lab(2.75381 0 0)` dark — so the theme took effect rather than being
merely set), the expected `<h1>`, and **zero console errors and zero page errors** on all 33 live
routes. The 34th, `/not-a-real-page`, logs exactly one console error — the 404 itself — which is
this pass's own positive control: an error listener that reports nothing on a page known to produce
one is not listening.

Screenshots reviewed: the landing in light (exposed grid, ruler, live component row all intact),
`/docs/components/chart` in dark (Recharts bars, axis labels and legend drawn — the failure mode
§Task 10.1 Step 3 called out as a *runtime* rather than build error), `/docs/components/calendar` in
light (react-day-picker's grid, June 2026, selected day), and `/blocks/marketing/hero` in light (the
sidebar tree with its counts, the pro banner, the block frame's toolbar, the pro iframe rendering
its content, and the theme dock).

**Nothing stopped working.** The five heavy dependencies whose hoist was removed in `fdfe40e` all
render in a browser, on Vercel's own from-scratch install, in both themes.

## Closing the record against the final deployment (controller)

The whole-stage review, run after this record's twenty rows were already green, found **one
Critical that no row of this record could have caught** — and saying so here is the point of
appending this section rather than editing the table above.

**`scripts/check-pro-manifest.mjs` stopped being able to run.** It imports `lucide-react` bare;
`scripts/` is not a package root; the import resolved only because `publicHoistPattern` — row 3 of
the table above, asserted gone and correctly so — had placed the package at the workspace root for
Node's ancestor walk. Removing the hoist was right and its five-page proof was sound; §14.1's
argument is simply silent about a plain Node script, which does exactly the thing it says Next.js
never does.

Why every check here missed it: this record walks **§14.7's inventory of retired inputs**, and
`check-pro-manifest.mjs` is not a retired input — it is a *consumer* of one. Row 3 asks "is
`publicHoistPattern` gone?" and the answer is yes. Nothing in the table asks "what was resolving
through it?" The stage's own gate ("if the extractor reports a new diff here, a retirement removed
something live") reads rendered pages, where a CI script never appears.

And nothing was red. `.github/workflows/manifest-canary.yml` is a `schedule:` workflow, GitHub
fires schedules only from the default branch, so it had never run from this branch — it would have
started failing the moment this merged, silently ending the only signal that checks the live pro
manifest's shape, on a surface whose ISR stale-serve is precisely what would keep the failure quiet.

Fixed in `0b9c9bd`: `lucide-react` declared in the root `package.json`, and a `ci.yml` step running
the canary against the committed fixture `pnpm build` already uses — offline, deterministic, and on
the pull request rather than after the merge. Proven both directions, including with the
`lucide-react` symlink renamed aside so the guard was seen to fail on its own axis.

**Stated with its limit:** `ci.yml`'s triggers are `push: branches: [main]` and `pull_request`.
There is no PR and `main` is untouched, so that new step has never executed on a GitHub runner. It
is proven by running its exact command locally, with a control. A runner has not done it.

### The lesson this record should carry forward

A retirement inventory answers *is the retired thing gone?* It cannot answer *what was depending on
it?* — and the second question is where the damage lives. Before Stage 11 removes anything else:
enumerate the removed capability's consumers **from the repo** — every entry point that resolves a
bare specifier, and whatever invokes each one — not from the stage's own narrative of which
consumers matter. A definition of done that lists consumers by name is a hand-mirrored list, which
is the defect this stage spent three sweeps learning to stop writing.

### Final state, measured against the deployment of `0b9c9bd` (Vercel check `success`)

| probe | result |
|---|---|
| `/`, `/docs/components/button`, `/blocks/marketing/hero`, `/og/index.png`, `/llms.txt`, `/sitemap.xml` | 200 |
| `node scripts/route-inventory.mjs` | total **110** (docs 69 / gallery 11 / blocks 24 / standalone 5 / notFound 1) |
| `pnpm -r typecheck` / `check:registry` / `test` / `build` / `test:smoke` | clean / ok (67, 137, 40) / 525 + 46 / 227 routes / passed |
| `node scripts/check-pro-manifest.mjs` | exit 0 live, exit 1 on a broken fixture |
