# Components / Blocks Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the site into three tiers — `/docs` (unchanged, fed by renamed `demos`), `/components` (new free example gallery from `packages/registry/components`), `/blocks` (pro-only, built from the pro manifest at build time) — with namespaced registry URLs `/r`, `/r/demo`, `/r/component`, `/r/pro`.

**Architecture:** Three shadcn registries in the monorepo build into namespaced output dirs under `apps/web/public/r`. The `/components` gallery renders examples as literal-import React islands (Astro requires literal component references for hydration — proven in `pages/blocks/preview/[slug].astro`). The `/blocks` pages are statically generated from an enriched pro manifest fetched at build time; the pro repo (separate session: sevenui-pro) owns taxonomy, assets, and triggers web rebuilds via a Vercel deploy hook.

**Tech Stack:** Astro (via Blume 1.5.3), React 19, Base UI 1.7, Tailwind 4, shadcn CLI (`shadcn build`), lucide (`lucide-react` + `@lucide/astro`), pnpm workspace.

**Spec:** `docs/superpowers/specs/2026-09-12-components-blocks-restructure-design.md`

## Global Constraints

- All repo content in English (code, comments, docs, commit messages); chat with the user is Turkish.
- Demo/example content conventions: English names only, `/placeholder.svg` for images, animation CSS in the example's own file, split incompatible variants into separate examples.
- Registry source imports use `@/registry/base/ui/<name>`; the `cn` helper comes from the `cn` npm package (never a local util). The shadcn CLI transforms paths on install.
- Every npm dependency on a registry item must be pinned to the workspace range (`lucide-react@^1.41.0`) — `scripts/check-registry.mjs` enforces this.
- `registryDependencies` are always full URLs: `https://sevenui.dev/r/<name>.json`.
- `apps/web/public/r/` is generated (gitignored) — never hand-edit it.
- Tailwind: content outside `apps/web` must be covered by `@source` lines; `@source` paths resolve relative to `apps/web/.blume/src/generated/` (five `../` segments to repo root). Adding one requires a dev-server restart.
- Astro islands need literal component references — a runtime lookup table breaks hydration with "NoMatchingImport".
- The user is away: coordinate with the sevenui-pro session via SendMessage; deploys are explicitly authorized. Commits go to `main` (repo convention: direct commits, small and frequent).
- Run `pnpm check:registry` and `pnpm typecheck` before every commit that touches registries or pages.

## Phase overview and ordering

- **Task 0** (orchestrator, immediately): hand the pro-side prerequisite to the sevenui-pro session. It runs in parallel with Phases A–B.
- **Phase A** (Tasks 1–2): registry namespace split + `examples → demos` rename. Independently deployable.
- **Phase B** (Tasks 3–13): `/components` gallery + pilot content. Tasks 5–13 all append to `packages/registry/components/registry.json` — run them **sequentially** (or rebase between them), not in parallel worktrees.
- **Phase C** (Tasks 14–16): `/blocks` pro rebuild + free-block teardown. Task 15's final build verification and Task 16's deploy require the enriched pro manifest to be live — confirm with sevenui-pro before deploying Phase C.
- **Task 17**: final verification sweep + deploy.

---

### Task 0 (orchestrator): sevenui-pro handoff

Not an executor task — the orchestrating session sends this via SendMessage to the `sevenui-pro` peer session immediately after this plan is committed, then continues with Task 1 while pro works in parallel.

Message content (send as-is, adjusted only if the pro session reports conflicts):

```
SevenUI web is restructuring /blocks into a pro-only directory built from your
manifest at build time. Spec (web repo):
docs/superpowers/specs/2026-09-12-components-blocks-restructure-design.md

You own three prerequisite work items:

1. Extend /r/pro-manifest.json to this schema (taxonomy lives on your side):

{
  "groups": [
    { "id": "application", "label": "Application",
      "description": "Blocks for product interfaces.",
      "icon": "layout-dashboard" }
  ],
  "categories": [
    { "id": "dashboard", "group": "application", "label": "Dashboard",
      "description": "Operational overviews and stat surfaces.",
      "cover": { "type": "image",
                 "src": "https://pro.sevenui.dev/assets/blocks/dashboard.png",
                 "darkSrc": "https://pro.sevenui.dev/assets/blocks/dashboard-dark.png" } }
  ],
  "items": [
    { "name": "dashboard-01", "title": "Dashboard 01",
      "description": "Overview dashboard with stat cards and a recent-orders table.",
      "category": "dashboard", "previewHeight": 720 }
  ]
}

Rules the web build enforces (build FAILS on violation):
- every item.category names an existing category; every category.group names
  an existing group; ids unique per collection; group id "preview" reserved.
- group.icon (optional): a lucide icon kebab key that exists in lucide
  (validated against the lucide icon set).
- category.cover (optional): { type: "image" | "svg", src, darkSrc? }.
  src/darkSrc must be absolute https URLs. 16:9 rendering, object-cover.
  Missing cover falls back to the web repo's /placeholder.svg — covers can
  ship gradually, absent fields never block the build.
- item.previewHeight: positive number (px). Existing /previews/<name> pages
  keep serving the live iframes — no change needed there.

2. Serve the cover assets (image priority; 16:9) from your origin and fill
   the cover/icon fields for the current catalog (dashboard-01).

3. Create a Vercel deploy hook on the WEB project (sevenui.dev) and call it
   from your deploy pipeline, so every pro deploy triggers a web rebuild.
   If you lack access to create the web-side hook, tell me and I'll create
   it and send you the URL.

Deploy the enriched manifest to production, keep it backward compatible for
the current live site (the old /blocks page only reads items[name, title,
description, previewHeight] — keep those fields), and report back DONE with
the deployed manifest URL. The web /blocks rebuild deploys only after your
manifest is live.
```

- [ ] **Step 1:** Send the message above to the `sevenui-pro` session (SendMessage). Record that Phase C is gated on its DONE reply.

---

### Task 1: Split demos into their own registry (`examples → demos`, `/r/demo/`)

**Files:**
- Rename: `packages/registry/examples/` → `packages/registry/demos/` (git mv)
- Create: `packages/registry/demos/registry.json`
- Modify: `packages/registry/registry.json` (remove demo items)
- Modify: `apps/web/blume.config.ts:54-56` (examples source/css paths)
- Modify: `packages/registry/demos/theme.css` (its own `@source` line + comments)
- Modify: `apps/web/package.json` (`build:registry` gains the demos build)
- Modify: `apps/web/theme.css:7` (comment referencing `examples/theme.css`)

**Interfaces:**
- Produces: `packages/registry/demos/registry.json` with `name: "sevenui-demos"`, 137 items whose `files[].path` are relative to the demos dir (`accordion/accordion-demo.tsx`); main `registry.json` reduced to 67 items (theme, style, 65 `registry:ui`); build output at `apps/web/public/r/demo/*.json`. Task 2's checker and the docs build rely on these exact paths.

- [ ] **Step 1: Capture the baseline registry output**

```bash
cd apps/web && pnpm build:registry && cd ../..
SCRATCH=/private/tmp/claude-501/-Users-oguzhanyilmaz-Documents-Projects-github-useui-sevenui/19df36ba-29d5-4c09-b6a6-86d19608ddfe/scratchpad
mkdir -p "$SCRATCH" && rm -rf "$SCRATCH/r-baseline" && cp -R apps/web/public/r "$SCRATCH/r-baseline"
```

- [ ] **Step 2: Rename the folder**

```bash
git mv packages/registry/examples packages/registry/demos
```

- [ ] **Step 3: Split registry.json** (demo item = any item whose files live under `examples/`)

