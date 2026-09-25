"use client";

import { useEffect, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

const actions = [
  {
    id: "publish",
    variant: "default" as const,
    idle: "Publish",
    busy: "Publishing…",
  },
  {
    id: "export",
    variant: "outline" as const,
    idle: "Export CSV",
    busy: "Exporting…",
  },
  {
    id: "sync",
    variant: "secondary" as const,
    idle: "Sync now",
    busy: "Syncing…",
  },
  {
    id: "archive",
    variant: "destructive" as const,
    idle: "Archive",
    busy: "Archiving…",
  },
];

export default function Spinner05() {
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => setPending(null), 2000);
    return () => window.clearTimeout(timer);
  }, [pending]);

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {actions.map((action) => {
          const isBusy = pending === action.id;
          return (
            <Button
              key={action.id}
              variant={action.variant}
              disabled={pending !== null}
              aria-busy={isBusy || undefined}
              onClick={() => setPending(action.id)}
              className="min-w-28"
            >
              {isBusy ? (
                <Spinner aria-hidden="true" data-icon="inline-start" />
              ) : null}
              {isBusy ? action.busy : action.idle}
            </Button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline" disabled aria-label="Refreshing">
          <Spinner aria-hidden="true" />
        </Button>
        <Button size="sm" variant="ghost" disabled>
          <Spinner aria-hidden="true" data-icon="inline-start" />
          Loading more
        </Button>
      </div>
      <p aria-live="polite" className="sr-only">
        {pending
          ? actions.find((action) => action.id === pending)?.busy
          : "Ready"}
      </p>
    </div>
  );
}
