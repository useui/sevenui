"use client";

import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/base/ui/chart";
// recharts is a registry dependency, not a web one: the live charts come from
// the registry demos, which resolve it from packages/registry.
import ChartDemo from "@/demos/chart/chart-demo";
import ChartLine from "@/demos/chart/chart-line";
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
      <LabSection title="bar chart demo with grid, axis and legend (hover for tooltip)">
        <ChartDemo />
      </LabSection>
      <LabSection title="line chart demo">
        <ChartLine />
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
