"use client";

import * as React from "react";
import { CheckIcon, PartyPopperIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

const STEPS = [
  {
    id: "workspace",
    title: "Create your workspace",
    description: "Name it and pick the region where your data is stored.",
    action: "Create workspace",
    minutes: 1,
  },
  {
    id: "domain",
    title: "Verify your sending domain",
    description:
      "Add two DNS records so emails arrive from news@yourbrand.com instead of our shared domain.",
    action: "Add DNS records",
    minutes: 5,
  },
  {
    id: "audience",
    title: "Import your audience",
    description: "Upload a CSV or sync contacts from your CRM.",
    action: "Import contacts",
    minutes: 3,
  },
  {
    id: "campaign",
    title: "Send your first campaign",
    description: "Start from a template and send a test to yourself first.",
    action: "Open editor",
    minutes: 10,
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export default function Item14() {
  const [done, setDone] = React.useState<StepId[]>(["workspace"]);

  const currentIndex = STEPS.findIndex((step) => !done.includes(step.id));
  const percent = Math.round((done.length / STEPS.length) * 100);
  const remainingMinutes = STEPS.filter((s) => !done.includes(s.id)).reduce(
    (sum, s) => sum + s.minutes,
    0,
  );

  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-4 text-card-foreground">
      <Progress value={percent} className="mb-4 gap-2">
        <ProgressLabel>Get ready to send</ProgressLabel>
        <ProgressValue className="ml-auto text-sm text-muted-foreground tabular-nums" />
      </Progress>

      {currentIndex === -1 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <PartyPopperIcon aria-hidden="true" className="size-6 text-primary" />
          <p className="text-sm font-medium">You're all set</p>
          <p className="text-sm text-muted-foreground">
            Your first campaign is on its way.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => setDone(["workspace"])}
          >
            Reset checklist
          </Button>
        </div>
      ) : (
        <>
          <p className="mb-2 text-sm text-muted-foreground">
            About {remainingMinutes} minutes left
          </p>
          <ItemGroup className="gap-1" aria-label="Setup steps">
            {STEPS.map((step, index) => {
              const isDone = done.includes(step.id);
              const isCurrent = index === currentIndex;
              return (
                <Item
                  key={step.id}
                  role="listitem"
                  variant={isCurrent ? "outline" : "default"}
                  aria-current={isCurrent ? "step" : undefined}
                  className={isCurrent ? "bg-muted/40" : undefined}
                >
                  <ItemMedia>
                    <span
                      className={
                        isDone
                          ? "flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                          : isCurrent
                            ? "flex size-6 items-center justify-center rounded-full border-2 border-primary text-xs font-semibold text-primary tabular-nums"
                            : "flex size-6 items-center justify-center rounded-full border text-xs text-muted-foreground tabular-nums"
                      }
                    >
                      {isDone ? (
                        <CheckIcon aria-hidden="true" className="size-3.5" />
                      ) : (
                        index + 1
                      )}
                    </span>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle
                      className={
                        isDone
                          ? "text-muted-foreground line-through decoration-muted-foreground/60"
                          : undefined
                      }
                    >
                      {step.title}
                      <span className="sr-only">
                        {isDone ? "(completed)" : ""}
                      </span>
                    </ItemTitle>
                    {isCurrent && (
                      <ItemDescription className="line-clamp-none">
                        {step.description}
                      </ItemDescription>
                    )}
                  </ItemContent>
                  {isCurrent ? (
                    <ItemActions className="basis-full pl-8.5 sm:basis-auto sm:pl-0">
                      <Button
                        size="sm"
                        onClick={() => setDone((prev) => [...prev, step.id])}
                      >
                        {step.action}
                      </Button>
                    </ItemActions>
                  ) : (
                    !isDone && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {step.minutes} min
                      </span>
                    )
                  )}
                </Item>
              );
            })}
          </ItemGroup>
        </>
      )}
    </div>
  );
}
