import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const BYPASS = process.env.VERCEL_BYPASS;
const PREVIEW = process.env.PREVIEW_URL;
const PROD = "https://sevenui.dev";
const ROUTES = ["/", "/docs/installation", "/docs/components/button", "/docs/components/chart", "/blocks/marketing/hero"];
const CPU_THROTTLE = Number(process.env.CPU ?? 4);
const RUNS = Number(process.env.RUNS ?? 3);

const INIT = `
window.__perf = { events: [], longtasks: [], lcp: 0 };
try {
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (!e.interactionId) continue;
      window.__perf.events.push({ id: e.interactionId, name: e.name, dur: e.duration, start: e.startTime });
    }
  }).observe({ type: "event", buffered: true, durationThreshold: 0 });
} catch (err) { window.__perf.eventErr = String(err); }
try {
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.longtasks.push({ start: e.startTime, dur: e.duration }); })
    .observe({ type: "longtask", buffered: true });
} catch (err) { window.__perf.ltErr = String(err); }
try {
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.lcp = e.startTime; })
    .observe({ type: "largest-contentful-paint", buffered: true });
} catch {}
`;

function inpFrom(events, from, to) {
  const byId = new Map();
  for (const e of events) {
    if (e.start < from || e.start > to) continue;
    byId.set(e.id, Math.max(byId.get(e.id) ?? 0, e.dur));
  }
  const vals = [...byId.values()].sort((a, b) => b - a);
  return { count: vals.length, max: vals[0] ?? null, all: vals };
}

async function interact(page) {
  const out = [];
  const t0 = await page.evaluate(() => performance.now());
  // 1. search trigger open + Escape  (present on both sides)
  try {
    const trig = page.locator('button:has-text("Search"), [data-search-trigger], button[aria-label*="Search" i]').first();
    await trig.click({ timeout: 4000 });
    await page.waitForTimeout(400);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    out.push("search-open-escape");
  } catch (e) { out.push("search-FAILED:" + String(e).slice(0, 60)); }
  // 2. theme toggle twice
  try {
    const th = page.locator('button[aria-label*="theme" i], button[title*="theme" i], [data-theme-toggle]').first();
    await th.click({ timeout: 3000 }); await page.waitForTimeout(300);
    await th.click({ timeout: 3000 }); await page.waitForTimeout(300);
    out.push("theme-toggle-x2");
  } catch (e) { out.push("theme-FAILED"); }
  // 3. five Tab presses
  for (let i = 0; i < 5; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(120); }
  out.push("tab-x5");
  const t1 = await page.evaluate(() => performance.now());
  return { from: t0, to: t1, did: out };
}

const INITIAL = new Map(); // origin+route -> Set of absolute script srcs in the served HTML
async function initialScripts(origin, route) {
  const key = origin + route;
  if (INITIAL.has(key)) return INITIAL.get(key);
  const h = origin === PREVIEW ? { "x-vercel-protection-bypass": BYPASS } : {};
  const res = await fetch(origin + route, { headers: { ...h, "Accept-Encoding": "identity" } });
  const html = await res.text();
  const set = new Set();
  const re = /<script\b([^>]*)>/gi; let m;
  while ((m = re.exec(html))) { const sm = /\ssrc=["']([^"']+)["']/i.exec(m[1]); if (sm) set.add(new URL(sm[1], origin + route).href); }
  INITIAL.set(key, set);
  return set;
}

