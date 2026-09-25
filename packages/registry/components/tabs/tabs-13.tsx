"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { cn } from "cn";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/base/ui/chart";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const metrics = [
  {
    value: "revenue",
    label: "Revenue",
    total: "$18,420",
    change: 12.4,
    color: "var(--chart-1)",
    series: [2140, 2480, 2310, 2890, 3120, 2760, 2720],
  },
  {
    value: "orders",
    label: "Orders",
    total: "312",
    change: 6.1,
    color: "var(--chart-2)",
    series: [38, 44, 41, 49, 55, 46, 39],
  },
  {
    value: "conversion",
    label: "Conversion",
    total: "2.8%",
    change: -0.4,
    color: "var(--chart-3)",
    series: [2.9, 3.1, 2.7, 2.8, 3.0, 2.6, 2.5],
  },
];

export default function Tabs13() {
  return (
    <section
      aria-labelledby="tabs-13-title"
      className="w-full max-w-lg overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs"
    >
      <div className="flex flex-col gap-0.5 px-4 pt-4 pb-3">
        <h3 id="tabs-13-title" className="text-sm font-semibold">
          Storefront performance
        </h3>
        <p className="text-sm text-muted-foreground">
          Last 7 days compared with the week before
        </p>
      </div>

      <Tabs defaultValue="revenue" className="gap-0">
        <TabsList
          aria-labelledby="tabs-13-title"
          className="grid w-full grid-cols-3 rounded-none border-y bg-transparent p-0 group-data-[orientation=horizontal]/tabs:h-auto"
        >
          {metrics.map((metric) => {
            const up = metric.change >= 0;
            return (
              <TabsTrigger
                key={metric.value}
                value={metric.value}
                className="h-full min-w-0 flex-col items-start gap-1 rounded-none border-0 border-r px-2.5 py-3 text-left last:border-r-0 hover:bg-muted/40 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-inset data-active:bg-muted/60 data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-muted/40 sm:px-4"
              >
                <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground sm:gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: metric.color }}
                  />
                  {metric.label}
                </span>
                <span className="text-lg font-semibold text-foreground tabular-nums sm:text-xl">
                  {metric.total}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-medium tabular-nums",
                    up ? "text-success" : "text-destructive",
                  )}
                >
                  {up ? (
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  ) : (
                    <ArrowDownRight aria-hidden="true" className="size-3.5" />
                  )}
                  <span className="sr-only">{up ? "Up" : "Down"}</span>
                  {Math.abs(metric.change)}%
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {metrics.map((metric) => {
          const config = {
            [metric.value]: { label: metric.label, color: metric.color },
          } satisfies ChartConfig;
          const data = days.map((day, index) => ({
            day,
            [metric.value]: metric.series[index],
          }));
          return (
            <TabsContent
              key={metric.value}
              value={metric.value}
              className="p-4 pt-5"
            >
              <ChartContainer
                config={config}
                className="aspect-auto h-44 w-full"
                aria-label={`${metric.label} per day, last 7 days`}
              >
                <AreaChart data={data} margin={{ left: 16, right: 16 }}>
                  <defs>
                    <linearGradient
                      id={`tabs-13-fill-${metric.value}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={`var(--color-${metric.value})`}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={`var(--color-${metric.value})`}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={0}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey={metric.value}
                    type="monotone"
                    stroke={`var(--color-${metric.value})`}
                    strokeWidth={2}
                    fill={`url(#tabs-13-fill-${metric.value})`}
                  />
                </AreaChart>
              </ChartContainer>
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}
