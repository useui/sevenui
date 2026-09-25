"use client";

import * as React from "react";
import { BookOpen, Briefcase, CircleCheck, GraduationCap, User } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Progress } from "@/registry/base/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const useCases = [
  {
    value: "work",
    label: "Work",
    description: "Plan projects with my team",
    icon: Briefcase,
  },
  {
    value: "personal",
    label: "Personal",
    description: "Organize my own life",
    icon: User,
  },
  {
    value: "school",
    label: "School",
    description: "Track classes and assignments",
    icon: GraduationCap,
  },
  {
    value: "writing",
    label: "Writing",
    description: "Draft notes and long-form docs",
    icon: BookOpen,
  },
];

function StepHeader({ step }: { step: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Step {step} of 4</span>
        <span>Workspace setup</span>
      </div>
      <Progress value={step * 25} aria-label="Onboarding progress" />
    </div>
  );
}

export default function RadioGroup12() {
  const [useCase, setUseCase] = React.useState<string | null>(null);
  const [step, setStep] = React.useState(2);
  const chosen = useCases.find((item) => item.value === useCase);

  if (step !== 2) {
    // The neighbouring steps are stubs so Back, Skip and Continue lead
    // somewhere and the answer on step 2 survives the round trip.
    return (
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-border bg-card p-5 text-card-foreground">
        <StepHeader step={step} />
        <div role="status" className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-balance">
            {step === 1 ? "Name your workspace" : chosen ? "Templates added" : "Use case skipped"}
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {step === 1 ? (
              <>
                <CircleCheck aria-hidden="true" className="size-4 shrink-0 text-success" />
                Northwind is saved as your workspace name.
              </>
            ) : chosen ? (
              `Templates for ${chosen.label.toLowerCase()} are ready in your sidebar.`
            ) : (
              "No templates added. You can pick a use case later in Settings."
            )}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          {step === 1 ? (
            <span />
          ) : (
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
          )}
          {step === 1 ? <Button onClick={() => setStep(2)}>Continue</Button> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-border bg-card p-5 text-card-foreground">
      <StepHeader step={2} />
      <div className="flex flex-col gap-1">
        <h3 id="radio-group-12-title" className="text-lg font-semibold text-balance">
          How do you plan to use Relay?
        </h3>
        <p className="text-sm text-muted-foreground">
          We will set up templates that fit. You can change this later.
        </p>
      </div>
      <RadioGroup
        aria-labelledby="radio-group-12-title"
        value={useCase}
        onValueChange={(value) => setUseCase(value as string)}
        className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2"
      >
        {useCases.map((item) => (
          <Label
            key={item.value}
            className="relative cursor-pointer flex-col items-start gap-3 rounded-lg border border-border p-3 font-normal transition-colors hover:bg-muted/50 has-data-checked:border-primary has-data-checked:bg-primary/5"
          >
            <RadioGroupItem value={item.value} className="absolute top-3 right-3" />
            <span className="flex size-9 items-center justify-center rounded-md bg-muted">
              <item.icon aria-hidden="true" className="size-4.5" />
            </span>
            <span className="flex flex-col gap-1 pr-5">
              <span className="font-medium">{item.label}</span>
              <span className="text-xs leading-snug text-muted-foreground">
                {item.description}
              </span>
            </span>
          </Label>
        ))}
      </RadioGroup>
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => setStep(1)}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setUseCase(null);
              setStep(3);
            }}
          >
            Skip
          </Button>
          <Button disabled={useCase === null} onClick={() => setStep(3)}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
