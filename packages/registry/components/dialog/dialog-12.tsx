"use client";

import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";
import { Label } from "@/registry/base/ui/label";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import { Switch } from "@/registry/base/ui/switch";

type Cycle = "monthly" | "annual";
type PlanId = "solo" | "starter" | "team" | "business";

const plans: {
  id: PlanId;
  name: string;
  monthly: number;
  seats: number;
  summary: string;
}[] = [
  { id: "solo", name: "Solo", monthly: 6, seats: 1, summary: "1 seat · 5 GB storage" },
  { id: "starter", name: "Starter", monthly: 12, seats: 10, summary: "10 seats · 10 GB storage" },
  { id: "team", name: "Team", monthly: 29, seats: 20, summary: "20 seats · 100 GB · SSO" },
  { id: "business", name: "Business", monthly: 79, seats: 100, summary: "100 seats · 1 TB · audit log" },
];

const seatsUsed = 7;
// 18 of 30 days are left in the current billing period.
const remainingShare = 18 / 30;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Annual billing charges 10 months for 12.
function price(monthly: number, cycle: Cycle) {
  return cycle === "annual" ? monthly * 10 : monthly;
}

export default function Dialog12() {
  const [current, setCurrent] = React.useState<{ plan: PlanId; cycle: Cycle }>(
    { plan: "starter", cycle: "monthly" },
  );
  const [open, setOpen] = React.useState(false);
  const [cycle, setCycle] = React.useState<Cycle>("monthly");
  const [selected, setSelected] = React.useState<PlanId>("team");

  const currentPlan = plans.find((plan) => plan.id === current.plan) ?? plans[1];
  const nextPlan = plans.find((plan) => plan.id === selected) ?? plans[2];

  const isSame = selected === current.plan && cycle === current.cycle;
  const isDowngrade = nextPlan.monthly < currentPlan.monthly;
  const seatConflict = seatsUsed > nextPlan.seats;
  // Unused time on the current plan is credited against the new charge.
  const credit = price(currentPlan.monthly, current.cycle) * remainingShare;
  const charge = price(nextPlan.monthly, cycle);
  const dueToday = Math.max(0, charge - credit);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setCycle(current.cycle);
      setSelected(current.plan === "starter" ? "team" : current.plan);
    }
    setOpen(next);
  };

  return (
    <section
      aria-labelledby="dialog-12-heading"
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="dialog-12-heading" className="text-sm text-muted-foreground">
            Current plan
          </h2>
          <p className="mt-1 flex items-center gap-2 text-lg font-medium">
            {currentPlan.name}
            <Badge variant="secondary" className="capitalize">
              {current.cycle}
            </Badge>
          </p>
        </div>
        <p className="text-right text-sm">
          <span className="font-medium tabular-nums">
            {currency.format(price(currentPlan.monthly, current.cycle))}
          </span>
          <span className="block text-xs text-muted-foreground">
            per {current.cycle === "annual" ? "year" : "month"}
          </span>
        </p>
      </div>

      <Progress value={(seatsUsed / currentPlan.seats) * 100}>
        <ProgressLabel className="text-xs font-normal text-muted-foreground">
          Seats
        </ProgressLabel>
        <ProgressValue className="text-xs">
          {() => `${seatsUsed} of ${currentPlan.seats}`}
        </ProgressValue>
      </Progress>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger render={<Button variant="outline">Change plan</Button>} />
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change plan</DialogTitle>
            <DialogDescription>
              Changes apply right away. Unused time on your current plan is
              credited to this invoice.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
            <Label htmlFor="dialog-12-annual" className="flex-col items-start gap-0.5">
              Bill annually
              <span className="text-xs font-normal text-muted-foreground">
                Pay for 10 months, get 12
              </span>
            </Label>
            <Switch
              id="dialog-12-annual"
              checked={cycle === "annual"}
              onCheckedChange={(checked) =>
                setCycle(checked ? "annual" : "monthly")
              }
            />
          </div>

          <RadioGroup
            aria-label="Plan"
            value={selected}
            onValueChange={(value) => setSelected(value as PlanId)}
          >
            {plans.map((plan) => (
              <Label
                key={plan.id}
                className="cursor-pointer gap-3 rounded-lg border p-3 leading-normal transition-colors hover:bg-muted/50 has-data-checked:border-primary has-data-checked:bg-primary/5"
              >
                <RadioGroupItem value={plan.id} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {plan.name}
                    {plan.id === current.plan && (
                      <Badge variant="outline">Current</Badge>
                    )}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {plan.summary}
                  </span>
                </span>
                <span className="text-right text-sm font-medium tabular-nums">
                  {currency.format(price(plan.monthly, cycle))}
                  <span className="block text-xs font-normal text-muted-foreground">
                    /{cycle === "annual" ? "yr" : "mo"}
                  </span>
                </span>
              </Label>
            ))}
          </RadioGroup>

          <dl
            aria-live="polite"
            className="grid grid-cols-[1fr_auto] gap-y-1.5 rounded-lg bg-muted/60 p-3 text-sm"
          >
            <dt className="text-muted-foreground">
              {nextPlan.name}, {cycle}
            </dt>
            <dd className="pl-4 text-right tabular-nums">{currency.format(charge)}</dd>
            <dt className="text-muted-foreground">Credit for unused time</dt>
            <dd className="pl-4 text-right tabular-nums">
              −{currency.format(credit)}
            </dd>
            <dt className="border-t pt-1.5 font-medium">Due today</dt>
            <dd className="border-t pt-1.5 pl-4 text-right font-medium tabular-nums">
              {currency.format(isSame ? 0 : dueToday)}
            </dd>
          </dl>

          {seatConflict && (
            <p role="alert" className="text-sm text-destructive">
              You have {seatsUsed} active members. Remove{" "}
              {seatsUsed - nextPlan.seats} before moving to {nextPlan.name}.
            </p>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button
              disabled={isSame || seatConflict}
              onClick={() => {
                setCurrent({ plan: selected, cycle });
                setOpen(false);
              }}
            >
              {isSame
                ? "Current plan"
                : isDowngrade
                  ? `Downgrade to ${nextPlan.name}`
                  : `Pay ${currency.format(dueToday)} and switch`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
