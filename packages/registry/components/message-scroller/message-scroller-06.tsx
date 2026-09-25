"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
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

type Entry = { id: string; role: "user" | "assistant"; text: string };

const conversation: Entry[] = [
  {
    id: "q1",
    role: "user",
    text: "Draft a subject line for our spring sale email.",
  },
  {
    id: "a1",
    role: "assistant",
    text: "Try: \"Spring into savings: 25% off everything through Sunday.\" It leads with the benefit and gives a clear deadline.",
  },
  {
    id: "q2",
    role: "user",
    text: "Make it shorter for mobile inboxes.",
  },
  {
    id: "a2",
    role: "assistant",
    text: "\"25% off everything, ends Sunday\" fits in 32 characters, so it won't truncate on most phones.",
  },
  {
    id: "q3",
    role: "user",
    text: "What preview text should go with it?",
  },
  {
    id: "a3",
    role: "assistant",
    text: "\"New arrivals included. Free returns for 60 days.\" It adds information the subject doesn't repeat.",
  },
  {
    id: "q4",
    role: "user",
    text: "Give me an A/B variant that avoids discounts.",
  },
  {
    id: "a4",
    role: "assistant",
    text: "\"The spring collection is here\" paired with \"Linen, color, and 40 new pieces.\" Test it against the discount line on 10% of the list first.",
  },
];

const questions = conversation.filter((entry) => entry.role === "user");

function TurnStepper() {
  const { currentAnchorId } = useMessageScrollerVisibility();
  const { scrollToMessage } = useMessageScroller();
  const index = Math.max(
    0,
    questions.findIndex((question) => question.id === currentAnchorId),
  );
  const current = questions[index];

  function go(offset: number) {
    const target = questions[index + offset];
    if (target) scrollToMessage(target.id, { align: "start" });
  }

  return (
    <div className="flex items-center gap-2 border-b px-3 py-2">
      <div className="min-w-0 flex-1" aria-live="polite">
        <p className="text-xs text-muted-foreground tabular-nums">
          Question {index + 1} of {questions.length}
        </p>
        <p className="truncate text-sm font-medium">{current.text}</p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Previous question"
        disabled={index === 0}
        onClick={() => go(-1)}
      >
        <ChevronUp aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Next question"
        disabled={index === questions.length - 1}
        onClick={() => go(1)}
      >
        <ChevronDown aria-hidden="true" />
      </Button>
    </div>
  );
}

export default function MessageScroller06() {
  return (
    <MessageScrollerProvider scrollPreviousItemPeek={24}>
      <div className="flex h-96 w-full max-w-md flex-col overflow-hidden rounded-xl border bg-card">
        <TurnStepper />
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport
            className="px-3 py-4"
            aria-label="Copywriting conversation"
          >
            <MessageScrollerContent className="gap-3">
              {conversation.map((entry) => (
                <MessageScrollerItem
                  key={entry.id}
                  messageId={entry.id}
                  scrollAnchor={entry.role === "user"}
                  className="flex flex-col"
                >
                  <Bubble
                    variant={entry.role === "user" ? "default" : "muted"}
                    align={entry.role === "user" ? "end" : "start"}
                  >
                    <BubbleContent>{entry.text}</BubbleContent>
                  </Bubble>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </div>
    </MessageScrollerProvider>
  );
}
