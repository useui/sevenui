"use client";

import * as React from "react";

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/registry/base/ui/questionnaire";

export default function QuestionnaireDemo() {
  const [submitted, setSubmitted] = React.useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(
      `role: ${data.get("role")} · interests: ${
        data.getAll("interests").join(", ") || "—"
      } · email: ${data.get("email")}`,
    );
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md rounded-xl border p-6 text-sm">
        <p className="font-medium">Thanks for your answers!</p>
        <p className="mt-2 text-muted-foreground">{submitted}</p>
      </div>
    );
  }

  return (
    <Questionnaire
      shortcuts="letters"
      onSubmit={handleSubmit}
      className="max-w-md rounded-xl border p-6"
    >
      <QuestionnaireProgress />
      <QuestionnaireItem name="role" required>
        <QuestionnaireTitle>What best describes your role?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="designer">Designer</QuestionnaireChoice>
          <QuestionnaireChoice value="developer">Developer</QuestionnaireChoice>
          <QuestionnaireChoice value="product">
            Product
            <QuestionnaireChoiceDescription>
              PM, founder, or anything in between
            </QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem name="interests" multiple>
        <QuestionnaireTitle>What are you building?</QuestionnaireTitle>
        <QuestionnaireDescription>
          Pick as many as you like — or skip this step.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="dashboards">Dashboards</QuestionnaireChoice>
          <QuestionnaireChoice value="marketing">
            Marketing sites
          </QuestionnaireChoice>
          <QuestionnaireChoice value="ai">AI interfaces</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireItem name="email" required>
        <QuestionnaireTitle>Where should we send updates?</QuestionnaireTitle>
        <QuestionnaireInput type="email" placeholder="you@example.com" />
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  );
}
