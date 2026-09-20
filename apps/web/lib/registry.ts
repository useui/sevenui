// Single source of truth for shadcn CLI install commands. The @sevenui
// namespace only works once it lands in the shadcn registry directory (or the
// user configures it in components.json), so default to direct URLs until then.
import { PACKAGE_MANAGERS, PACKAGE_MANAGER_RUNNERS, type PackageManager } from "./package-manager";

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

/**
 * One command in all four dialects, keyed by package manager.
 *
 * `<CopyCommand>` (components/copy-command.tsx) ships every variant and lets
 * CSS reveal one off `[data-pm]` (§13.2), so its caller has to build the
 * whole record — a builder function cannot be passed across the
 * server/client boundary, only the plain data it produces. This exists so
 * the landing page's three install rows and, next, the `/components` example
 * cards (§17.6 #15) do not each rewrite the same `Object.fromEntries` over
 * `PACKAGE_MANAGERS`.
 *
 * `build` is called once per package manager, so it works for the two shapes
 * this site has: `installCommand(item, pm)` for a registry item, and a plain
 * `${PACKAGE_MANAGER_RUNNERS[pm]} …` template for a bare CLI invocation like
 * `shadcn@latest init`, which has no registry item to name.
 *
 * `<InstallCommand>` deliberately does NOT go through this: its builder is
 * async (each variant is Shiki-highlighted) and it needs the highlighted
 * HTML alongside the string.
 */
export const packageManagerCommands = (
  build: (pm: PackageManager) => string,
): Record<PackageManager, string> =>
  Object.fromEntries(PACKAGE_MANAGERS.map((pm) => [pm, build(pm)])) as Record<PackageManager, string>;
