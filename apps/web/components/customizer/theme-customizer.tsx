"use client";

import { Palette } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/base/ui/tooltip";
import { CUSTOMIZER_PANEL_ID } from "./customizer-panel";
import { useCustomizer } from "./customizer-state";

/**
 * Toolbar button that toggles the page's customizer panel. Every instance drives the same panel
 * and the same stored preset, which the block iframes and the inline previews both read.
 * It sits outside the preset scope, so it keeps the site's own primary whatever theme is picked.
 */
export function ThemeCustomizer() {
  const { config, open, setOpen, triggerRef } = useCustomizer();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            aria-controls={open ? CUSTOMIZER_PANEL_ID : undefined}
            aria-expanded={open}
            aria-label={
              config === null
                ? "Customize theme"
                : `Customize theme — ${config.theme} theme, ${config.baseColor} base color, ${config.radius} radius`
            }
            className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-primary px-2 text-xs font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-expanded:bg-primary/85"
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setOpen(!open);
            }}
            type="button"
          />
        }
      >
        <Palette aria-hidden="true" className="size-4" strokeWidth={1.75} />
        <span aria-hidden="true" className="hidden @xl/toolbar:inline">
          Customize
        </span>
      </TooltipTrigger>
      <TooltipContent>{open ? "Close the customizer" : "Preview in your theme"}</TooltipContent>
    </Tooltip>
  );
}
