# Next.js MDX pipeline options

Type: research
Status: resolved

## Question

The docs pipeline is hand-rolled (settled). Before choosing its shape, establish
what the current Next.js and MDX ecosystem actually offers, against this site's
requirements:

- 68 `.mdx` files under `apps/web/docs/`, served under the `/docs` base path,
  with typed frontmatter (`title`, `description` — confirm whether any page uses
  more).
- ~40 custom MDX components must be in scope, plus `<Component path="…" />`
  (137 uses) and `<InstallCommand item="…" />` (68 uses).
- A queryable content index is needed by four consumers: the sidebar nav, the
  search palette, the agent-facing Markdown outputs, and prev/next links.
- Headings must be extractable for a TOC.
- The raw MDX body must remain reachable at build time for `/llms-full.txt` and
  the per-page `.md` endpoints.

Establish, from primary sources (Next.js docs, MDX docs, the libraries' own
repos — not blog posts):

1. `@next/mdx` — how it handles frontmatter (it does not, natively: what is the
   standard remedy?), whether MDX-as-route-file can coexist with a catch-all
   route, and how components are provided (`mdx-components.tsx`).
2. `next-mdx-remote` / `next-mdx-remote-client` RSC entry points — current
   maintenance status, the compile-at-request vs compile-at-build story, and
   whether RSC serialization imposes limits on the component set.
3. Content layers: `velite`, `content-collections`, and any current equivalent —
   what they generate, whether the generated index is typed, how MDX is compiled
   (their own pipeline or handed to one), and what the watch story is in `next
   dev`.
4. The remark/rehype plugin surface each option exposes, since the pipeline
   needs at minimum: frontmatter parsing, heading slugs + TOC extraction, Shiki
   highlighting, and an external-link `rel` pass (today a post-build HTML
   rewrite in `blume.config.ts`; a rehype plugin would be the better home).
5. Whether any option meaningfully constrains RSC vs client boundaries for MDX
   content, given the inline demos are React components rendered in the page.

Record the findings as a Markdown file in the repo and link it from the answer.
Do not pick — `02-docs-content-pipeline-decision` picks.

## Context

Dispatched to a research subagent on 2026-09-18. Findings land at
`docs/superpowers/research/2026-09-18-nextjs-mdx-pipeline-options.md`
on branch `research/nextjs-mdx-pipeline-options`.

## Answer

Resolved 2026-09-18 by research subagent. Findings (697 lines):
`docs/superpowers/research/2026-09-18-nextjs-mdx-pipeline-options.md` on branch
`research/nextjs-mdx-pipeline-options` (commit `45da335`) — **not on `main`**.

### Two measurements that change the question

**1. The authored custom-MDX surface is 2 components, not ~40.** Stripping code
fences from all 68 `.mdx` leaves only `<Component>` (137 uses) and
`<InstallCommand>` (68 uses). The "~40" figure was Blume's *available* set (35
content components in `blume/src/components/content/` plus element overrides);
the charting session's tag count had included JSX inside fenced demo sources.
The migration must reproduce the **element overrides** and **exactly two**
content components. `04-mdx-content-component-parity-set` has been corrected.

**2. Frontmatter is exactly `title` + `description`** on all 68 files, no other
key anywhere. Also: 81 of 137 demos and 42 of 65 registry UI files already
carry `"use client"`.

### Environment

**Next.js 16.3.5 (2026-09-17); Turbopack has been the default bundler since
16.0.0.** So the Turbopack plugin rule is the live path: *options passed to
loaders must be plain JavaScript primitives, objects and arrays*. That kills
function-valued plugin options — including `rehype-external-links`'s `test`
(the only way to exclude `sevenui.dev`, since "external" is decided by
`protocols`, not hostname) and Shiki `transformers`.

**The escape hatch is in the source, not the docs:**
`packages/next-mdx/mdx-js-loader.js` resolves string plugins through
`require.resolve(pluginPath, { paths: [projectRoot] })` then `await import()`,
so a **local wrapper module** that hardcodes the function works. Resolution is
relative to the MDX file's directory — verify empirically.
`experimental.mdxRs` stays "not recommended for production" and ignores plugins
entirely (markdown-rs has no hook).

