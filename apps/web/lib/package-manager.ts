export const PACKAGE_MANAGER_KEY = "sevenui:package-manager";

export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export const DEFAULT_PACKAGE_MANAGER: PackageManager = "pnpm";

export const PACKAGE_MANAGER_RUNNERS: Record<PackageManager, string> = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
};

export function isPackageManager(value: unknown): value is PackageManager {
  return typeof value === "string" && (PACKAGE_MANAGERS as readonly string[]).includes(value);
}

export function readPackageManager(storage: Pick<Storage, "getItem">): PackageManager {
  const raw = storage.getItem(PACKAGE_MANAGER_KEY);
  return isPackageManager(raw) ? raw : DEFAULT_PACKAGE_MANAGER;
}

export function currentPackageManager(): PackageManager {
  if (typeof document === "undefined") return DEFAULT_PACKAGE_MANAGER;
  const value = document.documentElement.dataset.pm;
  return isPackageManager(value) ? value : DEFAULT_PACKAGE_MANAGER;
}

export const packageManagerCommands = (
  build: (pm: PackageManager) => string,
): Record<PackageManager, string> =>
  Object.fromEntries(PACKAGE_MANAGERS.map((pm) => [pm, build(pm)])) as Record<PackageManager, string>;
