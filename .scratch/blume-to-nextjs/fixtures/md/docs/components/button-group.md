---
title: Button Group
description: Groups related buttons with shared borders and separators.
---

```tsx
"use client";

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/registry/base/ui/button-group";

export default function ButtonGroupDemo() {
  return (
    <div className="flex items-center gap-6">
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Previous page">
          <ChevronLeftIcon />
        </Button>
        <ButtonGroupText>Page 3 of 12</ButtonGroupText>
        <Button variant="outline" size="icon" aria-label="Next page">
          <ChevronRightIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical">
        <Button variant="outline" size="icon" aria-label="Move up">
          <ChevronUpIcon />
        </Button>
        <Button variant="outline" size="icon" aria-label="Move down">
          <ChevronDownIcon />
        </Button>
      </ButtonGroup>
    </div>
  );
}
```

## Installation

<InstallCommand item="button-group" />

## Usage

```tsx
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export function Actions() {
  return (
    <ButtonGroup>
      <Button variant="outline">Archive</Button>
      <Button variant="outline">Snooze</Button>
      <Button variant="outline">Report</Button>
    </ButtonGroup>
  );
}
```

Direct children with a `data-slot` (buttons, inputs, select triggers) get
their corner radius and borders merged automatically. Nest multiple
`ButtonGroup`s to keep separate clusters spaced apart. Outline buttons
rarely need separators — their own borders divide them; use
`ButtonGroupSeparator` with filled variants like `secondary`.

## Examples

### Split button

A split button pairs a primary action with a `ButtonGroupSeparator` and a
dropdown trigger for secondary actions.

```tsx
"use client";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/registry/base/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

export default function ButtonGroupSeparatorDemo() {
  return (
    <ButtonGroup>
      <Button variant="secondary">Merge pull request</Button>
      <ButtonGroupSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="secondary"
              size="icon"
              aria-label="More merge options"
            >
              <ChevronDownIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Create a merge commit</DropdownMenuItem>
          <DropdownMenuItem>Squash and merge</DropdownMenuItem>
          <DropdownMenuItem>Rebase and merge</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
```

## API reference

### ButtonGroup

Extends `div` with `role="group"`. Label it with `aria-label` or
`aria-labelledby` when the grouping is meaningful to screen readers.

| Prop          | Type                           | Default        |
| ------------- | ------------------------------ | -------------- |
| `orientation` | `"horizontal" \| "vertical"`   | `"horizontal"` |

### ButtonGroupSeparator

Extends [Separator](/docs/components/separator) — all Separator props
apply. Sized to stretch across the group.

| Prop          | Type                           | Default      |
| ------------- | ------------------------------ | ------------ |
| `orientation` | `"horizontal" \| "vertical"`   | `"vertical"` |

### ButtonGroupText

Static text styled to sit flush between buttons. Supports the Base UI
`render` prop to swap the underlying element (for example a `label`).

| Prop     | Type                 | Default |
| -------- | -------------------- | ------- |
| `render` | `React.ReactElement` | `div`   |

`buttonGroupVariants` is also exported for composing the group styles
onto your own elements.
