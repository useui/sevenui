"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronUpIcon, PauseIcon, PlayIcon } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerVisibility,
} from "@/registry/base/ui/message-scroller";

type Line = {
  id: string;
  speaker: "Interviewer" | "Rosa";
  time: string;
  text: string;
  insight?: boolean;
};

type Topic = { id: string; title: string; lines: Line[] };

const topics: Topic[] = [
  {
    id: "topic-role",
    title: "Role and team",
    lines: [
      { id: "l1", speaker: "Interviewer", time: "00:42", text: "To start, can you tell me about your role and who you work with day to day?" },
      { id: "l2", speaker: "Rosa", time: "00:51", text: "I run finance operations for a 140-person company. My team is three people, and we close the books every month with a lot of spreadsheets." },
      { id: "l3", speaker: "Rosa", time: "01:20", text: "Most of my week is chasing receipts from managers who are traveling." },
    ],
  },
  {
    id: "topic-workflow",
    title: "Current workflow",
    lines: [
      { id: "l4", speaker: "Interviewer", time: "03:05", text: "Walk me through the last expense report you approved." },
      { id: "l5", speaker: "Rosa", time: "03:14", text: "It came in as a forwarded email with six photos of receipts. Two were blurry, so I had to message him on Slack and wait a day.", insight: true },
      { id: "l6", speaker: "Rosa", time: "04:02", text: "Then I retype everything into the ERP because the export from our card provider doesn't map categories." },
    ],
  },
  {
    id: "topic-pain",
    title: "Biggest frustration",
    lines: [
      { id: "l7", speaker: "Interviewer", time: "06:30", text: "If you could fix one part of that, what would it be?" },
      { id: "l8", speaker: "Rosa", time: "06:38", text: "Month-end. The last three days are just reconciliation. If receipts matched to card transactions automatically, I'd get two days back.", insight: true },
      { id: "l9", speaker: "Rosa", time: "07:15", text: "And honestly, the back-and-forth with managers makes finance look like the bad guy." },
    ],
  },
  {
    id: "topic-pricing",
    title: "Pricing expectations",
    lines: [
      { id: "l10", speaker: "Interviewer", time: "09:48", text: "How do you usually evaluate the cost of a tool like this?" },
      { id: "l11", speaker: "Rosa", time: "09:57", text: "Per seat pricing is a hard sell. Only approvers really use it. I'd rather pay per active card or a flat platform fee.", insight: true },
      { id: "l12", speaker: "Rosa", time: "10:40", text: "Anything under what we pay for our current card program would get approved without a committee." },
    ],
  },
  {
    id: "topic-wrap",
    title: "Wrap-up",
    lines: [
      { id: "l13", speaker: "Interviewer", time: "12:10", text: "Would you be open to trying an early version next month?" },
      { id: "l14", speaker: "Rosa", time: "12:16", text: "Yes, if it can import our card feed. That's the dealbreaker for us." },
    ],
  },
];

