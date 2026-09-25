"use client";

import * as React from "react";
import {
  CartesianGrid,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

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
import { Tabs, TabsList, TabsTrigger } from "@/registry/base/ui/tabs";

type Segment = "all" | "teams" | "solo";

type Feature = {
  name: string;
  // Share of active accounts that used the feature in the last 30 days.
  adoption: number;
  // 90-day retention of accounts that used it.
  retention: number;
  // Weekly events, used for dot size.
  events: number;
};

const features: Record<Segment, Feature[]> = {
  all: [
    { name: "Shared inbox", adoption: 72, retention: 88, events: 41_200 },
    { name: "Saved replies", adoption: 58, retention: 81, events: 18_900 },
    { name: "Automations", adoption: 21, retention: 93, events: 12_400 },
    { name: "SLA timers", adoption: 17, retention: 90, events: 6_300 },
    { name: "CSAT surveys", adoption: 44, retention: 69, events: 9_800 },
    { name: "Mobile app", adoption: 63, retention: 62, events: 22_100 },
    { name: "Custom fields", adoption: 12, retention: 71, events: 2_900 },
  ],
  teams: [
    { name: "Shared inbox", adoption: 91, retention: 90, events: 36_700 },
    { name: "Saved replies", adoption: 66, retention: 84, events: 14_200 },
    { name: "Automations", adoption: 34, retention: 95, events: 11_600 },
    { name: "SLA timers", adoption: 29, retention: 92, events: 5_900 },
    { name: "CSAT surveys", adoption: 52, retention: 73, events: 8_100 },
    { name: "Mobile app", adoption: 48, retention: 70, events: 12_300 },
    { name: "Custom fields", adoption: 19, retention: 76, events: 2_400 },
  ],
  solo: [
    { name: "Shared inbox", adoption: 38, retention: 74, events: 4_500 },
    { name: "Saved replies", adoption: 43, retention: 72, events: 4_700 },
    { name: "Automations", adoption: 8, retention: 86, events: 800 },
    { name: "SLA timers", adoption: 4, retention: 70, events: 400 },
    { name: "CSAT surveys", adoption: 27, retention: 58, events: 1_700 },
    { name: "Mobile app", adoption: 81, retention: 55, events: 9_800 },
    { name: "Custom fields", adoption: 6, retention: 61, events: 500 },
  ],
};

const segments: { value: Segment; label: string }[] = [
  { value: "all", label: "All accounts" },
  { value: "teams", label: "Teams" },
  { value: "solo", label: "Solo" },
];

const chartConfig = {
  retention: { label: "90-day retention", color: "var(--chart-1)" },
  hidden: { label: "Hidden gem", color: "var(--chart-2)" },
} satisfies ChartConfig;

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export default function Chart12() {
  const [segment, setSegment] = React.useState<Segment>("all");
  const points = features[segment];

  const adoptionMid = median(points.map((point) => point.adoption));
  const retentionMid = median(points.map((point) => point.retention));

  // High retention but low adoption: worth promoting in onboarding.
  const hiddenGems = points.filter(
    (point) => point.adoption < adoptionMid && point.retention > retentionMid,
  );
  const others = points.filter((point) => !hiddenGems.includes(point));

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Feature adoption vs. retention</CardTitle>
        <CardDescription>
          Help desk features, last 30 days. Dot size is weekly usage.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Tabs
          value={segment}
          onValueChange={(value) => setSegment(value as Segment)}
        >
          <TabsList className="w-full">
            {segments.map((item) => (
              <TabsTrigger key={item.value} value={item.value} className="flex-1">
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <ChartContainer
          config={chartConfig}
          role="img"
          aria-label={`Adoption against 90-day retention for ${points.length} features. Hidden gems: ${hiddenGems.map((point) => point.name).join(", ") || "none"}.`}
          className="aspect-auto h-64 w-full"
        >
          <ScatterChart margin={{ left: 0, right: 12, top: 12, bottom: 4 }}>
            <CartesianGrid />
            <XAxis
              type="number"
              dataKey="adoption"
              name="Adoption"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(value: number) => `${value}%`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              type="number"
              dataKey="retention"
              name="Retention"
              domain={[50, 100]}
              ticks={[50, 60, 70, 80, 90, 100]}
              tickFormatter={(value: number) => `${value}%`}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <ZAxis type="number" dataKey="events" range={[60, 480]} />
            <ReferenceLine
              x={adoptionMid}
              stroke="var(--border)"
              strokeDasharray="4 4"
            />
            <ReferenceLine
              y={retentionMid}
              stroke="var(--border)"
              strokeDasharray="4 4"
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideIndicator
                  hideLabel
                  formatter={(_value, _name, item, index) => {
                    // Scatter sends x, y and z as three rows; render one card for the point.
                    if (index > 0) return null;
                    const point = item.payload as Feature;
                    return (
                      <div className="grid w-full gap-1">
                        <span className="font-medium">{point.name}</span>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Adoption</span>
                          <span className="font-mono tabular-nums">
                            {point.adoption}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            Retention
                          </span>
                          <span className="font-mono tabular-nums">
                            {point.retention}%
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
              }
            />
            <Scatter
              data={others}
              fill="var(--color-retention)"
              fillOpacity={0.55}
              isAnimationActive={false}
            />
            <Scatter
              data={hiddenGems}
              fill="var(--color-hidden)"
              stroke="var(--foreground)"
              strokeWidth={1}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ChartContainer>

        <div className="flex flex-col gap-1 border-t pt-4 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full border border-foreground bg-chart-2"
            />
            Hidden gems
          </p>
          <p className="text-muted-foreground">
            {hiddenGems.length
              ? `${hiddenGems.map((point) => point.name).join(", ")} keep accounts around but few find them. Surface them in onboarding.`
              : "No feature pairs low adoption with high retention in this segment."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
