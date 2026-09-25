"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/base/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const revenue = [
  { month: "Apr", starter: 4200, pro: 11800, enterprise: 21500 },
  { month: "May", starter: 4650, pro: 12900, enterprise: 22100 },
  { month: "Jun", starter: 4410, pro: 14200, enterprise: 24800 },
  { month: "Jul", starter: 5120, pro: 15100, enterprise: 24300 },
  { month: "Aug", starter: 5480, pro: 16750, enterprise: 27600 },
  { month: "Sep", starter: 5930, pro: 18200, enterprise: 29900 },
];

const chartConfig = {
  starter: { label: "Starter", color: "var(--chart-1)" },
  pro: { label: "Pro", color: "var(--chart-2)" },
  enterprise: { label: "Enterprise", color: "var(--chart-3)" },
} satisfies ChartConfig;

type Plan = keyof typeof chartConfig;

const plans = Object.keys(chartConfig) as Plan[];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Chart07() {
  // Controlled legend: the pressed toggles decide which series are drawn.
  const [visible, setVisible] = React.useState<Plan[]>(["starter", "pro"]);

  const latest = revenue[revenue.length - 1];
  const total = visible.reduce((sum, plan) => sum + latest[plan], 0);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Monthly recurring revenue</CardTitle>
        <CardDescription>
          September:{" "}
          <span className="font-medium text-foreground tabular-nums">
            {currency.format(total)}
          </span>{" "}
          across {visible.length} {visible.length === 1 ? "plan" : "plans"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ToggleGroup
          multiple
          aria-label="Plans shown in chart"
          variant="outline"
          size="sm"
          value={visible}
          onValueChange={(next) => {
            // Keep at least one series on screen.
            if (next.length > 0) setVisible(next as Plan[]);
          }}
          className="flex-wrap"
        >
          {plans.map((plan) => (
            <ToggleGroupItem
              key={plan}
              value={plan}
              className="gap-2 text-xs text-muted-foreground aria-pressed:text-foreground"
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-[2px] opacity-30 transition-opacity in-aria-pressed:opacity-100"
                style={{ backgroundColor: chartConfig[plan].color }}
              />
              {chartConfig[plan].label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ChartContainer
          config={chartConfig}
          role="img"
          aria-label="Monthly recurring revenue by plan, April to September"
          className="aspect-auto h-52 w-full"
        >
          <AreaChart data={revenue} margin={{ left: 16, right: 16, top: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {plans
              .filter((plan) => visible.includes(plan))
              .map((plan) => (
                <Area
                  key={plan}
                  dataKey={plan}
                  type="monotone"
                  stackId="mrr"
                  fill={`var(--color-${plan})`}
                  fillOpacity={0.25}
                  stroke={`var(--color-${plan})`}
                  strokeWidth={2}
                />
              ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
