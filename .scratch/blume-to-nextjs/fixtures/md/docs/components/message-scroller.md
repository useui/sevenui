---
title: Message Scroller
description: Auto-scrolling chat viewport built on the shadcn MessageScroller primitive.
---

```tsx
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
```

## Installation

<InstallCommand item="message-scroller" />

Depends on the `@shadcn/react` package, installed automatically.

## Usage

```tsx
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

export function Chat({ messages }: { messages: { id: string; text: string }[] }) {
  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className="h-96">
        <MessageScrollerViewport aria-label="Conversation">
          <MessageScrollerContent>
            {messages.map((message) => (
              <MessageScrollerItem key={message.id} messageId={message.id}>
                {/* message row */}
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
```

A chat scroll container that follows streaming output while the reader
sits at the live edge, disengages the moment they scroll away, and
preserves the visible rows when older history loads above. Rows are real
DOM (no virtualization); `content-visibility: auto` keeps hundreds of
turns cheap. Give items stable `messageId`s for reliable anchoring and
jump-to.

## API reference

### MessageScrollerProvider

Headless root owning scroll state and commands.

| Prop                     | Type                                   | Default |
| ------------------------ | -------------------------------------- | ------- |
| `autoScroll`             | `boolean`                              | `true`  |
| `defaultScrollPosition`  | `"start" \| "end" \| "last-anchor"`    | `"end"` |
| `scrollEdgeThreshold`    | `number`                               | —       |
| `scrollPreviousItemPeek` | `number`                               | —       |
| `scrollMargin`           | `number`                               | —       |

Use `defaultScrollPosition="last-anchor"` when reopening saved threads;
`scrollPreviousItemPeek` keeps a slice of the previous turn visible above
a new anchor.

### MessageScroller and MessageScrollerContent

The styled frame (positions the scroll button) and the transcript
column. Extend `div` via the primitive.

### MessageScrollerViewport

The scrollable element. Label it with `aria-label`.

| Prop                      | Type      | Default |
| ------------------------- | --------- | ------- |
| `preserveScrollOnPrepend` | `boolean` | `true`  |

### MessageScrollerItem

Wraps each row for measurement and visibility tracking.

| Prop           | Type      | Default |
| -------------- | --------- | ------- |
| `messageId`    | `string`  | —       |
| `scrollAnchor` | `boolean` | `false` |

Mark conversation-turn boundaries (typically user messages) with
`scrollAnchor`.

### MessageScrollerButton

Scroll control rendered through [Button](/docs/components/button)
(`secondary` / `icon-sm` by default, swap via `render`, `variant`,
`size`). Hidden and inert while there is nothing to scroll toward.

| Prop        | Type                  | Default |
| ----------- | --------------------- | ------- |
| `direction` | `"start" \| "end"`    | `"end"` |

### Hooks

- `useMessageScroller()` — returns `scrollToMessage(messageId)`,
  `scrollToEnd()`, `scrollToStart()` for external controls.
- `useMessageScrollerVisibility()` — `currentAnchorId` and
  `visibleMessageIds` for position tracking (costs nothing until used).
- `useMessageScrollerScrollable()` — whether the viewport can scroll
  toward `start` / `end`.
