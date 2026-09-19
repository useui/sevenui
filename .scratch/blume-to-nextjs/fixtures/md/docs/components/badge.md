---
title: Badge
description: Displays a small status descriptor.
---

```tsx
import { Badge } from "@/registry/base/ui/badge";

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  );
}
```

## Installation

<InstallCommand item="badge" />

## Usage

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="outline">Badge</Badge>;
```

## Examples

### As link

Render the badge as a real anchor via the `render` prop — hover styles
for links are built into each variant.

```tsx
"use client";

import { ArrowUpRightIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";

export default function BadgeLink() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge render={<a href="#changelog" />}>v0.7.0</Badge>
      <Badge variant="secondary" render={<a href="#docs" />}>
        Documentation
        <ArrowUpRightIcon />
      </Badge>
      <Badge variant="outline" render={<a href="#releases" />}>
        All releases
      </Badge>
    </div>
  );
}
```

### With icon

A direct `svg` child is sized automatically.

```tsx
"use client";

import { BadgeCheckIcon, StarIcon, TriangleAlertIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";

export default function BadgeIcon() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">
        <BadgeCheckIcon />
        Verified
      </Badge>
      <Badge variant="outline">
        <StarIcon />
        4.9
      </Badge>
      <Badge variant="destructive">
        <TriangleAlertIcon />
        Build failed
      </Badge>
    </div>
  );
}
```

### Processing

```tsx
"use client";

import { LoaderCircleIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";

export default function BadgeProcessing() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">
        <LoaderCircleIcon className="animate-spin" />
        Deploying
      </Badge>
      <Badge variant="outline">
        <LoaderCircleIcon className="animate-spin" />
        Indexing
      </Badge>
    </div>
  );
}
```

## API reference

### Badge

Renders a `span` by default; swap the element with the Base UI `render`
prop (for example `render={<a href="…" />}` — link hover styles are
built in).

| Prop      | Type                                                                          | Default     |
| --------- | ----------------------------------------------------------------------------- | ----------- |
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline" \| "ghost" \| "link"` | `"default"` |
| `render`  | `React.ReactElement`                                                          | `span`      |

`badgeVariants` is also exported for styling custom elements.
