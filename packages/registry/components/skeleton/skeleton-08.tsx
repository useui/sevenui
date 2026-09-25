"use client";

import * as React from "react";
import { RotateCwIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Skeleton } from "@/registry/base/ui/skeleton";

// Each section resolves on its own schedule, like independent API calls.
const sections = [
  {
    id: "revenue",
    label: "Net revenue",
    value: "$48,290",
    note: "+8.2% vs. August",
    delay: 700,
  },
  {
    id: "subscribers",
    label: "Subscribers",
    value: "1,284",
    note: "36 joined this week",
    delay: 1300,
  },
  {
    id: "churn",
    label: "Churn",
    value: "2.1%",
    note: "Down from 2.6%",
    delay: 1800,
  },
  {
    id: "payout",
    label: "Next payout",
    value: "$12,940",
    note: "Arrives Sep 30",
    delay: 2500,
  },
];

export default function Skeleton08() {
  const [ready, setReady] = React.useState<string[]>([]);
  const [run, setRun] = React.useState(0);

  React.useEffect(() => {
    // `run` restarts the sequence each time Reload is pressed.
    void run;
    setReady([]);
    const timers = sections.map((section) =>
      window.setTimeout(
        () => setReady((current) => [...current, section.id]),
        section.delay,
      ),
    );
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [run]);

  const done = ready.length === sections.length;

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="text-sm font-medium">September overview</h3>
          <p
            aria-live="polite"
            className="text-xs text-muted-foreground tabular-nums"
          >
            {done
              ? "All sections up to date"
              : `Loaded ${ready.length} of ${sections.length} sections`}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={!done}
          onClick={() => {
            setReady([]);
            setRun((count) => count + 1);
          }}
        >
          <RotateCwIcon aria-hidden="true" data-icon="inline-start" />
          Reload
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {sections.map((section) => {
          const isReady = ready.includes(section.id);
          return (
            <section
              key={section.id}
              aria-label={section.label}
              aria-busy={!isReady}
              className="flex min-h-24 flex-col gap-1.5 rounded-xl border border-border bg-card p-3.5"
            >
              <span className="text-xs text-muted-foreground">
                {section.label}
              </span>
              {isReady ? (
                <div className="flex animate-in flex-col gap-1 fade-in-0 duration-300 motion-reduce:animate-none">
                  <span className="text-lg font-semibold tabular-nums">
                    {section.value}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {section.note}
                  </span>
                </div>
              ) : (
                <div aria-hidden="true" className="flex flex-col gap-2 pt-1">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-3 w-full max-w-28" />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
