"use client";

import { BellRing, CircleCheck, TriangleAlert } from "lucide-react";
import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/registry/base/ui/chart";

const PLAN_LIMIT = 1_000_000;
const SCALE_LIMIT = 5_000_000;
// Threshold for the optional usage alert email.
const ALERT_AT = 900_000;

// Cumulative API requests for the Sep 1 - Sep 30 billing cycle.
// Actual usage runs through Sep 18, then a straight-line projection.
const usageData = [
  { day: "Sep 1", actual: 21_400 },
  { day: "Sep 3", actual: 78_900 },
  { day: "Sep 5", actual: 142_300 },
  { day: "Sep 7", actual: 188_100 },
  { day: "Sep 9", actual: 262_700 },
  { day: "Sep 11", actual: 341_500 },
  { day: "Sep 13", actual: 409_800 },
  { day: "Sep 15", actual: 478_200 },
  { day: "Sep 17", actual: 561_900 },
  { day: "Sep 18", actual: 604_300, projected: 604_300 },
  { day: "Sep 21", projected: 718_000 },
  { day: "Sep 24", projected: 831_700 },
  { day: "Sep 27", projected: 945_400 },
  { day: "Sep 30", projected: 1_059_100 },
];

const chartConfig = {
  actual: { label: "Requests", color: "var(--chart-1)" },
  projected: { label: "Projected", color: "var(--chart-1)" },
} satisfies ChartConfig;

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export default function Chart10() {
  const used = 604_300;
  const projected = 1_059_100;
  const overage = projected - PLAN_LIMIT;
  const [alertOn, setAlertOn] = React.useState(false);
  const [upgraded, setUpgraded] = React.useState(false);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>API requests</CardTitle>
        <CardDescription>
          Billing cycle Sep 1 – Sep 30 · {upgraded ? "Scale" : "Growth"} plan
        </CardDescription>
        <CardAction>
          <Badge variant="outline">12 days left</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold text-2xl tabular-nums">
            {used.toLocaleString("en-US")}
          </span>
          <span className="text-sm text-muted-foreground">
            of {(upgraded ? SCALE_LIMIT : PLAN_LIMIT).toLocaleString("en-US")}{" "}
            included
          </span>
        </div>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-48 w-full"
          role="img"
          aria-label={`Cumulative API requests: ${used.toLocaleString("en-US")} used so far, projected ${projected.toLocaleString("en-US")} by Sep 30 against a ${PLAN_LIMIT.toLocaleString("en-US")} limit`}
        >
          <AreaChart data={usageData} margin={{ left: 0, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="chart-10-fill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-actual)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-actual)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis
              width={40}
              tickLine={false}
              axisLine={false}
              domain={[0, 1_100_000]}
              ticks={[0, 250_000, 500_000, 750_000, 1_000_000]}
              tickFormatter={(value: number) => compact.format(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label}
                      </span>
                      <span className="font-mono font-medium tabular-nums">
                        {Number(value).toLocaleString("en-US")}
                      </span>
                    </div>
                  )}
                />
              }
            />
            {upgraded ? null : (
              <ReferenceLine
                y={PLAN_LIMIT}
                stroke="var(--destructive)"
                strokeDasharray="4 4"
                label={{
                  value: "Plan limit",
                  position: "insideTopLeft",
                  fill: "var(--destructive)",
                  fontSize: 11,
                }}
              />
            )}
            {alertOn ? (
              <ReferenceLine
                y={ALERT_AT}
                stroke="var(--muted-foreground)"
                strokeDasharray="2 3"
                label={{
                  value: `Alert at ${compact.format(ALERT_AT)}`,
                  position: "insideTopRight",
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                }}
              />
            ) : null}
            <Area
              dataKey="actual"
              type="monotone"
              stroke="var(--color-actual)"
              strokeWidth={2}
              fill="url(#chart-10-fill)"
              connectNulls={false}
            />
            <Area
              dataKey="projected"
              type="linear"
              stroke="var(--color-projected)"
              strokeWidth={2}
              strokeDasharray="5 4"
              fill="none"
              connectNulls={false}
            />
          </AreaChart>
        </ChartContainer>
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-lg bg-muted px-3 py-2.5 text-sm"
        >
          {upgraded ? (
            <>
              <CircleCheck
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-success"
              />
              <p className="text-muted-foreground">
                You are on Scale now. The projected {compact.format(projected)}{" "}
                requests fit inside the{" "}
                <span className="font-medium text-foreground">
                  {compact.format(SCALE_LIMIT)}
                </span>{" "}
                included, so there is no overage this cycle.
              </p>
            </>
          ) : (
            <>
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p className="text-muted-foreground">
                At this pace you will pass your limit around{" "}
                <span className="font-medium text-foreground">Sep 29</span>. The
                extra {compact.format(overage)} requests would cost{" "}
                <span className="font-medium text-foreground tabular-nums">
                  $29.55
                </span>{" "}
                at $0.50 per 1K.
              </p>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-wrap justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={alertOn}
          onClick={() => setAlertOn((on) => !on)}
        >
          {alertOn ? (
            <BellRing aria-hidden="true" data-icon="inline-start" />
          ) : null}
          {alertOn
            ? `Alert set at ${compact.format(ALERT_AT)}`
            : "Set a usage alert"}
        </Button>
        {upgraded ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUpgraded(false)}
          >
            Stay on Growth
          </Button>
        ) : (
          <Button size="sm" onClick={() => setUpgraded(true)}>
            Upgrade to Scale
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
