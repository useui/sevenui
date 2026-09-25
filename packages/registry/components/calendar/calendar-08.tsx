"use client";

import * as React from "react";
import {
  CalendarXIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  LoaderCircleIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Calendar } from "@/registry/base/ui/calendar";

type Status = "loading" | "ready" | "empty" | "error";

const LATENCY_MS = 700;

// Simulated availability: October is open, November fails on the first
// request, December is fully booked.
function openDaysFor(month: Date) {
  if (month.getMonth() === 11) return [];
  const days: Date[] = [];
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(month.getFullYear(), month.getMonth(), d);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6 && (d + month.getMonth()) % 3 !== 0) {
      days.push(date);
    }
  }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export default function Calendar08() {
  const [month, setMonth] = React.useState(new Date(2026, 9, 1));
  const [attempt, setAttempt] = React.useState(0);
  const [status, setStatus] = React.useState<Status>("loading");
  const [openDays, setOpenDays] = React.useState<Date[]>([]);
  const [date, setDate] = React.useState<Date | undefined>();
  const failedOnce = React.useRef(false);

  React.useEffect(() => {
    setStatus("loading");
    const timer = setTimeout(() => {
      // `attempt` is read so Retry re-runs this effect for the same month.
      void attempt;
      if (month.getMonth() === 10 && !failedOnce.current) {
        failedOnce.current = true;
        setOpenDays([]);
        setStatus("error");
        return;
      }
      const days = openDaysFor(month);
      setOpenDays(days);
      setStatus(days.length > 0 ? "ready" : "empty");
    }, LATENCY_MS);
    return () => clearTimeout(timer);
  }, [month, attempt]);

  const busy = status === "loading";
  const monthName = month.toLocaleDateString("en-US", { month: "long" });

  return (
    <div
      aria-busy={busy}
      className="flex w-full max-w-fit flex-col gap-3 rounded-xl border bg-background p-3 shadow-sm"
    >
      <Calendar
        mode="single"
        animate
        month={month}
        onMonthChange={(next) => {
          setDate(undefined);
          setMonth(next);
        }}
        startMonth={new Date(2026, 9, 1)}
        endMonth={new Date(2027, 0, 1)}
        selected={date}
        onSelect={setDate}
        disabled={
          status === "ready"
            ? (day) => !openDays.some((open) => isSameDay(open, day))
            : true
        }
        showOutsideDays={false}
        className={`p-0 transition-opacity duration-200 [--cell-size:--spacing(8)] ${
          busy ? "opacity-60" : ""
        }`}
      />
      <div
        role="status"
        className="flex min-h-9 items-center gap-2 border-t px-1 pt-3 text-sm"
      >
        {status === "loading" ? (
          <>
            <LoaderCircleIcon
              aria-hidden="true"
              className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none"
            />
            <span className="text-muted-foreground">
              Checking {monthName} availability
            </span>
          </>
        ) : null}
        {status === "ready" ? (
          <>
            <CircleCheckIcon
              aria-hidden="true"
              className="size-4 text-success"
            />
            <span>
              {date ? (
                <>
                  Booked{" "}
                  <span className="font-medium">
                    {date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-medium tabular-nums">
                    {openDays.length}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    open days in {monthName}
                  </span>
                </>
              )}
            </span>
          </>
        ) : null}
        {status === "empty" ? (
          <>
            <CalendarXIcon
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            <span className="text-muted-foreground">
              {monthName} is fully booked
            </span>
            <Button
              variant="outline"
              size="xs"
              className="ml-auto"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
            >
              Next month
            </Button>
          </>
        ) : null}
        {status === "error" ? (
          <>
            <CircleAlertIcon
              aria-hidden="true"
              className="size-4 text-destructive"
            />
            <span className="text-destructive">Couldn't load {monthName}</span>
            <Button
              variant="outline"
              size="xs"
              className="ml-auto"
              onClick={() => setAttempt((n) => n + 1)}
            >
              Retry
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