```bash
node - <<'EOF'
const fs = require("node:fs");
const main = JSON.parse(fs.readFileSync("packages/registry/registry.json", "utf8"));
const isDemo = (item) => (item.files ?? []).some((f) => f.path.startsWith("examples/"));
const demoItems = main.items.filter(isDemo).map((item) => ({
  ...item,
  files: item.files.map((f) => ({ ...f, path: f.path.replace(/^examples\//, "") })),
}));
const uiItems = main.items.filter((item) => !isDemo(item));
fs.writeFileSync(
  "packages/registry/demos/registry.json",
  JSON.stringify({
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "sevenui-demos",
    homepage: "https://sevenui.dev",
    items: demoItems,
  }, null, 2) + "\n",
);
fs.writeFileSync(
  "packages/registry/registry.json",
  JSON.stringify({ ...main, items: uiItems }, null, 2) + "\n",
);
console.log("ui items:", uiItems.length, "demo items:", demoItems.length);
EOF
```

Expected output: `ui items: 67 demo items: 137`.

- [ ] **Step 4: Repoint Blume's examples source** — in `apps/web/blume.config.ts` change:

```ts
  examples: {
    source: "../../packages/registry/demos",
    css: "../../packages/registry/demos/theme.css",
  },
```

- [ ] **Step 5: Fix the demos theme.css `@source` line** — in `packages/registry/demos/theme.css`, change line 8 `@source "../../../../../packages/registry/examples";` to `@source "../../../../../packages/registry/demos";` and update the header comment's mention of `examples` to `demos`. Also update the comment on `apps/web/theme.css:7` (`examples/theme.css` → `demos/theme.css`).

- [ ] **Step 6: Add the demos build** — in `apps/web/package.json`:

```json
"build:registry": "shadcn build -c ../../packages/registry -o ../../apps/web/public/r && shadcn build -c ../../packages/registry/demos -o ../../apps/web/public/r/demo && shadcn build -c ../../packages/blocks -o ../../apps/web/public/r/blocks"
```

