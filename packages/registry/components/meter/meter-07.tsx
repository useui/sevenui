"use client";

import * as React from "react";

import { cn } from "cn";

import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";
import { Slider } from "@/registry/base/ui/slider";

const spend = 1840;

const currency: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
};

const formatter = new Intl.NumberFormat("en-US", currency);

export default function Meter07() {
  const [budget, setBudget] = React.useState(2500);
  const ratio = spend / budget;
  const overBudget = spend > budget;

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Meter
          value={Math.min(spend, budget)}
          max={budget}
          format={currency}
          locale="en-US"
          getAriaValueText={() =>
            `${formatter.format(spend)} spent of ${formatter.format(budget)} budget`
          }
          aria-describedby="meter-07-status"
          className={cn(
            "grid-cols-[1fr_auto]",
            ratio >= 0.9 &&
              "[&>div]:bg-destructive/15 [&>div>div]:bg-destructive",
            ratio >= 0.75 &&
              ratio < 0.9 &&
              "[&>div]:bg-warning/20 [&>div>div]:bg-warning",
          )}
        >
          <MeterLabel>September cloud spend</MeterLabel>
          <MeterValue className="text-right tabular-nums">
            {() => `${formatter.format(spend)} / ${formatter.format(budget)}`}
          </MeterValue>
        </Meter>
        <p
          id="meter-07-status"
          aria-live="polite"
          className={cn(
            "text-xs",
            overBudget ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {overBudget
            ? `Over budget by ${formatter.format(spend - budget)}`
            : `${formatter.format(budget - spend)} left · ${Math.round(ratio * 100)}% used`}
        </p>
      </div>
      <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-4">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span id="meter-07-budget" className="font-medium">
            Monthly budget
          </span>
          <span className="text-muted-foreground tabular-nums">
            {formatter.format(budget)}
          </span>
        </div>
        <Slider
          value={[budget]}
          min={1000}
          max={5000}
          step={100}
          aria-labelledby="meter-07-budget"
          onValueChange={(next) =>
            setBudget(Array.isArray(next) ? next[0] : next)
          }
        />
      </div>
    </div>
  );
}
