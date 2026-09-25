"use client";

import { useState } from "react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const reviewers = [
  {
    value: "maya",
    name: "Maya Lindqvist",
    initials: "ML",
    role: "Frontend lead",
    load: "1 open review",
    online: true,
  },
  {
    value: "tomas",
    name: "Tomás Ferreira",
    initials: "TF",
    role: "Design systems",
    load: "4 open reviews",
    online: true,
  },
  {
    value: "priya",
    name: "Priya Raman",
    initials: "PR",
    role: "Accessibility",
    load: "2 open reviews",
    online: false,
  },
];

export default function RadioGroup07() {
  const [reviewer, setReviewer] = useState("maya");
  const selected = reviewers.find((person) => person.value === reviewer);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p id="radio-group-07-label" className="text-sm font-medium">
          Request review from
        </p>
        <p
          aria-live="polite"
          className="truncate text-xs text-muted-foreground"
        >
          {selected ? `${selected.name.split(" ")[0]} gets notified` : null}
        </p>
      </div>
      <RadioGroup
        value={reviewer}
        onValueChange={(value) => setReviewer(value as string)}
        aria-labelledby="radio-group-07-label"
        className="gap-1"
      >
        {reviewers.map((person) => (
          <Label
            key={person.value}
            className="cursor-pointer gap-3 rounded-lg border border-transparent px-2.5 py-2 font-normal transition-colors hover:bg-muted/50 has-data-checked:border-border has-data-checked:bg-card"
          >
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt="" />
              <AvatarFallback>{person.initials}</AvatarFallback>
              <AvatarBadge
                className={
                  person.online ? "bg-success" : "bg-muted-foreground/60"
                }
              />
            </Avatar>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate font-medium">{person.name}</span>
              <span className="text-xs leading-snug text-muted-foreground sm:truncate">
                {person.role} · {person.online ? "Online" : "Away"} ·{" "}
                {person.load}
              </span>
            </span>
            <RadioGroupItem value={person.value} />
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
