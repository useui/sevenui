"use client";

import { Check, RotateCcw } from "lucide-react";
import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";
import { Button } from "@/registry/base/ui/button";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

const steps = [
  {
    value: "profile",
    title: "Complete your profile",
    body: "Add a photo and your role so teammates know who is reviewing their work.",
    action: "Upload photo",
  },
  {
    value: "invite",
    title: "Invite your team",
    body: "Projects move faster with reviewers. Invite at least two teammates by email or share a join link.",
    action: "Send invites",
  },
  {
    value: "repository",
    title: "Connect a repository",
    body: "Link a GitHub or GitLab repository to get preview deployments on every pull request.",
    action: "Connect GitHub",
  },
  {
    value: "deploy",
    title: "Ship your first deploy",
    body: "Push to your default branch. We build, test, and publish it to a production URL in about a minute.",
    action: "View deploy guide",
  },
];

export default function Accordion12() {
  const [done, setDone] = React.useState<string[]>(["profile"]);
  const [open, setOpen] = React.useState<string[]>(["invite"]);

  const completed = done.length;
  const allDone = completed === steps.length;

  function complete(value: string) {
    const nextDone = [...done, value];
    setDone(nextDone);
    const next = steps.find((step) => !nextDone.includes(step.value));
    setOpen(next ? [next.value] : []);
  }

  function reset() {
    setDone([]);
    setOpen([steps[0].value]);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-5 rounded-xl border bg-card p-5 text-card-foreground">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold">
          {allDone ? "You're all set" : "Get started with Relay"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {allDone
            ? "Your workspace is ready. Happy shipping."
            : "Finish these steps to unlock preview deployments."}
        </p>
      </div>
      <Progress value={(completed / steps.length) * 100}>
        <ProgressLabel className="text-xs text-muted-foreground">
          Setup progress
        </ProgressLabel>
        <ProgressValue className="text-xs">
          {() => `${completed} of ${steps.length}`}
        </ProgressValue>
      </Progress>
      <Accordion value={open} onValueChange={setOpen} className="-mx-2">
        {steps.map((step) => {
          const isDone = done.includes(step.value);
          return (
            <AccordionItem
              key={step.value}
              value={step.value}
              className="border-none"
            >
              <AccordionTrigger className="items-center gap-3 px-2 hover:bg-muted/60 hover:no-underline">
                <span
                  className={
                    isDone
                      ? "flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      : "size-5 shrink-0 rounded-full border-2 border-dashed border-muted-foreground/40"
                  }
                >
                  {isDone && <Check aria-hidden="true" className="size-3" />}
                </span>
                <span
                  className={
                    isDone
                      ? "flex-1 text-muted-foreground line-through decoration-muted-foreground/50"
                      : "flex-1"
                  }
                >
                  {step.title}
                  <span className="sr-only">
                    {isDone ? " (completed)" : " (to do)"}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pr-2 pl-10">
                <p className="text-muted-foreground">{step.body}</p>
                {isDone ? (
                  <p className="flex items-center gap-1.5 text-xs font-medium">
                    <Check aria-hidden="true" className="size-3.5 text-primary" />
                    Done
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {/* Doing the step's action is what completes it; "Mark as
                        done" is the shortcut for steps finished elsewhere. */}
                    <Button size="sm" onClick={() => complete(step.value)}>
                      {step.action}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => complete(step.value)}
                    >
                      Mark as done
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      {allDone && (
        <Button variant="outline" size="sm" className="self-start" onClick={reset}>
          <RotateCcw aria-hidden="true" data-icon="inline-start" />
          Restart checklist
        </Button>
      )}
    </div>
  );
}
