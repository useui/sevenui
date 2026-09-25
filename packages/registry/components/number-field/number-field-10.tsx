"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";

const INITIAL_SEATS = 8;
const SEATS_IN_USE = 6;
const PRICE_PER_SEAT = 12;
const DAYS_LEFT = 18;
const DAYS_IN_CYCLE = 30;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function NumberField10() {
  const [currentSeats, setCurrentSeats] = React.useState(INITIAL_SEATS);
  const [seats, setSeats] = React.useState<number>(INITIAL_SEATS);
  const [status, setStatus] = React.useState<"idle" | "updating" | "updated">(
    "idle",
  );
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const delta = seats - currentSeats;
  const monthly = seats * PRICE_PER_SEAT;
  const prorated = (delta * PRICE_PER_SEAT * DAYS_LEFT) / DAYS_IN_CYCLE;

  let summary: string;
  if (delta > 0) {
    summary = `Adding ${delta} ${delta === 1 ? "seat" : "seats"}. You'll be charged ${currency.format(prorated)} today for the remaining ${DAYS_LEFT} days.`;
  } else if (delta < 0) {
    summary = `Removing ${-delta} ${delta === -1 ? "seat" : "seats"}. A credit of ${currency.format(-prorated)} goes toward your next invoice.`;
  } else if (status === "updated") {
    summary = `Plan updated to ${currentSeats} seats.`;
  } else {
    summary = "No change to your plan.";
  }

  function updateSeats() {
    if (timer.current) clearTimeout(timer.current);
    setStatus("updating");
    timer.current = setTimeout(() => {
      setCurrentSeats(seats);
      setStatus("updated");
    }, 700);
  }

  function changeSeats(value: number | null) {
    setSeats(value ?? SEATS_IN_USE);
    if (status === "updated") setStatus("idle");
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Team seats</CardTitle>
        <CardDescription>
          {SEATS_IN_USE} of {currentSeats} seats are assigned. Each seat
          bills at {currency.format(PRICE_PER_SEAT)} per month.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="grid min-w-0 gap-1">
            <Label htmlFor="number-field-10-seats">Seats</Label>
            <p
              id="number-field-10-hint"
              className="text-xs text-muted-foreground"
            >
              Can't go below the {SEATS_IN_USE} seats in use
            </p>
          </div>
          <NumberField
            id="number-field-10-seats"
            value={seats}
            onValueChange={changeSeats}
            disabled={status === "updating"}
            min={SEATS_IN_USE}
            max={200}
            largeStep={5}
            className="shrink-0"
          >
            <NumberFieldGroup className="h-10">
              <NumberFieldDecrement className="w-10" />
              <NumberFieldInput
                aria-describedby="number-field-10-hint"
                className="w-14 text-base font-medium"
              />
              <NumberFieldIncrement className="w-10" />
            </NumberFieldGroup>
          </NumberField>
        </div>
        <div className="grid gap-1 rounded-lg bg-muted/60 p-3 text-sm">
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">New monthly total</span>
            <span className="font-semibold tabular-nums">
              {currency.format(monthly)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {summary}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button
          variant="outline"
          disabled={delta === 0 || status === "updating"}
          onClick={() => setSeats(currentSeats)}
        >
          Reset
        </Button>
        <Button
          disabled={delta === 0 || status === "updating"}
          onClick={updateSeats}
        >
          {status === "updating" ? "Updating…" : "Update seats"}
        </Button>
      </CardFooter>
    </Card>
  );
}
