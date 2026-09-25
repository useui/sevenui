"use client";

import * as React from "react";
import {
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

const statuses = [
  {
    id: "success",
    label: "Nightly backup",
    message: "Completed at 02:14. 1,284 files verified.",
    value: 100,
    icon: CircleCheck,
    iconClassName: "text-success",
    className: "[&_[data-slot=progress-indicator]]:bg-success",
  },
  {
    id: "warning",
    label: "Workspace storage",
    message: "46 of 50 GB used. Archive old projects to free space.",
    value: 92,
    icon: TriangleAlert,
    iconClassName: "text-warning",
    className: "[&_[data-slot=progress-indicator]]:bg-warning",
  },
  {
    id: "error",
    label: "Contacts import",
    message: "Stopped at row 3,120: missing email column.",
    value: 64,
    icon: CircleAlert,
    iconClassName: "text-destructive",
    className: "[&_[data-slot=progress-indicator]]:bg-destructive",
  },
];

type ImportState = "error" | "running" | "success";

// The failed import can be retried: it resumes from where it stopped.
const importStates = {
  running: {
    message: "Resuming from row 3,120 with the mapped email column.",
    icon: LoaderCircle,
    iconClassName: "animate-spin text-muted-foreground motion-reduce:animate-none",
    className: "",
  },
  success: {
    message: "Imported 4,870 contacts. 12 duplicates merged.",
    icon: CircleCheck,
    iconClassName: "text-success",
    className: "[&_[data-slot=progress-indicator]]:bg-success",
  },
};

export default function Progress03() {
  const [importState, setImportState] = React.useState<ImportState>("error");
  const [importValue, setImportValue] = React.useState(64);

  React.useEffect(() => {
    if (importState !== "running") return;
    const timer = setInterval(() => {
      setImportValue((current) => Math.min(current + 6, 100));
    }, 150);
    return () => clearInterval(timer);
  }, [importState]);

  React.useEffect(() => {
    if (importState === "running" && importValue >= 100) {
      setImportState("success");
    }
  }, [importState, importValue]);

  const items = statuses.map((status) =>
    status.id === "error" && importState !== "error"
      ? { ...status, ...importStates[importState], value: importValue }
      : status,
  );

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {items.map((status) => {
        const Icon = status.icon;
        const messageId = `progress-03-${status.id}`;

        return (
          <div key={status.id} className="flex gap-3">
            <Icon
              aria-hidden="true"
              className={`mt-0.5 size-4 shrink-0 ${status.iconClassName}`}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Progress
                value={status.value}
                aria-describedby={messageId}
                className={`[&>[data-slot=progress-track]]:h-1.5 ${status.className}`}
              >
                <ProgressLabel>{status.label}</ProgressLabel>
                <ProgressValue />
              </Progress>
              <div className="flex items-start justify-between gap-3">
                <p
                  id={messageId}
                  aria-live={status.id === "error" ? "polite" : undefined}
                  className="text-xs text-muted-foreground"
                >
                  {status.message}
                </p>
                {status.id === "error" && importState === "error" ? (
                  <Button
                    variant="outline"
                    size="xs"
                    className="shrink-0"
                    onClick={() => setImportState("running")}
                  >
                    Retry
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
