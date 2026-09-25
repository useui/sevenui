"use client";

import * as React from "react";
import { CircleCheckIcon, CircleXIcon, ShieldCheckIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
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

const PASSING_SCORE = 2;

const questions = [
  {
    name: "phishing",
    title:
      "An email from “IT Support” asks you to confirm your password through a link. What do you do?",
    multiple: false,
    correct: ["report"],
    explanation:
      "IT never asks for your password. Reporting it warns the security team and pulls the email from other inboxes.",
    choices: [
      { value: "confirm", label: "Open the link and confirm it" },
      { value: "reply", label: "Reply and ask if it's real" },
      { value: "report", label: "Use Report phishing in your mail app" },
      { value: "ignore", label: "Delete it and move on" },
    ],
  },
  {
    name: "password",
    title: "Which of these passwords is hardest to crack?",
    multiple: false,
    correct: ["passphrase"],
    explanation:
      "Length beats symbol swaps. Four random words are longer and far less predictable than a dictionary word with a year.",
    choices: [
      { value: "season", label: "Summer2026!" },
      { value: "passphrase", label: "lantern-orbit-velvet-quarry" },
      { value: "leet", label: "P@ssw0rd123" },
    ],
  },
  {
    name: "ai-paste",
    title: "Which of these are fine to paste into a public AI chatbot?",
    description: "Select every answer that applies.",
    multiple: true,
    correct: ["blog-draft", "stack-trace"],
    explanation:
      "Public drafts and errors from open-source libraries are fine. Customer data and credentials never leave approved tools.",
    choices: [
      { value: "blog-draft", label: "A draft of an already public blog post" },
      { value: "customer-list", label: "A CSV export of customer emails" },
      {
        value: "stack-trace",
        label: "A stack trace from an open-source library",
      },
      { value: "api-key", label: "A production API key, to debug a request" },
    ],
  },
];

type Result = { name: string; correct: boolean };

function grade(data: FormData): Result[] {
  return questions.map((question) => {
    const picked = data.getAll(question.name).map(String).sort();
    const expected = [...question.correct].sort();
    return {
      name: question.name,
      correct:
        picked.length === expected.length &&
        picked.every((value, index) => value === expected[index]),
    };
  });
}

export default function Questionnaire06() {
  const [results, setResults] = React.useState<Result[] | null>(null);

  if (results) {
    const score = results.filter((result) => result.correct).length;
    const passed = score >= PASSING_SCORE;
    return (
      <div className="flex w-full max-w-md flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
        <div className="flex flex-col gap-2" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <p className="text-2xl font-semibold tabular-nums">
              {score} of {questions.length} correct
            </p>
            <Badge variant={passed ? "secondary" : "destructive"}>
              {passed ? "Passed" : "Not passed"}
            </Badge>
          </div>
          <p className="text-sm text-pretty text-muted-foreground">
            {passed
              ? "Your Q3 security refresher is complete. We logged it on your training record."
              : `You need ${PASSING_SCORE} correct answers to pass. Read the notes below and try again.`}
          </p>
        </div>
        <ol className="flex flex-col gap-4 border-t pt-4">
          {questions.map((question, index) => {
            const correct = results[index]?.correct;
            const Icon = correct ? CircleCheckIcon : CircleXIcon;
            return (
              <li key={question.name} className="flex gap-3 text-sm">
                <Icon
                  aria-hidden="true"
                  className={
                    correct
                      ? "mt-0.5 size-4 shrink-0 text-success"
                      : "mt-0.5 size-4 shrink-0 text-destructive"
                  }
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="font-medium text-pretty">
                    <span className="sr-only">
                      {correct ? "Correct: " : "Incorrect: "}
                    </span>
                    {question.title}
                  </p>
                  <p className="text-pretty text-muted-foreground">
                    {question.explanation}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        <Button
          variant={passed ? "outline" : "default"}
          className="w-fit"
          onClick={() => setResults(null)}
        >
          {passed ? "Review questions" : "Retake quiz"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <ShieldCheckIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-sm font-medium">Q3 security refresher</h3>
          <p className="text-xs text-muted-foreground">
            3 questions · pass with {PASSING_SCORE} correct · about 2 minutes
          </p>
        </div>
      </div>
      <Questionnaire
        onSubmit={(event) => {
          event.preventDefault();
          setResults(grade(new FormData(event.currentTarget)));
        }}
      >
        <QuestionnaireProgress />
        {questions.map((question) => (
          <QuestionnaireItem
            key={question.name}
            name={question.name}
            multiple={question.multiple}
            required
          >
            <QuestionnaireTitle>{question.title}</QuestionnaireTitle>
            {question.description ? (
              <QuestionnaireDescription>
                {question.description}
              </QuestionnaireDescription>
            ) : null}
            <QuestionnaireChoices>
              {question.choices.map((choice) => (
                <QuestionnaireChoice key={choice.value} value={choice.value}>
                  {choice.label}
                </QuestionnaireChoice>
              ))}
            </QuestionnaireChoices>
            <QuestionnaireError>Choose an answer to continue.</QuestionnaireError>
          </QuestionnaireItem>
        ))}
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireNext />
          <QuestionnaireSubmit>Check answers</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </div>
  );
}
