"use client";

import * as React from "react";
import { Download, LoaderCircle } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

type Phase = "idle" | "preparing" | "exporting" | "done";

const copy: Record<Phase, { label: string; hint: string }> = {
  idle: {
    label: "Export ready to start",
    hint: "Q3 invoices, 2,418 rows as CSV.",
  },
  preparing: {
    label: "Preparing export",
    hint: "Counting rows and applying filters.",
  },
  exporting: {
    label: "Writing file",
    hint: "Keep this tab open until the export finishes.",
  },
  done: {
    label: "Export complete",
    hint: "invoices-q3.csv is ready to download.",
  },
};

export default function Progress04() {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [value, setValue] = React.useState(0);

  // Preparing has no measurable total yet, so the bar stays indeterminate.
  React.useEffect(() => {
    if (phase !== "preparing") return;
    const timer = setTimeout(() => setPhase("exporting"), 1600);
    return () => clearTimeout(timer);
  }, [phase]);

  React.useEffect(() => {
    if (phase !== "exporting") return;
    const timer = setInterval(() => {
      setValue((current) => Math.min(current + 7, 100));
    }, 180);
    return () => clearInterval(timer);
  }, [phase]);

  React.useEffect(() => {
    if (phase === "exporting" && value >= 100) setPhase("done");
  }, [phase, value]);

  function start() {
    setValue(0);
    setPhase("preparing");
  }

  const busy = phase === "preparing" || phase === "exporting";

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Progress
        value={phase === "preparing" ? null : value}
        aria-busy={busy}
        aria-describedby="progress-04-hint"
        className="[&>[data-slot=progress-track]]:h-2 [&_[data-indeterminate][data-slot=progress-indicator]]:w-full [&_[data-indeterminate][data-slot=progress-indicator]]:bg-primary/40 [&_[data-indeterminate][data-slot=progress-indicator]]:animate-pulse [&_[data-indeterminate][data-slot=progress-indicator]]:rounded-full motion-reduce:[&_[data-indeterminate][data-slot=progress-indicator]]:animate-none"
      >
        <ProgressLabel className="flex items-center gap-2">
          {busy ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-3.5 animate-spin text-muted-foreground motion-reduce:animate-none"
            />
          ) : null}
          {copy[phase].label}
        </ProgressLabel>
        {phase === "preparing" ? (
          <span className="ml-auto text-sm text-muted-foreground">
            Estimating
          </span>
        ) : (
          <ProgressValue />
        )}
      </Progress>
      <div className="flex items-center justify-between gap-3">
        <p id="progress-04-hint" className="text-xs text-muted-foreground">
          {copy[phase].hint}
        </p>
        {phase === "done" ? (
          <Button size="sm" variant="outline" onClick={start}>
            <Download data-icon="inline-start" aria-hidden="true" />
            Export again
          </Button>
        ) : (
          <Button size="sm" onClick={start} disabled={busy}>
            {busy ? "Exporting" : "Start export"}
          </Button>
        )}
      </div>
    </div>
  );
}
