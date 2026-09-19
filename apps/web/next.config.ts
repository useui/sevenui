import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

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

export default nextConfig;
