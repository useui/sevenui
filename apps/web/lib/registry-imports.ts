// Docs and the gallery display demo sources verbatim from packages/registry,
// where imports are written in the registry's own shape:
//
//   import { Button } from "@/registry/base/ui/button";
//
// That spelling is deliberate and must stay in the source (see the registry
// import convention: the style segment is what makes shadcn's alias transform
// fire, and a future Radix base will take `registry/radix/ui/*`). But it is
// not what a user ever has on disk. `shadcn add` rewrites every specifier
// through their components.json aliases on the way in, so the file they end up
// with says `@/components/ui/button`. Printing the raw source therefore
// documents a path that exists in no installed project — and worse, the same
// .md mirror contradicts itself, because the hand-written Usage block above
// the demo already says `@/components/ui/button`.
//
// This module closes that gap at the display layer only. The published
// registry JSON keeps the raw spelling; the CLI still does the real transform.
// We just show what the CLI is going to produce.
//
// The branch order below is not invented: it mirrors shadcn 4.19.1's own
// resolver (dist/chunk-JKB2HING.js), applied with shadcn's default aliases.
// Mirroring the cascade rather than hardcoding `base` is what keeps the two
// from drifting — a second base lands in the registry and this keeps matching
// the CLI with no edit here.

/** shadcn's default components.json aliases — the install target docs depict. */
const ALIASES = {
  ui: "@/components/ui",
  components: "@/components",
  hooks: "@/hooks",
  lib: "@/lib",
  utils: "@/lib/utils",
} as const;

/**
 * shadcn 4.19.1's `@/registry/*` cascade, branch for branch and regex for
 * regex. Order matters: `/ui` is tested before `/lib/utils`, which is tested
 * before the broader `/lib`, and an unrecognised subtree falls back to the
 * components alias.
 */
const CASCADE: readonly (readonly [RegExp, (typeof ALIASES)[keyof typeof ALIASES]])[] = [
  [/^@\/registry\/(.+)\/ui/, ALIASES.ui],
  [/^@\/registry\/(.+)\/lib\/utils$/, ALIASES.utils],
  [/^@\/registry\/(.+)\/components/, ALIASES.components],
  [/^@\/registry\/(.+)\/lib/, ALIASES.lib],
  [/^@\/registry\/(.+)\/hooks/, ALIASES.hooks],
  [/^@\/registry\/[^/]+/, ALIASES.components],
];

/**
 * Rewrite one module specifier the way `shadcn add` would. Anything that is
 * not a `@/registry/*` path is returned untouched.
 */
export function rewriteRegistryImportPath(specifier: string): string {
  for (const [pattern, alias] of CASCADE) {
    // `/lib/utils` is an exact-specifier branch in the CLI, so it replaces the
    // whole thing rather than a prefix.
    if (pattern.source.endsWith("$") && pattern.test(specifier)) return alias;
    if (pattern.test(specifier)) return specifier.replace(pattern, () => alias);
  }
  return specifier;
}

// Every `@/registry/*` occurrence in a demo lives inside a quoted module
// specifier, so a path-charset match is enough to find them all without
// parsing. Quotes are outside the class, which bounds each match.
const REGISTRY_SPECIFIER = /@\/registry\/[A-Za-z0-9._/-]+/g;

/**
 * Rewrite every `@/registry/*` specifier in a source file to the path the
 * reader will actually have after `shadcn add`.
 */
export function rewriteRegistryImports(code: string): string {
  return code.replace(REGISTRY_SPECIFIER, (specifier) => rewriteRegistryImportPath(specifier));
}
