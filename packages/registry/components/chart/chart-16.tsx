"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  type BarShapeProps,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  type ChartConfig,
  ChartContainer,
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

type CampaignKey = "autumn-launch" | "win-back" | "webinar-invite";

const stages = ["Delivered", "Opened", "Clicked", "Converted"] as const;

// Share of delivered emails that reached each stage, in percent.
const workspaceAverage = [100, 38, 6.2, 1.4];

const campaigns: Record<
  CampaignKey,
  { label: string; sentOn: string; counts: number[] }
> = {
  "autumn-launch": {
    label: "Autumn collection launch",
    sentOn: "Sep 9",
    counts: [48_210, 21_694, 4_146, 1_012],
  },
  "win-back": {
    label: "Win-back: 90 days inactive",
    sentOn: "Sep 2",
    counts: [12_870, 3_218, 541, 88],
  },
  "webinar-invite": {
    label: "Webinar invite: pricing 101",
    sentOn: "Aug 27",
    counts: [9_402, 4_137, 1_128, 302],
  },
};

const dropAdvice: Record<string, string> = {
  Opened: "Test a stronger subject line and preview text.",
  Clicked: "Test a clearer call to action above the fold.",
  Converted: "Check that the landing page matches the email offer.",
};

const campaignItems = Object.entries(campaigns).map(([value, campaign]) => ({
  value,
  label: campaign.label,
}));

const chartConfig = {
  rate: { label: "This campaign", color: "var(--chart-1)" },
  average: { label: "Workspace average", color: "var(--foreground)" },
} satisfies ChartConfig;

// The workspace average is drawn as a thin marker at the end of its bar, on
// top of the campaign bar, so it stays visible whichever one is longer.
function AverageMarker({ x, y, width, height }: BarShapeProps) {
  return (
    <rect
      x={Number(x) + Number(width) - 1.5}
      y={Number(y) - 3}
      width={3}
      height={Number(height) + 6}
      rx={1.5}
      className="fill-(--color-average)"
    />
  );
}

function percent(value: number) {
  return `${value < 10 ? value.toFixed(1) : Math.round(value)}%`;
}

export default function Chart16() {
  const [key, setKey] = React.useState<CampaignKey>("autumn-launch");
  const campaign = campaigns[key];
  const delivered = campaign.counts[0];

  const data = stages.map((stage, index) => ({
    stage,
    count: campaign.counts[index],
    rate: (campaign.counts[index] / delivered) * 100,
    average: workspaceAverage[index],
  }));

  const biggestDrop = data.slice(1).reduce(
    (worst, point, index) => {
      const previous = data[index];
      const kept = point.count / previous.count;
      return kept < worst.kept
        ? { from: previous.stage, to: point.stage, kept }
        : worst;
    },
    { from: "", to: "", kept: 1 },
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Campaign funnel</CardTitle>
        <CardDescription>
          Sent {campaign.sentOn} · {delivered.toLocaleString("en-US")} delivered
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Select
          items={campaignItems}
          value={key}
          onValueChange={(value) => setKey(value as CampaignKey)}
        >
          <SelectTrigger aria-label="Campaign" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {campaignItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-52 w-full"
          role="img"
          aria-label={`Funnel for ${campaign.label}: ${data
            .map(
              (point) =>
                `${point.stage} ${percent(point.rate)} versus ${percent(point.average)} average`,
            )
            .join("; ")}`}
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 48 }}
            barSize={22}
            barGap={-22}
          >
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis
              type="category"
              dataKey="stage"
              width={72}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, name, item) => (
                    <div className="flex w-full items-center gap-2">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label}
                      </span>
                      <span className="ml-auto font-mono font-medium tabular-nums">
                        {percent(Number(value))}
                        {name === "rate"
                          ? ` · ${item.payload?.count.toLocaleString("en-US")}`
                          : ""}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="rate" fill="var(--color-rate)" radius={4}>
              <LabelList
                dataKey="rate"
                position="right"
                offset={8}
                className="fill-foreground font-medium tabular-nums"
                fontSize={12}
                formatter={(value) => percent(Number(value))}
              />
            </Bar>
            <Bar
              dataKey="average"
              fill="var(--color-average)"
              shape={AverageMarker}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2 rounded-[2px] bg-chart-1"
            />
            This campaign
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-3 w-0.75 rounded-full bg-foreground"
            />
            Workspace average
          </span>
        </div>

        <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
          Biggest drop:{" "}
          <span className="font-medium text-foreground">
            {biggestDrop.from} to {biggestDrop.to}
          </span>
          , only {percent(biggestDrop.kept * 100)} continued.{" "}
          {dropAdvice[biggestDrop.to]}
        </p>
      </CardContent>
    </Card>
  );
}
