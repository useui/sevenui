---
title: Direction
description: Re-exports the Base UI DirectionProvider for RTL support.
---

```tsx
"use client";

import { SearchIcon } from "lucide-react";

import { DirectionProvider } from "@/registry/base/ui/direction";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";

export default function DirectionDemo() {
  return (
    <div className="grid w-full max-w-md gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label>Left to right</Label>
        <InputGroup>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex flex-col gap-2" dir="rtl">
        <Label>من اليمين إلى اليسار</Label>
        <DirectionProvider direction="rtl">
          <InputGroup>
            <InputGroupInput placeholder="...ابحث" />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </DirectionProvider>
      </div>
    </div>
  );
}
```

## Installation

<InstallCommand item="direction" />

## Usage

```tsx
import { DirectionProvider } from "@/components/ui/direction";

export function App({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl">
      <DirectionProvider direction="rtl">{children}</DirectionProvider>
    </div>
  );
}
```

This module is a direct re-export of
[`@base-ui/react/direction-provider`](https://base-ui.com/react/utils/direction-provider).
The provider makes Base UI components (menus, sliders, popovers, …)
behave directionally, but it does not flip your layout: you must also
set `dir="rtl"` (or the CSS `direction`) on the surrounding DOM
yourself, as in the example above. Wrap it around the whole app or just
the subtree that needs it.

## API reference

### DirectionProvider

| Prop        | Type               | Default   |
| ----------- | ------------------ | --------- |
| `direction` | `"ltr" \| "rtl"`   | `"ltr"`   |

### useDirection

Hook returning the current text direction from the nearest provider —
useful in portaled components that render outside the `dir`-attributed
DOM subtree.
