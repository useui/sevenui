"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";
import { Separator } from "@/registry/base/ui/separator";

type Frequency = "instant" | "hourly" | "daily" | "off";

const frequencies: { value: Frequency; label: string }[] = [
  { value: "instant", label: "Instantly" },
  { value: "hourly", label: "Hourly digest" },
  { value: "daily", label: "Daily digest" },
  { value: "off", label: "Off" },
];

const topics = [
  {
    id: "mentions",
    title: "Mentions and replies",
    description: "When someone @mentions you or replies to your comment.",
  },
  {
    id: "assigned",
    title: "Assigned issues",
    description: "When an issue is assigned to you or its status changes.",
  },
  {
    id: "deploys",
    title: "Failed deployments",
    description: "When a production or preview build fails.",
  },
  {
    id: "product",
    title: "Product updates",
    description: "New features and changelog highlights, about twice a month.",
  },
] as const;

type TopicId = (typeof topics)[number]["id"];

const saved: Record<TopicId, Frequency> = {
  mentions: "instant",
  assigned: "hourly",
  deploys: "instant",
  product: "off",
};

export default function NativeSelect11() {
  const [baseline, setBaseline] = React.useState(saved);
  const [values, setValues] = React.useState(saved);

  const changed = topics.filter(
    (topic) => values[topic.id] !== baseline[topic.id],
  ).length;

  return (
    <form
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
      onSubmit={(event) => {
        event.preventDefault();
        setBaseline(values);
      }}
    >
      <div className="grid gap-1 p-4">
        <h3 className="text-base font-medium">Email notifications</h3>
        <p className="text-sm text-muted-foreground">
          Choose how often each kind of update reaches your inbox.
        </p>
      </div>
      <Separator />
      <ul className="divide-y">
        {topics.map((topic) => {
          const id = `native-select-11-${topic.id}`;
          return (
            <li
              key={topic.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="grid gap-0.5">
                <label htmlFor={id} className="text-sm font-medium">
                  {topic.title}
                </label>
                <p
                  id={`${id}-description`}
                  className="text-sm text-muted-foreground"
                >
                  {topic.description}
                </p>
              </div>
              <NativeSelect
                id={id}
                aria-describedby={`${id}-description`}
                className="w-full shrink-0 sm:w-40"
                value={values[topic.id]}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [topic.id]: event.target.value as Frequency,
                  }))
                }
              >
                {frequencies.map((frequency) => (
                  <NativeSelectOption
                    key={frequency.value}
                    value={frequency.value}
                  >
                    {frequency.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </li>
          );
        })}
      </ul>
      <Separator />
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {changed === 0
            ? "All changes saved"
            : `${changed} unsaved ${changed === 1 ? "change" : "changes"}`}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={changed === 0}
            onClick={() => setValues(baseline)}
          >
            Discard
          </Button>
          <Button type="submit" disabled={changed === 0}>
            Save preferences
          </Button>
        </div>
      </div>
    </form>
  );
}
