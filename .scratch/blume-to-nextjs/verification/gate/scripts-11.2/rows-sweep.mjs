// Task 11.2 Step 4 questions 3-5, measured from the two HTML corpora.
import { readFileSync, writeFileSync } from "node:fs";
const [root, invFile, outFile] = process.argv.slice(2);
const inv = JSON.parse(readFileSync(invFile, "utf8"));
const routes = [...inv.docs, ...inv.gallery, ...inv.blocks, ...inv.standalone].sort();
const key = (r) => (r === "/" ? "_" : r.replace(/\//gu, "_"));
const H = (side, r) => readFileSync(`${root}/${side}/${key(r)}.html`, "utf8");
const dec = (s) => s.replace(/&quot;/g, '"').replace(/&#x27;|&apos;/g, "'").replace(/&amp;/g, "&");
const head = (h) => (h.match(/<head[^>]*>([\s\S]*?)<\/head>/iu) ?? ["", ""])[1];
const meta = (h, n) => {
  const re = new RegExp(`<meta[^>]*(?:property|name)="${n}"[^>]*>`, "giu");
  return [...head(h).matchAll(re)].map((m) => dec((m[0].match(/content="([^"]*)"/u) ?? [])[1] ?? ""));
};
const out = {};

// --- Q3: #2 (sitemap) and #3 (404 og:image) over the 24 blocks routes ------
out.blocksRoutes = inv.blocks.length;
out.q3 = { blocks: inv.blocks, prodOgImage: {}, oursOgImage: {} };
for (const r of inv.blocks) {
  out.q3.prodOgImage[r] = meta(H("prod", r), "og:image")[0] ?? null;
  out.q3.oursOgImage[r] = meta(H("ours", r), "og:image")[0] ?? null;
}

// --- Q4: #21 / §16.4 "all 85 cards" ---------------------------------------
const live = routes.filter((r) => r !== "/docs/components");
const prodDesc = live.map((r) => meta(H("prod", r), "og:description")[0] ?? null);
const oursDesc = routes.map((r) => meta(H("ours", r), "og:description")[0] ?? null);
const tally = (a) => { const m = new Map(); for (const d of a) m.set(d, (m.get(d) ?? 0) + 1); return m; };
const pt = tally(prodDesc); const ot = tally(oursDesc);
const topProd = [...pt.entries()].sort((a, b) => b[1] - a[1])[0];
out.q4 = {
  prodLiveRoutes: live.length, prodDistinctOgDescription: pt.size,
  prodMostCommon: { count: topProd[1], value: topProd[0] },
  prodRoutesSharingMostCommon: live.filter((r, i) => prodDesc[i] === topProd[0]),
  oursRoutes: routes.length, oursDistinctOgDescription: ot.size,
  oursMaxRepeat: Math.max(...[...ot.values()]),
  oursRepeated: [...ot.entries()].filter(([, n]) => n > 1).map(([v, n]) => ({ n, v })),
};

// --- Q5 rows ---------------------------------------------------------------
const count = (h, re) => (h.match(re) ?? []).length;
const per = (r) => ({
  ariaCurrentPage: [count(H("prod", r), /aria-current="page"/gu), count(H("ours", r), /aria-current="page"/gu)],
  detailsTotal: [count(H("prod", r), /<details[\s>]/gu), count(H("ours", r), /<details[\s>]/gu)],
  detailsOpen: [count(H("prod", r), /<details[^>]*\sopen(?=[\s>])/gu), count(H("ours", r), /<details[^>]*\sopen(?=[\s>])/gu)],
});
out.q5 = { rows39: {}, rows41: {}, rows24: {}, rows42: {} };
for (const r of ["/components/button", "/components", "/components/dialog"]) out.q5.rows39[r] = per(r);
for (const r of ["/blocks", "/blocks/marketing", "/blocks/marketing/hero"]) out.q5.rows41[r] = per(r);

// #24: /blocks breadcrumb nav>ol>li + aria-current
for (const r of ["/blocks", "/blocks/marketing", "/blocks/marketing/hero"]) {
  const g = (side) => {
    const h = H(side, r);
    return {
      navOl: count(h, /<nav[^>]*>\s*<ol[\s>]/gu),
      olTags: count(h, /<ol[\s>]/gu),
      ariaCurrentPage: count(h, /aria-current="page"/gu),
      breadcrumbLabel: count(h, /aria-label="[Bb]readcrumb"/gu),
    };
  };
  out.q5.rows24[r] = { prod: g("prod"), ours: g("ours") };
}

// #42: the attributes the block card drops
const ATTRS = ["data-tip", "data-title", "data-cmd-npm", "data-cmd-pnpm", "data-cmd-yarn", "data-cmd-bun",
  "data-src", "data-preset", "data-panel", "data-rail", "data-cap", "data-chevron", "data-rail-glyph",
  "data-readout", "data-rail-readout", "data-field", "data-value", "data-label", "data-glyph",
  "data-action", "data-bound", "data-customizer"];
const r42 = "/blocks/marketing/hero";
for (const a of ATTRS) {
  out.q5.rows42[a] = {
    prod: count(H("prod", r42), new RegExp(`\\s${a}(?=[=\\s>])`, "gu")),
    ours: count(H("ours", r42), new RegExp(`\\s${a}(?=[=\\s>])`, "gu")),
  };
}
out.q5.rows42['id="blocks-theme-panel"'] = {
  prod: count(H("prod", r42), /id="blocks-theme-panel"/gu),
  ours: count(H("ours", r42), /id="blocks-theme-panel"/gu),
};

// --- Step 5: iframe srcs across the /blocks routes -------------------------
const srcOf = (h) => [...h.matchAll(/<iframe\b[^>]*?\ssrc="([^"]+)"/gu)].map((m) => dec(m[1]));
const prodSrcs = new Map(); const oursSrcs = new Map();
for (const r of inv.blocks) { prodSrcs.set(r, srcOf(H("prod", r))); oursSrcs.set(r, srcOf(H("ours", r))); }
const flat = (m) => [...m.values()].flat();
const setP = new Set(flat(prodSrcs)); const setO = new Set(flat(oursSrcs));
out.step5 = {
  prodTotalIframeSrcsOnBlocks: flat(prodSrcs).length,
  oursTotalIframeSrcsOnBlocks: flat(oursSrcs).length,
  prodDistinct: setP.size, oursDistinct: setO.size,
  setEqual: setP.size === setO.size && [...setP].every((s) => setO.has(s)),
  onlyProd: [...setP].filter((s) => !setO.has(s)),
  onlyOurs: [...setO].filter((s) => !setP.has(s)),
  perRouteEqual: inv.blocks.every((r) => JSON.stringify(prodSrcs.get(r)) === JSON.stringify(oursSrcs.get(r))),
  perRouteMismatch: inv.blocks.filter((r) => JSON.stringify(prodSrcs.get(r)) !== JSON.stringify(oursSrcs.get(r))),
  oursSrcList: [...setO].sort(),
};
writeFileSync(outFile, JSON.stringify(out, null, 2));
const brief = JSON.parse(JSON.stringify(out));
delete brief.step5.oursSrcList; delete brief.q3.blocks; delete brief.q4.prodRoutesSharingMostCommon;
console.log(JSON.stringify(brief, null, 2));
