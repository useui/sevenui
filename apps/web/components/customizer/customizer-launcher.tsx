"use client";

import { Palette } from "lucide-react";
import { useCustomizer, useCustomizerTrigger } from "./customizer-state";

/** Where the launcher and the dock both sit: bottom centre, clear of the home indicator on phones. */
export const DOCK_POSITION = "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[38] -translate-x-1/2";

/** The floating surface the launcher, the dock and its tray share. */
export const DOCK_SURFACE =
  "bg-surface-raised text-foreground shadow-[var(--elevation-highlight),var(--elevation-raised),var(--elevation-overlay),0_0_0_1px_var(--hairline-strong)]";

/**
 * The dock at rest: a small pill that is always in the same place on any page with previews, so
 * the customizer is a page-level tool rather than one of twenty identical toolbar buttons. It
 * carries the chosen theme's colour, which doubles as the sign that a custom preset is active.
 * Deliberately light: no Base UI, so it costs a page nothing until someone reaches for it.
 */
export function CustomizerLauncher() {
  const { config, dirty, hasPreviews, open, themeOptions } = useCustomizer();
  const trigger = useCustomizerTrigger();
  if (!hasPreviews) return null;

  const theme = themeOptions.find((option) => option.value === config?.theme);

  return (
    <button
      {...trigger}
      className={`${DOCK_POSITION} ${DOCK_SURFACE} inline-flex h-10 items-center gap-2 rounded-xl ps-3 pe-3.5 text-[13px] font-medium outline-none transition-[opacity,scale,background-color] duration-200 ease-snappy hover:bg-[color-mix(in_oklch,var(--surface-raised),var(--foreground)_5%)] focus-visible:focus-ring active:scale-[0.97] motion-reduce:transition-none print:hidden ${open ? "pointer-events-none scale-90 opacity-0" : ""}`}
      // The dock takes this spot while it is open; the pill steps out of the tab order until it closes.
      inert={open}
    >
      {dirty && theme ? (
        // Neutral's swatch is near-black; the site's own primary keeps it legible in dark mode.
        <span
          aria-hidden="true"
          className={`size-4 shrink-0 rounded-full outline outline-1 -outline-offset-1 outline-foreground/15 ${theme.value === "neutral" ? "bg-primary" : ""}`}
          style={theme.value === "neutral" ? undefined : { background: theme.swatch }}
        />
      ) : (
        <Palette aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      )}
      <span aria-hidden="true">Customize</span>
    </button>
  );
}
