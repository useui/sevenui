"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";

type Direction = "up" | "down" | "flat";

// `good` records whether the change is good news for this metric, so churn
// falling reads as positive even though the number went down.
const metrics: {
  name: string;
  value: string;
  change: string;
  direction: Direction;
  good: boolean | null;
}[] = [
  {
    name: "Monthly recurring revenue",
    value: "$48,920",
    change: "12.4%",
    direction: "up",
    good: true,
  },
  {
    name: "Customer churn",
    value: "2.1%",
    change: "0.6 pts",
    direction: "down",
    good: true,
  },
  {
    name: "Median first response",
    value: "3h 12m",
    change: "18%",
    direction: "up",
    good: false,
  },
  {
    name: "Active workspaces",
    value: "1,204",
    change: "0.0%",
    direction: "flat",
    good: null,
  },
];

const icons = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus };

const words = { up: "Up", down: "Down", flat: "No change," };

function toneClass(good: boolean | null) {
  if (good === true) return "border-success/25 bg-success/10 text-success";
  if (good === false)
    return "border-destructive/25 bg-destructive/10 text-destructive";
  return "text-muted-foreground";
}

export default function Badge03() {
  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground">
      <div className="flex items-baseline justify-between gap-2 border-b border-border px-4 py-3">
        <h3 className="text-sm font-medium">September overview</h3>
        <p className="text-xs text-muted-foreground">vs. August</p>
      </div>
      <dl className="divide-y divide-border">
        {metrics.map((metric) => {
          const Icon = icons[metric.direction];
          return (
            <div
              key={metric.name}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-4 py-3"
            >
              <dt className="truncate text-xs text-muted-foreground">
                {metric.name}
              </dt>
              <dd className="col-start-1 text-lg font-semibold tabular-nums">
                {metric.value}
              </dd>
              <dd className="col-start-2 row-span-2 row-start-1">
                <Badge
                  variant="outline"
                  className={`tabular-nums ${toneClass(metric.good)}`}
                >
                  <Icon aria-hidden="true" data-icon="inline-start" />
                  <span className="sr-only">{words[metric.direction]} </span>
                  {metric.change}
                  {metric.good === null ? null : (
                    <span className="sr-only">
                      {metric.good ? ", improving" : ", getting worse"}
                    </span>
                  )}
                </Badge>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
