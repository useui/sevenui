"use client";

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

export default function Progress02() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      {/* Label and value share a header row above the track. */}
      <Progress value={58}>
        <ProgressLabel>Profile completion</ProgressLabel>
        <ProgressValue />
      </Progress>

      {/* Value trails the track on the same line. */}
      <Progress
        value={73}
        className="flex-nowrap items-center [&>[data-slot=progress-track]]:flex-1"
      >
        <ProgressLabel className="shrink-0 text-xs">API quota</ProgressLabel>
        <ProgressValue className="order-last ml-0 w-10 text-right text-xs" />
      </Progress>

      {/* Label sits under the track with a helper line. */}
      <Progress
        value={31}
        aria-describedby="progress-02-hint"
        className="gap-2"
      >
        <div className="order-last flex w-full items-baseline justify-between gap-3">
          <ProgressLabel className="text-xs">Course: Intro to SQL</ProgressLabel>
          <span
            id="progress-02-hint"
            className="text-xs text-muted-foreground tabular-nums"
          >
            5 of 16 lessons
          </span>
        </div>
      </Progress>
    </div>
  );
}
