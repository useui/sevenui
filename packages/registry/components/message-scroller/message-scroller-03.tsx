"use client";

import { ArrowDown } from "lucide-react";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/registry/base/ui/message-scroller";

const review = [
  {
    id: "rv-1",
    author: "Nora Blake",
    text: "Opening the review for the billing refactor. The main change moves proration out of the invoice builder into its own module.",
  },
  {
    id: "rv-2",
    author: "Sam Whitfield",
    text: "Read through it once. The new module is much easier to follow; the old version had three nested ternaries for mid-cycle upgrades.",
  },
  {
    id: "rv-3",
    author: "Nora Blake",
    text: "That was the goal. Tests cover upgrades, downgrades, and seat changes on the same day.",
  },
  {
    id: "rv-4",
    author: "Sam Whitfield",
    text: "One question: do credits still round half-up? Finance flagged a one-cent drift last quarter.",
  },
  {
    id: "rv-5",
    author: "Nora Blake",
    text: "They round half-even now, matching the ledger service. I added a regression test with last quarter's invoice.",
  },
  {
    id: "rv-6",
    author: "Priya Nair",
    text: "Joining late. Is the migration reversible if we see drift after deploy?",
  },
  {
    id: "rv-7",
    author: "Nora Blake",
    text: "Yes. The old builder stays behind a flag for two billing cycles, and the shadow comparison job logs every mismatch.",
  },
  {
    id: "rv-8",
    author: "Priya Nair",
    text: "Perfect. Approving once the flag default is documented in the runbook.",
  },
  {
    id: "rv-9",
    author: "Sam Whitfield",
    text: "Approved from my side as well. Nice work on the test fixtures.",
  },
];

export default function MessageScroller03() {
  return (
    <MessageScrollerProvider defaultScrollPosition="start">
      <MessageScroller className="h-96 w-full max-w-md rounded-xl border bg-muted/40">
        <MessageScrollerViewport
          className="px-3 py-14"
          aria-label="Code review discussion"
        >
          <MessageScrollerContent className="gap-4">
            {review.map((comment) => (
              <MessageScrollerItem
                key={comment.id}
                messageId={comment.id}
                className="flex flex-col gap-1"
              >
                <span className="px-3 text-xs font-medium text-muted-foreground">
                  {comment.author}
                </span>
                <Bubble variant="outline">
                  <BubbleContent className="rounded-2xl rounded-ss-md">
                    {comment.text}
                  </BubbleContent>
                </Bubble>
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton
          direction="start"
          variant="outline"
          size="sm"
          className="rounded-full shadow-sm"
        >
          <ArrowDown aria-hidden="true" />
          First comment
        </MessageScrollerButton>
        <MessageScrollerButton
          variant="default"
          size="sm"
          className="rounded-full border-transparent bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:text-primary-foreground"
        >
          <ArrowDown aria-hidden="true" />
          Latest comment
        </MessageScrollerButton>
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
