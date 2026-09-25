"use client";

import * as React from "react";

import { Calendar } from "@/registry/base/ui/calendar";

const formatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "long",
  day: "numeric",
});

export default function Calendar01() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 8, 17),
  );

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      defaultMonth={new Date(2026, 8, 1)}
      className="rounded-xl border shadow-sm"
      footer={
        <p className="mt-3 border-t px-1 pt-3 text-sm text-muted-foreground">
          {date ? (
            <>
              Review call on{" "}
              <span className="font-medium text-foreground">
                {formatter.format(date)}
              </span>
            </>
          ) : (
            "No date picked yet."
          )}
        </p>
      }
    />
  );
}
