"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { ScrollArea } from "@/registry/base/ui/scroll-area";

const regions = [
  {
    name: "Americas",
    zones: [
      { id: "America/Los_Angeles", city: "Los Angeles", offset: "UTC−07:00" },
      { id: "America/Denver", city: "Denver", offset: "UTC−06:00" },
      { id: "America/Chicago", city: "Chicago", offset: "UTC−05:00" },
      { id: "America/New_York", city: "New York", offset: "UTC−04:00" },
      { id: "America/Sao_Paulo", city: "São Paulo", offset: "UTC−03:00" },
    ],
  },
  {
    name: "Europe",
    zones: [
      { id: "Europe/London", city: "London", offset: "UTC+01:00" },
      { id: "Europe/Berlin", city: "Berlin", offset: "UTC+02:00" },
      { id: "Europe/Paris", city: "Paris", offset: "UTC+02:00" },
      { id: "Europe/Istanbul", city: "Istanbul", offset: "UTC+03:00" },
    ],
  },
  {
    name: "Asia",
    zones: [
      { id: "Asia/Dubai", city: "Dubai", offset: "UTC+04:00" },
      { id: "Asia/Kolkata", city: "Mumbai", offset: "UTC+05:30" },
      { id: "Asia/Singapore", city: "Singapore", offset: "UTC+08:00" },
      { id: "Asia/Tokyo", city: "Tokyo", offset: "UTC+09:00" },
    ],
  },
  {
    name: "Oceania",
    zones: [
      { id: "Australia/Sydney", city: "Sydney", offset: "UTC+10:00" },
      { id: "Pacific/Auckland", city: "Auckland", offset: "UTC+12:00" },
    ],
  },
];

export default function ScrollArea04() {
  const [selected, setSelected] = React.useState("Europe/Berlin");
  const current = regions
    .flatMap((region) => region.zones)
    .find((zone) => zone.id === selected);

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span id="scroll-area-04-label" className="text-sm font-medium">
          Time zone
        </span>
        <span className="truncate text-xs text-muted-foreground tabular-nums">
          {current?.city} · {current?.offset}
        </span>
      </div>
      <ScrollArea
        role="region"
        aria-labelledby="scroll-area-04-label"
        className="h-72 rounded-lg border bg-popover text-popover-foreground"
      >
        {regions.map((region) => (
          <section
            key={region.name}
            aria-labelledby={`scroll-area-04-${region.name.toLowerCase()}`}
          >
            <h4
              id={`scroll-area-04-${region.name.toLowerCase()}`}
              className="sticky top-0 z-10 border-b bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              {region.name}
            </h4>
            <ul className="p-1">
              {region.zones.map((zone) => {
                const isSelected = zone.id === selected;
                return (
                  <li key={zone.id}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelected(zone.id)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-pressed:font-medium"
                    >
                      <Check
                        aria-hidden="true"
                        className={
                          isSelected
                            ? "size-4 shrink-0"
                            : "size-4 shrink-0 opacity-0"
                        }
                      />
                      <span className="flex-1 truncate">{zone.city}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {zone.offset}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </ScrollArea>
    </div>
  );
}
