"use client";

import * as React from "react";
import { CheckIcon, TruckIcon, ZapIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Calendar } from "@/registry/base/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

// The order is placed on Monday, October 5, 2026. Deliveries start two days
// later, never on Sundays, and nothing is scheduled past the end of October.
const orderDate = new Date(2026, 9, 5);
const firstDelivery = new Date(2026, 9, 7);
const lastDelivery = new Date(2026, 9, 31);
const expressUntil = new Date(2026, 9, 8);
const expressFee = 12;

function isExpress(date: Date) {
  return date.getTime() <= expressUntil.getTime();
}

function formatDay(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function Calendar09() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 9, 9),
  );
  const [reserved, setReserved] = React.useState<Date | undefined>();
  const express = date ? isExpress(date) : false;
  // Picking another day after reserving asks the shopper to confirm again.
  const isReserved =
    date !== undefined && reserved?.getTime() === date.getTime();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Choose a delivery date</CardTitle>
        <CardDescription>
          Oak desk, 140 cm · ships from the Portland warehouse
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={orderDate}
          startMonth={orderDate}
          endMonth={lastDelivery}
          disabled={[
            { before: firstDelivery },
            { after: lastDelivery },
            { dayOfWeek: [0] },
          ]}
          modifiers={{ express: { from: firstDelivery, to: expressUntil } }}
          modifiersClassNames={{
            express:
              "after:pointer-events-none after:absolute after:bottom-1 after:left-1/2 after:z-20 after:h-0.5 after:w-3 after:-translate-x-1/2 after:rounded-full after:bg-chart-4",
          }}
          classNames={{ root: "w-full" }}
          className="rounded-lg border p-2 [--cell-size:--spacing(8)] sm:p-3 sm:[--cell-size:--spacing(9)]"
        />
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-0.5 w-3 rounded-full bg-chart-4"
            />
            Express, +${expressFee}
          </span>
          <span>Sundays unavailable</span>
        </div>
        <div
          aria-live="polite"
          className="flex items-start gap-3 rounded-lg bg-muted px-3 py-2.5"
        >
          {express ? (
            <ZapIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-chart-4"
            />
          ) : (
            <TruckIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
          )}
          {date ? (
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
              <span className="font-medium">{formatDay(date)}</span>
              <span className="text-muted-foreground">
                Between 8 AM and 6 PM · signature required
              </span>
            </div>
          ) : (
            <span className="flex-1 text-sm text-muted-foreground">
              Pick a day to see the delivery window.
            </span>
          )}
          {date ? (
            <span className="text-sm font-medium tabular-nums">
              {express ? `$${expressFee}.00` : "Free"}
            </span>
          ) : null}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!date || isReserved}
          onClick={() => setReserved(date)}
        >
          {isReserved ? (
            <>
              <CheckIcon aria-hidden="true" data-icon="inline-start" />
              Delivery date reserved
            </>
          ) : (
            "Continue to payment"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
