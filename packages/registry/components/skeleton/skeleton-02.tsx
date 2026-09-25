"use client";

import { cn } from "cn";

import { Skeleton } from "@/registry/base/ui/skeleton";

// The same placeholder re-toned for four surfaces. The default bg-muted
// disappears on a muted panel, so each surface picks its own contrast.
const surfaces = [
  {
    name: "Bare",
    frame: "",
    bone: "",
  },
  {
    name: "Outlined",
    frame: "rounded-xl border border-border p-4",
    bone: "",
  },
  {
    name: "Filled",
    frame: "rounded-xl bg-muted p-4",
    bone: "bg-background",
  },
  {
    name: "Elevated",
    frame: "rounded-xl bg-card p-4 shadow-md ring-1 ring-foreground/5",
    bone: "bg-muted",
  },
];

export default function Skeleton02() {
  return (
    <div
      role="status"
      aria-label="Loading invoice summaries"
      className="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {surfaces.map((surface) => (
        <figure key={surface.name} className="flex flex-col gap-2">
          <div className={cn("flex flex-col gap-3", surface.frame)}>
            <div className="flex items-center justify-between gap-3">
              <Skeleton
                aria-hidden="true"
                className={cn("h-3 w-20", surface.bone)}
              />
              <Skeleton
                aria-hidden="true"
                className={cn("h-4 w-12 rounded-full", surface.bone)}
              />
            </div>
            <Skeleton
              aria-hidden="true"
              className={cn("h-6 w-28", surface.bone)}
            />
            <Skeleton
              aria-hidden="true"
              className={cn("h-2.5 w-full", surface.bone)}
            />
          </div>
          <figcaption className="text-xs text-muted-foreground">
            {surface.name}
          </figcaption>
        </figure>
      ))}
      <span className="sr-only">Loading invoice summaries…</span>
    </div>
  );
}
