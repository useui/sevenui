// The package-manager preference shown on every install control, and the
// runner prefixes that turn one shadcn invocation into four dialects.
//
// Deliberately NOT part of `@sevenui/presets`' `preset-config`: that key is the
// theme contract every preview iframe (free and pro) parses and re-applies, and
// `presetConfigSchema` is a plain `z.object`, so Zod strips unknown keys —
// `readPresetConfig` would drop a `packageManager` field, and the dock's
// `{ ...readPresetConfig(localStorage), [field]: value }` write-back would then
// erase the preference on every theme/base/radius click. A sibling key with the
// same tolerant-read shape keeps the two preferences independent, and keeps a
// package-manager change from forcing a full re-theme of every open preview.

export const PACKAGE_MANAGER_KEY = "sevenui:package-manager";

export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export const DEFAULT_PACKAGE_MANAGER: PackageManager = "pnpm";

/**
 * How each package manager executes a bin it has not installed. Verified
 * against ui.shadcn.com/docs/cli's own markup rather than its rendered tabs,
 * which naively substitute prefixes and emit nonexistent `npm dlx` / `bun dlx`.
 *
 * Two of these are load-bearing, not cosmetic:
 * - `yarn dlx` is Yarn Berry only. Yarn 1 Classic has no npx equivalent at all,
 *   so the yarn dialect is knowingly Berry-only — the alternative (emitting
 *   `npx` under a yarn label) diverges from upstream shadcn's own docs, which
 *   is its own support cost.
 * - `--bun` must PRECEDE the executable name. It forces shadcn's
 *   `#!/usr/bin/env node` bin onto Bun's runtime instead of spawning Node.
 */
export const PACKAGE_MANAGER_RUNNERS: Record<PackageManager, string> = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
};

/**
 * Exported (fix round 1, task-2.7 review MINOR 1) so every writer of
 * `dataset.pm` / `localStorage[PACKAGE_MANAGER_KEY]` can validate before
 * writing, not just the two readers (`readPackageManager`,
 * `currentPackageManager`) that already did. An unvalidated write is the
 * one state where NOTHING renders: an invalid `data-pm` matches neither
 * `:root:not([data-pm])` nor any `[data-pm="…"]` in globals.css, so every
 * `.pm-only-<pm>` variant stays hidden and an install block goes empty,
 * while `currentPackageManager()`'s own tolerant read silently falls back
 * to pnpm for copy — a visible-empty/copies-anyway split that is worse
 * than either failure alone.
 */
export function isPackageManager(value: unknown): value is PackageManager {
  return typeof value === "string" && (PACKAGE_MANAGERS as readonly string[]).includes(value);
}

/**
 * Tolerant read, mirroring `readPresetConfig`: a toolbar must never break
 * because of a bad preference, so anything unrecognised yields the default.
 */
export function readPackageManager(storage: Pick<Storage, "getItem">): PackageManager {
  const raw = storage.getItem(PACKAGE_MANAGER_KEY);
  return isPackageManager(raw) ? raw : DEFAULT_PACKAGE_MANAGER;
}

/**
 * The live preference, read off `<html data-pm>` rather than localStorage
 * directly (Task 2.7). `<PackageManagerScript>` (Stage 1) writes this
 * attribute pre-paint on every page — it is the same value CSS's `.pm-only`
 * selectors key off (globals.css), so this is "whichever command is
 * currently revealed," not a possibly-stale localStorage read. Mirrors
 * block-frame.astro's own `currentPm()`. SSR-safe: returns the default when
 * `document` does not exist (Node/build time), matching that attribute's
 * own pre-script fallback (`:root:not([data-pm])` selects pnpm).
 */
export function currentPackageManager(): PackageManager {
  if (typeof document === "undefined") return DEFAULT_PACKAGE_MANAGER;
  const value = document.documentElement.dataset.pm;
  return isPackageManager(value) ? value : DEFAULT_PACKAGE_MANAGER;
}
