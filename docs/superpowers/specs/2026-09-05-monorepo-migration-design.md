# SevenUI — Monorepo Migration Design

**Date:** 2026-09-05
**Status:** Approved (design sections approved in conversation)
**Prerequisite for:** blocks/templates phase (free + paid) — product design of blocks is a separate, later spec
**Supersedes:** the "Repo structure: flat single package" decision in `2026-09-02-sevenui-registry-design.md` (that spec explicitly deferred the migration to the blocks phase; every other decision there remains binding)

## Summary

Restructure the repo into a pnpm workspace with two packages — `apps/web` (Blume docs site + landing) and `packages/registry` (component sources, examples, registry.json, tests) — as the prerequisite for the blocks/templates phase. The migration is purely structural: registry URLs (`https://sevenui.dev/r/<name>.json`) serve **byte-identical** content before and after, docs URLs (`/docs/...`) are unchanged, and no component source file changes content. It lands as one reviewable PR.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Layout | `apps/web` + `packages/registry` | Clean web/registry separation; blocks phase slots in as `packages/blocks` later |
| Blocks placeholder | Workspace glob `packages/*` only — no empty scaffold now | YAGNI; the glob already reserves the home |
| Tooling | pnpm workspaces only, no turborepo/nx | 2 packages, one-directional build chain; revisit when blocks add packages |
| Vercel | Root Directory → `apps/web` (dashboard change at merge time) | Vercel's native monorepo path; detects the pnpm workspace, installs at repo root |
| Paid-blocks posture | Separate private repo + separate Vercel project, served under sevenui.dev via rewrites/subdomain | Public repo stays fully public; migration must only keep this door open |
| apps/web ↔ registry coupling | Filesystem paths (examples source, tsconfig alias, relative `registry.json` import) — **no** workspace dependency | The registry is a source tree distributed via shadcn, not an npm package; a package boundary would be fake |
| `web/` flattening | `web/docs` → `apps/web/docs`, `web/pages` → `apps/web/pages`, etc. | URLs come from `basePath: "/docs"` in config, not from the directory name; no URL impact |
| Release | CHANGELOG entry ("internal restructure"), **no version tag** | No user-facing change; tags mark component waves |

## Verified Tool Facts (checked against installed tooling, 2026-09-05)

These are load-bearing; each was read from the installed packages in `node_modules`, not from memory:

1. **Built registry JSON embeds paths and content.** `public/r/button.json` contains `"path": "registry/base/ui/button.tsx"` and the full file content including `@/registry/base/lib/utils` import strings. Byte-parity therefore pins: `registry.json` item definitions, source file contents, and file paths **relative to the shadcn build cwd**.
2. **shadcn CLI (4.19.1)** `build` accepts `[registry]` (default `./registry.json`), `-o/--output` (default `./public/r`), and `-c/--cwd`. Running with cwd `packages/registry` and output `apps/web/public/r` keeps every recorded path identical.
3. **Blume (1.5.3) is workspace-aware.** Its Vite config sets `fs.allow = [findWorkspaceRoot(root), root]`, where `findWorkspaceRoot` walks up looking for workspace markers (including `pnpm-workspace.yaml`). Files outside the Blume project but inside the workspace are servable in dev.
4. **Blume `examples.source` is configurable** (string, default `"examples"`; glob supported). Alias resolution for example files uses `get-tsconfig` from the project root, so `apps/web/tsconfig.json` `paths` controls how `@/registry/*` resolves in previews.
5. **`blume build --isolated` / `blume check --isolated`** build into a throwaway `.blume-verify/` runtime, so verification can run while `blume dev` is up (resolves the wave-4-era "build refuses while dev runs" trap).
6. **Blume leaves a user-shipped `public/vercel.json` untouched** in static builds — the rewrites door for paid blocks stays open.
7. **Vercel settings live in the dashboard** — no `vercel.json` or `.vercel/` in the repo. The cutover is an explicit human action in the plan.

## Target Layout

