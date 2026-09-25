"use client";

import * as React from "react";
import { CalendarClockIcon, PlusIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import { Skeleton } from "@/registry/base/ui/skeleton";

const skeletonRows = ["w-3/4", "w-1/2", "w-2/3"];

export default function Empty09() {
  const [loading, setLoading] = React.useState(true);
  const [reloads, setReloads] = React.useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloads re-runs the simulated fetch
  React.useEffect(() => {
    setLoading(true);
    const timeout = window.setTimeout(() => setLoading(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [reloads]);

  return (
    <div className="w-full max-w-md rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium">Scheduled posts</h3>
          <p className="text-xs text-muted-foreground">Sep 28 &ndash; Oct 4</p>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Refresh scheduled posts"
          disabled={loading}
          onClick={() => setReloads((count) => count + 1)}
        >
          <RefreshCwIcon
            aria-hidden="true"
            className={loading ? "animate-spin motion-reduce:animate-none" : undefined}
          />
        </Button>
      </div>
      <div aria-busy={loading} aria-live="polite" className="min-h-56">
        {loading ? (
          <ul aria-label="Loading scheduled posts" className="grid gap-4 p-4">
            {skeletonRows.map((width) => (
              <li key={width} className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-md" />
                <div className="grid flex-1 gap-2">
                  <Skeleton className={`h-3 ${width}`} />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty className="min-h-56 transition-[opacity,translate] duration-300 ease-out starting:translate-y-1 starting:opacity-0 motion-reduce:transition-none">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarClockIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Nothing scheduled next week</EmptyTitle>
              <EmptyDescription>
                Your queue runs dry on Monday. Accounts that post at least three times a week keep their reach steady.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm">
                <PlusIcon aria-hidden="true" data-icon="inline-start" />
                Schedule a post
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </div>
  );
}
