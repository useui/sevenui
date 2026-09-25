"use client";

import * as React from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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

const traits = [
  "Battery",
  "Speed",
  "Display",
  "Portability",
  "Ports",
  "Value",
] as const;

// Editorial review scores out of 10, in the same order as `traits`.
const laptops = {
  "orbit-14": { label: "Orbit 14", price: "$1,299", scores: [9, 7, 8, 9, 5, 7] },
  "vantage-16": {
    label: "Vantage 16 Pro",
    price: "$2,149",
    scores: [6, 10, 9, 4, 9, 5],
  },
  "slate-13": { label: "Slate 13 Air", price: "$999", scores: [8, 5, 7, 10, 3, 9] },
};

type LaptopKey = keyof typeof laptops;

const baseline: LaptopKey = "orbit-14";

const rivals = (Object.keys(laptops) as LaptopKey[])
  .filter((key) => key !== baseline)
  .map((key) => ({ value: key, label: laptops[key].label }));

export default function Chart03() {
  const [rival, setRival] = React.useState<LaptopKey>("vantage-16");

  const chartConfig = {
    current: { label: laptops[baseline].label, color: "var(--chart-1)" },
    rival: { label: laptops[rival].label, color: "var(--chart-2)" },
  } satisfies ChartConfig;

  const data = traits.map((trait, index) => ({
    trait,
    current: laptops[baseline].scores[index],
    rival: laptops[rival].scores[index],
  }));

  const wins = data.filter((row) => row.current > row.rival).length;
  const losses = data.filter((row) => row.current < row.rival).length;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Compare laptops</CardTitle>
        <CardDescription>
          {laptops[baseline].label} ({laptops[baseline].price}) scores higher
          in {wins} of {traits.length} areas and lower in {losses}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Select
          items={rivals}
          value={rival}
          onValueChange={(value) => {
            if (value) setRival(value as LaptopKey);
          }}
        >
          <SelectTrigger aria-label="Compare with" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {rivals.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label} · {laptops[item.value].price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ChartContainer
          config={chartConfig}
          role="img"
          aria-label={`Review scores out of 10. ${data
            .map(
              (row) =>
                `${row.trait}: ${laptops[baseline].label} ${row.current}, ${laptops[rival].label} ${row.rival}`,
            )
            .join("; ")}`}
          className="mx-auto aspect-square w-full max-w-72"
        >
          <RadarChart data={data} outerRadius="72%">
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarGrid />
            <PolarAngleAxis
              dataKey="trait"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <Radar
              dataKey="rival"
              fill="var(--color-rival)"
              fillOpacity={0.15}
              stroke="var(--color-rival)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <Radar
              dataKey="current"
              fill="var(--color-current)"
              fillOpacity={0.3}
              stroke="var(--color-current)"
              strokeWidth={2}
              dot={{ r: 3, fillOpacity: 1 }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
