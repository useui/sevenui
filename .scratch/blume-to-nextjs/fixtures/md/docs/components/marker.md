---
title: Marker
description: An inline marker with icon and content for annotating UI.
---

```tsx
"use client";

import { CheckCheckIcon, UserPlusIcon } from "lucide-react";

import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";

export default function MarkerDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Marker>
        <MarkerIcon>
          <UserPlusIcon />
        </MarkerIcon>
        <MarkerContent>Alex joined the conversation</MarkerContent>
      </Marker>
      <Marker role="status">
        <MarkerIcon>
          <CheckCheckIcon />
        </MarkerIcon>
        <MarkerContent>
          All messages read · <a href="#history">View history</a>
        </MarkerContent>
      </Marker>
    </div>
  );
}
```

## Installation

<InstallCommand item="marker" />

## Usage

```tsx
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { UserPlusIcon } from "lucide-react";

export function JoinedNote() {
  return (
    <Marker>
      <MarkerIcon>
        <UserPlusIcon />
      </MarkerIcon>
      <MarkerContent>Alex joined the conversation</MarkerContent>
    </Marker>
  );
}
```

Markers annotate flows — typically conversation threads next to
[Message](/docs/components/message) — with inline status notes, date
separators, or row boundaries. Add `role="status"` when the marker
announces progress; links and buttons work inside the content.

## Examples

### Variants

`separator` centers the label between divider lines (date breaks);
`border` underlines the row (for example an unread boundary).

```tsx
"use client";

import { Marker, MarkerContent } from "@/registry/base/ui/marker";

export default function MarkerVariants() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <Marker>
        <MarkerContent>Default — inline status note</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerContent>Unread messages below</MarkerContent>
      </Marker>
    </div>
  );
}
```

## API reference

### Marker

Renders a `div` by default; swap the element with the Base UI `render`
prop to make the whole marker a link or button.

| Prop      | Type                                      | Default     |
| --------- | ----------------------------------------- | ----------- |
| `variant` | `"default" \| "separator" \| "border"`    | `"default"` |
| `render`  | `React.ReactElement`                      | `div`       |

### MarkerIcon and MarkerContent

Extend `span`. `MarkerIcon` is decorative (`aria-hidden`) — give the
marker an `aria-label` if it would otherwise be icon-only.
`markerVariants` is also exported for styling custom elements.
