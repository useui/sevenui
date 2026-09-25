"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import * as React from "react";

import { Skeleton } from "@/registry/base/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

type Range = "7d" | "30d" | "90d";

const ranges: Record<
  Range,
  {
    label: string;
    total: string;
    delta: number;
    unit: string;
    bars: number[];
  }
> = {
  "7d": {
    label: "Last 7 days",
    total: "1,284",
    delta: 12.4,
    unit: "day",
    bars: [142, 168, 201, 188, 236, 174, 175],
  },
  "30d": {
    label: "Last 30 days",
    total: "5,019",
    delta: -3.1,
    unit: "3 days",
    bars: [512, 468, 530, 494, 441, 506, 552, 489, 520, 507],
  },
  "90d": {
    label: "Last 90 days",
    total: "16,742",
    delta: 21.8,
    unit: "week",
    bars: [
      1080, 1122, 1195, 1240, 1302, 1288, 1356, 1410, 1398, 1472, 1455, 1424,
    ],
  },
};

// Fixed heights so the loading chart reads as a chart, not a flat block.
const skeletonBars = [45, 62, 38, 70, 55, 80, 48, 66, 58, 74];

export default function Skeleton13() {
  const [range, setRange] = React.useState<Range>("7d");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setLoading(false), 1000);
    return () => window.clearTimeout(timer);
  }, [loading]);

  return (
    <section
      aria-label="Signups"
      className="w-full max-w-md rounded-xl border border-border bg-card p-5 text-card-foreground"
    >
      <Tabs
        value={range}
        onValueChange={(next) => {
          setRange(next as Range);
          setLoading(true);
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            New signups
          </h3>
          <TabsList aria-label="Date range">
            {(Object.keys(ranges) as Range[]).map((key) => (
              <TabsTrigger key={key} value={key} className="px-2.5 tabular-nums">
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {(Object.keys(ranges) as Range[]).map((key) => {
          const data = ranges[key];
          const max = Math.max(...data.bars);
          const up = data.delta >= 0;
          return (
            <TabsContent key={key} value={key} aria-busy={loading}>
              <p role="status" className="sr-only">
                {loading ? `Loading ${data.label.toLowerCase()}` : ""}
              </p>
              {loading ? (
                <div aria-hidden="true" className="mt-3 flex flex-col gap-5">
                  <div className="flex items-end gap-3">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="mb-1 h-4 w-14 rounded-full" />
                  </div>
                  <div className="flex h-36 items-end gap-1.5 border-b border-border">
                    {skeletonBars.map((height) => (
                      <Skeleton
                        key={height}
                        className="flex-1 rounded-b-none rounded-t-sm"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <Skeleton className="h-3 w-40" />
                </div>
              ) : (
                <div className="mt-3 flex flex-col gap-5">
                  <div className="flex items-end gap-3">
                    <p className="text-3xl font-semibold tabular-nums leading-none">
                      {data.total}
                    </p>
                    <p className="flex items-center gap-0.5 text-sm font-medium tabular-nums">
                      {up ? (
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-4 text-success"
                        />
                      ) : (
                        <ArrowDownRight
                          aria-hidden="true"
                          className="size-4 text-destructive"
                        />
                      )}
                      <span className="sr-only">
                        {up ? "Up" : "Down"} by
                      </span>
                      {Math.abs(data.delta)}%
                    </p>
                  </div>
                  <div
                    role="img"
                    aria-label={`Signups per ${data.unit}, ${data.label.toLowerCase()}: ${data.bars.join(", ")}`}
                    className="flex h-36 items-end gap-1.5 border-b border-border"
                  >
                    {data.bars.map((value, index) => (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: bars are positional buckets
                        key={index}
                        title={`${value.toLocaleString("en-US")} signups`}
                        className="flex-1 rounded-t-sm bg-chart-1 transition-opacity hover:opacity-80"
                        style={{ height: `${(value / max) * 100}%` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.label}, grouped by {data.unit}, compared with the
                    previous period.
                  </p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}
