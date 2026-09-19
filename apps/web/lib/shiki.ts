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

// Task 2.7 discrepancy (brief step 2 vs. reality): `codeToHtml`'s default
// structure ("classic") returns a COMPLETE `<pre class="shiki …"><code>…`
// fragment — a `<pre>` cannot legally nest inside `CodeBlock`'s own `<pre>`
// (invalid content model), and <InstallCommand> needs four such fragments
// side by side, not one. `structure: "inline"` instead returns bare
// `<span>`s (line breaks as `<br>`, no `<pre>`/`<code>` wrapper at all,
// "default foreground/background colors are not applied" — the same
// `defaultColor: false` contract this file already relies on), which the
// caller wraps in its OWN phrasing-content element (see
// components/mdx/install-command.tsx) carrying `class="shiki"` so
// globals.css's `.shiki`/`.shiki span` colour rules still match — verified
// against real output (task-2.7-report.md) that the `--shiki-light`/
// `--shiki-dark` custom properties still land on the inner spans.
//
// One measured divergence between the two structures (fix round 1,
// task-2.7 review MINOR 3), not just a shape difference: "classic" sets
// `--shiki-light`/`--shiki-dark` on the WRAPPER `<pre>` itself (its own
// `style` attribute, the theme's default foreground — `#24292e` /
// `#e1e4e8` for github-light/dark), so globals.css's
// `.shiki { color: var(--shiki-light, var(--foreground)) !important }`
// resolves to that theme value. "inline" sets no such property on
// anything but the individual token `<span>`s, so the SAME rule, evaluated
// on an inline-mode wrapper, has nothing to read and falls through to its
// `var(--foreground)` fallback instead. Invisible for every caller so far
// (every character in these four bash commands sits inside a coloured
// span with its own `--shiki-light`, which `.shiki span`'s rule reads
// directly — `.shiki`'s own `color` never gets asked to render anything),
// but this is a REAL divergence, not a false alarm: Task 2.6 is the next
// task and highlights 137 demo sources through a caller of `"inline"` —
// any bare/unwrapped text a future language leaves outside a span (or a
// span whose grammar assigns no color) will render in the theme's DEFAULT
// foreground under "classic" and in this app's `--foreground` token under
// "inline". The two happen to be visually close in this port's default
// theme but are not the same value and are not guaranteed to stay close.
//
// Separately measured and NOT a limitation of "inline": neither structure
// emits `-font-style`/`-font-weight`/`-text-decoration` for any of the
// four languages this file highlights (bash/tsx/css/json) under
// github-light/github-dark — those themes assign no `fontStyle` to these
// tokens, so `.shiki span`'s `var(…, inherit)` fallbacks for those three
// properties behave identically in both structures. That's a property of
// the two themes, not something "inline" drops that "classic" would keep.
export type HighlightStructure = "classic" | "inline";

// THE ONE BINDING RULE (§4.4, §18.5): highlight each unique source once and
// memoize it for the whole build. The 137 demo sources recur across pages,
// so a per-call `codeToHtml` re-highlights the same source on every page
// that reuses it. Measured: 322 blocks / 207 KiB takes 740 ms with
// per-call codeToHtml versus 576 ms with a reused highlighter and this
// cache — this Map is what makes the second number the one that ships.
//
// The cache key includes `structure` (Task 2.7): "classic" and "inline"
// output for the SAME code+lang are different HTML shapes (one has a
// `<pre><code>` wrapper, the other is bare spans) — a key that only
// distinguished lang+code would let whichever structure hit the cache
// first silently serve the wrong shape to the other caller. Task 2.3 lost
// a round to exactly this class of bug (a cache key missing a dimension).
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
