# Wave 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the SevenUI repo end to end — Blume docs site, shadcn registry pipeline, CI — and ship the 16 Wave 1 foundation items, deployable at sevenui.dev.

**Architecture:** A flat single-package repo. Component sources live in `registry/base/ui/`, demos in `examples/`, docs in `docs/`. `npx shadcn build` compiles `registry.json` into static JSON at `public/r/`, which Blume serves verbatim at `/r/{name}.json`. Blume's `<Component path="..."/>` renders the same demo files as live previews.

**Tech Stack:** Blume (Astro/Vite-based docs framework), `@base-ui/react` 1.7+, Tailwind CSS v4 (inside Blume preview frames and consumer projects), class-variance-authority, clsx, tailwind-merge, shadcn CLI, pnpm, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-02-sevenui-registry-design.md`

## Global Constraints

- All repo content in English; file names kebab-case; Conventional Commits, imperative mood; **no attribution trailers of any kind** (no `Co-Authored-By`, no AI/model/tool names). See `AGENTS.md`.
- Component dependency allowlist: `@base-ui/react`, Tailwind v4 classes, `class-variance-authority`, `clsx`, `tailwind-merge`. Nothing else in any Wave 1 component.
- Node.js >= 22.12 (Blume requirement). Package manager: pnpm.
- Base UI imports are per-component subpaths: `import { Avatar } from "@base-ui/react/avatar"`.
- Source imports use the `@/registry/...` alias (the shadcn CLI rewrites these to consumer aliases on install).
- Internal `registryDependencies` use full URLs: `https://sevenui.dev/r/<name>.json`. Bare names resolve to shadcn's own registry — never use them for our items.
- Demo items use type `registry:component` (`registry:example` no longer exists in the schema).
- Registry item required fields: `name`, `type`; always also set `title` and `description`.
- Styling states use Base UI's plain data attributes (`data-checked`, `data-orientation=...`), not Radix `data-state` values.
- `public/r/` is build output — gitignored, never hand-edited.

## Verification commands (used throughout)

```bash
pnpm typecheck        # tsc --noEmit over registry/ examples/ scripts/
pnpm build:registry   # npx shadcn build  -> public/r/*.json
pnpm check:registry   # scripts/check-registry.mjs (Task 4 onward)
pnpm build            # registry build + blume build -> dist/
pnpm dev              # blume dev (visual check of docs + previews)
```

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `.gitignore`, `blume.config.ts`, `docs/index.mdx`

**Interfaces:**
- Produces: working `pnpm dev` / `pnpm build` loop; `@/*` path alias for all later code; `docs/` as Blume content root.

- [ ] **Step 1: Initialize package.json**

```json
{
  "name": "sevenui",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.12" },
  "scripts": {
    "dev": "blume dev",
    "build": "pnpm build:registry && blume build",
    "build:registry": "shadcn build",
    "preview": "blume preview",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
pnpm add react react-dom @base-ui/react class-variance-authority clsx tailwind-merge
pnpm add -D blume shadcn typescript @types/react @types/react-dom
```

- [ ] **Step 3: Create tsconfig.json**

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
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["registry", "examples", "scripts", "blume.config.ts"]
}
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
dist/
.blume/
public/r/
*.log
.DS_Store
```

- [ ] **Step 5: Create blume.config.ts**

```ts
import { defineConfig } from "blume";

export default defineConfig({
  title: "SevenUI",
  description:
    "Base UI powered components, distributed through the shadcn registry.",
  theme: { accent: "blue", radius: "md", mode: "system" },
  examples: { css: "examples/theme.css" },
});
```

- [ ] **Step 6: Create docs/index.mdx**

```mdx
---
title: Introduction
description: Base UI powered components, distributed through the shadcn registry.
---