**`vfile.data` is unreachable through `@next/mdx`** — it is a loader, it
stringifies and discards the VFile. A TOC must therefore come from an
export-emitting plugin, and the only off-the-shelf one (`remark-mdx-toc`) last
shipped 2022-08-01. This is the crispest dividing line in the option space.

### Library health (all verified against registries and repos)

- `next-mdx-remote`: **archived** (last push 2026-03-26, 66 open issues) with an
  open RSC-breaking bug on Next 15.2+ (#488).
- `next-mdx-remote-client` 2.1.12 (2026-08-11): alive, 3 open issues. Its
  `vfileDataIntoScope` is the **only** option that yields `vfile.data.toc`
  without owning the compile. Note the Next 15 docs recommended it and the
  **current 16.3.5 guide dropped the "Remote MDX" section entirely**.
- `contentlayer`: **dead** (0.3.4, 2023-06-29). `contentlayer2`: stalled 16
  months.
- `velite` 0.4.0: alive, but on a **vendored, patched Zod v3** (Zod v4 only in
  an unreleased 1.0 alpha) and its webpack plugin is documented as broken under
  Turbopack.
- `content-collections`: alive, on Standard Schema, but routes MDX through
  `mdx-bundler` + `esbuild`.
- `gray-matter` 4.0.3 dates to **2021-04-24**, is CJS-only, and still depends on
  `js-yaml@^3`. Prefer `vfile-matter`.

### Two conclusions worth carrying

- **No option meaningfully constrains the component set** (the ticket's Q5).
  Every path passes components as a plain object at render time. What is
  actually forbidden is narrower: Pages-Router `serialize()` scope values, and
  `MDXProvider`, which "doesn't always work (such as in RSC)".
- **The content index does not justify a library.** All six option shapes pair
  with the same ~60-line `fs` + `vfile-matter` module — which is what Blume
  already does (`discoverContent` → `PageRecord[]` plus its own heading
  scanner).

### Option space

Six shapes, documented with trade-offs: **A** route-file MDX, **B**
dynamic-import catch-all, **C** own `@mdx-js/loader` rule, **D**
`next-mdx-remote-client/rsc`, **E** content layer, **F** own codegen. Plus seven
failure modes to smoke-test regardless of choice.

### The failure mode with frozen-URL consequences

**Heading anchor IDs will drift.** `rehype-slug` uses `github-slugger`; Blume
uses its own Unicode-class `slugify`, deliberately matched to its renderer.
Heading anchors are published deep links, so this is a contract break, not a
cosmetic difference. Recorded as a requirement in
`02-docs-content-pipeline-decision` and as a gate in `13-parity-proof-method`.

## Correction (2026-09-19, by `02-docs-content-pipeline-decision`)

**"Heading anchor IDs will drift" is wrong, and with it the requirement it
generated.** The `slugify` this ticket found in
`blume/src/core/sources/normalize.ts` is for *route* slugs and for the
OpenAPI/Sanity/Notion sources — none of which this site uses. Heading anchors
are set by `blume/src/markdown/heading-anchors.ts`, which uses
**`github-slugger`**, and `extractHeadings` uses the same slugger (its source
comment justifies the choice over a hand-rolled slugify explicitly). That is the
library `rehype-slug` uses, so the IDs match by construction.

Verified live: `...radiogroup--contextmenuradioitem` (double hyphen preserved),
`detached-triggers-createhandle`, and `examples`/`examples-1`. Corpus facts that
close it: no `# ` in any of the 68 files, exactly one duplicate heading text in
the corpus, and the page-title `<h1>` carries no `id` and does not advance the
slugger.

Porting a slug algorithm is **not** required. It is a smoke test.
`13-parity-proof-method` keeps the anchor-ID gate with a corrected reason.

### Added to this ticket's smoke-test list

Verify that a template-literal `import(\`../../docs/${path}.mdx\`)` produces a
Turbopack context module covering **nested** directories (`components/button`),
not just the top level. If it does not, the import expression changes — not the
routing shape chosen in `02`.
