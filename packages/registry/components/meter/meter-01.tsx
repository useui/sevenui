"use client";

import { cn } from "cn";

import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

const sizes = [
  {
    size: "Small",
    label: "Build minutes",
    value: 62,
    className: "gap-1.5 [&>div]:h-1",
    text: "text-xs",
  },
  {
    size: "Default",
    label: "Bandwidth this cycle",
    value: 48,
    className: "",
    text: "text-sm",
  },
  {
    size: "Large",
    label: "Storage used",
    value: 81,
    className: "gap-2.5 [&>div]:h-3",
    text: "text-base",
  },
];

export default function Meter01() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {sizes.map((item) => (
        <div key={item.size} className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{item.size}</span>
          <Meter
            value={item.value}
            locale="en-US"
            className={cn("grid-cols-[minmax(0,1fr)_auto] gap-x-4", item.className)}
          >
            <MeterLabel className={item.text}>{item.label}</MeterLabel>
            <MeterValue className={cn("text-right tabular-nums", item.text)} />
          </Meter>
        </div>
      ))}
    </div>
  );
}
