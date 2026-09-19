---
title: Input Group
description: Groups an input with addons, buttons, and inline text.
---

```tsx
"use client";

import { SearchIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import { Kbd } from "@/registry/base/ui/kbd";

export default function InputGroupDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <InputGroup>
        <InputGroupInput placeholder="Search components..." />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Kbd>⌘K</Kbd>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="yourname" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>@sevenui.dev</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
```

## Installation

<InstallCommand item="input-group" />

## Usage

```tsx
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";

export function Search() {
  return (
    <InputGroup>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
    </InputGroup>
  );
}
```

Place addons after the input in the DOM and control their visual position
with the `align` prop. Use `inline-start` / `inline-end` for single-line
inputs and `block-start` / `block-end` for textareas. Clicking an addon
focuses the grouped input.

## Examples

### With button

Buttons inside an addon use `InputGroupButton`, which renders the SevenUI
Button with compact sizing (`xs` by default, `ghost` variant).

```tsx
"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";

const INSTALL_COMMAND =
  "npx shadcn@latest add https://sevenui.dev/r/input-group.json";

export default function InputGroupButtonDemo() {
  const [copied, setCopied] = React.useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <InputGroup>
        <InputGroupInput readOnly value={INSTALL_COMMAND} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="Copy command"
            onClick={() => {
              navigator.clipboard.writeText(INSTALL_COMMAND);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput type="password" placeholder="Enter your API key" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="secondary">Verify</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
```

### Textarea

`InputGroupTextarea` pairs with a `block-end` addon for prompt-style
composers. `block-start` works the same way for headers.

```tsx
"use client";

import { ArrowUpIcon, PaperclipIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/registry/base/ui/input-group";

export default function InputGroupTextareaDemo() {
  return (
    <div className="w-full max-w-md">
      <InputGroup>
        <InputGroupAddon align="block-start" className="border-b">
          <InputGroupText>New message</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea placeholder="Ask anything..." rows={3} />
        <InputGroupAddon align="block-end">
          <InputGroupButton size="icon-xs" aria-label="Attach file">
            <PaperclipIcon />
          </InputGroupButton>
          <InputGroupText className="ml-auto">12,000 tokens</InputGroupText>
          <InputGroupButton
            size="icon-xs"
            variant="default"
            aria-label="Send message"
          >
            <ArrowUpIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
```

## API reference

### InputGroup

Extends `div` with `role="group"`. Wraps one control
(`InputGroupInput` or `InputGroupTextarea`) plus any number of addons.
Focus, disabled, and invalid styles react to the grouped control's state.

### InputGroupAddon

Extends `div`. Clicking it focuses the grouped input (clicks on buttons
inside are ignored).

| Prop    | Type                                                            | Default          |
| ------- | --------------------------------------------------------------- | ---------------- |
| `align` | `"inline-start" \| "inline-end" \| "block-start" \| "block-end"` | `"inline-start"` |

### InputGroupButton

Extends [Button](/docs/components/button) — all Button props apply except
`size`, which is replaced by compact group sizes. `type` defaults to
`"button"`.

| Prop      | Type                                        | Default   |
| --------- | ------------------------------------------- | --------- |
| `variant` | Button variants                             | `"ghost"` |
| `size`    | `"xs" \| "sm" \| "icon-xs" \| "icon-sm"`    | `"xs"`    |

### InputGroupInput

Extends [Input](/docs/components/input) — all Input props apply. Renders
borderless inside the group, which draws the border and focus ring.

### InputGroupTextarea

Extends [Textarea](/docs/components/textarea) — all Textarea props apply.
Renders borderless inside the group; the group grows to fit.

### InputGroupText

Extends `span`. Muted inline text for prefixes, suffixes, and counters.
