"use client";

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Slider } from "@/registry/base/ui/slider";

// Daily trial signups from Aug 1 to Aug 30.
const signups = [
  42, 38, 51, 47, 33, 29, 44, 58, 61, 55, 49, 37, 31, 63, 72, 68, 70, 59, 41,
  39, 66, 81, 77, 74, 69, 48, 45, 83, 91, 88,
];

const LAST = signups.length - 1;
const peak = Math.max(...signups);

const windows = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
];

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function dayLabel(index: number) {
  return dateFormat.format(new Date(2026, 7, index + 1));
}

function sum(from: number, to: number) {
  let total = 0;
  for (let index = from; index <= to; index++) total += signups[index] ?? 0;
  return total;
}

export default function Slider16() {
  const [range, setRange] = useState<[number, number]>([16, LAST]);
  const [start, end] = range;

  const length = end - start + 1;
  const total = sum(start, end);
  const average = total / length;
  const hasPrevious = start - length >= 0;
  const previous = hasPrevious ? sum(start - length, start - 1) : 0;
  const change = hasPrevious ? ((total - previous) / previous) * 100 : null;

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle id="slider-16-title">Trial signups</CardTitle>
        <CardDescription aria-live="polite">
          {dayLabel(start)} – {dayLabel(end)}, {length}{" "}
          {length === 1 ? "day" : "days"}
        </CardDescription>
        <CardAction className="flex gap-1">
          {windows.map((item) => {
            const active = start === LAST - item.days + 1 && end === LAST;
            return (
              <Button
                key={item.label}
                variant={active ? "secondary" : "ghost"}
                size="xs"
                aria-pressed={active}
                aria-label={`Last ${item.days} days`}
                onClick={() => setRange([LAST - item.days + 1, LAST])}
              >
                {item.label}
              </Button>
            );
          })}
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-3 gap-3">
          <div className="flex flex-col justify-between gap-0.5">
            <dt className="text-xs text-muted-foreground">Signups</dt>
            <dd className="text-xl font-semibold tabular-nums">
              {total.toLocaleString("en-US")}
            </dd>
          </div>
          <div className="flex flex-col justify-between gap-0.5">
            <dt className="text-xs text-muted-foreground">Daily average</dt>
            <dd className="text-xl font-semibold tabular-nums">
              {average.toFixed(1)}
            </dd>
          </div>
          <div className="flex flex-col justify-between gap-0.5">
            <dt className="text-xs text-muted-foreground">vs. prior period</dt>
            <dd className="flex items-center gap-1 text-xl font-semibold tabular-nums">
              {change === null ? (
                <span className="text-base font-normal text-muted-foreground">
                  No data
                </span>
              ) : (
                <>
                  {change >= 0 ? (
                    <TrendingUpIcon
                      aria-hidden="true"
                      className="size-4 text-success"
                    />
                  ) : (
                    <TrendingDownIcon
                      aria-hidden="true"
                      className="size-4 text-destructive"
                    />
                  )}
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(0)}%
                </>
              )}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-3">
          <div
            role="img"
            aria-label={`Daily signups, ${dayLabel(0)} to ${dayLabel(LAST)}. Selected window totals ${total}.`}
            className="flex h-28 items-end gap-px sm:gap-0.5"
          >
            {signups.map((value, index) => {
              const selected = index >= start && index <= end;
              return (
                <div
                  key={dayLabel(index)}
                  className={`flex-1 rounded-t-sm transition-colors ${selected ? "bg-chart-1" : "bg-muted"}`}
                  style={{ height: `${(value / peak) * 100}%` }}
                />
              );
            })}
          </div>
          <Slider
            aria-labelledby="slider-16-title"
            value={range}
            min={0}
            max={LAST}
            step={1}
            onValueChange={(value) => {
              if (Array.isArray(value)) setRange([value[0], value[1]]);
            }}
          />
          <div
            aria-hidden="true"
            className="flex justify-between text-[0.7rem] text-muted-foreground"
          >
            <span>{dayLabel(0)}</span>
            <span>{dayLabel(14)}</span>
            <span>{dayLabel(LAST)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
