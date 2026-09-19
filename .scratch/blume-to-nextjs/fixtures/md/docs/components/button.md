---
title: Button
description: Displays a button built on the Base UI Button primitive.
---

```tsx
import { Button } from "@/registry/base/ui/button";

export default function ButtonDemo() {
  return <Button>Button</Button>;
}
```

## Installation

<InstallCommand item="button" />

## Usage

```tsx
import { Button } from "@/components/ui/button";

<Button variant="outline">Button</Button>;
```

## Examples

### Variants

```tsx
import { Button } from "@/registry/base/ui/button";

export default function ButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}
```

### Sizes

Text sizes pair with `icon-*` counterparts for icon-only buttons — give
those an `aria-label`.

```tsx
"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";

export default function ButtonSizes() {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="xs">
          Extra small
        </Button>
        <Button variant="outline" size="sm">
          Small
        </Button>
        <Button variant="outline">Default</Button>
        <Button variant="outline" size="lg">
          Large
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon-xs" aria-label="Add (extra small)">
          <PlusIcon />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Add (small)">
          <PlusIcon />
        </Button>
        <Button variant="outline" size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
        <Button variant="outline" size="icon-lg" aria-label="Add (large)">
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
}
```

### Disabled

```tsx
"use client";

import { Button } from "@/registry/base/ui/button";

export default function ButtonDisabled() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled>Default</Button>
      <Button variant="secondary" disabled>
        Secondary
      </Button>
      <Button variant="outline" disabled>
        Outline
      </Button>
      <Button variant="destructive" disabled>
        Destructive
      </Button>
    </div>
  );
}
```

### Loading

Pair `disabled` with the [Spinner](/docs/components/spinner) component
while an action is in flight.

```tsx
"use client";

import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

export default function ButtonLoading() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled>
        <Spinner />
        Please wait
      </Button>
      <Button variant="outline" disabled>
        <Spinner />
        Saving draft
      </Button>
    </div>
  );
}
```

## API reference

### Button

Extends the [Base UI Button](https://base-ui.com/react/components/button)
primitive — all its props (including `render` and `disabled`) apply.

| Prop      | Type                                                                                     | Default     |
| --------- | ---------------------------------------------------------------------------------------- | ----------- |
| `variant` | `"default" \| "outline" \| "secondary" \| "ghost" \| "destructive" \| "link"`            | `"default"` |
| `size`    | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"`     | `"default"` |

`buttonVariants` is also exported for styling custom elements.