- [ ] **Step 7: Rebuild and verify** (`rm -rf apps/web/public/r` first so stale root-level demo payloads don't linger)

```bash
rm -rf apps/web/public/r && cd apps/web && pnpm build:registry && cd ../..
```

Contingency: if `shadcn build -c ../../packages/registry/demos` refuses the config dir, add a minimal `packages/registry/demos/package.json` (`{"name": "@sevenui/demos-registry", "private": true}`) and retry. `packages/blocks` proves a registry.json + content-subfolder dir works.

- [ ] **Step 8: Parity check** — ui payloads byte-identical; demo payloads content-identical modulo the path prefix:

```bash
node - <<'EOF'
const fs = require("node:fs");
const SCRATCH = "/private/tmp/claude-501/-Users-oguzhanyilmaz-Documents-Projects-github-useui-sevenui/19df36ba-29d5-4c09-b6a6-86d19608ddfe/scratchpad";
const base = `${SCRATCH}/r-baseline`;
const demoNames = new Set(JSON.parse(fs.readFileSync("packages/registry/demos/registry.json", "utf8")).items.map((i) => i.name));
let checked = 0, moved = 0;
const failures = [];
for (const f of fs.readdirSync(base).filter((f) => f.endsWith(".json"))) {
  const name = f.replace(/\.json$/, "");
  if (demoNames.has(name)) {
    const a = JSON.parse(fs.readFileSync(`${base}/${f}`, "utf8"));
    const b = JSON.parse(fs.readFileSync(`apps/web/public/r/demo/${f}`, "utf8"));
    const norm = (x) => JSON.stringify({ ...x, files: (x.files ?? []).map((fl) => ({ ...fl, path: fl.path.replace(/^(examples|demos)\//, "").split("/").pop() })) });
    if (norm(a) !== norm(b)) failures.push(`demo ${name} differs`);
    moved++;
  } else {
    const a = fs.readFileSync(`${base}/${f}`);
    const b = fs.readFileSync(`apps/web/public/r/${f}`);
    if (!a.equals(b)) failures.push(`ui ${name} not byte-identical`);
    checked++;
  }
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`OK: ${checked} ui payloads byte-identical, ${moved} demo payloads moved intact`);
EOF
```

Expected: `OK: 67 ui payloads byte-identical, 137 demo payloads moved intact`.

- [ ] **Step 9: Verify the docs still render** — `cd apps/web && pnpm dev` (fresh start so the `@source` change takes), open `http://localhost:4321/docs/components/accordion`, confirm the demo renders with styles. Stop the dev server (started by this task, so stopping it is fine).

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "refactor(registry): split demos into /r/demo namespace, rename examples to demos"
```

---

### Task 2: Restructure `scripts/check-registry.mjs` for multiple registries

**Files:**
- Rewrite: `scripts/check-registry.mjs`

**Interfaces:**
- Consumes: `packages/registry/registry.json` (ui), `packages/registry/demos/registry.json`, `packages/blocks/registry.json` (until Task 16 removes it).
- Produces: a generic `checkRegistry(registry, root, label, { fileType })` helper Task 3 extends with one call for the components registry. Keep the exact helper name and signature.

- [ ] **Step 1: Verify the checker currently fails** — `pnpm check:registry` must fail (it still reads `packages/registry/examples` and expects demo items in the main registry). Confirm the failure messages before rewriting.

- [ ] **Step 2: Rewrite the script.** Full replacement:

```js
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const errors = [];
const loadJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const UI_ROOT = "packages/registry";
const DEMOS_ROOT = "packages/registry/demos";
const BLOCKS_ROOT = "packages/blocks";
const DOCS_DIR = "apps/web/docs/components";

const ui = loadJson(join(UI_ROOT, "registry.json"));
const demos = loadJson(join(DEMOS_ROOT, "registry.json"));
const blocks = loadJson(join(BLOCKS_ROOT, "registry.json"));

const uiNames = new Set(ui.items.map((i) => i.name));
const demoNames = new Set(demos.items.map((i) => i.name));
// registryDependencies always point at ui primitives in the root namespace.
const OWN_URL = /^https:\/\/sevenui\.dev\/r\/([a-z0-9-]+)\.json$/;

// Every npm dependency must pin the version range the workspace develops
// against — a bare name makes consumers install latest, so a breaking
// release of a primitive would reach them silently.
const registryPkg = loadJson(join(UI_ROOT, "package.json"));
const blocksPkg = loadJson(join(BLOCKS_ROOT, "package.json"));
const EXPECTED_RANGES = {
  ...registryPkg.devDependencies,
  ...registryPkg.dependencies,
  ...blocksPkg.devDependencies,
  ...blocksPkg.dependencies,
};

function checkLucideDep(item, root, where) {
  const usesLucide = (item.files ?? []).some((file) => {
    const filePath = join(root, file.path);
    return (
      existsSync(filePath) &&
      readFileSync(filePath, "utf8").includes('from "lucide-react"')
    );
  });
  const hasLucide = (item.dependencies ?? []).some(
    (dep) => dep === "lucide-react" || dep.startsWith("lucide-react@"),
  );
  if (usesLucide && !hasLucide) {
    errors.push(
      `${where}: imports lucide-react but dependencies is missing "lucide-react"`,
    );
  }
}

function checkDepRanges(item, where) {
  for (const dep of item.dependencies ?? []) {
    const at = dep.lastIndexOf("@");
    const name = at > 0 ? dep.slice(0, at) : dep;
    const range = at > 0 ? dep.slice(at + 1) : null;
    const expected = EXPECTED_RANGES[name];
    if (!expected) {
      errors.push(
        `${where}: dependency "${name}" is not declared in a workspace package.json`,
      );
    } else if (range === null) {
      errors.push(
        `${where}: dependency "${dep}" has no version range (expected "${name}@${expected}")`,
      );
    } else if (range !== expected) {
      errors.push(
        `${where}: dependency "${dep}" differs from workspace range "${name}@${expected}"`,
      );
    }
  }
}

// Shared per-registry checks: unique names, files exist, deps pinned,
// lucide declared, registryDependencies are root /r/ URLs naming ui items,
// house-alias imports declared as registryDependencies.
function checkRegistry(registry, root, label, { fileType } = {}) {
  const seen = new Set();
  for (const item of registry.items) {
    const where = `${label} item "${item.name}"`;
    if (seen.has(item.name)) errors.push(`duplicate ${label} item name "${item.name}"`);
    seen.add(item.name);

    for (const file of item.files ?? []) {
      if (!existsSync(join(root, file.path))) {
        errors.push(`${where}: missing file ${file.path}`);
      }
      if (fileType && file.type !== fileType) {
        errors.push(`${where}: file ${file.path} must be ${fileType}`);
      }
    }

    for (const dep of item.registryDependencies ?? []) {
      const match = dep.match(OWN_URL);
      if (!match) {
        errors.push(
          `${where}: registryDependencies must be full sevenui.dev /r/ URLs, got "${dep}"`,
        );
      } else if (!uiNames.has(match[1])) {
        errors.push(`${where}: dependency "${match[1]}" is not a ui registry item`);
      }
    }

    // Every house-alias import must be declared as a registryDependency
    // (ui items import siblings relatively, so this only bites derived registries).
    if (root !== UI_ROOT) {
      const deps = new Set(item.registryDependencies ?? []);
      for (const file of item.files ?? []) {
        const filePath = join(root, file.path);
        if (!existsSync(filePath)) continue;
        const source = readFileSync(filePath, "utf8");
        for (const match of source.matchAll(/@\/registry\/base\/ui\/([a-z0-9-]+)/g)) {
          const depUrl = `https://sevenui.dev/r/${match[1]}.json`;
          if (!deps.has(depUrl)) {
            errors.push(
              `${where}: file ${file.path} imports "${match[1]}" but registryDependencies is missing "${depUrl}"`,
            );
          }
        }
      }
    }

    checkLucideDep(item, root, where);
    checkDepRanges(item, where);
  }
}

// Every .tsx under a registry's content folders must be registered — an
// unregistered file silently ships nowhere.
function checkAllFilesRegistered(registry, root, label, { skip = [] } = {}) {
  const registered = new Set(
    registry.items.flatMap((i) => (i.files ?? []).map((f) => f.path)),
  );
  const walk = (rel) => {
    for (const entry of readdirSync(join(root, rel), { withFileTypes: true })) {
      if (skip.includes(entry.name)) continue;
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(relPath);
      else if (entry.name.endsWith(".tsx") && !registered.has(relPath)) {
        errors.push(`${label} file ${relPath} is not registered`);
      }
    }
  };
  walk("");
}

// ---- ui registry ----
checkRegistry(ui, UI_ROOT, "ui");
for (const item of ui.items) {
  const where = `ui item "${item.name}"`;
  if (item.type !== "registry:ui") continue;
  if (!demoNames.has(`${item.name}-demo`)) {
    errors.push(`${where}: no "${item.name}-demo" item in the demos registry`);
  }
  if (!existsSync(join(DOCS_DIR, `${item.name}.mdx`))) {
    errors.push(`${where}: no docs page ${join(DOCS_DIR, `${item.name}.mdx`)}`);
  }
}

// ---- demos registry ----
checkRegistry(demos, DEMOS_ROOT, "demos");
checkAllFilesRegistered(demos, DEMOS_ROOT, "demos", { skip: ["theme.css", "registry.json", "package.json"] });

// Theme parity: every cssVars token appears in demos/theme.css with the same value
const themeItem = ui.items.find((i) => i.name === "theme");
const css = readFileSync(join(DEMOS_ROOT, "theme.css"), "utf8");
for (const [mode, vars] of Object.entries(themeItem.cssVars)) {
  for (const [key, val] of Object.entries(vars)) {
    if (!css.includes(`--${key}: ${val};`)) {
      errors.push(`theme ${mode} token --${key} missing or differs in demos/theme.css`);
    }
  }
}

// ---- blocks registry (free blocks; removed with the teardown) ----
checkRegistry(blocks, BLOCKS_ROOT, "block", { fileType: "registry:component" });
for (const item of blocks.items) {
  if (item.type !== "registry:block") {
    errors.push(`block "${item.name}": type must be "registry:block", got "${item.type}"`);
  }
}
checkAllFilesRegistered(blocks, BLOCKS_ROOT, "block", { skip: ["registry.json", "package.json", "tsconfig.json", "node_modules"] });
if (!existsSync("apps/web/pages/blocks/preview/[slug].astro")) {
  errors.push("blocks preview route apps/web/pages/blocks/preview/[slug].astro is missing");
}

if (errors.length > 0) {
  console.error(`check-registry: ${errors.length} problem(s)\n` + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log(`check-registry: ok (${ui.items.length} ui, ${demos.items.length} demos, ${blocks.items.length} blocks)`);
```

Note: `checkAllFilesRegistered` for blocks walks from the package root, so `skip` covers its non-content entries; the original only walked `blocks/` — walking the root with skips is equivalent for a clean tree.

- [ ] **Step 3: Run it** — `pnpm check:registry`. Expected: `check-registry: ok (67 ui, 137 demos, 9 blocks)`. Fix any real findings (a genuinely missing demo or docs page is a pre-existing bug — report, don't paper over).

- [ ] **Step 4: Commit**

```bash
git add scripts/check-registry.mjs && git commit -m "refactor(scripts): check ui and demos registries separately"
```

---

### Task 3: Components registry + canonical accordion examples

**Files:**
- Create: `packages/registry/components/registry.json`
- Create: `packages/registry/components/accordion/accordion-01.tsx` … `accordion-04.tsx`
- Modify: `apps/web/package.json` (`build:registry` gains the components build)
- Modify: `apps/web/theme.css` (add `@source` for the components folder)
- Modify: `scripts/check-registry.mjs` (add the components registry)

**Interfaces:**
- Produces: `packages/registry/components/registry.json` (`name: "sevenui-components"`), items typed `registry:component`, files pathed `<component>/<name>.tsx` relative to the components dir. Built output at `/r/component/<name>.json`. These four examples are the canonical content pattern every later content task copies.

- [ ] **Step 1: Create the registry config**

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "sevenui-components",
  "homepage": "https://sevenui.dev",
  "items": [
    {
      "name": "accordion-01",
      "type": "registry:component",
      "title": "Outline accordion",
      "description": "Accordion items rendered as separate outlined panels.",
      "registryDependencies": ["https://sevenui.dev/r/accordion.json"],
      "files": [{ "path": "accordion/accordion-01.tsx", "type": "registry:component" }]
    },
    {
      "name": "accordion-02",
      "type": "registry:component",
      "title": "Accordion with icons",
      "description": "Triggers with leading lucide icons.",
      "dependencies": ["lucide-react@^1.41.0"],
      "registryDependencies": ["https://sevenui.dev/r/accordion.json"],
      "files": [{ "path": "accordion/accordion-02.tsx", "type": "registry:component" }]
    },
    {
      "name": "accordion-03",
      "type": "registry:component",
      "title": "FAQ section",
      "description": "FAQ headline, accordion list, and a contact footer.",
      "registryDependencies": ["https://sevenui.dev/r/accordion.json"],
      "files": [{ "path": "accordion/accordion-03.tsx", "type": "registry:component" }]
    },
    {
      "name": "accordion-04",
      "type": "registry:component",
      "title": "Disabled item",
      "description": "An accordion with one disabled item.",
      "registryDependencies": ["https://sevenui.dev/r/accordion.json"],
      "files": [{ "path": "accordion/accordion-04.tsx", "type": "registry:component" }]
    }
  ]
}
```

- [ ] **Step 2: Write the four examples.** Canonical pattern — `"use client"`, ui imports from `@/registry/base/ui/*`, default export named after the item, realistic English copy. `accordion-01.tsx`:

```tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";

const items = [
  {
    value: "shipping",
    title: "How long does shipping take?",
    body: "Standard delivery takes 3-5 business days. Express shipping ensures next-day delivery for orders placed before 2pm.",
  },
  {
    value: "returns",
    title: "What is the return policy?",
    body: "Every purchase includes a 30-day return window. Items go back in their original condition; refunds land within 48 hours.",
  },
  {
    value: "warranty",
    title: "Is there a warranty?",
    body: "All products carry a two-year limited warranty covering manufacturing defects and hardware failures.",
  },
];

export default function Accordion01() {
  return (
    <Accordion
      className="flex w-full max-w-md flex-col gap-2"
      defaultValue={["shipping"]}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className="rounded-lg border px-4 last:border-b"
        >
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

`accordion-02` (icons): same structure, triggers wrap a `<span className="flex items-center gap-2">` with a lucide icon (`Package`, `RotateCcw`, `ShieldCheck` — `className="size-4 text-muted-foreground"`) before the label. `accordion-03` (FAQ): a `max-w-lg` column — `<h3 className="text-lg font-semibold">Frequently asked questions</h3>`, the accordion, then `<p className="text-sm text-muted-foreground">Still stuck? <a href="#" className="font-medium text-foreground underline underline-offset-4">Contact support</a>.</p>`. `accordion-04`: three items, the second carries `disabled` (Base UI `AccordionItem` prop) and demonstrates the disabled trigger styling. Before writing, read `packages/registry/registry/base/ui/accordion.tsx` for the exact prop surface and default item borders; adjust classNames so the outline variant doesn't double-border.

- [ ] **Step 3: Wire the build and Tailwind** — `build:registry` in `apps/web/package.json` gains (before the blocks build):

```
shadcn build -c ../../packages/registry/components -o ../../apps/web/public/r/component
```

In `apps/web/theme.css`, next to the existing registry `@source` line (line ~40), add:

```css
@source "../../../../../packages/registry/components";
```

- [ ] **Step 4: Extend the checker** — in `scripts/check-registry.mjs` add after the demos section:

```js
// ---- components registry (the /components gallery) ----
const COMPONENTS_ROOT = "packages/registry/components";
const components = loadJson(join(COMPONENTS_ROOT, "registry.json"));
checkRegistry(components, COMPONENTS_ROOT, "components", { fileType: "registry:component" });
checkAllFilesRegistered(components, COMPONENTS_ROOT, "components", { skip: ["registry.json"] });
// Gallery folders must be named after a ui component (the page derives its
// title and docs link from the ui item).
for (const item of components.items) {
  const folder = (item.files ?? [])[0]?.path.split("/")[0];
  if (folder && !uiNames.has(folder)) {
    errors.push(`components item "${item.name}": folder "${folder}" is not a ui registry item`);
  }
}
```

and include the count in the final `ok` line.

- [ ] **Step 5: Build + check** — `pnpm check:registry` green; `cd apps/web && pnpm build:registry` produces `public/r/component/accordion-01.json` … `-04.json` whose `content` matches the sources.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(registry): add components registry with accordion examples"
```

---

### Task 4: `/components` gallery infrastructure + accordion page + nav tab

**Files:**
- Create: `apps/web/pages/components/_data.ts`
- Create: `apps/web/components/component-gallery.astro`
- Create: `apps/web/components/example-card.astro`
- Create: `apps/web/pages/components/index.astro`
- Create: `apps/web/pages/components/accordion.astro`
- Modify: `apps/web/components/site-tabs.ts` (Components tab → `/components`)

**Interfaces:**
- Consumes: `packages/registry/components/registry.json` (Task 3), `installCommand` from `apps/web/lib/registry.ts`, `CopyCommand` from `apps/web/components/copy-command.tsx`, `CodeBlock` from `blume/components/content/CodeBlock.astro`.
- Produces: `galleryComponents: { slug: string; label: string; count: number }[]` from `_data.ts`; `<ComponentGallery active={slug}>` layout wrapper; `<ExampleCard id title code>` card with a default slot for the island. Content tasks 5–13 copy `accordion.astro` exactly, changing only slug/imports/cards.

- [ ] **Step 1: `_data.ts`**

```ts
// Shared data for the /components gallery: the index grid and every
// per-component page's sidebar read from here.
import componentsRegistry from "../../../../packages/registry/components/registry.json";
import mainRegistry from "../../../../packages/registry/registry.json";

export interface GalleryComponent {
  slug: string;
  label: string;
  count: number;
}

const uiTitles = new Map(
  mainRegistry.items
    .filter((item) => item.type === "registry:ui")
    .map((item) => [item.name, item.title]),
);

const counts = new Map<string, number>();
for (const item of componentsRegistry.items) {
  const slug = item.files[0].path.split("/")[0];
  counts.set(slug, (counts.get(slug) ?? 0) + 1);
}

export const galleryComponents: GalleryComponent[] = [...counts.entries()]
  .map(([slug, count]) => {
    const label = uiTitles.get(slug);
    if (!label) {
      throw new Error(
        `components/${slug} has no matching registry:ui item — gallery folders must be named after a ui component.`,
      );
    }
    return { slug, label, count };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

// Every gallery component must have a page, or the sidebar renders a dead
// link. Pages are static files (Astro islands need literal imports), so a
// new content folder always ships with its page.
const pages = new Set(
  Object.keys(import.meta.glob("./*.astro")).map((path) =>
    path.replace("./", "").replace(".astro", ""),
  ),
);
const missing = galleryComponents.filter((c) => !pages.has(c.slug)).map((c) => c.slug);
if (missing.length > 0) {
  throw new Error(
    `components folder(s) ${missing.join(", ")} have no page in apps/web/pages/components/ — add <slug>.astro.`,
  );
}
```

- [ ] **Step 2: `component-gallery.astro`** — sidebar + content column (blocks-sidebar's sticky/border idiom):

```astro
---
// Two-column shell for /components pages: sticky component list on the
// left (docs-style structural border), content on the right. The sticky
// offset mirrors blocks-sidebar.astro / Blume's own docs sidebar.
import { galleryComponents } from "../pages/components/_data";

interface Props {
  active?: string;
}
const { active } = Astro.props;
---

<div class="lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
  <aside
    class="border-b border-border px-6 py-6 lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5 lg:py-8"
  >
    <nav aria-label="Components">
      <ul class="flex flex-col gap-0.5">
        {galleryComponents.map((component) => (
          <li>
            <a
              href={`/components/${component.slug}`}
              class={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                component.slug === active
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{component.label}</span>
              <span class="text-xs text-muted-foreground">{component.count}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
  <div class="min-w-0"><slot /></div>
</div>
```

- [ ] **Step 3: `example-card.astro`**

```astro
---
// One gallery example: anchored heading, Preview/Code toggle, the live
// example island (slot), highlighted source, and a copyable install
// command. The toggle uses one delegated document-level listener (bottom),
// so it needs no per-card or per-navigation rebinding.
import CodeBlock from "blume/components/content/CodeBlock.astro";
import CopyCommand from "./copy-command.tsx";
import { installCommand } from "../lib/registry.ts";

interface Props {
  /** Registry item name; also the anchor id, e.g. "accordion-01". */
  id: string;
  title: string;
  /** Raw TSX source of the example (import with ?raw). */
  code: string;
}
const { id, title, code } = Astro.props;
---

<section id={id} class="scroll-mt-24" data-example-card>
  <div class="flex items-center justify-between gap-4">
    <h2 class="text-base font-semibold tracking-tight">
      <a href={`#${id}`} class="hover:underline">{title}</a>
    </h2>
    <div class="flex rounded-lg border border-border p-0.5 text-sm" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected="true"
        data-tab="preview"
        class="rounded-md px-2.5 py-1 text-muted-foreground aria-selected:bg-muted aria-selected:text-foreground"
      >
        Preview
      </button>
      <button
        type="button"
        role="tab"
        aria-selected="false"
        data-tab="code"
        class="rounded-md px-2.5 py-1 text-muted-foreground aria-selected:bg-muted aria-selected:text-foreground"
      >
        Code
      </button>
    </div>
  </div>
  <div class="mt-3 overflow-hidden rounded-xl border border-border">
    <div data-panel="preview" class="flex min-h-72 items-center justify-center bg-background p-6 sm:p-10">
      <slot />
    </div>
    <div data-panel="code" hidden class="max-h-96 overflow-auto">
      <CodeBlock lang="tsx" code={code} />
    </div>
  </div>
  <div class="mt-3">
    <CopyCommand client:visible command={installCommand(`component/${id}`)} />
  </div>
</section>

<script>
  // Delegated once per page load; survives ClientRouter navigations because
  // it listens on document (script-once trap: this module runs only once).
  document.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-example-card] [data-tab]",
    );
    if (!button) return;
    const card = button.closest("[data-example-card]");
    if (!card) return;
    for (const tab of card.querySelectorAll<HTMLButtonElement>("[data-tab]")) {
      tab.setAttribute("aria-selected", String(tab === button));
    }
    for (const panel of card.querySelectorAll<HTMLElement>("[data-panel]")) {
      panel.hidden = panel.dataset.panel !== button.dataset.tab;
    }
  });
