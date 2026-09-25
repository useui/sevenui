"use client";

import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Range = "24h" | "7d" | "30d" | "90d";

const ranges: Record<
  Range,
  { label: string; revenue: string; change: number; series: number[]; axis: [string, string] }
> = {
  "24h": {
    label: "last 24 hours",
    revenue: "$4,218",
    change: 6.2,
    series: [22, 18, 12, 9, 14, 28, 41, 52, 48, 57, 63, 44],
    axis: ["00:00", "22:00"],
  },
  "7d": {
    label: "last 7 days",
    revenue: "$31,940",
    change: 12.4,
    series: [38, 46, 51, 44, 62, 29, 24],
    axis: ["Mon", "Sun"],
  },
  "30d": {
    label: "last 30 days",
    revenue: "$128,502",
    change: -3.1,
    series: [48, 52, 61, 58, 44, 40, 55, 63, 57, 49, 46, 42, 51, 60, 54],
    axis: ["Aug 27", "Sep 25"],
  },
  "90d": {
    label: "last 90 days",
    revenue: "$402,117",
    change: 18.9,
    series: [28, 31, 35, 33, 40, 44, 47, 45, 52, 58, 61, 66, 70],
    axis: ["Jun 27", "Sep 25"],
  },
};

export default function ToggleGroup09() {
  const [range, setRange] = React.useState<Range>("7d");
  const data = ranges[range];
  const max = Math.max(...data.series);
  const up = data.change >= 0;
  const Trend = up ? TrendingUp : TrendingDown;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Net revenue</CardTitle>
        <CardDescription>After refunds and payment fees.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <ToggleGroup
          aria-label="Date range"
          size="sm"
          spacing={0}
          value={[range]}
          onValueChange={(next) => {
            if (next[0]) setRange(next[0] as Range);
          }}
          className="w-full rounded-lg bg-muted p-0.5"
        >
          {(Object.keys(ranges) as Range[]).map((key) => (
            <ToggleGroupItem
              key={key}
              value={key}
              className="flex-1 rounded-md! text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
            >
              {key}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div aria-live="polite" className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-3xl font-semibold tracking-tight tabular-nums">
              {data.revenue}
            </span>
            <span className="text-xs text-muted-foreground">{data.label}</span>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-sm font-medium tabular-nums ${
              up ? "text-success" : "text-destructive"
            }`}
          >
            <Trend className="size-4" aria-hidden="true" />
            {up ? "+" : ""}
            {data.change}%
            <span className="sr-only">versus the previous period</span>
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <div
            role="img"
            aria-label={`Revenue trend for the ${data.label}, ${up ? "up" : "down"} ${Math.abs(data.change)}% overall.`}
            className="flex h-28 items-end gap-1"
          >
            {data.series.map((point, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static series keyed by position
                key={index}
                className="flex-1 rounded-t-sm bg-chart-1 transition-[height] duration-300 ease-out motion-reduce:transition-none"
                style={{ height: `${(point / max) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{data.axis[0]}</span>
            <span>{data.axis[1]}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
