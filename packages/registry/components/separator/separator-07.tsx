"use client";

import { Check, RotateCcw } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Separator } from "@/registry/base/ui/separator";
import { Spinner } from "@/registry/base/ui/spinner";

const stages = [
  { name: "Build", detail: "Compiled 412 modules in 38s" },
  { name: "Run tests", detail: "1,284 passed across 96 suites" },
  { name: "Deploy to staging", detail: "staging.acme.dev, region eu-west-1" },
  {
    name: "Promote to production",
    detail: "Requires release manager approval",
  },
];

type Status = "complete" | "running" | "pending";

const statusLabel: Record<Status, string> = {
  complete: "Complete",
  running: "In progress",
  pending: "Pending",
};

export default function Separator07() {
  // Index of the stage that is currently running; stages.length = all done.
  const [current, setCurrent] = React.useState(1);
  const done = current >= stages.length;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-medium">Release v3.2.0</h3>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {done ? "Shipped" : `Stage ${current + 1} of ${stages.length}`}
        </span>
      </div>
      <ol aria-label="Pipeline stages">
        {stages.map((stage, index) => {
          const status: Status =
            index < current
              ? "complete"
              : index === current
                ? "running"
                : "pending";
          const isLast = index === stages.length - 1;

          return (
            <li key={stage.name} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={
                    status === "complete"
                      ? "flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      : status === "running"
                        ? "flex size-6 items-center justify-center rounded-full border border-primary text-primary"
                        : "flex size-6 items-center justify-center rounded-full border text-xs text-muted-foreground"
                  }
                >
                  {status === "complete" && (
                    <Check aria-hidden="true" className="size-3.5" />
                  )}
                  {status === "running" && (
                    <Spinner aria-hidden="true" className="size-3.5" />
                  )}
                  {status === "pending" && (
                    <span aria-hidden="true">{index + 1}</span>
                  )}
                </span>
                {!isLast && (
                  // The connector fills from the top once the stage above completes.
                  <Separator
                    orientation="vertical"
                    className={`relative my-1 min-h-6 flex-1 overflow-hidden rounded-full data-[orientation=vertical]:w-0.5 after:absolute after:inset-0 after:origin-top after:bg-primary after:transition-transform after:duration-500 after:ease-out motion-reduce:after:transition-none ${
                      status === "complete"
                        ? "after:scale-y-100"
                        : "after:scale-y-0"
                    }`}
                  />
                )}
              </div>
              <div className={isLast ? "pt-0.5" : "pt-0.5 pb-5"}>
                <p
                  className={
                    status === "pending"
                      ? "text-sm font-medium text-muted-foreground"
                      : "text-sm font-medium"
                  }
                >
                  {stage.name}
                  <span className="sr-only">, {statusLabel[status]}</span>
                </p>
                <p className="text-xs text-muted-foreground">{stage.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={done}
          onClick={() => setCurrent((value) => value + 1)}
        >
          {current === stages.length - 1 ? "Approve release" : "Complete stage"}
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Restart pipeline"
          onClick={() => setCurrent(0)}
        >
          <RotateCcw aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