</script>
```

- [ ] **Step 4: `index.astro`** — same PageLayout scaffolding as `pages/blocks/index.astro` (copy its frontmatter props: site, logo, banner, analytics, navigation with `tabs: SITE_TABS`, favicon, fontCssVars, themeMode, searchEnabled, siteUrl, ogEnabled, `layout: { Header }`, footer slot with `SiteFooter`), with:

```astro
page={{ title: "Components — SevenUI", description, route: "/components" }}
```

```astro
---
const description =
  "Ready-to-use examples of every SevenUI component. Copy them into your project with one command — the source is yours.";
const totalExamples = galleryComponents.reduce((sum, c) => sum + c.count, 0);
---
<ComponentGallery>
  <header class="border-b border-border px-6 py-12 lg:px-10">
    <div class="max-w-2xl">
      <h1 class="text-3xl font-semibold tracking-tight">Components</h1>
      <p class="mt-2 text-muted-foreground">
        {description} {totalExamples} {totalExamples === 1 ? "example" : "examples"} across {galleryComponents.length} components.
      </p>
    </div>
  </header>
  <div class="grid gap-4 px-6 py-12 sm:grid-cols-2 xl:grid-cols-3 lg:px-10">
    {galleryComponents.map((component) => (
      <a
        href={`/components/${component.slug}`}
        class="rounded-xl border border-border p-5 transition-colors hover:bg-muted/50"
      >
        <h2 class="text-sm font-medium">{component.label}</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          {component.count} {component.count === 1 ? "example" : "examples"}
        </p>
      </a>
    ))}
  </div>