```
sevenui/
├── apps/web/                      # Blume docs site + landing
│   ├── blume.config.ts            # content.root: "docs", pages: "pages"
│   ├── theme.css                  # moved from repo root (Blume "user theme.css" injection)
│   ├── docs/                      # ← web/docs (archived versions exist as config entries only; no snapshot dirs)
│   ├── pages/                     # ← web/pages
│   ├── assets/                    # ← web/assets
│   ├── components/                # ← web/components (landing components)
│   ├── public/                    # ← public (icon.svg; r/ is build output, stays gitignored)
│   ├── tsconfig.json              # "@/registry/*" → "../../packages/registry/registry/*"
│   └── package.json               # blume, shadcn, react (landing), typescript
├── packages/registry/             # BYTE-PARITY ZONE — internal structure unchanged
│   ├── registry/base/{ui,lib}/    # unchanged
│   ├── examples/                  # unchanged (theme.css included)
│   ├── registry.json              # unchanged (paths stay registry/... and examples/...)
│   ├── tests/  vitest.config.ts   # moved from repo root
│   ├── tsconfig.json              # "@/*" → "./*"
│   └── package.json               # @base-ui/react, cva, clsx, tailwind-merge, 4 wrappers; vitest et al.
├── scripts/                       # stays at root: check-registry.mjs, smoke-test.sh (cross-package)
├── docs/superpowers/              # internal planning material — untouched, never published
├── package.json                   # orchestration only: dev/build/typecheck/test/check:registry/test:smoke
├── pnpm-workspace.yaml            # packages: [apps/*, packages/*] + existing allowBuilds
└── AGENTS.md, CHANGELOG.md, README.md
```

Generated dirs (`.blume/`, `dist/`) regenerate under `apps/web/`; `.gitignore` updated accordingly.

## Package Boundaries

