import { type Flavour, flavourItem } from "./flavour.ts";
import { PACKAGE_MANAGER_RUNNERS, type PackageManager } from "./package-manager.ts";

const USE_NAMESPACE = true;

const REGISTRY_BASE = "https://sevenui.dev/r";

/**
 * The install command of a registry item. With `flavour: "ui-sdk"` a flavoured item (a primitive, or a
 * `component/` or `demo/` example) installs from `@sevenui/ui-sdk/…`; pass `flavoured: false` for shared
 * items and Pro blocks, which have one flavour.
 */
/** `item` may name several items separated by spaces; `flags` (e.g. `--overwrite`) go after them. */
export const installCommand = (
  item: string,
  pm: PackageManager = "npm",
  flavour: Flavour = "base-ui",
  flavoured = true,
  flags = "",
): string => {
  const names = item
    .trim()
    .split(/\s+/)
    .map((one) => flavourItem(one, flavour, flavoured))
    .map((name) => (USE_NAMESPACE ? `@sevenui/${name}` : `${REGISTRY_BASE}/${name}.json`));
  return `${PACKAGE_MANAGER_RUNNERS[pm]} shadcn@latest add ${names.join(" ")}${flags ? ` ${flags}` : ""}`;
};
