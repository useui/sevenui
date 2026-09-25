"use client";

import * as React from "react";
import { CalendarCheckIcon, CalendarClockIcon, CheckIcon } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const requested = "2:00 PM";

const openSlots = ["3:30 PM", "4:00 PM", "4:30 PM"];

export default function Alert15() {
  const [time, setTime] = React.useState(requested);
  const [sent, setSent] = React.useState(false);
  const conflict = time === requested;

  return (
    <section
      aria-labelledby="alert-15-heading"
      className="grid w-full max-w-md gap-4 rounded-xl border bg-card p-4"
    >
      <div className="grid gap-1">
        <h3 id="alert-15-heading" className="font-medium">
          Quarterly roadmap sync
        </h3>
        <p className="text-sm text-muted-foreground">
          Tuesday, Oct 7 · 45 min · 6 guests
        </p>
      </div>
      <div aria-live="polite">
        {conflict ? (
          <Alert variant="destructive">
            <CalendarClockIcon aria-hidden="true" />
            <AlertTitle>3 guests are busy at {requested}</AlertTitle>
            <AlertDescription>
              Dana, Marcus, and Ines have “Design review” until 3:00&nbsp;PM. Pick a
              time when everyone is free.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CalendarCheckIcon aria-hidden="true" className="text-success!" />
            <AlertTitle>
              {sent ? `Invite sent for ${time}` : `Everyone is free at ${time}`}
            </AlertTitle>
            <AlertDescription>
              {sent
                ? "All 6 guests got an email. Pick another time to send an update."
                : "All 6 guests accepted similar slots this week."}
            </AlertDescription>
          </Alert>
        )}
      </div>
      <div className="grid gap-2">
        <p id="alert-15-slots" className="text-sm font-medium">
          Start time
        </p>
        <ToggleGroup
          aria-labelledby="alert-15-slots"
          variant="outline"
          size="sm"
          className="flex-wrap"
          value={[time]}
          onValueChange={(value) => {
            if (!value[0] || value[0] === time) return;
            setTime(value[0] as string);
            setSent(false);
          }}
        >
          {[requested, ...openSlots].map((slot) => (
            <ToggleGroupItem
              key={slot}
              value={slot}
              className="tabular-nums"
            >
              {slot}
              {slot === requested ? (
                <span className="sr-only"> (conflict)</span>
              ) : null}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <Button disabled={conflict || sent} onClick={() => setSent(true)}>
        {sent ? (
          <>
            <CheckIcon aria-hidden="true" data-icon="inline-start" />
            Invite sent
          </>
        ) : (
          "Send invite"
        )}
      </Button>
    </section>
  );
}
