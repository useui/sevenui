"use client";

import { cn } from "cn";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import * as React from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/registry/base/ui/chart";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Metric = "revenue" | "orders" | "aov";
type Range = "30" | "90";

const metrics: {
  key: Metric;
  label: string;
  format: (value: number) => string;
}[] = [
  {
    key: "revenue",
    label: "Net revenue",
    format: (value) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: value >= 100_000 ? "compact" : "standard",
        maximumFractionDigits: value >= 100_000 ? 1 : 0,
      }).format(value),
  },
  {
    key: "orders",
    label: "Orders",
    format: (value) => Math.round(value).toLocaleString("en-US"),
  },
  {
    key: "aov",
    label: "Avg. order",
    format: (value) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(value),
  },
];

// Deterministic daily store data for the last 90 days (ending Sep 24)
// and the 90 days before that, so the preview never changes between renders.
function buildDays() {
  const end = new Date(2026, 8, 24);
  return Array.from({ length: 90 }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (89 - index));
    const weekday = date.getDay();
    const weekend = weekday === 0 || weekday === 6 ? 1.28 : 1;
    const wave = Math.sin(index / 4.2) * 0.12 + Math.cos(index / 11) * 0.08;
    const trend = 1 + index * 0.0042;
    const orders = Math.round(142 * weekend * trend * (1 + wave));
    const aov = 58 + Math.sin(index / 6.5) * 4.5 + index * 0.03;
    const prevWave = Math.sin((index + 7) / 4.6) * 0.1;
    const prevOrders = Math.round(
      128 * weekend * (1 + index * 0.002) * (1 + prevWave),
    );
    const prevAov = 55.5 + Math.cos(index / 7) * 3.8;
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      orders,
      aov: Math.round(aov * 100) / 100,
      revenue: Math.round(orders * aov),
      prevOrders,
      prevAov: Math.round(prevAov * 100) / 100,
      prevRevenue: Math.round(prevOrders * prevAov),
    };
  });
}

const allDays = buildDays();

const chartConfig = {
  current: { label: "This period", color: "var(--chart-1)" },
  previous: { label: "Previous period", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

function summarize(days: typeof allDays, metric: Metric) {
  const orders = days.reduce((sum, day) => sum + day.orders, 0);
  const revenue = days.reduce((sum, day) => sum + day.revenue, 0);
  const prevOrders = days.reduce((sum, day) => sum + day.prevOrders, 0);
  const prevRevenue = days.reduce((sum, day) => sum + day.prevRevenue, 0);
  const totals = {
    revenue: [revenue, prevRevenue],
    orders: [orders, prevOrders],
    aov: [revenue / orders, prevRevenue / prevOrders],
  } satisfies Record<Metric, number[]>;
  const [current, previous] = totals[metric];
  return { current, change: ((current - previous) / previous) * 100 };
}

export default function Chart18() {
  const [metric, setMetric] = React.useState<Metric>("revenue");
  const [range, setRange] = React.useState<Range>("30");
  const [compare, setCompare] = React.useState(true);

  const days = React.useMemo(() => allDays.slice(-Number(range)), [range]);
  const active = metrics.find((item) => item.key === metric) ?? metrics[0];
  const previousKey = {
    revenue: "prevRevenue",
    orders: "prevOrders",
    aov: "prevAov",
  }[metric];

  const data = days.map((day) => ({
    date: day.date,
    current: day[metric],
    previous: day[previousKey as keyof typeof day],
  }));

  const activeSummary = summarize(days, metric);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Store performance</CardTitle>
        <CardDescription>
          Online store · last {range} days vs. the {range} days before
        </CardDescription>
        <CardAction>
          <ToggleGroup
            aria-label="Date range"
            variant="outline"
            size="sm"
            spacing={0}
            value={[range]}
            onValueChange={(value) => {
              const next = value[0] as Range | undefined;
              if (next) setRange(next);
            }}
          >
            <ToggleGroupItem value="30">30d</ToggleGroupItem>
            <ToggleGroupItem value="90">90d</ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <fieldset
          aria-label="Metric shown in chart"
          className="m-0 grid min-w-0 grid-cols-1 gap-2 border-0 p-0 sm:grid-cols-3"
        >
          {metrics.map((item) => {
            const summary = summarize(days, item.key);
            const up = summary.change >= 0;
            const selected = item.key === metric;
            const TrendIcon = up ? ArrowUpRight : ArrowDownRight;
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={selected}
                onClick={() => setMetric(item.key)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  selected && "border-primary/40 bg-muted",
                )}
              >
                <span className="text-xs text-muted-foreground">
                  {item.label}
                </span>
                <span className="flex w-full items-baseline justify-between gap-2">
                  <span className="font-semibold text-lg tabular-nums">
                    {item.format(summary.current)}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-medium tabular-nums",
                      up ? "text-success" : "text-destructive",
                    )}
                  >
                    <TrendIcon aria-hidden="true" className="size-3.5" />
                    {Math.abs(summary.change).toFixed(1)}%
                    <span className="sr-only">
                      {up ? "increase" : "decrease"} vs. previous period
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </fieldset>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-56 w-full"
          role="img"
          aria-label={`${active.label} per day over the last ${range} days: ${active.format(activeSummary.current)} total, ${activeSummary.change >= 0 ? "up" : "down"} ${Math.abs(activeSummary.change).toFixed(1)}% on the previous period`}
        >
          <ComposedChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="chart-18-fill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-current)"
                  stopOpacity={0.28}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-current)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis
              width={52}
              tickLine={false}
              axisLine={false}
              domain={
                metric === "aov" ? ["dataMin - 4", "dataMax + 4"] : [0, "auto"]
              }
              tickFormatter={(value: number) =>
                metric === "orders"
                  ? String(value)
                  : new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(value)
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, name, item) => (
                    <div className="flex w-full items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-1 rounded-[2px]"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label}
                      </span>
                      <span className="ml-auto font-mono font-medium tabular-nums">
                        {active.format(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              dataKey="current"
              type="monotone"
              stroke="var(--color-current)"
              strokeWidth={2}
              fill="url(#chart-18-fill)"
              dot={false}
            />
            {compare ? (
              <Line
                dataKey="previous"
                type="monotone"
                stroke="var(--color-previous)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            ) : null}
          </ComposedChart>
        </ChartContainer>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-0.5 w-3 rounded-full bg-chart-1"
              />
              Last {range} days
            </span>
            {compare ? (
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="w-3 border-t border-dashed border-muted-foreground"
                />
                Previous {range} days
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="chart-18-compare"
              size="sm"
              checked={compare}
              onCheckedChange={setCompare}
            />
            <Label htmlFor="chart-18-compare" className="font-normal text-sm">
              Compare to previous period
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
