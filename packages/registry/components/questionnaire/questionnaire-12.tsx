"use client";

import {
  CheckIcon,
  MountainIcon,
  RotateCcwIcon,
  ShoppingBagIcon,
  SignpostIcon,
  TimerIcon,
} from "lucide-react";
import { type FormEvent, useState } from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/registry/base/ui/questionnaire";

const terrains = [
  { value: "road", label: "Road", icon: SignpostIcon },
  { value: "trail", label: "Trail", icon: MountainIcon },
  { value: "treadmill", label: "Treadmill", icon: TimerIcon },
];

const distances = [
  { value: "short", label: "Under 15 km a week" },
  { value: "medium", label: "15 to 40 km a week" },
  { value: "long", label: "More than 40 km a week" },
];

const feels = [
  {
    value: "firm",
    label: "Firm and fast",
    description: "Close to the ground, snappy on tempo days.",
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "Soft enough for long runs, stable enough for speed.",
  },
  {
    value: "plush",
    label: "Max cushion",
    description: "Protective for high mileage and recovery runs.",
  },
];

const shoes = {
  road: { name: "Northpeak Glide 4", price: 140 },
  trail: { name: "Northpeak Ridge GTX", price: 165 },
  treadmill: { name: "Northpeak Pace Lite", price: 120 },
};

const tileClassName =
  "min-h-20 items-stretch justify-center px-2 pt-7 pb-3 text-center sm:p-3 [&>[data-slot=questionnaire-choice-indicator]]:hidden [&>[data-slot=questionnaire-choice-shortcut]]:absolute [&>[data-slot=questionnaire-choice-shortcut]]:end-2 [&>[data-slot=questionnaire-choice-shortcut]]:top-2 [&_[data-slot=questionnaire-choice-label]]:items-center [&_[data-slot=questionnaire-choice-label]]:justify-center [&_[data-slot=questionnaire-choice-label]]:gap-2";

type Match = {
  terrain: keyof typeof shoes;
  distance: string;
  feel: string;
};

export default function Questionnaire12() {
  const [match, setMatch] = useState<Match | null>(null);
  const [added, setAdded] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setMatch({
      terrain: data.get("terrain") as Match["terrain"],
      distance:
        distances.find((item) => item.value === data.get("distance"))?.label ??
        "",
      feel: feels.find((item) => item.value === data.get("feel"))?.label ?? "",
    });
  }

  function retake() {
    setMatch(null);
    setAdded(false);
  }

  if (match) {
    const shoe = shoes[match.terrain];
    return (
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
        <div className="flex gap-4">
          <img
            src="/placeholder.svg"
            alt={shoe.name}
            className="size-24 shrink-0 rounded-lg bg-muted object-cover"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <Badge variant="secondary">96% match</Badge>
            <h3 className="font-medium">{shoe.name}</h3>
            <p className="text-sm tabular-nums text-muted-foreground">
              ${shoe.price}
            </p>
          </div>
        </div>
        <ul className="flex flex-col gap-1.5 text-sm">
          {[match.distance, `${match.feel} ride`, "Free 30-day returns"].map(
            (reason) => (
              <li key={reason} className="flex items-center gap-2">
                <CheckIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
                {reason}
              </li>
            ),
          )}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button
            className="flex-1"
            onClick={() => setAdded(true)}
            disabled={added}
          >
            <ShoppingBagIcon aria-hidden="true" />
            {added ? "Added to bag" : "Add to bag"}
          </Button>
          <Button variant="outline" onClick={retake}>
            <RotateCcwIcon aria-hidden="true" />
            Retake
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Questionnaire
      shortcuts="letters"
      onSubmit={handleSubmit}
      className="max-w-md rounded-xl border bg-card p-5 text-card-foreground"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Shoe finder</p>
        <QuestionnaireProgress className="w-auto min-w-0 text-end" />
      </div>
      <QuestionnaireItem name="terrain" required>
        <QuestionnaireTitle>Where do you run most?</QuestionnaireTitle>
        <QuestionnaireChoices className="grid-cols-3">
          {terrains.map((terrain) => (
            <QuestionnaireChoice
              key={terrain.value}
              value={terrain.value}
              className={tileClassName}
            >
              <terrain.icon
                aria-hidden="true"
                className="size-5 text-muted-foreground group-data-checked/questionnaire-choice:text-foreground"
              />
              <span className="font-medium">{terrain.label}</span>
            </QuestionnaireChoice>
          ))}
        </QuestionnaireChoices>
        <QuestionnaireError>Pick where you run most often.</QuestionnaireError>
      </QuestionnaireItem>
      <QuestionnaireItem name="distance" required>
        <QuestionnaireTitle>How far do you run in a typical week?</QuestionnaireTitle>
        <QuestionnaireChoices>
          {distances.map((distance) => (
            <QuestionnaireChoice key={distance.value} value={distance.value}>
              {distance.label}
            </QuestionnaireChoice>
          ))}
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem name="feel" required>
        <QuestionnaireTitle>How should the shoe feel underfoot?</QuestionnaireTitle>
        <QuestionnaireDescription>
          Not sure? Balanced suits most runners.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          {feels.map((feel) => (
            <QuestionnaireChoice key={feel.value} value={feel.value}>
              {feel.label}
              <QuestionnaireChoiceDescription>
                {feel.description}
              </QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
          ))}
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious variant="ghost" />
        <QuestionnaireNext />
        <QuestionnaireSubmit>Show my match</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}
