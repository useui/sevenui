#!/usr/bin/env node
// The scheduled manifest canary (Task 5.6). Web CI (.github/workflows/ci.yml)
// builds against apps/web/lib/pro-manifest.fixture.json so a bad live
// manifest can't turn pull requests red — a deliberate trade, made because
// under ISR a bad manifest no longer breaks the site (the last good page
// keeps serving). But that trade gives up the only signal that ever checked
// the live manifest's shape, and CI only ran on pull requests anyway, while
// a bad manifest can land — and stale-serve keeps quiet about it — at any
// time. This script is where that signal moved: a scheduled job
// (.github/workflows/manifest-canary.yml) that fetches the real
// pro.sevenui.dev manifest and runs the loader's real validation on it.
//
// It imports parseManifest from apps/web/lib/pro-manifest-schema.ts, NOT
// from apps/web/lib/pro-manifest.ts, and it does not reimplement the
// guards. Two reasons:
//   1. lib/pro-manifest.ts carries `import "server-only"`, a marker that
//      throws at import time outside React's react-server export
//      condition. `node --conditions=react-server` is not an escape either:
//      under that condition React itself resolves to its react-server
//      build, which has no `createContext`, and lucide-react calls
//      `createContext` at module scope — so the loader module cannot be
//      loaded from plain Node at all. (Both failure modes were measured
//      against this repo's actual dependency versions, not assumed.)
//   2. scripts/route-inventory.mjs already carries a hand-written mirror of
//      these same guards, and a mirror is exactly the thing that drifts.
//      Importing the schema module directly means this script always runs
//      the loader's actual validation, with zero duplication to drift.
//
// pro-manifest-schema.ts is deliberately import-free (see its own header)
// so it can be loaded by plain Node — including the `.ts` extension, which
// only newer Node versions strip by default; see manifest-canary.yml for
// the version this depends on and why.
//
// parseManifest's second argument is an icon-existence predicate. The real
// loader (lib/pro-manifest.ts) builds it from lucide-react's icon record;
// this script does the same via a plain `import { icons } from
// "lucide-react"` (cheap in a CI script — no tree-shaking concern here) so
// that the unknown-icon-key throw stays inside this canary's coverage. That
// throw is the one with a realistic real-world cause: a typo in a manifest
// entry from the pro repo.
//
// Source selection: defaults to the live URL. Pass a local file path as
// argv[2], or set CHECK_PRO_MANIFEST_SOURCE, to point this at a local copy
// instead (used to prove the canary actually fails on a malformed
// manifest — see .superpowers/sdd/2026-09-19-blume-to-nextjs/ for the
// deliberately-broken fixtures and the runner that exercises them). The
// scheduled workflow invokes this script with no argument and no env var
// set, so it always checks the live URL — nothing here silently changes
// that default.
import { icons } from "lucide-react";
import { parseManifest } from "../apps/web/lib/pro-manifest-schema.ts";

const LIVE_URL = "https://pro.sevenui.dev/r/pro-manifest.json";
const source = process.argv[2] ?? process.env.CHECK_PRO_MANIFEST_SOURCE ?? LIVE_URL;

async function loadRaw(src) {
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src);
    if (!res.ok) {
      throw new Error(`fetch failed (${res.status} ${res.statusText}) from ${src}`);
    }
    return res.json();
  }
  const { readFileSync } = await import("node:fs");
  return JSON.parse(readFileSync(src, "utf8"));
}

async function main() {
  console.log(`checking pro manifest from ${source}`);
  const raw = await loadRaw(source);
  parseManifest(raw, (pascalKey) => pascalKey in icons);
  console.log("pro manifest OK: groups/categories/items validated, all icon keys resolve.");
}

main().catch((err) => {
  console.error(`pro manifest canary FAILED: ${err.message}`);
  process.exit(1);
});
