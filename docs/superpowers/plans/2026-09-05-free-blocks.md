# Free Blocks (v0.6.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first free-blocks wave — 9 `registry:block` items (auth ×5, marketing ×4) in a new `packages/blocks` workspace package served under `https://sevenui.dev/r/blocks/<name>.json`, with a `/blocks` gallery and full-screen preview routes — released as v0.6.0.

**Architecture:** Blocks are multi-component compositions built ONLY from existing SevenUI components, living in `packages/blocks` with their own `registry.json` (simple names). A second `shadcn build` pass outputs into `apps/web/public/r/blocks/` — the existing 116-file `/r/*.json` output is untouched and stays byte-identical (guarded by the migration's committed parity manifest at every task boundary). The site gets a `/blocks` gallery page and a dynamic full-screen preview route (`pages/blocks/preview/[slug].astro` — Blume mounts custom pages as plain Astro files, so `getStaticPaths` works; confirmed in `node_modules/blume/docs/advanced/custom-pages.mdx`). Preview pages reuse Blume's `PageLayout` (site theme + Tailwind pipeline guaranteed) with the header hidden via page-scoped CSS — the same chrome-workaround family the landing already uses.

**Tech Stack:** Existing only: `@base-ui/react` via the registry components, Tailwind v4, shadcn CLI 4.19.1 (two build passes), Blume 1.5.3 custom pages, pnpm workspace. NO new dependencies of any kind.

**Spec:** `docs/superpowers/specs/2026-09-05-free-blocks-design.md` — read it first; its Verified Tool Facts and Open Verifications sections are load-bearing for Tasks 1–2 and 5.

## Global Constraints

- All repo content English; kebab-case file names; Conventional Commits, imperative mood; NO attribution trailers anywhere (no Co-Authored-By, no AI/model/tool names) — commits AND the PR body. See `AGENTS.md`.
- **Dependency allowlist:** blocks may use ONLY existing SevenUI components + Tailwind v4 utilities. No new npm dependencies, no icon libraries (icons are inline SVG), no `cn` unless a block genuinely needs conditional classes (plain `className` strings preferred — fewer registryDependencies). Blocks may NOT depend on other blocks.
- **Components-parity guard (every task boundary):** `diff docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256 <(cd apps/web/public/r && shasum -a 256 *.json | sort -k2)` must be EMPTY (the `*.json` glob does not descend into `blocks/` — top-level output must never change). Nothing under `packages/registry/` may be modified in this entire plan.
- **Typing rules (spec):** every block item is `type: "registry:block"`; every file entry is `type: "registry:component"` (never `registry:page` — no `app/...` target assumptions). `registryDependencies` are full URLs `https://sevenui.dev/r/<name>.json` resolving to COMPONENT registry items.
- Block sources import components via the house alias: `import { Button } from "@/registry/base/ui/button";` — the consumer-side CLI rewrites these (production-proven). A block file starts with `"use client"` ONLY if the block itself uses hooks (pricing-02); the components carry their own directives.
- **Component API cheat-sheet (verified from sources 2026-09-05):** `Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter` · `Field, FieldLabel, FieldDescription, FieldError, Fieldset, FieldsetLegend` · `Input` · `Checkbox` · `Label` · `Separator` · `Badge, badgeVariants` · `Switch` · `Tabs, TabsList, TabsTrigger, TabsContent` · `InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator` · `Button, buttonVariants` (props `variant`: default|destructive|outline|secondary|ghost|link, `size`: default|sm|lg|icon).
- Design tokens only (`bg-background`, `text-muted-foreground`, `border-input`, `bg-primary`, …) — never raw palette classes; blocks must be shadcn-theme drop-ins like the components.
- No `vh`/`svh` units inside blocks (iframe-scaled in gallery cards); fixed pixel or intrinsic heights are fine.
- Blume traps: `blume dev` islands are `client:visible`/`client:load` — hydration needs the Chrome window foregrounded at checkpoints; plain `pnpm build` refuses while dev runs (`blume build --isolated` or stop dev); non-fatal Vite dependency-scan warning at dev boot is known vendor noise. Known out-of-scope console issues: `rafThrottle is not defined`, view-transition `InvalidStateError`, preview-iframe dark-mode sync.
- Branch: `feat/blocks` off `main`, isolated worktree, ONE squash-merged PR. Run `pnpm install` after package-file changes; commit `pnpm-lock.yaml` with the task.

## Per-task verification loop ("standard verify")

```bash
pnpm install                    # only when package/workspace files changed
pnpm typecheck && pnpm check:registry && pnpm test && pnpm build && pnpm test:smoke
diff docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256 <(cd apps/web/public/r && shasum -a 256 *.json | sort -k2)
# Expected: components check "115 items", blocks count per task, vitest "14 passed",
# build/smoke exit 0, parity diff EMPTY. Curl proofs per task from a background pnpm dev.
```

Browser checks are BATCHED at Task 6 (wave-precedent). Stop dev servers cleanly (stale lock: `apps/web/.blume/dev.lock`).

---

### Task 1: Verification probe — slash-in-namespace install UX (no repo changes)

**Files:**
- Create (throwaway, outside the repo tree — use `mktemp -d`; never committed): probe registry + scratch consumer.

**Interfaces:**
- Consumes: installed `apps/web/node_modules/.bin/shadcn` (run `pnpm install` first in the worktree).
- Produces: a PASS/FAIL verdict recorded in the execution ledger. PASS = `npx shadcn add @sevenui/blocks/login-01` works → Task 5's gallery copy and Task 7's docs use the namespace form. FAIL = they use the direct-URL form `npx shadcn@latest add https://sevenui.dev/r/blocks/login-01.json` (spec fallback). Either verdict proceeds — this gates COPY, not architecture.

- [ ] **Step 1: Build a minimal nested probe registry**

```bash
W=$(mktemp -d) && mkdir -p "$W/src" "$W/serve/r/blocks"
cat > "$W/src/probe-block.tsx" <<'EOF'
export function ProbeBlock() {
  return <div>probe</div>;
}
EOF
cat > "$W/registry.json" <<'EOF'
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "probe",
  "homepage": "http://localhost:8143",
  "items": [
    {
      "name": "login-01",
      "type": "registry:block",
      "title": "Probe Login",
      "description": "Namespace slash probe.",
      "files": [{ "path": "src/probe-block.tsx", "type": "registry:component" }]
    }
  ]
}
EOF
ROOT=$(pwd)   # worktree root
"$ROOT/apps/web/node_modules/.bin/shadcn" build -c "$W" -o "$W/serve/r/blocks"
ls "$W/serve/r/blocks"    # expected: login-01.json registry.json
python3 -m http.server 8143 --directory "$W/serve" --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
```

- [ ] **Step 2: Scratch consumer with a `{name}`-template namespace**

Copy the consumer scaffold heredocs (package.json, tsconfig.json, src/globals.css, components.json) verbatim from `scripts/smoke-test.sh` into `$W/app`, then set the components.json registries entry to:

```json
"registries": { "@probe": "http://localhost:8143/r/{name}.json" }
```

Run `(cd "$W/app" && npm install --silent)`.

- [ ] **Step 3: The probe**

```bash
(cd "$W/app" && "$ROOT/apps/web/node_modules/.bin/shadcn" add --yes --overwrite @probe/blocks/login-01)
ls "$W/app/src/components/probe-block.tsx" && echo "VERDICT: PASS (slash namespace resolves)" \
  || echo "VERDICT: FAIL (use direct-URL copy per spec fallback)"
```

The mechanism under test: does the CLI expand `@probe/blocks/login-01` to `http://localhost:8143/r/blocks/login-01.json` (i.e. `{name}` = `blocks/login-01`)? Capture the CLI's error output verbatim on FAIL — if it errors on the ref format itself, that IS the FAIL evidence.

- [ ] **Step 4: Clean up and record**

```bash
kill $SRV 2>/dev/null; rm -rf "$W"
git status --porcelain   # expected: empty
```

Record the verdict + evidence in the task report/ledger. No commit.

---

### Task 2: `@sevenui/blocks` scaffold + pipeline proof with login-01

**Files:**
- Create: `packages/blocks/package.json`, `packages/blocks/tsconfig.json`, `packages/blocks/registry.json`, `packages/blocks/blocks/auth/login-01/login-01.tsx`
- Modify: `apps/web/package.json` (build:registry — second pass), `scripts/check-registry.mjs` (blocks section)

**Interfaces:**
- Consumes: existing components at `packages/registry/registry/base/ui/*` via the `@/registry/*` alias.
- Produces: the package layout, registry shape, and check conventions Tasks 3–5 extend: blocks live at `blocks/<category>/<name>/<name>.tsx`; registry items follow the canonical shape below; `scripts/check-registry.mjs` gains `BLOCKS_ROOT = "packages/blocks"` and validates blocks; build emits `apps/web/public/r/blocks/<name>.json`. check-registry's final line becomes `Registry check passed (<N> items, <M> blocks).`

- [ ] **Step 1: Package manifest and tsconfig**

`packages/blocks/package.json`:

```json
{
  "name": "@sevenui/blocks",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@base-ui/react": "^1.7.0",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.5",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "typescript": "^7.0.2"
  }
}
```

`packages/blocks/tsconfig.json` (alias reaches component sources one package over):

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
    "paths": { "@/registry/*": ["../registry/registry/*"] }
  },
  "include": ["blocks"]
}
```

(`pnpm-workspace.yaml` already globs `packages/*` — no workspace edit needed; `pnpm -r typecheck` picks the package up automatically. `publicHoistPattern` needs no additions: blocks add no SSR-externalized deps.)

- [ ] **Step 2: The first block — `blocks/auth/login-01/login-01.tsx`**

```tsx
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Field, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function Login01() {
  return (
    <div className="flex min-h-[560px] w-full items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email and password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel>Password</FieldLabel>
              <a
                href="#"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Input type="password" placeholder="••••••••" />
          </Field>
          <div className="flex items-center gap-2">
            <Checkbox id="login-01-remember" />
            <Label htmlFor="login-01-remember">Remember me</Label>
          </div>
        </CardContent>
        <CardFooter className="grid gap-3">
          <Button className="w-full">Sign in</Button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <a href="#" className="text-foreground underline-offset-4 hover:underline">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Blocks registry**

`packages/blocks/registry.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "sevenui-blocks",
  "homepage": "https://sevenui.dev",
  "items": [
    {
      "name": "login-01",
      "type": "registry:block",
      "title": "Login 01",
      "description": "Card-based login form with email, password, and remember-me.",
      "registryDependencies": [
        "https://sevenui.dev/r/button.json",
        "https://sevenui.dev/r/card.json",
        "https://sevenui.dev/r/checkbox.json",
        "https://sevenui.dev/r/field.json",
        "https://sevenui.dev/r/input.json",
        "https://sevenui.dev/r/label.json"
      ],
      "files": [
        { "path": "blocks/auth/login-01/login-01.tsx", "type": "registry:component" }
      ]
    }
  ]
}
```

- [ ] **Step 4: Second build pass**

In `apps/web/package.json`, change `build:registry` to:

```json
"build:registry": "shadcn build -c ../../packages/registry -o ../../apps/web/public/r && shadcn build -c ../../packages/blocks -o ../../apps/web/public/r/blocks"
```

(Both `-o` values resolve against their `-c` cwd — established shadcn 4.19.1 fact from the migration spec.)

- [ ] **Step 5: check-registry blocks section**

In `scripts/check-registry.mjs`: add `const BLOCKS_ROOT = "packages/blocks";` next to the existing constants, load the second registry after the first:

```js
const blocks = JSON.parse(
  readFileSync(join(BLOCKS_ROOT, "registry.json"), "utf8"),
);
```

Append this section before the final error report (reusing the existing `errors` array and `itemNames` set of COMPONENT items; `OWN_URL` is the existing regex):

```js
// ---- blocks registry ----
const blockNames = new Set();
for (const item of blocks.items) {
  const where = `block "${item.name}"`;
  if (item.type !== "registry:block") {
    errors.push(`${where}: type must be "registry:block", got "${item.type}"`);
  }
  if (blockNames.has(item.name)) errors.push(`duplicate block name "${item.name}"`);
  blockNames.add(item.name);
  for (const file of item.files ?? []) {
    if (file.type !== "registry:component") {
      errors.push(`${where}: file ${file.path} must be registry:component`);
    }
    if (!existsSync(join(BLOCKS_ROOT, file.path))) {
      errors.push(`${where}: missing file ${file.path}`);
    }
  }
  for (const dep of item.registryDependencies ?? []) {
    const match = dep.match(OWN_URL);
    if (!match) {
      errors.push(`${where}: registryDependencies must be full sevenui.dev /r/ URLs, got "${dep}"`);
    } else if (!itemNames.has(match[1])) {
      errors.push(`${where}: dependency "${match[1]}" is not a component registry item (blocks may not depend on blocks)`);
    }
  }
}
// Every block source file is registered
const registeredBlockFiles = new Set(
  blocks.items.flatMap((i) => (i.files ?? []).map((f) => f.path)),
);
for (const category of readdirSync(join(BLOCKS_ROOT, "blocks"), { withFileTypes: true })) {
  if (!category.isDirectory()) continue;
  for (const dir of readdirSync(join(BLOCKS_ROOT, "blocks", category.name), { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    for (const f of readdirSync(join(BLOCKS_ROOT, "blocks", category.name, dir.name))) {
      const p = `blocks/${category.name}/${dir.name}/${f}`;
      if (f.endsWith(".tsx") && !registeredBlockFiles.has(p)) {
        errors.push(`block file ${p} is not registered in ${BLOCKS_ROOT}/registry.json`);
      }
    }
  }
}
```

Change the final success line to:

```js
console.log(
  `Registry check passed (${registry.items.length} items, ${blocks.items.length} blocks).`,
);
```

- [ ] **Step 6: Standard verify + nested-output proof**

```bash
pnpm install
pnpm typecheck && pnpm check:registry && pnpm test && pnpm build && pnpm test:smoke
# expected: "Registry check passed (115 items, 1 blocks)." ; vitest 14 passed
diff docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256 <(cd apps/web/public/r && shasum -a 256 *.json | sort -k2)
ls apps/web/public/r/blocks/       # expected: login-01.json registry.json
node -e "const j=require('./apps/web/public/r/blocks/login-01.json'); console.log(j.type, j.files[0].path); if(!j.files[0].content.includes('CardHeader')) process.exit(1)"
```

Expected: parity diff empty; built JSON is `registry:block` with embedded content.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(blocks): scaffold @sevenui/blocks with login-01

New workspace package with its own registry; second shadcn build pass
emits /r/blocks/<name>.json without touching the components output."
```

---

### Task 3: Auth blocks — login-02, login-03, signup-01, signup-02

**Files:**
- Create: `packages/blocks/blocks/auth/login-02/login-02.tsx`, `packages/blocks/blocks/auth/login-03/login-03.tsx`, `packages/blocks/blocks/auth/signup-01/signup-01.tsx`, `packages/blocks/blocks/auth/signup-02/signup-02.tsx`
- Modify: `packages/blocks/registry.json` (four new items)

**Interfaces:**
- Consumes: Task 2's layout/conventions and check-registry rules.
- Produces: block names `login-02`, `login-03`, `signup-01`, `signup-02` — Task 5's gallery/preview reads them from `packages/blocks/registry.json`.

- [ ] **Step 1: `login-02.tsx` (split-screen)**

```tsx
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Field, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function Login02() {
  return (
    <div className="grid min-h-[640px] w-full bg-background lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to continue to your dashboard.
          </p>
          <div className="mt-8 grid gap-4">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" placeholder="you@example.com" />
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input type="password" placeholder="••••••••" />
            </Field>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="login-02-remember" />
                <Label htmlFor="login-02-remember">Remember me</Label>
              </div>
              <a
                href="#"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Button className="w-full">Sign in</Button>
            <Button variant="outline" className="w-full">
              Continue with Google
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden flex-col justify-between border-l border-border bg-muted p-10 lg:flex">
        <div className="text-lg font-semibold tracking-tight">SevenUI</div>
        <blockquote className="space-y-2">
          <p className="text-lg leading-relaxed">
            &ldquo;The fastest way we have found to ship polished, accessible
            interfaces without owning a component library.&rdquo;
          </p>
          <footer className="text-sm text-muted-foreground">
            Sofia Davis, Engineering Lead
          </footer>
        </blockquote>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `login-03.tsx` (minimal, OTP)**

```tsx
import { Button } from "@/registry/base/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";

export default function Login03() {
  return (
    <div className="flex min-h-[560px] w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-xl font-semibold tracking-tight">Sign in with a code</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We will email you a six-digit one-time code.
        </p>
        <div className="mt-8 grid gap-4 text-left">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <Field>
            <FieldLabel>One-time code</FieldLabel>
            <InputOTP maxLength={6}>
              <InputOTPGroup className="w-full justify-between">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription>Paste or type the code from your inbox.</FieldDescription>
          </Field>
          <Button className="w-full">Continue</Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `signup-01.tsx` (card)**

```tsx
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function Signup01() {
  return (
    <div className="flex min-h-[640px] w-full items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Start your 14-day free trial. No card required.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field>
            <FieldLabel>Full name</FieldLabel>
            <Input placeholder="Ada Lovelace" />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input type="password" placeholder="At least 8 characters" />
            <FieldDescription>Use 8+ characters with a mix of letters and numbers.</FieldDescription>
          </Field>
          <div className="flex items-start gap-2">
            <Checkbox id="signup-01-terms" className="mt-0.5" />
            <Label htmlFor="signup-01-terms" className="font-normal text-muted-foreground">
              I agree to the Terms of Service and Privacy Policy.
            </Label>
          </div>
        </CardContent>
        <CardFooter className="grid gap-3">
          <Button className="w-full">Create account</Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="#" className="text-foreground underline-offset-4 hover:underline">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: `signup-02.tsx` (split-screen, mirrored)**

```tsx
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Field, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function Signup02() {
  return (
    <div className="grid min-h-[640px] w-full bg-background lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-border bg-muted p-10 lg:flex">
        <div className="text-lg font-semibold tracking-tight">SevenUI</div>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li>54 accessible components, one dependency.</li>
          <li>Copy-paste source you own outright.</li>
          <li>Drop-in compatible with shadcn themes.</li>
        </ul>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Free while in beta. Upgrade whenever you are ready.
          </p>
          <div className="mt-8 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>First name</FieldLabel>
                <Input placeholder="Ada" />
              </Field>
              <Field>
                <FieldLabel>Last name</FieldLabel>
                <Input placeholder="Lovelace" />
              </Field>
            </div>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" placeholder="you@example.com" />
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input type="password" placeholder="••••••••" />
            </Field>
            <div className="flex items-start gap-2">
              <Checkbox id="signup-02-updates" className="mt-0.5" />
              <Label htmlFor="signup-02-updates" className="font-normal text-muted-foreground">
                Email me product updates. You can unsubscribe anytime.
              </Label>
            </div>
            <Button className="w-full">Create account</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Registry entries**

Append to `packages/blocks/registry.json` items (after `login-01`, keeping the file's canonical shape):

```json
{
  "name": "login-02",
  "type": "registry:block",
  "title": "Login 02",
  "description": "Split-screen login with a quote panel and social sign-in.",
  "registryDependencies": [
    "https://sevenui.dev/r/button.json",
    "https://sevenui.dev/r/checkbox.json",
    "https://sevenui.dev/r/field.json",
    "https://sevenui.dev/r/input.json",
    "https://sevenui.dev/r/label.json"
  ],
  "files": [
    { "path": "blocks/auth/login-02/login-02.tsx", "type": "registry:component" }
  ]
},
{
  "name": "login-03",
  "type": "registry:block",
  "title": "Login 03",
  "description": "Minimal passwordless login with a one-time code.",
  "registryDependencies": [
    "https://sevenui.dev/r/button.json",
    "https://sevenui.dev/r/field.json",
    "https://sevenui.dev/r/input.json",
    "https://sevenui.dev/r/input-otp.json"
  ],
  "files": [
    { "path": "blocks/auth/login-03/login-03.tsx", "type": "registry:component" }
  ]
},
{
  "name": "signup-01",
  "type": "registry:block",
  "title": "Signup 01",
  "description": "Card-based signup with name, email, password, and terms.",
  "registryDependencies": [
    "https://sevenui.dev/r/button.json",
    "https://sevenui.dev/r/card.json",
    "https://sevenui.dev/r/checkbox.json",
    "https://sevenui.dev/r/field.json",
    "https://sevenui.dev/r/input.json",
    "https://sevenui.dev/r/label.json"
  ],
  "files": [
    { "path": "blocks/auth/signup-01/signup-01.tsx", "type": "registry:component" }
  ]
},
{
  "name": "signup-02",
  "type": "registry:block",
  "title": "Signup 02",
  "description": "Split-screen signup with a product-benefits panel.",
  "registryDependencies": [
    "https://sevenui.dev/r/button.json",
    "https://sevenui.dev/r/checkbox.json",
    "https://sevenui.dev/r/field.json",
    "https://sevenui.dev/r/input.json",
    "https://sevenui.dev/r/label.json"
  ],
  "files": [
    { "path": "blocks/auth/signup-02/signup-02.tsx", "type": "registry:component" }
  ]
}
```

- [ ] **Step 6: Standard verify** — expect `(115 items, 5 blocks)`, parity diff empty, `ls apps/web/public/r/blocks` shows five block JSONs + registry.json.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(blocks): add auth blocks login-02, login-03, signup-01, signup-02"
```

---

### Task 4: Marketing blocks — hero-01, hero-02, pricing-01, pricing-02

**Files:**
- Create: `packages/blocks/blocks/marketing/hero-01/hero-01.tsx`, `packages/blocks/blocks/marketing/hero-02/hero-02.tsx`, `packages/blocks/blocks/marketing/pricing-01/pricing-01.tsx`, `packages/blocks/blocks/marketing/pricing-02/pricing-02.tsx`
- Modify: `packages/blocks/registry.json` (four new items)

**Interfaces:**
- Consumes: Task 2's conventions.
- Produces: block names `hero-01`, `hero-02`, `pricing-01`, `pricing-02` for Task 5. `pricing-02` is the wave's only stateful block (`"use client"`, Tabs-driven billing toggle).

- [ ] **Step 1: `hero-01.tsx` (centered)**

```tsx
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";

export default function Hero01() {
  return (
    <section className="w-full bg-background">
      <div className="mx-auto flex min-h-[480px] max-w-3xl flex-col items-center justify-center gap-6 px-6 py-20 text-center">
        <Badge variant="secondary">Now in public beta</Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Ship accessible interfaces in a fraction of the time
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground text-balance">
          Production-ready components and blocks you copy into your codebase
          and own outright. Built on Base UI, styled with your theme.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg">Get started</Button>
          <Button size="lg" variant="outline">
            View components
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Free and open source. No signup required.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: `hero-02.tsx` (split with visual panel)**

```tsx
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";

export default function Hero02() {
  return (
    <section className="w-full bg-background">
      <div className="mx-auto grid min-h-[480px] max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-5">
          <Badge variant="outline">Changelog — v0.6.0</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            Your design system, without the maintenance bill
          </h1>
          <p className="text-lg text-muted-foreground">
            Start from battle-tested source instead of a blank file. Every
            block is plain React and Tailwind — edit anything, ship today.
          </p>
          <div className="flex gap-3">
            <Button size="lg">Browse blocks</Button>
            <Button size="lg" variant="ghost">
              Read the docs
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="size-4"
              >
                <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>
        </div>
        <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted lg:block">
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="border-b border-r border-border/40" />
            ))}
          </div>
          <div className="absolute inset-x-10 bottom-10 rounded-lg border border-border bg-background p-4 shadow-sm">
            <div className="h-2 w-1/3 rounded bg-primary/20" />
            <div className="mt-3 h-2 w-2/3 rounded bg-muted-foreground/20" />
            <div className="mt-2 h-2 w-1/2 rounded bg-muted-foreground/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `pricing-01.tsx` (three cards)**

```tsx
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Separator } from "@/registry/base/ui/separator";

const tiers = [
  {
    name: "Hobby",
    price: "$0",
    description: "For side projects and evaluation.",
    features: ["All free components", "All free blocks", "Community support"],
    cta: "Start for free",
    variant: "outline" as const,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For teams shipping to production.",
    features: [
      "Everything in Hobby",
      "Pro blocks and templates",
      "Priority fixes",
      "Private updates feed",
    ],
    cta: "Get Pro",
    variant: "default" as const,
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For orgs with procurement needs.",
    features: ["Everything in Pro", "License review", "Invoiced billing"],
    cta: "Contact us",
    variant: "outline" as const,
    highlighted: false,
  },
];

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-4 shrink-0 text-primary"
    >
      <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Pricing01() {
  return (
    <section className="w-full bg-background px-6 py-16">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Simple pricing</h2>
        <p className="mt-2 text-muted-foreground">
          Free to start. Upgrade when the blocks pay for themselves.
        </p>
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={tier.highlighted ? "border-primary shadow-sm" : undefined}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{tier.name}</CardTitle>
                {tier.highlighted ? <Badge>Popular</Badge> : null}
              </div>
              <CardDescription>{tier.description}</CardDescription>
              <p className="pt-2 text-3xl font-semibold">
                {tier.price}
                {tier.price.startsWith("$") ? (
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / month
                  </span>
                ) : null}
              </p>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <ul className="grid gap-2.5 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant={tier.variant} className="w-full">
                {tier.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: `pricing-02.tsx` (billing toggle — the wave's only stateful block)**

```tsx
"use client";

import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/registry/base/ui/tabs";

const tiers = [
  {
    name: "Starter",
    monthly: 9,
    yearly: 90,
    description: "For individuals.",
    features: ["1 project", "Email support"],
    highlighted: false,
  },
  {
    name: "Team",
    monthly: 29,
    yearly: 290,
    description: "For growing teams.",
    features: ["Unlimited projects", "Priority support", "Shared licenses"],
    highlighted: true,
  },
  {
    name: "Business",
    monthly: 79,
    yearly: 790,
    description: "For whole orgs.",
    features: ["Everything in Team", "SSO", "Invoiced billing"],
    highlighted: false,
  },
];

export default function Pricing02() {
  const [billing, setBilling] = React.useState("monthly");
  const yearly = billing === "yearly";
  return (
    <section className="w-full bg-background px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Pricing that scales with you</h2>
        <Tabs value={billing} onValueChange={(value) => setBilling(value as string)}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly
              <Badge variant="secondary" className="ml-2">
                2 months free
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={tier.highlighted ? "border-primary shadow-sm" : undefined}
          >
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <p className="pt-2 text-3xl font-semibold">
                ${yearly ? tier.yearly : tier.monthly}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / {yearly ? "year" : "month"}
                </span>
              </p>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2.5 text-sm text-muted-foreground">
                {tier.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant={tier.highlighted ? "default" : "outline"}
                className="w-full"
              >
                Choose {tier.name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
```

NOTE for the implementer: verify the `Tabs` `onValueChange` prop name against `packages/registry/registry/base/ui/tabs.tsx` before assuming — Base UI's Tabs uses `onValueChange`; if the wrapper forwards a different name, adapt the handler (this is the one API in this plan not verified from source exports alone).

- [ ] **Step 5: Registry entries** — append to `packages/blocks/registry.json`:

```json
{
  "name": "hero-01",
  "type": "registry:block",
  "title": "Hero 01",
  "description": "Centered hero with badge, headline, and dual call-to-action.",
  "registryDependencies": [
    "https://sevenui.dev/r/badge.json",
    "https://sevenui.dev/r/button.json"
  ],
  "files": [
    { "path": "blocks/marketing/hero-01/hero-01.tsx", "type": "registry:component" }
  ]
},
{
  "name": "hero-02",
  "type": "registry:block",
  "title": "Hero 02",
  "description": "Split hero with copy on the left and a decorative panel.",
  "registryDependencies": [
    "https://sevenui.dev/r/badge.json",
    "https://sevenui.dev/r/button.json"
  ],
  "files": [
    { "path": "blocks/marketing/hero-02/hero-02.tsx", "type": "registry:component" }
  ]
},
{
  "name": "pricing-01",
  "type": "registry:block",
  "title": "Pricing 01",
  "description": "Three-tier pricing cards with a highlighted popular plan.",
  "registryDependencies": [
    "https://sevenui.dev/r/badge.json",
    "https://sevenui.dev/r/button.json",
    "https://sevenui.dev/r/card.json",
    "https://sevenui.dev/r/separator.json"
  ],
  "files": [
    { "path": "blocks/marketing/pricing-01/pricing-01.tsx", "type": "registry:component" }
  ]
},
{
  "name": "pricing-02",
  "type": "registry:block",
  "title": "Pricing 02",
  "description": "Pricing cards with a monthly/yearly billing toggle.",
  "registryDependencies": [
    "https://sevenui.dev/r/badge.json",
    "https://sevenui.dev/r/button.json",
    "https://sevenui.dev/r/card.json",
    "https://sevenui.dev/r/tabs.json"
  ],
  "files": [
    { "path": "blocks/marketing/pricing-02/pricing-02.tsx", "type": "registry:component" }
  ]
}
```

- [ ] **Step 6: Standard verify** — expect `(115 items, 9 blocks)`, parity diff empty, nine block JSONs in `apps/web/public/r/blocks/`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(blocks): add marketing blocks hero-01, hero-02, pricing-01, pricing-02"
```

---

### Task 5: `/blocks` gallery + full-screen preview routes + nav link

**Files:**
- Create: `apps/web/pages/blocks/index.astro`, `apps/web/pages/blocks/preview/[slug].astro`, `apps/web/components/block-frame.astro`
- Modify: `apps/web/pages/index.astro` (add Blocks tab), `scripts/check-registry.mjs` (preview-route rule)

**Interfaces:**
- Consumes: `packages/blocks/registry.json` (9 items) and the block components from Tasks 2–4; the landing's `PageLayout` invocation pattern (`site/logo/banner/analytics/navigation/favicon/fontCssVars/themeMode` props from `blume:data`).
- Produces: routes `/blocks` and `/blocks/preview/<name>`; `PREVIEW_HEIGHTS` map (block name → iframe px height) lives in `apps/web/pages/blocks/index.astro`. Task 6 verifies these in the browser; Task 7's docs link to `/blocks`.

- [ ] **Step 1: Reusable gallery card frame — `apps/web/components/block-frame.astro`**

```astro
---
// One gallery card: scaled live preview (iframe onto the full-screen route),
// title row, install command, and links. The iframe is inert (pointer-events
// none) — interaction happens on the preview route.
interface Props {
  name: string;
  title: string;
  description: string;
  height: number;
  sourcePath: string; // registry item files[0].path, e.g. blocks/auth/login-01/login-01.tsx
}
const { name, title, description, height, sourcePath } = Astro.props;
const installCommand = `npx shadcn@latest add https://sevenui.dev/r/blocks/${name}.json`;
const sourceUrl = `https://github.com/useui/sevenui/blob/main/packages/blocks/${sourcePath}`;
---

<article class="flex flex-col gap-3">
  <a
    href={`/blocks/preview/${name}`}
    class="group relative block overflow-hidden rounded-xl border border-border bg-background"
    aria-label={`Open ${title} full-screen preview`}
  >
    <iframe
      src={`/blocks/preview/${name}`}
      title={`${title} preview`}
      loading="lazy"
      style={`height: ${height}px`}
      class="pointer-events-none w-full"
    ></iframe>
    <span
      class="absolute inset-0 hidden items-end justify-end p-3 group-hover:flex"
    >
      <span class="rounded-md border border-border bg-background px-2 py-1 text-xs">
        Open preview
      </span>
    </span>
  </a>
  <div class="flex items-start justify-between gap-4">
    <div>
      <h3 class="text-sm font-medium">{title}</h3>
      <p class="text-sm text-muted-foreground">{description}</p>
    </div>
    <a
      href={sourceUrl}
      rel="noopener noreferrer"
      class="shrink-0 text-sm text-muted-foreground underline-offset-4 hover:underline"
    >
      Source
    </a>
  </div>
  <code
    class="block overflow-x-auto rounded-md border border-border bg-muted px-3 py-2 text-xs"
  >{installCommand}</code>
</article>
```

(If Task 1's verdict was PASS, Task 7 upgrades `installCommand` here and in the docs to `npx shadcn@latest add @sevenui/blocks/${name}` — leave the direct-URL form for now; it works regardless.)

- [ ] **Step 2: The gallery — `apps/web/pages/blocks/index.astro`**

```astro
---
import PageLayout from "blume/components/layout/PageLayout.astro";
import data from "blume:data";
import BlockFrame from "../../components/block-frame.astro";
import blocksRegistry from "../../../../packages/blocks/registry.json";

const { config } = data;

const navigation = {
  ...data.navigation,
  tabs: [
    { label: "Docs", path: "/docs", href: "/docs" },
    {
      label: "Components",
      path: "/docs/components",
      href: "/docs/components/button",
    },
    { label: "Blocks", path: "/blocks", href: "/blocks" },
  ],
};

const PREVIEW_HEIGHTS: Record<string, number> = {
  "login-01": 560,
  "login-02": 640,
  "login-03": 560,
  "signup-01": 640,
  "signup-02": 640,
  "hero-01": 480,
  "hero-02": 480,
  "pricing-01": 720,
  "pricing-02": 760,
};

const CATEGORIES = [
  { id: "auth", label: "Authentication", match: (name: string) => name.startsWith("login") || name.startsWith("signup") },
  { id: "marketing", label: "Marketing", match: (name: string) => name.startsWith("hero") || name.startsWith("pricing") },
];

const sections = CATEGORIES.map((category) => ({
  ...category,
  items: blocksRegistry.items.filter((item) => category.match(item.name)),
}));
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
  page={{ title: "Blocks — SevenUI" }}
>
  <div class="mx-auto max-w-6xl px-6 py-12">
    <header class="max-w-2xl">
      <h1 class="text-3xl font-semibold tracking-tight">Blocks</h1>
      <p class="mt-2 text-muted-foreground">
        Ready-made sections composed from SevenUI components. Copy them into
        your project with one command — the source is yours.
      </p>
    </header>
    {sections.map((section) => (
      <section class="mt-12">
        <h2 class="text-xl font-semibold tracking-tight">{section.label}</h2>
        <div class="mt-6 grid gap-10">
          {section.items.map((item) => (
            <BlockFrame
              name={item.name}
              title={item.title}
              description={item.description}
              height={PREVIEW_HEIGHTS[item.name] ?? 560}
              sourcePath={item.files[0].path}
            />
          ))}
        </div>
      </section>
    ))}
  </div>
</PageLayout>
```

- [ ] **Step 3: Full-screen preview route — `apps/web/pages/blocks/preview/[slug].astro`**

```astro
---
// Full-screen block render: iframe source for the gallery and a shareable
// URL. PageLayout guarantees the site theme + Tailwind pipeline; the header
// is hidden with page-scoped CSS (same chrome-workaround family as the
// landing) so the block renders edge-to-edge.
import PageLayout from "blume/components/layout/PageLayout.astro";
import data from "blume:data";
import blocksRegistry from "../../../../../packages/blocks/registry.json";

import Login01 from "../../../../../packages/blocks/blocks/auth/login-01/login-01";
import Login02 from "../../../../../packages/blocks/blocks/auth/login-02/login-02";
import Login03 from "../../../../../packages/blocks/blocks/auth/login-03/login-03";
import Signup01 from "../../../../../packages/blocks/blocks/auth/signup-01/signup-01";
import Signup02 from "../../../../../packages/blocks/blocks/auth/signup-02/signup-02";
import Hero01 from "../../../../../packages/blocks/blocks/marketing/hero-01/hero-01";
import Hero02 from "../../../../../packages/blocks/blocks/marketing/hero-02/hero-02";
import Pricing01 from "../../../../../packages/blocks/blocks/marketing/pricing-01/pricing-01";
import Pricing02 from "../../../../../packages/blocks/blocks/marketing/pricing-02/pricing-02";

export function getStaticPaths() {
  return blocksRegistry.items.map((item) => ({ params: { slug: item.name } }));
}

const BLOCKS: Record<string, any> = {
  "login-01": Login01,
  "login-02": Login02,
  "login-03": Login03,
  "signup-01": Signup01,
  "signup-02": Signup02,
  "hero-01": Hero01,
  "hero-02": Hero02,
  "pricing-01": Pricing01,
  "pricing-02": Pricing02,
};

const { slug } = Astro.params;
const item = blocksRegistry.items.find((entry) => entry.name === slug);
const Block = BLOCKS[slug!];
const { config } = data;
---

<PageLayout
  site={{ title: config.title, description: config.description }}
  logo={config.logo}
  banner={config.banner}
  analytics={config.analytics}
  navigation={data.navigation}
  favicon={config.favicon}
  fontCssVars={data.fontCssVars}
  themeMode={config.theme.mode}
  page={{ title: `${item?.title ?? slug} — SevenUI Blocks` }}
>
  <Block client:load />
</PageLayout>

<style is:global>
  /* Chromeless render: this page is an iframe source. */
  header {
    display: none !important;
  }
  main {
    padding: 0 !important;
  }
