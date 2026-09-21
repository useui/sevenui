import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const BYPASS = process.env.VERCEL_BYPASS;
const PREVIEW = process.env.PREVIEW_URL;
const PROD = "https://sevenui.dev";
const RUNS = Number(process.env.RUNS ?? 3);

const INIT = `
window.__perf = { longtasks: [] };
try { new PerformanceObserver((l)=>{for(const e of l.getEntries()) window.__perf.longtasks.push({start:e.startTime,dur:e.duration});}).observe({type:"longtask",buffered:true}); } catch {}
`;

async function run(browser, origin, { block, scroll, label }) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: origin === PREVIEW ? { "x-vercel-protection-bypass": BYPASS } : {},
  });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  const reqs = [];
  let blocked = 0;
  if (block) {
    await page.route("**/*", async (route) => {
      const h = route.request().headers();
      if (h["next-router-prefetch"] === "1" || h["x-middleware-prefetch"] === "1") { blocked++; return route.abort(); }
      return route.continue();
    });
  }
  page.on("requestfinished", async (r) => {
    try {
      const s = await r.sizes();
      const h = r.headers();
      reqs.push({ url: r.url(), type: r.resourceType(), bytes: s.responseBodySize + s.responseHeadersSize,
        body: s.responseBodySize, prefetch: h["next-router-prefetch"] === "1", rsc: h["rsc"] === "1" });
    } catch {}
  });

  await page.goto(origin + "/", { waitUntil: "load", timeout: 60000 });
  const wall = await page.evaluate(() => {
    const as = [...document.querySelectorAll('a[href^="/docs/components/"]')];
    const vh = window.innerHeight;
    return { total: as.length, inViewport: as.filter((a) => { const r = a.getBoundingClientRect(); return r.top < vh && r.bottom > 0; }).length,
             pageHeight: document.documentElement.scrollHeight };
  });
  if (scroll) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 700) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(250); }
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  await page.waitForTimeout(8000);
  const lt = await page.evaluate(() => window.__perf.longtasks);
  await ctx.close();

  const initialHtmlScripts = new Set();
  const tot = (f) => reqs.filter(f).reduce((a, r) => a + r.body, 0);
  return {
    label, origin: origin === PROD ? "astro-prod" : "next-preview", block, scroll, wall, blockedCount: blocked,
    requests: reqs.length,
    totalBodyBytes: reqs.reduce((a, r) => a + r.body, 0),
    prefetchRequests: reqs.filter((r) => r.prefetch).length,
    prefetchBytes: tot((r) => r.prefetch),
    rscRequests: reqs.filter((r) => r.rsc).length,
    rscBytes: tot((r) => r.rsc),
    jsRequests: reqs.filter((r) => r.type === "script").length,
    jsBytes: tot((r) => r.type === "script"),
    docRequests: reqs.filter((r) => r.type === "document" || r.type === "fetch").length,
    docBytes: tot((r) => r.type === "document" || r.type === "fetch"),
    tbt: lt.reduce((a, t) => a + Math.max(0, t.dur - 50), 0),
    longtaskMs: lt.reduce((a, t) => a + t.dur, 0),
  };
}

const browser = await chromium.launch();
const out = [];
const cases = [
  [PREVIEW, { block: false, scroll: false, label: "next: as shipped, no scroll" }],
  [PREVIEW, { block: true,  scroll: false, label: "next: prefetch blocked, no scroll" }],
  [PREVIEW, { block: false, scroll: true,  label: "next: as shipped, full scroll" }],
  [PREVIEW, { block: true,  scroll: true,  label: "next: prefetch blocked, full scroll" }],
  [PROD,    { block: false, scroll: false, label: "astro: as shipped, no scroll" }],
  [PROD,    { block: false, scroll: true,  label: "astro: as shipped, full scroll" }],
];
for (const [origin, cfg] of cases) {
  for (let i = 0; i < RUNS; i++) {
    let r = null;
    for (let a = 0; a < 3 && !r; a++) { try { r = await run(browser, origin, cfg); } catch (e) { console.log("  retry:", String(e).slice(0, 60)); } }
    if (!r) continue;
    r.run = i + 1; out.push(r);
    writeFileSync(process.argv[2], JSON.stringify(out, null, 2));
    console.log(`${r.label.padEnd(38)} run${r.run} reqs=${r.requests} total=${(r.totalBodyBytes/1000).toFixed(1)}kB js=${(r.jsBytes/1000).toFixed(1)}kB/${r.jsRequests} prefetchReq=${r.prefetchRequests}/${(r.prefetchBytes/1000).toFixed(1)}kB blockedAborts=${r.blockedCount} tbt=${r.tbt.toFixed(0)}ms wall=${r.wall.inViewport}/${r.wall.total}`);
  }
}
await browser.close();
