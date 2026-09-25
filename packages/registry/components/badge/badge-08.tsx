"use client";

import { Check, Plus } from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Mode = "single" | "multiple";

const areas = [
  { value: "dashboard", label: "Dashboard" },
  { value: "api", label: "API" },
  { value: "billing", label: "Billing" },
  { value: "integrations", label: "Integrations" },
  { value: "mobile", label: "Mobile" },
];

const modes: { value: Mode; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "multiple", label: "Multiple" },
];

export default function Badge08() {
  const [mode, setMode] = React.useState<Mode>("multiple");
  const [selected, setSelected] = React.useState<string[]>(["api", "billing"]);
  const groupId = React.useId();

  function toggle(value: string) {
    setSelected((current) => {
      const isSelected = current.includes(value);
      if (mode === "single") return isSelected ? [] : [value];
      return isSelected
        ? current.filter((item) => item !== value)
        : [...current, value];
    });
  }

  function changeMode(next: Mode) {
    setMode(next);
    if (next === "single") setSelected((current) => current.slice(0, 1));
  }

  const summary =
    selected.length === 0
      ? "Showing every area"
      : `Showing ${areas
          .filter((area) => selected.includes(area.value))
          .map((area) => area.label)
          .join(", ")}`;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p id={groupId} className="text-sm font-medium">
          Release notes by area
        </p>
        <ToggleGroup
          aria-label="Selection mode"
          variant="outline"
          size="sm"
          spacing={0}
          value={[mode]}
          onValueChange={(next) => {
            if (next.length === 0) return;
            changeMode(next[0] as Mode);
          }}
        >
          {modes.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              className="h-6 px-2 text-xs aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <fieldset
        aria-labelledby={groupId}
        className="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0"
      >
        {areas.map((area) => {
          const isSelected = selected.includes(area.value);
          const Indicator = isSelected ? Check : Plus;
          return (
            <Badge
              key={area.value}
              variant={isSelected ? "default" : "outline"}
              render={<button type="button" aria-pressed={isSelected} />}
              onClick={() => toggle(area.value)}
              className="h-7 cursor-pointer gap-1.5 px-3 text-sm outline-none has-data-[icon=inline-start]:pl-2.5 not-aria-pressed:border-dashed not-aria-pressed:text-muted-foreground not-aria-pressed:hover:border-solid not-aria-pressed:hover:bg-muted not-aria-pressed:hover:text-foreground aria-pressed:hover:bg-primary/85"
            >
              <Indicator aria-hidden="true" data-icon="inline-start" />
              {area.label}
            </Badge>
          );
        })}
      </fieldset>
      <p aria-live="polite" className="text-xs text-muted-foreground">
        {summary}
        {mode === "single" ? " (one at a time)" : null}
      </p>
    </div>
  );
}