</ComponentGallery>
```

- [ ] **Step 5: `accordion.astro`** — the template every content task copies:

```astro
---
import PageLayout from "blume/components/layout/PageLayout.astro";
import data from "blume:data";
import Header from "../../components/blume/Header.astro";
import ComponentGallery from "../../components/component-gallery.astro";
import ExampleCard from "../../components/example-card.astro";
import SiteFooter from "../../components/site-footer.astro";
import { SITE_TABS } from "../../components/site-tabs.ts";
import { galleryComponents } from "./_data";

import Accordion01 from "../../../../packages/registry/components/accordion/accordion-01";
import accordion01Source from "../../../../packages/registry/components/accordion/accordion-01.tsx?raw";
import Accordion02 from "../../../../packages/registry/components/accordion/accordion-02";
import accordion02Source from "../../../../packages/registry/components/accordion/accordion-02.tsx?raw";
import Accordion03 from "../../../../packages/registry/components/accordion/accordion-03";
import accordion03Source from "../../../../packages/registry/components/accordion/accordion-03.tsx?raw";
import Accordion04 from "../../../../packages/registry/components/accordion/accordion-04";
import accordion04Source from "../../../../packages/registry/components/accordion/accordion-04.tsx?raw";

const SLUG = "accordion";
const meta = galleryComponents.find((component) => component.slug === SLUG)!;
const { config } = data;
const navigation = { ...data.navigation, tabs: SITE_TABS };
const description = `Free ${meta.label} examples built on the SevenUI ${meta.label} component.`;
---

<PageLayout
  site={{ title: config.title, description: config.description }}
  logo={config.logo}
  banner={config.banner}
  analytics={config.analytics}
  navigation={navigation}
  favicon={config.favicon}
  fontCssVars={data.fontCssVars}
  themeMode={config.theme.mode}
  searchEnabled={config.search.enabled}
  siteUrl={config.site}
  ogEnabled={config.og.enabled}
  page={{ title: `${meta.label} — SevenUI Components`, description, route: `/components/${SLUG}` }}
  layout={{ Header }}
>
  <ComponentGallery active={SLUG}>
    <header class="border-b border-border px-6 py-10 lg:px-10">
      <h1 class="text-3xl font-semibold tracking-tight">{meta.label}</h1>
      <p class="mt-2 max-w-2xl text-muted-foreground">
        {description}
        <a class="underline underline-offset-4" href={`/docs/components/${SLUG}`}>Read the docs</a>.
      </p>
    </header>
    <div class="flex max-w-4xl flex-col gap-12 px-6 py-10 lg:px-10">
      <ExampleCard id="accordion-01" title="Outline accordion" code={accordion01Source}>
        <Accordion01 client:visible />
      </ExampleCard>
      <ExampleCard id="accordion-02" title="Accordion with icons" code={accordion02Source}>
        <Accordion02 client:visible />
      </ExampleCard>
      <ExampleCard id="accordion-03" title="FAQ section" code={accordion03Source}>
        <Accordion03 client:visible />
      </ExampleCard>
      <ExampleCard id="accordion-04" title="Disabled item" code={accordion04Source}>
        <Accordion04 client:visible />
      </ExampleCard>
    </div>
  </ComponentGallery>
  <footer slot="footer"><SiteFooter /></footer>
</PageLayout>
```

- [ ] **Step 6: Update the nav tab** — in `apps/web/components/site-tabs.ts`:

```ts
  { label: "Components", path: "/components", href: "/components" },
