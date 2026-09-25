"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/registry/base/ui/button";
import { Calendar } from "@/registry/base/ui/calendar";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";
import { Textarea } from "@/registry/base/ui/textarea";

const today = new Date(2026, 9, 5);

function countWorkingDays(range: DateRange | undefined) {
  if (!range?.from) return 0;
  const end = range.to ?? range.from;
  let count = 0;
  for (
    let day = new Date(range.from);
    day.getTime() <= end.getTime();
    day.setDate(day.getDate() + 1)
  ) {
    const weekday = day.getDay();
    if (weekday !== 0 && weekday !== 6) count += 1;
  }
  return count;
}

function formatShort(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Settings = {
  enabled: boolean;
  range: DateRange | undefined;
  message: string;
};

const initialSettings: Settings = {
  enabled: true,
  range: { from: new Date(2026, 9, 12), to: new Date(2026, 9, 20) },
  message:
    "Thanks for reaching out. I'm away and not checking messages. For billing questions, reply to this email and the on-call team will pick it up.",
};

function sameRange(a: DateRange | undefined, b: DateRange | undefined) {
  return (
    a?.from?.getTime() === b?.from?.getTime() &&
    a?.to?.getTime() === b?.to?.getTime()
  );
}

export default function Calendar10() {
  const [saved, setSaved] = React.useState<Settings>(initialSettings);
  const [enabled, setEnabled] = React.useState(saved.enabled);
  const [range, setRange] = React.useState<DateRange | undefined>(
    saved.range,
  );
  const [message, setMessage] = React.useState(saved.message);
  const [justSaved, setJustSaved] = React.useState(false);
  const dirty =
    enabled !== saved.enabled ||
    message !== saved.message ||
    !sameRange(range, saved.range);
  const workingDays = countWorkingDays(range);
  const returnDate = range?.to
    ? new Date(
        range.to.getFullYear(),
        range.to.getMonth(),
        range.to.getDate() + 1,
      )
    : undefined;

  return (
    <section
      aria-labelledby="calendar-10-title"
      className="flex w-full max-w-md flex-col rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h3 id="calendar-10-title" className="text-sm font-medium">
            Out of office
          </h3>
          <p className="text-sm text-muted-foreground">
            Auto-reply to new messages and hand your open tickets to the
            on-call agent while you are away.
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(next) => {
            setEnabled(next);
            setJustSaved(false);
          }}
          aria-label="Enable out of office"
        />
      </div>
      <fieldset
        disabled={!enabled}
        className="flex flex-col gap-4 border-t p-4 transition-opacity disabled:opacity-60"
      >
        <legend className="sr-only">Out of office details</legend>
        <div className="flex flex-col gap-2">
          <span id="calendar-10-dates" className="text-sm font-medium">
            Away dates
          </span>
          <Calendar
            aria-labelledby="calendar-10-dates"
            mode="range"
            selected={range}
            onSelect={(next) => {
              setRange(next);
              setJustSaved(false);
            }}
            defaultMonth={today}
            startMonth={today}
            disabled={enabled ? { before: today } : true}
            classNames={{ root: "w-full" }}
            className="rounded-lg border p-3"
          />
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {range?.from && range.to && returnDate
              ? `${formatShort(range.from)} – ${formatShort(range.to)} · ${workingDays} working ${workingDays === 1 ? "day" : "days"} · back ${returnDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`
              : "Select the first and last day you are away."}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="calendar-10-message">Auto-reply message</Label>
          <Textarea
            id="calendar-10-message"
            rows={3}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setJustSaved(false);
            }}
          />
        </div>
      </fieldset>
      <div className="flex items-center justify-end gap-2 border-t p-4">
        <p
          role="status"
          className="mr-auto text-xs text-muted-foreground"
        >
          {dirty ? "Unsaved changes" : justSaved ? "Changes saved" : ""}
        </p>
        <Button
          variant="ghost"
          disabled={!dirty}
          onClick={() => {
            setEnabled(saved.enabled);
            setRange(saved.range);
            setMessage(saved.message);
          }}
        >
          Discard
        </Button>
        <Button
          disabled={!dirty || (enabled && !range?.to)}
          onClick={() => {
            setSaved({ enabled, range, message });
            setJustSaved(true);
          }}
        >
          Save changes
        </Button>
      </div>
    </section>
  );
}