SevenUI is a component library built exclusively on
[Base UI](https://base-ui.com) primitives. Components are installed as
source code into your project through the shadcn CLI — no runtime
package to depend on.
```

Also create an empty `examples/theme.css` for now (Task 2 fills it) so the config key does not point at a missing file:

```css
/* SevenUI design tokens — populated in the theme task. */
```

- [ ] **Step 7: Verify dev and build**

Run: `pnpm dev` — expect a local docs site with the index page. Stop it.
Run: `npx blume build` — expect `dist/` with static HTML. (Full `pnpm build` needs `registry.json`, which Task 2 adds.)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold blume docs site and toolchain"
```

---

### Task 2: Design tokens, cn utility, and the registry pipeline

**Files:**
- Create: `registry/base/lib/utils.ts`, `registry.json`
- Modify: `examples/theme.css`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` from `@/registry/base/lib/utils` — every later component imports it. Registry items `utils` (registry:lib) and `theme` (registry:theme). Working `pnpm build:registry` and `pnpm build`.

- [ ] **Step 1: Write registry/base/lib/utils.ts**

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Write examples/theme.css**

shadcn's default neutral palette so previews match what consumers see. Blume exposes both `.dark` and `[data-theme="dark"]` in preview frames.

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}

.dark,
[data-theme="dark"] {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

**Open verification (spec assumption #3):** if `@theme inline` is not processed by Blume's Tailwind pipeline (checked visually in Task 3), replace the `@theme` block with plain CSS utility definitions in this same file, e.g. `.bg-primary { background-color: var(--primary); }` for each token utility the demos use.

- [ ] **Step 3: Write registry.json**

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "sevenui",
  "homepage": "https://sevenui.dev",
  "items": [
    {
      "name": "utils",
      "type": "registry:lib",
      "title": "Utils",
      "description": "cn helper merging clsx and tailwind-merge.",
      "dependencies": ["clsx", "tailwind-merge"],
      "files": [
        { "path": "registry/base/lib/utils.ts", "type": "registry:lib" }
      ]
    },
    {
      "name": "theme",
      "type": "registry:theme",
      "title": "SevenUI Theme",
      "description": "shadcn-compatible design tokens (neutral palette).",
      "cssVars": {
        "light": {
          "background": "oklch(1 0 0)",
          "foreground": "oklch(0.145 0 0)",
          "card": "oklch(1 0 0)",
          "card-foreground": "oklch(0.145 0 0)",
          "popover": "oklch(1 0 0)",
          "popover-foreground": "oklch(0.145 0 0)",
          "primary": "oklch(0.205 0 0)",
          "primary-foreground": "oklch(0.985 0 0)",
          "secondary": "oklch(0.97 0 0)",
          "secondary-foreground": "oklch(0.205 0 0)",
          "muted": "oklch(0.97 0 0)",
          "muted-foreground": "oklch(0.556 0 0)",
          "accent": "oklch(0.97 0 0)",
          "accent-foreground": "oklch(0.205 0 0)",
          "destructive": "oklch(0.577 0.245 27.325)",
          "border": "oklch(0.922 0 0)",
          "input": "oklch(0.922 0 0)",
          "ring": "oklch(0.708 0 0)",
          "radius": "0.625rem"
        },
        "dark": {
          "background": "oklch(0.145 0 0)",
          "foreground": "oklch(0.985 0 0)",
          "card": "oklch(0.205 0 0)",
          "card-foreground": "oklch(0.985 0 0)",
          "popover": "oklch(0.205 0 0)",
          "popover-foreground": "oklch(0.985 0 0)",
          "primary": "oklch(0.922 0 0)",
          "primary-foreground": "oklch(0.205 0 0)",
          "secondary": "oklch(0.269 0 0)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "muted": "oklch(0.269 0 0)",
          "muted-foreground": "oklch(0.708 0 0)",
          "accent": "oklch(0.269 0 0)",
          "accent-foreground": "oklch(0.985 0 0)",
          "destructive": "oklch(0.704 0.191 22.216)",
          "border": "oklch(1 0 0 / 10%)",
          "input": "oklch(1 0 0 / 15%)",
          "ring": "oklch(0.556 0 0)"
        }
      }
    }
  ]
}
```

- [ ] **Step 4: Verify the pipeline end to end**

```bash
pnpm typecheck                       # PASS
pnpm build:registry                  # creates public/r/utils.json, public/r/theme.json
cat public/r/utils.json              # "content" field contains the inlined source
pnpm build                           # blume build; then:
ls dist/r/                           # utils.json theme.json present (public/ passthrough)
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(registry): add design tokens, cn utility, and build pipeline"
```

---

### Task 3: Button — first full component loop

This task proves the whole loop: component → demo → live preview → registry item. It also settles spec assumptions #2 (alias resolution in previews) and #3 (Tailwind token utilities).

**Files:**
- Create: `registry/base/ui/button.tsx`, `examples/button/button-demo.tsx`, `examples/button/button-variants.tsx`, `docs/components/button.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn` from `@/registry/base/lib/utils`.
- Produces: `Button` and `buttonVariants` from `@/registry/base/ui/button`. Props: Base UI Button props plus `variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"` and `size?: "default" | "sm" | "lg" | "icon"`. Composition via Base UI's `render` prop (not Radix `asChild`).

- [ ] **Step 1: Check the Base UI Button API**

Open https://base-ui.com/react/components/button and confirm: single-part component, `render` prop, disabled handling. The research snapshot (2026-08) says Button is a newer single-part primitive; if its part structure differs from the code below, adapt while keeping the exported names and variant props identical.

- [ ] **Step 2: Write registry/base/ui/button.tsx**

```tsx
"use client";

import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/registry/base/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ButtonPrimitive> &
  VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

- [ ] **Step 3: Write the demos**

`examples/button/button-demo.tsx`:

```tsx
import { Button } from "@/registry/base/ui/button";

export default function ButtonDemo() {
  return <Button>Button</Button>;
}
```

`examples/button/button-variants.tsx`:

```tsx
import { Button } from "@/registry/base/ui/button";

export default function ButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}
```

- [ ] **Step 4: Write docs/components/button.mdx**

```mdx
---
title: Button
description: Displays a button built on the Base UI Button primitive.
---

