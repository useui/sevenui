import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const BYPASS = process.env.VERCEL_BYPASS, PREVIEW = process.env.PREVIEW_URL, PROD = "https://sevenui.dev";
const ROUTES = ["/", "/docs/installation", "/docs/components/button", "/docs/components/chart", "/blocks/marketing/hero"];
const RUNS = 3;
async function one(browser, origin, route, blockPrefetch) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, extraHTTPHeaders: origin === PREVIEW ? { "x-vercel-protection-bypass": BYPASS } : {} });
  await ctx.addInitScript(`window.__lt=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(e.duration)}).observe({type:"longtask",buffered:true})}catch{}`);
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  let aborted = 0;
  if (blockPrefetch) await p.route("**/*", (r) => {
    const h = r.request().headers();
    if (h["next-router-prefetch"] === "1") { aborted++; return r.abort(); }
    return r.continue();
  });
  const cdpReqs = [];
  p.on("requestfinished", async (r) => { try { const s = await r.sizes(); cdpReqs.push({ u: r.url(), t: r.resourceType(), b: s.responseBodySize }); } catch {} });
  await p.goto(origin + route, { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(6000);
  const res = await p.evaluate(() => performance.getEntriesByType("resource").map(r => ({ n: r.name, t: r.initiatorType, e: r.encodedBodySize })));
  const lt = await p.evaluate(() => window.__lt);
  await ctx.close();
  const js = res.filter(r => r.t === "script" || /\.m?js(\?|$)/.test(r.n));
  const first = js.filter(r => r.n.startsWith(origin));
  const cdpJs = cdpReqs.filter(r => r.t === "script");
  return { origin: origin === PROD ? "astro-prod" : "next-preview", route, blockPrefetch, aborted,
    jsFirstPartyEnc: first.reduce((a, r) => a + r.e, 0), jsFirstPartyCount: first.length,
    cdpJsBytes: cdpJs.reduce((a, r) => a + r.b, 0), cdpJsCount: cdpJs.length,
    cdpThirdPartyJs: cdpJs.filter(r => !r.u.startsWith(origin)).reduce((a, r) => a + r.b, 0),
    cdpTotalBytes: cdpReqs.reduce((a, r) => a + r.b, 0),
    tbt: lt.reduce((a, d) => a + Math.max(0, d - 50), 0) };
}
const b = await chromium.launch(); const out = [];
for (const route of ROUTES) for (const origin of [PROD, PREVIEW]) for (let i = 0; i < RUNS; i++) {
  let r = null; for (let a = 0; a < 3 && !r; a++) { try { r = await one(b, origin, route, true); } catch (e) { console.log("retry", String(e).slice(0,50)); } }
  if (!r) continue; r.run = i + 1; out.push(r); writeFileSync("ownpage.json", JSON.stringify(out, null, 2));
  console.log(`${r.origin.padEnd(13)} ${route.padEnd(26)} run${r.run} ownJS1st=${(r.jsFirstPartyEnc/1000).toFixed(1)}kB/${r.jsFirstPartyCount} cdpJS=${(r.cdpJsBytes/1000).toFixed(1)}kB 3rd=${(r.cdpThirdPartyJs/1000).toFixed(1)}kB total=${(r.cdpTotalBytes/1000).toFixed(1)}kB aborted=${r.aborted} tbt=${r.tbt.toFixed(0)}`);
}
await b.close();
