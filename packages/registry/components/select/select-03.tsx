"use client";

import * as React from "react";
import { ArchiveIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const states = [
  { value: "closed", label: "closed", count: 214 },
  { value: "snoozed", label: "snoozed", count: 58 },
  { value: "waiting", label: "waiting on the customer", count: 131 },
];

const periods = [
  { value: "7", label: "7 days", share: 0.62 },
  { value: "30", label: "30 days", share: 0.31 },
  { value: "90", label: "90 days", share: 0.09 },
  { value: "365", label: "1 year", share: 0.02, plan: "Business" },
];

const inlineTrigger =
  "inline-flex h-7 max-w-full rounded-md border-transparent bg-muted px-2 align-middle font-medium hover:bg-accent dark:bg-muted dark:hover:bg-accent";

export default function Select03() {
  const [state, setState] = React.useState<string | null>("closed");
  const [period, setPeriod] = React.useState<string | null>("30");

  const stateCount = states.find((item) => item.value === state)?.count ?? 0;
  const share = periods.find((item) => item.value === period)?.share ?? 0;
  const matches = Math.round(stateCount * share);

  return (
    <section
      aria-labelledby="select-03-title"
      className="w-full max-w-sm rounded-xl border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-center gap-2">
        <ArchiveIcon aria-hidden="true" className="size-4 text-muted-foreground" />
        <h3 id="select-03-title" className="font-medium">
          Auto-archive rule
        </h3>
      </div>
      <p className="mt-3 text-sm leading-9">
        Archive conversations that stay{" "}
        <Select items={states} value={state} onValueChange={setState}>
          <SelectTrigger
            size="sm"
            aria-label="Conversation state"
            className={inlineTrigger}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} className="min-w-48">
            {states.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>{" "}
        for longer than{" "}
        <Select items={periods} value={period} onValueChange={setPeriod}>
          <SelectTrigger
            size="sm"
            aria-label="Inactivity period"
            className={inlineTrigger}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} className="min-w-52">
            {periods.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                disabled={Boolean(item.plan)}
              >
                <span className="flex-1">{item.label}</span>
                {item.plan ? (
                  <span className="text-xs text-muted-foreground">
                    {item.plan} plan
                  </span>
                ) : null}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        .
      </p>
      <p
        aria-live="polite"
        className="mt-3 border-t pt-3 text-xs text-muted-foreground tabular-nums"
      >
        {matches === 1
          ? "1 conversation matches today."
          : `${matches} conversations match today.`}
      </p>
    </section>
  );
}
