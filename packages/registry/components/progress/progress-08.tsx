"use client";

import { cn } from "cn";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

const QUARTER_DAYS = 92;
const DAY = 58;

const KEY_RESULTS = [
  {
    id: "activation",
    title: "Raise week-one activation to 45%",
    owner: { name: "Priya Nair", initials: "PN" },
    value: 71,
  },
  {
    id: "churn",
    title: "Cut self-serve churn below 3%",
    owner: { name: "Daniel Okafor", initials: "DO" },
    value: 52,
  },
  {
    id: "nps",
    title: "Ship in-app NPS to all workspaces",
    owner: { name: "Lena Fischer", initials: "LF" },
    value: 28,
  },
];

const STATUS = {
  ahead: {
    label: "On track",
    dot: "bg-success",
    bar: "[&_[data-slot=progress-indicator]]:bg-success",
  },
  risk: {
    label: "At risk",
    dot: "bg-warning",
    bar: "[&_[data-slot=progress-indicator]]:bg-warning",
  },
  behind: {
    label: "Behind",
    dot: "bg-destructive",
    bar: "[&_[data-slot=progress-indicator]]:bg-destructive",
  },
};

function getStatus(value: number, pace: number) {
  if (value >= pace - 5) return STATUS.ahead;
  if (value >= pace - 20) return STATUS.risk;
  return STATUS.behind;
}

export default function Progress08() {
  const pace = Math.round((DAY / QUARTER_DAYS) * 100);

  return (
    <section
      aria-labelledby="progress-08-title"
      className="flex w-full max-w-md flex-col gap-5 rounded-xl border bg-card p-5 text-card-foreground"
    >
      <header className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 id="progress-08-title" className="font-medium">
            Growth team · Q3 goals
          </h3>
          <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground tabular-nums">
            {QUARTER_DAYS - DAY} days left
          </span>
        </div>
        <Progress
          value={DAY}
          max={QUARTER_DAYS}
          getAriaValueText={() => `Day ${DAY} of ${QUARTER_DAYS}`}
          className="gap-1.5 [&_[data-slot=progress-indicator]]:bg-muted-foreground/50"
        >
          <ProgressLabel className="text-xs font-normal text-muted-foreground">
            Quarter elapsed
          </ProgressLabel>
          <ProgressValue className="text-xs" />
        </Progress>
      </header>

      <ul className="flex flex-col divide-y">
        {KEY_RESULTS.map((kr) => {
          const status = getStatus(kr.value, pace);
          return (
            <li
              key={kr.id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <Avatar size="sm" className="max-sm:hidden">
                  <AvatarImage src="/placeholder.svg" alt="" />
                  <AvatarFallback>{kr.owner.initials}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium">{kr.title}</span>
                  <span className="text-xs text-muted-foreground">
                    Owned by {kr.owner.name}
                  </span>
                </div>
                <Badge variant="outline" className="shrink-0">
                  <span
                    aria-hidden="true"
                    className={cn("size-1.5 rounded-full", status.dot)}
                  />
                  {status.label}
                </Badge>
              </div>
              <div className="relative">
                <Progress
                  value={kr.value}
                  aria-label={kr.title}
                  getAriaValueText={(formatted) =>
                    `${formatted} complete, expected ${pace}% by today, ${status.label.toLowerCase()}`
                  }
                  className={cn(
                    "flex-nowrap items-center gap-3 [&_[data-slot=progress-track]]:order-first [&_[data-slot=progress-track]]:h-2",
                    status.bar,
                  )}
                >
                  <ProgressValue className="w-9 shrink-0 text-right text-xs" />
                </Progress>
                <span
                  aria-hidden="true"
                  title={`Expected pace: ${pace}%`}
                  className="pointer-events-none absolute top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
                  style={{ left: `calc((100% - 3rem) * ${pace / 100})` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          aria-hidden="true"
          className="inline-block h-3 w-0.5 rounded-full bg-foreground"
        />
        Expected pace for day {DAY} ({pace}%)
      </p>
    </section>
  );
}
