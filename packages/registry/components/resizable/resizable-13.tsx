"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import * as React from "react";
import { type Layout, useGroupRef } from "react-resizable-panels";

import { Button } from "@/registry/base/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";

const defaultLayout = { video: 60, transcript: 40 };

const transcript = [
  { time: "0:00", seconds: 0, text: "Welcome back. In this lesson we set up usage-based billing from scratch." },
  { time: "0:42", seconds: 42, text: "First, create a meter for the event you want to charge for, like API calls." },
  { time: "1:31", seconds: 91, text: "Next, attach the meter to a price with a per-unit rate and a free tier." },
  { time: "2:58", seconds: 178, text: "Report usage from your backend in batches rather than one event at a time." },
  { time: "4:10", seconds: 250, text: "Finally, preview the upcoming invoice to check the totals before launch." },
];

const storageKey = "resizable-13-lesson";

// Storage can be blocked in private windows or sandboxed previews, so every
// access is guarded and the layout falls back to its defaults.
function readLayout(): Layout | null {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      Object.values(parsed).every((size) => typeof size === "number")
    ) {
      return parsed as Layout;
    }
  } catch {
    // Fall through to the default layout.
  }
  return null;
}

function saveLayout(layout: Layout) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(layout));
  } catch {
    // Ignore: the layout simply is not remembered.
  }
}

export default function Resizable13() {
  const groupRef = useGroupRef();
  const [current, setCurrent] = React.useState(1);
  const [playing, setPlaying] = React.useState(false);

  // Restore after mount: reading storage during render would make the client
  // markup differ from the server's and break hydration.
  React.useEffect(() => {
    const saved = readLayout();
    if (saved) groupRef.current?.setLayout(saved);
  }, [groupRef]);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-2">
      <div className="h-80 w-full">
        <ResizablePanelGroup
          groupRef={groupRef}
          onLayoutChanged={(layout, meta) => {
            // Only a drag or key press is the viewer's choice; mount and
            // restore commits would otherwise overwrite the saved split.
            if (meta.isUserInteraction) saveLayout(layout);
          }}
          className="rounded-xl border bg-card text-card-foreground"
        >
          <ResizablePanel id="video" defaultSize="60%" minSize="40%">
            <div className="flex h-full flex-col gap-3 overflow-hidden p-3">
              <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-muted">
                <img
                  src="/placeholder.svg"
                  alt="Instructor walking through the billing dashboard"
                  className="absolute inset-0 size-full object-cover"
                />
                <Button
                  size="icon-lg"
                  className="relative rounded-full shadow-md"
                  aria-label={
                    playing ? "Pause" : `Play from ${transcript[current].time}`
                  }
                  onClick={() => setPlaying((value) => !value)}
                >
                  {playing ? (
                    <Pause aria-hidden="true" />
                  ) : (
                    <Play aria-hidden="true" />
                  )}
                </Button>
                {playing && (
                  <span
                    aria-live="polite"
                    className="absolute bottom-2 left-2 rounded-md bg-background/90 px-1.5 py-0.5 font-mono text-xs tabular-nums"
                  >
                    Playing · {transcript[current].time}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="truncate text-sm font-semibold">
                  Lesson 3: Usage-based billing
                </h3>
                <p className="truncate text-xs text-muted-foreground">
                  Payments fundamentals · 5 min
                </p>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle aria-label="Resize video and transcript" />
          <ResizablePanel id="transcript" defaultSize="40%" minSize="25%">
            <section
              aria-labelledby="resizable-13-transcript"
              className="flex h-full flex-col"
            >
              <h4
                id="resizable-13-transcript"
                className="border-b px-3 py-2.5 text-xs font-medium text-muted-foreground"
              >
                Transcript
              </h4>
              <ol className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-1.5">
                {transcript.map((line, index) => (
                  <li key={line.seconds}>
                    <button
                      type="button"
                      aria-current={index === current ? "true" : undefined}
                      onClick={() => setCurrent(index)}
                      className="flex w-full gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 aria-[current=true]:bg-muted aria-[current=true]:text-foreground"
                    >
                      <span className="shrink-0 pt-px font-mono text-xs text-primary tabular-nums">
                        {line.time}
                      </span>
                      <span className="leading-snug">{line.text}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Your split is remembered on this device.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            groupRef.current?.setLayout(defaultLayout);
            saveLayout(defaultLayout);
          }}
        >
          <RotateCcw aria-hidden="true" data-icon="inline-start" />
          Reset layout
        </Button>
      </div>
    </div>
  );
}
