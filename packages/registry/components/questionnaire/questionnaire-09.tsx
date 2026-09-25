"use client";

import {
  ChevronLeftIcon,
  DumbbellIcon,
  FlameIcon,
  FootprintsIcon,
  HeartPulseIcon,
  SparklesIcon,
} from "lucide-react";
import { type FormEvent, useState } from "react";

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

const goals = [
  { value: "endurance", label: "Build endurance", icon: FootprintsIcon },
  { value: "strength", label: "Get stronger", icon: DumbbellIcon },
  { value: "weight", label: "Lose weight", icon: FlameIcon },
  { value: "health", label: "Feel healthier", icon: HeartPulseIcon },
];

const levels = [
  {
    value: "new",
    label: "Just starting",
    description: "I work out less than once a week.",
  },
  {
    value: "returning",
    label: "Getting back into it",
    description: "I used to train and want to rebuild the habit.",
  },
  {
    value: "regular",
    label: "Training regularly",
    description: "Three or more sessions most weeks.",
  },
];

const days = [
  { value: "mon", short: "M", label: "Monday" },
  { value: "tue", short: "T", label: "Tuesday" },
  { value: "wed", short: "W", label: "Wednesday" },
  { value: "thu", short: "T", label: "Thursday" },
  { value: "fri", short: "F", label: "Friday" },
  { value: "sat", short: "S", label: "Saturday" },
  { value: "sun", short: "S", label: "Sunday" },
];

const tileClassName =
  "min-h-24 items-stretch p-3 [&_[data-slot=questionnaire-choice-label]]:gap-3 [&>[data-slot=questionnaire-choice-indicator]]:absolute [&>[data-slot=questionnaire-choice-indicator]]:end-3 [&>[data-slot=questionnaire-choice-indicator]]:top-3";

const dayClassName =
  "min-h-11 items-center justify-center rounded-full px-0 py-0 font-medium data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary [&>[data-slot=questionnaire-choice-indicator]]:hidden [&_[data-slot=questionnaire-choice-label]]:items-center";

type Plan = { goal: string; days: string[] };

export default function Questionnaire09() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [showWeek, setShowWeek] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const goal = goals.find((item) => item.value === data.get("goal"));
    setPlan({
      goal: goal?.label ?? "Your goal",
      days: days
        .filter((day) => data.getAll("days").includes(day.value))
        .map((day) => day.label),
    });
    setShowWeek(false);
  }

  return (
    <div className="mx-auto flex h-[560px] w-full max-w-[360px] flex-col overflow-hidden rounded-[2rem] border-4 border-muted bg-background shadow-lg">
      <div className="flex h-6 shrink-0 items-center justify-center">
        <span aria-hidden="true" className="h-1 w-12 rounded-full bg-muted" />
      </div>
      {plan ? (
        <div className="flex min-h-0 flex-1 flex-col justify-between gap-6 p-5">
          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pt-10">
            <SparklesIcon aria-hidden="true" className="size-6 text-primary" />
            <h3 className="cn-font-heading text-2xl font-semibold text-balance">
              Your 4-week plan is ready
            </h3>
            <p className="text-sm text-pretty text-muted-foreground">
              {plan.goal}, {plan.days.length}{" "}
              {plan.days.length === 1 ? "session" : "sessions"} a week. Your
              first workout unlocks tomorrow at 7:00 AM.
            </p>
            {showWeek ? (
              <ol className="flex flex-col divide-y rounded-lg border text-sm">
                {plan.days.map((day, index) => (
                  <li
                    key={day}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <span className="font-medium">{day}</span>
                    <span className="text-muted-foreground">
                      Session {index + 1} · 25 min
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              className="h-11 w-full"
              aria-expanded={showWeek}
              onClick={() => setShowWeek((value) => !value)}
            >
              {showWeek ? "Hide my first week" : "See my first week"}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-11 w-full"
              onClick={() => setPlan(null)}
            >
              Change answers
            </Button>
          </div>
        </div>
      ) : (
        <Questionnaire
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 gap-0"
        >
          <div className="flex shrink-0 items-center gap-2 px-3 pb-2">
            <div className="size-9 shrink-0">
              <QuestionnairePrevious
                variant="ghost"
                size="icon-lg"
                aria-label="Previous question"
                className="min-h-0"
              >
                <ChevronLeftIcon aria-hidden="true" />
              </QuestionnairePrevious>
            </div>
            <QuestionnaireProgress
              className="min-w-0 flex-1"
              render={(props, state) => (
                <div {...props}>
                  <div aria-hidden="true" className="flex gap-1">
                    {Array.from({ length: state.total }, (_, index) => (
                      <span
                        // biome-ignore lint/suspicious/noArrayIndexKey: segments are positional
                        key={index}
                        data-done={index < state.current ? "" : undefined}
                        className="h-1 flex-1 rounded-full bg-muted transition-colors duration-300 data-done:bg-primary"
                      />
                    ))}
                  </div>
                </div>
              )}
            />
            <div className="size-9 shrink-0" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4">
            <QuestionnaireItem name="goal" required>
              <QuestionnaireTitle className="text-xl font-semibold">
                What's your main goal?
              </QuestionnaireTitle>
              <QuestionnaireDescription>
                We'll shape every workout around it.
              </QuestionnaireDescription>
              <QuestionnaireChoices className="grid-cols-2">
                {goals.map((goal) => (
                  <QuestionnaireChoice
                    key={goal.value}
                    value={goal.value}
                    className={tileClassName}
                  >
                    <goal.icon
                      aria-hidden="true"
                      className="size-5 text-muted-foreground group-data-checked/questionnaire-choice:text-primary"
                    />
                    <span className="mt-auto font-medium">{goal.label}</span>
                  </QuestionnaireChoice>
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError>Pick the goal that fits best.</QuestionnaireError>
            </QuestionnaireItem>
            <QuestionnaireItem name="level" required>
              <QuestionnaireTitle className="text-xl font-semibold">
                How active are you right now?
              </QuestionnaireTitle>
              <QuestionnaireDescription>
                Be honest. We start easy and adjust every week.
              </QuestionnaireDescription>
              <QuestionnaireChoices>
                {levels.map((level) => (
                  <QuestionnaireChoice
                    key={level.value}
                    value={level.value}
                    className="py-3.5"
                  >
                    <span className="font-medium">{level.label}</span>
                    <QuestionnaireChoiceDescription>
                      {level.description}
                    </QuestionnaireChoiceDescription>
                  </QuestionnaireChoice>
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError />
            </QuestionnaireItem>
            <QuestionnaireItem name="days" multiple required>
              <QuestionnaireTitle className="text-xl font-semibold">
                Which days can you train?
              </QuestionnaireTitle>
              <QuestionnaireDescription>
                Most people stick with 3 days. You can change this anytime.
              </QuestionnaireDescription>
              <QuestionnaireChoices className="grid-cols-7 gap-1">
                {days.map((day) => (
                  <QuestionnaireChoice
                    key={day.value}
                    value={day.value}
                    className={dayClassName}
                  >
                    <span aria-hidden="true">{day.short}</span>
                    <span className="sr-only">{day.label}</span>
                  </QuestionnaireChoice>
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError>Pick at least one day.</QuestionnaireError>
            </QuestionnaireItem>
          </div>
          <QuestionnaireActions className="shrink-0 grid-cols-1 p-5 pt-3">
            <QuestionnaireNext size="lg" className="col-start-1 h-11 w-full">
              Continue
            </QuestionnaireNext>
            <QuestionnaireSubmit size="lg" className="col-start-1 h-11 w-full">
              Build my plan
            </QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>
      )}
    </div>
  );
}
