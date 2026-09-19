---
title: Skeleton
description: Use to show a placeholder while content is loading.
---

```tsx
import { Skeleton } from "@/registry/base/ui/skeleton";

export default function SkeletonDemo() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="size-10 rounded-full" />
      <div className="grid gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
}
```

## Installation

<InstallCommand item="skeleton" />

## Usage

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<Skeleton className="h-4 w-40" />;
```

## API reference

### Skeleton

Extends `div` — no props beyond it. Size it with `className` to match
the content it stands in for.
