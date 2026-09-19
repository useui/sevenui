---
title: Toggle Group
description: Displays a toggle group built on the Base UI Toggle Group primitive.
---

```tsx
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

export default function ToggleGroupDemo() {
  return (
    <ToggleGroup defaultValue={["center"]}>
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeftIcon className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenterIcon className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRightIcon className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
```

## Installation

<InstallCommand item="toggle-group" />

## Usage

```tsx
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

<ToggleGroup defaultValue={["center"]}>
  <ToggleGroupItem value="left" aria-label="Align left">
    Left
  </ToggleGroupItem>
  <ToggleGroupItem value="center" aria-label="Align center">
    Center
  </ToggleGroupItem>
  <ToggleGroupItem value="right" aria-label="Align right">
    Right
  </ToggleGroupItem>
</ToggleGroup>;
```

## Multiple Selection

```tsx
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

<ToggleGroup defaultValue={["bold", "italic"]} multiple>
  <ToggleGroupItem value="bold" aria-label="Toggle bold">
    <span className="font-bold">B</span>
  </ToggleGroupItem>
  <ToggleGroupItem value="italic" aria-label="Toggle italic">
    <span className="italic">I</span>
  </ToggleGroupItem>
  <ToggleGroupItem value="underline" aria-label="Toggle underline">
    <span className="underline">U</span>
  </ToggleGroupItem>
</ToggleGroup>;
```

## Examples

### Multiple

An outline, multi-select formatting group — `multiple` allows several
pressed items at once.

```tsx
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

export default function ToggleGroupMultiple() {
  return (
    <ToggleGroup multiple variant="outline" defaultValue={["bold"]}>
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
```

## API reference

### ToggleGroup

Extends the
[Base UI Toggle Group](https://base-ui.com/react/components/toggle-group)
primitive — all its props apply. The value is **always an array of
strings**, even in single-selection mode
(`defaultValue={["center"]}`). `variant` and `size` cascade to every
item.

| Prop                     | Type                            | Default        |
| ------------------------ | ------------------------------- | -------------- |
| `multiple`               | `boolean`                       | `false`        |
| `value` / `defaultValue` | `string[]`                      | —              |
| `onValueChange`          | `(value: string[]) => void`     | —              |
| `variant`                | `"default" \| "outline"`        | `"default"`    |
| `size`                   | `"default" \| "sm" \| "lg"`     | `"default"`    |
| `spacing`                | `number` — gap between items    | `2`            |
| `orientation`            | `"horizontal" \| "vertical"`    | `"horizontal"` |

### ToggleGroupItem

Extends the [Toggle](/docs/components/toggle) component — requires a
`value`; variant and size come from the group. Give icon-only items an
`aria-label`.
