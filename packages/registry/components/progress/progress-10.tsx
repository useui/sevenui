"use client";

import * as React from "react";
import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleSlashIcon,
  GitCommitHorizontalIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

const STAGES = [
  {
    id: "install",
    label: "Install dependencies",
    speed: 22,
    log: "pnpm install --frozen-lockfile · 1,284 packages",
  },
  {
    id: "build",
    label: "Build",
    speed: 9,
    log: "next build · compiling 214 routes",
  },
  {
    id: "test",
    label: "Run tests",
    speed: 14,
    log: "vitest run · 612 passed",
  },
  {
    id: "upload",
    label: "Upload static assets",
    speed: 26,
    log: "uploading 1,903 files to edge cache",
  },
  {
    id: "promote",
    label: "Promote to production",
    speed: 34,
    log: "switching alias app.northwind.dev",
  },
];

const TICK_MS = 300;

type Run = {
  stage: number;
  stageProgress: number;
  elapsed: number;
  status: "running" | "done" | "canceled";
};

const START: Run = { stage: 1, stageProgress: 35, elapsed: 41.4, status: "running" };

function advance(run: Run): Run {
  if (run.status !== "running") return run;
  const elapsed = run.elapsed + TICK_MS / 1000;
  const stageProgress = run.stageProgress + STAGES[run.stage].speed;
  if (stageProgress < 100) return { ...run, elapsed, stageProgress };
  if (run.stage === STAGES.length - 1) {
    return { ...run, elapsed, stageProgress: 100, status: "done" };
  }
  return { ...run, elapsed, stage: run.stage + 1, stageProgress: 0 };
}

function formatElapsed(seconds: number) {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}m ${String(whole % 60).padStart(2, "0")}s`;
}

export default function Progress10() {
  const [run, setRun] = React.useState<Run>(START);

  React.useEffect(() => {
    if (run.status !== "running") return;
    const timer = setInterval(() => setRun(advance), TICK_MS);
    return () => clearInterval(timer);
  }, [run.status]);

  const overall =
    ((run.stage * 100 + run.stageProgress) / (STAGES.length * 100)) * 100;

  const badge = {
    running: { label: "Building", dot: "bg-primary" },
    done: { label: "Ready", dot: "bg-success" },
    canceled: { label: "Canceled", dot: "bg-muted-foreground" },
  }[run.status];

  return (
    <section
      aria-labelledby="progress-10-title"
      className="flex w-full max-w-md flex-col rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h3 id="progress-10-title" className="font-medium">
              Production deployment
            </h3>
            <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <GitCommitHorizontalIcon
                aria-hidden="true"
                className="size-3.5 shrink-0"
              />
              <span className="shrink-0 font-mono">a1f9c2e</span>
              <span className="truncate">Fix invoice rounding on annual plans</span>
            </p>
          </div>
          <Badge variant="outline" className="shrink-0">
            <span
              aria-hidden="true"
              className={cn("size-1.5 rounded-full", badge.dot)}
            />
            {badge.label}
          </Badge>
        </div>

        <Progress
          value={overall}
          getAriaValueText={(formatted) =>
            run.status === "canceled"
              ? `Canceled at ${formatted}`
              : `${formatted} deployed, stage ${run.stage + 1} of ${STAGES.length}`
          }
          className={cn(
            "gap-2 [&_[data-slot=progress-track]]:h-2",
            run.status === "done" &&
              "[&_[data-slot=progress-indicator]]:bg-success",
            run.status === "canceled" &&
              "[&_[data-slot=progress-indicator]]:bg-muted-foreground/50",
          )}
        >
          <ProgressLabel className="text-xs font-normal text-muted-foreground">
            {run.status === "done" ? "Completed in " : "Elapsed "}
            <span className="font-medium text-foreground tabular-nums">
              {formatElapsed(run.elapsed)}
            </span>
          </ProgressLabel>
          <ProgressValue className="text-xs" />
        </Progress>
      </header>

      <ol className="flex flex-col border-t py-2">
        {STAGES.map((stage, index) => {
          const state =
            index < run.stage || run.status === "done"
              ? "done"
              : index === run.stage
                ? run.status === "canceled"
                  ? "canceled"
                  : "active"
                : "pending";
          return (
            <li
              key={stage.id}
              aria-current={state === "active" ? "step" : undefined}
              className={cn(
                "flex items-start gap-3 px-4 py-2",
                state === "active" && "bg-muted/50",
              )}
            >
              {state === "done" ? (
                <CircleCheckIcon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-success"
                />
              ) : state === "active" ? (
                <LoaderCircleIcon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 animate-spin text-primary motion-reduce:animate-none"
                />
              ) : state === "canceled" ? (
                <CircleSlashIcon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
              ) : (
                <CircleDashedIcon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground/60"
                />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span
                  className={cn(
                    "text-sm",
                    state === "pending" && "text-muted-foreground",
                  )}
                >
                  {stage.label}
                  <span className="sr-only">
                    {state === "done"
                      ? " (complete)"
                      : state === "pending"
                        ? " (pending)"
                        : state === "canceled"
                          ? " (canceled)"
                          : ""}
                  </span>
                </span>
                {state === "active" ? (
                  <>
                    <Progress
                      value={Math.min(run.stageProgress, 100)}
                      aria-label={`${stage.label} progress`}
                      className="[&_[data-slot=progress-track]]:bg-background"
                    />
                    <code className="truncate font-mono text-xs text-muted-foreground">
                      {stage.log}
                    </code>
                  </>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <footer className="flex items-center justify-end gap-2 border-t p-4">
        {run.status === "running" ? (
          <Button
            variant="outline"
            aria-label="Cancel deployment"
            onClick={() =>
              setRun((current) => ({ ...current, status: "canceled" }))
            }
          >
            Cancel
            <span className="hidden sm:inline"> deployment</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() =>
              setRun({ stage: 0, stageProgress: 0, elapsed: 0, status: "running" })
            }
          >
            Redeploy
          </Button>
        )}
        <Button disabled={run.status !== "done"}>Visit site</Button>
      </footer>
    </section>
  );
}
