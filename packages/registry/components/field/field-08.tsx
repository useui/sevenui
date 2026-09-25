"use client";

import { useState } from "react";
import { MoonIcon } from "lucide-react";

import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Switch } from "@/registry/base/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const days = [
  { value: "mon", short: "M", label: "Monday" },
  { value: "tue", short: "T", label: "Tuesday" },
  { value: "wed", short: "W", label: "Wednesday" },
  { value: "thu", short: "T", label: "Thursday" },
  { value: "fri", short: "F", label: "Friday" },
  { value: "sat", short: "S", label: "Saturday" },
  { value: "sun", short: "S", label: "Sunday" },
];

function describeDays(selected: string[]) {
  if (selected.length === 7) return "every day";
  if (selected.length === 0) return "no days";
  const weekdays = ["mon", "tue", "wed", "thu", "fri"];
  if (
    selected.length === 5 &&
    weekdays.every((day) => selected.includes(day))
  ) {
    return "weekdays";
  }
  return `${selected.length} days a week`;
}

export default function Field08() {
  const [enabled, setEnabled] = useState(true);
  const [from, setFrom] = useState("22:00");
  const [to, setTo] = useState("07:30");
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
  ]);
  const [allowUrgent, setAllowUrgent] = useState(true);

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-4 sm:p-5">
      <FieldGroup>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel>Quiet hours</FieldLabel>
            <FieldDescription>
              Pause push and desktop notifications while you're off.
            </FieldDescription>
          </FieldContent>
          <Switch
            checked={enabled}
            onCheckedChange={(checked) => setEnabled(checked)}
          />
        </Field>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))] gap-3">
          <Field disabled={!enabled}>
            <FieldLabel>From</FieldLabel>
            <Input
              type="time"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </Field>
          <Field disabled={!enabled}>
            <FieldLabel>Until</FieldLabel>
            <Input
              type="time"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </Field>
        </div>

        <FieldSet disabled={!enabled} className="disabled:opacity-50">
          <FieldLegend variant="label">Repeat on</FieldLegend>
          <ToggleGroup
            multiple
            variant="outline"
            spacing={1}
            value={selectedDays}
            onValueChange={(value) => setSelectedDays(value as string[])}
            disabled={!enabled}
            className="w-full"
          >
            {days.map((day) => (
              <ToggleGroupItem
                key={day.value}
                value={day.value}
                aria-label={day.label}
                className="min-w-0 flex-1 px-0 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
              >
                {day.short}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FieldSet>

        <Field orientation="horizontal" disabled={!enabled}>
          <Checkbox
            checked={allowUrgent}
            onCheckedChange={(checked) => setAllowUrgent(checked)}
          />
          <FieldContent>
            <FieldLabel>Let urgent mentions through</FieldLabel>
            <FieldDescription>
              Direct messages marked urgent and on-call pages still notify you.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>

      <p
        aria-live="polite"
        className="mt-5 flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground"
      >
        <MoonIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        {enabled ? (
          <span>
            Muted{" "}
            <span className="font-medium text-foreground tabular-nums">
              {from}–{to}
            </span>
            , {describeDays(selectedDays)}.
            {allowUrgent ? " Urgent mentions still ring." : ""}
          </span>
        ) : (
          <span>Notifications arrive at any time.</span>
        )}
      </p>
    </div>
  );
}
