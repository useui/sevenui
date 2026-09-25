"use client";

import { CircleAlertIcon, CircleCheckIcon, LockIcon } from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/registry/base/ui/skeleton";
import { Slider } from "@/registry/base/ui/slider";

const PLAN_LIMIT = 8;

export default function Slider05() {
  const [builds, setBuilds] = useState(6);
  const overLimit = builds > PLAN_LIMIT;

  return (
    <div className="flex w-full max-w-sm flex-col divide-y divide-border">
      <div className="flex flex-col gap-3 pb-5">
        <div className="flex items-baseline justify-between gap-4">
          <span id="slider-05-builds" className="text-sm font-medium">
            Concurrent builds
          </span>
          <span
            aria-hidden="true"
            className={
              overLimit
                ? "text-sm font-medium tabular-nums text-destructive"
                : "text-sm tabular-nums text-muted-foreground"
            }
          >
            {builds} / {PLAN_LIMIT}
          </span>
        </div>
        <Slider
          aria-labelledby="slider-05-builds"
          aria-describedby="slider-05-builds-status"
          aria-invalid={overLimit || undefined}
          className={
            overLimit
              ? "[&_[data-slot=slider-range]]:bg-destructive [&_[data-slot=slider-thumb]]:border-destructive [&_[data-slot=slider-thumb]]:ring-destructive/30"
              : undefined
          }
          min={1}
          max={12}
          value={[builds]}
          onValueChange={(value) =>
            setBuilds(typeof value === "number" ? value : value[0])
          }
        />
        <p
          id="slider-05-builds-status"
          aria-live="polite"
          className={
            overLimit
              ? "flex items-center gap-1.5 text-xs text-destructive"
              : "flex items-center gap-1.5 text-xs text-muted-foreground"
          }
        >
          {overLimit ? (
            <>
              <CircleAlertIcon aria-hidden="true" className="size-3.5 shrink-0" />
              {builds - PLAN_LIMIT} over the Pro plan limit. Extra builds will
              queue until you upgrade.
            </>
          ) : (
            <>
              <CircleCheckIcon
                aria-hidden="true"
                className="size-3.5 shrink-0 text-success"
              />
              Within your Pro plan limit.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-3 py-5">
        <div className="flex items-baseline justify-between gap-4">
          <span
            id="slider-05-upload"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
          >
            <LockIcon aria-hidden="true" className="size-3.5" />
            Max upload size
          </span>
          <span
            aria-hidden="true"
            className="text-sm tabular-nums text-muted-foreground"
          >
            250 MB
          </span>
        </div>
        <Slider
          aria-labelledby="slider-05-upload"
          aria-describedby="slider-05-upload-hint"
          disabled
          min={10}
          max={1000}
          step={10}
          defaultValue={[250]}
        />
        <p id="slider-05-upload-hint" className="text-xs text-muted-foreground">
          Set by your workspace policy. Ask an admin to change it.
        </p>
      </div>

      <div aria-busy="true" className="flex flex-col gap-3 pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm font-medium">API rate limit</span>
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <p className="text-xs text-muted-foreground">Loading current limits…</p>
      </div>
    </div>
  );
}
