// Task 11.2 Steps 4+5: fetch every inventoried route from BOTH origins, fresh
// against D2. Same shape as task-11.1-fetch.mjs (manual redirects, recorded
// status per REQUESTED route, 8-way pool) but written here so nothing in the
// finished task is touched.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { fetchRetry } from "/Users/oguzhanyilmaz/Documents/Projects/github@useui/sevenui/.superpowers/sdd/2026-09-19-blume-to-nextjs/task-11.1-net.mjs";

const { PREVIEW_URL, VERCEL_BYPASS } = process.env;
if (!PREVIEW_URL || !VERCEL_BYPASS) { console.error("need PREVIEW_URL and VERCEL_BYPASS"); process.exit(2); }
const [invFile, outRoot] = process.argv.slice(2);
const inv = JSON.parse(readFileSync(invFile, "utf8"));
const routes = [...inv.docs, ...inv.gallery, ...inv.blocks, ...inv.standalone].sort();
if (routes.length !== inv.total - inv.notFound.length) {
  console.error(`domain: ${routes.length} routes but inventory says ${inv.total - inv.notFound.length}`); process.exit(2);
}
mkdirSync(`${outRoot}/prod`, { recursive: true });
mkdirSync(`${outRoot}/ours`, { recursive: true });
const key = (r) => (r === "/" ? "_" : r.replace(/\//gu, "_"));
const rows = [];
const queue = [...routes];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const route = queue.shift();
    const p = await fetchRetry(`https://sevenui.dev${route}`, { redirect: "manual" }, { label: `prod ${route}` });
    const pb = await p.text();
    const o = await fetchRetry(`${PREVIEW_URL}${route}`, { headers: { "x-vercel-protection-bypass": VERCEL_BYPASS }, redirect: "manual" }, { label: `ours ${route}` });
    const ob = await o.text();
    writeFileSync(`${outRoot}/prod/${key(route)}.html`, pb);
    writeFileSync(`${outRoot}/ours/${key(route)}.html`, ob);
    rows.push({ route, prod: p.status, ours: o.status, prodBytes: pb.length, oursBytes: ob.length });
  }
}));
rows.sort((a, b) => a.route.localeCompare(b.route));
writeFileSync(`${outRoot}/_status.json`, JSON.stringify(rows, null, 2));
const odd = rows.filter((r) => r.prod !== 200 || r.ours !== 200);
console.log(`${rows.length} routes fetched from both origins; ${odd.length} non-200:`);
for (const r of odd) console.log(`  ${r.route} prod=${r.prod} ours=${r.ours}`);
