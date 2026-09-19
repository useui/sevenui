import "server-only";

import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

// The second (non-MDX) highlighter, for demo sources, <InstallCommand> and
// the Stage 4 gallery cards. `@shikijs/rehype`'s highlighter instance lives
// inside the MDX compile pipeline and cannot be shared here: a highlighter
// is not JSON-serializable, and Turbopack's loader-option constraint (used
// by next.config.ts's MDX chain) requires plain data. So this is a SECOND
// instance, not the same one — same 4-grammar fine-grained bundle, built
// independently.
//
// The languages are exactly these four, and there is NO fence meta anywhere
// in the corpus — no titles, line numbers, ranges, `// [!code …]`, inline
// {:ts} or twoslash — so 7 of Blume's 8 transformers are moot and
// rehype-pretty-code buys nothing (§4.4). The fine-grained bundle (these 4
// langs + 2 themes) is 287 KB versus 11 MB for the full bundle, with
// byte-identical output on all 214 real blocks (77 fences + 137 demo
// sources).
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

// THE ONE BINDING RULE (§4.4, §18.5): highlight each unique source once and
// memoize it for the whole build. The 137 demo sources recur across pages,
// so a per-call `codeToHtml` re-highlights the same source on every page
// that reuses it. Measured: 322 blocks / 207 KiB takes 740 ms with
// per-call codeToHtml versus 576 ms with a reused highlighter and this
// cache — this Map is what makes the second number the one that ships.
const cache = new Map<string, string>();

export async function highlight(code: string, lang: HighlightLang): Promise<string> {
  const key = lang + "\u0000" + code;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const hl = await highlighterPromise;
  const html = hl.codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
  cache.set(key, html);
  return html;
}
