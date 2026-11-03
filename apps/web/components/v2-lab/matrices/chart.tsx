"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/base/ui/chart";
import { LabSection } from "../lab-frame";

const DATA = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

const CONFIG = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

const PAYLOAD = [
  {
    dataKey: "desktop",
    name: "desktop",
    value: 186,
    color: "var(--color-desktop)",
    payload: DATA[0],
    graphicalItemId: "bar-desktop",
  },
  {
    dataKey: "mobile",
    name: "mobile",
    value: 80,
    color: "var(--color-mobile)",
    payload: DATA[0],
    graphicalItemId: "bar-mobile",
  },
];

export default function ChartMatrix() {
  return (
    <div>
      <LabSection title="bar chart with grid, axes and legend (hover for tooltip)">
        <ChartContainer config={CONFIG} className="h-48 w-full max-w-md">
          <BarChart data={DATA} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </LabSection>
      <LabSection title="line chart with visible axis lines">
        <ChartContainer config={CONFIG} className="h-48 w-full max-w-md">
          <LineChart data={DATA}>
            <CartesianGrid />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Line dataKey="desktop" stroke="var(--color-desktop)" dot={false} />
            <Line dataKey="mobile" stroke="var(--color-mobile)" dot={false} />
          </LineChart>
        </ChartContainer>
      </LabSection>
      <LabSection title="tooltip content (static): dot / line / dashed / hideLabel">
        {(["dot", "line", "dashed"] as const).map((indicator) => (
          <ChartContainer key={indicator} config={CONFIG} className="aspect-auto h-auto">
            <ChartTooltipContent active payload={PAYLOAD} label="Jan" indicator={indicator} />
          </ChartContainer>
        ))}
        <ChartContainer config={CONFIG} className="aspect-auto h-auto">
          <ChartTooltipContent active payload={PAYLOAD} label="Jan" hideLabel />
        </ChartContainer>
      </LabSection>
    </div>
  );
}
