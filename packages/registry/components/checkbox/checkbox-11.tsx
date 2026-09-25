"use client";

import { useId, useState } from "react";
import { CheckIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

const sources = [
  { id: "search", label: "Search engine" },
  { id: "podcast", label: "Podcast or newsletter" },
  { id: "friend", label: "A friend or colleague" },
  { id: "social", label: "LinkedIn or X" },
  { id: "event", label: "Conference or meetup" },
  { id: "other", label: "Something else" },
];

// Picking this clears every other answer, and vice versa.
const NONE = "none";

export default function Checkbox11() {
  const id = useId();
  const [answers, setAnswers] = useState<string[]>(["podcast"]);
  const [otherText, setOtherText] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [sent, setSent] = useState(false);

  const otherChecked = answers.includes("other");
  const otherMissing = otherChecked && otherText.trim() === "";
  const showOtherError = attempted && otherMissing;

  function toggle(value: string, checked: boolean) {
    setAnswers((current) => {
      if (!checked) return current.filter((item) => item !== value);
      if (value === NONE) return [NONE];
      return [...current.filter((item) => item !== NONE), value];
    });
  }

  if (sent) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center text-card-foreground">
        <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
          <CheckIcon aria-hidden="true" className="size-4" />
        </span>
        <div>
          <p className="text-sm font-medium">Thanks, that helps a lot</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            You're all set. Your workspace is ready.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSent(false);
            setAttempted(false);
          }}
        >
          Change my answer
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="w-full max-w-sm rounded-xl border border-border bg-card p-5 text-card-foreground"
      onSubmit={(event) => {
        event.preventDefault();
        setAttempted(true);
        if (answers.length > 0 && !otherMissing) setSent(true);
      }}
    >
      <FieldSet className="gap-3">
        <FieldLegend className="mb-1 leading-snug">
          How did you hear about Tandem?
        </FieldLegend>
        <p className="text-sm text-muted-foreground">
          Select all that apply.
        </p>
        <div className="flex flex-col gap-1">
          {sources.map((source) => (
            <Field
              key={source.id}
              orientation="horizontal"
              className="rounded-md px-2 py-1.5 hover:bg-muted/60"
            >
              <Checkbox
                name="source"
                value={source.id}
                checked={answers.includes(source.id)}
                onCheckedChange={(checked) => toggle(source.id, checked)}
              />
              <FieldLabel className="flex-1 font-normal">
                {source.label}
              </FieldLabel>
            </Field>
          ))}

          {otherChecked ? (
            <Field invalid={showOtherError} className="ps-8 pe-2 pb-1">
              <FieldLabel htmlFor={`${id}-other`} className="sr-only">
                Where did you hear about us?
              </FieldLabel>
              <Input
                id={`${id}-other`}
                placeholder="e.g. a YouTube review"
                value={otherText}
                aria-invalid={showOtherError || undefined}
                onChange={(event) => setOtherText(event.target.value)}
              />
              {showOtherError ? (
                <FieldError>Tell us where, or uncheck this option.</FieldError>
              ) : null}
            </Field>
          ) : null}

          <div className="my-1 h-px bg-border" />

          <Field
            orientation="horizontal"
            className="rounded-md px-2 py-1.5 hover:bg-muted/60"
          >
            <Checkbox
              name="source"
              value={NONE}
              checked={answers.includes(NONE)}
              onCheckedChange={(checked) => toggle(NONE, checked)}
            />
            <FieldLabel className="flex-1 font-normal">
              I don't remember
            </FieldLabel>
          </Field>
        </div>
      </FieldSet>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p
          aria-live="polite"
          className="text-xs text-muted-foreground data-[error=true]:text-destructive"
          data-error={attempted && answers.length === 0}
        >
          {attempted && answers.length === 0
            ? "Pick at least one answer."
            : "Step 3 of 3"}
        </p>
        <Button type="submit">Finish</Button>
      </div>
    </form>
  );
}
