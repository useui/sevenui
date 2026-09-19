---
title: Bubble
description: Chat message bubbles for conversational interfaces.
---

```tsx
"use client";

import { Bubble, BubbleContent, BubbleGroup } from "@/registry/base/ui/bubble";

export default function BubbleDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <BubbleGroup>
        <Bubble variant="muted">
          <BubbleContent>Are we still on for the design review?</BubbleContent>
        </Bubble>
        <Bubble variant="muted">
          <BubbleContent>I can move it if you need more time.</BubbleContent>
        </Bubble>
      </BubbleGroup>
      <Bubble align="end">
        <BubbleContent>Yes — see you at 3pm.</BubbleContent>
      </Bubble>
    </div>
  );
}
```

## Installation

<InstallCommand item="bubble" />

## Usage

```tsx
import { Bubble, BubbleContent } from "@/components/ui/bubble";

export function Reply() {
  return (
    <Bubble align="end">
      <BubbleContent>Yes — see you at 3pm.</BubbleContent>
    </Bubble>
  );
}
```

Bubble is scoped to the visible message surface. Pair it with
[Message](/docs/components/message) for row layout (avatar, header,
footer) and `BubbleGroup` for consecutive bubbles from one sender. Make
a bubble interactive by rendering its content as a real element:
`<BubbleContent render={<button />}>`.

## Examples

### Variants

The `ghost` variant drops the background, padding, and max-width — meant
for assistant/AI content that should span the full column.

```tsx
"use client";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";

const variants = [
  "default",
  "secondary",
  "muted",
  "tinted",
  "outline",
  "ghost",
  "destructive",
] as const;

export default function BubbleVariants() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      {variants.map((variant) => (
        <Bubble key={variant} variant={variant}>
          <BubbleContent className="capitalize">{variant}</BubbleContent>
        </Bubble>
      ))}
    </div>
  );
}
```

### Reactions

`BubbleReactions` overlaps the bubble edge; position it with `side` and
`align`.

```tsx
"use client";

import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/registry/base/ui/bubble";

export default function BubbleReactionsDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <Bubble variant="muted">
        <BubbleContent>We just hit 1,000 installs! 🎉</BubbleContent>
        <BubbleReactions>👍 🎉 3</BubbleReactions>
      </Bubble>
      <Bubble align="end">
        <BubbleContent>Shipping the announcement now.</BubbleContent>
        <BubbleReactions side="top" align="start">
          ❤️ 1
        </BubbleReactions>
      </Bubble>
    </div>
  );
}
```

## API reference

### Bubble

Extends `div`.

| Prop      | Type                                                                                       | Default     |
| --------- | ------------------------------------------------------------------------------------------ | ----------- |
| `variant` | `"default" \| "secondary" \| "muted" \| "tinted" \| "outline" \| "ghost" \| "destructive"` | `"default"` |
| `align`   | `"start" \| "end"`                                                                         | `"start"`   |

### BubbleContent

The message surface. Supports the Base UI `render` prop to become a
`button` or `a` for interactive bubbles (hover and focus styles are
built in).

| Prop     | Type                 | Default |
| -------- | -------------------- | ------- |
| `render` | `React.ReactElement` | `div`   |

### BubbleReactions

Extends `div`. Absolutely positioned over the bubble's edge.

| Prop    | Type                  | Default    |
| ------- | --------------------- | ---------- |
| `side`  | `"top" \| "bottom"`   | `"bottom"` |
| `align` | `"start" \| "end"`    | `"end"`    |

### BubbleGroup

Extends `div`. Stacks consecutive bubbles with tight spacing.
