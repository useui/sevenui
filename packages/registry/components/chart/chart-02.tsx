"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
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

const signups = [
  { week: "Aug 4", signups: 412 },
  { week: "Aug 11", signups: 468 },
  { week: "Aug 18", signups: 431 },
  { week: "Aug 25", signups: 527 },
  { week: "Sep 1", signups: 590 },
  { week: "Sep 8", signups: 562 },
  { week: "Sep 15", signups: 648 },
];

const chartConfig = {
  signups: { label: "Signups", color: "var(--chart-2)" },
} satisfies ChartConfig;

type FillStyle = "solid" | "subtle" | "outline";

// Each style only changes the area's paint; the data and axes stay identical.
const fillStyles: Record<
  FillStyle,
  { label: string; fillOpacity: number; strokeWidth: number; dash?: string }
> = {
  solid: { label: "Solid", fillOpacity: 0.85, strokeWidth: 0 },
  subtle: { label: "Subtle", fillOpacity: 0.2, strokeWidth: 2 },
  outline: { label: "Outline", fillOpacity: 0, strokeWidth: 2 },
};

export default function Chart02() {
  const [style, setStyle] = React.useState<FillStyle>("subtle");
  const paint = fillStyles[style];

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="max-sm:grid-cols-1!">
        <CardTitle>Weekly signups</CardTitle>
        <CardDescription>New workspaces created, last 7 weeks</CardDescription>
        <CardAction className="max-sm:col-start-1 max-sm:row-span-1 max-sm:row-start-3 max-sm:mt-2 max-sm:justify-self-start">
          <ToggleGroup
            aria-label="Fill style"
            variant="outline"
            size="sm"
            spacing={0}
            value={[style]}
            onValueChange={(next) => {
              if (next.length > 0) setStyle(next[0] as FillStyle);
            }}
          >
            {(Object.keys(fillStyles) as FillStyle[]).map((key) => (
              <ToggleGroupItem key={key} value={key} className="px-2 text-xs">
                {fillStyles[key].label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          role="img"
          aria-label="Weekly signups from Aug 4 to Sep 15, rising from 412 to 648"
          className="aspect-auto h-48 w-full"
        >
          <AreaChart data={signups} margin={{ left: 8, right: 8, top: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="signups"
              type="monotone"
              fill="var(--color-signups)"
              fillOpacity={paint.fillOpacity}
              stroke="var(--color-signups)"
              strokeWidth={paint.strokeWidth}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