<Component path="button/button-demo" />

## Installation

```bash
npx shadcn@latest add @sevenui/button
```

## Usage

```tsx
import { Button } from "@/components/ui/button";

<Button variant="outline">Button</Button>;
```

## Examples

### Variants

<Component path="button/button-variants" />

## API reference

Built on the [Base UI Button](https://base-ui.com/react/components/button)
primitive — all its props apply. SevenUI adds:

| Prop      | Type                                                                       | Default     |
| --------- | -------------------------------------------------------------------------- | ----------- |
| `variant` | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"default"` |
| `size`    | `"default" \| "sm" \| "lg" \| "icon"`                                       | `"default"` |
```

- [ ] **Step 5: Add registry items**

Append to `registry.json` items:

```json
{
  "name": "button",
  "type": "registry:ui",
  "title": "Button",
  "description": "Displays a button built on the Base UI Button primitive.",
  "dependencies": ["@base-ui/react", "class-variance-authority"],
  "registryDependencies": ["https://sevenui.dev/r/utils.json"],
  "files": [
    { "path": "registry/base/ui/button.tsx", "type": "registry:ui" }
  ]
},
{
  "name": "button-demo",
  "type": "registry:component",
  "title": "Button Demo",
  "description": "Default button example.",
  "registryDependencies": ["https://sevenui.dev/r/button.json"],
  "files": [
    { "path": "examples/button/button-demo.tsx", "type": "registry:component" }
  ]
}
```

(Demo items for additional examples like `button-variants` are optional; publish only the `-demo` file per component to keep the registry list tidy.)

- [ ] **Step 6: Verify — this is the checkpoint of the whole plan**

```bash
pnpm typecheck && pnpm build:registry && pnpm dev
```

In the browser, on `/components/button`:
- Preview renders the button (alias `@/registry/...` resolved). If the frame errors on module resolution, wire the alias through Blume's `integrations` config (Astro/Vite alias for `@` → project root) and record what worked in the task notes.
- `bg-primary` etc. apply (token utilities generated). If unstyled, apply the plain-CSS fallback from Task 2 Step 2.
- Toggle dark mode — colors flip.
- Code tab shows the demo source.

Then `pnpm build` and confirm `dist/r/button.json` exists.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(registry): add button component with demo and docs"
```

---

### Task 4: Registry integrity script

**Files:**
- Create: `scripts/check-registry.mjs`
- Modify: `package.json` (add script)

**Interfaces:**
- Produces: `pnpm check:registry` — exits 1 with a readable error list when the registry is inconsistent. Later component tasks and CI rely on it.

- [ ] **Step 1: Write scripts/check-registry.mjs**

```js
import { readFileSync, existsSync } from "node:fs";

const registry = JSON.parse(readFileSync("registry.json", "utf8"));
const errors = [];
const itemNames = new Set(registry.items.map((i) => i.name));
const OWN_URL = /^https:\/\/sevenui\.dev\/r\/([a-z0-9-]+)\.json$/;

for (const item of registry.items) {
  const where = `item "${item.name}"`;

  for (const file of item.files ?? []) {
    if (!existsSync(file.path)) {
      errors.push(`${where}: missing file ${file.path}`);
    }
  }

  for (const dep of item.registryDependencies ?? []) {
    const match = dep.match(OWN_URL);
    if (!match) {
      errors.push(
        `${where}: registryDependencies must be full sevenui.dev URLs, got "${dep}"`,
      );
    } else if (!itemNames.has(match[1])) {
      errors.push(`${where}: dependency "${match[1]}" is not a registry item`);
    }
  }

  if (item.type === "registry:ui") {
    if (!itemNames.has(`${item.name}-demo`)) {
      errors.push(`${where}: no "${item.name}-demo" example item`);
    }
    if (!existsSync(`docs/components/${item.name}.mdx`)) {
      errors.push(`${where}: no docs page docs/components/${item.name}.mdx`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Registry check failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`Registry check passed (${registry.items.length} items).`);
```

- [ ] **Step 2: Add the script and verify both outcomes**

Add to package.json scripts: `"check:registry": "node scripts/check-registry.mjs"`.

Run: `pnpm check:registry` — expect PASS (4 items).
Then temporarily rename `registry/base/ui/button.tsx`, run again — expect FAIL listing the missing file. Rename back, confirm PASS.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(scripts): add registry integrity check"
```

---

### Task 5: Install smoke test

Proves the consumer flow: a scratch project installs components from the built registry through the real shadcn CLI.

**Files:**
- Create: `scripts/smoke-test.sh`
- Modify: `package.json` (add script `"test:smoke": "bash scripts/smoke-test.sh"`)

**Interfaces:**
- Consumes: `public/r/*.json` from `pnpm build:registry`.
- Produces: `pnpm test:smoke` — exits non-zero when the consumer flow breaks.

- [ ] **Step 1: Write scripts/smoke-test.sh**

The built JSONs point registryDependencies at `https://sevenui.dev`, which may not be deployed yet — the script rewrites those URLs to a local static server, then installs via direct URL.

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT=8137
WORK="$(mktemp -d)"
trap 'kill "${SERVER_PID:-}" 2>/dev/null || true; rm -rf "$WORK"' EXIT

# 1. Local registry with URLs rewritten to localhost
mkdir -p "$WORK/registry"
for f in "$ROOT"/public/r/*.json; do
  sed "s|https://sevenui.dev/r/|http://localhost:$PORT/|g" "$f" \
    > "$WORK/registry/$(basename "$f")"
done
(cd "$WORK/registry" && python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1) &
SERVER_PID=$!
sleep 1

# 2. Scratch consumer project
APP="$WORK/app"
mkdir -p "$APP/src" "$APP/src/lib"
cat > "$APP/package.json" <<'EOF'
{
  "name": "smoke-app",
  "private": true,
  "type": "module",
  "dependencies": { "react": "^19.0.0", "react-dom": "^19.0.0" },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.0"
  }
}
EOF
cat > "$APP/tsconfig.json" <<'EOF'
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
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
EOF
cat > "$APP/src/styles.css" <<'EOF'
@import "tailwindcss";
EOF
cat > "$APP/components.json" <<'EOF'
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "utils": "@/lib/utils",
    "hooks": "@/hooks"
  }
}
EOF
(cd "$APP" && npm install --silent)

# 3. Install representative items through the CLI
(cd "$APP" && npx --yes shadcn@latest add --yes --overwrite \
  "http://localhost:$PORT/theme.json" \
  "http://localhost:$PORT/button.json")

# 4. The installed code must typecheck in the consumer project
cat > "$APP/src/main.tsx" <<'EOF'
import { Button } from "@/components/ui/button";

export function App() {
  return <Button variant="outline">ok</Button>;
}
EOF
(cd "$APP" && npx tsc --noEmit)

echo "Smoke test passed."
```

- [ ] **Step 2: Run it**

```bash
chmod +x scripts/smoke-test.sh
pnpm build:registry && pnpm test:smoke
```

Expected: `Smoke test passed.` If the CLI balks at plain-http localhost, re-run with `--insecure`-style flags if offered, or serve via `npx serve` — record the working invocation in the script.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(scripts): add consumer install smoke test"
```

---

### Task 6: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `typecheck`, `check:registry`, `build`, `test:smoke` scripts from earlier tasks.

- [ ] **Step 1: Write .github/workflows/ci.yml**

```yaml
name: ci
on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22.12
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm check:registry
      - run: pnpm build
      - run: pnpm test:smoke
```

- [ ] **Step 2: Verify locally, then on GitHub**

Run the same commands locally in order — all PASS. Push the branch, open the Actions tab, confirm the workflow is green.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "ci: add verify workflow"
```

---

### Task 7: Badge and Kbd

**Files:**
- Create: `registry/base/ui/badge.tsx`, `registry/base/ui/kbd.tsx`, `examples/badge/badge-demo.tsx`, `examples/kbd/kbd-demo.tsx`, `docs/components/badge.mdx`, `docs/components/kbd.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`.
- Produces: `Badge`, `badgeVariants` (`variant?: "default" | "secondary" | "destructive" | "outline"`); `Kbd`.

- [ ] **Step 1: Write registry/base/ui/badge.tsx**

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/registry/base/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
```

- [ ] **Step 2: Write registry/base/ui/kbd.tsx**

```tsx
import * as React from "react";

import { cn } from "@/registry/base/lib/utils";

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none",
        className,
      )}
      {...props}
    />
  );
}

export { Kbd };
```

- [ ] **Step 3: Write the demos**

`examples/badge/badge-demo.tsx`:

```tsx
import { Badge } from "@/registry/base/ui/badge";

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  );
}
```

`examples/kbd/kbd-demo.tsx`:

```tsx
import { Kbd } from "@/registry/base/ui/kbd";

export default function KbdDemo() {
  return (
    <p className="text-sm text-muted-foreground">
      Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command menu.
    </p>
  );
}
```

- [ ] **Step 4: Write the docs pages**

`docs/components/badge.mdx` (kbd.mdx follows the same shape with its own names and a `Kbd` API note of "no props beyond `<kbd>`"):

```mdx
---
title: Badge
description: Displays a small status descriptor.
---

<Component path="badge/badge-demo" />

## Installation

```bash
npx shadcn@latest add @sevenui/badge
```

## Usage

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="outline">Badge</Badge>;
```

## API reference

Plain `<span>`; no primitive. SevenUI props:

| Prop      | Type                                                   | Default     |
| --------- | ------------------------------------------------------ | ----------- |
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"` |
```

- [ ] **Step 5: Add registry items**

For each of the two components append a `registry:ui` item plus a `-demo` item, following exactly the Task 3 Step 5 pattern (badge and kbd have no `dependencies` — only `registryDependencies: ["https://sevenui.dev/r/utils.json"]`; the demo depends on its component's URL).

- [ ] **Step 6: Verify and commit**

```bash
pnpm typecheck && pnpm check:registry && pnpm build:registry
pnpm dev   # visual check of both pages, light and dark
git add -A
git commit -m "feat(registry): add badge and kbd components"
```

---

### Task 8: Card and Alert

**Files:**
- Create: `registry/base/ui/card.tsx`, `registry/base/ui/alert.tsx`, `examples/card/card-demo.tsx`, `examples/alert/alert-demo.tsx`, `docs/components/card.mdx`, `docs/components/alert.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`.
- Produces: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`; `Alert`, `AlertTitle`, `AlertDescription` (`variant?: "default" | "destructive"`).

- [ ] **Step 1: Write registry/base/ui/card.tsx**

```tsx
import * as React from "react";

import { cn } from "@/registry/base/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid auto-rows-min items-start gap-1.5 px-6", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("font-semibold leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("justify-self-end self-start", className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center px-6", className)} {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
};
```

- [ ] **Step 2: Write registry/base/ui/alert.tsx**

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/registry/base/lib/utils";

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(1rem)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant, className }))}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
```

- [ ] **Step 3: Write the demos**

`examples/card/card-demo.tsx`:

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Button } from "@/registry/base/ui/button";

export default function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Project settings</CardTitle>
        <CardDescription>Manage how this project behaves.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Changes apply to every member of the project.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  );
}
```

`examples/alert/alert-demo.tsx`:

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";

export default function AlertDemo() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components to your app using the shadcn CLI.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>Your session has expired.</AlertDescription>
      </Alert>
    </div>
  );
}
```

- [ ] **Step 4: Docs pages, registry items, verify, commit**

Write `docs/components/card.mdx` and `docs/components/alert.mdx` following the Task 3 Step 4 template (card documents its seven exported parts in the API section; alert documents the `variant` prop). Append registry items following the Task 3 Step 5 pattern — note `card-demo` has TWO registryDependencies: card and button URLs.

```bash
pnpm typecheck && pnpm check:registry && pnpm build:registry
pnpm dev   # visual check
git add -A
git commit -m "feat(registry): add card and alert components"
```

---

### Task 9: Separator, Skeleton, Spinner

**Files:**
- Create: `registry/base/ui/separator.tsx`, `registry/base/ui/skeleton.tsx`, `registry/base/ui/spinner.tsx`, `examples/separator/separator-demo.tsx`, `examples/skeleton/skeleton-demo.tsx`, `examples/spinner/spinner-demo.tsx`, `docs/components/separator.mdx`, `docs/components/skeleton.mdx`, `docs/components/spinner.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`.
- Produces: `Separator` (Base UI-backed, `orientation?: "horizontal" | "vertical"`); `Skeleton`; `Spinner`.

- [ ] **Step 1: Write registry/base/ui/separator.tsx**

```tsx
"use client";

import * as React from "react";
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "@/registry/base/lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive>) {
  return (
    <SeparatorPrimitive
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
```

- [ ] **Step 2: Write registry/base/ui/skeleton.tsx**

```tsx
import * as React from "react";

import { cn } from "@/registry/base/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-accent", className)}
      {...props}
    />
  );
}

export { Skeleton };
```

- [ ] **Step 3: Write registry/base/ui/spinner.tsx**

```tsx
import * as React from "react";

import { cn } from "@/registry/base/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      role="status"
      aria-label="Loading"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={cn("size-4 animate-spin", className)}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export { Spinner };
```

- [ ] **Step 4: Demos, docs, registry items, verify, commit**

Demos: separator between two labeled text blocks with a vertical example (`<div className="flex h-5 items-center gap-4 text-sm">A<Separator orientation="vertical" />B</div>`); skeleton as a card placeholder (`<div className="flex items-center gap-4"><Skeleton className="size-10 rounded-full" /><div className="grid gap-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-28" /></div></div>`); spinner alone and inside `<Button disabled><Spinner /> Loading…</Button>` (spinner-demo depends on button). Docs pages per the Task 3 template — separator links to the Base UI Separator page; skeleton and spinner note "plain element, no primitive". Registry items per the Task 3 Step 5 pattern (separator has `dependencies: ["@base-ui/react"]`).

```bash
pnpm typecheck && pnpm check:registry && pnpm build:registry
pnpm dev
git add -A
git commit -m "feat(registry): add separator, skeleton, and spinner components"
```

---

### Task 10: Aspect Ratio and Textarea

**Files:**
- Create: `registry/base/ui/aspect-ratio.tsx`, `registry/base/ui/textarea.tsx`, `examples/aspect-ratio/aspect-ratio-demo.tsx`, `examples/textarea/textarea-demo.tsx`, `docs/components/aspect-ratio.mdx`, `docs/components/textarea.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`.
- Produces: `AspectRatio` (`ratio?: number`, default 1); `Textarea`.

- [ ] **Step 1: Write registry/base/ui/aspect-ratio.tsx**

CSS `aspect-ratio` needs no primitive:

```tsx
import * as React from "react";

import { cn } from "@/registry/base/lib/utils";

function AspectRatio({
  ratio = 1,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & { ratio?: number }) {
  return (
    <div
      className={cn("relative w-full", className)}
      style={{ aspectRatio: ratio, ...style }}
      {...props}
    />
  );
}

export { AspectRatio };
```

- [ ] **Step 2: Write registry/base/ui/textarea.tsx**

```tsx
import * as React from "react";

import { cn } from "@/registry/base/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
```

- [ ] **Step 3: Demos, docs, registry items, verify, commit**

Demos: aspect-ratio wrapping a `16 / 9` muted placeholder div; textarea with a placeholder. Docs per the Task 3 template ("plain element, no primitive"; aspect-ratio documents the `ratio` prop). Registry items per the Task 3 Step 5 pattern.

```bash
pnpm typecheck && pnpm check:registry && pnpm build:registry
pnpm dev
git add -A
git commit -m "feat(registry): add aspect-ratio and textarea components"
```

---

### Task 11: Table

**Files:**
- Create: `registry/base/ui/table.tsx`, `examples/table/table-demo.tsx`, `docs/components/table.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`.
- Produces: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`.

- [ ] **Step 1: Write registry/base/ui/table.tsx**

```tsx
import * as React from "react";

import { cn } from "@/registry/base/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-10 px-2 text-left align-middle font-medium text-foreground whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      className={cn("p-2 align-middle whitespace-nowrap", className)}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};
```

- [ ] **Step 2: Demo, docs, registry item, verify, commit**

Demo: a three-row invoice table using Header/Body/Footer with a caption. Docs per the Task 3 template documenting the eight parts. Registry item per the Task 3 Step 5 pattern.

```bash
pnpm typecheck && pnpm check:registry && pnpm build:registry
pnpm dev
git add -A
git commit -m "feat(registry): add table component"
```

---

### Task 12: Breadcrumb and Pagination

**Files:**
- Create: `registry/base/ui/breadcrumb.tsx`, `registry/base/ui/pagination.tsx`, `examples/breadcrumb/breadcrumb-demo.tsx`, `examples/pagination/pagination-demo.tsx`, `docs/components/breadcrumb.mdx`, `docs/components/pagination.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`, `buttonVariants` from `@/registry/base/ui/button` (pagination only).
- Produces: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`; `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink` (`isActive?: boolean`, `size?`), `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`.

- [ ] **Step 1: Write registry/base/ui/breadcrumb.tsx**

```tsx
import * as React from "react";

import { cn } from "@/registry/base/lib/utils";

function Breadcrumb(props: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

function BreadcrumbLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <span>/</span>}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      …<span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
```

- [ ] **Step 2: Write registry/base/ui/pagination.tsx**

```tsx
import * as React from "react";

import { cn } from "@/registry/base/lib/utils";
import { buttonVariants } from "@/registry/base/ui/button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem(props: React.ComponentProps<"li">) {
  return <li {...props} />;
}

type PaginationLinkProps = React.ComponentProps<"a"> & {
  isActive?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
};

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({ variant: isActive ? "outline" : "ghost", size }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5", className)}
      {...props}
    >
      <span>‹</span>
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <span>›</span>
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      …<span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
```

- [ ] **Step 3: Demos, docs, registry items, verify, commit**

Demos: a three-level breadcrumb (Home / Components / Breadcrumb with `BreadcrumbPage` last); pagination with Previous, pages 1–3 (2 active), ellipsis, Next. Docs per the Task 3 template. Registry items per the Task 3 Step 5 pattern — **pagination's `registryDependencies` includes both the utils and button URLs** (it imports `buttonVariants`).

```bash
pnpm typecheck && pnpm check:registry && pnpm build:registry
pnpm dev
git add -A
git commit -m "feat(registry): add breadcrumb and pagination components"
```

---

### Task 13: Avatar

**Files:**
- Create: `registry/base/ui/avatar.tsx`, `examples/avatar/avatar-demo.tsx`, `docs/components/avatar.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`; Base UI `Avatar` (parts: `Root`, `Image`, `Fallback`).
- Produces: `Avatar`, `AvatarImage`, `AvatarFallback`.

- [ ] **Step 1: Write registry/base/ui/avatar.tsx**

```tsx
"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";

import { cn } from "@/registry/base/lib/utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
```

- [ ] **Step 2: Demo, docs, registry item, verify, commit**

Demo: one avatar with a real image URL (`https://github.com/shadcn.png`) and one that renders its fallback initials. Docs per the Task 3 template, linking to the Base UI Avatar page and noting the `Fallback` `delay` prop. Registry item per the Task 3 Step 5 pattern with `dependencies: ["@base-ui/react"]`.

```bash
pnpm typecheck && pnpm check:registry && pnpm build:registry
pnpm dev   # confirm image case AND fallback case render
git add -A
git commit -m "feat(registry): add avatar component"
```

---

### Task 14: Progress

**Files:**
- Create: `registry/base/ui/progress.tsx`, `examples/progress/progress-demo.tsx`, `docs/components/progress.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`; Base UI `Progress` (parts: `Root`, `Label`, `Track`, `Indicator`, `Value`; Root takes `value: number | null`, `min`, `max`).
- Produces: `Progress` (single wrapper exposing `value`, plus `className`).

- [ ] **Step 1: Check Indicator sizing on base-ui.com/react/components/progress**

Confirm whether `Progress.Indicator` sizes itself from `value` or expects CSS. Adapt Step 2's Indicator className to match the documented styling demo if it differs.

- [ ] **Step 2: Write registry/base/ui/progress.tsx**

```tsx
"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";

import { cn } from "@/registry/base/lib/utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root value={value} {...props}>
      <ProgressPrimitive.Track
        className={cn(
          "relative block h-2 w-full overflow-hidden rounded-full bg-primary/20",
          className,
        )}
      >
        <ProgressPrimitive.Indicator className="block h-full bg-primary transition-all" />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  );
}

export { Progress };
```

- [ ] **Step 3: Demo, docs, registry item, verify, commit**

Demo: a client component animating `value` from 10 to 80 with a `React.useEffect` timeout, proving preview interactivity:

```tsx
"use client";

import * as React from "react";

import { Progress } from "@/registry/base/ui/progress";

export default function ProgressDemo() {
  const [value, setValue] = React.useState(10);

  React.useEffect(() => {
    const timer = setTimeout(() => setValue(80), 600);
    return () => clearTimeout(timer);
  }, []);

  return <Progress value={value} className="w-full max-w-sm" />;
}
```

Docs per the Task 3 template linking to the Base UI Progress page (note `value={null}` renders indeterminate). Registry item per the Task 3 Step 5 pattern with `dependencies: ["@base-ui/react"]`.

```bash
pnpm typecheck && pnpm check:registry && pnpm build:registry
pnpm dev   # confirm the bar animates on load
git add -A
git commit -m "feat(registry): add progress component"
```

---

### Task 15: Docs shell — installation, theming, navigation

**Files:**
- Create: `docs/installation.mdx`, `docs/theming.mdx`, `README.md`
- Modify: `docs/index.mdx`, `blume.config.ts`

**Interfaces:**
- Consumes: the full set of Wave 1 component pages.

- [ ] **Step 1: Write docs/installation.mdx**

```mdx
---
title: Installation
description: Configure the SevenUI registry in your project.
---

SevenUI requires a project already set up with the shadcn CLI and
Tailwind CSS v4. Run `npx shadcn@latest init` first if you have not.

## Configure the registry

Add the registry to your `components.json`:

```json
{
  "registries": {
    "@sevenui": "https://sevenui.dev/r/{name}.json"
  }
}
```

## Add components

```bash
npx shadcn@latest add @sevenui/button
```

Components install as source files under your `ui` alias. Direct URLs
work without the namespace config:

```bash
npx shadcn@latest add https://sevenui.dev/r/button.json
```
```

- [ ] **Step 2: Write docs/theming.mdx**

```mdx
---
title: Theming
description: SevenUI components follow your shadcn theme.
---

SevenUI components style themselves with the standard shadcn CSS
variables (`--background`, `--primary`, `--radius`, ...). If your
project already has a shadcn theme, components adapt to it with no
extra setup.

Starting fresh? Install the default neutral tokens:

```bash
npx shadcn@latest add @sevenui/theme
```

Dark mode works through your existing `.dark` class strategy — the
variables carry both palettes.
```

- [ ] **Step 3: Update docs/index.mdx and navigation**

Extend index.mdx with a short "Why SevenUI" list (Base UI only — no Radix; drop-in shadcn compatibility; source distribution via the registry) linking to installation. In `blume.config.ts`, add sidebar navigation:

```ts
navigation: {
  sidebar: {
    items: [
      "/",
      "/installation",
      "/theming",
      {
        label: "Components",
        items: [
          "/components/alert",
          "/components/aspect-ratio",
          "/components/avatar",
          "/components/badge",
          "/components/breadcrumb",
          "/components/button",
          "/components/card",
          "/components/kbd",
          "/components/pagination",
          "/components/progress",
          "/components/separator",
          "/components/skeleton",
          "/components/spinner",
          "/components/table",
          "/components/textarea",
        ],
      },
    ],
  },
},
```

- [ ] **Step 4: Write README.md**

Short: what SevenUI is (one paragraph), install snippet (namespace config + add command), link to sevenui.dev, development section (`pnpm install`, `pnpm dev`, `pnpm build`, `pnpm test:smoke`), license note.

- [ ] **Step 5: Verify and commit**

```bash
pnpm build && pnpm preview   # click through every page; check sidebar order
git add -A
git commit -m "docs: add installation, theming, and navigation shell"
```

---

### Task 16: Deploy to sevenui.dev and verify the live registry

**Files:**
- None in-repo (Vercel dashboard) — plus any fix-up commits the live check requires.

- [ ] **Step 1: Push to GitHub**

```bash
git push -u origin main
```

Confirm the CI workflow from Task 6 passes on GitHub.

- [ ] **Step 2: Vercel setup (user does this in the dashboard)**

Import `useui/sevenui` in Vercel with: framework preset **Other**, build command `pnpm build`, output directory `dist`, Node.js 22.x. Add the `sevenui.dev` domain to the project and follow Vercel's DNS instructions at the registrar.

- [ ] **Step 3: Verify the live registry end to end**

```bash
curl -s https://sevenui.dev/r/button.json | head -c 400   # JSON, not HTML
npx shadcn@latest list https://sevenui.dev/r/registry.json || true
mkdir -p /tmp/sevenui-live-check && cd /tmp/sevenui-live-check
# same scratch-app steps as scripts/smoke-test.sh, but WITHOUT URL rewriting:
npx shadcn@latest add https://sevenui.dev/r/theme.json https://sevenui.dev/r/button.json
```

Expected: files land in the scratch app and typecheck. This closes spec assumption #4 (namespace flow live). Also verify the docs site renders at https://sevenui.dev with working previews.

- [ ] **Step 4: Tag the wave**

```bash
git tag v0.1.0 -m "wave 1: foundation components"
git push origin v0.1.0
```

---

## Deferred to later waves (explicitly NOT in this plan)

- Waves 2–5 components (form, overlay, navigation/composite, third-party wrappers) — each gets its own plan.
- Vitest setup — the spec limits unit tests to from-scratch behavior (drawer, command), none of which is in Wave 1.
- Landing page design, blocks, payments.
- `registry.json` root serving at `/r/registry.json` for `shadcn list` discovery — verify in Task 16 Step 3; if the built output lacks it, copy `registry.json` into `public/r/` as part of `build:registry` in a follow-up commit.
