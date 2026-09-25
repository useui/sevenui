"use client";

import { CircleCheckIcon, CircleXIcon, LoaderIcon } from "lucide-react";
import * as React from "react";

import { Toggle } from "@/registry/base/ui/toggle";

type Status = "ready" | "failed" | "building";

type Deploy = {
  id: string;
  branch: string;
  commit: string;
  status: Status;
};

const initial: Deploy[] = [
  { id: "d3", branch: "main", commit: "Fix invoice rounding", status: "ready" },
  { id: "d2", branch: "feat/sso", commit: "Add SAML callback", status: "failed" },
  { id: "d1", branch: "main", commit: "Bump Node to 22", status: "ready" },
];

// Events that arrive one by one while live updates are on.
const incoming: Deploy[] = [
  { id: "d4", branch: "feat/sso", commit: "Retry SAML callback", status: "building" },
  { id: "d5", branch: "main", commit: "Cache pricing page", status: "ready" },
  { id: "d6", branch: "fix/csv", commit: "Escape quotes in export", status: "ready" },
];

const statusMeta: Record<
  Status,
  { label: string; icon: typeof CircleCheckIcon; className: string }
> = {
  ready: { label: "Ready", icon: CircleCheckIcon, className: "text-success" },
  failed: { label: "Failed", icon: CircleXIcon, className: "text-destructive" },
  building: {
    label: "Building",
    icon: LoaderIcon,
    className: "text-muted-foreground motion-safe:animate-spin",
  },
};

export default function Toggle11() {
  const [live, setLive] = React.useState(true);
  const [deploys, setDeploys] = React.useState(initial);
  const [queue, setQueue] = React.useState(0);

  // Push the next queued event every few seconds; stops when paused or drained.
  React.useEffect(() => {
    if (!live || queue >= incoming.length) return;
    const timer = setTimeout(() => {
      setDeploys((current) => [incoming[queue], ...current].slice(0, 5));
      setQueue((index) => index + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [live, queue]);

  return (
    <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium">Deployments</h3>
          <p className="text-xs text-muted-foreground">
            acme-web · Production
          </p>
        </div>
        <Toggle
          variant="outline"
          size="sm"
          pressed={live}
          onPressedChange={setLive}
          className="shrink-0 gap-2 aria-pressed:bg-transparent"
        >
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inset-0 hidden rounded-full bg-success opacity-75 group-aria-pressed/toggle:block group-aria-pressed/toggle:motion-safe:animate-ping" />
            <span className="relative size-2 rounded-full bg-muted-foreground group-aria-pressed/toggle:bg-success" />
          </span>
          Live updates
        </Toggle>
      </div>
      <ul aria-live={live ? "polite" : "off"} className="divide-y">
        {deploys.map((deploy) => {
          const meta = statusMeta[deploy.status];
          const Icon = meta.icon;
          return (
            <li key={deploy.id} className="flex items-center gap-3 px-4 py-2.5">
              <Icon
                aria-hidden="true"
                className={`size-4 shrink-0 ${meta.className}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{deploy.commit}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {deploy.branch}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {meta.label}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="border-t px-4 py-2 text-xs text-muted-foreground">
        {live
          ? queue < incoming.length
            ? "Listening for new deployments."
            : "Up to date."
          : "Paused. New deployments will appear when you resume."}
      </p>
    </div>
  );
}
