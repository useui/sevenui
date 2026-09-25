"use client";

import * as React from "react";
import { Database, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/registry/base/ui/message";
import { Spinner } from "@/registry/base/ui/spinner";

type Answer = {
  question: string;
  summary: string;
  unit: string;
  rows: { label: string; value: number }[];
  source: string;
};

const answers: Answer[] = [
  {
    question: "Which channel drove the most revenue in August?",
    summary:
      "Organic search led August with $84.2k, 31% of revenue. Paid social grew fastest, up 18% on July.",
    unit: "k",
    rows: [
      { label: "Organic search", value: 84.2 },
      { label: "Paid social", value: 61.7 },
      { label: "Email", value: 52.9 },
      { label: "Referral", value: 38.4 },
      { label: "Direct", value: 34.1 },
    ],
    source: "orders · 12,480 rows · Aug 1–31",
  },
  {
    question: "Where do trial users drop off?",
    summary:
      "Most trials stall before inviting a teammate: only 38% get there, and 81% of those convert.",
    unit: "%",
    rows: [
      { label: "Signed up", value: 100 },
      { label: "Created project", value: 72 },
      { label: "Invited teammate", value: 38 },
      { label: "Converted", value: 31 },
    ],
    source: "events · 3,902 trials · last 90 days",
  },
];

export default function Message11() {
  const [active, setActive] = React.useState<number | null>(0);
  const [loading, setLoading] = React.useState(false);
  const [vote, setVote] = React.useState<"up" | "down" | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const ask = (index: number) => {
    if (timer.current) clearTimeout(timer.current);
    setActive(index);
    setVote(null);
    setLoading(true);
    timer.current = setTimeout(() => setLoading(false), 1100);
  };

  const answer = active === null ? null : answers[active];
  const max = answer ? Math.max(...answer.rows.map((row) => row.value)) : 1;

  return (
    <section
      aria-label="Ask your data"
      className="flex w-full max-w-md flex-col gap-4 rounded-2xl border bg-card p-4 text-card-foreground"
    >
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Ask your data</h3>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Database aria-hidden="true" className="size-3.5" />
          Acme Analytics
        </span>
      </header>

      {answer ? (
        <div aria-live="polite" className="flex flex-col gap-4">
          <Message align="end">
            <MessageContent>
              <Bubble align="end" variant="secondary">
                <BubbleContent>{answer.question}</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>

          <Message>
            <MessageAvatar className="size-8 bg-primary text-primary-foreground">
              <Sparkles aria-hidden="true" className="size-4" />
            </MessageAvatar>
            <MessageContent>
              <MessageHeader>Analyst</MessageHeader>
              {loading ? (
                <Bubble variant="ghost">
                  <BubbleContent className="flex items-center gap-2 text-muted-foreground">
                    <Spinner />
                    Querying {answer.source.split(" · ")[0]}…
                  </BubbleContent>
                </Bubble>
              ) : (
                <>
                  <Bubble variant="ghost">
                    <BubbleContent>{answer.summary}</BubbleContent>
                  </Bubble>
                  <figure className="flex w-full flex-col gap-2 rounded-xl border bg-background p-3">
                    <figcaption className="sr-only">
                      {answer.question}
                    </figcaption>
                    <dl className="flex flex-col gap-2">
                      {answer.rows.map((row, index) => (
                        <div
                          key={row.label}
                          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 text-xs sm:grid-cols-[7rem_1fr_3rem] sm:gap-y-2"
                        >
                          <dt className="truncate text-muted-foreground">
                            {row.label}
                          </dt>
                          <div
                            aria-hidden="true"
                            className="h-2 rounded-full bg-muted max-sm:col-span-2 max-sm:row-start-2"
                          >
                            <div
                              className={
                                index === 0
                                  ? "h-full rounded-full bg-chart-1"
                                  : "h-full rounded-full bg-chart-2"
                              }
                              style={{ width: `${(row.value / max) * 100}%` }}
                            />
                          </div>
                          <dd className="text-right font-medium tabular-nums">
                            {answer.unit === "k"
                              ? `$${row.value}k`
                              : `${row.value}%`}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </figure>
                  <MessageFooter className="justify-between gap-2 px-0">
                    <span className="truncate font-mono font-normal">
                      {answer.source}
                    </span>
                    <span className="flex shrink-0 gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Helpful answer"
                        aria-pressed={vote === "up"}
                        className="aria-pressed:text-foreground"
                        onClick={() => setVote(vote === "up" ? null : "up")}
                      >
                        <ThumbsUp
                          aria-hidden="true"
                          className={vote === "up" ? "fill-current" : undefined}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Unhelpful answer"
                        aria-pressed={vote === "down"}
                        className="aria-pressed:text-foreground"
                        onClick={() => setVote(vote === "down" ? null : "down")}
                      >
                        <ThumbsDown
                          aria-hidden="true"
                          className={
                            vote === "down" ? "fill-current" : undefined
                          }
                        />
                      </Button>
                    </span>
                  </MessageFooter>
                </>
              )}
            </MessageContent>
          </Message>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Ask a question in plain English. Answers are computed from your
          warehouse, never estimated.
        </p>
      )}

      <fieldset className="min-w-0 flex flex-col gap-1.5 border-t pt-3">
        <legend className="sr-only">Suggested questions</legend>
        {answers.map((item, index) => (
          <Button
            key={item.question}
            variant="ghost"
            size="sm"
            className="h-auto justify-start py-1.5 text-left whitespace-normal"
            disabled={loading}
            aria-current={active === index ? "true" : undefined}
            onClick={() => ask(index)}
          >
            {item.question}
          </Button>
        ))}
      </fieldset>
    </section>
  );
}
