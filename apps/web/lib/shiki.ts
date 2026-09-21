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
  ],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

export type HighlightLang = "tsx" | "css" | "bash" | "json";

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
