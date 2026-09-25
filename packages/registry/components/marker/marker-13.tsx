"use client";

import * as React from "react";
import {
  CheckIcon,
  ChevronRightIcon,
  FileSearchIcon,
  SearchIcon,
  SparklesIcon,
  TableIcon,
} from "lucide-react";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";
import { Message, MessageContent } from "@/registry/base/ui/message";

const steps = [
  {
    id: "search",
    icon: SearchIcon,
    label: "Searched workspace for “churn”",
    detail: "12 results in 3 sources",
  },
  {
    id: "read",
    icon: FileSearchIcon,
    label: "Read Q3 retention review.pdf",
    detail: "Pages 4–9",
  },
  {
    id: "query",
    icon: TableIcon,
    label: "Queried subscriptions table",
    detail: "2,184 rows · 380 ms",
  },
];

export default function Marker13() {
  const [open, setOpen] = React.useState(false);
  const [feedback, setFeedback] = React.useState<"up" | "down" | null>(null);

  return (
    <section
      aria-label="Assistant conversation"
      className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <Message align="end">
        <MessageContent>
          <Bubble align="end">
            <BubbleContent>
              Why did churn go up for annual plans last quarter?
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>

      <Collapsible open={open} onOpenChange={setOpen}>
        <Marker
          render={<CollapsibleTrigger />}
          className="w-fit cursor-pointer rounded-md py-0.5 text-xs outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <MarkerIcon>
            <SparklesIcon />
          </MarkerIcon>
          <MarkerContent>Used 3 tools · 4.2s</MarkerContent>
          <ChevronRightIcon
            aria-hidden="true"
            className="size-3.5 transition-transform group-aria-expanded/marker:rotate-90"
          />
        </Marker>
        <CollapsibleContent>
          <ol
            aria-label="Tool calls"
            className="mt-2 ml-2 flex flex-col gap-2 border-l border-border pl-4"
          >
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.id}>
                  <Marker className="items-start text-xs">
                    <MarkerIcon className="mt-0.5">
                      <Icon />
                    </MarkerIcon>
                    <MarkerContent className="flex flex-col">
                      <span className="text-foreground">{step.label}</span>
                      <span>{step.detail}</span>
                    </MarkerContent>
                  </Marker>
                </li>
              );
            })}
          </ol>
        </CollapsibleContent>
      </Collapsible>

      <Message>
        <MessageContent>
          <Bubble variant="ghost">
            <BubbleContent>
              Annual churn rose from 4.1% to 6.8%, and 70% of the increase came
              from accounts that never invited a second teammate. The Q3 review
              ties this to the removal of the onboarding checklist in July.
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Marker className="w-auto text-xs">
          <MarkerContent>
            Sources: <a href="#source-retention">Q3 retention review</a>,{" "}
            <a href="#source-subscriptions">subscriptions</a>
          </MarkerContent>
        </Marker>
        <fieldset className="flex gap-1">
          <legend className="sr-only">Rate this answer</legend>
          <Button
            variant={feedback === "up" ? "secondary" : "ghost"}
            size="xs"
            aria-pressed={feedback === "up"}
            onClick={() => setFeedback(feedback === "up" ? null : "up")}
          >
            Helpful
          </Button>
          <Button
            variant={feedback === "down" ? "secondary" : "ghost"}
            size="xs"
            aria-pressed={feedback === "down"}
            onClick={() => setFeedback(feedback === "down" ? null : "down")}
          >
            Not helpful
          </Button>
        </fieldset>
      </div>

      <div role="status" className="empty:hidden">
        {feedback && (
          <Marker className="text-xs">
            <MarkerIcon>
              <CheckIcon />
            </MarkerIcon>
            <MarkerContent>Thanks — your feedback helps tune answers</MarkerContent>
          </Marker>
        )}
      </div>
    </section>
  );
}
