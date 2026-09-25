"use client";

import * as React from "react";

import {
  ChevronRightIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleXIcon,
  RotateCcwIcon,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import { Spinner } from "@/registry/base/ui/spinner";

type StepStatus = "passed" | "failed" | "skipped";

type Step = {
  id: string;
  name: string;
  status: StepStatus;
  duration: string;
  log: { text: string; tone?: "error" | "muted" }[];
};

const steps: Step[] = [
  {
    id: "checkout",
    name: "Check out repository",
    status: "passed",
    duration: "2s",
    log: [
      { text: "Syncing repository: acme/storefront" },
      { text: "Checking out ref refs/pull/1284/merge" },
      { text: "HEAD is now at 91be0d3", tone: "muted" },
    ],
  },
  {
    id: "install",
    name: "Install dependencies",
    status: "passed",
    duration: "38s",
    log: [
      { text: "pnpm install --frozen-lockfile" },
      { text: "Packages: +1,284" },
      { text: "Done in 37.6s", tone: "muted" },
    ],
  },
  {
    id: "test",
    name: "Run unit tests",
    status: "failed",
    duration: "1m 12s",
    log: [
      { text: "vitest run --reporter=dot" },
      { text: "✓ 412 passed", tone: "muted" },
      {
        text: "FAIL  src/cart/totals.test.ts > applies percentage discount",
        tone: "error",
      },
      { text: "AssertionError: expected 91.8 to be 91.79", tone: "error" },
      { text: "  at src/cart/totals.test.ts:48:32", tone: "muted" },
      { text: "Test Files  1 failed | 63 passed (64)" },
      { text: "Error: Process completed with exit code 1.", tone: "error" },
    ],
  },
  {
    id: "build",
    name: "Build production bundle",
    status: "skipped",
    duration: "—",
    log: [{ text: "Skipped because a previous step failed.", tone: "muted" }],
  },
];

const statusIcon: Record<StepStatus, React.ReactNode> = {
  passed: (
    <CircleCheckIcon aria-hidden="true" className="size-4 text-success" />
  ),
  failed: (
    <CircleXIcon aria-hidden="true" className="size-4 text-destructive" />
  ),
  skipped: (
    <CircleDashedIcon
      aria-hidden="true"
      className="size-4 text-muted-foreground"
    />
  ),
};

const statusLabel: Record<StepStatus, string> = {
  passed: "Passed",
  failed: "Failed",
  skipped: "Skipped",
};

export default function Collapsible13() {
  const [rerunning, setRerunning] = React.useState(false);

  // No real runner here: release the queued state after a moment so the
  // demo can be re-run.
  React.useEffect(() => {
    if (!rerunning) return;
    const timeout = window.setTimeout(() => setRerunning(false), 3000);
    return () => window.clearTimeout(timeout);
  }, [rerunning]);

  return (
    <section
      aria-labelledby="collapsible-13-title"
      className="w-full max-w-lg overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3
            id="collapsible-13-title"
            className="flex items-center gap-2 font-semibold"
          >
            test / unit
            <Badge variant={rerunning ? "secondary" : "destructive"}>
              {rerunning ? "Queued" : "Failed"}
            </Badge>
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            PR 1284 · Add saved carts · triggered by ava-lin · 1m 52s
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={rerunning}
          onClick={() => setRerunning(true)}
        >
          {rerunning ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
          )}
          {rerunning ? "Waiting for runner" : "Re-run failed"}
        </Button>
      </header>

      <ol className="flex flex-col divide-y">
        {steps.map((step, index) => (
          <li key={step.id}>
            <Collapsible defaultOpen={step.status === "failed"}>
              <CollapsibleTrigger className="group flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset">
                <ChevronRightIcon
                  aria-hidden="true"
                  className="size-3.5 text-muted-foreground transition-transform group-data-panel-open:rotate-90"
                />
                {statusIcon[step.status]}
                <span className="sr-only">{statusLabel[step.status]}:</span>
                <span
                  className={
                    step.status === "skipped"
                      ? "flex-1 truncate text-muted-foreground"
                      : "flex-1 truncate"
                  }
                >
                  {step.name}
                </span>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {step.duration}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="overflow-x-auto bg-muted/60 py-2 font-mono text-xs leading-5">
                  {step.log.map((line, lineIndex) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: log lines are static and ordered
                      key={lineIndex}
                      className={
                        line.tone === "error"
                          ? "flex bg-destructive/10 text-destructive"
                          : line.tone === "muted"
                            ? "flex text-muted-foreground"
                            : "flex"
                      }
                    >
                      <span
                        aria-hidden="true"
                        className="w-10 shrink-0 pr-3 text-right text-muted-foreground/70 select-none"
                      >
                        {index + 1}.{lineIndex + 1}
                      </span>
                      <span className="pr-4 whitespace-pre">{line.text}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </li>
        ))}
      </ol>
    </section>
  );
}