</style>
```

- [ ] **Step 4: Blocks tab on the landing** — in `apps/web/pages/index.astro`, extend the `tabs` array:

```ts
  tabs: [
    { label: "Docs", path: "/docs", href: "/docs" },
    {
      label: "Components",
      path: "/docs/components",
      href: "/docs/components/button",
    },
    { label: "Blocks", path: "/blocks", href: "/blocks" },
  ],
```

- [ ] **Step 5: check-registry preview-route rule** — in `scripts/check-registry.mjs`, inside the blocks section (after the per-item loop), add:

```js
if (!existsSync("apps/web/pages/blocks/preview/[slug].astro")) {
  errors.push("blocks preview route apps/web/pages/blocks/preview/[slug].astro is missing");
}
```

(The dynamic route covers every block via `getStaticPaths`; a per-name file check would be redundant.)

- [ ] **Step 6: Standard verify + route proofs**

Standard verify, then background `pnpm dev` and:

```bash
curl -s http://localhost:<port>/blocks | grep -c "login-01"          # gallery lists blocks (non-zero)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:<port>/blocks/preview/login-01   # 200
curl -s http://localhost:<port>/blocks/preview/hero-01 | grep -c "Ship accessible"          # SSR content present
```

Also `pnpm build` output check: `ls apps/web/dist/blocks/preview/ | wc -l` → 9 route dirs. Stop dev cleanly.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(web): add blocks gallery and full-screen preview routes"
```

