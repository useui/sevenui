"use client";

import { HeartHandshakeIcon, XIcon } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/registry/base/ui/questionnaire";

const scores = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

function followUpFor(score: number | null) {
  if (score === null) return "Tell us more about your score";
  if (score <= 6) return "What's the one thing we should fix first?";
  if (score <= 8) return "What would make Lumen a 10 for you?";
  return "What do you rely on Lumen for most?";
}

export default function Questionnaire08() {
  const [open, setOpen] = useState(true);
  const [score, setScore] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  function restart() {
    setScore(null);
    setSent(false);
    setOpen(true);
  }

  if (!open) {
    return (
      <div className="flex w-full max-w-sm flex-col items-start gap-3 text-sm">
        <p className="text-muted-foreground">
          Survey dismissed. We won't ask again for 90 days.
        </p>
        <Button variant="outline" size="sm" onClick={restart}>
          Show survey again
        </Button>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="questionnaire-08-heading"
      className="relative w-full max-w-sm rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3
          id="questionnaire-08-heading"
          className="text-xs font-medium text-muted-foreground"
        >
          Quick feedback · 30 seconds
        </h3>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss survey"
          onClick={() => setOpen(false)}
          className="-me-1.5"
        >
          <XIcon aria-hidden="true" />
        </Button>
      </div>
      {sent ? (
        <div className="flex flex-col items-start gap-3 py-2">
          <HeartHandshakeIcon
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
          <p className="font-medium">Thanks, that helps a lot.</p>
          <p className="text-sm text-muted-foreground">
            Your score of {score} was shared with the Lumen product team.
          </p>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      ) : (
        <Questionnaire onSubmit={handleSubmit}>
          <QuestionnaireItem name="score" required>
            <QuestionnaireTitle>
              How likely are you to recommend Lumen to a colleague?
            </QuestionnaireTitle>
            <QuestionnaireChoices className="grid-cols-6 gap-1.5 sm:grid-cols-11 sm:gap-1">
              {scores.map((value) => (
                <QuestionnaireChoice
                  key={value}
                  value={value}
                  onChange={(event) => setScore(Number(event.target.value))}
                  className="min-h-10 items-center justify-center px-0 py-0 text-center font-medium tabular-nums data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary [&>[data-slot=questionnaire-choice-indicator]]:hidden [&_[data-slot=questionnaire-choice-label]]:items-center"
                >
                  {value}
                  <span className="sr-only"> out of 10</span>
                </QuestionnaireChoice>
              ))}
            </QuestionnaireChoices>
            <div
              aria-hidden="true"
              className="-mt-2 flex justify-between text-xs text-muted-foreground"
            >
              <span>Not likely</span>
              <span>Very likely</span>
            </div>
            <QuestionnaireError>Pick a score from 0 to 10.</QuestionnaireError>
          </QuestionnaireItem>
          <QuestionnaireItem name="reason">
            <QuestionnaireTitle>{followUpFor(score)}</QuestionnaireTitle>
            <QuestionnaireDescription>
              Optional. Skip it and we'll still record your score.
            </QuestionnaireDescription>
            <QuestionnaireInput
              aria-label="Reason for your score"
              placeholder="e.g. Faster funnel reports"
            />
            <QuestionnaireError>
              Add a few words, or choose Skip &amp; send.
            </QuestionnaireError>
          </QuestionnaireItem>
          <QuestionnaireActions>
            <QuestionnairePrevious size="sm" variant="ghost">
              Back
            </QuestionnairePrevious>
            <QuestionnaireSkip size="sm" variant="ghost">
              Skip &amp; send
            </QuestionnaireSkip>
            <QuestionnaireNext size="sm" />
            <QuestionnaireSubmit size="sm">Send feedback</QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>
      )}
    </section>
  );
}
