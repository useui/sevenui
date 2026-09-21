// Task 11.2 Step 5: the iframe `src` check §20.2's proof obligation #5 needs.
//
// The server HTML on BOTH origins carries NO `src` on a /blocks preview
// iframe — production lazy-assigns from `data-src`, ours from the RSC flight
// payload — so the set compared here is the set of `/previews/*` paths each
// origin's own HTML carries, per route, and the resolution half requests OURS
// over the /previews/:path* rewrite.
import { readFileSync, writeFileSync } from "node:fs";
import { fetchRetry } from "/Users/oguzhanyilmaz/Documents/Projects/github@useui/sevenui/.superpowers/sdd/2026-09-19-blume-to-nextjs/task-11.1-net.mjs";

const [root, invFile, outFile, mode] = process.argv.slice(2);
const inv = JSON.parse(readFileSync(invFile, "utf8"));
const key = (r) => (r === "/" ? "_" : r.replace(/\//gu, "_"));
const H = (side, r) => readFileSync(`${root}/${side}/${key(r)}.html`, "utf8");
const paths = (h) => [...new Set([...h.matchAll(/\/previews\/[A-Za-z0-9._-]+/gu)].map((m) => m[0]))].sort();

const results = [];
const record = (name, ok, detail) => results.push({ name, ok, detail });

const perRoute = {};
const allProd = new Set(); const allOurs = new Set();
for (const r of inv.blocks) {
  const p = paths(H("prod", r)); const o = paths(H("ours", r));
  perRoute[r] = { prod: p, ours: o, equal: JSON.stringify(p) === JSON.stringify(o) };
  for (const s of p) allProd.add(s);
  for (const s of o) allOurs.add(s);
}
const P = [...allProd].sort(); const O = [...allOurs].sort();
record("step5.setEquality", P.length > 0 && O.length > 0 && JSON.stringify(P) === JSON.stringify(O), {
  prodDistinct: P.length, oursDistinct: O.length,
  onlyProd: P.filter((s) => !allOurs.has(s)), onlyOurs: O.filter((s) => !allProd.has(s)),
});
const mismatched = inv.blocks.filter((r) => !perRoute[r].equal);
record("step5.perRouteSetEquality", mismatched.length === 0, { routes: inv.blocks.length, mismatched });
record("step5.nonVacuous", O.length >= 100, { oursDistinct: O.length });

// --- resolve OURS ----------------------------------------------------------
const { PREVIEW_URL, VERCEL_BYPASS } = process.env;
const targets = mode === "trailing" ? O.map((s) => `${s}/`) : O;
const rows = [];
const queue = [...targets];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) {
    const s = queue.shift();
    const res = await fetchRetry(`${PREVIEW_URL}${s}`, {
      headers: { "x-vercel-protection-bypass": VERCEL_BYPASS }, redirect: "manual",
    }, { label: s });
    const body = await res.text();
    rows.push({ src: s, status: res.status, type: res.headers.get("content-type"), bytes: body.length,
      hasHtml: /<html[\s>]/iu.test(body) });
  }
}));
rows.sort((a, b) => a.src.localeCompare(b.src));
const ok = rows.filter((r) => r.status === 200 && (r.type ?? "").includes("text/html") && r.bytes > 500 && r.hasHtml);
record(`step5.resolve${mode === "trailing" ? "TrailingSlash" : ""}`, ok.length === rows.length && rows.length > 0, {
  requested: rows.length, ok: ok.length,
  failures: rows.filter((r) => !ok.includes(r)).map((r) => `${r.src} ${r.status} ${r.type} ${r.bytes}B`),
  minBytes: rows.length ? Math.min(...rows.map((r) => r.bytes)) : null,
  maxBytes: rows.length ? Math.max(...rows.map((r) => r.bytes)) : null,
});

writeFileSync(outFile, JSON.stringify({ perRoute, prodSet: P, oursSet: O, rows, results }, null, 2));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}  ${JSON.stringify(r.detail).slice(0, 700)}`);
const pass = results.filter((r) => r.ok).length;
console.log(`\n${pass}/${results.length} assertions passed`);
process.exit(pass === results.length ? 0 : 1);
