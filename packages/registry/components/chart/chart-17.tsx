"use client";

import { CircleCheck } from "lucide-react";
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
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
import { Label } from "@/registry/base/ui/label";
import { Progress, ProgressLabel } from "@/registry/base/ui/progress";
import { Slider } from "@/registry/base/ui/slider";

// Dining and groceries spend imported from the linked checking account.
const spending = [
  { month: "Apr", amount: 612 },
  { month: "May", amount: 748 },
  { month: "Jun", amount: 695 },
  { month: "Jul", amount: 884 },
  { month: "Aug", amount: 657 },
  { month: "Sep", amount: 721 },
];

const MIN_BUDGET = 400;
const MAX_BUDGET = 1000;
const STEP = 25;

const chartConfig = {
  amount: { label: "Spent", color: "var(--chart-2)" },
  over: { label: "Over budget", color: "var(--warning)" },
} satisfies ChartConfig;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const average = Math.round(
  spending.reduce((sum, item) => sum + item.amount, 0) / spending.length,
);

export default function Chart17() {
  const [budget, setBudget] = React.useState(650);
  // Step 4 is the confirmation: either a saved budget or a skipped step.
  const [outcome, setOutcome] = React.useState<"saved" | "skipped" | null>(
    null,
  );

  const overMonths = spending.filter((item) => item.amount > budget);
  const yearlyGap = (average - budget) * 12;

  let verdict: string;
  if (overMonths.length === 0) {
    verdict = "Comfortable. You stayed under this every month.";
  } else if (overMonths.length <= 2) {
    verdict = `Realistic. You went over in ${overMonths.map((item) => item.month).join(" and ")}.`;
  } else {
    verdict = `Ambitious. You went over in ${overMonths.length} of the last 6 months.`;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="gap-3">
        <Progress value={outcome ? 100 : 75} className="gap-1.5">
          <ProgressLabel className="font-normal text-xs text-muted-foreground">
            Step {outcome ? 4 : 3} of 4
          </ProgressLabel>
        </Progress>
        <div className="flex flex-col gap-1">
          <CardTitle>
            {outcome === "saved"
              ? "Food budget saved"
              : outcome === "skipped"
                ? "Food budget skipped"
                : "Set a food budget"}
          </CardTitle>
          <CardDescription>
            {outcome === "saved"
              ? `We will let you know when dining and groceries pass ${usd.format(budget)} in a month.`
              : outcome === "skipped"
                ? "You can set a food budget later from Settings."
                : `Based on your last 6 months of dining and groceries, averaging ${usd.format(average)} a month.`}
          </CardDescription>
        </div>
      </CardHeader>
      {outcome ? (
        <CardContent>
          <p
            role="status"
            className="flex items-start gap-2.5 rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground"
          >
            <CircleCheck
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-success"
            />
            {outcome === "saved"
              ? `${usd.format(budget)} a month.${yearlyGap > 0 ? ` Sticking to it would save about ${usd.format(yearlyGap)} a year.` : ""}`
              : "No budget set. Spending is still tracked on your dashboard."}
          </p>
        </CardContent>
      ) : (
        <CardContent className="flex flex-col gap-5">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-44 w-full"
            role="img"
            aria-label={`Monthly food spending against a ${usd.format(budget)} budget. Over budget in ${overMonths.length} of 6 months.`}
          >
            <BarChart data={spending} margin={{ left: 0, right: 8, top: 16 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                width={52}
                tickLine={false}
                axisLine={false}
                domain={[0, MAX_BUDGET]}
                ticks={[0, 250, 500, 750, 1000]}
                tickFormatter={(value: number) => usd.format(value)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideIndicator
                    formatter={(value) => {
                      const diff = Number(value) - budget;
                      return (
                        <div className="grid w-full gap-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Spent</span>
                            <span className="font-mono font-medium tabular-nums">
                              {usd.format(Number(value))}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              {diff > 0 ? "Over" : "Under"}
                            </span>
                            <span className="font-mono font-medium tabular-nums">
                              {usd.format(Math.abs(diff))}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar dataKey="amount" radius={4} isAnimationActive={false}>
                {spending.map((item) => (
                  <Cell
                    key={item.month}
                    fill={
                      item.amount > budget
                        ? "var(--color-over)"
                        : "var(--color-amount)"
                    }
                  />
                ))}
              </Bar>
              <ReferenceLine
                y={budget}
                stroke="var(--foreground)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                label={{
                  value: usd.format(budget),
                  position: "insideTopRight",
                  fill: "var(--foreground)",
                  fontSize: 11,
                }}
              />
            </BarChart>
          </ChartContainer>

          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-2">
              <Label id="chart-17-budget-label">Monthly budget</Label>
              <output
                htmlFor="chart-17-budget"
                className="font-semibold text-lg tabular-nums"
              >
                {usd.format(budget)}
              </output>
            </div>
            <Slider
              id="chart-17-budget"
              aria-labelledby="chart-17-budget-label"
              min={MIN_BUDGET}
              max={MAX_BUDGET}
              step={STEP}
              value={[budget]}
              onValueChange={(value) =>
                setBudget(typeof value === "number" ? value : value[0])
              }
            />
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {verdict}{" "}
              {yearlyGap > 0
                ? `Sticking to it would save about ${usd.format(yearlyGap)} a year.`
                : null}
            </p>
          </div>
        </CardContent>
      )}
      <CardFooter className="justify-between gap-2 border-t">
        {/* Steps 1 and 2 live outside this preview, so Back only returns from the confirmation. */}
        <Button
          variant="ghost"
          size="sm"
          disabled={!outcome}
          onClick={() => setOutcome(null)}
        >
          Back
        </Button>
        {outcome ? null : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOutcome("skipped")}
            >
              Skip
            </Button>
            <Button size="sm" onClick={() => setOutcome("saved")}>
              Save budget
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
