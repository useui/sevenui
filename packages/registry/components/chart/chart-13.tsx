"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/registry/base/ui/badge";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/registry/base/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

type Endpoint = "list-orders" | "create-order" | "search";

const endpoints: { value: Endpoint; label: string }[] = [
  { value: "list-orders", label: "GET /v1/orders" },
  { value: "create-order", label: "POST /v1/orders" },
  { value: "search", label: "GET /v1/search" },
];

const times = [
  "14:00",
  "14:10",
  "14:20",
  "14:30",
  "14:40",
  "14:50",
  "15:00",
  "15:10",
  "15:20",
  "15:30",
  "15:40",
  "15:50",
];

// Latency in milliseconds per 10-minute bucket, per endpoint.
const series: Record<
  Endpoint,
  {
    p50: number[];
    p95: number[];
    p99: number[];
    errorRate: string;
    incident?: [string, string];
  }
> = {
  "list-orders": {
    p50: [42, 44, 41, 43, 45, 44, 42, 43, 41, 44, 43, 42],
    p95: [118, 121, 116, 124, 126, 119, 117, 122, 118, 120, 121, 119],
    p99: [210, 224, 205, 231, 240, 219, 212, 226, 208, 221, 218, 214],
    errorRate: "0.02%",
  },
  "create-order": {
    p50: [88, 91, 86, 94, 162, 188, 171, 96, 90, 89, 92, 87],
    p95: [214, 226, 208, 239, 512, 640, 587, 247, 221, 218, 230, 212],
    p99: [390, 410, 378, 452, 980, 1240, 1105, 468, 402, 396, 421, 388],
    errorRate: "1.84%",
    incident: ["14:40", "15:00"],
  },
  search: {
    p50: [64, 66, 71, 69, 73, 78, 81, 84, 86, 91, 94, 97],
    p95: [180, 184, 196, 201, 214, 226, 238, 247, 259, 268, 281, 290],
    p99: [320, 331, 352, 360, 381, 402, 418, 436, 451, 470, 488, 502],
    errorRate: "0.11%",
  },
};

const chartConfig = {
  p50: { label: "p50", color: "var(--chart-2)" },
  p95: { label: "p95", color: "var(--chart-1)" },
  p99: { label: "p99", color: "var(--chart-4)" },
} satisfies ChartConfig;

export default function Chart13() {
  const [endpoint, setEndpoint] = React.useState<Endpoint>("create-order");
  const current = series[endpoint];

  const data = React.useMemo(
    () =>
      times.map((time, index) => ({
        time,
        p50: current.p50[index],
        p95: current.p95[index],
        p99: current.p99[index],
      })),
    [current],
  );

  const latestP95 = current.p95[current.p95.length - 1];
  const peakP99 = Math.max(...current.p99);

  return (
    <section
      aria-labelledby="chart-13-title"
      className="flex w-full max-w-xl flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 id="chart-13-title" className="font-medium text-sm">
            Latency
          </h3>
          <p className="text-xs text-muted-foreground">
            orders-api · production · last 2 hours
          </p>
        </div>
        <Select
          items={endpoints}
          value={endpoint}
          onValueChange={(value) => setEndpoint(value as Endpoint)}
        >
          <SelectTrigger
            aria-label="Endpoint"
            size="sm"
            className="w-full font-mono sm:w-44"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {endpoints.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                className="font-mono"
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <dl className="grid grid-cols-3 gap-1.5 text-sm sm:gap-2">
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted px-2 py-2 sm:px-3">
          <dt className="text-xs text-muted-foreground">p95 now</dt>
          <dd className="font-mono text-xs font-medium whitespace-nowrap tabular-nums sm:text-sm">{latestP95} ms</dd>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted px-2 py-2 sm:px-3">
          <dt className="text-xs text-muted-foreground">Peak p99</dt>
          <dd className="font-mono text-xs font-medium whitespace-nowrap tabular-nums sm:text-sm">
            {peakP99.toLocaleString("en-US")} ms
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted px-2 py-2 sm:px-3">
          <dt className="text-xs text-muted-foreground">Errors</dt>
          <dd className="font-mono text-xs font-medium whitespace-nowrap tabular-nums sm:text-sm">
            {current.errorRate}
          </dd>
        </div>
      </dl>

      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-52 w-full"
        role="img"
        aria-label={`Latency percentiles for ${endpoints.find((item) => item.value === endpoint)?.label}: p95 now ${latestP95} ms, peak p99 ${peakP99} ms`}
      >
        <LineChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
          />
          <YAxis
            width={56}
            tickLine={false}
            axisLine={false}
            // A non-breaking space keeps recharts from wrapping "1400 ms" onto two lines.
            tickFormatter={(value: number) => `${value}\u00a0ms`}
          />
          {current.incident ? (
            <ReferenceArea
              x1={current.incident[0]}
              x2={current.incident[1]}
              fill="var(--destructive)"
              fillOpacity={0.08}
              label={{
                value: "INC-2291",
                position: "insideTop",
                fill: "var(--destructive)",
                fontSize: 11,
              }}
            />
          ) : null}
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
                      {value} ms
                    </span>
                  </div>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="p50"
            type="monotone"
            stroke="var(--color-p50)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="p95"
            type="monotone"
            stroke="var(--color-p95)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="p99"
            type="monotone"
            stroke="var(--color-p99)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
          />
        </LineChart>
      </ChartContainer>

      {current.incident ? (
        <div className="flex flex-wrap items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
          <Badge variant="outline">Resolved</Badge>
          <span>
            Connection pool exhaustion on orders-db, {current.incident[0]} –{" "}
            {current.incident[1]}.
          </span>
        </div>
      ) : null}
    </section>
  );
}
