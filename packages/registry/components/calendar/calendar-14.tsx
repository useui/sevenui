"use client";

import * as React from "react";
import { DatabaseBackupIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Calendar } from "@/registry/base/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

const frequencies: { value: Frequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
];

const today = new Date(2026, 9, 5);
const horizon = new Date(2026, 11, 31);

// Every run from the start date until the end of the visible horizon.
function runsFrom(start: Date, frequency: Frequency) {
  const runs: Date[] = [];
  for (let i = 0; runs.length < 400; i += 1) {
    let run: Date;
    if (frequency === "monthly") {
      // Monthly runs are limited to the 1st-28th so every month has the day.
      run = new Date(start.getFullYear(), start.getMonth() + i, start.getDate());
    } else {
      const step = { daily: 1, weekly: 7, biweekly: 14 }[frequency];
      run = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + i * step,
      );
    }
    if (run.getTime() > horizon.getTime()) break;
    runs.push(run);
  }
  return runs;
}

function cronFor(start: Date, frequency: Frequency) {
  if (frequency === "daily") return "0 2 * * *";
  if (frequency === "monthly") {
    return `0 2 ${start.getDate()} * *`;
  }
  return `0 2 * * ${start.getDay()}`;
}

export default function Calendar14() {
  const [saved, setSaved] = React.useState<{
    start: Date;
    frequency: Frequency;
  }>({ start: new Date(2026, 9, 9), frequency: "weekly" });
  const [start, setStart] = React.useState<Date>(saved.start);
  const [frequency, setFrequency] = React.useState<Frequency>(saved.frequency);
  const [justSaved, setJustSaved] = React.useState(false);
  const dirty =
    start.getTime() !== saved.start.getTime() ||
    frequency !== saved.frequency;
  const runs = React.useMemo(
    () => runsFrom(start, frequency),
    [start, frequency],
  );
  const cron = cronFor(start, frequency);

  return (
    <section
      aria-labelledby="calendar-14-title"
      className="flex w-full max-w-md flex-col rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex items-start gap-3 border-b p-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <DatabaseBackupIcon aria-hidden="true" className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 id="calendar-14-title" className="text-sm font-medium">
            Backup schedule
          </h3>
          <p className="text-sm text-muted-foreground">
            orders-prod · PostgreSQL 16 · snapshots at 02:00 UTC
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <span id="calendar-14-frequency" className="text-sm font-medium">
            Repeat
          </span>
          <ToggleGroup
            aria-labelledby="calendar-14-frequency"
            variant="outline"
            size="sm"
            spacing={0}
            value={[frequency]}
            onValueChange={(next) => {
              if (next.length === 0) return;
              const value = next[0] as Frequency;
              setFrequency(value);
              setJustSaved(false);
              if (value === "monthly" && start.getDate() > 28) {
                setStart(
                  new Date(start.getFullYear(), start.getMonth(), 28),
                );
              }
            }}
            className="w-full"
          >
            {frequencies.map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                className="flex-1"
              >
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex flex-col gap-2">
          <span id="calendar-14-start" className="text-sm font-medium">
            First snapshot
          </span>
          <Calendar
            aria-labelledby="calendar-14-start"
            mode="single"
            required
            selected={start}
            onSelect={(next) => {
              setStart(next);
              setJustSaved(false);
            }}
            defaultMonth={today}
            startMonth={today}
            endMonth={horizon}
            disabled={[
              { before: today },
              { after: horizon },
              (day) => frequency === "monthly" && day.getDate() > 28,
            ]}
            modifiers={{ run: runs.slice(1) }}
            modifiersClassNames={{
              run: "[&>button]:bg-primary/10 [&>button]:font-medium [&>button]:text-foreground",
            }}
            classNames={{ root: "w-full" }}
            className="rounded-lg border p-3"
          />
        </div>
        <div className="flex flex-col gap-2 rounded-lg bg-muted p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              Cron expression
            </span>
            <code className="rounded-md bg-background px-1.5 py-0.5 font-mono text-xs">
              {cron}
            </code>
          </div>
          <p aria-live="polite" className="text-sm">
            <span className="font-medium tabular-nums">{runs.length}</span>{" "}
            <span className="text-muted-foreground">
              runs through Dec 31. Next after the first:{" "}
            </span>
            <span className="font-medium">
              {runs[1]
                ? runs[1].toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                : "none"}
            </span>
          </p>
          {frequency === "biweekly" ? (
            <p className="text-xs text-muted-foreground">
              Cron cannot express every other week; the scheduler skips
              alternate matches.
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t p-4">
        <p role="status" className="mr-auto text-xs text-muted-foreground">
          {dirty ? "Unsaved changes" : justSaved ? "Schedule saved" : ""}
        </p>
        <Button
          variant="ghost"
          disabled={!dirty}
          onClick={() => {
            setStart(saved.start);
            setFrequency(saved.frequency);
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={!dirty}
          onClick={() => {
            setSaved({ start, frequency });
            setJustSaved(true);
          }}
        >
          Save schedule
        </Button>
      </div>
    </section>
  );
}
