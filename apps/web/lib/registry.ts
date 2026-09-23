import { PACKAGE_MANAGER_RUNNERS, type PackageManager } from "./package-manager.ts";

const USE_NAMESPACE = true;

const REGISTRY_BASE = "https://sevenui.dev/r";

export const installCommand = (item: string, pm: PackageManager = "npm"): string =>
  USE_NAMESPACE
    ? `${PACKAGE_MANAGER_RUNNERS[pm]} shadcn@latest add @sevenui/${item}`
    : `${PACKAGE_MANAGER_RUNNERS[pm]} shadcn@latest add ${REGISTRY_BASE}/${item}.json`;
