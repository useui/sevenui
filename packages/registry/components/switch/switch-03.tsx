"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const rules = [
  {
    name: "instantBook",
    label: "Instant Book",
    description: "Guests who meet your requirements can book without a request.",
    defaultChecked: true,
  },
  {
    name: "pets",
    label: "Pets allowed",
    description: "Up to two pets. A $40 cleaning fee is added per stay.",
    defaultChecked: false,
  },
  {
    name: "selfCheckIn",
    label: "Self check-in",
    description: "Guests get the lockbox code 24 hours before arrival.",
    defaultChecked: true,
  },
];

export default function Switch03() {
  const [payload, setPayload] = React.useState<string | null>(null);
  // Remounting the rows restores every defaultChecked value.
  const [resetKey, setResetKey] = React.useState(0);

  function handleReset() {
    setPayload(null);
    setResetKey((key) => key + 1);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setPayload(JSON.stringify(data, null, 2));
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby="switch-03-title"
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <div className="flex flex-col gap-1">
        <h3 id="switch-03-title" className="font-medium">
          House rules
        </h3>
        <p className="text-sm text-muted-foreground">Loft on Alder Street · 2 guests</p>
      </div>

      <div key={resetKey} className="flex flex-col gap-3">
        {rules.map((rule) => {
          const id = `switch-03-${rule.name}`;
          return (
            <div key={rule.name} className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor={id}>{rule.label}</Label>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {rule.description}
                </span>
              </div>
              {/* Each switch posts "yes" or "no" under its name, so the form works without state. */}
              <Switch
                id={id}
                name={rule.name}
                value="yes"
                uncheckedValue="no"
                defaultChecked={rule.defaultChecked}
                className="mt-0.5"
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
          Reset
        </Button>
        <Button type="submit" size="sm">
          Save rules
        </Button>
      </div>

      <output
        htmlFor={rules.map((rule) => `switch-03-${rule.name}`).join(" ")}
        aria-live="polite"
        className="block"
      >
        {payload ? (
          <span className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Submitted form data</span>
            <pre className="overflow-x-auto rounded-lg bg-muted px-3 py-2 font-mono text-xs leading-relaxed">
              {payload}
            </pre>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Save to see the values this form sends.
          </span>
        )}
      </output>
    </form>
  );
}
