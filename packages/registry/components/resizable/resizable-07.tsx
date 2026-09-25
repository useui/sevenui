"use client";

import * as React from "react";
import { Check, ChevronsLeftRight } from "lucide-react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";

const features = ["Unlimited projects", "Version history", "Priority support"];

export default function Resizable07() {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  const [split, setSplit] = React.useState(50);

  React.useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    setWidth(frame.offsetWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  // Both versions render at the full frame width so each panel clips the same
  // composition instead of reflowing it.
  const canvasStyle = width ? { width } : undefined;

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <div
        ref={frameRef}
        className="group/compare relative h-72 w-full overflow-hidden rounded-xl border bg-background"
      >
        <ResizablePanelGroup
          onLayoutChange={(layout) => setSplit(layout.before ?? 50)}
        >
          <ResizablePanel id="before" defaultSize="50%" minSize="0%">
            <div className="relative h-full overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-full"
                style={canvasStyle}
              >
                <BeforeCard />
              </div>
              <span className="absolute top-3 left-3 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                Before
              </span>
            </div>
          </ResizablePanel>
          <ResizableHandle
            aria-label="Compare the current and proposed pricing card"
            className="w-0.5 bg-primary after:w-10"
          />
          <ResizablePanel id="after" defaultSize="50%" minSize="0%">
            <div className="relative h-full overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute inset-y-0 right-0 w-full"
                style={canvasStyle}
              >
                <AfterCard />
              </div>
              <span className="absolute top-3 right-3 rounded-md bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                After
              </span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 z-20 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-foreground shadow-md transition-[scale,box-shadow] group-has-data-[separator=active]/compare:scale-110 group-has-data-[separator=focus]/compare:ring-2 group-has-data-[separator=focus]/compare:ring-ring"
          // Clamp so the knob stays whole at either edge of the frame.
          style={{
            left: `clamp(1.125rem, ${split}%, calc(100% - 1.125rem))`,
          }}
        >
          <ChevronsLeftRight className="size-4" />
        </span>
      </div>
      <figcaption className="text-xs text-muted-foreground">
        Drag the divider, or focus it and use the arrow keys, to compare the
        current pricing card with the proposed one.
      </figcaption>
    </figure>
  );
}

function BeforeCard() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/40 p-6 text-center">
      <span className="text-sm text-muted-foreground">Pro plan</span>
      <span className="text-sm text-muted-foreground">
        $24 per month, billed yearly
      </span>
      <span className="text-xs text-muted-foreground">
        Unlimited projects, version history, priority support
      </span>
      <span className="mt-2 rounded-md border px-3 py-1.5 text-xs text-muted-foreground">
        Learn more
      </span>
    </div>
  );
}

function AfterCard() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium">Pro plan</span>
        <span className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold tracking-tight tabular-nums">
            $24
          </span>
          <span className="text-sm text-muted-foreground">/ month</span>
        </span>
      </div>
      <ul className="flex flex-col gap-1.5 text-left text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className="size-4 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
      <span className="inline-flex h-8 w-fit items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
        Start 14-day trial
      </span>
    </div>
  );
}
