"use client";

import * as React from "react";
import { Clock } from "lucide-react";

import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";

// First bookable slot of the day, in minutes after midnight (9:00 AM).
const DAY_START = 9 * 60;
const DAY_END = 17 * 60;

const minutes = {
  style: "unit",
  unit: "minute",
  unitDisplay: "short",
} as const;

function formatTime(total: number) {
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${mins.toString().padStart(2, "0")} ${suffix}`;
}

function MinutesField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <NumberField
      id={id}
      value={value}
      onValueChange={(next) => onChange(next ?? min)}
      min={min}
      max={max}
      step={step}
      smallStep={5}
      format={minutes}
      className="gap-1.5"
    >
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <NumberFieldGroup className="w-full">
        <NumberFieldDecrement />
        <NumberFieldInput className="w-full min-w-0 flex-1" />
        <NumberFieldIncrement />
      </NumberFieldGroup>
    </NumberField>
  );
}

export default function NumberField12() {
  const [duration, setDuration] = React.useState(45);
  const [before, setBefore] = React.useState(10);
  const [after, setAfter] = React.useState(15);

  const block = before + duration + after;
  const slotsPerDay = Math.floor((DAY_END - DAY_START) / block);
  const meetingStart = DAY_START + before;

  return (
    <section
      aria-labelledby="number-field-12-title"
      className="grid w-full max-w-md gap-5 rounded-xl border bg-card p-5 text-card-foreground"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Clock aria-hidden="true" className="size-4 text-muted-foreground" />
        </span>
        <div className="grid gap-0.5">
          <h3 id="number-field-12-title" className="font-semibold">
            Intro call
          </h3>
          <p className="text-sm text-muted-foreground">
            Set how long the meeting runs and the breathing room around it.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MinutesField
          id="number-field-12-before"
          label="Buffer before"
          value={before}
          onChange={setBefore}
          min={0}
          max={60}
          step={5}
        />
        <MinutesField
          id="number-field-12-duration"
          label="Duration"
          value={duration}
          onChange={setDuration}
          min={15}
          max={240}
          step={15}
        />
        <MinutesField
          id="number-field-12-after"
          label="Buffer after"
          value={after}
          onChange={setAfter}
          min={0}
          max={60}
          step={5}
        />
      </div>

      <div className="grid gap-2">
        <div
          className="flex h-10 overflow-hidden rounded-md border"
          role="img"
          aria-label={`${before} minute buffer, ${duration} minute meeting, ${after} minute buffer`}
        >
          {before > 0 ? (
            <div
              className="bg-[repeating-linear-gradient(135deg,var(--muted)_0_6px,transparent_6px_12px)] transition-[flex-grow] duration-300 ease-out"
              style={{ flexGrow: before }}
            />
          ) : null}
          <div
            className="flex min-w-0 items-center justify-center bg-primary px-2 text-xs font-medium text-primary-foreground transition-[flex-grow] duration-300 ease-out"
            style={{ flexGrow: duration }}
          >
            <span className="truncate tabular-nums">
              {formatTime(meetingStart)} –{" "}
              {formatTime(meetingStart + duration)}
            </span>
          </div>
          {after > 0 ? (
            <div
              className="bg-[repeating-linear-gradient(135deg,var(--muted)_0_6px,transparent_6px_12px)] transition-[flex-grow] duration-300 ease-out"
              style={{ flexGrow: after }}
            />
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Each booking blocks {block} minutes, so invitees can pick from{" "}
          <span className="font-medium text-foreground tabular-nums">
            {slotsPerDay} {slotsPerDay === 1 ? "slot" : "slots"}
          </span>{" "}
          between {formatTime(DAY_START)} and {formatTime(DAY_END)}.
        </p>
      </div>
    </section>
  );
}