---

### Task 6: CHECKPOINT — batched browser verification

**Files:** none (defects are fixed by amending the responsible Task 2–5 commit and re-running its verify).

- [ ] **Step 1:** `pnpm dev` in background; bring Chrome to the foreground (blocks hydrate via `client:load`, but the gallery's lazy iframes still need a visible window). `tabs_context_mcp` first, new tab.
- [ ] **Step 2: Gallery (`/blocks`)** — two category sections render (Authentication ×5, Marketing ×4); each card shows a live preview iframe (not blank), install command, Source link; "Blocks" tab is active in the header; landing (`/`) header now shows the Blocks tab too.
- [ ] **Step 3: Auth previews** — open `/blocks/preview/login-01`: card centered, no site header, inputs/checkbox interactive; `/blocks/preview/login-03`: type into the OTP slots — focus moves per digit; spot-check `signup-02` at a narrow window width (single-column stack, muted panel hidden).
- [ ] **Step 4: Marketing previews** — `/blocks/preview/pricing-02`: click Yearly → all three prices switch to yearly values and the suffix reads "/ year"; `/blocks/preview/hero-02`: decorative panel grid renders.
- [ ] **Step 5: Dark mode** — on the gallery, toggle the site theme: page chrome recolors AND the iframes' block content recolors (previews inherit `themeMode: system`+localStorage; if iframes do NOT follow the toggle, record it — compare against the docs-preview iframes' KNOWN dark-mode sync limitation before calling it a defect; matching the known limitation = note, not a blocker).
- [ ] **Step 6:** `read_console_messages` — nothing new beyond the known set (`rafThrottle`, view-transition `InvalidStateError`, Vite scan warning at boot).
- [ ] **Step 7:** Report findings; fix + amend the responsible commit if needed; re-verify; stop the dev server.

