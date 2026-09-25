"use client";

import { HardDrive } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const capacity = 128;

const segments = [
  { label: "Photos", size: 38.2, files: "14,208 files", color: "bg-chart-1" },
  { label: "Videos", size: 24.6, files: "312 files", color: "bg-chart-2" },
  { label: "Backups", size: 14.3, files: "6 snapshots", color: "bg-chart-3" },
  { label: "Documents", size: 9.1, files: "2,947 files", color: "bg-chart-4" },
  { label: "System", size: 6.8, files: "Reserved", color: "bg-chart-5" },
];

const used = segments.reduce((sum, segment) => sum + segment.size, 0);

function percent(size: number) {
  return `${((size / capacity) * 100).toFixed(1)}%`;
}

export default function Tooltip08() {
  return (
    // A short delay and a grouped provider let the pointer sweep across
    // segments; each tooltip follows the cursor along the x axis.
    <TooltipProvider delay={100} timeout={600}>
      <div className="grid w-full max-w-lg gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <HardDrive aria-hidden="true" className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium">MacBook Pro storage</p>
              <p className="text-xs text-muted-foreground">
                Last scanned 4 minutes ago
              </p>
            </div>
          </div>
          <p className="shrink-0 text-right text-xs text-muted-foreground tabular-nums">
            <span className="block text-sm font-semibold whitespace-nowrap text-foreground">
              {(capacity - used).toFixed(1)} GB
            </span>
            available
          </p>
        </div>

        <ul
          aria-label={`Storage breakdown, ${used.toFixed(1)} of ${capacity} GB used`}
          className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted"
        >
          {segments.map((segment) => (
            <li
              key={segment.label}
              style={{ width: `${(segment.size / capacity) * 100}%` }}
              className="flex min-w-1 shrink-0 first:*:rounded-l-full"
            >
              <Tooltip trackCursorAxis="x" disableHoverablePopup>
                <TooltipTrigger
                  aria-label={`${segment.label}: ${segment.size} GB, ${percent(segment.size)}`}
                  className={`h-full w-full outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${segment.color}`}
                />
                <TooltipContent
                  side="top"
                  sideOffset={10}
                  className="grid min-w-36 gap-1.5 border border-border bg-popover px-3 py-2 text-popover-foreground shadow-lg data-[instant]:transition-none [&>[data-side]]:border-r [&>[data-side]]:border-b [&>[data-side]]:border-border [&>[data-side]]:bg-popover"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <span
                      aria-hidden="true"
                      className={`size-2 rounded-[2px] ${segment.color}`}
                    />
                    {segment.label}
                    <span className="ml-auto pl-3 text-muted-foreground tabular-nums">
                      {percent(segment.size)}
                    </span>
                  </span>
                  <span className="flex items-baseline justify-between gap-3 text-muted-foreground tabular-nums">
                    <span className="text-sm font-semibold text-foreground">
                      {segment.size} GB
                    </span>
                    {segment.files}
                  </span>
                </TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>

        <ul className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
          {segments.map((segment) => (
            <li key={segment.label} className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rounded-[2px] ${segment.color}`}
              />
              <span className="truncate">{segment.label}</span>
              <span className="ml-auto shrink-0 whitespace-nowrap text-muted-foreground tabular-nums">
                {segment.size} GB
              </span>
            </li>
          ))}
        </ul>
      </div>
    </TooltipProvider>
  );
}
