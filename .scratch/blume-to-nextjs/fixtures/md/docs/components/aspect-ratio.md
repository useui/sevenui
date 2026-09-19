---
title: Aspect Ratio
description: Displays content with a fixed aspect ratio.
---

```tsx
import { AspectRatio } from "@/registry/base/ui/aspect-ratio";

export default function AspectRatioDemo() {
  return (
    <div className="w-96 max-w-full">
      <AspectRatio
        ratio={16 / 9}
        className="flex items-center justify-center rounded-md bg-muted"
      >
        <span className="text-sm text-muted-foreground">16 : 9</span>
      </AspectRatio>
    </div>
  );
}
```

## Installation

<InstallCommand item="aspect-ratio" />

## Usage

```tsx
import { AspectRatio } from "@/components/ui/aspect-ratio";

<AspectRatio ratio={16 / 9}>
  <img src="..." alt="..." className="size-full object-cover" />
</AspectRatio>;
```

## API reference

### AspectRatio

Extends `div` — the ratio is applied via CSS `aspect-ratio`, so the
element needs a constrained width from its parent.

| Prop    | Type     | Default    |
| ------- | -------- | ---------- |
| `ratio` | `number` | — required |
