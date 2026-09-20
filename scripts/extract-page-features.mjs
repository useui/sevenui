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

// Elements that are inline by HTML's default display (no stylesheet involved —
// §17.2 must stay style-blind). An inline element's text joins its neighbours
// with no separator, exactly like a bare text node would.
const INLINE_TAGS = new Set([
  "A", "ABBR", "B", "BDI", "BDO", "CITE", "CODE", "DATA", "DFN", "EM", "I", "KBD",
  "MARK", "Q", "RP", "RT", "RUBY", "S", "SAMP", "SMALL", "SPAN", "STRONG", "SUB",
  "SUP", "TIME", "U", "VAR", "WBR", "IMG", "PICTURE", "SOURCE", "BUTTON", "INPUT",
  "LABEL", "SELECT", "TEXTAREA", "OUTPUT", "METER", "PROGRESS", "SLOT", "OBJECT",
  "EMBED", "IFRAME", "AUDIO", "VIDEO", "CANVAS", "MAP", "AREA", "NOSCRIPT", "DEL",
  "INS",
]);

// Block-level-aware text extraction. Fixes: `document.body.textContent`
// concatenates sibling text nodes with no separator, so `<td>a</td><td>b</td>`
// (our React SSR's table markup) extracts as "ab" where production's
// pretty-printed Astro/remark markup has a newline between the cells. Walking
// the tree and inserting a separator around every non-inline element restores
// the word boundary a real browser's rendering would put there, without
// depending on any stylesheet.
function extractBlockText(root) {
  let out = "";
  const walk = (node) => {
    if (node.nodeType === 3 /* Text */) {
      out += node.textContent;
      return;
    }
    if (node.nodeType !== 1 /* Element */) return;
    // Uppercase defensively: the set lookup below must not depend on
    // tagName casing, whatever it happens to be for this element.
    const tag = node.tagName.toUpperCase();
    if (tag === "WBR") return; // zero-width break opportunity: no whitespace, no content
    if (tag === "BR") {
      // A line break by definition — it separates even though BR is inline.
      out += " ";
      return;
    }
    if (tag === "SVG") {
      // An icon subtree is opaque: separators go around it, never inside it,
      // so an icon set can never contribute a word boundary.
      out += " " + node.textContent + " ";
      return;
    }
    const inline = INLINE_TAGS.has(tag);
    if (!inline) out += " ";
    for (const child of node.childNodes) walk(child);
    if (!inline) out += " ";
  };
  if (root) walk(root);
  return out;
}

export function extract(html, route) {
  const { document } = parseHTML(html);
  for (const el of document.querySelectorAll("script,style,template")) el.remove();
  const text = extractBlockText(document.body).replace(/\s+/gu, " ").trim();
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
