// Single source of truth for shadcn CLI install commands. The @sevenui
// namespace only works once it lands in the shadcn registry directory (or the
// user configures it in components.json), so default to direct URLs until then.
import { PACKAGE_MANAGER_RUNNERS, type PackageManager } from "./package-manager";

const USE_NAMESPACE = true;

const REGISTRY_BASE = "https://sevenui.dev/r";

/**
 * Build the shadcn CLI install command for a registry item.
 *
 * @param item Registry item path: `"button"`, `"component/accordion-01"`, `"pro/dashboard-01"`, `"demo/accordion-demo"`.
 * @param pm Which package manager's runner to prefix. Defaults to npm so every
 *   existing caller (the docs' `<InstallCommand />`, the `/components` example
 *   cards) keeps emitting the exact `npx …` string it emitted before the
 *   parameter existed — only the /blocks install control varies it.
 */
export const installCommand = (item: string, pm: PackageManager = "npm"): string =>
  USE_NAMESPACE
    ? `${PACKAGE_MANAGER_RUNNERS[pm]} shadcn@latest add @sevenui/${item}`
    : `${PACKAGE_MANAGER_RUNNERS[pm]} shadcn@latest add ${REGISTRY_BASE}/${item}.json`;
