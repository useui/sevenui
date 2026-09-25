"use client";

import * as React from "react";
import {
  CheckCircle2Icon,
  CircleDashedIcon,
  GitBranchIcon,
  GitCommitHorizontalIcon,
  Maximize2Icon,
  RotateCwIcon,
  XCircleIcon,
} from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";
import { Progress } from "@/registry/base/ui/progress";
import { Spinner } from "@/registry/base/ui/spinner";

type Status = "ready" | "error" | "building";

type Deployment = {
  id: string;
  branch: string;
  commit: string;
  message: string;
  author: string;
  age: string;
  status: Status;
  failedStep?: number;
};

const steps = [
  { name: "Clone repository", duration: "1.8s" },
  { name: "Install dependencies", duration: "14.2s" },
  { name: "Type check", duration: "6.9s" },
  { name: "Build", duration: "31.4s" },
  { name: "Upload to edge", duration: "3.1s" },
];

const logs: Record<string, string[]> = {
  "Clone repository": [
    "Cloning github.com/tidewater/storefront (branch: main)",
    "Cloned in 1.8s",
  ],
  "Install dependencies": [
    "Lockfile found, using pnpm 10.4.1",
    "Packages: +1,284",
    "Done in 14.2s",
  ],
  "Type check": ["tsc --noEmit -p tsconfig.json", "No type errors found"],
  Build: ["next build", "Compiled 214 routes in 31.4s"],
  "Upload to edge": ["Uploading 1,902 files", "Deployment is live"],
};

const failedLogs = [
  "tsc --noEmit -p tsconfig.json",
  "src/cart/summary.tsx(42,17): error TS2322: Type 'string' is not assignable to type 'number'.",
  "Found 1 error in src/cart/summary.tsx",
];

const initialDeployments: Deployment[] = [
  {
    id: "dpl_8kq2",
    branch: "main",
    commit: "a41c9e2",
    message: "Show tax estimate in cart summary",
    author: "Iris Novak",
    age: "6m ago",
    status: "error",
    failedStep: 2,
  },
  {
    id: "dpl_7hx0",
    branch: "main",
    commit: "f02b7d1",
    message: "Lazy-load product reviews",
    author: "Sam Ortiz",
    age: "2h ago",
    status: "ready",
  },
  {
    id: "dpl_6mw4",
    branch: "feat/gift-cards",
    commit: "9d3e5a0",
    message: "Add gift card balance lookup",
    author: "Iris Novak",
    age: "Yesterday",
    status: "ready",
  },
];

const statusMeta: Record<
  Status,
  { label: string; icon: typeof CheckCircle2Icon; className: string }
> = {
  ready: { label: "Ready", icon: CheckCircle2Icon, className: "text-success" },
  error: { label: "Failed", icon: XCircleIcon, className: "text-destructive" },
  building: {
    label: "Building",
    icon: CircleDashedIcon,
    className: "text-muted-foreground",
  },
};

const snapPoints = [0.5, 1];

