"use client";

import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
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

const MAX_TOPICS = 3;

const topics = [
  { value: "ai", label: "AI and machine learning" },
  { value: "design-systems", label: "Design systems" },
  { value: "frontend", label: "Frontend performance" },
  { value: "security", label: "Security advisories" },
  { value: "databases", label: "Databases" },
  { value: "devops", label: "DevOps and CI" },
];

const frequencies = [
  { value: "daily", label: "Every morning" },
  { value: "weekly", label: "Monday digest" },
  { value: "monthly", label: "First of the month" },
];

export default function Questionnaire03() {
  const [selected, setSelected] = React.useState<string[]>(["design-systems"]);
  const [summary, setSummary] = React.useState<string | null>(null);
  const atLimit = selected.length >= MAX_TOPICS;

  function toggle(value: string, checked: boolean) {
    setSelected((current) =>
      checked ? [...current, value] : current.filter((item) => item !== value),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const frequency = frequencies.find((item) => item.value === data.get("frequency"));
    setSummary(`${data.getAll("topics").length} topics, ${frequency?.label.toLowerCase()}`);
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <Questionnaire onSubmit={handleSubmit}>
        <QuestionnaireProgress />
        <QuestionnaireItem name="topics" multiple required>
          <QuestionnaireTitle>What should your digest cover?</QuestionnaireTitle>
          <QuestionnaireDescription className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <span>Pick up to {MAX_TOPICS}. You can change them later in settings.</span>
            <Badge
              variant={atLimit ? "default" : "secondary"}
              className="tabular-nums"
              aria-live="polite"
            >
              {selected.length} of {MAX_TOPICS} picked
            </Badge>
          </QuestionnaireDescription>
          <QuestionnaireChoices className="sm:grid-cols-2">
            {topics.map((topic) => {
              const checked = selected.includes(topic.value);
              return (
                <QuestionnaireChoice
                  key={topic.value}
                  value={topic.value}
                  checked={checked}
                  disabled={atLimit && !checked}
                  onChange={(event) => toggle(topic.value, event.target.checked)}
                >
                  {topic.label}
                </QuestionnaireChoice>
              );
            })}
          </QuestionnaireChoices>
          <QuestionnaireError>Pick at least one topic to continue.</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem name="frequency" required>
          <QuestionnaireTitle>How often should it arrive?</QuestionnaireTitle>
          <QuestionnaireChoices>
            {frequencies.map((frequency) => (
              <QuestionnaireChoice
                key={frequency.value}
                value={frequency.value}
                defaultChecked={frequency.value === "weekly"}
              >
                {frequency.label}
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireNext />
          <QuestionnaireSubmit>Save digest</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
      {summary ? (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Saved: {summary}.
        </p>
      ) : null}
    </div>
  );
}