async function once(browser, origin, route, label) {
  const initial = await initialScripts(origin, route);
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: origin === PREVIEW ? { "x-vercel-protection-bypass": BYPASS } : {},
    bypassCSP: false,
  });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_THROTTLE });

  const reqs = [];
  page.on("requestfinished", async (r) => {
    try {
      const s = await r.sizes();
      reqs.push({ url: r.url(), type: r.resourceType(), enc: s.responseBodySize, hdr: s.responseHeadersSize, method: r.method(), rsc: (r.headers()["rsc"] ?? r.headers()["RSC"]) ? 1 : 0, prefetch: r.headers()["next-router-prefetch"] ? 1 : 0 });
    } catch {}
  });

  const nav = await page.goto(origin + route, { waitUntil: "domcontentloaded", timeout: 60000 });
  // PHASE A: interact as soon as we can — the hydration window
  const a = await interact(page);
  // settle
  await page.waitForLoadState("load").catch(() => {});
  await page.waitForTimeout(3000);
  // PHASE B: same interactions on a settled page
  const b = await interact(page);
  await page.waitForTimeout(500);

  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] || {};
    const res = performance.getEntriesByType("resource").map((r) => ({ name: r.name, type: r.initiatorType, enc: r.encodedBodySize, dec: r.decodedBodySize, transfer: r.transferSize, start: r.startTime, end: r.responseEnd }));
    return { ...window.__perf, nav: { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd, ttfb: nav.responseStart }, res };
  });

  const tbt = (from, to) => perf.longtasks.filter((t) => t.start >= from && t.start < to).reduce((s, t) => s + Math.max(0, t.dur - 50), 0);
  const scriptRes = perf.res.filter((r) => r.type === "script" || /\.m?js(\?|$)/.test(r.name));
  const loadT = perf.nav.load || 1e9;
  const sum = (arr) => arr.reduce((s, r) => s + r.enc, 0);
  const first = scriptRes.filter((r) => r.name.startsWith(origin));
  const third = scriptRes.filter((r) => !r.name.startsWith(origin));
  const jsEnc = sum(scriptRes);
  const jsEncFirst = sum(first);
  const inHtml = first.filter((r) => initial.has(r.name));
  const notInHtml = first.filter((r) => !initial.has(r.name));
  const jsStatic = sum(inHtml);                                    // the <script src=> set: the method S18.1 used
  const jsDynamic = sum(notInHtml);                                // dynamic import / router prefetch
  const jsBoot = sum(first.filter((r) => r.start <= loadT));
  const jsAfter = sum(first.filter((r) => r.start > loadT));
  const jsThird = sum(third);

  await ctx.close();
  return {
    label, route, status: nav?.status(),
    inpA: inpFrom(perf.events, a.from, a.to), inpB: inpFrom(perf.events, b.from, b.to),
    didA: a.did, didB: b.did,
    tbtFirst5s: tbt(0, 5000), longtaskCount: perf.longtasks.length,
    longtaskTotalMs: perf.longtasks.reduce((s, t) => s + t.dur, 0),
    lcp: perf.lcp, ttfb: perf.nav.ttfb, dcl: perf.nav.domContentLoaded, load: perf.nav.load,
    jsEncodedBytes: jsEnc, jsEncodedFirstParty: jsEncFirst, jsBootFirstParty: jsBoot, jsAfterLoadFirstParty: jsAfter, jsThirdParty: jsThird,
    jsStaticSrcSet: jsStatic, jsStaticCount: inHtml.length, jsDynamic, jsDynamicCount: notInHtml.length,
    scriptCount: scriptRes.length, scriptCountFirst: first.length, loadT,
    requestCount: reqs.length,
    rscRequests: reqs.filter((r) => r.rsc || /\.rsc(\?|$)/.test(r.url)).length,
    rscBytes: reqs.filter((r) => r.rsc || /\.rsc(\?|$)/.test(r.url)).reduce((s, r) => s + (r.enc || 0), 0),
    eventErr: perf.eventErr, ltErr: perf.ltErr,
  };
}

const browser = await chromium.launch();
const results = [];
const PROFILE = { cpuThrottle: CPU_THROTTLE, viewport: "1440x900", runs: RUNS, browser: "playwright chromium (headless)", network: "unthrottled" };
const flush = () => writeFileSync(process.argv[2], JSON.stringify({ profile: PROFILE, results }, null, 2));
for (const route of ROUTES) {
  for (const [origin, label] of [[PROD, "astro-prod"], [PREVIEW, "next-preview"]]) {
    for (let i = 0; i < RUNS; i++) {
      let r = null;
      for (let attempt = 0; attempt < 3 && !r; attempt++) {
        try { r = await once(browser, origin, route, label); }
        catch (e) { console.log(`  retry ${label} ${route} run${i + 1}: ${String(e).slice(0, 70)}`); }
      }
      if (!r) { console.log(`  GAVE UP ${label} ${route} run${i + 1}`); continue; }
      r.run = i + 1;
      results.push(r); flush();
      console.log(`${label.padEnd(13)} ${route.padEnd(26)} run${r.run} inpA=${r.inpA.max?.toFixed(0)}ms(${r.inpA.count}) inpB=${r.inpB.max?.toFixed(0)}ms(${r.inpB.count}) tbt5s=${r.tbtFirst5s.toFixed(0)}ms lcp=${r.lcp.toFixed(0)} jsAll=${(r.jsEncodedFirstParty/1000).toFixed(1)}kB static=${(r.jsStaticSrcSet/1000).toFixed(1)}kB/${r.jsStaticCount} dyn=${(r.jsDynamic/1000).toFixed(1)}kB/${r.jsDynamicCount} rsc=${r.rscRequests}/${(r.rscBytes/1000).toFixed(1)}kB did=${r.didA.join("|")}`);
    }
  }
}
await browser.close();
flush();
