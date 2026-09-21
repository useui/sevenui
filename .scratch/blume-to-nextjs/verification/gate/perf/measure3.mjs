import { gzipSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const BYPASS = process.env.VERCEL_BYPASS;
const PREVIEW = process.env.PREVIEW_URL;
const PROD = "https://sevenui.dev";
const ROUTES = ["/", "/docs/installation", "/docs/components/button", "/docs/components/chart", "/blocks/marketing/hero"];
const gz9 = (b) => gzipSync(b, { level: 9 }).length;

function hdrs(url, extra = {}) {
  const h = { ...extra };
  if (url.startsWith(PREVIEW)) h["x-vercel-protection-bypass"] = BYPASS;
  return h;
}
// wire bytes as the CDN actually sends them under a given Accept-Encoding
function wire(url, enc, extra = {}) {
  const args = ["-s", "--retry", "3", "--retry-all-errors", "-o", "/dev/null", "-w", "%{size_download} %{http_code}", "-H", `Accept-Encoding: ${enc}`];
  for (const [k, v] of Object.entries(hdrs(url, extra))) args.push("-H", `${k}: ${v}`);
  args.push(url);
  for (let i = 0; i < 6; i++) {
    try {
      const [n, code] = execFileSync("curl", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split(" ");
      if (Number(n) > 0 && code === "200") return Number(n);
    } catch { /* transient curl failure; retry */ }
  }
  return null;
}
async function body(url, extra = {}) {
  const res = await fetch(url, { headers: hdrs(url, { "Accept-Encoding": "identity", ...extra }), redirect: "manual" });
  const buf = Buffer.from(await res.arrayBuffer());
  return { status: res.status, buf };
}
function scriptSrcs(html) {
  const out = []; const re = /<script\b([^>]*)>/gi; let m;
  while ((m = re.exec(html))) { const s = /\ssrc=["']([^"']+)["']/i.exec(m[1]); if (s) out.push(s[1]); }
  return [...new Set(out)];
}
function preloadJs(html) {
  const out = []; const re = /<link\b([^>]*)>/gi; let m;
  while ((m = re.exec(html))) { if (!/rel=["']?(modulepreload|preload)/i.test(m[1])) continue; const h = /\shref=["']([^"']+)["']/i.exec(m[1]); if (h) out.push(h[1]); }
  return [...new Set(out)];
}
function staticImports(code) {
  const out = [];
  for (const re of [/\bimport\s+[^"';]*?from\s*["']([^"']+)["']/g, /\bimport\s*["']([^"']+)["']/g, /\bexport\s+[^"';]*?from\s*["']([^"']+)["']/g]) { let m; while ((m = re.exec(code))) out.push(m[1]); }
  return out;
}

async function measure(origin, route, label) {
  const url = origin + route;
  const { status, buf } = await body(url);
  const html = buf.toString("utf8");
  const htmlWireGz = wire(url, "gzip");
  const htmlWireBr = wire(url, "br");

  const flightRe = /<script>self\.__next_f\.push\([\s\S]*?\)<\/script>/g;
  const fb = html.match(flightRe) || [];
  const noFlight = Buffer.from(html.replace(flightRe, ""));

  const seen = new Map();
  const roots = scriptSrcs(html).map((s) => new URL(s, url).href);
  const q = [...roots];
  while (q.length) {
    const u = q.shift(); if (seen.has(u)) continue;
    const r = await body(u);
    if (r.status !== 200) { seen.set(u, { status: r.status, raw: 0, gz9: 0, wireGz: 0 }); continue; }
    seen.set(u, { status: 200, raw: r.buf.length, gz9: gz9(r.buf), wireGz: wire(u, "gzip") ?? gz9(r.buf) });
    for (const spec of staticImports(r.buf.toString("utf8"))) { if (!/^[./]/.test(spec)) continue; const abs = new URL(spec, u).href; if (!seen.has(abs)) q.push(abs); }
  }
  let f = { gz: 0, raw: 0, n: 0 }, t = { gz: 0, raw: 0, n: 0 };
  const detail = [];
  for (const [u, v] of seen) {
    const third = !u.startsWith(origin);
    const bucket = third ? t : f;
    bucket.gz += v.wireGz; bucket.raw += v.raw; bucket.n++;
    detail.push({ url: third ? u : u.slice(origin.length), raw: v.raw, wireGz: v.wireGz, gz9: v.gz9, third });
  }
  const preloadOnly = preloadJs(html).map((x) => new URL(x, url).href).filter((x) => !seen.has(x));

  let rscFull = null, rscPrefetch = null;
  if (fb.length) {
    const a = await body(url, { RSC: "1" });
    if (a.status === 200) rscFull = { raw: a.buf.length, wireGz: wire(url, "gzip", { RSC: "1" }), gz9: gz9(a.buf) };
    const b2 = await body(url, { RSC: "1", "Next-Router-Prefetch": "1" });
    if (b2.status === 200) rscPrefetch = { raw: b2.buf.length, wireGz: wire(url, "gzip", { RSC: "1", "Next-Router-Prefetch": "1" }), gz9: gz9(b2.buf), br: wire(url, "br", { RSC: "1", "Next-Router-Prefetch": "1" }) };
  }
  return { label, route, status, htmlRaw: buf.length, htmlWireGz, htmlWireBr, htmlGz9: gz9(buf),
    noFlightGz9: gz9(noFlight), flightBlocks: fb.length, flightRawChars: fb.reduce((a, s) => a + Buffer.byteLength(s), 0),
    js: { firstParty: f, thirdParty: t }, preloadOnlyJs: preloadOnly, rscFull, rscPrefetch, detail };
}

const out = [];
for (const r of ROUTES) { out.push(await measure(PROD, r, "astro-prod")); out.push(await measure(PREVIEW, r, "next-preview")); }
writeFileSync(process.argv[2], JSON.stringify(out, null, 2));
const K = (n) => (n / 1000).toFixed(1);
console.log("route                       side           HTMLgz  HTMLbr  noFlightΔ  JS1st(gz)  n   JS3rd(gz)  n  rscPrefetch(gz/br)");
for (const r of out) console.log(
  `${r.route.padEnd(26)} ${r.label.padEnd(13)} ${K(r.htmlWireGz).padStart(7)} ${K(r.htmlWireBr).padStart(7)} ${K(r.htmlGz9 - r.noFlightGz9).padStart(10)} ${K(r.js.firstParty.gz).padStart(10)} ${(r.js.firstParty.n+"").padStart(3)} ${K(r.js.thirdParty.gz).padStart(10)} ${(r.js.thirdParty.n+"").padStart(2)}  ${r.rscPrefetch ? K(r.rscPrefetch.wireGz)+"/"+K(r.rscPrefetch.br) : "-"}`
);
