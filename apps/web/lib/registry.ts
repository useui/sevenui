import { type Flavour, flavourItem } from "./flavour.ts";
import { PACKAGE_MANAGER_RUNNERS, type PackageManager } from "./package-manager.ts";

const USE_NAMESPACE = true;

const REGISTRY_BASE = "https://sevenui.dev/r";

/**
 * The install command of a registry item. With `flavour: "ui-sdk"` a flavoured item (a primitive, or a
 * `component/` or `demo/` example) installs from `@sevenui/ui-sdk/…`; pass `flavoured: false` for shared
 * items and Pro blocks, which have one flavour.
 */
export const installCommand = (
  item: string,
  pm: PackageManager = "npm",
  flavour: Flavour = "base-ui",
  flavoured = true,
): string => {
  const name = flavourItem(item, flavour, flavoured);
  return USE_NAMESPACE
    ? `${PACKAGE_MANAGER_RUNNERS[pm]} shadcn@latest add @sevenui/${name}`
    : `${PACKAGE_MANAGER_RUNNERS[pm]} shadcn@latest add ${REGISTRY_BASE}/${name}.json`;
};