export default function Drawer14() {
  const [deployments, setDeployments] = React.useState(initialDeployments);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [snapPoint, setSnapPoint] = React.useState<number | string | null>(0.5);
  // Index of the step currently running during a redeploy, per deployment.
  const [runningStep, setRunningStep] = React.useState<Record<string, number>>(
    {},
  );

  const active = deployments.find((item) => item.id === activeId) ?? null;
  const lastActive = React.useRef<Deployment | null>(null);
  if (active) lastActive.current = active;
  const shown = active ?? lastActive.current;

  const buildingId = deployments.find((item) => item.status === "building")?.id;

  const buildingStep = buildingId ? (runningStep[buildingId] ?? 0) : 0;

  // Advance the simulated build one step at a time.
  React.useEffect(() => {
    if (!buildingId) return;
    const interval = window.setInterval(() => {
      setRunningStep((current) => ({
        ...current,
        [buildingId]: (current[buildingId] ?? 0) + 1,
      }));
    }, 900);
    return () => window.clearInterval(interval);
  }, [buildingId]);

  // Mark the deployment ready once every step has run.
  React.useEffect(() => {
    if (!buildingId || buildingStep < steps.length) return;
    setDeployments((items) =>
      items.map((item) =>
        item.id === buildingId
          ? { ...item, status: "ready", age: "Just now" }
          : item,
      ),
    );
  }, [buildingId, buildingStep]);

  function redeploy(id: string) {
    setRunningStep((current) => ({ ...current, [id]: 0 }));
    setDeployments((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, status: "building", failedStep: undefined }
          : item,
      ),
    );
  }

  function stepState(deployment: Deployment, index: number) {
    if (deployment.status === "building") {
      const running = runningStep[deployment.id] ?? 0;
      if (index < running) return "done";
      if (index === running) return "running";
      return "pending";
    }
    if (deployment.status === "error" && deployment.failedStep !== undefined) {
      if (index < deployment.failedStep) return "done";
      if (index === deployment.failedStep) return "failed";
      return "skipped";
    }
    return "done";
  }

  const progressValue = shown
    ? shown.status === "building"
      ? Math.round(((runningStep[shown.id] ?? 0) / steps.length) * 100)
      : 100
    : 0;

  return (
    <div className="w-full max-w-md rounded-xl border bg-card text-card-foreground">
      <div className="px-4 pt-4 pb-3">
        <h3 className="font-medium">Deployments</h3>
        <p className="text-sm text-muted-foreground">tidewater/storefront</p>
      </div>
      <Drawer
        open={activeId !== null}
        onOpenChange={(open) => {
          if (!open) setActiveId(null);
        }}
        snapPoints={snapPoints}
        snapPoint={snapPoint}
        onSnapPointChange={setSnapPoint}
        showSwipeHandle
      >
        <ul className="border-t">
          {deployments.map((deployment) => {
            const meta = statusMeta[deployment.status];
            const Icon = deployment.status === "building" ? null : meta.icon;
            return (
              <li key={deployment.id} className="border-b last:border-b-0">
                <DrawerTrigger
                  onClick={() => {
                    setSnapPoint(0.5);
                    setActiveId(deployment.id);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
                >
                  <span className={cn("shrink-0", meta.className)}>
                    {Icon ? (
                      <Icon aria-hidden="true" className="size-4" />
                    ) : (
                      <Spinner className="size-4" />
                    )}
                    <span className="sr-only">{meta.label}</span>
                  </span>
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="truncate text-sm font-medium">
                      {deployment.message}
                    </span>
                    <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                      <GitBranchIcon
                        aria-hidden="true"
                        className="size-3 shrink-0"
                      />
                      <span className="truncate">{deployment.branch}</span>
                      <span aria-hidden="true">·</span>
                      <span className="shrink-0">{deployment.age}</span>
                    </span>
                  </span>
                </DrawerTrigger>
              </li>
            );
          })}
        </ul>
        <DrawerContent>
          {shown ? (
            <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
              <DrawerHeader className="gap-3 text-left md:gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid min-w-0 gap-1">
                    <DrawerTitle className="truncate">
                      {shown.message}
                    </DrawerTitle>
                    <DrawerDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="flex items-center gap-1">
                        <GitBranchIcon
                          aria-hidden="true"
                          className="size-3.5"
                        />
                        {shown.branch}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <GitCommitHorizontalIcon
                          aria-hidden="true"
                          className="size-3.5"
                        />
                        {shown.commit}
                      </span>
                      <span>by {shown.author}</span>
                    </DrawerDescription>
                  </div>
                  <Badge
                    variant={
                      shown.status === "error" ? "destructive" : "secondary"
                    }
                    className="shrink-0"
                  >
                    {statusMeta[shown.status].label}
                  </Badge>
                </div>
                <Progress value={progressValue} aria-label="Build progress" />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={shown.status === "building"}
                    onClick={() => redeploy(shown.id)}
                  >
                    <RotateCwIcon aria-hidden="true" data-icon="inline-start" />
                    Redeploy
                  </Button>
                  {snapPoint !== 1 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSnapPoint(1)}
                    >
                      <Maximize2Icon
                        aria-hidden="true"
                        data-icon="inline-start"
                      />
                      View full logs
                    </Button>
                  ) : null}
                </div>
              </DrawerHeader>
              <ol
                aria-label="Build steps"
                className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto border-t"
              >
                {steps.map((step, index) => {
                  const state = stepState(shown, index);
                  const lines =
                    state === "failed"
                      ? failedLogs
                      : state === "done"
                        ? logs[step.name]
                        : [];
                  return (
                    <li key={step.name} className="border-b last:border-b-0">
                      <div className="flex items-center gap-3 px-4 py-2.5 text-sm">
                        {state === "done" ? (
                          <CheckCircle2Icon
                            aria-hidden="true"
                            className="size-4 shrink-0 text-success"
                          />
                        ) : state === "failed" ? (
                          <XCircleIcon
                            aria-hidden="true"
                            className="size-4 shrink-0 text-destructive"
                          />
                        ) : state === "running" ? (
                          <Spinner className="size-4 shrink-0" />
                        ) : (
                          <CircleDashedIcon
                            aria-hidden="true"
                            className="size-4 shrink-0 text-muted-foreground"
                          />
                        )}
                        <span
                          className={cn(
                            "flex-1",
                            (state === "pending" || state === "skipped") &&
                              "text-muted-foreground",
                          )}
                        >
                          {step.name}
                          <span className="sr-only">, {state}</span>
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {state === "done" || state === "failed"
                            ? step.duration
                            : state === "skipped"
                              ? "Skipped"
                              : ""}
                        </span>
                      </div>
                      {lines.length > 0 &&
                      (state === "failed" || snapPoint === 1) ? (
                        <pre className="mx-4 mb-3 overflow-x-auto rounded-lg bg-muted px-3 py-2 font-mono text-xs leading-relaxed">
                          {lines.map((line) => (
                            <code
                              key={line}
                              className={cn(
                                "block",
                                state === "failed" && line.includes("error")
                                  ? "text-destructive"
                                  : "text-muted-foreground",
                              )}
                            >
                              {line}
                            </code>
                          ))}
                        </pre>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
