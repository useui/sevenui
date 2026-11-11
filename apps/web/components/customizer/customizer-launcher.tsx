"use client";

import { Palette, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCustomizer, useCustomizerTrigger } from "./customizer-state";

/** Where the launcher and the dock both sit: bottom centre, clear of the home indicator on phones. */
export const DOCK_POSITION = "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[38] -translate-x-1/2";

/** The floating surface the launcher, the dock and its tray share. */
export const DOCK_SURFACE =
  "bg-surface-raised text-foreground shadow-[var(--elevation-highlight),var(--elevation-raised),var(--elevation-overlay),0_0_0_1px_var(--hairline-strong)]";

/** Session-scoped: a new visit brings the launcher back. */
const LAUNCHER_HIDDEN_KEY = "customizer-launcher-hidden";

/**
 * The dock at rest: a small pill that is always in the same place on any page with previews, so
 * the customizer is a page-level tool rather than one of twenty identical toolbar buttons. It
 * carries the chosen theme's colour, which doubles as the sign that a custom preset is active.
 * Deliberately light: no Base UI, so it costs a page nothing until someone reaches for it.
 *
 * It floats over the page, so it has to be able to get out of the way: on phones it shrinks to
 * its icon, and with a pointer or a keyboard it can be put away for the rest of the session. The
 * Customize button in every preview toolbar still opens the dock after that.
 */
export function CustomizerLauncher() {
  const { config, dirty, hasPreviews, open, themeOptions } = useCustomizer();
  const trigger = useCustomizerTrigger();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try {
      setHidden(window.sessionStorage.getItem(LAUNCHER_HIDDEN_KEY) === "1");
    } catch {
      // Storage is unavailable: the launcher simply stays.
    }
  }, []);
  if (!hasPreviews || hidden) return null;

  const theme = themeOptions.find((option) => option.value === config?.theme);

  const hide = () => {
    setHidden(true);
    try {
      window.sessionStorage.setItem(LAUNCHER_HIDDEN_KEY, "1");
    } catch {
      // Hidden for this page view only.
    }
  };

  return (
    <div
      className={`${DOCK_POSITION} group/launcher transition-[opacity,scale] duration-200 ease-snappy motion-reduce:transition-none print:hidden ${open ? "pointer-events-none scale-90 opacity-0" : ""}`}
      // The dock takes this spot while it is open; the pill steps out of the tab order until it closes.
      inert={open}
    >
      <button
        {...trigger}
        className={`${DOCK_SURFACE} inline-flex size-10 items-center justify-center gap-2 rounded-xl text-[13px] font-medium outline-none transition-[scale,background-color] duration-200 ease-snappy hover:bg-[color-mix(in_oklch,var(--surface-raised),var(--foreground)_5%)] focus-visible:focus-ring active:scale-[0.97] motion-reduce:transition-none sm:w-auto sm:ps-3 sm:pe-3.5`}
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
        <span aria-hidden="true" className="hidden sm:inline">
          Customize
        </span>
      </button>
      {/* Revealed by hover or keyboard focus only: a touch screen gets the smaller icon-only pill instead. */}
      <button
        aria-label="Hide the customize button"
        className={`${DOCK_SURFACE} absolute -end-2 -top-2 hidden size-5 cursor-pointer items-center justify-center rounded-full text-muted-foreground opacity-0 outline-none transition-opacity duration-150 hover:text-foreground focus-visible:focus-ring focus-visible:opacity-100 group-hover/launcher:opacity-100 motion-reduce:transition-none sm:inline-flex [@media(hover:none)]:hidden`}
        onClick={hide}
        title="Hide for this session"
        type="button"
      >
        <X aria-hidden="true" className="size-3" strokeWidth={2} />
      </button>
    </div>
  );
}
