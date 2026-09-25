"use client";

import { CircleCheck, OctagonAlert, TriangleAlert } from "lucide-react";

import { cn } from "cn";

import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

const levels = {
  healthy: {
    icon: CircleCheck,
    text: "text-success",
    meter: "[&>div]:bg-success/15 [&>div>div]:bg-success",
    message: "Within normal range",
  },
  warning: {
    icon: TriangleAlert,
    text: "text-warning",
    meter: "[&>div]:bg-warning/20 [&>div>div]:bg-warning",
    message: "Approaching the 85% alert threshold",
  },
  critical: {
    icon: OctagonAlert,
    text: "text-destructive",
    meter: "[&>div]:bg-destructive/15 [&>div>div]:bg-destructive",
    message: "Above 90% — writes may start failing",
  },
};

const resources = [
  { id: "cpu", label: "CPU", value: 34 },
  { id: "memory", label: "Memory", value: 78 },
  { id: "disk", label: "Disk", value: 94 },
];

function getLevel(value: number) {
  if (value >= 90) return levels.critical;
  if (value >= 70) return levels.warning;
  return levels.healthy;
}

export default function Meter04() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      {resources.map((resource) => {
        const level = getLevel(resource.value);
        const Icon = level.icon;
        const messageId = `meter-04-${resource.id}-status`;
        return (
          <div key={resource.id} className="flex flex-col gap-1.5">
            <Meter
              value={resource.value}
              locale="en-US"
              aria-describedby={messageId}
              className={cn("grid-cols-2", level.meter)}
            >
              <MeterLabel>{resource.label}</MeterLabel>
              <MeterValue className="text-right tabular-nums" />
            </Meter>
            <p
              id={messageId}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Icon aria-hidden="true" className={cn("size-3.5", level.text)} />
              {level.message}
            </p>
          </div>
        );
      })}
    </div>
  );
}
