"use client";

import * as React from "react";
import { ZapIcon } from "lucide-react";
import { Bar, BarChart, Brush, CartesianGrid, XAxis, YAxis } from "recharts";

import { Button } from "@/registry/base/ui/button";
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

const RATE_PER_KWH = 0.31;

// Deterministic sample: 60 days of household electricity use ending Sep 24,
// heavier on weekends and during an early-September heat wave.
const usage = Array.from({ length: 60 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 8, 24 - (59 - index)));
  const weekday = date.getUTCDay();
  const weekend = weekday === 0 || weekday === 6 ? 3.4 : 0;
  const heatWave = index >= 30 && index <= 38 ? 6.5 : 0;
  const base = 14 + Math.sin(index / 5) * 2.2;
  return {
    date: date.toISOString().slice(0, 10),
    kwh: Math.round((base + weekend + heatWave) * 10) / 10,
  };
});

const chartConfig = {
  kwh: { label: "Usage (kWh)", color: "var(--chart-4)" },
} satisfies ChartConfig;

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const formatDate = (value: unknown) =>
  typeof value === "string" ? shortDate.format(new Date(value)) : "";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const defaultWindow = { startIndex: 46, endIndex: 59 };

export default function Chart09() {
  const [range, setRange] = React.useState(defaultWindow);

  const selected = usage.slice(range.startIndex, range.endIndex + 1);
  const total = selected.reduce((sum, day) => sum + day.kwh, 0);
  const peak = selected.reduce((max, day) => (day.kwh > max.kwh ? day : max));
  const isDefault =
    range.startIndex === defaultWindow.startIndex &&
    range.endIndex === defaultWindow.endIndex;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Electricity use</CardTitle>
        <CardDescription>
          Drag the handles below the chart to pick a date range.
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDefault}
            onClick={() => setRange(defaultWindow)}
          >
            Last 14 days
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl
          aria-live="polite"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-sm [&_dd]:font-medium [&_dd]:tabular-nums [&_dt]:text-xs [&_dt]:text-muted-foreground"
        >
          <div className="flex flex-col gap-0.5">
            <dt>
              {formatDate(selected[0].date)} –{" "}
              {formatDate(selected[selected.length - 1].date)}
            </dt>
            <dd>{total.toFixed(0)} kWh</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt>Estimated cost</dt>
            <dd>{usd.format(total * RATE_PER_KWH)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt>Peak day</dt>
            <dd className="flex items-center gap-1">
              <ZapIcon aria-hidden="true" className="size-3.5 text-chart-4" />
              {formatDate(peak.date)}
            </dd>
          </div>
        </dl>
        <ChartContainer
          config={chartConfig}
          role="img"
          aria-label={`Daily electricity use from ${formatDate(selected[0].date)} to ${formatDate(selected[selected.length - 1].date)}: ${total.toFixed(0)} kilowatt-hours in total`}
          className="aspect-auto h-64 w-full [&_.recharts-brush-texts_text]:fill-muted-foreground"
        >
          <BarChart data={usage} margin={{ left: 0, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={formatDate}
            />
            <YAxis
              width={32}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) =>
                    formatDate(payload?.[0]?.payload?.date)
                  }
                />
              }
            />
            <Bar dataKey="kwh" fill="var(--color-kwh)" radius={[3, 3, 0, 0]} />
            <Brush
              dataKey="date"
              height={28}
              travellerWidth={8}
              startIndex={range.startIndex}
              endIndex={range.endIndex}
              onChange={(next) => {
                if (
                  typeof next.startIndex === "number" &&
                  typeof next.endIndex === "number"
                ) {
                  setRange({
                    startIndex: next.startIndex,
                    endIndex: next.endIndex,
                  });
                }
              }}
              tickFormatter={formatDate}
              ariaLabel="Date range"
              fill="var(--muted)"
              stroke="var(--muted-foreground)"
            />
          </BarChart>
        </ChartContainer>
        <p className="text-xs text-muted-foreground">
          Billed at {usd.format(RATE_PER_KWH)} per kWh on the Standard
          residential plan.
        </p>
      </CardContent>
    </Card>
  );
}
