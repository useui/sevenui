"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";
import { Separator } from "@/registry/base/ui/separator";
import { Switch } from "@/registry/base/ui/switch";

const MONTHLY_QUOTA = 2_000_000;
const CURRENT_USAGE = 1_240_000;

const percent = { style: "unit", unit: "percent" } as const;
const compact = new Intl.NumberFormat("en-US", { notation: "compact" });

export default function NumberField11() {
  const [enabled, setEnabled] = React.useState(true);
  const [warning, setWarning] = React.useState(75);
  const [critical, setCritical] = React.useState(90);
  const [repeatHours, setRepeatHours] = React.useState(6);
  const [saved, setSaved] = React.useState({
    enabled: true,
    warning: 75,
    critical: 90,
    repeatHours: 6,
  });
  const [justSaved, setJustSaved] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const dirty =
    saved.enabled !== enabled ||
    saved.warning !== warning ||
    saved.critical !== critical ||
    saved.repeatHours !== repeatHours;

  function save() {
    setSaved({ enabled, warning, critical, repeatHours });
    setJustSaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustSaved(false), 2500);
  }

  const usage = (CURRENT_USAGE / MONTHLY_QUOTA) * 100;

  return (
    <section
      aria-labelledby="number-field-11-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="grid gap-1">
          <h3 id="number-field-11-title" className="font-semibold">
            API usage alerts
          </h3>
          <p className="text-sm text-muted-foreground">
            Email the billing owners before you hit the monthly request quota.
          </p>
        </div>
        <Switch
          aria-label="Enable usage alerts"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>

      <div className="px-5">
        <div
          className="relative h-2 overflow-hidden rounded-full bg-muted"
          role="img"
          aria-label={`Current usage ${Math.round(usage)}% of quota, warning at ${warning}%, critical at ${critical}%`}
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${usage}%` }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-y-0 w-0.5 bg-warning"
            style={{ left: `calc(${warning}% - 1px)` }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-y-0 w-0.5 bg-destructive"
            style={{ left: `min(calc(${critical}% - 1px), calc(100% - 2px))` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground tabular-nums">
          {compact.format(CURRENT_USAGE)} of{" "}
          {compact.format(MONTHLY_QUOTA)} requests used this month
        </p>
      </div>

      <Separator className="mt-5" />

      <fieldset
        disabled={!enabled}
        className="grid gap-4 p-5 disabled:opacity-60"
      >
        <legend className="sr-only">Alert thresholds</legend>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Label htmlFor="number-field-11-warning" className="gap-2">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-warning"
            />
            Warning at
          </Label>
          <NumberField
            id="number-field-11-warning"
            value={warning}
            onValueChange={(value) => setWarning(value ?? 50)}
            min={50}
            max={critical - 5}
            step={5}
            format={percent}
            disabled={!enabled}
            className="shrink-0"
          >
            <NumberFieldGroup>
              <NumberFieldDecrement />
              <NumberFieldInput className="w-16" />
              <NumberFieldIncrement />
            </NumberFieldGroup>
          </NumberField>
        </div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Label htmlFor="number-field-11-critical" className="gap-2">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-destructive"
            />
            Critical at
          </Label>
          <NumberField
            id="number-field-11-critical"
            value={critical}
            onValueChange={(value) => setCritical(value ?? 100)}
            min={warning + 5}
            max={100}
            step={5}
            format={percent}
            disabled={!enabled}
            className="shrink-0"
          >
            <NumberFieldGroup>
              <NumberFieldDecrement />
              <NumberFieldInput className="w-16" />
              <NumberFieldIncrement />
            </NumberFieldGroup>
          </NumberField>
        </div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="grid gap-1">
            <Label htmlFor="number-field-11-repeat">Remind every</Label>
            <p
              id="number-field-11-repeat-hint"
              className="text-xs text-muted-foreground"
            >
              Hours between repeat emails
            </p>
          </div>
          <NumberField
            id="number-field-11-repeat"
            value={repeatHours}
            onValueChange={(value) => setRepeatHours(value ?? 1)}
            min={1}
            max={72}
            disabled={!enabled}
            className="shrink-0"
          >
            <NumberFieldGroup>
              <NumberFieldDecrement />
              <NumberFieldInput
                aria-describedby="number-field-11-repeat-hint"
                className="w-16"
              />
              <NumberFieldIncrement />
            </NumberFieldGroup>
          </NumberField>
        </div>
      </fieldset>

      <div className="flex items-center justify-end gap-3 border-t px-5 py-4">
        <p
          aria-live="polite"
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          {dirty ? (
            "Unsaved changes"
          ) : justSaved ? (
            <>
              <Check aria-hidden="true" className="size-3.5 text-success" />
              Alerts saved
            </>
          ) : null}
        </p>
        <Button disabled={!dirty} onClick={save}>
          Save alerts
        </Button>
      </div>
    </section>
  );
}