```

- [ ] **Step 7: Verify in the browser** — restart `pnpm dev` (the `@source` line from Task 3 needs it), check `/components` (grid), `/components/accordion` (4 cards render, Preview/Code toggles, copy button copies `npx shadcn@latest add https://sevenui.dev/r/component/accordion-01.json`, sidebar active state), header tab highlights on both, and dark mode. Also `pnpm typecheck`.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat(web): add /components gallery with accordion pilot"
```

---

### Tasks 5–13: Pilot content waves (one component per task)

Each task follows the same recipe — files, registry entries, page, verification are fully specified per task below; the accordion set (Tasks 3–4) is the canonical pattern already in the tree by the time these run. Common recipe for component `<slug>`:

1. Write four examples in `packages/registry/components/<slug>/<slug>-01.tsx` … `-04.tsx` (`"use client"`, ui imports from `@/registry/base/ui/*`, `cn` from `"cn"` if needed, default export `PascalCase(slug)01` etc., realistic English copy, `/placeholder.svg` for any imagery). Read the ui component's source first for its exact export names and props.
2. Append the four items to `packages/registry/components/registry.json` (same shape as accordion's; `dependencies: ["lucide-react@^1.41.0"]` whenever the file imports lucide; `registryDependencies` lists every `@/registry/base/ui/*` import as a full URL — the checker enforces both).
3. Copy `apps/web/pages/components/accordion.astro` to `<slug>.astro`; change `SLUG`, the eight import lines, and the four `ExampleCard` blocks (ids/titles/sources/islands). Nothing else changes.
4. Verify: `pnpm check:registry` green; `pnpm typecheck` green; browser-check `/components/<slug>` (all four render and interact, code tab shows source, dark mode sane).
5. Commit: `git add -A && git commit -m "feat(registry): add <slug> gallery examples"`.

Example concepts per task (concrete content specs; the TSX is the deliverable):

**Task 5 — button** (`button-01…04`):
- `button-01` "Loading button": primary button with `Loader2` spin icon and `disabled`, next to its idle twin. Deps: lucide.
- `button-02` "With icons": row of buttons with leading/trailing lucide icons (`Mail`, `ArrowRight`, `Download`) across default/outline/secondary variants. Deps: lucide.
- `button-03` "Call to action pair": primary "Get started" + ghost "Learn more →" pair as a hero-style action row. Deps: lucide (`ArrowRight`).
- `button-04` "Icon-only actions": compact toolbar of size-icon buttons (`Copy`, `Pencil`, `Trash2`) with `aria-label`s, outline variant. Deps: lucide.

**Task 6 — badge** (`badge-01…04`):
- `badge-01` "Status badges": row of badges with a leading colored dot (`<span className="size-1.5 rounded-full bg-emerald-500" />` etc.) for Active/Pending/Failed.
- `badge-02` "Count badges": icon (`Bell`, `Inbox`) with a small numeric badge overlaid top-right. Deps: lucide.
- `badge-03` "Badges with icons": outline badges with leading lucide icons (`Check`, `Clock`, `X`). Deps: lucide.
- `badge-04` "Tag list": wrap-row of secondary badges as tags (Design, Engineering, Marketing…).

**Task 7 — card** (`card-01…04`; registryDependencies grow per example):
- `card-01` "Stat card": metric, delta with `TrendingUp` icon, muted caption. Deps: lucide; ui: card.
- `card-02` "Notification settings": card with three switch rows (label + description + Switch). ui: card, switch, label; lucide optional.
- `card-03` "Team members": card listing three members (Avatar with initials fallback, name, role) and an outline "Invite" button. ui: card, avatar, button.
- `card-04` "Project card": title, description, progress bar (ui: progress), footer with badge + due date. ui: card, progress, badge.

**Task 8 — dialog** (`dialog-01…04`):
- `dialog-01` "Delete confirmation": destructive confirm dialog (trigger: destructive outline button; footer: Cancel/Delete). ui: dialog, button.
- `dialog-02` "Edit profile": form dialog with two labeled inputs and a Save footer. ui: dialog, button, input, label.
- `dialog-03` "Share link": read-only input with the link + copy button (`Copy` icon, local copied state). ui: dialog, button, input; lucide.
- `dialog-04` "Scrollable terms": long scrollable content body with a sticky accept footer. ui: dialog, button.

**Task 9 — dropdown-menu** (`dropdown-menu-01…04`):
- `dropdown-menu-01` "Account menu": avatar trigger; grouped items with icons (`User`, `Settings`, `LogOut`) and shortcut hints. ui: dropdown-menu, avatar; lucide.
- `dropdown-menu-02` "View options": checkbox items toggling three columns (local state). ui: dropdown-menu, button.
- `dropdown-menu-03` "Sort by": radio group items (Newest/Oldest/A-Z) with local state. ui: dropdown-menu, button.
- `dropdown-menu-04` "With submenu": "Move to…" submenu of folders, separators and a destructive item. ui: dropdown-menu, button; lucide.

**Task 10 — input** (`input-01…04`):
- `input-01` "Search input": leading `Search` icon inside a relative wrapper. ui: input; lucide.
- `input-02` "With error": Field-wrapped input in invalid state showing the error message. ui: field, input, label.
- `input-03` "Password with toggle": visibility toggle button (`Eye`/`EyeOff`, local state). ui: input, button, label; lucide.
- `input-04` "With add-ons": URL input with `https://` prefix box and a currency input with trailing "USD". ui: input, label.

**Task 11 — select** (`select-01…04`):
- `select-01` "Status select": items with colored status dots. ui: select, label.
- `select-02` "Grouped options": two labeled groups (e.g. North America / Europe timezones) with separators. ui: select, label.
- `select-03` "Plan picker": items with a second muted description line. ui: select, label.
- `select-04` "Disabled options": placeholder + a couple of disabled items. ui: select, label.

**Task 12 — switch** (`switch-01…04`):
- `switch-01` "Labeled switch": switch + label + muted description in a row.
- `switch-02` "Settings list": three bordered rows, each label/description/switch, one `defaultChecked`. ui: switch, label.
- `switch-03` "Card consent": switches inside a card with a save footer. ui: switch, card, button, label.
- `switch-04` "Disabled states": disabled off + disabled on pair with labels. ui: switch, label.

**Task 13 — tabs** (`tabs-01…04`; read the existing `tabs-line`/`tabs-indicator` demos first to reuse the ui's variant surface):
- `tabs-01` "Tabs with icons": triggers with leading lucide icons (`User`, `Lock`, `Bell`). ui: tabs; lucide.
- `tabs-02` "Segmented tabs": pill/segmented look via the ui's default variant styling.
- `tabs-03` "Tabs with badges": triggers carrying count badges (ui: tabs, badge).
- `tabs-04` "Vertical tabs": vertical orientation with content to the right.

Checklist per task (repeat for Tasks 5–13):

- [ ] **Step 1:** Read the ui component source(s); write the four example files.
- [ ] **Step 2:** Append the registry entries.
- [ ] **Step 3:** Create the page from the accordion template.
- [ ] **Step 4:** `pnpm check:registry && pnpm typecheck`; browser-check the page.
- [ ] **Step 5:** Commit.

---

### Task 14: Pro manifest loader

**Files:**
- Create: `apps/web/lib/pro-manifest.ts`
- Create: `apps/web/lib/pro-manifest.fixture.json`
- Rewrite: `apps/web/pages/blocks/_data.ts`

**Interfaces:**
- Produces: from `lib/pro-manifest.ts` — types `ManifestAsset { type: "image" | "svg"; src: string; darkSrc?: string }`, `ManifestGroup { id; label; description; icon? }`, `ManifestCategory { id; group; label; description; cover?: ManifestAsset }`, `ManifestItem { name; title; description; category; previewHeight: number }`; functions `parseManifest(raw: unknown): ProManifest` (throws with named offenders on every violation), `loadProManifest(): Promise<ProManifest>` (env `PRO_MANIFEST_URL`, default `https://pro.sevenui.dev/r/pro-manifest.json`; an `http(s)` value is fetched, anything else is read from disk as a fixture path; non-OK fetch throws), `lucideIcon(key: string)` (kebab key → `@lucide/astro` component; throws on unknown key). From `_data.ts` — `groups: Group[]` where `Category = ManifestCategory & { items: ManifestItem[] }`, `Group = ManifestGroup & { categories: Category[]; items: ManifestItem[] }` (the exact shape `blocks-sidebar-nav.astro` already consumes).

- [ ] **Step 1: Write `lib/pro-manifest.ts`**

```ts
// Build-time loader for the pro blocks manifest. The pro repo owns the
// taxonomy (groups/categories) and the catalog; this module fetches it
// during the static build and fails the build loudly on any shape
// violation — a silent fallback would publish an empty or wrong /blocks.
import { readFileSync } from "node:fs";
import { icons } from "@lucide/astro";

export interface ManifestAsset {
  type: "image" | "svg";
  src: string;
  darkSrc?: string;
}
export interface ManifestGroup {
  id: string;
  label: string;
  description: string;
  /** lucide icon kebab key, e.g. "layout-dashboard". */
  icon?: string;
}
export interface ManifestCategory {
  id: string;
  group: string;
  label: string;
  description: string;
  /** 16:9 card visual; absent falls back to /placeholder.svg. */
  cover?: ManifestAsset;
}
export interface ManifestItem {
  name: string;
  title: string;
  description: string;
  category: string;
  previewHeight: number;
}
export interface ProManifest {
  groups: ManifestGroup[];
  categories: ManifestCategory[];
  items: ManifestItem[];
}

const kebabToPascal = (key: string) =>
  key.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");

/** Resolve a manifest icon key to its @lucide/astro component. */
export function lucideIcon(key: string) {
  const icon = (icons as Record<string, unknown>)[kebabToPascal(key)];
  if (!icon) {
    throw new Error(`pro manifest: unknown lucide icon key "${key}"`);
  }
  return icon as (props: Record<string, unknown>) => unknown;
}

function assertAsset(asset: ManifestAsset, where: string) {
  if (asset.type !== "image" && asset.type !== "svg") {
    throw new Error(`${where}: cover.type must be "image" or "svg", got "${asset.type}"`);
  }
  for (const [field, value] of [["src", asset.src], ["darkSrc", asset.darkSrc]] as const) {
    if (value !== undefined && !/^https:\/\//.test(value)) {
      throw new Error(`${where}: cover.${field} must be an absolute https URL, got "${value}"`);
    }
  }
  if (!asset.src) throw new Error(`${where}: cover.src is required`);
}

function uniqueIds(list: { id?: string; name?: string }[], what: string) {
  const seen = new Set<string>();
  for (const entry of list) {
    const id = entry.id ?? entry.name ?? "";
    if (seen.has(id)) throw new Error(`pro manifest: duplicate ${what} "${id}"`);
    seen.add(id);
  }
  return seen;
}

