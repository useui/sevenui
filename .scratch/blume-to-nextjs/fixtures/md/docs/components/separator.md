---
title: Separator
description: Visually or semantically separates content.
---

```tsx
import { Separator } from "@/registry/base/ui/separator";

export default function SeparatorDemo() {
  return (
    <div>
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">SevenUI</h4>
        <p className="text-sm text-muted-foreground">
          An open-source component registry.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  );
}
```

## Installation

<InstallCommand item="separator" />

## Usage

```tsx
import { Separator } from "@/components/ui/separator";

<Separator />;
```

## API reference

### Separator

Extends the
[Base UI Separator](https://base-ui.com/react/components/separator)
primitive — all its props apply.

| Prop          | Type                             | Default        |
| ------------- | -------------------------------- | -------------- |
| `orientation` | `"horizontal" \| "vertical"`     | `"horizontal"` |
