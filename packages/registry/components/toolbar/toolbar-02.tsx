"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { cn } from "cn";

import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

const densities = [
  {
    name: "Compact",
    height: "28px",
    root: "gap-0.5 p-0.5",
    button: "h-7 min-w-7 px-1.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
  },
  {
    name: "Default",
    height: "32px",
    root: "",
    button: "",
  },
  {
    name: "Comfortable",
    height: "40px",
    root: "gap-1.5 rounded-lg p-1.5",
    button: "h-10 min-w-10 rounded-md px-3 [&_svg:not([class*='size-'])]:size-5",
  },
];

export default function Toolbar02() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      {densities.map((density) => (
        <div key={density.name} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium">{density.name}</span>
            <span className="text-muted-foreground tabular-nums">
              {density.height} targets
            </span>
          </div>
          <Toolbar
            aria-label={`Document viewer, ${density.name.toLowerCase()} density`}
            className={density.root}
          >
            <ToolbarGroup aria-label="Pages">
              <ToolbarButton
                aria-label="Previous page"
                className={density.button}
              >
                <ChevronLeft aria-hidden="true" />
              </ToolbarButton>
              <span
                className={cn(
                  "px-1 text-sm text-muted-foreground tabular-nums",
                  density.name === "Compact" && "text-xs",
                )}
              >
                3 / 12
              </span>
              <ToolbarButton aria-label="Next page" className={density.button}>
                <ChevronRight aria-hidden="true" />
              </ToolbarButton>
            </ToolbarGroup>
            {/* Zoom is the least essential group; it drops below sm so the
                comfortable density still fits a phone-width pane. */}
            <ToolbarSeparator className="hidden sm:block" />
            <ToolbarGroup aria-label="Zoom" className="hidden sm:flex">
              <ToolbarButton aria-label="Zoom out" className={density.button}>
                <ZoomOut aria-hidden="true" />
              </ToolbarButton>
              <ToolbarButton aria-label="Zoom in" className={density.button}>
                <ZoomIn aria-hidden="true" />
              </ToolbarButton>
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarButton aria-label="Download PDF" className={density.button}>
              <Download aria-hidden="true" />
            </ToolbarButton>
          </Toolbar>
        </div>
      ))}
    </div>
  );
}
