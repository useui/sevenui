"use client";

import * as React from "react";
import { ArrowLeftIcon, ArrowRightIcon, SparklesIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/registry/base/ui/questionnaire";
import { Spinner } from "@/registry/base/ui/spinner";

const questions = [
  {
    name: "seats",
    title: "How many people need an account?",
    choices: [
      { value: "1", label: "Only me", description: "Personal projects", points: 0 },
      { value: "10", label: "Up to 10", description: "One product team", points: 1 },
      { value: "50", label: "More than 10", description: "Multiple teams", points: 2 },
    ],
  },
  {
    name: "storage",
    title: "How much do you upload each month?",
    choices: [
      { value: "light", label: "Under 5 GB", description: "Docs and screenshots", points: 0 },
      { value: "medium", label: "5 to 100 GB", description: "Design files and recordings", points: 1 },
      { value: "heavy", label: "Over 100 GB", description: "Raw video or datasets", points: 2 },
    ],
  },
  {
    name: "security",
    title: "Which security features are must-haves?",
    choices: [
      { value: "none", label: "Nothing special", description: "Two-factor login is enough", points: 0 },
      { value: "sso", label: "Single sign-on", description: "Google or Okta login", points: 1 },
      { value: "audit", label: "SSO and audit logs", description: "Required by compliance", points: 2 },
    ],
  },
];

const plans = [
  { name: "Starter", price: "$0", note: "Free forever for one seat and 5 GB." },
  { name: "Team", price: "$12", note: "Per seat per month, 1 TB shared storage and SSO." },
  { name: "Business", price: "$24", note: "Per seat per month, unlimited storage and audit logs." },
];

// Each step fades and rises in when it becomes the active item.
const enter =
  "transition-[opacity,translate] duration-300 ease-out starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none";

function recommend(data: FormData) {
  const total = questions.reduce((sum, question) => {
    const choice = question.choices.find((item) => item.value === data.get(question.name));
    return sum + (choice?.points ?? 0);
  }, 0);
  return plans[total >= 4 ? 2 : total >= 2 ? 1 : 0];
}

export default function Questionnaire07() {
  const [pending, setPending] = React.useState(false);
  const [plan, setPlan] = React.useState<(typeof plans)[number] | null>(null);
  const [trialStarted, setTrialStarted] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = recommend(new FormData(event.currentTarget));
    setPending(true);
    // Stand-in for a pricing API call.
    timer.current = setTimeout(() => {
      setPending(false);
      setPlan(result);
    }, 900);
  }

  if (plan) {
    return (
      <div
        className={`flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground ${enter}`}
        aria-live="polite"
      >
        <Badge variant="secondary">
          <SparklesIcon data-icon="inline-start" aria-hidden="true" />
          Recommended for you
        </Badge>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-semibold">{plan.name}</p>
          <p className="text-sm text-muted-foreground tabular-nums">{plan.price}</p>
        </div>
        <p className="text-sm text-muted-foreground">{plan.note}</p>
        <div className="flex flex-wrap gap-2">
          <Button disabled={trialStarted} onClick={() => setTrialStarted(true)}>
            {trialStarted ? "Trial started" : "Start 14-day trial"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setPlan(null);
              setTrialStarted(false);
            }}
          >
            Retake quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Questionnaire
      aria-busy={pending || undefined}
      // Lock the whole form while the plan loads. Disabling the choices instead
      // makes the item read as unanswered and flashes its error.
      inert={pending}
      onSubmit={handleSubmit}
      className="max-w-md rounded-xl border bg-card p-6 text-card-foreground"
    >
      <QuestionnaireProgress
        className="w-full"
        render={(props, state) => (
          <div {...props}>
            <span className="text-xs">
              Step {state.current} of {state.total}
            </span>
            <span aria-hidden="true" className="mt-2 block h-1 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${state.total ? (state.current / state.total) * 100 : 0}%` }}
              />
            </span>
          </div>
        )}
      />
      {questions.map((question) => (
        <QuestionnaireItem key={question.name} name={question.name} required className={enter}>
          <QuestionnaireTitle>{question.title}</QuestionnaireTitle>
          <QuestionnaireChoices>
            {question.choices.map((choice) => (
              <QuestionnaireChoice
                key={choice.value}
                value={choice.value}
                className="transition-[background-color,border-color,scale] duration-150 active:scale-[0.99] motion-reduce:transition-none"
              >
                {choice.label}
                <QuestionnaireChoiceDescription>{choice.description}</QuestionnaireChoiceDescription>
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
      ))}
      <QuestionnaireActions>
        <QuestionnairePrevious variant="ghost" disabled={pending}>
          <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
          Back
        </QuestionnairePrevious>
        <QuestionnaireNext>
          Next
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </QuestionnaireNext>
        <QuestionnaireSubmit disabled={pending}>
          {pending ? (
            <>
              <Spinner data-icon="inline-start" aria-hidden="true" />
              Finding your plan
            </>
          ) : (
            "See my plan"
          )}
        </QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}
