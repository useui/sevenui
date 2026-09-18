# Code highlighting parity

Type: research
Status: resolved

## Question

Every docs page renders code, and the demo source panes render 137 `.tsx`
files. Blume highlights both through one Shiki setup, and the current output is
the parity reference.

Establish the facts, then the decision:

1. What Shiki themes are in effect today? `blume.config.ts` sets no
   `codeThemes`, so Blume's default applies — find it in the Blume source and
   record the exact theme names for light and dark, plus how the two are
   switched (dual-theme CSS variables, or a `data-theme`-scoped swap).
2. How is the language set resolved, and which languages do the 68 docs plus 137
   demos actually use? A full Shiki bundle is large; the language list decides
   whether a narrowed bundle is worth it.
3. What does Blume's `blume-source` class do? Its comment in
   `Component.astro` says it makes the inner `<code>` (not the `<pre>`) the
   scroll/height-capped box, so the copy button pinned to the `<pre>` stays put.
   This behaviour has to be reproduced or deliberately changed.
4. The copy button: where does it come from today, what is its exact placement
   and feedback behaviour, and does `copy-command.tsx` already cover it?
5. `<CodeGroup>` / `<Tabs>` / `<Diff>` — what do they add on top of a plain
   fence, and which of them survive per
   `04-mdx-content-component-parity-set`?
6. In the chosen pipeline, does highlighting run as a rehype plugin
   (`rehype-pretty-code`, `@shikijs/rehype`) or as a direct Shiki call? Record
   what each implies for build time across 68 pages plus 137 demo sources.

Record findings as a Markdown file in the repo and link it from the answer.

## Context

Dispatched to a research subagent on 2026-09-18. Findings land at
`docs/superpowers/research/2026-09-18-code-highlighting-parity.md`
on branch `research/code-highlighting-parity`.

## Answer

Resolved 2026-09-19 by research subagent. Findings (1001 lines):
`docs/superpowers/research/2026-09-18-code-highlighting-parity.md` on branch
`research/code-highlighting-parity` (commit `8caae67`) — **not on `main`**.

### Current output — exact facts

**Themes: `github-light` / `github-dark`**, both Blume defaults
(`blume/src/core/schema.ts:1414-1417`, `blume/src/markdown/themes.ts:26-29`).
`blume.config.ts` has no `markdown` key at all, so `code.icons: true` and
`code.wrap: false` also apply. Shiki in the lockfile is **4.4.3**.

**Switch mechanism.** Shiki dual-theme with `defaultColor: false`, emitting
`--shiki-light` / `--shiki-dark` (plus `-font-style`, `-font-weight`,
`-text-decoration`) on `<pre>` and every token span; CSS selects with
`:root[data-theme="dark"] .prose :where(pre.astro-code span)`. There are
**zero `prefers-color-scheme` rules in the live CSS bundle** — the OS preference
is read once in JS by a head script that writes `data-theme` from
`localStorage["blume-theme"]`. Shiki's `--shiki-*-bg` variables are emitted and
read by nothing. (The storage key and the no-media-query design are carried into
`07-theme-mechanism-and-token-ownership`.)

**Two code paths already diverge today.** Fences go through Astro
(`class="astro-code astro-code-themes github-light github-dark"`, always a
`data-language`, inline `overflow-x:auto`, trailing newline stripped). The 137
demo source panes, 68 `InstallCommand` renders and 40 gallery cards go through
Blume's `highlightCode` → `codeToHtml` (`class="astro-code [blume-source] shiki
shiki-themes github-dark github-light"`, no `data-language`, **theme order
reversed** because the pair is configured in two places). These five
class-name/order differences are diff noise, not parity requirements.

**Languages: exactly 4** — `tsx` (72 fences + all 137 demos + 40 gallery), `css`
(2), `bash` (2 + 68 installs), `json` (1). **No fence meta anywhere**: no
titles, `lineNumbers`, `{1,3-5}` ranges, `// [!code …]`, inline
`` `x`{:ts} ``, or `twoslash`. So 7 of Blume's 8 transformers change nothing
today.

**`blume-source` is obsolete on arrival.** It is one extra `<pre>` class whose
CSS makes the `<pre>` a non-scrolling full-height flex column and the `<code>`
the scroller, so the absolutely-pinned copy button never drifts. Its height came
from the preview **iframe's** postMessage — and demos now render inline, so the
contract it existed to serve is gone. `blume-source` appears nowhere in this
repo, and `apps/web/theme.css` has no code rules at all.

**Copy button is not in the HTML.** Injected client-side over `.prose pre`,
appended as the `<pre>`'s last child: `absolute right-3 top-2` (`top-2.5` in
tabs), 30 px chip, lucide copy→check `scale-0` swap, 1500 ms hold that restarts
on repeat, no flash on clipboard failure, `aria-label` swap plus one shared
`div[role="status"].sr-only`. The same script pretty-labels `data-language`
(`tsx`→`TSX`) and moves `tabindex` from `<pre>` to `<code>`.
**`copy-command.tsx` does not cover this** — different UI (a `$ command` row),
1600 ms, no live region, and used only by `example-card.astro` and
`pages/index.astro`.

**Component usage:** `<CodeGroup>` and `<Diff>` have **zero** uses. `<Tabs>` has
zero direct uses but ships inside all 137 `<Component>`s; `<CodeBlock>` zero
direct but 108 indirect. Consistent with the 2-component finding in
`01-nextjs-mdx-pipeline-options`.

### Replacement options (versions verified against registries)

- **`@shikijs/rehype` 4.4.3** — first-party, pins `shiki` exactly, offers
  `cache`, `parseMetaString`, `inline: 'tailing-curly-colon'`, and
  `rehypeShikiFromHighlighter` for sharing one highlighter with the non-fence
  callers (which this site needs, given the two code paths).
- **`rehype-pretty-code` 0.14.5** (2026-07-25, 30 open issues, still 0.x, ~4
  months behind Shiki 4) — uniquely buys `grid` output, title/caption figures,
  char-range highlighting and its own line-number convention. None of which the
  current corpus uses.
- **A direct Shiki call**, as Blume does today.

`@shikijs/transformers` already covers diff, `{1,3-4}` meta ranges, word
highlight, focus and line numbers.

Not-to-pick, with evidence: `getHighlighter` (removed in v3), `shiki-twoslash`
(archived 2024-02-19), `@stefanprobst/rehype-shiki` (2023), `rehype-highlight`
(alive but highlight.js, not Shiki).

**External constraint, consistent with `01`:** under `@next/mdx` + Turbopack,
rehype plugins must be strings with JSON-serializable options — no
`transformers`, `cache`, or `onVisit*`. A hand-rolled pipeline, already the
settled direction, is unaffected.

### Build-time and payload, measured on the real corpus

322 blocks / 207 KiB → **740 ms** with per-call `codeToHtml` (first block
133 ms) versus **576 ms** with a reused highlighter. Output is **~2.0 MiB of
dual-theme HTML** — 8.4x the source, +55% raw and +13% gzip over single-theme,
and **33% of the live button page**.

A fine-grained 4-grammar highlighter is **byte-identical on all 214 real
blocks** (287 KB of grammars versus 11 MB for the full bundle), at the cost of
losing `guessEmbeddedLanguages` auto-loading. The JS engine costs 1 ms init
versus 31 ms but runs 46% slower, with identical output.

**CPU is not the bottleneck; payload is** — and the App Router duplicates that
HTML into the RSC flight payload. This sharpens the performance question in the
map's fog.
