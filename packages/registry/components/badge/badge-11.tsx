"use client";

import * as React from "react";
import { CircleAlert, CircleCheck, GitBranch, RotateCw } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

type Status = "ready" | "building" | "failed";

type Deployment = {
  id: string;
  commit: string;
  message: string;
  branch: string;
  env: "Production" | "Preview";
  status: Status;
  time: string;
  current?: boolean;
};

const INITIAL: Deployment[] = [
  {
    id: "dpl-7fk2",
    commit: "a41c9e2",
    message: "Cache pricing page at the edge",
    branch: "main",
    env: "Production",
    status: "ready",
    time: "12m ago",
    current: true,
  },
  {
    id: "dpl-7fj8",
    commit: "e03b7d1",
    message: "Add usage-based billing preview",
    branch: "feat/metered-billing",
    env: "Preview",
    status: "building",
    time: "2m ago",
  },
  {
    id: "dpl-7fh1",
    commit: "9d2a0f4",
    message: "Bump image optimizer to v3",
    branch: "chore/deps",
    env: "Preview",
    status: "failed",
    time: "1h ago",
  },
];

function withStatus(
  list: Deployment[],
  id: string,
  status: Status,
  time?: string,
) {
  return list.map((deployment) =>
    deployment.id === id
      ? { ...deployment, status, time: time ?? deployment.time }
      : deployment,
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "building") {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Spinner aria-hidden="true" role="presentation" data-icon="inline-start" />
        Building
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge variant="destructive">
        <CircleAlert aria-hidden="true" data-icon="inline-start" />
        Failed
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      <CircleCheck
        aria-hidden="true"
        data-icon="inline-start"
        className="text-success"
      />
      Ready
    </Badge>
  );
}

export default function Badge11() {
  const titleId = React.useId();
  const [deployments, setDeployments] = React.useState(INITIAL);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) clearTimeout(timer);
    };
  }, []);

  const setStatus = (id: string, status: Status, time?: string) =>
    setDeployments((prev) => withStatus(prev, id, status, time));

  // Simulate a build: failed or finished deployments go back to building,
  // then settle as ready after a short delay.
  const redeploy = (id: string) => {
    setStatus(id, "building", "just now");
    timers.current.push(setTimeout(() => setStatus(id, "ready"), 2400));
  };

  // Let the preview that is already building finish once.
  React.useEffect(() => {
    const timer = setTimeout(
      () => setDeployments((prev) => withStatus(prev, "dpl-7fj8", "ready")),
      3200,
    );
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      aria-labelledby={titleId}
      className="w-full max-w-xl rounded-xl border border-border bg-card text-card-foreground"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h3 id={titleId} className="text-sm font-semibold">
          Deployments
        </h3>
        <span className="text-xs text-muted-foreground">acme-storefront</span>
      </header>
      <ul className="divide-y divide-border">
        {deployments.map((deployment) => (
          <li
            key={deployment.id}
            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
                <span className="truncate">{deployment.message}</span>
                {deployment.current ? (
                  <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                    Current
                  </Badge>
                ) : null}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <Badge
                  variant={
                    deployment.env === "Production" ? "default" : "secondary"
                  }
                >
                  {deployment.env}
                </Badge>
                <Badge
                  variant="outline"
                  className="max-w-44 font-mono font-normal text-muted-foreground"
                >
                  <GitBranch aria-hidden="true" data-icon="inline-start" />
                  <span className="truncate">{deployment.branch}</span>
                </Badge>
                <span className="font-mono">{deployment.commit}</span>
                <span aria-hidden="true">·</span>
                <span>{deployment.time}</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <span aria-live="polite">
                <StatusBadge status={deployment.status} />
              </span>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Redeploy ${deployment.commit}`}
                disabled={deployment.status === "building"}
                focusableWhenDisabled
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                onClick={() => redeploy(deployment.id)}
              >
                <RotateCw aria-hidden="true" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