export function parseManifest(raw: unknown): ProManifest {
  const manifest = raw as ProManifest;
  if (!Array.isArray(manifest?.groups) || !Array.isArray(manifest?.categories) || !Array.isArray(manifest?.items)) {
    throw new Error("pro manifest: expected { groups, categories, items } arrays — is the deployed manifest enriched yet?");
  }
  const groupIds = uniqueIds(manifest.groups, "group id");
  const categoryIds = uniqueIds(manifest.categories, "category id");
  uniqueIds(manifest.items, "item name");

  for (const group of manifest.groups) {
    // "preview" is shadowed by the static /blocks/preview route segment.
    if (group.id === "preview") {
      throw new Error(`pro manifest: group id "preview" is reserved — rename this group.`);
    }
    if (group.icon !== undefined) lucideIcon(group.icon);
  }
  for (const category of manifest.categories) {
    if (!groupIds.has(category.group)) {
      throw new Error(`pro manifest: category "${category.id}" names unknown group "${category.group}"`);
    }
    if (category.cover !== undefined) assertAsset(category.cover, `category "${category.id}"`);
  }
  for (const item of manifest.items) {
    if (!categoryIds.has(item.category)) {
      throw new Error(`pro manifest: item "${item.name}" names unknown category "${item.category}"`);
    }
    if (typeof item.previewHeight !== "number" || item.previewHeight <= 0) {
      throw new Error(`pro manifest: item "${item.name}" needs a positive previewHeight`);
    }
  }
  return manifest;
}

export async function loadProManifest(): Promise<ProManifest> {
  const source = process.env.PRO_MANIFEST_URL ?? "https://pro.sevenui.dev/r/pro-manifest.json";
  let raw: unknown;
  if (source.startsWith("http")) {
    const res = await fetch(source);
    if (!res.ok) {
      throw new Error(`pro manifest fetch failed (${res.status}) from ${source} — /blocks cannot build without it.`);
    }
    raw = await res.json();
  } else {
    // A non-URL value is a local fixture path (dev/tests before pro ships).
    raw = JSON.parse(readFileSync(source, "utf8"));
  }
  return parseManifest(raw);
}
```

- [ ] **Step 2: Fixture** — `apps/web/lib/pro-manifest.fixture.json`: two groups (`application` with icon `layout-dashboard`, `marketing` with no icon), three categories (`dashboard` with an image cover using `https://placehold.co/...`-style https URLs is NOT allowed by policy of realism — instead point at `https://pro.sevenui.dev/assets/blocks/dashboard.png`; `settings` with an svg cover incl. `darkSrc`; `hero` with **no cover**, exercising the placeholder fallback), three items (`dashboard-01` → dashboard 720, `settings-01` → settings 640, `hero-01` → hero 480). Fixture asset URLs don't need to resolve — cards render `<img>` with broken-image tolerance in dev; the fallback path is the one that must render.

- [ ] **Step 3: Rewrite `pages/blocks/_data.ts`**

```ts
// Shared data for the /blocks pro gallery. The taxonomy and catalog come
// from the pro manifest at build time (see lib/pro-manifest.ts); this
// module only joins them into the group→category→items tree the pages
// and sidebar render.
import {
  loadProManifest,
  type ManifestCategory,
  type ManifestGroup,
  type ManifestItem,
} from "../../lib/pro-manifest";

export type { ManifestItem };
export interface Category extends ManifestCategory {
  items: ManifestItem[];
}
export interface Group extends ManifestGroup {
  categories: Category[];
  items: ManifestItem[];
}

const manifest = await loadProManifest();

export const groups: Group[] = manifest.groups.map((group) => {
  const categories: Category[] = manifest.categories
    .filter((category) => category.group === group.id)
    .map((category) => ({
      ...category,
      items: manifest.items.filter((item) => item.category === category.id),
    }));
  return { ...group, categories, items: categories.flatMap((category) => category.items) };
});
```

(Remove `PREVIEW_HEIGHTS`, `PREVIEW_STAGES`, `GROUPS`, and the old guards — validation now lives in `parseManifest`. The old exports' consumers are rewritten in Task 15; this task leaves the tree temporarily unbuildable, which is why Tasks 14–16 land as one push.)

- [ ] **Step 4: Loader verification** (no vitest in apps/web; drive it with node):

```bash
cd apps/web && node --input-type=module -e "
process.env.PRO_MANIFEST_URL = 'lib/pro-manifest.fixture.json';
const { loadProManifest, parseManifest } = await import('./lib/pro-manifest.ts');
" 2>&1 | head -3
```

Node can't strip TS here — if the direct import fails (expected on this Node), verify through Astro instead: defer to Task 15 Step 4, which builds with the fixture; and unit-test the failure paths by temporarily copying broken fixtures (unknown category, bad icon key, http:// cover src) and confirming `astro build` fails with the named offender. Record the three failure messages in the task report.

- [ ] **Step 5: Commit** (with Task 15, see below — Tasks 14+15 may share one commit if the tree must stay green; otherwise commit here.)

---

### Task 15: Rebuild the `/blocks` pages as the pro directory

**Files:**
- Create: `apps/web/components/category-card.astro`
- Rewrite: `apps/web/pages/blocks/index.astro`
- Rewrite: `apps/web/pages/blocks/[group]/index.astro`
- Rewrite: `apps/web/pages/blocks/[group]/[category].astro`
- Modify: `apps/web/components/blocks-sidebar-nav.astro` (group icons)
- Modify: `apps/web/components/block-frame.astro` (parameterize install/preview/source)
- Delete: `apps/web/pages/blocks/preview/[slug].astro` (moved from teardown — the free preview route dies with the free gallery pages)

**Interfaces:**
- Consumes: `groups` from `_data.ts` (Task 14 shape), `lucideIcon` from `lib/pro-manifest.ts`, `blocks-sidebar.astro` (unchanged — it wraps `blocks-sidebar-nav` and the customizer), `block-frame.astro`.
- Produces: `block-frame.astro` props become `{ name, title, description, height, installItem, previewUrl, sourceUrl? }` — `installItem` feeds `installCommand()`, `previewUrl` the iframe, `sourceUrl` optional (link hidden when absent).

- [ ] **Step 1: `category-card.astro`**

```astro
---
// One category card: 16:9 cover (image/svg via <img>, /placeholder.svg
// fallback, optional dark variant), then label + block count.
import type { Category } from "../pages/blocks/_data";

interface Props {
  group: string;
  category: Category;
}
const { group, category } = Astro.props;
const cover = category.cover;
---

<a href={`/blocks/${group}/${category.id}`} class="group block">
  <div class="aspect-video overflow-hidden rounded-xl border border-border bg-muted/30">
    {cover ? (
      <>
        <img
          src={cover.src}
          alt=""
          loading="lazy"
          class={`h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02] ${cover.darkSrc ? "dark:hidden" : ""}`}
        />
        {cover.darkSrc && (
          <img
            src={cover.darkSrc}
            alt=""
            loading="lazy"
            class="hidden h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02] dark:block"
          />
        )}
      </>
    ) : (
      <img src="/placeholder.svg" alt="" loading="lazy" class="h-full w-full object-cover" />
    )}
  </div>
  <div class="mt-3 flex items-baseline justify-between gap-4">
    <h3 class="text-sm font-medium">{category.label}</h3>
    <span class="text-xs text-muted-foreground">
      {category.items.length} {category.items.length === 1 ? "block" : "blocks"}
    </span>
  </div>
  <p class="mt-1 text-sm text-muted-foreground">{category.description}</p>
</a>
```

Before relying on `dark:hidden`/`dark:block`, check how the site's dark mode is toggled (Blume `theme.mode: "system"`); if the `dark:` variant isn't wired to Blume's mechanism, switch to the selector Blume uses (inspect the generated CSS / an existing dark-aware component) — verify in the browser in both themes.

