"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";

const presets = [1, 5, 15, 50];

const plans = [
  {
    name: "Solo",
    upTo: 1,
    perks: ["Unlimited projects", "7-day version history"],
  },
  {
    name: "Team",
    upTo: 20,
    perks: ["Shared workspaces", "Guest access", "90-day version history"],
  },
  {
    name: "Business",
    upTo: Number.POSITIVE_INFINITY,
    perks: ["SAML single sign-on", "Audit log", "Unlimited version history"],
  },
];

export default function NumberField13() {
  const [teamSize, setTeamSize] = React.useState(5);

  const plan =
    plans.find((candidate) => teamSize <= candidate.upTo) ?? plans[0];

  return (
    <section
      aria-labelledby="number-field-13-title"
      className="grid w-full max-w-sm gap-6 rounded-xl border bg-card p-6 text-card-foreground"
    >
      <div className="grid gap-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1 flex-1 rounded-full bg-primary" />
          <span className="h-1 flex-1 rounded-full bg-primary" />
          <span className="h-1 flex-1 rounded-full bg-muted" />
        </div>
        <p className="text-xs text-muted-foreground">Step 2 of 3</p>
        <h3
          id="number-field-13-title"
          className="text-xl font-semibold text-balance"
        >
          How many people will use your workspace?
        </h3>
        <p className="text-sm text-muted-foreground">
          A rough guess is fine. You can add or remove seats any time.
        </p>
      </div>

      <div className="grid justify-items-center gap-3">
        <NumberField
          value={teamSize}
          onValueChange={(value) => setTeamSize(value ?? 1)}
          min={1}
          max={500}
          largeStep={10}
        >
          <NumberFieldGroup className="h-14 rounded-xl">
            <NumberFieldDecrement className="w-14 [&_svg]:size-5" />
            <NumberFieldInput
              aria-label="Team size"
              className="w-24 text-2xl font-semibold"
            />
            <NumberFieldIncrement className="w-14 [&_svg]:size-5" />
          </NumberFieldGroup>
        </NumberField>
        <fieldset className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:justify-center">
          <legend className="sr-only">Common team sizes</legend>
          {presets.map((preset) => (
            <Button
              key={preset}
              size="xs"
              variant={teamSize === preset ? "secondary" : "ghost"}
              aria-pressed={teamSize === preset}
              onClick={() => setTeamSize(preset)}
            >
              {preset === 1 ? "Just me" : `${preset} people`}
            </Button>
          ))}
        </fieldset>
      </div>

      <div
        className="grid gap-2 rounded-lg border border-dashed p-4"
        aria-live="polite"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Suggested plan</span>
          <Badge variant="secondary">{plan.name}</Badge>
        </div>
        <ul className="grid gap-1.5 text-sm text-muted-foreground">
          {plan.perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2">
              <Check aria-hidden="true" className="size-3.5 text-foreground" />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-between gap-2">
        <Button variant="ghost">
          <ArrowLeft aria-hidden="true" data-icon="inline-start" />
          Back
        </Button>
        <Button>
          Continue
          <ArrowRight aria-hidden="true" data-icon="inline-end" />
        </Button>
      </div>
    </section>
  );
}
