#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT=8137
if lsof -ti "tcp:$PORT" >/dev/null 2>&1; then
  echo "port $PORT busy" >&2
  exit 1
fi
WORK="$(mktemp -d)"

cleanup() {
  # Kill by PID first, then by port as a fallback: a backgrounded
  # `(cd X && cmd) &` can hand back the wrong PID for `cmd` (see comment
  # below), so PID-only cleanup can silently leave the server running.
  kill "${SERVER_PID:-}" 2>/dev/null || true
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti "tcp:$PORT" 2>/dev/null | xargs -r kill 2>/dev/null || true
  fi
  rm -rf "$WORK"
}
trap cleanup EXIT

# 1. Local registry with URLs rewritten to localhost
mkdir -p "$WORK/registry"
for f in "$ROOT"/apps/web/public/r/*.json; do
  sed "s|https://sevenui.dev/r/|http://localhost:$PORT/|g" "$f" \
    > "$WORK/registry/$(basename "$f")"
done
mkdir -p "$WORK/registry/demo"
for f in "$ROOT"/apps/web/public/r/demo/*.json; do
  sed "s|https://sevenui.dev/r/|http://localhost:$PORT/|g" "$f" \
    > "$WORK/registry/demo/$(basename "$f")"
done
mkdir -p "$WORK/registry/component"
for f in "$ROOT"/apps/web/public/r/component/*.json; do
  sed "s|https://sevenui.dev/r/|http://localhost:$PORT/|g" "$f" \
    > "$WORK/registry/component/$(basename "$f")"
done
mkdir -p "$WORK/registry/ui-sdk"
for f in "$ROOT"/apps/web/public/r/ui-sdk/*.json; do
  sed "s|https://sevenui.dev/r/|http://localhost:$PORT/|g" "$f" \
    > "$WORK/registry/ui-sdk/$(basename "$f")"
done
for ns in demo component; do
  mkdir -p "$WORK/registry/ui-sdk/$ns"
  for f in "$ROOT"/apps/web/public/r/ui-sdk/$ns/*.json; do
    sed "s|https://sevenui.dev/r/|http://localhost:$PORT/|g" "$f" \
      > "$WORK/registry/ui-sdk/$ns/$(basename "$f")"
  done
done
# Use --directory instead of `(cd ... && python3 ...) &` so that $! is the
# actual server PID. A backgrounded `(cd X && cmd) &` runs cmd inside a
# subshell wrapper process; on this machine the subshell PID and the python3
# PID diverged, so `kill "$SERVER_PID"` killed the wrapper and left the real
# http.server process (and its port) alive after the script exited.
python3 -m http.server "$PORT" --directory "$WORK/registry" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER_PID=$!
disown "$SERVER_PID" 2>/dev/null || true # suppress the shell's "Terminated" job notice on cleanup
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

# 2b. Stock-shadcn token proof: a second project seeded with a stock shadcn
# theme. Snapshot it before installing so we can prove v2 tokens are additive.
TOK="$WORK/app-tokens"
cp -R "$APP" "$TOK"
cat > "$TOK/src/styles.css" <<'EOF'
@import "tailwindcss";

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --border: oklch(1 0 0 / 10%);
  --ring: oklch(0.556 0 0);
}
EOF
# Stock variable declarations as "<block> <name>: <value>;" lines so :root and
# .dark values are compared separately. Only the stock names are extracted.
STOCK_NAMES='background|foreground|primary|primary-foreground|border|ring|radius'
stock_decls() {
  awk -v names="^(${STOCK_NAMES})$" '
    /^[^ ].*\{/ { block=$1 }
    /^}/ { block="" }
    block != "" && /^  --[a-z-]+: .*;$/ {
      n=$1; sub(/^--/, "", n); sub(/:$/, "", n)
      if (n ~ names) print block " " $0
    }' "$1" | sort
}
stock_decls "$TOK/src/styles.css" > "$WORK/tokens-before.txt"
test "$(wc -l < "$WORK/tokens-before.txt" | tr -d ' ')" -eq 13 \
  || { echo "stock baseline should hold 13 declarations" >&2; cat "$WORK/tokens-before.txt" >&2; exit 1; }

# 2c. UI SDK flavour project: a fresh copy, so no base primitive is present.
SDK="$WORK/app-ui-sdk"
cp -R "$APP" "$SDK"
printf '@layer ui-sdk;\n@import "tailwindcss";\n' > "$SDK/src/styles.css"

# 3. Install representative items through the CLI
# Pinned to the repo's own installed binary instead of `npx --yes shadcn@latest`:
# `@latest` would re-resolve to whatever the registry serves at run time, which
# both makes the test's behavior drift out from under us and pulls an
# unreviewed package off the network on every run (supply-chain exposure).
SHADCN_BIN="$ROOT/apps/web/node_modules/.bin/shadcn"
(cd "$APP" && "$SHADCN_BIN" add --yes --overwrite \
  "http://localhost:$PORT/theme.json" \
  "http://localhost:$PORT/button.json" \
  "http://localhost:$PORT/sidebar.json" \
  "http://localhost:$PORT/calendar.json" \
  "http://localhost:$PORT/chart.json" \
  "http://localhost:$PORT/accordion.json" \
  "http://localhost:$PORT/demo/accordion-demo.json" \
  "http://localhost:$PORT/component/accordion-01.json")

# v2 token contract: installing one primitive pulls sevenui-tokens into a
# stock shadcn project's global CSS without disturbing existing variables.
TOK_CSS="$TOK/src/styles.css"
(cd "$TOK" && "$SHADCN_BIN" add --yes --overwrite "http://localhost:$PORT/button.json")
grep -q -- '--surface-tray:' "$TOK_CSS" || { echo "--surface-tray: missing after button install" >&2; exit 1; }
grep -q '@utility focus-ring' "$TOK_CSS" || { echo "@utility focus-ring missing after button install" >&2; exit 1; }
# shadcn also writes `--surface-tray: var(--surface-tray);` into @theme inline,
# because it does not read a color-mix() value as a colour; so count the
# theme-block declarations (their value is the color-mix) and every match.
tray_values() { grep -c -- '--surface-tray: color-mix' "$TOK_CSS"; }
tray_after_one="$(grep -c -- '--surface-tray:' "$TOK_CSS")"
(cd "$TOK" && "$SHADCN_BIN" add --yes --overwrite \
  "http://localhost:$PORT/select.json" "http://localhost:$PORT/dialog.json")
# Each shared dependency installs once: --surface-tray is declared once per theme
# block (:root and .dark), never duplicated by the second install.
test "$(tray_values)" -eq 2 \
  || { echo "--surface-tray: should be declared exactly twice (:root + .dark) after select+dialog" >&2; exit 1; }
test "$(grep -c -- '--surface-tray:' "$TOK_CSS")" -eq "$tray_after_one" \
  || { echo "--surface-tray: the select+dialog install added declarations" >&2; exit 1; }
test "$(grep -c '@utility focus-ring' "$TOK_CSS")" -eq 1 \
  || { echo "@utility focus-ring should appear exactly once" >&2; exit 1; }
stock_decls "$TOK_CSS" > "$WORK/tokens-after.txt"
diff "$WORK/tokens-before.txt" "$WORK/tokens-after.txt" \
  || { echo "stock shadcn variables changed by the v2 token install" >&2; exit 1; }

# Wave 5 contracts: multi-file item lands the hook under the hooks alias,
# third-party deps land in the consumer package.json.
test -f "$APP/src/hooks/use-mobile.ts" || { echo "use-mobile.ts missing" >&2; exit 1; }
grep -q '"react-day-picker"' "$APP/package.json" || { echo "react-day-picker not installed" >&2; exit 1; }
grep -q '"recharts"' "$APP/package.json" || { echo "recharts not installed" >&2; exit 1; }

# Namespace contract: a demo item and a gallery-example item both land as
# single files under components/, and their registryDependencies chain pulls
# the shared ui primitive.
test -f "$APP/src/components/ui/accordion.tsx" || { echo "accordion.tsx (ui) missing" >&2; exit 1; }
test -f "$APP/src/components/accordion-demo.tsx" || { echo "accordion-demo.tsx (demo) missing" >&2; exit 1; }
test -f "$APP/src/components/accordion-01.tsx" || { echo "accordion-01.tsx (component) missing" >&2; exit 1; }
grep -q 'from "@/components/ui/accordion"' "$APP/src/components/accordion-demo.tsx" \
  || { echo "demo import not rewritten to consumer alias" >&2; exit 1; }

# UI SDK flavour contract: /r/ui-sdk/ items install into the same ui alias,
# their registryDependencies stay inside the flavour (dialog pulls the
# flavour button), the shared tokens still arrive, the exact UI SDK version
# lands in package.json, and the install prints the cascade-layer step.
SDK_LOG="$WORK/ui-sdk-install.log"
(cd "$SDK" && "$SHADCN_BIN" add --yes --overwrite \
  "http://localhost:$PORT/ui-sdk/dialog.json" \
  "http://localhost:$PORT/ui-sdk/dropdown-menu.json" \
  "http://localhost:$PORT/ui-sdk/select.json" \
  "http://localhost:$PORT/ui-sdk/tooltip.json" \
  "http://localhost:$PORT/ui-sdk/checkbox.json" \
  "http://localhost:$PORT/ui-sdk/badge.json") 2>&1 | tee "$SDK_LOG"
for name in button dialog dropdown-menu select tooltip checkbox badge; do
  test -f "$SDK/src/components/ui/$name.tsx" || { echo "ui-sdk $name.tsx missing" >&2; exit 1; }
done
# The items declare the exact version; npm saves it with a caret, which for a
# prerelease still only admits 0.1.0 prereleases and 0.1.x.
# The pin is exact at the source: the served items name the version with no
# range operator (npm then writes its own save prefix into the consumer's
# package.json, so that file cannot show it), and exactly that version is
# what lands in node_modules. UI SDK is a beta; a range would float across
# betas. check-registry enforces the same on the workspace and every item.
UI_SDK_PIN="$(node -p 'require(process.argv[1]).dependencies["@ui-sdk/react"]' "$ROOT/packages/registry/package.json")"
echo "$UI_SDK_PIN" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$' \
  || { echo "packages/registry/package.json pins @ui-sdk/react to \"$UI_SDK_PIN\", not an exact version" >&2; exit 1; }
for pkg in react core; do
  grep -Fq "\"@ui-sdk/$pkg@$UI_SDK_PIN\"" "$WORK/registry/ui-sdk/dialog.json" \
    || { echo "ui-sdk/dialog.json does not depend on @ui-sdk/$pkg@$UI_SDK_PIN exactly" >&2; grep -o '"@ui-sdk/[^"]*"' "$WORK/registry/ui-sdk/dialog.json" >&2; exit 1; }
  grep -Eq "\"@ui-sdk/$pkg\": \"\\^?${UI_SDK_PIN//./\\.}\"" "$SDK/package.json" \
    || { echo "@ui-sdk/$pkg $UI_SDK_PIN missing from package.json" >&2; grep ui-sdk "$SDK/package.json" >&2; exit 1; }
  installed="$(node -p 'require(process.argv[1]).version' "$SDK/node_modules/@ui-sdk/$pkg/package.json")"
  test "$installed" = "$UI_SDK_PIN" || { echo "installed @ui-sdk/$pkg is $installed, not $UI_SDK_PIN" >&2; exit 1; }
done
if grep -rhoE '"@ui-sdk/[a-z-]+@[^"0-9][^"]*"' "$WORK/registry/ui-sdk" | grep -q .; then
  echo "a served ui-sdk item names @ui-sdk/* with a range operator:" >&2
  grep -rhoE '"@ui-sdk/[a-z-]+@[^"0-9][^"]*"' "$WORK/registry/ui-sdk" | sort -u >&2; exit 1
fi
if grep -q '@base-ui/react' "$SDK/package.json"; then echo "ui-sdk install pulled @base-ui/react" >&2; exit 1; fi
grep -q '@ui-sdk/react/button' "$SDK/src/components/ui/button.tsx" || { echo "dialog did not pull the ui-sdk button" >&2; exit 1; }
grep -q 'from "@/components/ui/button"' "$SDK/src/components/ui/dialog.tsx" \
  || { echo "ui-sdk import not rewritten to consumer alias" >&2; exit 1; }
grep -q -- '--surface-tray:' "$SDK/src/styles.css" || { echo "ui-sdk install did not pull sevenui-tokens" >&2; exit 1; }
test "$(head -n 1 "$SDK/src/styles.css")" = "@layer ui-sdk;" || { echo "@layer ui-sdk; is no longer the first line" >&2; exit 1; }
# The setup message lives on one shared item (ui-sdk-setup), so a six-item
# install prints it once, not once per item and dependency.
test "$(grep -c 'cascade layer named ui-sdk' "$SDK_LOG")" -eq 1 \
  || { echo "install should print the cascade-layer step exactly once, printed $(grep -c 'cascade layer named ui-sdk' "$SDK_LOG")" >&2; exit 1; }
grep -q 'npm install --save-exact @ui-sdk/react@' "$SDK_LOG" || { echo "install did not print how to pin UI SDK" >&2; exit 1; }

# UI SDK flavour examples: /r/ui-sdk/demo/* and /r/ui-sdk/component/* land as
# single files under components/ like their base counterparts, and pull only
# flavour primitives. calendar-range and tabs-05 are variants (overlays): the
# first imports DateRange from the flavour calendar instead of
# react-day-picker, the second UI SDK's TabsIndicator instead of Base UI's.
(cd "$SDK" && "$SHADCN_BIN" add --yes --overwrite \
  "http://localhost:$PORT/ui-sdk/demo/command-demo.json" \
  "http://localhost:$PORT/ui-sdk/component/accordion-01.json" \
  "http://localhost:$PORT/ui-sdk/demo/calendar-range.json" \
  "http://localhost:$PORT/ui-sdk/component/tabs-05.json")
for name in command-demo accordion-01 calendar-range tabs-05; do
  test -f "$SDK/src/components/$name.tsx" || { echo "ui-sdk example $name.tsx missing" >&2; exit 1; }
done
grep -q 'from "@/components/ui/command"' "$SDK/src/components/command-demo.tsx" \
  || { echo "ui-sdk demo import not rewritten to consumer alias" >&2; exit 1; }
grep -q 'import type { DateRange } from "@/components/ui/calendar"' "$SDK/src/components/calendar-range.tsx" \
  || { echo "calendar-range variant does not take DateRange from the flavour calendar" >&2; exit 1; }
grep -q 'from "@ui-sdk/react/tabs"' "$SDK/src/components/tabs-05.tsx" \
  || { echo "tabs-05 variant does not use UI SDK's TabsIndicator" >&2; exit 1; }
for name in command accordion calendar tabs; do
  grep -q "@ui-sdk/react/$name" "$SDK/src/components/ui/$name.tsx" \
    || { echo "a flavour example pulled the base $name primitive" >&2; exit 1; }
done
for pkg in @base-ui/react react-day-picker react-resizable-panels embla-carousel-react; do
  if grep -q "\"$pkg\"" "$SDK/package.json"; then echo "a ui-sdk install pulled $pkg" >&2; exit 1; fi
done
if grep -rqE 'from "(@base-ui/react|react-day-picker|react-resizable-panels|embla-carousel-react)' "$SDK/src"; then
  echo "an installed ui-sdk file imports a library UI SDK replaces" >&2; exit 1
fi
cat > "$SDK/src/main.tsx" <<'EOF'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
];

// The same JSX the base flavour's examples use, Base UI-only props included.
export function App() {
  return (
    <TooltipProvider delay={0}>
      <Badge render={<a href="/new" />}>New</Badge>
      <Checkbox indeterminate onCheckedChange={(checked: boolean) => checked} />
      <Dialog onOpenChange={(open) => open}>
        <DialogTrigger render={<Button variant="outline" />}>Open</DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>Menu</DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => {}} closeOnClick={false}>
            Item
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      <Select items={fruits} defaultValue="apple">
        <SelectTrigger size="sm">
          <SelectValue placeholder="Fruit" />
        </SelectTrigger>
        <SelectContent side="inline-end">
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            {fruits.map((fruit) => (
              <SelectItem key={fruit.value} value={fruit.value}>
                {fruit.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Tooltip>
        <TooltipTrigger delay={0} render={<Button size="icon" />}>
          ?
        </TooltipTrigger>
        <TooltipContent side="inline-start">Help</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
EOF
(cd "$SDK" && npx tsc --noEmit)

# 4. The installed code must typecheck in the consumer project
cat > "$APP/src/main.tsx" <<'EOF'
import { Bar, BarChart } from "recharts";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { SidebarProvider } from "@/components/ui/sidebar";
import AccordionDemo from "@/components/accordion-demo";
import Accordion01 from "@/components/accordion-01";

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function App() {
  return (
    <SidebarProvider>
      <Button variant="outline">ok</Button>
      <Calendar mode="single" />
      <ChartContainer config={config}>
        <BarChart data={[{ month: "Jan", desktop: 1 }]}>
          <Bar dataKey="desktop" />
        </BarChart>
      </ChartContainer>
      <AccordionDemo />
      <Accordion01 />
    </SidebarProvider>
  );
}
EOF
(cd "$APP" && npx tsc --noEmit)

echo "Smoke test passed."
