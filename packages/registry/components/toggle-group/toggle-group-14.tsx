"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bug,
  CircleCheck,
  Megaphone,
  Rocket,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Progress } from "@/registry/base/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const goals = [
  {
    value: "roadmap",
    title: "Plan the roadmap",
    description: "Prioritize initiatives by quarter.",
    icon: Rocket,
  },
  {
    value: "bugs",
    title: "Triage bugs",
    description: "Route reports to the right owner.",
    icon: Bug,
  },
  {
    value: "launches",
    title: "Coordinate launches",
    description: "Align product, sales, and support.",
    icon: Megaphone,
  },
  {
    value: "metrics",
    title: "Track outcomes",
    description: "Tie shipped work to adoption.",
    icon: BarChart3,
  },
];

const teamSizes = ["Just me", "2-10", "11-50", "51+"];

export default function ToggleGroup14() {
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([
    "roadmap",
  ]);
  const [teamSize, setTeamSize] = React.useState<string[]>([]);
  const canContinue = selectedGoals.length > 0 && teamSize.length > 0;

  return (
    <div className="flex w-full max-w-lg flex-col gap-6 rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6">
      <Progress value={66} aria-label="Setup progress, step 2 of 3" />

      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground tabular-nums">Step 2 of 3</p>
        <h3 id="toggle-group-14-goals" className="text-lg font-semibold tracking-tight">
          What will your workspace be for?
        </h3>
        <p className="text-sm text-muted-foreground">
          Pick all that apply. We will set up views and templates to match.
        </p>
      </div>

      <ToggleGroup
        multiple
        aria-labelledby="toggle-group-14-goals"
        variant="outline"
        spacing={2}
        value={selectedGoals}
        onValueChange={setSelectedGoals}
        className="grid w-full grid-cols-1 items-stretch sm:grid-cols-2"
      >
        {goals.map((goal) => (
          <ToggleGroupItem
            key={goal.value}
            value={goal.value}
            className="group/goal relative h-auto items-start justify-start gap-3 rounded-xl! p-3 text-left whitespace-normal aria-pressed:border-primary aria-pressed:bg-primary/5 aria-pressed:ring-1 aria-pressed:ring-primary"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted group-aria-pressed/goal:bg-primary group-aria-pressed/goal:text-primary-foreground">
              <goal.icon aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5 pr-5">
              <span className="text-sm font-medium">{goal.title}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {goal.description}
              </span>
            </span>
            <CircleCheck
              className="absolute top-3 right-3 size-4! text-primary opacity-0 transition-opacity group-aria-pressed/goal:opacity-100 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="flex flex-col gap-2">
        <span id="toggle-group-14-size" className="text-sm font-medium">
          How many people will join?
        </span>
        <ToggleGroup
          aria-labelledby="toggle-group-14-size"
          variant="outline"
          spacing={0}
          value={teamSize}
          onValueChange={setTeamSize}
          className="w-full"
        >
          {teamSizes.map((size) => (
            <ToggleGroupItem
              key={size}
              value={size}
              className="flex-1 tabular-nums aria-pressed:bg-primary/5 aria-pressed:text-primary"
            >
              {size}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <Button variant="ghost">
          <ArrowLeft aria-hidden="true" data-icon="inline-start" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <span aria-live="polite" className="hidden text-xs text-muted-foreground sm:inline">
            {canContinue
              ? `${selectedGoals.length} selected`
              : "Choose a goal and team size"}
          </span>
          <Button disabled={!canContinue}>
            Continue
            <ArrowRight aria-hidden="true" data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  );
}
