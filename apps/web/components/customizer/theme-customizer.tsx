"use client";

import { Palette } from "lucide-react";
import { useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/base/ui/tooltip";
import { useCustomizer, useCustomizerTrigger } from "./customizer-state";

/**
 * Toolbar button that toggles the page's customizer dock. Every instance drives the same dock
 * and the same stored preset, which the block iframes and the inline previews both read.
 * It is drawn as quiet toolbar chrome: the floating launcher is the customizer's home, and this is
 * the shortcut to it from wherever a preview is being read.
 */
export function ThemeCustomizer() {
  const { open, registerPreview } = useCustomizer();
  const trigger = useCustomizerTrigger();

  // A mounted toolbar means the page has something to restyle, which is what brings the launcher in.
  useEffect(() => registerPreview(), [registerPreview]);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            {...trigger}
            className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border px-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring aria-expanded:bg-muted aria-expanded:text-foreground"
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
