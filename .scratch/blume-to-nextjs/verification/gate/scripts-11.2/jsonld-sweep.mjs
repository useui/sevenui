// Task 11.2 Step 4 (Ruling 124): the JSON-LD / head sweep no gate in this
// migration performs. HTTP-only input: two directories of server HTML fetched
// from production and from D2. Imports nothing from the app.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const [root, invFile, outFile] = process.argv.slice(2);
const inv = JSON.parse(readFileSync(invFile, "utf8"));
const routes = [...inv.docs, ...inv.gallery, ...inv.blocks, ...inv.standalone].sort();
const key = (r) => (r === "/" ? "_" : r.replace(/\//gu, "_"));
const html = (side, r) => readFileSync(`${root}/${side}/${key(r)}.html`, "utf8");

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#x27;|&apos;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

function headOf(h) {
  const m = h.match(/<head[^>]*>([\s\S]*?)<\/head>/iu);
  return m ? m[1] : "";
}
function titleOf(h) {
  const m = headOf(h).match(/<title[^>]*>([\s\S]*?)<\/title>/iu);
  return m ? decode(m[1]).trim() : null;
}
function ldNodes(h) {
  const blocks = [...h.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/giu)].map((m) => m[1]);
  const nodes = [];
  for (const b of blocks) {
    let j;
    try { j = JSON.parse(b); } catch { nodes.push({ "@type": "__PARSE_ERROR__" }); continue; }
    for (const n of j["@graph"] ?? [j]) nodes.push(n);
  }
  return { blocks: blocks.length, nodes };
}
function metaOf(h, name) {
  const head = headOf(h);
  const re = new RegExp(`<meta[^>]*(?:property|name)="${name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}"[^>]*>`, "giu");
  return [...head.matchAll(re)].map((m) => {
    const c = m[0].match(/content="([^"]*)"/u);
    return c ? decode(c[1]) : null;
  });
}

const rows = [];
for (const r of routes) {
  const row = { route: r };
  for (const side of ["prod", "ours"]) {
    const h = html(side, r);
    const { blocks, nodes } = ldNodes(h);
    const types = nodes.map((n) => (Array.isArray(n["@type"]) ? n["@type"].join("+") : n["@type"]));
    const tech = nodes.find((n) => n["@type"] === "TechArticle");
    const crumb = nodes.find((n) => n["@type"] === "BreadcrumbList");
    row[side] = {
      ldBlocks: blocks,
      ldTypes: types,
      headline: tech?.headline ?? null,
      ldName: tech?.name ?? null,
      breadcrumb: crumb ? (crumb.itemListElement ?? []).length : null,
      title: titleOf(h),
      ogTitle: metaOf(h, "og:title")[0] ?? null,
      ogDescription: metaOf(h, "og:description")[0] ?? null,
      ogImage: metaOf(h, "og:image")[0] ?? null,
      ariaCurrent: (h.match(/aria-current="page"/gu) ?? []).length,
      detailsOpen: (h.match(/<details[^>]*\sopen(?=[\s>])/gu) ?? []).length,
      detailsTotal: (h.match(/<details[\s>]/gu) ?? []).length,
    };
  }
  rows.push(row);
}

const out = { routes: rows.length, rows };
writeFileSync(outFile, JSON.stringify(out, null, 2));

// --- summaries -------------------------------------------------------------
const SUFFIX = " — SevenUI";
const summarize = (side) => {
  const techPages = rows.filter((r) => r[side].headline !== null);
  const suffixed = techPages.filter((r) => r[side].headline.endsWith(SUFFIX));
  const bare = techPages.filter((r) => !r[side].headline.endsWith(SUFFIX));
  const crumbs = rows.filter((r) => r[side].breadcrumb !== null);
  const titles = rows.map((r) => r[side].title).filter(Boolean);
  const em = titles.filter((t) => t.includes(" — "));
  const hy = titles.filter((t) => t.includes(" - "));
  const none = titles.filter((t) => !t.includes(" — ") && !t.includes(" - "));
  return { side, pages: rows.length, techPages: techPages.length, suffixedHeadline: suffixed.length,
    bareHeadline: bare.length, breadcrumbPages: crumbs.length, titles: titles.length,
    emDash: em.length, hyphen: hy.length, noSeparator: none.length,
    suffixedRoutes: suffixed.map((r) => r.route) };
};
const s = { prod: summarize("prod"), ours: summarize("ours") };
console.log(JSON.stringify({ prod: { ...s.prod, suffixedRoutes: undefined }, ours: { ...s.ours, suffixedRoutes: undefined } }, null, 2));
writeFileSync(outFile.replace(/\.json$/u, "-summary.json"), JSON.stringify(s, null, 2));
