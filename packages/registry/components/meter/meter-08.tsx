"use client";

import * as React from "react";
import { CloudOff, HardDrive, RotateCw, Upload } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";
import { Skeleton } from "@/registry/base/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Status = "ready" | "loading" | "empty" | "error";

const states: { value: Status; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "loading", label: "Loading" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
];

const storage: Intl.NumberFormatOptions = {
  style: "unit",
  unit: "gigabyte",
  maximumFractionDigits: 1,
};

export default function Meter08() {
  const [status, setStatus] = React.useState<Status>("ready");

  React.useEffect(() => {
    if (status !== "loading") return;
    const timeout = window.setTimeout(() => setStatus("ready"), 1500);
    return () => window.clearTimeout(timeout);
  }, [status]);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        aria-label="Preview state"
        value={[status]}
        onValueChange={(next) => {
          if (next[0]) setStatus(next[0] as Status);
        }}
      >
        {states.map((state) => (
          <ToggleGroupItem key={state.value} value={state.value}>
            {state.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            Workspace storage
          </CardTitle>
          <CardDescription>Shared across 12 members</CardDescription>
        </CardHeader>
        <CardContent aria-live="polite" aria-busy={status === "loading"}>
          {status === "ready" && (
            <Meter
              value={34.2}
              max={50}
              format={storage}
              locale="en-US"
              className="grid-cols-[1fr_auto]"
            >
              <MeterLabel>Used</MeterLabel>
              <MeterValue className="text-right tabular-nums">
                {(formatted) => `${formatted} of 50 GB`}
              </MeterValue>
            </Meter>
          )}
          {status === "loading" && (
            <div className="grid gap-2">
              <span className="sr-only">Loading storage usage</span>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          )}
          {status === "empty" && (
            <div className="grid gap-3">
              <Meter
                value={0}
                max={50}
                format={storage}
                locale="en-US"
                className="grid-cols-[1fr_auto]"
              >
                <MeterLabel>Used</MeterLabel>
                <MeterValue className="text-right tabular-nums">
                  {() => "0 of 50 GB"}
                </MeterValue>
              </Meter>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  No files uploaded yet.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStatus("loading")}
                >
                  <Upload aria-hidden="true" />
                  Upload files
                </Button>
              </div>
            </div>
          )}
          {status === "error" && (
            <div
              role="alert"
              className="flex flex-col items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3"
            >
              <div className="flex gap-2 text-sm">
                <CloudOff
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-destructive"
                />
                <div className="grid gap-0.5">
                  <p className="font-medium text-destructive">
                    Couldn't load storage usage
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The usage service timed out. Your files are not affected.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStatus("loading")}
              >
                <RotateCw aria-hidden="true" />
                Try again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
