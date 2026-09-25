"use client";

import { CalendarCheckIcon } from "lucide-react";
import * as React from "react";

import { cn } from "cn";
import { Button } from "@/registry/base/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const team = ["Maya", "Daniel", "Lena", "Arjun", "Sofia", "Tom"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hours = [9, 10, 11, 12, 13, 14, 15, 16];

// Who is busy per "day-hour" slot. Anything not listed means everyone is free.
const busy: Record<string, string[]> = {
  "Mon-9": ["Maya", "Daniel", "Lena"],
  "Mon-10": ["Maya", "Daniel"],
  "Mon-11": ["Tom"],
  "Mon-12": ["Maya", "Daniel", "Lena", "Arjun"],
  "Mon-13": ["Sofia", "Tom", "Lena"],
  "Mon-15": ["Arjun"],
  "Tue-9": ["Sofia", "Tom", "Lena", "Arjun", "Maya"],
  "Tue-11": ["Lena"],
  "Tue-12": ["Daniel", "Arjun", "Tom"],
  "Tue-13": ["Daniel"],
  "Tue-14": ["Maya", "Sofia"],
  "Tue-16": ["Maya", "Daniel", "Lena", "Arjun", "Sofia", "Tom"],
  "Wed-9": ["Arjun"],
  "Wed-10": ["Maya", "Arjun"],
  "Wed-12": ["Maya", "Daniel", "Lena", "Arjun", "Sofia"],
  "Wed-13": ["Tom", "Lena"],
  "Wed-15": ["Daniel", "Sofia", "Tom"],
  "Wed-16": ["Sofia"],
  "Thu-9": ["Maya", "Tom"],
  "Thu-10": ["Lena", "Tom", "Arjun"],
  "Thu-11": ["Daniel", "Lena", "Arjun", "Sofia"],
  "Thu-12": ["Maya", "Daniel", "Sofia"],
  "Thu-14": ["Tom"],
  "Thu-15": ["Maya"],
  "Fri-9": ["Daniel"],
  "Fri-12": ["Maya", "Daniel", "Lena", "Arjun", "Sofia", "Tom"],
  "Fri-13": ["Maya", "Daniel", "Lena", "Arjun", "Sofia", "Tom"],
  "Fri-14": ["Arjun", "Sofia", "Lena", "Tom"],
  "Fri-15": ["Maya", "Daniel", "Lena", "Arjun", "Sofia", "Tom"],
  "Fri-16": ["Maya", "Daniel", "Lena", "Arjun", "Sofia", "Tom"],
};

const levels = [
  "bg-muted",
  "bg-primary/10",
  "bg-primary/20",
  "bg-primary/35",
  "bg-primary/50",
  "bg-primary/70",
  "bg-primary",
];

function formatHour(hour: number) {
  const suffix = hour < 12 ? "AM" : "PM";
  const value = hour > 12 ? hour - 12 : hour;
  return `${value} ${suffix}`;
}

export default function Tooltip13() {
  const [selected, setSelected] = React.useState<string | null>("Wed-11");
  const [sent, setSent] = React.useState<string | null>(null);

  const selectedLabel = selected
    ? (() => {
        const [day, hour] = selected.split("-");
        return `${day} ${formatHour(Number(hour))}`;
      })()
    : null;

  return (
    <TooltipProvider delay={100} closeDelay={0}>
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold">
            Find a time for Sprint planning
          </h3>
          <p className="text-xs text-muted-foreground">
            60 min · 6 attendees · Week of Sep 28. Hover a slot to see who can
            make it.
          </p>
        </div>

        <table
          aria-label="Team availability"
          className="w-full table-fixed border-separate border-spacing-1"
        >
          <thead>
            <tr>
              <th scope="col" className="w-10">
                <span className="sr-only">Time</span>
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  scope="col"
                  className="text-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <th
                  scope="row"
                  className="pr-1 text-right text-[0.6875rem] font-normal whitespace-nowrap text-muted-foreground tabular-nums"
                >
                  {formatHour(hour)}
                </th>
                {days.map((day) => {
                  const key = `${day}-${hour}`;
                  const out = busy[key] ?? [];
                  const free = team.length - out.length;
                  const isSelected = selected === key;
                  const summary = `${day} ${formatHour(hour)}, ${free} of ${team.length} available`;
                  return (
                    <td key={key} className="p-0">
                      <Tooltip>
                        <TooltipTrigger
                          aria-label={summary}
                          aria-pressed={isSelected}
                          aria-disabled={free === 0 || undefined}
                          onClick={() => {
                            if (free === 0) return;
                            setSelected(isSelected ? null : key);
                            setSent(null);
                          }}
                          className={cn(
                            "block h-6 w-full rounded-sm outline-none transition-[box-shadow,transform] hover:ring-2 hover:ring-ring/40 focus-visible:ring-3 focus-visible:ring-ring/60 active:scale-95",
                            levels[free],
                            free === 0 &&
                              "cursor-not-allowed bg-muted opacity-60 hover:ring-0",
                            isSelected &&
                              "ring-2 ring-foreground ring-offset-2 ring-offset-card hover:ring-foreground",
                          )}
                        />
                        <TooltipContent
                          side="top"
                          className="flex flex-col gap-0.5 text-left"
                        >
                          <span className="font-medium">
                            {day} {formatHour(hour)} – {formatHour(hour + 1)}
                          </span>
                          <span className="tabular-nums opacity-80">
                            {free === team.length
                              ? "Everyone is free"
                              : free === 0
                                ? "Nobody is free"
                                : `${free} of ${team.length} free · ${out.join(", ")} busy`}
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Fewer free</span>
          <div className="flex flex-1 gap-0.5" aria-hidden="true">
            {levels.map((level) => (
              <span
                key={level}
                className={cn("h-1.5 flex-1 rounded-full", level)}
              />
            ))}
          </div>
          <span>All free</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-sm" aria-live="polite">
            {selectedLabel ? (
              <>
                {sent === selected ? "Invite sent for" : "Selected"}{" "}
                <span className="font-medium">{selectedLabel}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Pick a slot</span>
            )}
          </span>
          <Button
            size="sm"
            disabled={!selected || sent === selected}
            onClick={() => setSent(selected)}
          >
            <CalendarCheckIcon data-icon="inline-start" aria-hidden="true" />
            {selected && sent === selected ? "Invite sent" : "Send invite"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
