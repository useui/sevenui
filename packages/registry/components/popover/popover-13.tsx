"use client";

import * as React from "react";
import { cn } from "cn";
import {
  SlidersHorizontalIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import { Separator } from "@/registry/base/ui/separator";
import { Switch } from "@/registry/base/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Metric = "revenue" | "orders" | "aov";
type Period = "7d" | "30d" | "90d";

const metrics: {
  value: Metric;
  label: string;
  format: (value: number) => string;
}[] = [
  {
    value: "revenue",
    label: "Net revenue",
    format: (value) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value),
  },
  {
    value: "orders",
    label: "Orders",
    format: (value) => new Intl.NumberFormat("en-US").format(value),
  },
  {
    value: "aov",
    label: "Average order value",
    format: (value) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value),
  },
];

const periods: { value: Period; label: string; long: string }[] = [
  { value: "7d", label: "7D", long: "Last 7 days" },
  { value: "30d", label: "30D", long: "Last 30 days" },
  { value: "90d", label: "90D", long: "Last 90 days" },
];

// Seven buckets per period: current and previous values for each metric.
const data: Record<
  Period,
  Record<Metric, { current: number[]; previous: number[] }>
> = {
  "7d": {
    revenue: {
      current: [4200, 5100, 4800, 6100, 5900, 7200, 6800],
      previous: [3900, 4700, 5000, 5200, 5600, 6100, 6400],
    },
    orders: {
      current: [52, 61, 58, 74, 70, 86, 81],
      previous: [49, 58, 63, 64, 69, 75, 77],
    },
    aov: {
      current: [80.8, 83.6, 82.8, 82.4, 84.3, 83.7, 84],
      previous: [79.6, 81, 79.4, 81.3, 81.2, 81.3, 83.1],
    },
  },
  "30d": {
    revenue: {
      current: [21400, 23900, 22800, 26100, 27400, 29800, 31200],
      previous: [22100, 22600, 24000, 23800, 25100, 26200, 27000],
    },
    orders: {
      current: [262, 290, 281, 318, 330, 356, 371],
      previous: [270, 276, 292, 289, 304, 318, 326],
    },
    aov: {
      current: [81.7, 82.4, 81.1, 82.1, 83, 83.7, 84.1],
      previous: [81.9, 81.9, 82.2, 82.4, 82.6, 82.4, 82.8],
    },
  },
  "90d": {
    revenue: {
      current: [81000, 76500, 84200, 88900, 86100, 93400, 97800],
      previous: [84500, 82100, 80300, 83800, 85600, 84900, 86200],
    },
    orders: {
      current: [1004, 951, 1032, 1080, 1046, 1121, 1168],
      previous: [1041, 1016, 992, 1030, 1049, 1038, 1051],
    },
    aov: {
      current: [80.7, 80.4, 81.6, 82.3, 82.3, 83.3, 83.7],
      previous: [81.2, 80.8, 80.9, 81.4, 81.6, 81.8, 82],
    },
  },
};

function total(metric: Metric, values: number[]) {
  const sum = values.reduce((acc, value) => acc + value, 0);
  return metric === "aov" ? sum / values.length : sum;
}

export default function Popover13() {
  const [metric, setMetric] = React.useState<Metric>("revenue");
  const [period, setPeriod] = React.useState<Period>("30d");
  const [compare, setCompare] = React.useState(true);

  const config = metrics.find((item) => item.value === metric) ?? metrics[0];
  const periodConfig =
    periods.find((item) => item.value === period) ?? periods[1];
  const series = data[period][metric];
  const current = total(metric, series.current);
  const previous = total(metric, series.previous);
  const change = ((current - previous) / previous) * 100;
  const max = Math.max(...series.current, ...series.previous);
  const up = change >= 0;

  return (
    <section
      aria-labelledby="popover-13-title"
      className="w-full max-w-sm rounded-lg border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            id="popover-13-title"
            className="truncate text-muted-foreground text-sm"
          >
            {config.label}
          </h3>
          <p className="mt-1 font-semibold text-2xl tracking-tight tabular-nums">
            {config.format(current)}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs">
            {compare ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium tabular-nums",
                  up ? "text-success" : "text-destructive",
                )}
              >
                {up ? (
                  <TrendingUpIcon className="size-3.5" aria-hidden="true" />
                ) : (
                  <TrendingDownIcon className="size-3.5" aria-hidden="true" />
                )}
                {up ? "+" : ""}
                {change.toFixed(1)}%
              </span>
            ) : null}
            <span className="text-muted-foreground">
              {periodConfig.long}
              {compare ? " vs. previous period" : ""}
            </span>
          </p>
        </div>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Customize widget"
              >
                <SlidersHorizontalIcon aria-hidden="true" />
              </Button>
            }
          />
          <PopoverContent align="end" className="w-64 gap-3 p-3">
            <PopoverHeader>
              <PopoverTitle>Customize widget</PopoverTitle>
              <PopoverDescription>Only visible to you.</PopoverDescription>
            </PopoverHeader>
            <div className="grid gap-2">
              <p
                id="popover-13-metric"
                className="font-medium text-muted-foreground text-xs"
              >
                Metric
              </p>
              <RadioGroup
                aria-labelledby="popover-13-metric"
                value={metric}
                onValueChange={(value) => setMetric(value as Metric)}
                className="gap-2.5"
              >
                {metrics.map((item) => (
                  // biome-ignore lint/a11y/noLabelWithoutControl: the radio renders inside the label
                  <label
                    key={item.value}
                    className="flex cursor-pointer items-center gap-2.5 text-sm"
                  >
                    <RadioGroupItem value={item.value} />
                    {item.label}
                  </label>
                ))}
              </RadioGroup>
            </div>
            <Separator />
            <div className="grid gap-2">
              <p
                id="popover-13-period"
                className="font-medium text-muted-foreground text-xs"
              >
                Period
              </p>
              <ToggleGroup
                variant="outline"
                size="sm"
                spacing={0}
                className="w-full"
                aria-labelledby="popover-13-period"
                value={[period]}
                onValueChange={(value) => {
                  if (value[0]) setPeriod(value[0] as Period);
                }}
              >
                {periods.map((item) => (
                  <ToggleGroupItem
                    key={item.value}
                    value={item.value}
                    aria-label={item.long}
                    className="flex-1"
                  >
                    {item.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <Separator />
            {/* biome-ignore lint/a11y/noLabelWithoutControl: the switch renders inside the label */}
            <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
              Compare to previous period
              <Switch checked={compare} onCheckedChange={setCompare} />
            </label>
          </PopoverContent>
        </Popover>
      </div>
      <div
        role="img"
        aria-label={`${config.label}, ${periodConfig.long}, seven intervals`}
        className="mt-5 flex h-28 items-end gap-2"
      >
        {series.current.map((value, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length series
            key={index}
            className="flex h-full flex-1 items-end gap-0.5"
          >
            {compare ? (
              <div
                className="flex-1 rounded-t-sm bg-muted-foreground/25 transition-[height] duration-300 ease-out"
                style={{ height: `${(series.previous[index] / max) * 100}%` }}
              />
            ) : null}
            <div
              className="flex-1 rounded-t-sm bg-chart-1 transition-[height] duration-300 ease-out"
              style={{ height: `${(value / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      {compare ? (
        <div className="mt-3 flex gap-4 text-muted-foreground text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full bg-chart-1"
              aria-hidden="true"
            />
            This period
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full bg-muted-foreground/25"
              aria-hidden="true"
            />
            Previous
          </span>
        </div>
      ) : null}
    </section>
  );
}
