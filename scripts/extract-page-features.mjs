#!/usr/bin/env node
// §17.2's extractor. Deliberately blind to styling: the agreed bar accepts px
// drift and font-rendering differences, so screenshot diffing would manufacture
// false positives against a bar we already set.
//
// Extracts exactly three things from an HTML document: visible text, heading
// hierarchy with anchor IDs, and link targets. Nothing else — that narrowness
// is what lets a later stage rename data-blume-* attributes to data-sevenui-*
// without this gate objecting.
//
// Usage:
//   node scripts/extract-page-features.mjs <url-or-file>
//
// Also importable as a function:
//   import { extract } from "./scripts/extract-page-features.mjs";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { parseHTML } from "linkedom";

export function extract(html, route) {
  const { document } = parseHTML(html);
  for (const el of document.querySelectorAll("script,style,template")) el.remove();
  const text = (document.body?.textContent ?? "").replace(/\s+/gu, " ").trim();
  const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => ({
    depth: Number(h.tagName.slice(1)),
    text: h.textContent.replace(/\s+/gu, " ").trim(),
    id: h.getAttribute("id") ?? null,
  }));
  const links = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
  return { route, text, headings, links };
}

async function loadHtml(input) {
  if (/^https?:\/\//u.test(input)) {
    // redirect: "manual" so a redirecting URL is a hard error rather than a
    // silently-followed hop — Next's trailingSlash:false 308s a URL Astro
    // served as a plain 200, and filing the target's content under the
    // requested route would diff perfectly clean against that behavioural
    // difference (finding 3).
    const res = await fetch(input, { redirect: "manual" });
    if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) {
      throw new Error(`refusing to follow redirect: ${input} (status ${res.status})`);
    }
    if (!res.ok) {
      throw new Error(`fetch failed: ${res.status} ${res.statusText} (${input})`);
    }
    const route = new URL(input).pathname;
    return { html: await res.text(), route };
  }
  const html = await readFile(input, "utf8");
  return { html, route: input };
}

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.error("usage: node scripts/extract-page-features.mjs <url-or-file>");
    process.exit(1);
  }
  const { html, route } = await loadHtml(input);
  const result = extract(html, route);
  // Guard lives here, not in extract(): extract() must stay pure so later
  // stages can compose it over pages they already hold. A page with no text,
  // no headings and no links is the exact vacuous shape this task exists to
  // catch — a client-only shell, a swallowed error boundary, a soft-404 — and
  // it must fail loudly rather than diff clean against another empty page.
  if (result.text === "" && result.headings.length === 0 && result.links.length === 0) {
    throw new Error(`vacuous extraction: ${route} produced no text, no headings and no links`);
  }
  process.stdout.write(JSON.stringify(result));
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
