"use client";

import * as React from "react";
import type { DateRange } from "@/registry/ui-sdk/ui/calendar";

import { Calendar } from "@/registry/ui-sdk/ui/calendar";

export default function CalendarRange() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 5, 8),
    to: new Date(2026, 5, 17),
  });

  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      showOutsideDays={false}
      selected={range}
      onSelect={setRange}
      defaultMonth={range?.from}
      className="rounded-lg border shadow-sm"
    />
  );
}
