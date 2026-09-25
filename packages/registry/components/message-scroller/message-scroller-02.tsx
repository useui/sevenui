"use client";

import { Sparkles } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/registry/base/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/registry/base/ui/message-scroller";

type Turn = {
  id: string;
  role: "user" | "assistant";
  time: string;
  text: string;
};

const turns: Turn[] = [
  {
    id: "as-1",
    role: "user",
    time: "10:02",
    text: "Why did our p95 latency jump after Tuesday's deploy?",
  },
  {
    id: "as-2",
    role: "assistant",
    time: "10:02",
    text: "The regression lines up with the new session middleware. It now reads the user profile on every request instead of once per session, which adds a database round trip to each call.",
  },
  {
    id: "as-3",
    role: "user",
    time: "10:04",
    text: "How much of the jump does that explain?",
  },
  {
    id: "as-4",
    role: "assistant",
    time: "10:04",
    text: "Roughly 38 ms of the 45 ms increase. The remaining 7 ms comes from larger JSON payloads on the /orders endpoint, which now embeds shipping estimates.",
  },
  {
    id: "as-5",
    role: "user",
    time: "10:06",
    text: "What's the smallest fix we can ship today?",
  },
  {
    id: "as-6",
    role: "assistant",
    time: "10:06",
    text: "Cache the profile on the session object with a five-minute TTL. It's a single-file change in middleware/session.ts and keeps the new behavior for profile edits, since those already invalidate the session.",
  },
];

export default function MessageScroller02() {
  return (
    <MessageScrollerProvider>
      <MessageScroller className="h-96 w-full max-w-lg">
        <MessageScrollerViewport aria-label="Assistant conversation">
          <MessageScrollerContent className="gap-5 py-2 pe-2">
            {turns.map((turn) =>
              turn.role === "user" ? (
                <MessageScrollerItem
                  key={turn.id}
                  messageId={turn.id}
                  scrollAnchor
                >
                  <Message align="end">
                    <MessageAvatar>
                      <Avatar size="sm">
                        <AvatarImage src="/placeholder.svg" alt="" />
                        <AvatarFallback>JL</AvatarFallback>
                      </Avatar>
                    </MessageAvatar>
                    <MessageContent>
                      <Bubble variant="tinted" align="end">
                        <BubbleContent>{turn.text}</BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ) : (
                <MessageScrollerItem key={turn.id} messageId={turn.id}>
                  <Message>
                    <MessageAvatar className="size-6 self-start bg-primary text-primary-foreground">
                      <Sparkles className="size-3.5" aria-hidden="true" />
                    </MessageAvatar>
                    <MessageContent className="gap-1">
                      <MessageHeader>
                        Assistant
                        <span className="ms-2 font-normal tabular-nums">
                          {turn.time}
                        </span>
                      </MessageHeader>
                      <Bubble variant="ghost">
                        <BubbleContent className="text-pretty">
                          {turn.text}
                        </BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ),
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton variant="outline" className="shadow-sm" />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
