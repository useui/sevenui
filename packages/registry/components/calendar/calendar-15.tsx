"use client";

import * as React from "react";
import { cn } from "cn";
import { CheckIcon, StarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/registry/base/ui/button";
import { Calendar, CalendarDayButton } from "@/registry/base/ui/calendar";
import { Separator } from "@/registry/base/ui/separator";

const today = new Date(2026, 9, 5);
const lastBookable = new Date(2027, 2, 31);
const minNights = 2;
const cleaningFee = 85;
const serviceRate = 0.12;
// Nights already reserved by other guests.
const reserved: DateRange[] = [
  { from: new Date(2026, 9, 9), to: new Date(2026, 9, 11) },
  { from: new Date(2026, 9, 22), to: new Date(2026, 9, 25) },
  { from: new Date(2026, 10, 12), to: new Date(2026, 10, 15) },
];

// Weekend nights cost more, and a few peak dates carry a premium.
function nightlyRate(date: Date) {
  const weekday = date.getDay();
  const base = weekday === 5 || weekday === 6 ? 219 : 164;
  const peak = date.getMonth() === 10 && date.getDate() >= 25 ? 60 : 0;
  return base + peak;
}

function PriceDayButton({
  children,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof CalendarDayButton>) {
  const showPrice = !modifiers.outside && !modifiers.disabled;
  return (
    <CalendarDayButton
      day={day}
      modifiers={modifiers}
      {...props}
      className={cn(
        "[&>span]:text-[0.625rem] sm:[&>span]:text-xs",
        props.className,
      )}
    >
      {children}
      <span aria-hidden="true" className="tabular-nums">
        {showPrice ? `$${nightlyRate(day.date)}` : " "}
      </span>
    </CalendarDayButton>
  );
}

const currency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function Calendar15() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 9, 15),
    to: new Date(2026, 9, 18),
  });
  const [requested, setRequested] = React.useState<DateRange | undefined>();
  const isRequested =
    range?.from !== undefined &&
    range.to !== undefined &&
    requested?.from?.getTime() === range.from.getTime() &&
    requested?.to?.getTime() === range.to.getTime();

  const nights: Date[] = [];
  if (range?.from && range.to) {
    for (
      let night = new Date(range.from);
      night.getTime() < range.to.getTime();
      night.setDate(night.getDate() + 1)
    ) {
      nights.push(new Date(night));
    }
  }
  const lodging = nights.reduce((sum, night) => sum + nightlyRate(night), 0);
  const service = Math.round(lodging * serviceRate);
  const total = lodging + cleaningFee + service;
  const format = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <section
      aria-labelledby="calendar-15-title"
      className="flex w-full max-w-md flex-col rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 id="calendar-15-title" className="font-medium">
            Cedar cabin with lake view
          </h3>
          <p className="text-sm text-muted-foreground">
            Lake Placid, NY · sleeps 4 · {minNights}-night minimum
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-sm">
          <StarIcon aria-hidden="true" className="size-3.5 fill-current" />
          <span className="font-medium tabular-nums">4.92</span>
          <span className="sr-only">out of 5 stars</span>
        </span>
      </div>
      <Separator />
      <div className="p-2 sm:p-4">
        <Calendar
          mode="range"
          min={minNights}
          excludeDisabled
          selected={range}
          onSelect={setRange}
          defaultMonth={today}
          startMonth={today}
          endMonth={lastBookable}
          disabled={[
            { before: new Date(2026, 9, 6) },
            { after: lastBookable },
            ...reserved,
          ]}
          modifiers={{ reserved }}
          modifiersClassNames={{
            reserved: "[&>button]:line-through",
          }}
          components={{ DayButton: PriceDayButton }}
          classNames={{ root: "w-full" }}
          className="bg-transparent p-0 [--cell-size:--spacing(7)] sm:[--cell-size:--spacing(11)]"
        />
      </div>
      <Separator />
      <div aria-live="polite" className="flex flex-col gap-3 p-3 sm:p-4">
        {nights.length > 0 && range?.from && range.to ? (
          <dl className="grid grid-cols-[1fr_auto] gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">
              {format(range.from)} – {format(range.to)} · {nights.length}{" "}
              nights
            </dt>
            <dd className="pl-4 text-right tabular-nums">{currency(lodging)}</dd>
            <dt className="text-muted-foreground">Cleaning fee</dt>
            <dd className="pl-4 text-right tabular-nums">{currency(cleaningFee)}</dd>
            <dt className="text-muted-foreground">Service fee</dt>
            <dd className="pl-4 text-right tabular-nums">{currency(service)}</dd>
            <dt className="border-t pt-2 font-medium">Total before taxes</dt>
            <dd className="border-t pt-2 pl-4 text-right font-medium tabular-nums">
              {currency(total)}
            </dd>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            {range?.from
              ? `Check-in ${format(range.from)}. Now pick a check-out date at least ${minNights} nights later.`
              : "Pick your check-in date. Prices shown are per night."}
          </p>
        )}
        <Button
          className="w-full"
          disabled={nights.length === 0 || isRequested}
          onClick={() => setRequested(range)}
        >
          {isRequested ? (
            <>
              <CheckIcon aria-hidden="true" data-icon="inline-start" />
              Request sent
            </>
          ) : nights.length > 0 ? (
            "Reserve"
          ) : (
            "Check availability"
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {isRequested
            ? "The host usually replies within a few hours."
            : "You will not be charged until the host confirms."}
        </p>
      </div>
    </section>
  );
}
