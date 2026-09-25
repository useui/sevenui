"use client";

import { BellRing } from "lucide-react";
import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/registry/base/ui/chart";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Range = "3m" | "6m" | "1y";

const history = [
  { date: "Oct 2", price: 349 },
  { date: "Nov 1", price: 349 },
  { date: "Nov 24", price: 279 },
  { date: "Dec 2", price: 329 },
  { date: "Jan 6", price: 329 },
  { date: "Feb 3", price: 319 },
  { date: "Mar 10", price: 319 },
  { date: "Apr 7", price: 299 },
  { date: "May 5", price: 309 },
  { date: "Jun 2", price: 309 },
  { date: "Jul 8", price: 269 },
  { date: "Jul 15", price: 299 },
  { date: "Aug 4", price: 299 },
  { date: "Sep 1", price: 289 },
  { date: "Sep 22", price: 289 },
];

const rangeStart: Record<Range, number> = { "3m": 10, "6m": 6, "1y": 0 };

const ALERT_PRICE = 275;

const chartConfig = {
  price: { label: "Price", color: "var(--chart-1)" },
} satisfies ChartConfig;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Chart11() {
  const [range, setRange] = React.useState<Range>("1y");
  const [alertOn, setAlertOn] = React.useState(false);

  const data = history.slice(rangeStart[range]);
  const current = data[data.length - 1];
  const lowest = data.reduce((min, point) =>
    point.price < min.price ? point : min,
  );
  const average = Math.round(
    data.reduce((sum, point) => sum + point.price, 0) / data.length,
  );

  return (
    <section
      aria-labelledby="chart-11-title"
      className="flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground"
    >
      <div className="flex gap-3">
        <img
          src="/placeholder.svg"
          alt=""
          className="size-14 shrink-0 rounded-lg border bg-muted object-cover"
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 id="chart-11-title" className="truncate font-medium text-sm">
            Arden Noise-Cancelling Headphones
          </h3>
          <p className="text-xs text-muted-foreground">Price history</p>
          <p className="flex items-baseline gap-2">
            <span className="font-semibold text-lg tabular-nums">
              {usd.format(current.price)}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              avg {usd.format(average)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Lowest:{" "}
          <span className="font-medium text-foreground tabular-nums">
            {usd.format(lowest.price)}
          </span>{" "}
          on {lowest.date}
        </p>
        <ToggleGroup
          aria-label="Time range"
          size="sm"
          variant="outline"
          spacing={0}
          value={[range]}
          onValueChange={(value) => {
            const next = value[0] as Range | undefined;
            if (next) setRange(next);
          }}
        >
          <ToggleGroupItem value="3m">3M</ToggleGroupItem>
          <ToggleGroupItem value="6m">6M</ToggleGroupItem>
          <ToggleGroupItem value="1y">1Y</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-40 w-full"
        role="img"
        aria-label={`Price history: now ${usd.format(current.price)}, lowest ${usd.format(lowest.price)} on ${lowest.date}`}
      >
        <LineChart data={data} margin={{ left: 0, right: 12, top: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={28}
          />
          <YAxis
            width={40}
            tickLine={false}
            axisLine={false}
            domain={[250, 360]}
            tickFormatter={(value: number) => `$${value}`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="line"
                formatter={(value) => (
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-mono font-medium tabular-nums">
                      {usd.format(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          {alertOn ? (
            <ReferenceLine
              y={ALERT_PRICE}
              stroke="var(--color-price)"
              strokeDasharray="3 3"
              label={{
                value: `Alert ${usd.format(ALERT_PRICE)}`,
                position: "insideBottomRight",
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
          ) : null}
          <Line
            dataKey="price"
            type="stepAfter"
            stroke="var(--color-price)"
            strokeWidth={2}
            dot={false}
          />
          <ReferenceDot
            x={lowest.date}
            y={lowest.price}
            r={4}
            fill="var(--color-price)"
            stroke="var(--background)"
            strokeWidth={2}
          />
        </LineChart>
      </ChartContainer>

      <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2.5">
        <div className="flex items-start gap-2.5">
          <BellRing
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="chart-11-alert">
              Email me under {usd.format(ALERT_PRICE)}
            </Label>
            <span className="text-xs text-muted-foreground">
              {alertOn
                ? "We will check the price every 6 hours."
                : "Close to the lowest price of the past year."}
            </span>
          </div>
        </div>
        <Switch
          id="chart-11-alert"
          checked={alertOn}
          onCheckedChange={setAlertOn}
        />
      </div>
    </section>
  );
}
