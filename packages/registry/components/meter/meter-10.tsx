"use client";

import * as React from "react";

import { Checkbox } from "@/registry/base/ui/checkbox";
import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

const steps = [
  {
    id: "photo",
    title: "Upload a profile photo",
    detail: "Helps teammates recognize you in threads.",
    points: 15,
  },
  {
    id: "email",
    title: "Verify your work email",
    detail: "Required before you can invite others.",
    points: 20,
  },
  {
    id: "calendar",
    title: "Connect your calendar",
    detail: "Shows your availability when people book time.",
    points: 25,
  },
  {
    id: "timezone",
    title: "Set your working hours",
    detail: "Mutes notifications outside of them.",
    points: 15,
  },
  {
    id: "security",
    title: "Turn on two-factor authentication",
    detail: "Protects your account with a second sign-in step.",
    points: 25,
  },
];

function levelFor(score: number) {
  if (score >= 100) return "Profile complete";
  if (score >= 60) return "Almost there";
  if (score >= 30) return "Good start";
  return "Just getting started";
}

export default function Meter10() {
  const [done, setDone] = React.useState<string[]>(["email"]);

  const score = steps
    .filter((step) => done.includes(step.id))
    .reduce((total, step) => total + step.points, 0);
  const level = levelFor(score);

  function toggle(id: string, checked: boolean) {
    setDone((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id),
    );
  }

  return (
    <section
      aria-labelledby="meter-10-title"
      className="w-full max-w-md rounded-xl border bg-card p-4 text-card-foreground"
    >
      <h3 id="meter-10-title" className="font-medium">
        Finish setting up your account
      </h3>
      <p className="text-sm text-muted-foreground">
        A complete profile makes scheduling and hand-offs smoother.
      </p>

      <Meter
        value={score}
        getAriaValueText={(formatted) => `${formatted}, ${level}`}
        className={
          score >= 100
            ? "mt-4 grid-cols-[1fr_auto] [&>div:last-of-type]:bg-success/20 [&>div:last-of-type>div]:bg-success"
            : "mt-4 grid-cols-[1fr_auto]"
        }
      >
        <MeterLabel>Profile strength</MeterLabel>
        <MeterValue className="tabular-nums">
          {(formatted) => (
            <>
              {level} ·{" "}
              <span className="font-medium text-foreground">{formatted}</span>
            </>
          )}
        </MeterValue>
      </Meter>

      <ul className="mt-4 grid gap-1">
        {steps.map((step) => {
          const checked = done.includes(step.id);
          return (
            <li key={step.id}>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: the Checkbox renders the control inside the label */}
              <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60">
                <Checkbox
                  className="mt-0.5"
                  checked={checked}
                  onCheckedChange={(value) => toggle(step.id, value)}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={
                      checked
                        ? "block text-sm text-muted-foreground line-through"
                        : "block text-sm font-medium"
                    }
                  >
                    {step.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {step.detail}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  +{step.points}%
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
