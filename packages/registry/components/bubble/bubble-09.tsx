"use client";

import * as React from "react";
import { LifeBuoyIcon, RotateCcwIcon } from "lucide-react";

import { Bubble, BubbleContent, BubbleGroup } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";

type Topic = {
  id: string;
  label: string;
  answer: string;
};

const topics: Topic[] = [
  {
    id: "invoice",
    label: "Where is my invoice?",
    answer:
      "Invoices live in Settings → Billing → History. Each one is emailed to the billing contact on the day it is issued.",
  },
  {
    id: "seats",
    label: "Add seats to my plan",
    answer:
      "Owners can add seats from Settings → Members. You are only charged for the remaining days of the current cycle.",
  },
  {
    id: "export",
    label: "Export my workspace data",
    answer:
      "Go to Settings → Workspace → Export. We package every project as a ZIP and email you a download link within 10 minutes.",
  },
];

type Turn = { from: "user" | "bot"; text: string };

export default function Bubble09() {
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const answered = turns.length > 0;

  function pick(topic: Topic) {
    setTurns([
      { from: "user", text: topic.label },
      { from: "bot", text: topic.answer },
    ]);
  }

  return (
    <section
      aria-label="Help chat"
      className="flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm"
    >
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-muted">
          <LifeBuoyIcon aria-hidden className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-sm font-medium">Help center</h2>
          <p className="text-xs text-muted-foreground">
            Instant answers, people on call{" "}
            <span className="whitespace-nowrap">9–6 CET</span>
          </p>
        </div>
        {answered && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Start over"
            onClick={() => setTurns([])}
          >
            <RotateCcwIcon aria-hidden />
          </Button>
        )}
      </header>

      <div className="flex flex-col gap-4 p-4" aria-live="polite">
        <BubbleGroup>
          <Bubble variant="muted">
            <BubbleContent>
              Hi Maya — what can we help you with today?
            </BubbleContent>
          </Bubble>
        </BubbleGroup>

        {turns.map((turn) => (
          <Bubble
            key={turn.from}
            align={turn.from === "user" ? "end" : "start"}
            variant={turn.from === "user" ? "default" : "muted"}
          >
            <BubbleContent>{turn.text}</BubbleContent>
          </Bubble>
        ))}

        {!answered ? (
          <fieldset className="min-w-0 flex flex-col items-end gap-1.5">
            <legend className="sr-only">Suggested questions</legend>
            {topics.map((topic) => (
              <Bubble key={topic.id} variant="outline" align="end">
                <BubbleContent
                  render={<button type="button" />}
                  onClick={() => pick(topic)}
                >
                  {topic.label}
                </BubbleContent>
              </Bubble>
            ))}
          </fieldset>
        ) : (
          <div className="flex flex-wrap justify-end gap-1.5">
            <Bubble variant="outline" align="end">
              <BubbleContent
                render={<button type="button" />}
                onClick={() => setTurns([])}
              >
                Ask something else
              </BubbleContent>
            </Bubble>
            <Bubble variant="tinted" align="end">
              <BubbleContent render={<a href="#contact" />}>
                Talk to a person
              </BubbleContent>
            </Bubble>
          </div>
        )}
      </div>
    </section>
  );
}
