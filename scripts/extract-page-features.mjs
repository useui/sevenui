#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { parseHTML } from "linkedom";

const INLINE_TAGS = new Set([
  "A", "ABBR", "B", "BDI", "BDO", "CITE", "CODE", "DATA", "DFN", "EM", "I", "KBD",
  "MARK", "Q", "RP", "RT", "RUBY", "S", "SAMP", "SMALL", "SPAN", "STRONG", "SUB",
  "SUP", "TIME", "U", "VAR", "WBR", "IMG", "PICTURE", "SOURCE", "BUTTON", "INPUT",
  "LABEL", "SELECT", "TEXTAREA", "OUTPUT", "METER", "PROGRESS", "SLOT", "OBJECT",
  "EMBED", "IFRAME", "AUDIO", "VIDEO", "CANVAS", "MAP", "AREA", "NOSCRIPT", "DEL",
  "INS",
]);

function extractBlockText(root) {
  let out = "";
  const walk = (node) => {
    if (node.nodeType === 3 /* Text */) {
      out += node.textContent;
      return;
    }
    if (node.nodeType !== 1 /* Element */) return;
    const tag = node.tagName.toUpperCase();
    if (tag === "WBR") return; // zero-width break opportunity: no whitespace, no content
    if (tag === "BR") {
      // A line break by definition — it separates even though BR is inline.
      out += " ";
      return;
    }
    if (tag === "SVG") {
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