function TopicNavigator() {
  const { scrollToMessage } = useMessageScroller();
  const { currentAnchorId } = useMessageScrollerVisibility();
  const activeIndex = Math.max(
    0,
    topics.findIndex((topic) => topic.id === currentAnchorId),
  );

  function go(index: number) {
    const topic = topics[index];
    if (topic) {
      scrollToMessage(topic.id, { align: "start", behavior: "smooth" });
    }
  }

  return (
    <>
      <nav
        aria-label="Interview topics"
        className="hidden border-r p-2 sm:block"
      >
        <ol className="space-y-0.5">
          {topics.map((topic, index) => {
            const insights = topic.lines.filter((line) => line.insight).length;
            const active = index === activeIndex;
            return (
              <li key={topic.id}>
                <button
                  type="button"
                  onClick={() => go(index)}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                    active && "bg-accent font-medium text-accent-foreground",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{topic.title}</span>
                  {insights > 0 ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="size-1.5 shrink-0 rounded-full bg-chart-4"
                      />
                      <span className="sr-only">
                        {`, ${insights} ${insights === 1 ? "insight" : "insights"}`}
                      </span>
                    </>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="flex items-center gap-1 border-b px-3 py-2 sm:hidden">
        <p className="min-w-0 flex-1 truncate text-sm" aria-live="polite">
          <span className="text-muted-foreground">
            {activeIndex + 1}/{topics.length}
          </span>{" "}
          <span className="font-medium">{topics[activeIndex].title}</span>
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => go(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous topic"
        >
          <ChevronUpIcon aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => go(activeIndex + 1)}
          disabled={activeIndex === topics.length - 1}
          aria-label="Next topic"
        >
          <ChevronDownIcon aria-hidden="true" />
        </Button>
      </div>
    </>
  );
}

export default function MessageScroller13() {
  const [playingId, setPlayingId] = React.useState<string | null>(null);
  const playing = topics
    .flatMap((topic) => topic.lines)
    .find((line) => line.id === playingId);
  const insightCount = topics
    .flatMap((topic) => topic.lines)
    .filter((line) => line.insight).length;

  return (
    <section
      aria-labelledby="transcript-title"
      className="flex h-[32rem] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 id="transcript-title" className="text-sm font-medium">
            Rosa Alvarez, Finance Ops Lead
          </h2>
          <p className="text-xs text-muted-foreground">
            Discovery interview · Sep 18 · 13 min
          </p>
        </div>
        <p
          className="text-xs text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          {playing ? `Playing from ${playing.time}` : null}
        </p>
        <Badge variant="secondary">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-chart-4" />
          {insightCount} insights
        </Badge>
      </header>
      <MessageScrollerProvider
        autoScroll={false}
        defaultScrollPosition="start"
        scrollMargin={8}
      >
        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] sm:grid-cols-[12rem_1fr] sm:grid-rows-1">
          <TopicNavigator />
          <MessageScroller>
            <MessageScrollerViewport
              className="px-4 pb-4"
              aria-label="Interview transcript"
            >
              <MessageScrollerContent className="gap-1">
                {topics.map((topic) => (
                  <React.Fragment key={topic.id}>
                    <MessageScrollerItem
                      messageId={topic.id}
                      scrollAnchor
                      className="pt-4 pb-1 [contain-intrinsic-size:auto_2.5rem]"
                    >
                      <h3 className="text-sm font-medium">
                        {topic.title}
                      </h3>
                    </MessageScrollerItem>
                    {topic.lines.map((line) => (
                      <MessageScrollerItem
                        key={line.id}
                        messageId={line.id}
                        className={cn(
                          "group/line grid grid-cols-[3rem_1fr] gap-2 rounded-md px-2 py-1.5 [contain-intrinsic-size:auto_4rem]",
                          line.insight && "bg-chart-4/10",
                        )}
                      >
                        <button
                          type="button"
                          className={cn(
                            "flex h-5 items-center gap-1 self-start rounded text-xs text-muted-foreground tabular-nums outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                            playingId === line.id && "font-medium text-foreground",
                          )}
                          aria-label={`Play from ${line.time}`}
                          aria-pressed={playingId === line.id}
                          onClick={() =>
                            setPlayingId((current) =>
                              current === line.id ? null : line.id,
                            )
                          }
                        >
                          {playingId === line.id ? (
                            <PauseIcon aria-hidden="true" className="size-3" />
                          ) : (
                            <PlayIcon
                              aria-hidden="true"
                              className="size-3 opacity-0 transition-opacity group-hover/line:opacity-100 group-focus-within/line:opacity-100"
                            />
                          )}
                          {line.time}
                        </button>
                        <p className="min-w-0 text-sm text-pretty">
                          <span
                            className={cn(
                              "me-1.5 font-medium",
                              line.speaker === "Interviewer" &&
                                "text-muted-foreground",
                            )}
                          >
                            {line.speaker}
                          </span>
                          {line.text}
                        </p>
                      </MessageScrollerItem>
                    ))}
                  </React.Fragment>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton direction="start" />
            <MessageScrollerButton direction="end" />
          </MessageScroller>
        </div>
      </MessageScrollerProvider>
    </section>
  );
}
