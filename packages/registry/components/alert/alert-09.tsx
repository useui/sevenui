"use client";

import * as React from "react";
import { CircleCheckIcon, DatabaseBackupIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";
import { Progress } from "@/registry/base/ui/progress";
import { Spinner } from "@/registry/base/ui/spinner";

type Phase = "idle" | "running" | "done";

export default function Alert09() {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => {
      setValue((current) => Math.min(current + 8, 100));
    }, 250);
    return () => window.clearInterval(id);
  }, [phase]);

  React.useEffect(() => {
    if (phase === "running" && value >= 100) setPhase("done");
  }, [phase, value]);

  function start() {
    setValue(0);
    setPhase("running");
  }

  return (
    <div className="w-full max-w-md">
      {phase === "idle" && (
        <Alert role="status">
          <DatabaseBackupIcon aria-hidden="true" />
          <AlertTitle>Restore point from 08:00 is ready</AlertTitle>
          <AlertDescription>
            Restoring replaces 1,284 records changed since this morning.
          </AlertDescription>
          <AlertAction>
            <Button size="xs" onClick={start}>
              Restore
            </Button>
          </AlertAction>
        </Alert>
      )}
      {phase === "running" && (
        <Alert role="status" aria-busy="true">
          <Spinner aria-hidden="true" />
          <AlertTitle>Restoring your data</AlertTitle>
          <AlertDescription className="grid gap-2">
            <span className="tabular-nums">
              {Math.round((value / 100) * 1284).toLocaleString("en-US")} of
              1,284 records
            </span>
            <Progress value={value} aria-label="Restore progress" />
          </AlertDescription>
        </Alert>
      )}
      {phase === "done" && (
        <Alert role="status" className="border-success/30 bg-success/5">
          <CircleCheckIcon aria-hidden="true" className="text-success!" />
          <AlertTitle>Restore complete</AlertTitle>
          <AlertDescription>
            All 1,284 records match the 08:00 restore point.
          </AlertDescription>
          <AlertAction>
            <Button size="xs" variant="outline" onClick={() => setPhase("idle")}>
              Done
            </Button>
          </AlertAction>
        </Alert>
      )}
    </div>
  );
}
