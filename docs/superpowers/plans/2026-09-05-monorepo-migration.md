# Monorepo Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the repo into a pnpm workspace — `apps/web` (`@sevenui/web`: Blume docs site + landing) and `packages/registry` (`@sevenui/registry`: component sources, examples, registry.json, tests) — with `https://sevenui.dev/r/<name>.json` serving **byte-identical** content before and after, as the prerequisite for the blocks phase.

**Architecture:** Pure structural migration, zero content change. The byte-parity mechanism: the built `/r/*.json` embeds `registry.json`'s relative paths and file contents verbatim, so moving `registry/`, `examples/`, and `registry.json` **together, with internal structure unchanged**, into `packages/registry` and running `shadcn build` with `-c packages/registry` yields identical output. Two extraction tasks (registry package first, web app second), each ending with the full check suite green plus a hash-manifest parity gate against a committed pre-migration baseline. A spike proves Blume's `../../` examples traversal before any file moves. Vercel cutover (Root Directory → `apps/web`) is an explicit human action verified on the PR's preview deploy before merge.

**Tech Stack:** pnpm 12 workspaces (no turborepo). Existing: Blume 1.5.3, shadcn CLI 4.19.1, TypeScript 7, Vitest 4, GitHub Actions, Vercel. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-05-monorepo-migration-design.md` — read it first; the Verified Tool Facts section is load-bearing for Tasks 2–4.

## Global Constraints

- All repo content English; kebab-case file names; Conventional Commits, imperative mood; NO attribution trailers anywhere (no Co-Authored-By, no AI/model/tool names) — commits AND the PR body. See `AGENTS.md`.
- **Content freeze:** NO task edits the content of any file under `registry/`, `examples/`, or any `registry.json` item. Import strings (`@/registry/...`) stay exactly as they are. Files MOVE (via `git mv`, so history follows); they never change.
- **Parity gate:** after `pnpm build:registry`, the hash manifest of the output dir must match the committed baseline `docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256` (116 files: 115 items + the `registry.json` copy `shadcn build` emits). Any drift is a task failure — STOP and diagnose using the byte copies saved in Task 1; never "fix forward" past a drift.
- **Every task boundary is green:** `pnpm typecheck && pnpm check:registry && pnpm test && pnpm build && pnpm test:smoke` all pass, plus the parity gate. The 14 vitest tests and the 115-item registry check must report the same counts as before the migration.
- Branch: `refactor/monorepo` off `main`, in an isolated worktree (superpowers:using-git-worktrees at execution time). NOTE: a stale local branch `feat/monorepo` may exist — do not touch or reuse it. Land as ONE squash-merged PR.
- Run `pnpm install` after every `package.json` / `pnpm-workspace.yaml` change and commit the updated `pnpm-lock.yaml` with that task.
- **shadcn build path semantics (verified from installed 4.19.1 source):** BOTH the registry file AND `-o` are resolved against the `-c` cwd (`resolve(cwd, registryFile)`, `resolve(cwd, outputDir)`). The build also copies the source `registry.json` into the output dir.
- **Blume operational traps (from wave retrospectives):** `examples/theme.css` edits do NOT hot-reload (restart `blume dev`); plain `blume build` refuses while a dev server runs — use `blume build --isolated` (builds into throwaway `.blume-verify/`) or stop dev first; preview iframes auto-size (no `vh` units — not relevant here since no demo content changes); demo islands are `client:visible` and only hydrate with the Chrome window foregrounded.
- Pre-existing, out-of-scope defects — do NOT fix, do NOT count as regressions: site-wide `rafThrottle is not defined` console exception (vendored Blume bug); dark-mode toggle inside preview iframes; progress hydration animation.
- `public/r/` (later `apps/web/public/r/`) is gitignored build output — never committed.
- `docs/` at the repo root is internal planning material — never published, never moved.

## Per-task verification loop (referenced as "standard verify" below)

```bash
pnpm install                       # only when package.json / workspace files changed
pnpm typecheck && pnpm check:registry && pnpm test && pnpm build && pnpm test:smoke
# Parity gate — R_DIR is public/r through Task 3, apps/web/public/r from Task 4 on:
diff docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256 <(cd <R_DIR> && shasum -a 256 *.json | sort -k2)
# Expected: no output (exit 0). On ANY diff: STOP, compare bytes against
# ~/.sevenui-r-baseline-2026-09-05/ to find the drifting field, fix the cause.
```

Expected counts, identical at every boundary: registry check "115 items", vitest "14 passed", smoke test exits 0. Browser checks are BATCHED at the single checkpoint (Task 5) — per wave 3/4/5 retrospectives.

---

### Task 1: Pre-flight green run + committed parity baseline

**Files:**
- Create: `docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256`
- Create (outside the repo): `~/.sevenui-r-baseline-2026-09-05/` (byte copies for drift diagnosis; not committed)

**Interfaces:**
- Produces: the committed manifest every later task's parity gate diffs against (format: `shasum -a 256` lines, `<hash>  <filename>`, sorted by filename), and byte copies for diagnosis. Task 7 (preview) and Task 8 (production) curl-verify against this same manifest.

- [ ] **Step 1: Prove the pre-migration state is green**

From the worktree root (branch `refactor/monorepo`, freshly cut from `main`):

```bash
pnpm install
pnpm typecheck && pnpm check:registry && pnpm test && pnpm build && pnpm test:smoke
```

Expected: registry check "115 items", vitest "14 passed", build and smoke exit 0. If anything fails here, STOP — the migration must start from green `main`; report to the human.

- [ ] **Step 2: Snapshot the built registry**

`pnpm build` already ran `build:registry`; snapshot its output:

```bash
ls public/r/*.json | wc -l    # expected: 116 (115 items + registry.json copy)
mkdir -p ~/.sevenui-r-baseline-2026-09-05
cp public/r/*.json ~/.sevenui-r-baseline-2026-09-05/
(cd public/r && shasum -a 256 *.json | sort -k2) > docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256
wc -l docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256   # expected: 116
```

- [ ] **Step 3: Verify the gate mechanism works against itself**

```bash
diff docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256 <(cd public/r && shasum -a 256 *.json | sort -k2)
```

Expected: no output, exit 0.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256
git commit -m "chore(repo): record pre-migration registry baseline manifest"
```

---

### Task 2: SPIKE — Blume subdirectory project + `../../` examples traversal (GATE)

**Files:**
- Create (throwaway, deleted at the end, never committed): `spike/app/package.json`, `spike/app/tsconfig.json`, `spike/app/blume.config.ts`, `spike/app/docs/index.mdx`
- Modify (only on a FAIL outcome): `docs/superpowers/specs/2026-09-05-monorepo-migration-design.md` (record the fallback taken)

**Interfaces:**
- Consumes: the existing root `examples/` and `registry/` trees (unmoved), root `node_modules` (Node resolution walks up from `spike/app`).
- Produces: a PASS/FAIL verdict gating Tasks 3–4. PASS = Task 4 uses `examples: { source: "../../packages/registry/examples", ... }` as planned. FAIL of the traversal but PASS of the symlink fallback = Task 4 adds an `apps/web/examples` symlink instead (committed via git, with `examples` config left at defaults). Both FAIL = STOP the whole migration and report to the human.

This spike replicates the exact final shape — a Blume project two directories deep, examples reached via `../../`, alias via the project tsconfig — without moving a single tracked file. Verified facts that make it likely to pass (spec §Verified Tool Facts): Blume's Vite `fs.allow` includes `findWorkspaceRoot(root)` (walks up to `pnpm-workspace.yaml`), `examples.source` is a configurable string, and alias resolution reads the project tsconfig via `get-tsconfig`. The one unverified behavior is `../` normalization in the examples pipeline — hence this spike.

- [ ] **Step 1: Scaffold the throwaway project**

```bash
mkdir -p spike/app/docs
```

`spike/app/package.json`:

```json
{
  "name": "spike-app",
  "private": true,
  "type": "module"
}
```

`spike/app/tsconfig.json` (mirrors the final `apps/web/tsconfig.json` alias shape — `@/*` two levels up):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "paths": { "@/*": ["../../*"] }
  },
  "include": ["blume.config.ts"]
}
```

`spike/app/blume.config.ts`:

```ts
import { defineConfig } from "blume";

export default defineConfig({
  title: "Spike",
  description: "Traversal spike",
  content: { root: "docs" },
  examples: {
    source: "../../examples",
    css: "../../examples/theme.css",
  },
});
```

`spike/app/docs/index.mdx`:

```mdx
---
title: Spike
description: Examples traversal spike.
---

<Component path="button/button-demo" />
```

- [ ] **Step 2: Probe `blume dev`**

```bash
cd spike/app && ../../node_modules/.bin/blume dev --port 4329 &
sleep 15
curl -s http://localhost:4329/ | grep -c "button-demo"
curl -s http://localhost:4329/blume-examples/button/button-demo | head -c 2000
```

Expected: the index page references the example, and the example route returns HTML (the `client:visible` island's static shell — client-only content is absent from SSR, that's normal). Then kill the dev server (and remove a stale `spike/app/.blume/dev.lock` if the process was killed hard).

- [ ] **Step 3: Probe `blume build`**

```bash
cd spike/app && ../../node_modules/.bin/blume build
grep -rl "button-demo" dist/ | head -5
```

Expected: exit 0; the example route exists in `dist/`. Build success requires the `@/registry/base/ui/button` import inside `examples/button/button-demo.tsx` to have resolved through the spike tsconfig's `../../` paths — that resolution IS the thing being proven.

- [ ] **Step 4 (only if Step 2 or 3 FAILED): Probe the symlink fallback**

```bash
cd spike/app && rm -rf .blume dist
ln -s ../../examples examples
```

Edit `spike/app/blume.config.ts` to `examples: { css: "examples/theme.css" }` (default source, reached through the symlink), rerun Steps 2–3. If this also fails: STOP the migration, delete `spike/`, and report both failure modes to the human — do not improvise a third approach.

- [ ] **Step 5: Record the verdict and clean up**

On the primary path PASS: no spec change needed; report the verdict in the task report. On symlink-fallback PASS: edit the spec's "Blume Rewiring" section to state the traversal failed and the symlink is the mechanism, and commit:

```bash
git add docs/superpowers/specs/2026-09-05-monorepo-migration-design.md
git commit -m "docs(specs): record examples symlink fallback from migration spike"
```

Always:

```bash
rm -rf spike
git status --porcelain   # expected: clean (spike was never tracked)
```

---

### Task 3: Extract `packages/registry` (`@sevenui/registry`)

**Files:**
- Move (git mv, no content change): `registry/` → `packages/registry/registry/`; `examples/` → `packages/registry/examples/`; `registry.json` → `packages/registry/registry.json`; `tests/` → `packages/registry/tests/`; `vitest.config.ts` → `packages/registry/vitest.config.ts`
- Create: `packages/registry/package.json`, `packages/registry/tsconfig.json`
- Modify: `pnpm-workspace.yaml`, `package.json` (root), `tsconfig.json` (root), `blume.config.ts` (examples paths only), `scripts/check-registry.mjs`

**Interfaces:**
- Consumes: Task 2's PASS verdict (does not depend on which path — this task involves no traversal; the Blume project is still at the root).
- Produces: workspace package `@sevenui/registry` with scripts `typecheck` (`tsc --noEmit`) and `test` (`vitest run`); `scripts/check-registry.mjs` with top-level constants `REGISTRY_ROOT = "packages/registry"` and `DOCS_DIR = "web/docs/components"` (Task 4 flips only `DOCS_DIR`); root `build:registry` = `shadcn build -c packages/registry -o ../../public/r` (Task 4 moves this into apps/web). The registry package's internal layout (`registry/`, `examples/`, `registry.json` as siblings) is the byte-parity contract Task 4 and the spec depend on.

- [ ] **Step 1: Move the parity zone with git mv**

```bash
mkdir -p packages/registry
git mv registry packages/registry/registry
git mv examples packages/registry/examples
git mv registry.json packages/registry/registry.json
git mv tests packages/registry/tests
git mv vitest.config.ts packages/registry/vitest.config.ts
```

`vitest.config.ts` needs NO edit: its `@` alias is `path.resolve(import.meta.dirname)` (its own directory = the package root), setup/include paths are package-relative.

- [ ] **Step 2: Create the package manifest and tsconfig**

`packages/registry/package.json` — the component-side dependencies move here verbatim from the root (same specifiers):

```json
{
  "name": "@sevenui/registry",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@base-ui/react": "^1.7.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "embla-carousel-react": "^8.6.0",
    "react": "^19.2.8",
    "react-day-picker": "^10.0.1",
    "react-dom": "^19.2.8",
    "react-is": "^19.0.0",
    "react-resizable-panels": "^4.12.3",
    "recharts": "^3.10.1",
    "tailwind-merge": "^3.6.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.3.3",
    "@testing-library/user-event": "^14.6.6",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.5",
    "jsdom": "^30.0.1",
    "react-hook-form": "^7.87.0",
    "typescript": "^7.0.2",
    "vitest": "^4.1.11"
  }
}
```

`packages/registry/tsconfig.json` (compilerOptions identical to today's root config; `@/*` now maps within the package, so example/test imports resolve unchanged):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "paths": { "@/*": ["./*"] }
  },
  "include": ["registry", "examples", "tests", "vitest.config.ts"]
}
```

- [ ] **Step 3: Turn on the workspace**

`pnpm-workspace.yaml` (the `allowBuilds` block is the existing content — keep it verbatim):

```yaml
packages:
  - apps/*
  - packages/*

allowBuilds:
  '@scarf/scarf': false
  esbuild: true
```

- [ ] **Step 4: Rewrite the root manifest and tsconfig**

Root `package.json` — Blume/shadcn/react stay at the root for now (the Blume project hasn't moved yet); everything component-side left in Step 2:

```json
{
  "name": "sevenui",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@12.0.0",
  "engines": {
    "node": ">=22.12"
  },
  "scripts": {
    "dev": "blume dev",
    "build": "pnpm build:registry && blume build",
    "build:registry": "shadcn build -c packages/registry -o ../../public/r",
    "preview": "blume preview",
    "typecheck": "tsc --noEmit && pnpm -r typecheck",
    "check:registry": "node scripts/check-registry.mjs",
    "test": "pnpm --filter @sevenui/registry test",
    "test:smoke": "bash scripts/smoke-test.sh"
  },
  "dependencies": {
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "blume": "^1.5.3",
    "shadcn": "^4.19.1",
    "typescript": "^7.0.2"
  }
}
```

Path semantics reminder (Global Constraints): `-o ../../public/r` is resolved against the `-c` cwd (`packages/registry`), landing back at the repo-root `public/r` — output location unchanged this task.

Root `tsconfig.json` — now only the Blume config and scripts; `@/*` re-pointed into the package so Blume's `get-tsconfig` alias resolution (examples AND `web/components/landing-showcase.tsx`) keeps working:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "paths": { "@/*": ["./packages/registry/*"] }
  },
  "include": ["scripts", "blume.config.ts"]
}
```

- [ ] **Step 5: Re-point Blume's examples (root-relative, no traversal yet)**

In `blume.config.ts`, change only the examples line:

```ts
  examples: {
    source: "packages/registry/examples",
    css: "packages/registry/examples/theme.css",
  },
```

- [ ] **Step 6: Parameterize check-registry**

In `scripts/check-registry.mjs`: add imports/constants at the top, and route every filesystem path through them (the checks themselves are untouched):

```js
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const REGISTRY_ROOT = "packages/registry";
const DOCS_DIR = "web/docs/components";

const registry = JSON.parse(
  readFileSync(join(REGISTRY_ROOT, "registry.json"), "utf8"),
);
```

Then the four path sites:
- missing-file check: `existsSync(join(REGISTRY_ROOT, file.path))`
- docs-page check: `` existsSync(join(DOCS_DIR, `${item.name}.mdx`)) `` (and the error message uses the same joined path)
- examples scan: `readdirSync(join(REGISTRY_ROOT, "examples"), { withFileTypes: true })` and inner `` readdirSync(join(REGISTRY_ROOT, "examples", dir.name)) `` — NOTE: the registered-path comparison `` const p = `examples/${dir.name}/${f}` `` stays EXACTLY as is (registry.json paths are package-relative and must remain so).
- theme parity: `readFileSync(join(REGISTRY_ROOT, "examples/theme.css"), "utf8")`

- [ ] **Step 7: Standard verify + parity (R_DIR = `public/r`)**

```bash
rm -rf public/r   # clear stale output so the rebuild is proven fresh
pnpm install
pnpm typecheck && pnpm check:registry && pnpm test && pnpm build && pnpm test:smoke
diff docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256 <(cd public/r && shasum -a 256 *.json | sort -k2)
```

Expected: 115 items, 14 tests, all green, empty diff. Also curl one docs route from a background `pnpm dev` to prove previews still resolve (`curl -s http://localhost:<port>/docs/blume-examples/button/button-demo | head -c 500` — non-empty HTML), then stop the server.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(repo): extract @sevenui/registry workspace package

Move registry/, examples/, registry.json, tests/ into packages/registry
with internal structure unchanged, so shadcn build output stays
byte-identical. Root keeps the Blume app until the web extraction."
```

---

### Task 4: Extract `apps/web` (`@sevenui/web`)

**Files:**
- Move (git mv): `web/docs` → `apps/web/docs`; `web/pages` → `apps/web/pages`; `web/assets` → `apps/web/assets`; `web/components` → `apps/web/components`; `blume.config.ts` → `apps/web/blume.config.ts`; `theme.css` → `apps/web/theme.css`; `public` → `apps/web/public`
- Create: `apps/web/package.json`, `apps/web/tsconfig.json` (plus, ONLY on the Task 2 symlink verdict: `apps/web/examples` symlink)
- Modify: `package.json` (root), `apps/web/blume.config.ts` (paths), `apps/web/pages/index.astro` (one import), `scripts/check-registry.mjs` (one constant), `scripts/smoke-test.sh` (two paths), `.gitignore`
- Delete: `tsconfig.json` (root)

**Interfaces:**
- Consumes: `@sevenui/registry` at `packages/registry` (Task 3 layout); Task 2's verdict (traversal config vs symlink).
- Produces: workspace package `@sevenui/web` with scripts `dev`, `build` (= `pnpm build:registry && blume build`), `build:registry` (= `shadcn build -c ../../packages/registry -o ../../apps/web/public/r`), `preview`, `typecheck`; root scripts as pure `--filter` orchestration under the SAME names CI already calls; registry output now at `apps/web/public/r` (Tasks 5–8 and the smoke test read it there). This is the final layout — the spec's Target Layout section must match the tree after this task.

- [ ] **Step 1: Move the web app with git mv (flattening `web/`)**

```bash
mkdir -p apps/web
git mv web/docs apps/web/docs
git mv web/pages apps/web/pages
git mv web/assets apps/web/assets
git mv web/components apps/web/components
git mv blume.config.ts apps/web/blume.config.ts
git mv theme.css apps/web/theme.css
git mv public apps/web/public
rmdir web
rm -rf dist .blume public   # stale generated leftovers at the old root, all gitignored/untracked
```

Notes: `apps/web/docs` includes the archived version snapshots (`v0.1.0/`–`v0.4.0/`) — they ride along untouched. `git mv public` carries the tracked `icon.svg`; untracked `public/r/` contents move on disk harmlessly (regenerated anyway). Relative imports between `pages/` and `components/` keep their shape (both moved one level together).

- [ ] **Step 2: Create the app manifest and tsconfig**

`apps/web/package.json`:

```json
{
  "name": "@sevenui/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "blume dev",
    "build": "pnpm build:registry && blume build",
    "build:registry": "shadcn build -c ../../packages/registry -o ../../apps/web/public/r",
    "preview": "blume preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "blume": "^1.5.3",
    "shadcn": "^4.19.1",
    "typescript": "^7.0.2"
  }
}
```

(`-o` resolves against the `-c` cwd — see Global Constraints — so `../../apps/web/public/r` from `packages/registry` is this app's `public/r`.)

`apps/web/tsconfig.json` — `@/*` maps into the registry package, serving Blume's `get-tsconfig` alias resolution for example files AND the landing components' `@/registry/...` imports; `include` mirrors today's typecheck scope (the Blume config only — `components/` was never typechecked and stays out to avoid new failure surface):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "paths": { "@/*": ["../../packages/registry/*"] }
  },
  "include": ["blume.config.ts"]
}
```

- [ ] **Step 3: Re-point the Blume config**

In `apps/web/blume.config.ts`, change exactly these fields (everything else — basePath, versions, search, analytics, integrations hook, github, navigation — untouched):

```ts
  logo: "assets/logomark.svg",
  content: {
    root: "docs",
    pages: "pages",
  },
  examples: {
    source: "../../packages/registry/examples",
    css: "../../packages/registry/examples/theme.css",
  },
```

ONLY if Task 2 recorded the symlink verdict, instead of the traversal `examples` block:

```bash
ln -s ../../packages/registry/examples apps/web/examples
git add apps/web/examples
```

with `examples: { css: "examples/theme.css" }` in the config (default source through the symlink).

- [ ] **Step 4: Fix the landing page's registry.json import**

`apps/web/pages/index.astro` line 18:

```astro
import registry from "../../../packages/registry/registry.json";
```

- [ ] **Step 5: Root manifest becomes pure orchestration**

Root `package.json` (complete new content — no dependencies left at the root):

```json
{
  "name": "sevenui",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@12.0.0",
  "engines": {
    "node": ">=22.12"
  },
  "scripts": {
    "dev": "pnpm --filter @sevenui/web dev",
    "build": "pnpm --filter @sevenui/web build",
    "build:registry": "pnpm --filter @sevenui/web build:registry",
    "preview": "pnpm --filter @sevenui/web preview",
    "typecheck": "pnpm -r typecheck",
    "check:registry": "node scripts/check-registry.mjs",
    "test": "pnpm --filter @sevenui/registry test",
    "test:smoke": "bash scripts/smoke-test.sh"
  }
}
```

Delete the root `tsconfig.json` (`git rm tsconfig.json`) — each package owns its own; `pnpm -r typecheck` covers both (`-r` excludes the root package by default, no recursion).

- [ ] **Step 6: Re-point the cross-package scripts and .gitignore**

`scripts/check-registry.mjs`: flip the one constant —

```js
const DOCS_DIR = "apps/web/docs/components";
```

`scripts/smoke-test.sh`: two changes —

```bash
for f in "$ROOT"/apps/web/public/r/*.json; do          # was "$ROOT"/public/r/*.json
SHADCN_BIN="$ROOT/apps/web/node_modules/.bin/shadcn"   # was "$ROOT/node_modules/.bin/shadcn"
```

(The second is load-bearing: under the workspace, pnpm links the `shadcn` bin only into `apps/web/node_modules/.bin`, not the root.)

`.gitignore`: the `public/r/` pattern contains a non-trailing slash, so it is root-anchored and would stop matching — change that line to `apps/web/public/r/`. The `dist/`, `.blume/`, `.blume-verify/` patterns match at any depth and stay as they are.

- [ ] **Step 7: Standard verify + parity (R_DIR = `apps/web/public/r` from here on)**

```bash
rm -rf apps/web/public/r
pnpm install
pnpm typecheck && pnpm check:registry && pnpm test && pnpm build && pnpm test:smoke
diff docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256 <(cd apps/web/public/r && shasum -a 256 *.json | sort -k2)
git status --porcelain   # expected: staged moves/edits only — no stray untracked build output
```

Expected: 115 items, 14 tests, all green, empty diff. Then background `pnpm dev` (server cwd is `apps/web`), and curl:

```bash
curl -s http://localhost:<port>/docs/ | head -c 500                                  # docs index renders
curl -s http://localhost:<port>/docs/blume-examples/button/button-demo | head -c 500 # previews resolve cross-package
curl -s http://localhost:<port>/ | grep -c "shadcn"                                  # landing renders (registry.json import works)
```

All non-empty/nonzero; stop the server cleanly (stale lock: `apps/web/.blume/dev.lock`).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(repo): extract @sevenui/web workspace app

Move the Blume site (docs, pages, assets, components, config, theme.css,
public) into apps/web, flattening the old web/ prefix. Root package.json
becomes filter orchestration under the same script names; registry build
output moves to apps/web/public/r with byte-identical content."
```

---

### Task 5: CHECKPOINT — batched browser verification

**Files:** none (verification only; defects found here are fixed by amending the responsible Task 3/4 commit and re-running its verify loop).

**Interfaces:**
- Consumes: the final layout from Task 4; a running `pnpm dev`.

- [ ] **Step 1:** `pnpm dev` in background from the worktree root; bring Chrome to the foreground (demo islands are `client:visible` — they do not hydrate in a hidden window). Get tab context first (`tabs_context_mcp`), open a new tab.
- [ ] **Step 2: Landing (`/`)** — the exposed-grid landing renders: header with search, component wall, copy-command button, showcase section (this exercises `components/landing-showcase.tsx`'s `@/registry/...` alias chain through Vite). No layout breakage versus the live site.
- [ ] **Step 3: Docs index (`/docs`)** — sidebar lists the 54 components; version dropdown shows v0.5.0 (Latest) + four archived entries.
- [ ] **Step 4: Button page (`/docs/components/button`)** — preview iframe renders the button demo; source tab shows the demo code; install command block present.
- [ ] **Step 5: Overlay page (`/docs/components/dialog`)** — open the dialog inside the preview: portal/backdrop render inside the frame, close works. (Overlay portals were the historical Blume landmine — this proves them post-move.)
- [ ] **Step 6: Chart dark mode (`/docs/components/chart`)** — bars render in chart-token colors; toggle Blume's theme switch → bars recolor via the `[data-theme="dark"]` branch; tooltip readable in dark.
- [ ] **Step 7: Archived version** — switch to v0.4.0 via the version dropdown: an archived page renders with the "Go to latest" notice; switch back.
- [ ] **Step 8: Search** — open the search dialog, type "combobox", result navigates to the combobox page.
- [ ] **Step 9:** `read_console_messages` — no NEW errors. The pre-existing `rafThrottle is not defined` exception appears on every page and is expressly out of scope (Global Constraints).
- [ ] **Step 10:** Report findings. On any defect: fix, amend the responsible extraction commit, re-run that task's Step 7 verify (including parity), and re-check the affected browser step. Stop the dev server.

---

### Task 6: Repo docs and changelog

**Files:**
- Modify: `AGENTS.md`, `CHANGELOG.md`
- Verify-only: `.github/workflows/ci.yml`, `README.md`

**Interfaces:**
- Consumes: final layout from Task 4.
- Produces: the docs a future session reads first — AGENTS.md must describe the workspace accurately.

- [ ] **Step 1: AGENTS.md** — replace the site-layout bullet (currently: "Site layout: published content lives in `web/docs/` …") with:

```markdown
- Repo layout: pnpm workspace. `apps/web` (`@sevenui/web`) is the Blume docs site — published content in `apps/web/docs/` (served under the `/docs` base path), custom pages in `apps/web/pages/`. `packages/registry` (`@sevenui/registry`) holds component sources (`registry/base/`), examples (`examples/`), `registry.json`, and the vitest suite; its internal layout is the byte-parity contract for `/r/*.json` — never restructure it. Cross-package checks live in `scripts/`. `docs/` at the root holds internal planning material only and is never published.
```

Also update the project paragraph's tail ("docs site (Blume) and registry live in this one repo") to "docs site (Blume, `apps/web`) and registry (`packages/registry`) live in this one pnpm workspace" and add the migration spec to the doc list:

```markdown
- Monorepo migration spec: `docs/superpowers/specs/2026-09-05-monorepo-migration-design.md`
```

- [ ] **Step 2: CHANGELOG.md** — insert directly under the `# Changelog` heading (matching the existing prose style; NO version tag for this change):

```markdown
## Monorepo restructure (no release)

Internal restructure into a pnpm workspace: the Blume docs site moved to
apps/web and the component sources, examples, registry.json, and tests to
packages/registry, as the prerequisite for the blocks phase. No
user-facing change: every /r/<name>.json is byte-identical to v0.5.0
output and all /docs URLs are unchanged, so no version tag is cut.
```

- [ ] **Step 3: Verify CI and README need no edits** — `.github/workflows/ci.yml` calls `pnpm typecheck`, `pnpm check:registry`, `pnpm test`, `pnpm build`, `pnpm test:smoke` — all preserved at the root under the same names, and `pnpm install --frozen-lockfile` installs the whole workspace from the root; the `packageManager` field stayed at the root, so `pnpm/action-setup` and the pnpm cache keep working. README was grep-checked during planning and contains no moved paths. Confirm both by reading them; edit only if the read contradicts this.

- [ ] **Step 4: Standard verify (quick form) and commit** — `pnpm typecheck && pnpm check:registry` (docs-only change; full loop not required), then:

```bash
git add AGENTS.md CHANGELOG.md
git commit -m "docs(repo): describe workspace layout in AGENTS and changelog"
```

---

### Task 7: Pre-merge gate, PR, and Vercel cutover (HUMAN IN THE LOOP)

**Files:** none in-repo (PR + Vercel dashboard).

**Interfaces:**
- Consumes: all prior tasks; the committed baseline manifest (Task 1).
- Produces: the squash-merged PR on `main` and the flipped Vercel Root Directory. Task 8 runs after the resulting production deploy.

- [ ] **Step 1: Read-only re-verification gate** — with fresh eyes, from a clean state:

```bash
git status --porcelain            # expected: empty
rm -rf apps/web/public/r && pnpm install
pnpm typecheck && pnpm check:registry && pnpm test && pnpm build && pnpm test:smoke
diff docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256 <(cd apps/web/public/r && shasum -a 256 *.json | sort -k2)
git diff main --stat              # review: only expected moves/creates/edits, no registry/ or examples/ content diffs
git log main..HEAD --oneline      # conventional, English, no trailers
```

`git diff main --stat` must show `registry/`→`packages/registry/registry/` and `examples/`→`packages/registry/examples/` entries as pure renames (100% similarity). Any content diff inside those trees violates the content freeze — STOP.

- [ ] **Step 2: Push and open the PR** — `git push -u origin refactor/monorepo`, then `gh pr create` with title `refactor(repo): migrate to pnpm workspace (apps/web + packages/registry)` and a body that includes: link to the spec, the parity evidence (the empty-diff command and its output), the counts (115 items / 14 tests / 116 baseline files), and the cutover sequence below. Plain body — no attribution lines.

- [ ] **Step 3 (HUMAN): Record current Vercel settings** — in the Vercel dashboard for the sevenui.dev project, note (screenshot or text) the current values of: Root Directory, Build Command, Output Directory, Install Command, Node.js version. These are the rollback values. Paste them into the PR as a comment.

- [ ] **Step 4 (HUMAN): Flip the cutover setting** — set Root Directory = `apps/web`; confirm "Include source files outside of the Root Directory" is enabled (required — the build reads `packages/registry` and installs from the workspace root). If explicit Build/Output/Install commands were set, clear them to let Vercel use `apps/web`'s own scripts and `dist`, or set Build Command = `pnpm build`, Output Directory = `dist` (relative to the root directory). NOTE: this setting is project-wide and takes effect for the NEXT build of any branch — production stays on its already-built deployment until the merge, so the safe window is: flip → verify preview → merge promptly. Avoid pushing anything else to `main` inside this window.

- [ ] **Step 5: Rebuild the preview and verify parity from it** — trigger a fresh preview build of the PR branch (Redeploy in the dashboard, or `git commit --allow-empty -m "chore(repo): trigger preview rebuild" && git push`). When green, with `PREVIEW` set to the preview deployment URL:

```bash
fail=0
while read -r hash file; do
  actual=$(curl -fsSL "$PREVIEW/r/$file" | shasum -a 256 | cut -d" " -f1)
  [ "$actual" = "$hash" ] || { echo "MISMATCH $file"; fail=1; }
done < docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256
[ "$fail" = 0 ] && echo "PREVIEW PARITY OK (116 files)"
curl -fsSL "$PREVIEW/docs/" | head -c 300          # docs render
curl -fsSL "$PREVIEW/" | head -c 300               # landing renders
```

Expected: `PREVIEW PARITY OK (116 files)` and non-empty HTML. On mismatch: STOP; diagnose against `~/.sevenui-r-baseline-2026-09-05/`; if the cause needs time, roll the dashboard back to Step 3's values immediately.

- [ ] **Step 6 (HUMAN): Merge** — squash-merge the PR (wave precedent). The squash commit message follows the PR title; confirm no attribution trailers get injected. Delete the remote branch. Production build starts automatically.

---

### Task 8: POST-MERGE — production deploy verification

**Files:** none (verification against https://sevenui.dev).

**Interfaces:**
- Consumes: the merged `main`, the finished production deploy, the committed baseline manifest.
- Produces: the final evidence the migration's non-negotiables held. This task closes the migration.

- [ ] **Step 1: Wait for the production deploy to finish** (dashboard or `curl -sI https://sevenui.dev/docs/ | head -1` returning 200 on the new build).

- [ ] **Step 2: Full byte-parity from production** — from a `main` checkout:

```bash
fail=0
while read -r hash file; do
  actual=$(curl -fsSL "https://sevenui.dev/r/$file" | shasum -a 256 | cut -d" " -f1)
  [ "$actual" = "$hash" ] || { echo "MISMATCH $file"; fail=1; }
done < docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256
[ "$fail" = 0 ] && echo "PRODUCTION PARITY OK (116 files)"
```

Expected: `PRODUCTION PARITY OK (116 files)`. This is the spec's headline guarantee — paste the verbatim output in the task report.

- [ ] **Step 3: Docs URL spot checks**

```bash
for p in /docs/ /docs/installation /docs/components/button /docs/components/dialog /docs/components/chart /docs/v0.4.0/ /; do
  printf "%s -> " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "https://sevenui.dev$p"
done
```

Expected: all 200.

- [ ] **Step 4: Real consumer install from the live domain** — scaffold a scratch consumer (same shape as the smoke test's, but installing from production with the released CLI):

```bash
APP=$(mktemp -d)/app && mkdir -p "$APP/src/lib"
# package.json / tsconfig.json / src/globals.css / components.json: copy the
# scaffold blocks verbatim from scripts/smoke-test.sh (they are the proven
# consumer shape), pointing the registry at https://sevenui.dev/r/{name}.json
cd "$APP" && npm install --silent
npx --yes shadcn@latest add --yes --overwrite \
  https://sevenui.dev/r/theme.json \
  https://sevenui.dev/r/button.json \
  https://sevenui.dev/r/dialog.json \
  https://sevenui.dev/r/chart.json
npx tsc --noEmit
```

Expected: files land under `src/components/ui/`, third-party deps (recharts) appear in the consumer `package.json`, `tsc` exits 0. (Unlike CI's smoke test, `@latest` is correct here — this validates what a real user runs today against the real domain.)

- [ ] **Step 5: Live browser pass** — open https://sevenui.dev: landing renders; `/docs/components/dialog` preview opens; chart dark-mode toggle recolors; search finds "combobox". `read_console_messages`: nothing new beyond the known `rafThrottle` exception.

- [ ] **Step 6: Report** — summarize the evidence (parity output, status codes, install result, browser findings) to the human. The migration is complete; the blocks-phase spec can now be brainstormed on top of the workspace.
