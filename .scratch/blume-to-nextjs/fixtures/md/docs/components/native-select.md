---
title: Native Select
description: A styled native HTML select element.
---

```tsx
"use client";

import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

export default function NativeSelectDemo() {
  return (
    <div className="flex items-end gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-timezone">Timezone</Label>
        <NativeSelect id="native-select-timezone" defaultValue="">
          <NativeSelectOption value="" disabled>
            Select a timezone
          </NativeSelectOption>
          <NativeSelectOption value="utc">UTC</NativeSelectOption>
          <NativeSelectOption value="europe-istanbul">
            Europe/Istanbul
          </NativeSelectOption>
          <NativeSelectOption value="america-new-york">
            America/New_York
          </NativeSelectOption>
          <NativeSelectOption value="asia-tokyo">Asia/Tokyo</NativeSelectOption>
        </NativeSelect>
      </div>
      <NativeSelect size="sm" defaultValue="10" aria-label="Rows per page">
        <NativeSelectOption value="10">10 rows</NativeSelectOption>
        <NativeSelectOption value="25">25 rows</NativeSelectOption>
        <NativeSelectOption value="50">50 rows</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
```

## Installation

<InstallCommand item="native-select" />

## Usage

```tsx
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export function FruitSelect() {
  return (
    <NativeSelect defaultValue="apple" aria-label="Fruit">
      <NativeSelectOption value="apple">Apple</NativeSelectOption>
      <NativeSelectOption value="banana">Banana</NativeSelectOption>
    </NativeSelect>
  );
}
```

Reach for the native select when you want the platform's own dropdown —
native browser behavior, mobile-optimized pickers, and zero JS overhead.
Use the [Select](/docs/components/select) component when you need custom
option rendering, animations, or richer interactions.

## Examples

### Grouped options

`NativeSelectOptGroup` wraps related options; individual options can be
disabled.

```tsx
"use client";

import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

export default function NativeSelectGroups() {
  return (
    <NativeSelect defaultValue="button" aria-label="Component">
      <NativeSelectOptGroup label="Form">
        <NativeSelectOption value="button">Button</NativeSelectOption>
        <NativeSelectOption value="input">Input</NativeSelectOption>
        <NativeSelectOption value="checkbox">Checkbox</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Overlay">
        <NativeSelectOption value="dialog">Dialog</NativeSelectOption>
        <NativeSelectOption value="popover">Popover</NativeSelectOption>
        <NativeSelectOption value="tooltip" disabled>
          Tooltip (soon)
        </NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  );
}
```

## API reference

### NativeSelect

Extends the native `<select>` element — all its props (`value`,
`defaultValue`, `onChange`, `disabled`, `multiple`, …) apply. The native
numeric `size` attribute is replaced by the visual size variant below.
Invalid state styles via `aria-invalid`.

| Prop   | Type                  | Default     |
| ------ | --------------------- | ----------- |
| `size` | `"sm" \| "default"`   | `"default"` |

### NativeSelectOption and NativeSelectOptGroup

Extend the native `<option>` and `<optgroup>` elements — `value`,
`label`, and `disabled` behave exactly as in HTML.
