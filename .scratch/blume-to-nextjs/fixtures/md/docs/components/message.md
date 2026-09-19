---
title: Message
description: Chat message layout with avatar, content, header, and footer.
---

```tsx
"use client";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/registry/base/ui/message";

export default function MessageDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Message>
        <MessageAvatar>
          <Avatar className="size-8">
            <AvatarFallback>EC</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Emma · 09:41</MessageHeader>
          <MessageGroup>
            <Bubble variant="muted">
              <BubbleContent>
                Hey! Did you get a chance to look at the new landing page?
              </BubbleContent>
            </Bubble>
            <Bubble variant="muted">
              <BubbleContent>No rush — just curious.</BubbleContent>
            </Bubble>
          </MessageGroup>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <Bubble align="end">
            <BubbleContent>
              Just did — the exposed grid looks great on mobile.
            </BubbleContent>
          </Bubble>
          <MessageFooter>Delivered</MessageFooter>
        </MessageContent>
      </Message>
    </div>
  );
}
```

## Installation

<InstallCommand item="message" />

## Usage

```tsx
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message";

export function IncomingMessage() {
  return (
    <Message>
      <MessageAvatar>{/* avatar */}</MessageAvatar>
      <MessageContent>
        <MessageHeader>Emma · 09:41</MessageHeader>
        <Bubble variant="muted">
          <BubbleContent>Hello!</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}
```

Message owns the row layout — avatar, alignment, header, and footer —
while the visible surface is rendered inside it, typically with
[Bubble](/docs/components/bubble). Wrap conversations in
[Message Scroller](/docs/components/message-scroller) for scrolling.
The avatar anchors to the bottom of the row and shifts up when a footer
is present.

## API reference

### Message

Extends `div`. The row wrapper; `align="end"` reverses the row for
outgoing messages and end-aligns the content's children.

| Prop    | Type                  | Default   |
| ------- | --------------------- | --------- |
| `align` | `"start" \| "end"`    | `"start"` |

### MessageGroup, MessageAvatar, MessageContent, MessageHeader, MessageFooter

Structural wrappers extending `div`. `MessageGroup` stacks consecutive
messages from one sender; `MessageHeader` and `MessageFooter` render
muted meta rows above and below the surface.
