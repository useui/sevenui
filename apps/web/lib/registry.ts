// Single source of truth for shadcn CLI install commands. The @sevenui
// namespace only works once it lands in the shadcn registry directory (or the
// user configures it in components.json), so default to direct URLs until then.
//
// The trailing ".ts" below looks like an inconsistency to "fix" — it is the
// only extensioned relative import in apps/web, and stripping it back off
// still passes `pnpm typecheck` and `next build` (verified) because both
// resolve it through Next's/tsc's own extensionless module resolution. Leave
// it: `lib/docs/serialize-md.ts` imports `installCommand` from this file with
// its own explicit ".ts" specifier so it can be loaded by plain Node with no
// build step (Task 8.2's `apps/web/scripts/build-md-mirrors.ts` does exactly
// that, before `next build` even runs), and that Node runtime is only
// resolving relative specifiers as written on disk — it has no bundler to
// paper over an extensionless "./package-manager" one level down.
// Stripping this ".ts" builds green here and breaks that script instead
// (`ERR_MODULE_NOT_FOUND`, verified), which is a worse place to discover it.
import { PACKAGE_MANAGER_RUNNERS, type PackageManager } from "./package-manager.ts";

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
