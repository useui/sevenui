"use client";

import { Check, CircleCheck } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

const maxNameLength = 40;

const useCases = [
  "Product roadmap",
  "Bug tracking",
  "Sprint planning",
  "Customer feedback",
  "Design reviews",
  "Hiring pipeline",
];

const teamSizes = ["Just me", "2–10", "11–50", "51+"];

export default function Label10() {
  const [name, setName] = React.useState("Northwind Product");
  const [picked, setPicked] = React.useState<string[]>(["Bug tracking"]);
  const [teamSize, setTeamSize] = React.useState("2–10");
  const [step, setStep] = React.useState<2 | 3>(2);

  const trimmed = name.trim();
  const canContinue = trimmed.length > 0 && picked.length > 0;

  function togglePick(useCase: string) {
    setPicked((current) =>
      current.includes(useCase)
        ? current.filter((item) => item !== useCase)
        : [...current, useCase],
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canContinue) setStep(3);
      }}
      className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-border bg-card p-5 text-card-foreground"
    >
      <Progress value={step === 2 ? 66 : 100} className="gap-2">
        <ProgressLabel className="text-xs text-muted-foreground">
          Step {step} of 3
        </ProgressLabel>
        <ProgressValue className="text-xs" />
      </Progress>

      {step === 2 ? (
        <>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-balance">
              Set up your workspace
            </h3>
            <p className="text-sm text-muted-foreground">
              We will tailor templates and views to how your team works.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="label-10-name" className="justify-between">
              Workspace name
              <span
                aria-hidden="true"
                className="text-xs font-normal text-muted-foreground tabular-nums"
              >
                {name.length}/{maxNameLength}
              </span>
            </Label>
            <Input
              id="label-10-name"
              value={name}
              maxLength={maxNameLength}
              autoComplete="organization"
              aria-describedby="label-10-name-hint"
              onChange={(event) => setName(event.target.value)}
            />
            <p id="label-10-name-hint" className="text-xs text-muted-foreground">
              Shown in the sidebar and on invite emails. You can change it later.
            </p>
          </div>

          <fieldset className="flex flex-col">
            <legend className="mb-3 text-sm font-medium">
              What will you use it for?
              <span className="ml-1.5 font-normal text-muted-foreground">
                Pick any
              </span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {useCases.map((useCase) => {
                const checked = picked.includes(useCase);
                return (
                  <Label
                    key={useCase}
                    className="h-8 cursor-pointer gap-1.5 rounded-full border border-border px-3 font-normal transition-colors hover:bg-muted has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => togglePick(useCase)}
                    />
                    {checked ? <Check aria-hidden="true" className="size-3.5" /> : null}
                    {useCase}
                  </Label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col">
            <legend className="mb-3 text-sm font-medium">Team size</legend>
            <div className="grid grid-cols-4 rounded-lg bg-muted p-1">
              {teamSizes.map((size) => (
                <Label
                  key={size}
                  className="h-8 cursor-pointer justify-center rounded-md px-1 text-xs whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground has-checked:bg-background has-checked:text-foreground has-checked:shadow-sm has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
                >
                  <input
                    type="radio"
                    name="label-10-team-size"
                    value={size}
                    className="sr-only"
                    checked={teamSize === size}
                    onChange={() => setTeamSize(size)}
                  />
                  {size}
                </Label>
              ))}
            </div>
          </fieldset>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-balance">
              <CircleCheck aria-hidden="true" className="size-5 text-success" />
              {trimmed} is ready
            </h3>
            <p className="text-sm text-muted-foreground">
              Review your answers. Go back to change anything.
            </p>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border border-border p-3 text-sm">
            <dt className="text-muted-foreground">Use cases</dt>
            <dd>{picked.join(", ")}</dd>
            <dt className="text-muted-foreground">Team size</dt>
            <dd>{teamSize}</dd>
          </dl>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 2}
          onClick={() => setStep(2)}
        >
          Back
        </Button>
        {step === 2 ? (
          <Button type="submit" disabled={!canContinue}>
            Continue
          </Button>
        ) : null}
      </div>
    </form>
  );
}
