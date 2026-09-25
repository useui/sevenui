"use client";

import * as React from "react";
import { CircleCheckIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/registry/base/ui/questionnaire";

const questions = [
  {
    name: "area",
    title: "Where did the bug happen?",
    required: true,
    choices: [
      { value: "editor", label: "Editor" },
      { value: "comments", label: "Comments" },
      { value: "export", label: "Export to PDF" },
      { value: "billing", label: "Billing" },
    ],
  },
  {
    name: "severity",
    title: "How much is it blocking you?",
    required: true,
    choices: [
      { value: "blocker", label: "I can't work at all" },
      { value: "major", label: "I have a slow workaround" },
      { value: "minor", label: "It's annoying but fine" },
    ],
  },
  {
    name: "frequency",
    title: "Can you reproduce it?",
    required: false,
    choices: [
      { value: "always", label: "Every time" },
      { value: "sometimes", label: "Sometimes" },
      { value: "once", label: "It happened once" },
    ],
  },
];

// Compact density: shorter rows, smaller type, and small action buttons.
const compactChoice = "min-h-9 py-2 text-[0.8125rem]";

export default function Questionnaire04() {
  const [sent, setSent] = React.useState(false);

  if (sent) {
    return (
      <div
        className="flex w-full max-w-sm flex-col items-start gap-3 rounded-xl bg-muted/50 p-4 text-sm"
        aria-live="polite"
      >
        <CircleCheckIcon aria-hidden="true" className="size-5 text-success" />
        <div className="flex flex-col gap-1">
          <p className="font-medium">Report sent</p>
          <p className="text-[0.8125rem] text-muted-foreground">
            We&apos;ll reply by email once someone on the team reproduces it.
          </p>
        </div>
        <Button size="sm" variant="ghost" className="-ms-2.5" onClick={() => setSent(false)}>
          Report another bug
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-xl bg-muted/50 p-4">
      <Questionnaire
        shortcuts="numbers"
        className="gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      >
        <QuestionnaireProgress
          className="w-full"
          render={(props, state) => (
            <div {...props}>
              <div className="flex items-center justify-between">
                <span>Bug report</span>
                <span>
                  {state.current}/{state.total}
                </span>
              </div>
              <div aria-hidden="true" className="mt-2 flex gap-1">
                {Array.from({ length: state.total }, (_, index) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: segments are positional
                    key={index}
                    data-filled={index < state.current ? "" : undefined}
                    className="h-1 flex-1 rounded-full bg-border transition-colors duration-300 data-filled:bg-primary"
                  />
                ))}
              </div>
            </div>
          )}
        />
        {questions.map((question) => (
          <QuestionnaireItem
            key={question.name}
            name={question.name}
            required={question.required}
            className="gap-3"
          >
            <QuestionnaireTitle className="text-sm [&:not(:has(~[data-slot=questionnaire-description]))]:mb-1">
              {question.title}
            </QuestionnaireTitle>
            <QuestionnaireChoices className="gap-1.5">
              {question.choices.map((choice) => (
                <QuestionnaireChoice
                  key={choice.value}
                  value={choice.value}
                  className={compactChoice}
                >
                  {choice.label}
                </QuestionnaireChoice>
              ))}
            </QuestionnaireChoices>
            <QuestionnaireError className="mt-0 text-xs" />
          </QuestionnaireItem>
        ))}
        <QuestionnaireActions>
          <QuestionnairePrevious size="sm" variant="ghost" />
          <QuestionnaireSkip size="sm" variant="ghost" />
          <QuestionnaireNext size="sm" />
          <QuestionnaireSubmit size="sm">Send report</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </div>
  );
}
