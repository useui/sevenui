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
for f in "$ROOT"/public/r/*.json; do
  sed "s|https://sevenui.dev/r/|http://localhost:$PORT/|g" "$f" \
    > "$WORK/registry/$(basename "$f")"
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

# 3. Install representative items through the CLI
# Pinned to the repo's own installed binary instead of `npx --yes shadcn@latest`:
# `@latest` would re-resolve to whatever the registry serves at run time, which
# both makes the test's behavior drift out from under us and pulls an
# unreviewed package off the network on every run (supply-chain exposure).
SHADCN_BIN="$ROOT/node_modules/.bin/shadcn"
(cd "$APP" && "$SHADCN_BIN" add --yes --overwrite \
  "http://localhost:$PORT/theme.json" \
  "http://localhost:$PORT/button.json" \
  "http://localhost:$PORT/sidebar.json" \
  "http://localhost:$PORT/calendar.json" \
  "http://localhost:$PORT/chart.json")

# Wave 5 contracts: multi-file item lands the hook under the hooks alias,
# third-party deps land in the consumer package.json.
test -f "$APP/src/hooks/use-mobile.ts" || { echo "use-mobile.ts missing" >&2; exit 1; }
grep -q '"react-day-picker"' "$APP/package.json" || { echo "react-day-picker not installed" >&2; exit 1; }
grep -q '"recharts"' "$APP/package.json" || { echo "recharts not installed" >&2; exit 1; }

# 4. The installed code must typecheck in the consumer project
cat > "$APP/src/main.tsx" <<'EOF'
import { Bar, BarChart } from "recharts";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { SidebarProvider } from "@/components/ui/sidebar";

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
    </SidebarProvider>
  );
}
EOF
(cd "$APP" && npx tsc --noEmit)

echo "Smoke test passed."
