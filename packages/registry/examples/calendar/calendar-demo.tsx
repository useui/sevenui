"use client";

import * as React from "react";

import { Calendar } from "@/registry/base/ui/calendar";

export default function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 5, 12),
  );

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      defaultMonth={date}
      className="rounded-lg border shadow-sm"
    />
  );
}
