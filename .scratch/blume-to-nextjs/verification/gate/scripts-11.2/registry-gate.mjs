#!/usr/bin/env node
// Task 11.2 Step 1 gate: §17.4's registry byte-identity, with §17.6 #29's
// three exceptions ASSERTED rather than skipped (Ruling 107).
// Usage: node registry-gate.mjs <branch-r-dir> <main-r-dir> [out.json]
import fs from "node:fs";
import path from "node:path";

const [A, B, OUT] = process.argv.slice(2);
const DIRECTIVE = '"use client";\n\n';
const EXCEPTIONS = ["demo/chart-demo.json", "demo/chart-line.json", "demo/field-validation.json"];

const walk = (root, base = "") =>
  fs
    .readdirSync(path.join(root, base), { withFileTypes: true })
    .flatMap((e) => {
      const rel = base ? `${base}/${e.name}` : e.name;
      return e.isDirectory() ? walk(root, rel) : [rel];
    })
    .sort();

const results = [];
const record = (name, ok, detail) => results.push({ name, ok, detail });

const a = walk(A);
const b = walk(B);
const sa = new Set(a);
const sb = new Set(b);
record("fileset.equal", a.length === b.length && a.every((f) => sb.has(f)), {
  branch: a.length,
  main: b.length,
  onlyBranch: a.filter((f) => !sb.has(f)),
  onlyMain: b.filter((f) => !sa.has(f)),
});

const differing = [];
const identical = [];
for (const f of a.filter((f) => sb.has(f))) {
  const x = fs.readFileSync(path.join(A, f));
  const y = fs.readFileSync(path.join(B, f));
  (x.equals(y) ? identical : differing).push(f);
}
const unexpected = differing.filter((f) => !EXCEPTIONS.includes(f));
record("nonexception.byteIdentical", unexpected.length === 0, {
  identical: identical.length,
  differing: differing.length,
  unexpected,
});

for (const f of EXCEPTIONS) {
  if (!sa.has(f) || !sb.has(f)) {
    record(`exception.${f}`, false, "missing on one side");
    continue;
  }
  const ta = fs.readFileSync(path.join(A, f), "utf8");
  const tb = fs.readFileSync(path.join(B, f), "utf8");
  const enc = JSON.stringify(DIRECTIVE).slice(1, -1);
  const occA = ta.split(enc).length - 1;
  const occB = tb.split(enc).length - 1;
  const ok = ta !== tb && occA === 1 && occB === 0 && ta.replace(enc, "") === tb;
  record(`exception.${f}`, ok, {
    differs: ta !== tb,
    directiveInBranch: occA,
    directiveInMain: occB,
    reversesToMain: ta.replace(enc, "") === tb,
    byteDelta: ta.length - tb.length,
  });
}

const pass = results.filter((r) => r.ok).length;
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}  ${JSON.stringify(r.detail)}`);
console.log(`\n${pass}/${results.length} assertions passed`);
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ branchDir: A, mainDir: B, results, pass, total: results.length }, null, 2));
process.exit(pass === results.length ? 0 : 1);
