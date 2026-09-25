"use client";

import { useId, useState } from "react";
import { CalendarClockIcon, MailIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Frequency = "daily" | "weekly" | "monthly";

const frequencies: { value: Frequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const formats = [
  { value: "pdf", label: "PDF summary", hint: "Charts and top-line numbers" },
  { value: "csv", label: "CSV export", hint: "Raw rows for spreadsheets" },
];

// A fixed "today" keeps the preview deterministic: Friday, September 25, 2026.
const today = new Date(2026, 8, 25);
const maxRecipients = 8;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function nextDelivery(frequency: Frequency, weekday: number, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(today);
  if (frequency === "daily") {
    next.setDate(next.getDate() + 1);
  } else if (frequency === "weekly") {
    const offset = (weekday - next.getDay() + 7) % 7 || 7;
    next.setDate(next.getDate() + offset);
  } else {
    next.setMonth(next.getMonth() + 1, 1);
  }
  next.setHours(hours || 0, minutes || 0);
  return next.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function parseRecipients(value: unknown) {
  return String(value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function Form11() {
  const reportId = useId();
  const weekdayId = useId();
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [weekday, setWeekday] = useState(1);
  const [time, setTime] = useState("09:00");
  const [format, setFormat] = useState("pdf");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  return (
    <Form
      className="w-full max-w-lg gap-0 overflow-hidden rounded-xl border border-border bg-card"
      onChange={() => setConfirmation(null)}
      onFormSubmit={(values) => {
        const count = parseRecipients(values.recipients).length;
        setConfirmation(
          `Scheduled. ${count} ${count === 1 ? "person gets" : "people get"} the first report ${nextDelivery(frequency, weekday, time)}.`,
        );
      }}
    >
      <div className="flex flex-col gap-1 border-b border-border p-5">
        <h3 className="font-semibold">Schedule email delivery</h3>
        <p className="text-sm text-muted-foreground">
          Send a snapshot of this dashboard to your team on a regular cadence.
        </p>
      </div>

      <FieldGroup className="gap-5 p-5">
        <Field>
          <FieldLabel htmlFor={reportId}>Report</FieldLabel>
          <NativeSelect
            id={reportId}
            className="w-full"
            defaultValue="revenue"
          >
            <NativeSelectOption value="revenue">
              Revenue overview
            </NativeSelectOption>
            <NativeSelectOption value="retention">
              Cohort retention
            </NativeSelectOption>
            <NativeSelectOption value="funnel">
              Signup funnel
            </NativeSelectOption>
          </NativeSelect>
        </Field>

        <FieldSet>
          <FieldLegend variant="label">Frequency</FieldLegend>
          <ToggleGroup
            variant="outline"
            spacing={0}
            value={[frequency]}
            onValueChange={(value) => {
              const next = (value as Frequency[])[0];
              if (next) setFrequency(next);
              setConfirmation(null);
            }}
            className="w-full"
          >
            {frequencies.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="flex-1"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FieldSet>

        <div className="grid gap-4 sm:grid-cols-2">
          {frequency === "weekly" ? (
            <Field>
              <FieldLabel htmlFor={weekdayId}>Day</FieldLabel>
              <NativeSelect
                id={weekdayId}
                className="w-full"
                value={weekday}
                onChange={(event) => setWeekday(Number(event.target.value))}
              >
                {weekdays.map((day, index) => (
                  <NativeSelectOption key={day} value={index}>
                    {day}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          ) : (
            <Field>
              <FieldLabel htmlFor={weekdayId}>Day</FieldLabel>
              <Input
                id={weekdayId}
                readOnly
                value={
                  frequency === "daily" ? "Every day" : "1st of the month"
                }
                className="text-muted-foreground"
              />
            </Field>
          )}
          <Field name="deliverAt">
            <FieldLabel>Time (CET)</FieldLabel>
            <Input
              required
              type="time"
              step={900}
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
            <FieldError />
          </Field>
        </div>

        <Field
          name="recipients"
          validate={(value) => {
            const list = parseRecipients(value);
            if (list.length === 0) return "Add at least one recipient.";
            const invalid = list.find((entry) => !emailPattern.test(entry));
            if (invalid) return `"${invalid}" isn't a valid email address.`;
            if (list.length > maxRecipients) {
              return `Scheduled reports go to ${maxRecipients} people at most.`;
            }
            return null;
          }}
        >
          <FieldLabel>Recipients</FieldLabel>
          <Input
            type="text"
            inputMode="email"
            spellCheck={false}
            defaultValue="lena@acme.io, tomas@acme.io"
          />
          <FieldDescription>
            Separate addresses with commas. People outside Acme get a view-only
            link.
          </FieldDescription>
          <FieldError />
        </Field>

        <FieldSet>
          <FieldLegend variant="label">Attachment</FieldLegend>
          <RadioGroup
            value={format}
            onValueChange={(value) => setFormat(value as string)}
            className="grid-cols-1 sm:grid-cols-2"
          >
            {formats.map((option) => (
              <Label
                key={option.value}
                className="items-start rounded-lg border border-border p-3 font-normal has-data-checked:border-primary/40 has-data-checked:bg-primary/5"
              >
                <RadioGroupItem value={option.value} className="mt-0.5" />
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.hint}
                  </span>
                </span>
              </Label>
            ))}
          </RadioGroup>
        </FieldSet>
      </FieldGroup>

      <div className="flex flex-col gap-3 border-t border-border bg-muted/40 px-5 py-3 sm:flex-row sm:items-center">
        <p
          role="status"
          className="flex items-start gap-2 text-sm text-muted-foreground sm:mr-auto"
        >
          {confirmation ? (
            <MailIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CalendarClockIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
          )}
          <span>
            {confirmation ??
              `Next: ${nextDelivery(frequency, weekday, time)}`}
          </span>
        </p>
        <Button type="submit" className="shrink-0">
          Schedule report
        </Button>
      </div>
    </Form>
  );
}
