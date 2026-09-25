"use client";

import { Hash } from "lucide-react";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/registry/base/ui/message-scroller";

type ThreadMessage = {
  id: string;
  author: string;
  mine: boolean;
  text: string;
};

const thread: ThreadMessage[] = [
  {
    id: "om-1",
    author: "Maya Chen",
    mine: false,
    text: "Movers confirmed for Saturday at 8:00. Please have desks cleared by Friday 17:00.",
  },
  {
    id: "om-2",
    author: "You",
    mine: true,
    text: "Will the monitors go in the same crates as the desks, or separately?",
  },
  {
    id: "om-3",
    author: "Daniel Ortiz",
    mine: false,
    text: "Separately. IT is packing screens and docks on Friday afternoon.",
  },
  {
    id: "om-4",
    author: "Maya Chen",
    mine: false,
    text: "Label every box with your new desk number. The floor plan is pinned above.",
  },
  {
    id: "om-5",
    author: "You",
    mine: true,
    text: "Got it. Mine is 4B-12, next to the window by the kitchen.",
  },
  {
    id: "om-6",
    author: "Daniel Ortiz",
    mine: false,
    text: "Badges for the new building activate Monday at 7:00. Old ones stop working the same day.",
  },
  {
    id: "om-7",
    author: "Maya Chen",
    mine: false,
    text: "Coffee and pastries on the fourth floor Monday morning to celebrate.",
  },
  {
    id: "om-8",
    author: "You",
    mine: true,
    text: "Perfect. I'll bring the plants from the old reception.",
  },
];

export default function MessageScroller01() {
  return (
    <Card className="w-full max-w-md gap-0 pb-0">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-1.5">
          <Hash className="size-4 text-muted-foreground" aria-hidden="true" />
          office-move
        </CardTitle>
        <CardDescription>Move to Pier 9 on Saturday, 24 members</CardDescription>
      </CardHeader>
      <MessageScrollerProvider>
        <MessageScroller className="h-80">
          <MessageScrollerViewport
            className="px-4 py-4"
            aria-label="Messages in office-move"
          >
            <MessageScrollerContent className="gap-3">
              {thread.map((message) => (
                <MessageScrollerItem
                  key={message.id}
                  messageId={message.id}
                  scrollAnchor={message.mine}
                  className="flex flex-col gap-1"
                >
                  {!message.mine ? (
                    <span className="px-3 text-xs font-medium text-muted-foreground">
                      {message.author}
                    </span>
                  ) : null}
                  <Bubble
                    variant={message.mine ? "default" : "muted"}
                    align={message.mine ? "end" : "start"}
                  >
                    <BubbleContent>{message.text}</BubbleContent>
                  </Bubble>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    </Card>
  );
}
