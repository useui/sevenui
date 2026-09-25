"use client";

import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";

const panels = [
  {
    id: "filters",
    title: "Filters",
    note: "Status, owner, and label facets.",
    defaultSize: 25,
    min: 18,
    max: 35,
  },
  {
    id: "results",
    title: "Results",
    note: "Needs the most room, never below half.",
    defaultSize: 50,
    min: 40,
    max: 70,
  },
  {
    id: "details",
    title: "Details",
    note: "Collapses no further than a summary.",
    defaultSize: 25,
    min: 15,
    max: 35,
  },
];

type Layout = Record<string, number>;

const initialLayout: Layout = Object.fromEntries(
  panels.map((panel) => [panel.id, panel.defaultSize]),
);

export default function Resizable03() {
  const [layout, setLayout] = React.useState<Layout>(initialLayout);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="h-56 w-full">
        <ResizablePanelGroup
          className="rounded-lg border bg-background"
          onLayoutChange={setLayout}
        >
          {panels.map((panel, index) => {
            const size = layout[panel.id] ?? panel.defaultSize;
            return (
              <React.Fragment key={panel.id}>
                {index > 0 && (
                  <ResizableHandle
                    withHandle
                    aria-label={`Resize ${panels[index - 1].title} and ${panel.title}`}
                  />
                )}
                <ResizablePanel
                  id={panel.id}
                  defaultSize={`${panel.defaultSize}%`}
                  minSize={`${panel.min}%`}
                  maxSize={`${panel.max}%`}
                >
                  <div className="flex h-full min-w-0 flex-col justify-between gap-3 overflow-hidden p-2.5 sm:p-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <h3 className="truncate text-sm font-medium">
                          {panel.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="font-mono tabular-nums"
                        >
                          {Math.round(size)}%
                        </Badge>
                      </div>
                      <p className="line-clamp-3 text-xs text-muted-foreground">
                        {panel.note}
                      </p>
                    </div>
                    <RangeTrack size={size} min={panel.min} max={panel.max} />
                  </div>
                </ResizablePanel>
              </React.Fragment>
            );
          })}
        </ResizablePanelGroup>
      </div>
      <p className="text-xs text-muted-foreground">
        Each panel stops at its limits. Drag a handle or focus it and use the
        arrow keys.
      </p>
    </div>
  );
}

function RangeTrack({
  size,
  min,
  max,
}: {
  size: number;
  min: number;
  max: number;
}) {
  const atLimit = Math.round(size) <= min || Math.round(size) >= max;

  return (
    <div className="flex flex-col gap-1.5">
      <div aria-hidden="true" className="relative h-1.5 rounded-full bg-muted">
        <div
          className="absolute inset-y-0 rounded-full bg-primary/15"
          style={{ left: `${min}%`, width: `${max - min}%` }}
        />
        <div
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary transition-[left] duration-75 data-[limit=true]:bg-warning"
          data-limit={atLimit}
          style={{ left: `${size}%` }}
        />
      </div>
      <span className="truncate font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
        {min}–{max}%
      </span>
    </div>
  );
}
