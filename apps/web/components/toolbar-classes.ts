/**
 * Corner radius of a control that sits in a tray toolbar (LAYER_TOOLBAR sets `--toolbar-radius` to the
 * panel's radius, so the control's corners stay concentric with the tray's). Outside a toolbar it is
 * rounded-md, as before.
 */
export const TOOLBAR_RADIUS = "rounded-[var(--toolbar-radius,var(--radius-md))]";

/** A segment inside a toolbar control's 2px padding (tabs, the flavour switch's options): 2px less, concentric. */
export const TOOLBAR_SEGMENT_RADIUS =
  "rounded-[max(0px,calc(var(--toolbar-radius,calc(var(--radius-md)_+_2px))_-_2px))]";

/** The end keys inside a bordered toolbar control: 1px less than the control, inside its border. */
export const TOOLBAR_KEY_RADIUS_START =
  "rounded-s-[max(0px,calc(var(--toolbar-radius,calc(var(--radius-md)_+_1px))_-_1px))]";
export const TOOLBAR_KEY_RADIUS_END =
  "rounded-e-[max(0px,calc(var(--toolbar-radius,calc(var(--radius-md)_+_1px))_-_1px))]";

/** Square icon button shared by the preview toolbars on /blocks and /components. */
export const TOOLBAR_ICON = `size-8 shrink-0 cursor-pointer items-center justify-center ${TOOLBAR_RADIUS} border border-border text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring`;
