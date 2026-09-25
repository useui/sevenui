"use client";

import * as React from "react";
import { Coffee, Gift } from "lucide-react";

import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

const STAMPS_FOR_REWARD = 10;

export default function Meter05() {
  const [stamps, setStamps] = React.useState(7);
  const [rewards, setRewards] = React.useState(0);
  const complete = stamps >= STAMPS_FOR_REWARD;
  const remaining = STAMPS_FOR_REWARD - stamps;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium">Harbor Street Roasters</h3>
          <p className="text-sm text-muted-foreground">
            Every 10th drink is on us.
          </p>
        </div>
        {rewards > 0 ? (
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums">
            {rewards} redeemed
          </span>
        ) : null}
      </div>
      <Meter
        value={stamps}
        max={STAMPS_FOR_REWARD}
        getAriaValueText={(_, value) =>
          `${value} of ${STAMPS_FOR_REWARD} stamps collected`
        }
        className="grid-cols-[1fr_auto] gap-3 [&>div:last-of-type]:hidden"
      >
        <MeterLabel>Loyalty stamps</MeterLabel>
        <MeterValue className="text-right tabular-nums">
          {(_, value) => `${value} / ${STAMPS_FOR_REWARD}`}
        </MeterValue>
        <div aria-hidden="true" className="col-span-full grid grid-cols-5 gap-2">
          {Array.from({ length: STAMPS_FOR_REWARD }, (_, index) => {
            const filled = index < stamps;
            const last = index === STAMPS_FOR_REWARD - 1;
            const Icon = last ? Gift : Coffee;
            return (
              <span
                // Stamps are positional and never reorder.
                // biome-ignore lint/suspicious/noArrayIndexKey: static slots
                key={index}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-full border transition-colors duration-300",
                  filled
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-dashed border-border text-muted-foreground/60",
                )}
              >
                <Icon className="size-4" />
              </span>
            );
          })}
        </div>
      </Meter>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {complete
            ? "Your next drink is free."
            : `${remaining} more ${remaining === 1 ? "drink" : "drinks"} until a free one.`}
        </p>
        {complete ? (
          <Button
            size="sm"
            onClick={() => {
              setStamps(0);
              setRewards((current) => current + 1);
            }}
          >
            <Gift aria-hidden="true" />
            Redeem reward
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStamps((current) => current + 1)}
          >
            <Coffee aria-hidden="true" />
            Add stamp
          </Button>
        )}
      </div>
    </div>
  );
}
