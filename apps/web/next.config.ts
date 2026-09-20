import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import createMDX from "@next/mdx";

// The `@/*` alias points at packages/registry, outside this app directory, so
// Vercel's file tracing has to be told where the workspace actually starts
// (§3, §14.2). Turbopack needs nothing else; if a build ever falls back to
// webpack, `experimental.externalDir` is the escape hatch for the same reason.
const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: workspaceRoot,
  // `output: "export"` is OUT (§3): static export cannot do ISR, which is the
  // entire point of this migration. Everything except the three blocks routes,
  // sitemap.xml, llms.txt and the OG route is statically generated anyway.
  //
  // Rewrites live in vercel.json, which stays their single owner (§3). All
  // five targets are external, so nothing needs to compose with Next routing,
  // and re-expressing the /previews/:path* trailing-slash pair here would
  // reopen a debugged platform bug.
};

// The remark/rehype chain (§4.3), locked in this order:
//   remark:  remark-frontmatter(['yaml'])  ->  remark-gfm  ->  remark-smartypants
//   rehype:  rehype-slug  ->  rehype-autolink-headings(wrap)  ->
//            @shikijs/rehype  ->  rehype-external-links
//
// `remark-smartypants` (Fix F2) sits LAST in the remark half, after
// `remark-gfm` — the order Astro's markdown pipeline applied it in, which
// this chain must reproduce. Task 2.3 locked this chain without it, on the
// assumption remark-gfm's output already matched production; it didn't —
// production ran SmartyPants and this port initially did not, so 36 of 68
// docs routes lost smart punctuation (curly quotes/dashes/ellipses came out
// as straight ASCII). Its only options are plain booleans (`dashes: true`
// by default converts `--`/`---` to en/em dashes, which is desired and
// verified to match production's em/en dash counts exactly), so it needs no
// function-valued config and does not reopen the Turbopack plain-data
// constraint described below.
//
// `rehype-slug` must precede `rehype-autolink-headings` — it writes the
// `id` the anchor links to. Shiki emits no `<a>`, so its position in the
// rehype chain is free.
//
// Plugins are named by STRING here, not by imported function reference.
// Under Turbopack (the default the moment `next dev`/`next build` run bare,
// which apps/web's scripts do), `@next/mdx` puts this whole `options`
// object verbatim into `nextConfig.turbopack.rules[...].loaders[0].options`,
// and Turbopack's loader-options type is `Record<string, JSONValue>` — a
// function is not a JSONValue. A function-reference plugin entry
// JSON-round-trips to `null`, and `@mdx-js/mdx` then does
// `processor.use(null)`, which throws on the first MDX file compiled — a
// failure that would look Shiki-shaped (it dies inside the same array
// @shikijs/rehype sits in) but isn't: all six plugins collapse the same
// way, Shiki has nothing special to do with it. `@next/mdx`'s loader has
// `importPluginForPath()`/`importPlugin()` specifically to `require.resolve`
// a plugin named as a string from inside the loader, after crossing the
// Turbopack boundary — the string form is what keeps every plugin's
// OPTIONS as plain data while still surviving serialization itself.
//
// Every option value below is plain data (strings, booleans, arrays, plain
// objects) — no function-valued options anywhere. That is the OTHER half
// of Turbopack's constraint (loader option VALUES must be JSON-serializable
// too), and it is why `rehype-external-links` needs no function-valued
// `test` (Task 2.9 already removed the five same-origin absolute links
// that would have required one).
//
// Deliberately NOT in this chain: element overrides (a plain object passed
// at render time, Task 2.4), the TOC (Task 2.1's text scan), and
// `remark-mdx-frontmatter` (`title`/`description` come from the content
// index; this chain's only frontmatter job is stripping it from output).
const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-frontmatter", ["yaml"]], "remark-gfm", "remark-smartypants"],
    rehypePlugins: [
      "rehype-slug",
      ["rehype-autolink-headings", { behavior: "wrap" }],
      // `addLanguageClass: true` is a Task 2.4 amendment to this otherwise-
      // locked Task 2.3 chain: a plain boolean, so it does not reopen the
      // Turbopack plain-data constraint (§ Task 2.3's Critical). It is the
      // only JSON-serializable route to the fence's language surviving
      // Shiki's node replacement — every other route (a `transformers`
      // entry, `parseMetaString`) is function-valued and forbidden here.
      // It emits `class="language-<lang>"` on the rendered `<code>`
      // element, NOT `data-language` on the `<pre>` — there is no
      // plain-data option that writes the latter directly, so
      // `components/mdx/code-block.tsx` reads the language back off that
      // class instead of off a `data-language` prop.
      [
        "@shikijs/rehype",
        {
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: false,
          addLanguageClass: true,
        },
      ],
      ["rehype-external-links", { target: "_blank", rel: ["noopener", "noreferrer"] }],
    ],
  },
});

// `pageExtensions` is deliberately NOT extended: route-file MDX was
// rejected (§4.1). The 68 files stay under `apps/web/docs/` and are
// imported as ordinary modules, never treated as routes themselves.
export default withMDX(nextConfig);
