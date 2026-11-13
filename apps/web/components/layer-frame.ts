/**
 * The site's tuning of the LayerCard primitive, shared by every frame that holds a preview, code or a
 * card cover. LayerCard reads its geometry from variables, so the site adjusts them here with classes
 * instead of forking the registry source (which is a byte-parity contract for /r/*.json).
 */

/** Large frames (demos, block previews) use the home page's 1.25rem tray radius, so the panel inside stays round. */
export const LAYER_FRAME_LG = "[--layer-card-radius:1.25rem]";

/**
 * A header that holds controls rather than text. One inset runs through the whole tray: the tray's padding
 * puts the controls as far from its top, left and right edges as the panel is from its sides, and the tray's
 * gap puts the panel that same distance below them. So the bar adds no padding of its own and is exactly
 * one control tall (2rem, `--toolbar-h`, which a segmented control reads to fill the bar's height).
 * `@container/toolbar` keeps the existing container queries in the toolbar actions working.
 */
export const LAYER_TOOLBAR = "@container/toolbar flex min-h-(--toolbar-h) items-center gap-2 px-0 py-0 [--toolbar-h:2rem]";

/**
 * A panel that is only a window onto its content (a live preview, an iframe, code): no padding, and clipped
 * so the content follows the panel's radius.
 */
export const LAYER_WINDOW = "overflow-hidden p-0";

/**
 * Segmented tabs on the tray: the selected tab is drawn as a small panel, the same surface and lift the
 * panel below it has, so the selection reads in the component's own vocabulary instead of a grey fill.
 */
export const LAYER_TAB =
  "rounded-md px-2.5 py-1 text-muted-foreground transition-[color,background-color,box-shadow] hover:text-foreground aria-selected:bg-(--layer-card-panel-bg) aria-selected:text-foreground aria-selected:shadow-[var(--elevation-highlight,0_0_#0000),var(--elevation-raised,0_1px_2px_0_rgb(0_0_0/0.05)),0_0_0_1px_var(--layer-card-border-color)] motion-reduce:transition-none";