---

### Task 7: Smoke-test extension + installation docs

**Files:**
- Modify: `scripts/smoke-test.sh` (serve nested blocks, install one, assert), `apps/web/docs/installation.mdx` (Blocks section)

**Interfaces:**
- Consumes: Task 1's ledger verdict (PASS → namespace copy; FAIL → direct-URL copy) and Task 5's gallery card `installCommand`.
- Produces: CI-guarded consumer proof of the nested URL scheme.

- [ ] **Step 1: Serve the blocks output in the smoke sandbox** — in `scripts/smoke-test.sh`, the local-registry loop currently rewrites `"$ROOT"/apps/web/public/r/*.json` into `$WORK/registry/`. Add the nested pass right after it:

```bash
mkdir -p "$WORK/registry/blocks"
for f in "$ROOT"/apps/web/public/r/blocks/*.json; do
  sed "s|https://sevenui.dev/r/|http://localhost:$PORT/|g" "$f" \
    > "$WORK/registry/blocks/$(basename "$f")"
done
```

(Block dep URLs point at `https://sevenui.dev/r/<component>.json` → rewritten to the local flat files, which the server already hosts; the block itself is fetched from `/blocks/login-01.json`.)

- [ ] **Step 2: Install a block and assert** — append `"http://localhost:$PORT/blocks/login-01.json"` to the existing `shadcn add` list, and after the existing assertions add:

