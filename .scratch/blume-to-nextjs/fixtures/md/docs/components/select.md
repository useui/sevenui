---
title: Select
description: Displays a select menu built on the Base UI Select primitive.
---

```tsx
"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "grapes", label: "Grapes" },
];

export default function SelectDemo() {
  return (
    <Select items={fruits}>
      <SelectTrigger className="w-45">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          {fruits.map((fruit) => (
            <SelectItem key={fruit.value} value={fruit.value}>
              {fruit.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
```

## Installation

<InstallCommand item="select" />

## Usage

```tsx
"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "grapes", label: "Grapes" },
];

export default function SelectDemo() {
  return (
    <Select items={fruits}>
      <SelectTrigger className="w-45">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          {fruits.map((fruit) => (
            <SelectItem key={fruit.value} value={fruit.value}>
              {fruit.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
```

## Examples

### Groups

Grouped options with labels, a separator, and the small trigger size.

```tsx
"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const timezones = {
  Europe: [
    { value: "europe-istanbul", label: "Istanbul" },
    { value: "europe-london", label: "London" },
    { value: "europe-berlin", label: "Berlin" },
  ],
  America: [
    { value: "america-new-york", label: "New York" },
    { value: "america-los-angeles", label: "Los Angeles" },
  ],
};

const items = Object.values(timezones).flat();

export default function SelectGroups() {
  return (
    <Select items={items} defaultValue="europe-istanbul">
      <SelectTrigger size="sm" className="w-45">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          {timezones.Europe.map((zone) => (
            <SelectItem key={zone.value} value={zone.value}>
              {zone.label}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>America</SelectLabel>
          {timezones.America.map((zone) => (
            <SelectItem key={zone.value} value={zone.value}>
              {zone.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
```

## API reference

### Select

Extends the [Base UI Select](https://base-ui.com/react/components/select)
Root — all its props apply.

| Prop                     | Type                                                        | Default |
| ------------------------ | ----------------------------------------------------------- | ------- |
| `items`                  | `Record<string, ReactNode> \| { label, value }[]`           | —       |
| `value` / `defaultValue` | item value (array when `multiple`)                          | —       |
| `onValueChange`          | `(value) => void`                                           | —       |
| `multiple`               | `boolean`                                                   | `false` |
| `disabled` / `required` / `readOnly` | `boolean`                                       | `false` |

When `items` is given, `SelectValue` renders the matching item's label
instead of the raw value.

### SelectTrigger

Extends the Base UI Trigger.

| Prop   | Type                  | Default     |
| ------ | --------------------- | ----------- |
| `size` | `"default" \| "sm"`   | `"default"` |

### SelectContent

Renders through `Select.Portal` → `Select.Positioner` → `Select.Popup`,
and always sets `alignItemWithTrigger={false}` on the Positioner so the
popup opens as a plain dropdown below the trigger instead of the Base UI
default, which overlaps the selected item on the trigger like a native
macOS select.

### SelectValue, SelectItem, SelectGroup, SelectLabel, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton

Styled Base UI parts. `SelectItem` takes the option `value` (and
`disabled`); the scroll buttons appear automatically when the list
overflows.
