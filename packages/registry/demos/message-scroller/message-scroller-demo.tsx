"use client";

import * as React from "react";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/registry/base/ui/message-scroller";

type ChatMessage = { id: string; from: "emma" | "you"; text: string };

const seed: ChatMessage[] = [
  { id: "m1", from: "emma", text: "Morning! Ready for the release?" },
  { id: "m2", from: "you", text: "Almost — docs are the last piece." },
  { id: "m3", from: "emma", text: "Which components are left?" },
  { id: "m4", from: "you", text: "The chat family: bubble, message, scroller." },
  { id: "m5", from: "emma", text: "Nice. Screenshots for the changelog too?" },
  { id: "m6", from: "you", text: "Good call, I'll capture them today." },
  { id: "m7", from: "emma", text: "Then let's ship tomorrow morning." },
  { id: "m8", from: "you", text: "Works for me. Scroll up to test the button!" },
];

const replies = [
  "Auto-scroll keeps you pinned to the newest message.",
  "Unless you've scrolled up — then it won't interrupt you.",
  "The arrow button brings you back to the live edge.",
];

export default function MessageScrollerDemo() {
  const [messages, setMessages] = React.useState(seed);

  function simulateReply() {
    setMessages((prev) => [
      ...prev,
      {
        id: `m${prev.length + 1}`,
        from: "emma",
        text: replies[(prev.length - seed.length) % replies.length],
      },
    ]);
  }

  return (
    <div className="flex h-96 w-full max-w-md flex-col gap-3">
      <MessageScrollerProvider autoScroll>
        <MessageScroller className="flex-1 rounded-xl border">
          <MessageScrollerViewport className="p-3" aria-label="Conversation">
            <MessageScrollerContent className="gap-2">
              {messages.map((message) => (
                <MessageScrollerItem
                  key={message.id}
                  messageId={message.id}
                  scrollAnchor={message.from === "you"}
                  className="flex flex-col"
                >
                  <Bubble
                    variant={message.from === "emma" ? "muted" : "default"}
                    align={message.from === "you" ? "end" : "start"}
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
      <Button variant="outline" onClick={simulateReply}>
        Simulate reply
      </Button>
    </div>
  );
}
