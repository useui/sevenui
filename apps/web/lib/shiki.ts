import "server-only";

import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

const highlighterPromise: Promise<HighlighterCore> = createHighlighterCore({
  themes: [import("@shikijs/themes/github-light"), import("@shikijs/themes/github-dark")],
  langs: [
    import("@shikijs/langs/tsx"),
    import("@shikijs/langs/css"),
    import("@shikijs/langs/bash"),
    import("@shikijs/langs/json"),
    import("@shikijs/langs/dotenv"),
  ],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

export type HighlightLang = "tsx" | "css" | "bash" | "json" | "dotenv";

export type HighlightStructure = "classic" | "inline";

const cache = new Map<string, string>();

export async function highlight(
  code: string,
  lang: HighlightLang,
  structure: HighlightStructure = "classic",
): Promise<string> {
  const key = structure + "\u0000" + lang + "\u0000" + code;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const hl = await highlighterPromise;
  const html = hl.codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
    structure,
  });
  cache.set(key, html);
  return html;
}

/**
 * The highlighted lines alone — the inside of Shiki's `<pre><code>` — for a caller that renders its own
 * `<code className="shiki">`. A trailing newline is dropped first so it does not become an empty, numbered last line.
 */
export async function highlightLines(code: string, lang: HighlightLang): Promise<string> {
  const html = await highlight(code.replace(/\n+$/, ""), lang, "classic");
  const match = /^<pre[^>]*><code>([\s\S]*)<\/code><\/pre>\s*$/.exec(html);
  if (!match) {
    throw new Error(
      "lib/shiki.ts: shiki's classic-structure output did not match the expected " +
        `"<pre ...><code>…</code></pre>" shape (got: ${html.slice(0, 120)}…). ` +
        "highlightLines()'s extraction regex needs updating to match the new shape.",
    );
  }
  return match[1] ?? "";
}
