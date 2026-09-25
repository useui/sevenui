"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/base/ui/chart";

const deployments = [
  { day: "Mon", deploys: 14 },
  { day: "Tue", deploys: 22 },
  { day: "Wed", deploys: 19 },
  { day: "Thu", deploys: 27 },
  { day: "Fri", deploys: 11 },
  { day: "Sat", deploys: 3 },
  { day: "Sun", deploys: 2 },
];

const chartConfig = {
  deploys: { label: "Deploys", color: "var(--chart-1)" },
} satisfies ChartConfig;

const total = deployments.reduce((sum, item) => sum + item.deploys, 0);

export default function Chart01() {
  return (
    <figure
      aria-labelledby="chart-01-title"
      className="flex w-full max-w-md flex-col gap-3"
    >
      <figcaption className="flex items-baseline justify-between gap-4">
        <span id="chart-01-title" className="text-sm font-medium">
          Production deploys this week
        </span>
        <span className="text-sm text-muted-foreground tabular-nums">
          {total} total
        </span>
      </figcaption>
      <ChartContainer config={chartConfig} className="aspect-auto h-44 w-full">
        <BarChart data={deployments} margin={{ left: 0, right: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="deploys" fill="var(--color-deploys)" radius={4} />
        </BarChart>
      </ChartContainer>
    </figure>
  );
}
