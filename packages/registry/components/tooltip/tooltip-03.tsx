"use client";

import { Archive, Copy, Share2, Trash2 } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

// Each tone restyles the popup and its arrow. The arrow is the popup's
// only child carrying data-side; its borders face up because side="bottom".
const tones = [
  {
    name: "Filled",
    icon: Share2,
    label: "Share with workspace",
    className: "",
    buttonClassName: "",
  },
  {
    name: "Outline",
    icon: Copy,
    label: "Duplicate file",
    className:
      "border border-border bg-popover text-popover-foreground shadow-md [&>[data-side]]:border-t [&>[data-side]]:border-l [&>[data-side]]:border-border [&>[data-side]]:bg-popover",
    buttonClassName: "",
  },
  {
    name: "Subtle",
    icon: Archive,
    label: "Move to archive",
    className: "bg-muted text-foreground [&>[data-side]]:bg-muted",
    buttonClassName: "",
  },
  {
    name: "Destructive",
    icon: Trash2,
    label: "Delete permanently",
    className:
      "border border-destructive/40 bg-popover font-medium text-destructive shadow-md [&>[data-side]]:border-t [&>[data-side]]:border-l [&>[data-side]]:border-destructive/40 [&>[data-side]]:bg-popover",
    buttonClassName:
      "text-destructive hover:bg-destructive/10 hover:text-destructive",
  },
];

export default function Tooltip03() {
  return (
    <TooltipProvider>
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 text-card-foreground">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Q3-board-deck.pdf</p>
            <p className="text-xs text-muted-foreground">
              4.2 MB · Edited 2h ago
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {tones.map((tone) => (
              <Tooltip key={tone.name}>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={tone.label}
                      className={tone.buttonClassName}
                    >
                      <tone.icon aria-hidden="true" />
                    </Button>
                  }
                />
                <TooltipContent side="bottom" className={tone.className}>
                  {tone.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
        <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
          Filled for primary actions, outline on busy surfaces, subtle for
          secondary hints, and a destructive tone that warns before the click.
        </p>
      </div>
    </TooltipProvider>
  );
}