```bash
# Blocks contract: block file lands in components/, its registryDependencies
# chain pulls the component files.
test -f "$APP/src/components/login-01.tsx" || { echo "login-01.tsx missing" >&2; exit 1; }
test -f "$APP/src/components/ui/card.tsx" || { echo "card.tsx (block dep) missing" >&2; exit 1; }
grep -q 'from "@/components/ui/card"' "$APP/src/components/login-01.tsx" \
  || { echo "block import not rewritten to consumer alias" >&2; exit 1; }
```

Also extend the consumer usage file (the `tsc` gate) with the block import so the installed block compiles:

```tsx
import Login01 from "@/components/login-01";
```

and reference it in the usage JSX (e.g. `<Login01 />`) alongside the existing components, matching the file's current pattern.

- [ ] **Step 3: Docs — `apps/web/docs/installation.mdx`** — append a `## Blocks` section (adjust the install command to Task 1's ledger verdict; direct-URL variant shown):

```mdx
## Blocks

Blocks are ready-made sections — login forms, heroes, pricing tables —
composed entirely from SevenUI components. They live under a tiered path:
components at `/r/<name>.json`, blocks at `/r/blocks/<name>.json`.

Browse them at [sevenui.dev/blocks](https://sevenui.dev/blocks), then install:

```bash
npx shadcn@latest add https://sevenui.dev/r/blocks/login-01.json
```

The block file lands in your `components/` directory and its component
dependencies land in `components/ui/` — wire the block into your own page
or router; blocks never assume a framework-specific file layout.
```

If Task 1's verdict was PASS, use `npx shadcn@latest add @sevenui/blocks/login-01` as the primary command (with the direct URL as a secondary note), and make the same swap in `apps/web/components/block-frame.astro`'s `installCommand`.

- [ ] **Step 4: Standard verify** (smoke now proves the block contract) **and commit**

```bash
git add -A
git commit -m "test(smoke): install a block through the nested registry path

Also document blocks installation and align the gallery install command
with the verified namespace behavior."
```

---

### Task 8: Release prep — changelog, versions, AGENTS

**Files:**
- Modify: `CHANGELOG.md`, `apps/web/blume.config.ts` (versions block), `AGENTS.md`

- [ ] **Step 1: CHANGELOG.md** — insert under `# Changelog` (above the monorepo-restructure section):

```markdown
## v0.6.0 — Free blocks wave

First blocks release: 9 ready-made sections in two categories —
authentication (login-01/02/03, signup-01/02) and marketing (hero-01/02,
pricing-01/02) — served under the new tiered path /r/blocks/<name>.json
from the new packages/blocks workspace package. The site gains a /blocks
gallery with full-screen previews. Component registry output is untouched
and byte-identical; the smoke test now installs a block end to end.
```

- [ ] **Step 2: blume.config.ts versions** — in `apps/web/blume.config.ts`:

```ts
  versions: {
    current: { label: "v0.6.0", badge: "Latest" },
    archived: [
      { id: "v0.5.0", label: "v0.5.0" },
      { id: "v0.4.0", label: "v0.4.0" },
      { id: "v0.3.0", label: "v0.3.0" },
      { id: "v0.2.0", label: "v0.2.0" },
      { id: "v0.1.0", label: "v0.1.0" },
    ],
  },
```

(Config entries only — consistent with existing practice; no snapshot dirs are cut.)

- [ ] **Step 3: AGENTS.md** — in the repo-layout bullet, after the `packages/registry` sentence, insert:

```markdown
`packages/blocks` (`@sevenui/blocks`) holds free blocks — multi-component sections with their own `registry.json`, built in a second shadcn pass to `/r/blocks/<name>.json`; blocks compose existing components only and never depend on other blocks.
```

And in the project paragraph, update "then paid blocks/templates on top" context if stale (free blocks now shipped; paid remains the next phase). Add the spec to the doc list:

```markdown
- Free blocks spec: `docs/superpowers/specs/2026-09-05-free-blocks-design.md`
```

- [ ] **Step 4: Standard verify (quick: typecheck + check:registry + build) and commit**

```bash
git add CHANGELOG.md apps/web/blume.config.ts AGENTS.md
git commit -m "docs(release): prepare v0.6.0 free blocks release"
```

---

### Task 9: PR, merge (HUMAN), and post-merge deploy verification

**Files:** none in-repo (PR + production).

**Interfaces:**
- Consumes: all prior tasks; the migration's committed parity manifest.
- Produces: v0.6.0 live: `/r/blocks/*.json` served, components parity intact, gallery live, tag pushed.

- [ ] **Step 1: Read-only re-verification gate** — clean `git status`; full standard verify + parity diff; `git log main..HEAD --oneline` all conventional/English/no trailers; `git diff main --stat` shows NO changes under `packages/registry/`.

- [ ] **Step 2: Push + PR** — `git push -u origin feat/blocks`; `gh pr create` titled `feat(blocks): free blocks wave (v0.6.0)`, body: spec link, block list, parity statement (components output untouched — empty manifest diff), smoke evidence, browser-checkpoint summary. Plain body, no attribution.

- [ ] **Step 3 (HUMAN): Review + squash-merge.** No Vercel settings change is needed this time (same project, same root). Production build runs automatically.

- [ ] **Step 4: Post-merge verification** — after the production deploy is Ready:

```bash
# Components parity still holds on live (the headline guard):
fail=0
while read -r hash file; do
  actual=$(curl -fsSL "https://sevenui.dev/r/$file" | shasum -a 256 | cut -d" " -f1)
  [ "$actual" = "$hash" ] || { echo "MISMATCH $file"; fail=1; }
done < docs/superpowers/plans/2026-09-05-monorepo-r-baseline.sha256
[ "$fail" = 0 ] && echo "COMPONENTS PARITY OK (116 files)"

# Blocks served:
for name in login-01 login-02 login-03 signup-01 signup-02 hero-01 hero-02 pricing-01 pricing-02; do
  printf "%s -> " "$name"
  curl -s -o /dev/null -w "%{http_code}\n" "https://sevenui.dev/r/blocks/$name.json"
done   # expected: all 200
curl -s -o /dev/null -w "gallery: %{http_code}\n" "https://sevenui.dev/blocks"
curl -s -o /dev/null -w "preview: %{http_code}\n" "https://sevenui.dev/blocks/preview/login-01"
```

- [ ] **Step 5: Live consumer install** — scratch consumer (smoke-test scaffold, live URLs): `npx --yes shadcn@latest add --yes --overwrite https://sevenui.dev/r/blocks/login-01.json` → block + dep chain land, `npx tsc --noEmit` exits 0. If Task 1's verdict was PASS, ALSO verify `npx shadcn@latest add @sevenui/blocks/login-01` (with the `@sevenui` namespace configured as `https://sevenui.dev/r/{name}.json`) installs identically — this is the namespace claim the docs make.
- [ ] **Step 6: Live browser pass** — gallery renders on production, two previews spot-checked (login-01, pricing-02 toggle), console shows nothing new beyond the known set.
- [ ] **Step 7 (HUMAN or agent with push access): Tag** — on updated main: `git tag v0.6.0 && git push origin v0.6.0` (wave precedent: tag after merge).
- [ ] **Step 8: Report** — parity output, block statuses, install evidence, browser findings. The wave is complete.
