"use client";

import * as React from "react";
import {
  AlertCircleIcon,
  CloudIcon,
  HardDriveIcon,
  LockIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { Spinner } from "@/registry/base/ui/spinner";
import { Toggle } from "@/registry/base/ui/toggle";

export default function Toggle03() {
  const [syncing, setSyncing] = React.useState(false);
  const [synced, setSynced] = React.useState(false);
  const errorId = React.useId();
  const policyId = React.useId();
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleSync(pressed: boolean) {
    if (!pressed) {
      setSynced(false);
      return;
    }
    // Simulate a server round-trip before committing the pressed state.
    setSyncing(true);
    timer.current = setTimeout(() => {
      setSyncing(false);
      setSynced(true);
    }, 1400);
  }

  return (
    <div className="flex w-full max-w-sm flex-col divide-y rounded-xl border">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Loading</p>
          <p className="text-xs text-muted-foreground">
            Waits for the server before it flips.
          </p>
        </div>
        <Toggle
          variant="outline"
          pressed={synced}
          disabled={syncing}
          aria-busy={syncing}
          onPressedChange={handleSync}
          className="min-w-28"
        >
          {syncing ? (
            <Spinner aria-hidden="true" data-icon="inline-start" />
          ) : (
            <CloudIcon aria-hidden="true" data-icon="inline-start" />
          )}
          {syncing ? "Syncing" : synced ? "Synced" : "Cloud sync"}
        </Toggle>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Disabled</p>
          <p className="text-xs text-muted-foreground">
            Local backup needs 2.4 GB free.
          </p>
        </div>
        <Toggle variant="outline" disabled className="min-w-28">
          <HardDriveIcon aria-hidden="true" data-icon="inline-start" />
          Local backup
        </Toggle>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-destructive">Error</p>
          <p
            id={errorId}
            className="flex items-center gap-1 text-xs text-muted-foreground"
          >
            <AlertCircleIcon
              aria-hidden="true"
              className="size-3 shrink-0 text-destructive"
            />
            Add a recovery key first.
          </p>
        </div>
        <Toggle
          variant="outline"
          aria-invalid
          aria-describedby={errorId}
          className="min-w-28"
        >
          <ShieldCheckIcon aria-hidden="true" data-icon="inline-start" />
          Encryption
        </Toggle>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Read-only</p>
          <p
            id={policyId}
            className="text-xs text-muted-foreground"
          >
            Enforced by your workspace admin.
          </p>
        </div>
        <Toggle
          variant="outline"
          pressed
          aria-describedby={policyId}
          className="min-w-28 cursor-default hover:bg-muted"
        >
          <LockIcon aria-hidden="true" data-icon="inline-start" />
          Retention
        </Toggle>
      </div>
    </div>
  );
}
