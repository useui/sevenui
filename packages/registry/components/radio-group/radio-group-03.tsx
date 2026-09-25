"use client";

import { type FormEvent, useState } from "react";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const meals = [
  { value: "short-rib", label: "Braised short rib, potato purée" },
  { value: "salmon", label: "Miso-glazed salmon, charred greens" },
  { value: "risotto", label: "Wild mushroom risotto (vegetarian)" },
  { value: "vegan", label: "Chef's seasonal plate (vegan)" },
];

type Status = "idle" | "error" | "success";

export default function RadioGroup03() {
  const [meal, setMeal] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const invalid = status === "error";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(meal ? "success" : "error");
  };

  return (
    <form
      noValidate
      onSubmit={submit}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <p id="radio-group-03-label" className="text-sm font-medium">
          Dinner choice
        </p>
        <p className="text-sm text-pretty text-muted-foreground">
          Required. Team offsite dinner, Tuesday, Oct 14 at 7:00 PM.
        </p>
      </div>

      <RadioGroup
        value={meal}
        onValueChange={(value) => {
          setMeal(value as string);
          setStatus("idle");
        }}
        aria-labelledby="radio-group-03-label"
        aria-describedby={
          status !== "idle" ? "radio-group-03-status" : undefined
        }
        aria-invalid={invalid || undefined}
        aria-required="true"
        className="gap-3"
      >
        {meals.map((item) => (
          <Label key={item.value} className="cursor-pointer font-normal">
            <RadioGroupItem
              value={item.value}
              aria-invalid={invalid || undefined}
            />
            {item.label}
          </Label>
        ))}
      </RadioGroup>

      <div aria-live="polite" className="min-h-5">
        {status === "error" ? (
          <p
            id="radio-group-03-status"
            className="flex items-center gap-1.5 text-sm text-destructive"
          >
            <CircleAlertIcon aria-hidden="true" className="size-4 shrink-0" />
            Choose a dinner option so the kitchen can plan.
          </p>
        ) : null}
        {status === "success" ? (
          <p
            id="radio-group-03-status"
            className="flex items-center gap-1.5 text-sm text-success"
          >
            <CircleCheckIcon aria-hidden="true" className="size-4 shrink-0" />
            RSVP saved. You can change your meal until Oct 7.
          </p>
        ) : null}
      </div>

      <Button type="submit" className="self-start">
        Save RSVP
      </Button>
    </form>
  );
}