- [ ] **Step 2: `blocks/index.astro`** — keep the existing PageLayout scaffolding and `BlocksSidebar` grid shell; replace the free-blocks body and the entire client-side pro `<script>` with: header ("Blocks", "Production-ready pro blocks built on SevenUI components." + computed totals + `Get lifetime access` link to `/pro`), then one `<section>` per group:

```astro
{groups.map((group) => {
  const GroupIcon = group.icon ? lucideIcon(group.icon) : null;
  return (
    <section>
      <h2 class="flex items-center gap-2 text-lg font-semibold tracking-tight">
        {GroupIcon && <GroupIcon class="size-4 text-muted-foreground" aria-hidden="true" />}
        <a href={`/blocks/${group.id}`} class="hover:underline">{group.label}</a>
        <span class="text-sm font-normal text-muted-foreground">{group.items.length}</span>
      </h2>
      <p class="mt-1 text-sm text-muted-foreground">{group.description}</p>
      <div class="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {group.categories.map((category) => (
          <CategoryCard group={group.id} category={category} />
        ))}
      </div>
    </section>
  );
})}
```

- [ ] **Step 3: `[group]/index.astro` and `[group]/[category].astro`** — keep their current getStaticPaths pattern (`groups.map(...)` params), swap bodies: the group page renders its category cards (same grid as above); the category page renders `BlockFrame` per item:

```astro
{category.items.map((item) => (
  <BlockFrame
    name={item.name}
    title={item.title}
    description={item.description}
    height={item.previewHeight}
    installItem={`pro/${item.name}`}
    previewUrl={`/previews/${item.name}`}
  />
))}
```

plus a "Pro" badge in the frame header and a "Get Pro" CTA linking `/pro` in the page header. Both pages keep `BlocksSidebar` with active group/category.

- [ ] **Step 4: `block-frame.astro` parameterization** — replace the derived constants at the top (`installCommand(...)`, `sourceUrl`, `previewUrl`) with the three new props; render the GitHub source link only `{sourceUrl && ...}`; the "Preview" open-in-new-tab link uses `previewUrl`. Add an optional `badge?: string` prop rendered next to the title (category pages pass `badge="Pro"`). Everything else (resize track, presets, copy button) stays.

- [ ] **Step 5: Sidebar icons** — in `blocks-sidebar-nav.astro`, render the group icon before the label when present: `const GroupIcon = group.icon ? lucideIcon(group.icon) : null;` inside the map, `{GroupIcon && <GroupIcon class="size-3.5 text-muted-foreground" aria-hidden="true" />}` next to the chevron.

- [ ] **Step 6: Delete the free preview route** — `git rm apps/web/pages/blocks/preview/[slug].astro`, and remove the preview-route existence check from `scripts/check-registry.mjs` in the same commit (otherwise `pnpm check:registry` is red between Tasks 15 and 16). (The `/blocks/preview` reservation note in `parseManifest` stays: the segment may return someday, and the reserved id costs nothing.)

- [ ] **Step 7: Build against the fixture**

```bash
cd apps/web && PRO_MANIFEST_URL=lib/pro-manifest.fixture.json pnpm build
```

Expected: build succeeds. Then the three broken-fixture runs from Task 14 Step 4 (unknown category, unknown icon key, non-https cover src) — each must fail the build naming the offender.

- [ ] **Step 8: Browser-check** with the fixture (`PRO_MANIFEST_URL=lib/pro-manifest.fixture.json pnpm dev`): `/blocks` (group sections, icon renders, hero category shows `/placeholder.svg`), `/blocks/application`, `/blocks/application/dashboard` (iframe hits `/previews/dashboard-01` — via the dev proxy this may 404 locally; the frame chrome, Pro badge, install command `.../r/pro/dashboard-01.json`, and customizer panel are what's under test), both themes.

- [ ] **Step 9: Commit** (Tasks 14+15 together if Task 14 wasn't committed)

```bash
git add -A && git commit -m "feat(web): rebuild /blocks as the pro directory from the build-time manifest"
```

---

### Task 16: Free-block teardown

**Files:**
- Delete: `packages/blocks/` (whole package)
- Modify: `apps/web/package.json` (drop the blocks build from `build:registry`)
- Modify: `scripts/check-registry.mjs` (drop the blocks section)
- Modify: `apps/web/theme.css` (drop the blocks `@source` line)
- Modify: `apps/web/docs/installation.mdx` (blocks section rewrite)
- Modify: `scripts/smoke-test.sh` (namespaced registry dirs)
- Modify: `pnpm-workspace.yaml` — no glob change needed (`packages/*`), but run `pnpm install` after deleting so the lockfile drops `@sevenui/blocks`.

- [ ] **Step 1: Delete the package** — `git rm -r packages/blocks`, then `pnpm install` (lockfile update).

- [ ] **Step 2: Purge references** —
  - `build:registry`: remove the `&& shadcn build -c ../../packages/blocks ...` segment.
  - `check-registry.mjs`: remove `BLOCKS_ROOT`, the `blocks` load, `blocksPkg` from `EXPECTED_RANGES`, the whole "blocks registry" section including the preview-route existence check; update the final `ok` line.
  - `theme.css`: remove `@source "../../../../../packages/blocks/blocks/**/*.tsx";`.
  - Grep for leftovers: `grep -rn "packages/blocks\|/r/blocks\|blocks/preview" apps/web scripts docs --include="*" | grep -v node_modules | grep -v dist` — every hit must be either deleted or intentional (the spec/plan docs mention them historically; that's fine).

- [ ] **Step 3: Rewrite the blocks section of `installation.mdx`** — the section that says components at `/r/<name>.json`, blocks at `/r/blocks/<name>.json` and installs `blocks/login-01` becomes: components at `/r/<name>.json`, gallery examples at `/r/component/<name>.json`, docs demos at `/r/demo/<name>.json`, pro blocks at `/r/pro/<name>.json`; swap the example to `<InstallCommand item="component/accordion-01" />` with the short form `npx shadcn@latest add @sevenui/component/accordion-01`, and point "browse them" at `/components` and `/blocks`.

- [ ] **Step 4: Update `smoke-test.sh`** — replace the `r/blocks` mirror loop with `r/demo` and `r/component` loops (same sed rewrite into `$WORK/registry/demo/` and `$WORK/registry/component/`), and extend the install step to add one item from each namespace (`accordion`, `demo/accordion-demo`, `component/accordion-01` — read the script's existing install invocation and mirror it). Run `pnpm test:smoke`; expected: PASS.

- [ ] **Step 5: Full gate** — `pnpm check:registry && pnpm typecheck && pnpm test` all green; `rm -rf apps/web/public/r && cd apps/web && pnpm build:registry` leaves no `public/r/blocks`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "refactor: retire free blocks; /blocks is now the pro directory"
```

---

### Task 17: Final verification + deploy (orchestrator)

- [ ] **Step 1: Pro gate** — confirm the sevenui-pro session reported DONE and `curl -s https://pro.sevenui.dev/r/pro-manifest.json` parses against the new schema (groups/categories/items present, dashboard-01 categorized).
- [ ] **Step 2: Real-manifest build** — `cd apps/web && pnpm build` (no `PRO_MANIFEST_URL` override) passes.
- [ ] **Step 3: Full suite** — `pnpm check:registry && pnpm typecheck && pnpm test && pnpm test:smoke` all green.
- [ ] **Step 4: Push to main** — deploys are authorized for this effort; Vercel builds from main. Watch the production deploy complete.
- [ ] **Step 5: Live browser sweep** — on sevenui.dev: `/docs/components/accordion` (demos intact), `/components` + two component pages (installs copy `/r/component/...`), `/blocks` tree + customizer against the live pro preview, `/r/accordion.json`, `/r/demo/accordion-demo.json`, `/r/component/accordion-01.json` all fetch, `curl -s https://sevenui.dev/r/pro/dashboard-01.json` still gates.
- [ ] **Step 6: Live install smoke** — in a scratch dir, `npx shadcn@latest add https://sevenui.dev/r/component/accordion-01.json` lands the example + accordion ui dep.
- [ ] **Step 7: Report** — summarize to the user (Turkish); update memory files (wave status, new namespace facts, any new traps discovered).
