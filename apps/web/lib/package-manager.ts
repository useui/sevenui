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

function isPackageManager(value: unknown): value is PackageManager {
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
