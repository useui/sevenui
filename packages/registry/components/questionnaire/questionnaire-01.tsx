"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/registry/base/ui/questionnaire";

const answers = [
  { value: "found-it", label: "Yes, first try" },
  { value: "after-refining", label: "Yes, after refining my search" },
  { value: "partially", label: "Only partially" },
  { value: "not-found", label: "No, I gave up" },
];

export default function Questionnaire01() {
  const [answer, setAnswer] = React.useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setAnswer(String(data.get("search-result")));
  }

  if (answer) {
    const label = answers.find((item) => item.value === answer)?.label;
    return (
      <div
        className="flex w-full max-w-sm flex-col items-start gap-3"
        aria-live="polite"
      >
        <p className="text-base font-medium">Thanks, that helps.</p>
        <p className="text-sm text-muted-foreground">
          You answered{" "}
          <span className="font-medium text-foreground">{label}</span>. We use
          this to tune search ranking for everyone on your team.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="-ms-2.5"
          onClick={() => setAnswer(null)}
        >
          Change answer
        </Button>
      </div>
    );
  }

  return (
    <Questionnaire onSubmit={handleSubmit} className="max-w-sm">
      <QuestionnaireItem name="search-result" required>
        <QuestionnaireTitle>
          Did you find what you were looking for?
        </QuestionnaireTitle>
        <QuestionnaireDescription>
          Your last search was &ldquo;invoice template&rdquo;.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          {answers.map((item) => (
            <QuestionnaireChoice key={item.value} value={item.value}>
              {item.label}
            </QuestionnaireChoice>
          ))}
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnaireSubmit>Send feedback</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}
