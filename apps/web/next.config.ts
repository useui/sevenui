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
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-frontmatter", ["yaml"]], "remark-gfm", "remark-smartypants"],
    rehypePlugins: [
      "rehype-slug",
      ["rehype-autolink-headings", { behavior: "wrap" }],
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

export default withMDX(nextConfig);