- **packages/registry** owns component sources, examples, and the vitest suite. Dependencies: `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `react`/`react-dom`, and the four sanctioned wrappers (`react-day-picker`, `embla-carousel-react`, `recharts`, `react-resizable-panels`). Dev: vitest, testing-library, jsdom, react-hook-form, typescript. Own scripts: `typecheck`, `test`.
- **apps/web** owns the Blume site. Dependencies: `blume`, `shadcn` (build runs here), `react`/`react-dom` (landing components), typescript. Own scripts: `dev`, `build` (= `shadcn build -c ../../packages/registry -o ./public/r && blume build`), `preview`, `typecheck`.
- **Root** orchestrates via `pnpm --filter` (same script names as today so CI and muscle memory keep working) and hosts the two cross-package scripts.
- No workspace dependency between the two packages. Coupling is filesystem-level and explicit: `examples.source` path, tsconfig alias, and the landing page's relative import of `registry.json`.

## Byte-Parity Mechanics

1. **Baseline first.** Before any file moves, snapshot the current `public/r/*.json` (all 115 items) with a SHA-256 manifest, stored outside the worktree.
2. **Parity gate at every task boundary.** Rebuild, `diff -r` against the baseline. Any drift stops the line — no "fix it later".
3. **Content freeze.** No task edits component source, example, or `registry.json` item content. Import strings (`@/registry/...`) stay as-is; the shadcn CLI rewrites them consumer-side.
4. **Build relocation.** `shadcn build` runs with cwd `packages/registry`, output `apps/web/public/r`. Recorded paths stay `registry/base/...` / `examples/...` → identical output.
5. **Pre-merge proof.** The PR's Vercel preview deploy serves `/r/*.json`; hash the full set from the preview URL against the baseline.
6. **Post-merge proof.** From the production domain: full-set hash comparison via curl, plus a real `npx shadcn@latest add` of representative components (button, dialog, chart) from `https://sevenui.dev/r/...` in a scratch project.

## Blume Rewiring (primary risk zone)

`blume.config.ts` moves to `apps/web/` with these path changes: `content: { root: "docs", pages: "pages" }`, `logo: "assets/logomark.svg"`, `examples: { source: "../../packages/registry/examples", css: "../../packages/registry/examples/theme.css" }`. Everything else (basePath, versions, search, analytics, integrations hook) is untouched.

**Spike before any file moves:** prove in a throwaway branch that `examples.source` traversal (`../../...`) works in `blume dev` AND `blume build` (previews render, source tabs populate, theme.css injects). Verified facts 3–4 above make this likely, but path normalization of `../` in the examples pipeline is the one thing not confirmed from source. Fallbacks, in order:
1. `apps/web/examples` → symlink to `../../packages/registry/examples`.
2. Last resort: examples stay under `apps/web` and `shadcn build` runs with cwd `apps/web` — only acceptable if `registry.json`'s recorded paths can still resolve unchanged; the spike outcome gets written back into this spec before planning proceeds.

Known operational traps carried into the plan (from wave memory): `examples/theme.css` edits need a dev-server restart; use `blume build --isolated` while dev runs; preview iframes auto-size; Blume header/search workarounds from the landing redesign live in `apps/web/pages`/`components` and move verbatim. Execution finding (2026-09-05): pnpm-workspace.yaml needs a publicHoistPattern block listing the registry package's dependency names — Blume's SSR prerender externalizes those deps and resolves them via Node's ancestor node_modules walk from apps/web/dist/, which cannot see packages/registry/node_modules under the isolated linker.

## Scripts, Tests, CI

- `scripts/check-registry.mjs`: parameterized to the new roots — registry at `packages/registry`, docs pages at `apps/web/docs/components/*.mdx`, theme parity against `packages/registry/examples/theme.css`. Behavior identical; must report the same zero errors for all 115 items.
- `scripts/smoke-test.sh`: reads `apps/web/public/r` instead of `public/r`; no other change.
- `tests/` + `vitest.config.ts` move into `packages/registry`; the `@` alias points at the package root; all 14 tests pass unchanged.
- `.github/workflows/ci.yml`: same step names calling the same root scripts (`pnpm typecheck`, `pnpm check:registry`, `pnpm test`, `pnpm build`, `pnpm test:smoke`); only the root scripts' internals change to `--filter` orchestration.
- Root `tsconfig.json` is replaced by per-package tsconfigs; `typecheck` at root runs both.

## Vercel Cutover

1. Before merge: record current dashboard settings (build command, output dir, install command, root directory) for rollback.
2. PR preview deploy validates the full site + registry parity (see Byte-Parity Mechanics #5). Note: the Root Directory setting is project-wide, so the preview for the migration branch requires the setting flip; sequence in the plan: flip setting → trigger preview → verify → merge in the same window. Rollback path: restore recorded settings + redeploy previous commit.
3. Root Directory → `apps/web`; Vercel detects the pnpm workspace and installs from the repo root. Build command becomes the app's own build; output `dist` (relative to `apps/web`).
4. This is an explicit human-action task in the plan (dashboard access), not a subagent task.
5. Final plan task (post-merge): curl byte-parity of `/r/*.json`, spot-check `/docs/...` pages, live `npx shadcn add` from the deployed domain.

## Paid-Blocks Door (what this migration guarantees, and nothing more)

- The flat `/r/<name>.json` namespace remains the public registry's; paid items would live under a distinct path (`/r/pro/...`) or subdomain, wired via Vercel rewrites from the web app's project (`public/vercel.json` is preserved by Blume — verified) or DNS.
- Free blocks can land later as `packages/blocks`; the workspace glob `packages/*` already covers it.
- Paid blocks live in a separate private repo with its own Vercel project. Nothing in this migration hardcodes single-project assumptions (no absolute-path coupling into `apps/web` beyond the documented three touch points).
- Everything else — which blocks, pricing, licensing, auth for paid installs — is the blocks spec's scope, not this one's.

## Execution

- One PR, executed with `superpowers:subagent-driven-development` in an isolated worktree (`superpowers:using-git-worktrees`).
- Plan mirrors the wave-4/wave-5 structure: Global Constraints (parity gate, Conventional Commits, English-only, no attribution trailers), per-task verification loop (typecheck + check:registry + vitest + build + smoke + parity diff), batched browser checkpoints (landing page, one overlay component page, chart dark mode, one archived-version page), read-only re-verification gates before risk items (Blume rewiring, Vercel cutover), final docs/CHANGELOG task, post-merge deploy-verification task.
- Git moves use `git mv` so history follows renames.
- `AGENTS.md` site-layout section updated as part of the final docs task.

## Non-Goals

- No component, example, or theme content changes of any kind.
- No blocks/templates product work (separate spec).
- No turborepo/nx, no npm publishing, no new CI stages.
- No URL scheme changes — registry and docs URLs are frozen.
