import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const BYPASS = process.env.VERCEL_BYPASS, PREVIEW = process.env.PREVIEW_URL;
const RUNS = 3;
async function one(browser, mode) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, extraHTTPHeaders: { "x-vercel-protection-bypass": BYPASS } });
  await ctx.addInitScript(`window.__lt=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(e.duration)}).observe({type:"longtask",buffered:true})}catch{}`);
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  let aborted = 0;
  if (mode !== "as-shipped") {
    await p.route("**/*", (route) => {
      const r = route.request(), h = r.headers();
      const isPf = h["next-router-prefetch"] === "1";
      if (!isPf) return route.continue();
      if (mode === "wall-off" && /\/docs\/components\//.test(r.url())) { aborted++; return route.abort(); }
      if (mode === "all-off") { aborted++; return route.abort(); }
      return route.continue();
    });
  }
  const reqs = [];
  p.on("requestfinished", async (r) => { try { const s = await r.sizes(); const h = r.headers(); reqs.push({ u: r.url(), t: r.resourceType(), b: s.responseBodySize, pf: h["next-router-prefetch"] === "1" }); } catch {} });
  await p.goto(PREVIEW + "/", { waitUntil: "load", timeout: 60000 });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) { await p.evaluate((yy) => scrollTo(0, yy), y); await p.waitForTimeout(300); }
  await p.waitForTimeout(8000);
  const lt = await p.evaluate(() => window.__lt);
  await ctx.close();
  const S = (f) => reqs.filter(f).reduce((a, r) => a + r.b, 0);
  return { mode, aborted, reqs: reqs.length, total: reqs.reduce((a, r) => a + r.b, 0),
    js: S(r => r.t === "script"), jsN: reqs.filter(r => r.t === "script").length,
    pf: reqs.filter(r => r.pf).length, pfBytes: S(r => r.pf),
    wallPf: reqs.filter(r => r.pf && /\/docs\/components\//.test(r.u)).length,
    tbt: lt.reduce((a, d) => a + Math.max(0, d - 50), 0) };
}
const b = await chromium.launch();
const out = [];
for (const mode of ["as-shipped", "wall-off", "all-off"]) for (let i = 0; i < RUNS; i++) {
  let r = null; for (let a = 0; a < 3 && !r; a++) { try { r = await one(b, mode); } catch (e) { console.log("retry", String(e).slice(0,50)); } }
  if (!r) continue; out.push(r);
  console.log(`${mode.padEnd(11)} run${i+1} reqs=${r.reqs} total=${(r.total/1000).toFixed(1)}kB js=${(r.js/1000).toFixed(1)}kB/${r.jsN} pf=${r.pf}(${(r.pfBytes/1000).toFixed(1)}kB) wallPf=${r.wallPf} aborted=${r.aborted} tbt=${r.tbt.toFixed(0)}`);
}
writeFileSync("prefetch-wall-control.json", JSON.stringify(out, null, 2));
await b.close();
