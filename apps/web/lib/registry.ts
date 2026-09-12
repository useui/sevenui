// Single source of truth for shadcn CLI install commands. The @sevenui
// namespace only works once it lands in the shadcn registry directory (or the
// user configures it in components.json), so default to direct URLs until then.
const USE_NAMESPACE = false;

const REGISTRY_BASE = "https://sevenui.dev/r";

/**
 * Build the shadcn CLI install command for a registry item.
 *
 * @param item Registry item path: `"button"`, `"component/accordion-01"`, `"pro/dashboard-01"`, `"demo/accordion-demo"`.
 */
export const installCommand = (item: string): string =>
  USE_NAMESPACE
    ? `npx shadcn@latest add @sevenui/${item}`
    : `npx shadcn@latest add ${REGISTRY_BASE}/${item}.json`;
