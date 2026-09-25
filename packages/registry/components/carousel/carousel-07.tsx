"use client";

import {
  BuildingIcon,
  CircleCheckIcon,
  type LucideIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/registry/base/ui/carousel";
import { Progress } from "@/registry/base/ui/progress";

type Choice = {
  value: string;
  label: string;
  hint: string;
  summary: string;
  icon?: LucideIcon;
};

const teamSizes: Choice[] = [
  {
    value: "solo",
    label: "Just me",
    hint: "Personal projects",
    summary: "you",
    icon: UserIcon,
  },
  {
    value: "team",
    label: "2-20 people",
    hint: "A single team",
    summary: "your team",
    icon: UsersIcon,
  },
  {
    value: "org",
    label: "20+ people",
    hint: "Several teams",
    summary: "your organization",
    icon: BuildingIcon,
  },
];

const goals: Choice[] = [
  {
    value: "roadmap",
    label: "Plan a roadmap",
    hint: "Quarters and milestones",
    summary: "roadmap",
  },
  {
    value: "bugs",
    label: "Track bugs",
    hint: "Triage and SLAs",
    summary: "bug triage",
  },
  {
    value: "sprints",
    label: "Run sprints",
    hint: "Cycles and velocity",
    summary: "sprint planning",
  },
];

const STEP_COUNT = 3;

function ChoiceList({
  choices,
  value,
  onChange,
  label,
}: {
  choices: Choice[];
  value: string | null;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="sr-only">{label}</legend>
      {choices.map((choice) => {
        const Icon = choice.icon;
        return (
          <button
            key={choice.value}
            type="button"
            aria-pressed={value === choice.value}
            onClick={() => onChange(choice.value)}
            className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5 text-left transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset aria-pressed:border-primary aria-pressed:bg-primary/5"
          >
            {Icon ? (
              <Icon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            ) : null}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium">{choice.label}</span>
              <span className="text-xs text-muted-foreground">
                {choice.hint}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="flex size-4 shrink-0 items-center justify-center rounded-full border in-aria-pressed:border-primary in-aria-pressed:bg-primary"
            >
              <span className="size-1.5 rounded-full bg-primary-foreground opacity-0 in-aria-pressed:opacity-100" />
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}

export default function Carousel07() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [step, setStep] = React.useState(0);
  const [teamSize, setTeamSize] = React.useState<string | null>(null);
  const [goal, setGoal] = React.useState<string | null>(null);

  const goTo = (next: number) => {
    setStep(next);
    api?.scrollTo(next);
  };

  const reset = () => {
    setTeamSize(null);
    setGoal(null);
    goTo(0);
  };

  const canContinue =
    (step === 0 && teamSize !== null) || (step === 1 && goal !== null);
  const teamChoice = teamSizes.find((choice) => choice.value === teamSize);
  const goalChoice = goals.find((choice) => choice.value === goal);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span id="carousel-07-heading" className="font-medium text-foreground">
            Set up your workspace
          </span>
          <span className="tabular-nums">
            Step {step + 1} of {STEP_COUNT}
          </span>
        </div>
        <Progress
          value={((step + 1) / STEP_COUNT) * 100}
          aria-labelledby="carousel-07-heading"
        />
      </div>
      <Carousel
        setApi={setApi}
        // Steps only advance through the buttons below: dragging and the
        // built-in arrow keys are turned off so a step cannot be skipped.
        opts={{ watchDrag: false, duration: 20 }}
        onKeyDownCapture={() => {}}
        aria-labelledby="carousel-07-heading"
      >
        <CarouselContent>
          <CarouselItem
            aria-label={`1 of ${STEP_COUNT}`}
            inert={step !== 0}
            className="flex flex-col gap-3"
          >
            <h3 className="text-base font-semibold">Who will use it?</h3>
            <ChoiceList
              label="Team size"
              choices={teamSizes}
              value={teamSize}
              onChange={setTeamSize}
            />
          </CarouselItem>
          <CarouselItem
            aria-label={`2 of ${STEP_COUNT}`}
            inert={step !== 1}
            className="flex flex-col gap-3"
          >
            <h3 className="text-base font-semibold">What comes first?</h3>
            <ChoiceList
              label="Primary goal"
              choices={goals}
              value={goal}
              onChange={setGoal}
            />
          </CarouselItem>
          <CarouselItem
            aria-label={`3 of ${STEP_COUNT}`}
            inert={step !== 2}
            className="flex flex-col items-center justify-center gap-3 text-center"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-success/15 text-success">
              <CircleCheckIcon className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold">Workspace ready</h3>
              <p className="text-sm text-pretty text-muted-foreground">
                We set up a {goalChoice?.summary ?? "starter"} template for{" "}
                {teamChoice?.summary ?? "your team"}. You can change it any
                time.
              </p>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
      <div className="flex items-center justify-between gap-2">
        {step === 2 ? (
          <>
            <Button variant="ghost" onClick={reset}>
              Start over
            </Button>
            <Button>Open workspace</Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              disabled={step === 0}
              onClick={() => goTo(step - 1)}
            >
              Back
            </Button>
            <Button disabled={!canContinue} onClick={() => goTo(step + 1)}>
              Continue
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
