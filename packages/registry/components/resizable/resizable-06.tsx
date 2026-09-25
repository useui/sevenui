"use client";

import * as React from "react";
import { Lock, LockOpen } from "lucide-react";

import { Label } from "@/registry/base/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";
import { Switch } from "@/registry/base/ui/switch";

const notes = [
  "Open with the churn number before the chart.",
  "Q3 retention rose to 94% after the onboarding changes.",
  "Pause for questions after the pricing slide.",
];

export default function Resizable06() {
  const [locked, setLocked] = React.useState(true);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="resizable-06-lock">Lock pane sizes</Label>
          <span className="text-xs text-muted-foreground">
            Stops accidental resizing while you present.
          </span>
        </div>
        <Switch
          id="resizable-06-lock"
          checked={locked}
          onCheckedChange={setLocked}
        />
      </div>
      <div className="h-64 w-full">
        <ResizablePanelGroup
          disabled={locked}
          className="rounded-lg border bg-background"
        >
          <ResizablePanel id="slide" defaultSize="62%" minSize="40%">
            <div className="flex h-full flex-col gap-3 overflow-hidden p-4">
              <span className="text-xs text-muted-foreground tabular-nums">
                Slide 7 of 18
              </span>
              <div className="flex flex-1 flex-col justify-end gap-1 rounded-md bg-muted p-4">
                <span className="text-xs text-muted-foreground">
                  Quarterly review
                </span>
                <span className="text-lg font-semibold tracking-tight">
                  Retention is up four points
                </span>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle
            withHandle
            disabled={locked}
            aria-label="Resize slide and speaker notes"
            className="data-[separator=disabled]:bg-border/50 data-[separator=disabled]:*:hidden"
          />
          <ResizablePanel id="notes" defaultSize="38%" minSize="25%">
            <div className="flex h-full flex-col gap-2 overflow-hidden p-4">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                <h3 className="text-sm font-medium">Speaker notes</h3>
                <span
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                  aria-live="polite"
                >
                  {locked ? (
                    <Lock aria-hidden="true" className="size-3.5" />
                  ) : (
                    <LockOpen aria-hidden="true" className="size-3.5" />
                  )}
                  {locked ? "Locked" : "Resizable"}
                </span>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                {notes.map((note) => (
                  <li key={note} className="leading-snug">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
