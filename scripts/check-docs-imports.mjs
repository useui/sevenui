// Guards the one invariant behind apps/web/lib/registry-imports.ts: what the
// docs show a reader must equal what `shadcn add` puts on their disk.
//
// The registry's own sources deliberately say `@/registry/<base>/ui/*` — that
// spelling is what makes the CLI's alias transform fire, and it must not be
// "fixed" there. The display layer rewrites it on the way out. A regression
// here is silent: the pages still build, the demos still run, and the only
// symptom is that every copied import points at a directory the reader does
// not have. llms.txt carries it straight into an agent's context.
//
// Both halves below carry a positive control. An "is it absent?" check that
// has no way to report a nonzero count is not measuring anything, so each
// scan is first pointed at input that MUST match before it is trusted to say
// "zero" about input that must not.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { rewriteRegistryImportPath, rewriteRegistryImports } from "../apps/web/lib/registry-imports.ts";

const errors = [];

const RAW_SPECIFIER = /@\/registry\/[A-Za-z0-9._/-]+/g;

function walk(dir, ext, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "node_modules" || entry === "dist") continue;
    if (statSync(full).isDirectory()) walk(full, ext, out);
    else if (full.endsWith(ext)) out.push(full);
  }
  return out;
}

/** Count raw `@/registry/*` specifiers across a set of files. */
function scanRaw(files) {
  let total = 0;
  const hits = [];
  for (const file of files) {
    const found = readFileSync(file, "utf8").match(RAW_SPECIFIER) ?? [];
    if (found.length > 0) hits.push(`${file} (${found.length})`);
    total += found.length;
  }
  return { total, files: hits };
}

// ---------------------------------------------------------------------------
// 1. The rewrite itself, pinned against shadcn 4.19.1's resolver cascade.
// ---------------------------------------------------------------------------

// Hardcoded rather than derived from the implementation: a table computed from
// the thing it tests passes by definition. `radix` is not a base we ship yet —
// it is here so that adding one cannot silently change what docs display.
const EXPECTED = [
  ["@/registry/base/ui/button", "@/components/ui/button"],
  ["@/registry/base/hooks/use-mobile", "@/hooks/use-mobile"],
  ["@/registry/base/lib/utils", "@/lib/utils"],
  ["@/registry/base/lib/other", "@/lib/other"],
  ["@/registry/base/components/thing", "@/components/thing"],
  ["@/registry/radix/ui/button", "@/components/ui/button"],
  ["@/registry/base/unknown/thing", "@/components/unknown/thing"],
  ["@/components/ui/button", "@/components/ui/button"],
  ["react", "react"],
];
for (const [input, want] of EXPECTED) {
  const got = rewriteRegistryImportPath(input);
  if (got !== want) errors.push(`rewrite "${input}" → "${got}", expected "${want}"`);
}

// ---------------------------------------------------------------------------
// 2. Every specifier the registry actually contains survives the rewrite.
// ---------------------------------------------------------------------------

const REGISTRY_ROOTS = ["packages/registry/demos", "packages/registry/components", "packages/registry/registry"];
for (const root of REGISTRY_ROOTS) {
  if (!existsSync(root)) errors.push(`registry root "${root}" is missing — this check no longer covers what it claims to`);
}
const registryFiles = REGISTRY_ROOTS.filter(existsSync).flatMap((root) => walk(root, ".tsx"));
const registryScan = scanRaw(registryFiles);

// POSITIVE CONTROL: the registry sources must still carry raw specifiers. If
// they do not, either the sources were wrongly rewritten at the source (which
// would break the CLI's transform) or this scanner stopped finding anything —
// and then its "zero" verdict on the mirrors below would be worthless.
if (registryScan.total === 0) {
  errors.push(
    `positive control failed: scanned ${registryFiles.length} .tsx file(s) under ` +
      `${REGISTRY_ROOTS.join(", ")} and found no "@/registry/*" specifier. Either the registry ` +
      `sources were rewritten (they must keep that spelling — the shadcn CLI's alias transform ` +
      `keys on the style segment) or this file's RAW_SPECIFIER pattern no longer matches them. ` +
      `Until this reports a nonzero count, the mirror check below proves nothing.`,
  );
}

const distinct = [...new Set(registryFiles.flatMap((f) => readFileSync(f, "utf8").match(RAW_SPECIFIER) ?? []))];
for (const specifier of distinct) {
  const rewritten = rewriteRegistryImportPath(specifier);
  if (RAW_SPECIFIER.test(rewritten)) {
    RAW_SPECIFIER.lastIndex = 0;
    errors.push(`rewrite left a registry path behind: "${specifier}" → "${rewritten}"`);
  }
  RAW_SPECIFIER.lastIndex = 0;
}

// ---------------------------------------------------------------------------
// 3. The published .md mirrors, end to end.
// ---------------------------------------------------------------------------

const MIRROR_DIR = "apps/web/public/docs";
if (!existsSync(MIRROR_DIR)) {
  errors.push(
    `${MIRROR_DIR} does not exist, so this check scanned no published page at all. ` +
      `The mirrors are generated and git-ignored: run "node scripts/build-md-mirrors.ts" ` +
      `with cwd = apps/web (or "pnpm build") before this gate.`,
  );
} else {
  const mirrors = walk(MIRROR_DIR, ".md");
  if (mirrors.length === 0) {
    errors.push(`${MIRROR_DIR} contains no .md file — this check has no domain to assert over.`);
  }
  const mirrorScan = scanRaw(mirrors);
  if (mirrorScan.total > 0) {
    errors.push(
      `${mirrorScan.total} raw "@/registry/*" path(s) in ${mirrorScan.files.length} published ` +
        `mirror(s): ${mirrorScan.files.slice(0, 5).join(", ")}${mirrorScan.files.length > 5 ? ", …" : ""}. ` +
        `Docs must show the installed path. See apps/web/lib/registry-imports.ts.`,
    );
  }

  // POSITIVE CONTROL for the mirror scan: hand it a page-shaped string that
  // does carry a raw path and confirm it is reported. Without this, a scanner
  // that silently matched nothing would look identical to a clean repo.
  const canary = 'import { Button } from "@/registry/base/ui/button";';
  if ((canary.match(RAW_SPECIFIER) ?? []).length !== 1) {
    errors.push("positive control failed: the mirror scanner did not flag a known-bad import line.");
  }
  if (rewriteRegistryImports(canary) !== 'import { Button } from "@/components/ui/button";') {
    errors.push("positive control failed: rewriteRegistryImports() did not fix a known-bad import line.");
  }

  if (errors.length === 0) {
    console.log(
      `check-docs-imports: ok (${registryScan.total} raw specifier(s) across ${registryFiles.length} ` +
        `registry source(s) → 0 across ${mirrors.length} published mirror(s))`,
    );
  }
}

if (errors.length > 0) {
  console.error(`check-docs-imports: ${errors.length} problem(s)\n` + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
