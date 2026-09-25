"use client";

import { CheckCircle2Icon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Slider } from "@/registry/base/ui/slider";
import { Textarea } from "@/registry/base/ui/textarea";

const scale = Array.from({ length: 11 }, (_, index) => index);

const segments = {
  detractor: {
    label: "Not likely",
    tone: "text-destructive",
    prompt: "What was the biggest letdown with Relay this month?",
    placeholder: "The export to CSV kept timing out on large boards…",
  },
  passive: {
    label: "Somewhat likely",
    tone: "text-warning",
    prompt: "What is one thing that would make Relay a 10 for you?",
    placeholder: "Recurring tasks that skip weekends…",
  },
  promoter: {
    label: "Very likely",
    tone: "text-success",
    prompt: "What would you tell a teammate about Relay?",
    placeholder: "It replaced three tools for our support team…",
  },
} as const;

function segmentFor(score: number) {
  if (score <= 6) return segments.detractor;
  if (score <= 8) return segments.passive;
  return segments.promoter;
}

export default function Slider11() {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div
        role="status"
        className="flex w-full max-w-sm flex-col items-center gap-2 rounded-xl border bg-card p-6 text-center text-card-foreground"
      >
        <p className="text-sm font-medium">No problem</p>
        <p className="text-sm text-muted-foreground">
          We will check in again next month.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-1"
          onClick={() => setDismissed(false)}
        >
          Give feedback now
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="flex w-full max-w-sm flex-col items-center gap-2 rounded-xl border bg-card p-6 text-center text-card-foreground"
      >
        <CheckCircle2Icon aria-hidden="true" className="size-6 text-success" />
        <p className="text-sm font-medium">Thanks, that helps a lot</p>
        <p className="text-sm text-muted-foreground">
          Your score of {score} goes straight to the product team. We read every
          comment.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-1"
          onClick={() => {
            setSubmitted(false);
            setScore(null);
            setComment("");
          }}
        >
          Change my answer
        </Button>
      </div>
    );
  }

  const segment = score === null ? null : segmentFor(score);

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-5 rounded-xl border bg-card p-5 text-card-foreground"
      onSubmit={(event) => {
        event.preventDefault();
        if (score !== null) setSubmitted(true);
      }}
    >
      <div className="flex flex-col gap-1">
        <h3 id="slider-11-question" className="text-sm font-medium">
          How likely are you to recommend Relay to a colleague?
        </h3>
        <p className="text-xs text-muted-foreground">
          0 is not at all likely, 10 is extremely likely.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-semibold tabular-nums">
            {score ?? "–"}
          </span>
          <span
            className={`text-sm font-medium ${segment ? segment.tone : "text-muted-foreground"}`}
          >
            {segment ? segment.label : "Drag to score"}
          </span>
        </div>
        <Slider
          aria-labelledby="slider-11-question"
          value={[score ?? 5]}
          min={0}
          max={10}
          step={1}
          className={score === null ? "opacity-60" : undefined}
          onValueChange={(value) =>
            setScore(Array.isArray(value) ? (value[0] ?? 0) : value)
          }
          // Pressing the thumb where it rests (5) fires no value change, so
          // record that resting value; a real change in the same press wins.
          onPointerDown={() => setScore((current) => current ?? 5)}
        />
        <div
          aria-hidden="true"
          className="flex justify-between text-[0.7rem] text-muted-foreground tabular-nums"
        >
          {scale.map((tick) => (
            <span
              key={tick}
              className={`w-3 text-center ${tick === score ? "font-semibold text-foreground" : ""}`}
            >
              {tick}
            </span>
          ))}
        </div>
      </div>

      {segment ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="slider-11-comment">{segment.prompt}</Label>
          <Textarea
            id="slider-11-comment"
            value={comment}
            placeholder={segment.placeholder}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setDismissed(true);
            setScore(null);
            setComment("");
          }}
        >
          Not now
        </Button>
        <Button type="submit" disabled={score === null}>
          Send feedback
        </Button>
      </div>
    </form>
  );
}
