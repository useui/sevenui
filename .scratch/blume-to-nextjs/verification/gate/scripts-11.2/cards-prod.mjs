// Step 4 Q3/Q4: resolve production's declared og:image on every live route.
import { readFileSync, writeFileSync } from "node:fs";
import { fetchRetry } from "/Users/oguzhanyilmaz/Documents/Projects/github@useui/sevenui/.superpowers/sdd/2026-09-19-blume-to-nextjs/task-11.1-net.mjs";
const [root, invFile, outFile] = process.argv.slice(2);
const inv = JSON.parse(readFileSync(invFile, "utf8"));
const routes = [...inv.docs, ...inv.gallery, ...inv.blocks, ...inv.standalone].sort().filter((r) => r !== "/docs/components");
const key = (r) => (r === "/" ? "_" : r.replace(/\//gu, "_"));
const head = (h) => (h.match(/<head[^>]*>([\s\S]*?)<\/head>/iu) ?? ["", ""])[1];
const ogImage = (h) => {
  const m = head(h).match(/<meta[^>]*property="og:image"[^>]*>/iu);
  return m ? (m[0].match(/content="([^"]*)"/u) ?? [])[1] ?? null : null;
};
const rows = [];
const queue = routes.map((r) => [r, ogImage(readFileSync(`${root}/prod/${key(r)}.html`, "utf8"))]);
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const [route, url] = queue.shift();
    if (!url) { rows.push({ route, url, status: null }); continue; }
    const res = await fetchRetry(url, { redirect: "manual", method: "GET" }, { label: url });
    const buf = Buffer.from(await res.arrayBuffer());
    rows.push({ route, url, status: res.status, type: res.headers.get("content-type"), bytes: buf.length });
  }
}));
rows.sort((a, b) => a.route.localeCompare(b.route));
const ok = rows.filter((r) => r.status === 200);
const bad = rows.filter((r) => r.status !== 200);
const isBlocks = (r) => inv.blocks.includes(r);
const badBlocks = bad.filter((r) => isBlocks(r.route));
console.log(JSON.stringify({
  liveRoutes: rows.length,
  cards200: ok.length,
  cardsNon200: bad.length,
  non200AllBlocks: bad.every((r) => isBlocks(r.route)),
  badBlocksRoutes: badBlocks.map((r) => r.route),
  badBlocksGroupLevel: badBlocks.filter((r) => r.route.split("/").length === 3).map((r) => r.route),
  badBlocksCategoryLevel: badBlocks.filter((r) => r.route.split("/").length === 4).map((r) => r.route),
  blocksWith200: rows.filter((r) => isBlocks(r.route) && r.status === 200).map((r) => r.route),
}, null, 2));
writeFileSync(outFile, JSON.stringify(rows, null, 2));
