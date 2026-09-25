"use client";

import { useState } from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/registry/base/ui/field";

const LIMIT = 3;

const widgets = [
  { id: "revenue", label: "Net revenue", hint: "Daily, in USD" },
  { id: "activeUsers", label: "Active users", hint: "Rolling 7 days" },
  { id: "churn", label: "Churn rate", hint: "Monthly cohort" },
  { id: "supportQueue", label: "Support queue", hint: "Open tickets" },
  { id: "deploys", label: "Deploy frequency", hint: "Per service" },
  { id: "errorBudget", label: "Error budget", hint: "SLO remaining" },
];

export default function Field05() {
  const [selected, setSelected] = useState<string[]>(["revenue", "churn"]);
  const atLimit = selected.length >= LIMIT;

  const toggle = (id: string, checked: boolean) => {
    setSelected((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id),
    );
  };

  return (
    <FieldSet className="w-full max-w-md gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <FieldLegend variant="label" className="mb-0">
            Pinned widgets
          </FieldLegend>
          <p className="text-sm text-muted-foreground">
            Choose up to {LIMIT} for the top of your dashboard.
          </p>
        </div>
        <Badge
          variant={atLimit ? "default" : "secondary"}
          className="tabular-nums"
          aria-live="polite"
        >
          {selected.length}/{LIMIT}
        </Badge>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {widgets.map((widget) => {
          const checked = selected.includes(widget.id);
          return (
            <Field
              key={widget.id}
              name={widget.id}
              orientation="horizontal"
              disabled={atLimit && !checked}
              className="rounded-lg border border-border px-3 py-2.5 transition-colors has-data-checked:border-primary/30 has-data-checked:bg-primary/5 data-disabled:bg-muted/40 dark:has-data-checked:bg-primary/10"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(value) => toggle(widget.id, value)}
              />
              <FieldContent>
                <FieldLabel>{widget.label}</FieldLabel>
                <FieldDescription className="text-xs">
                  {widget.hint}
                </FieldDescription>
              </FieldContent>
            </Field>
          );
        })}
      </div>
    </FieldSet>
  );
}
