---
title: Toggle
description: Displays a toggle built on the Base UI Toggle primitive.
---

```tsx
import { Toggle } from "@/registry/base/ui/toggle";

export default function ToggleDemo() {
  return (
    <Toggle variant="outline" aria-label="Toggle bold">
      <span className="font-bold">B</span>
    </Toggle>
  );
}
```

## Installation

<InstallCommand item="toggle" />

## Usage

```tsx
import { Toggle } from "@/components/ui/toggle";

<Toggle variant="outline" aria-label="Toggle bold">
  <span className="font-bold">B</span>
</Toggle>;
```

## Examples

### Variants

```tsx
import { Toggle } from "@/components/ui/toggle";

<Toggle variant="default">Default</Toggle>
<Toggle variant="outline">Outline</Toggle>
```

### Sizes

```tsx
import { Toggle } from "@/components/ui/toggle";

<Toggle size="sm">Small</Toggle>
<Toggle size="default">Default</Toggle>
<Toggle size="lg">Large</Toggle>
```

## Examples

### Variants and sizes

```tsx
import { ItalicIcon } from "lucide-react";

import { Toggle } from "@/registry/base/ui/toggle";

export default function ToggleVariants() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Toggle size="sm" aria-label="Toggle italic (small)">
          <ItalicIcon />
        </Toggle>
        <Toggle aria-label="Toggle italic">
          <ItalicIcon />
        </Toggle>
        <Toggle size="lg" aria-label="Toggle italic (large)">
          <ItalicIcon />
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="outline" size="sm" aria-label="Toggle italic (small)">
          <ItalicIcon />
        </Toggle>
        <Toggle variant="outline" aria-label="Toggle italic">
          <ItalicIcon />
        </Toggle>
        <Toggle variant="outline" size="lg" aria-label="Toggle italic (large)">
          <ItalicIcon />
        </Toggle>
      </div>
    </div>
  );
}
```

## API reference

### Toggle

Extends the [Base UI Toggle](https://base-ui.com/react/components/toggle)
primitive — all its props apply. Give icon-only toggles an `aria-label`.

| Prop                         | Type                          | Default     |
| ---------------------------- | ----------------------------- | ----------- |
| `variant`                    | `"default" \| "outline"`      | `"default"` |
| `size`                       | `"default" \| "sm" \| "lg"`   | `"default"` |
| `pressed` / `defaultPressed` | `boolean`                     | `false`     |
| `onPressedChange`            | `(pressed: boolean) => void`  | —           |
| `disabled`                   | `boolean`                     | `false`     |

`toggleVariants` is also exported for styling custom elements.
