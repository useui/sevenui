---
title: Kbd
description: Displays a keyboard key.
---

```tsx
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

export default function KbdDemo() {
  return (
    <p className="text-sm text-muted-foreground">
      Press{" "}
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>{" "}
      to open the command menu.
    </p>
  );
}
```

## Installation

<InstallCommand item="kbd" />

## Usage

```tsx
import { Kbd, KbdGroup } from "@/components/ui/kbd";

<KbdGroup>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>;
```

## Examples

### In a button

```tsx
"use client";

import { Button } from "@/registry/base/ui/button";
import { Kbd } from "@/registry/base/ui/kbd";

export default function KbdButton() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline">
        Accept <Kbd>⏎</Kbd>
      </Button>
      <Button variant="outline">
        Cancel <Kbd>Esc</Kbd>
      </Button>
    </div>
  );
}
```

### In an input

```tsx
"use client";

import { SearchIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

export default function KbdInput() {
  return (
    <div className="w-full max-w-sm">
      <InputGroup>
        <InputGroupInput placeholder="Search documentation..." />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
```

### In a tooltip

Keys invert automatically on the dark tooltip surface.

```tsx
"use client";

import { SaveIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

export default function KbdTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="outline" size="icon" aria-label="Save document">
              <SaveIcon />
            </Button>
          }
        />
        <TooltipContent>
          Save document{" "}
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>S</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

## API reference

### Kbd and KbdGroup

Extend the native `<kbd>` element — no props beyond it. `Kbd` renders a
single key (it inverts automatically inside tooltips); `KbdGroup` lays
out a key combination with tight spacing.
