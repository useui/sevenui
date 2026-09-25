"use client";

import * as React from "react";
import { CircleCheckIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

type Cycle = "monthly" | "yearly";

const seats = 8;

const cycles: {
  value: Cycle;
  label: string;
  perSeat: number;
  unit: string;
  renews: string;
  savings?: string;
}[] = [
  {
    value: "monthly",
    label: "Monthly",
    perSeat: 15,
    unit: "per seat / month",
    renews: "Renews Oct 25, 2026",
  },
  {
    value: "yearly",
    label: "Yearly",
    perSeat: 144,
    unit: "per seat / year",
    renews: "Renews Sep 25, 2027",
    savings: "Save 20%",
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function RadioGroup09() {
  const [cycle, setCycle] = React.useState<Cycle>("yearly");
  // The cycle the team is paying for, once "Confirm and pay" has run.
  const [paid, setPaid] = React.useState<Cycle | null>(null);
  const selected = cycles.find((item) => item.value === cycle) ?? cycles[0];
  const monthlyEquivalent = cycle === "yearly" ? selected.perSeat / 12 : null;

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground">
      <div className="flex flex-col gap-1">
        <h3 id="radio-group-09-title" className="text-sm font-semibold">
          Billing cycle
        </h3>
        <p className="text-sm text-muted-foreground">
          Team plan for {seats} seats. Switch cycles any time from Billing.
        </p>
      </div>
      <RadioGroup
        aria-labelledby="radio-group-09-title"
        value={cycle}
        onValueChange={(value) => setCycle(value as Cycle)}
        className="grid-cols-1 gap-2 min-[400px]:grid-cols-2"
      >
        {cycles.map((item) => (
          <Label
            key={item.value}
            className="cursor-pointer flex-col items-stretch gap-3 rounded-lg border border-border p-3 font-normal transition-colors hover:bg-muted/50 has-data-checked:border-primary has-data-checked:bg-primary/5 dark:has-data-checked:bg-primary/10"
          >
            <span className="flex h-6 items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-medium">
                <RadioGroupItem value={item.value} />
                {item.label}
              </span>
              {item.savings ? (
                <Badge variant="secondary">{item.savings}</Badge>
              ) : null}
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-xl font-semibold tabular-nums">
                {currency.format(item.perSeat)}
              </span>
              <span className="text-xs text-muted-foreground">{item.unit}</span>
            </span>
          </Label>
        ))}
      </RadioGroup>
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">
            {seats} seats × {currency.format(selected.perSeat)}
          </dt>
          <dd className="tabular-nums">
            {currency.format(seats * selected.perSeat)}
          </dd>
        </div>
        {monthlyEquivalent ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Works out to</dt>
            <dd className="tabular-nums">
              {currency.format(monthlyEquivalent)} per seat / month
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3 border-t border-border pt-2 font-medium">
          <dt>Due today</dt>
          <dd className="tabular-nums" aria-live="polite">
            {currency.format(seats * selected.perSeat)}
          </dd>
        </div>
      </dl>
      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          disabled={paid === cycle}
          onClick={() => setPaid(cycle)}
        >
          {paid === null
            ? "Confirm and pay"
            : paid === cycle
              ? `Paid · ${selected.label.toLowerCase()} billing`
              : `Switch to ${selected.label.toLowerCase()} billing`}
        </Button>
        <p
          aria-live="polite"
          className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"
        >
          {paid === cycle ? (
            <>
              <CircleCheckIcon
                aria-hidden="true"
                className="size-3.5 shrink-0 text-success"
              />
              Payment received. {selected.renews}.
            </>
          ) : (
            `${selected.renews}. Cancel any time before then.`
          )}
        </p>
      </div>
    </div>
  );
}
