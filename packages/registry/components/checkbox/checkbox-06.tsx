"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";

const MAX_REVIEWERS = 2;

const teammates = [
  { id: "maya", name: "Maya Chen", role: "Frontend lead", initials: "MC" },
  {
    id: "daniel",
    name: "Daniel Okafor",
    role: "Design systems",
    initials: "DO",
  },
  { id: "priya", name: "Priya Raman", role: "Accessibility", initials: "PR" },
  { id: "lucas", name: "Lucas Moreau", role: "Platform", initials: "LM" },
];

export default function Checkbox06() {
  const id = React.useId();
  const [reviewers, setReviewers] = React.useState<string[]>(["priya"]);
  const [requested, setRequested] = React.useState(false);

  const limitReached = reviewers.length >= MAX_REVIEWERS;

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-0.5 border-b border-border px-4 py-3">
        <p id={`${id}-title`} className="text-sm font-medium">
          Request reviewers
        </p>
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          Pick up to {MAX_REVIEWERS} people for “Refine date picker focus”.
        </p>
      </div>
      <ul
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-hint`}
        className="flex flex-col p-1.5"
      >
        {teammates.map((person) => {
          const checkboxId = `${id}-${person.id}`;
          const checked = reviewers.includes(person.id);
          const disabled = !checked && limitReached;
          return (
            <li key={person.id}>
              <label
                htmlFor={checkboxId}
                data-disabled={disabled || undefined}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/60 has-data-checked:bg-muted data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-transparent"
              >
                <Avatar>
                  <AvatarImage src="/placeholder.svg" alt="" />
                  <AvatarFallback className="text-xs">
                    {person.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {person.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {person.role}
                  </span>
                </span>
                <Checkbox
                  id={checkboxId}
                  className="after:hidden"
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={(value) => {
                    setRequested(false);
                    setReviewers((current) =>
                      value
                        ? [...current, person.id]
                        : current.filter((item) => item !== person.id),
                    );
                  }}
                />
              </label>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {requested
            ? "Review requested"
            : limitReached
              ? "Limit reached"
              : `${MAX_REVIEWERS - reviewers.length} more allowed`}
        </p>
        <Button
          size="sm"
          disabled={reviewers.length === 0 || requested}
          onClick={() => setRequested(true)}
        >
          {reviewers.length > 1
            ? `Request ${reviewers.length} reviews`
            : "Request review"}
        </Button>
      </div>
    </div>
  );
}
