"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector, type PieSectorShapeProps } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/base/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const sources = [
  { source: "organic", visitors: 5820, fill: "var(--color-organic)" },
  { source: "direct", visitors: 3140, fill: "var(--color-direct)" },
  { source: "referral", visitors: 1960, fill: "var(--color-referral)" },
  { source: "social", visitors: 1285, fill: "var(--color-social)" },
  { source: "email", visitors: 740, fill: "var(--color-email)" },
];

const chartConfig = {
  visitors: { label: "Visitors" },
  organic: { label: "Organic search", color: "var(--chart-1)" },
  direct: { label: "Direct", color: "var(--chart-2)" },
  referral: { label: "Referral", color: "var(--chart-3)" },
  social: { label: "Social", color: "var(--chart-4)" },
  email: { label: "Email", color: "var(--chart-5)" },
} satisfies ChartConfig;

type Source = (typeof sources)[number]["source"];

const items = sources.map((item) => ({
  value: item.source,
  label: String(chartConfig[item.source as keyof typeof chartConfig].label),
}));

const total = sources.reduce((sum, item) => sum + item.visitors, 0);

export default function Chart08() {
  const [active, setActive] = React.useState<Source>("organic");
  const activeItem = sources.find((item) => item.source === active) ?? sources[0];
  const share = Math.round((activeItem.visitors / total) * 100);

  // The selected sector grows outward; the others step back.
  const renderSector = React.useCallback(
    (props: PieSectorShapeProps) => {
      const isSelected = props.payload?.source === active;
      return (
        <Sector
          {...props}
          outerRadius={(props.outerRadius ?? 0) + (isSelected ? 8 : 0)}
          fillOpacity={isSelected ? 1 : 0.35}
        />
      );
    },
    [active],
  );

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between gap-3">
        <span id="chart-08-title" className="text-sm font-medium">
          Traffic sources
        </span>
        <Select
          items={items}
          value={active}
          onValueChange={(value) => {
            if (value) setActive(value as Source);
          }}
        >
          <SelectTrigger aria-label="Highlighted source" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ChartContainer
        config={chartConfig}
        role="img"
        aria-labelledby="chart-08-title"
        className="aspect-square w-full max-w-60"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent nameKey="source" hideLabel />}
          />
          <Pie
            data={sources}
            dataKey="visitors"
            nameKey="source"
            innerRadius="58%"
            outerRadius="82%"
            strokeWidth={4}
            stroke="var(--background)"
            shape={renderSector}
            isAnimationActive={false}
          >
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                  return null;
                }
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-semibold tabular-nums"
                    >
                      {share}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 22}
                      className="fill-muted-foreground text-xs"
                    >
                      {activeItem.visitors.toLocaleString()} visitors
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <p className="text-center text-xs text-muted-foreground">
        {total.toLocaleString()} visitors in the last 30 days
      </p>
    </div>
  );
}
