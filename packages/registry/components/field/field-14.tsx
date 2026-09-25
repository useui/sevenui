"use client";

import { useState } from "react";
import { BellRingIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";
import { Slider } from "@/registry/base/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type MetricKey = "error-rate" | "p95-latency" | "checkout-conversion";

const metrics: Record<
  MetricKey,
  { label: string; unit: string; max: number; step: number; history: number[] }
> = {
  "error-rate": {
    label: "API error rate",
    unit: "%",
    max: 10,
    step: 0.1,
    history: [
      1.2, 0.9, 1.4, 2.8, 1.1, 0.8, 1.0, 3.6, 4.2, 1.3, 0.9, 1.1, 2.2, 1.0,
    ],
  },
  "p95-latency": {
    label: "p95 latency",
    unit: "ms",
    max: 1200,
    step: 10,
    history: [
      310, 290, 340, 620, 410, 380, 300, 290, 880, 450, 330, 310, 720, 350,
    ],
  },
  "checkout-conversion": {
    label: "Checkout conversion",
    unit: "%",
    max: 10,
    step: 0.1,
    history: [
      4.1, 4.3, 3.9, 4.4, 2.6, 4.0, 4.2, 4.5, 3.1, 4.4, 4.6, 4.2, 2.9, 4.3,
    ],
  },
};

const metricItems = (Object.keys(metrics) as MetricKey[]).map((key) => ({
  value: key,
  label: metrics[key].label,
}));

const channels = [
  { id: "slack", label: "Slack", detail: "#ops-alerts" },
  { id: "email", label: "Email", detail: "on-call@northwind.io" },
  { id: "pager", label: "PagerDuty", detail: "Checkout rotation" },
];

const defaults: Record<
  MetricKey,
  { direction: "above" | "below"; threshold: number }
> = {
  "error-rate": { direction: "above", threshold: 2.5 },
  "p95-latency": { direction: "above", threshold: 600 },
  "checkout-conversion": { direction: "below", threshold: 3.5 },
};

export default function Field14() {
  const [metricKey, setMetricKey] = useState<MetricKey>("error-rate");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [threshold, setThreshold] = useState(2.5);
  const [draft, setDraft] = useState("2.5");
  const [enabledChannels, setEnabledChannels] = useState<string[]>(["slack"]);
  const [saved, setSaved] = useState(false);

  const metric = metrics[metricKey];
  const peak = Math.max(...metric.history, threshold) * 1.1;
  const breaches = metric.history.filter((value) =>
    direction === "above" ? value > threshold : value < threshold,
  ).length;

  function applyThreshold(value: number) {
    const clamped = Math.min(Math.max(value, 0), metric.max);
    const rounded = Math.round(clamped / metric.step) * metric.step;
    const fixed = Number(rounded.toFixed(metric.step < 1 ? 1 : 0));
    setThreshold(fixed);
    setDraft(String(fixed));
    setSaved(false);
  }

  return (
    <form
      className="w-full max-w-lg rounded-xl border border-border bg-card"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <BellRingIcon
          aria-hidden="true"
          className="size-4 text-muted-foreground"
        />
        <h3 className="font-semibold">Alert rule</h3>
      </div>

      <FieldGroup className="gap-5 p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <Field>
            <FieldLabel>Metric</FieldLabel>
            <Select
              items={metricItems}
              value={metricKey}
              onValueChange={(value) => {
                if (!value) return;
                const key = value as MetricKey;
                setMetricKey(key);
                setDirection(defaults[key].direction);
                setThreshold(defaults[key].threshold);
                setDraft(String(defaults[key].threshold));
                setSaved(false);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <FieldSet>
            <FieldLegend variant="label" className="mb-0">
              Fire when
            </FieldLegend>
            <ToggleGroup
              value={[direction]}
              onValueChange={(value) => {
                const next = (value as string[])[0];
                if (next === "above" || next === "below") {
                  setDirection(next);
                  setSaved(false);
                }
              }}
              variant="outline"
              spacing={0}
            >
              <ToggleGroupItem value="above" className="aria-pressed:bg-muted">
                Above
              </ToggleGroupItem>
              <ToggleGroupItem value="below" className="aria-pressed:bg-muted">
                Below
              </ToggleGroupItem>
            </ToggleGroup>
          </FieldSet>
        </div>

        <div className="flex flex-col gap-3">
          <Field orientation="horizontal" className="justify-between gap-3">
            <FieldLabel>Threshold</FieldLabel>
            <InputGroup className="w-28">
              <InputGroupInput
                inputMode="decimal"
                value={draft}
                className="text-right tabular-nums"
                onChange={(event) => setDraft(event.target.value)}
                onBlur={() => {
                  const parsed = Number.parseFloat(draft);
                  applyThreshold(Number.isNaN(parsed) ? threshold : parsed);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.currentTarget.blur();
                  }
                }}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>{metric.unit}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel className="sr-only">
              Threshold slider, in {metric.unit}
            </FieldLabel>
            <Slider
              value={threshold}
              min={0}
              max={metric.max}
              step={metric.step}
              onValueChange={(value) =>
                applyThreshold(Array.isArray(value) ? (value[0] ?? 0) : value)
              }
            />
          </Field>
        </div>

        <figure className="flex flex-col gap-2">
          <div
            role="img"
            aria-label={`${metric.label} over the last 14 days, with ${breaches} days crossing the threshold`}
            className="relative flex h-24 items-end gap-1 rounded-lg bg-muted/50 px-2 pt-2"
          >
            {metric.history.map((value, index) => {
              const breached =
                direction === "above" ? value > threshold : value < threshold;
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length daily series
                  key={index}
                  className={
                    breached
                      ? "flex-1 rounded-t-sm bg-destructive transition-[height,background-color] duration-300 ease-out"
                      : "flex-1 rounded-t-sm bg-chart-2/60 transition-[height,background-color] duration-300 ease-out"
                  }
                  style={{ height: `${(value / peak) * 100}%` }}
                />
              );
            })}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-foreground/60 transition-[bottom] duration-300 ease-out"
              style={{ bottom: `${(threshold / peak) * 100}%` }}
            />
          </div>
          <figcaption
            aria-live="polite"
            className="text-sm text-muted-foreground"
          >
            {breaches === 0 ? (
              "This rule wouldn't have fired in the last 14 days."
            ) : (
              <>
                Would have fired on{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {breaches} of 14
                </span>{" "}
                days.
                {breaches > 5
                  ? " That's noisy. Consider a looser threshold."
                  : ""}
              </>
            )}
          </figcaption>
        </figure>

        <FieldSet>
          <FieldLegend variant="label">Notify</FieldLegend>
          <FieldGroup className="gap-3">
            {channels.map((channel) => (
              <Field key={channel.id} orientation="horizontal">
                <Checkbox
                  checked={enabledChannels.includes(channel.id)}
                  onCheckedChange={(checked) => {
                    setEnabledChannels((current) =>
                      checked
                        ? [...current, channel.id]
                        : current.filter((id) => id !== channel.id),
                    );
                    setSaved(false);
                  }}
                />
                <FieldContent className="flex-row flex-wrap items-baseline gap-x-2">
                  <FieldLabel>{channel.label}</FieldLabel>
                  <FieldDescription className="text-xs">
                    {channel.detail}
                  </FieldDescription>
                </FieldContent>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {saved
            ? "Rule saved and active."
            : enabledChannels.length === 0
              ? "Choose at least one channel."
              : "Checks every 5 minutes."}
        </p>
        <Button type="submit" disabled={enabledChannels.length === 0 || saved}>
          {saved ? "Saved" : "Save rule"}
        </Button>
      </div>
    </form>
  );
}
