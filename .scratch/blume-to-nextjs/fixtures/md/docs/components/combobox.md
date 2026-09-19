---
title: Combobox
description: An input combined with a filterable popup list, built on the Base UI Combobox primitive.
---

```tsx
"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/base/ui/combobox";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "grapes", label: "Grapes" },
  { value: "mango", label: "Mango" },
];

export default function ComboboxDemo() {
  return (
    <Combobox items={fruits}>
      <ComboboxInput placeholder="e.g. Apple" className="w-64" />
      <ComboboxContent>
        <ComboboxEmpty>No fruits found.</ComboboxEmpty>
        <ComboboxList>
          {(item: (typeof fruits)[number]) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
```

## Installation

<InstallCommand item="combobox" />

## Usage

```tsx
"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "grapes", label: "Grapes" },
  { value: "mango", label: "Mango" },
];

export default function ComboboxDemo() {
  return (
    <Combobox items={fruits}>
      <ComboboxInput placeholder="e.g. Apple" className="w-64" />
      <ComboboxContent>
        <ComboboxEmpty>No fruits found.</ComboboxEmpty>
        <ComboboxList>
          {(item: (typeof fruits)[number]) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
```

## Examples

### Multiple with chips

Selected items render as removable chips inside `ComboboxChips`. Anchor
the popup to the chips container with `useComboboxAnchor`:
`ref={anchor}` on the chips, `anchor={anchor}` on the content.

```tsx
"use client";

import * as React from "react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/registry/base/ui/combobox";

const languages = [
  { value: "en", label: "English" },
  { value: "tr", label: "Turkish" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "ja", label: "Japanese" },
];

type Language = (typeof languages)[number];

export default function ComboboxMultiple() {
  const anchor = useComboboxAnchor();

  return (
    <Combobox items={languages} multiple defaultValue={[languages[0]]}>
      <ComboboxChips ref={anchor} className="w-72">
        <ComboboxValue>
          {(value: Language[]) => (
            <React.Fragment>
              {value.map((language) => (
                <ComboboxChip key={language.value} aria-label={language.label}>
                  {language.label}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={value.length > 0 ? "" : "Select languages..."}
              />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No languages found.</ComboboxEmpty>
        <ComboboxList>
          {(item: Language) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
```

## API reference

### Combobox

Extends the
[Base UI Combobox](https://base-ui.com/react/components/combobox) Root —
all its props apply.

| Prop                     | Type                                    | Default |
| ------------------------ | --------------------------------------- | ------- |
| `items`                  | item array (or `{ label, value }[]`)    | —       |
| `value` / `defaultValue` | item (array when `multiple`)            | —       |
| `onValueChange`          | `(value) => void`                       | —       |
| `multiple`               | `boolean`                               | `false` |
| `disabled` / `required` / `readOnly` | `boolean`                   | `false` |

`items` drives the automatic filtering as the user types and lets
`ComboboxEmpty` know when nothing matches.

### ComboboxList

Takes a **function child** — `(item) => ReactElement` — called once per
item currently matching the input value; return a `ComboboxItem` for
each, so filtering re-renders the list automatically.

### ComboboxInput

Renders the `Combobox.InputGroup` → `Combobox.Input` pair, with
`ComboboxClear` and `ComboboxTrigger` positioned inside the group as
inline controls. Its `className` styles the field container — size the
field with it (e.g. `className="w-64"`).

### ComboboxContent

Renders through `Combobox.Portal` → `Combobox.Positioner` →
`Combobox.Popup`, mirroring `Select`.

| Prop                        | Type                        | Default    |
| --------------------------- | --------------------------- | ---------- |
| `side` / `align`            | positioner placement        | `"bottom"` / `"start"` |
| `sideOffset` / `alignOffset`| `number`                    | `6` / `0`  |
| `anchor`                    | element ref to anchor to    | trigger    |

### ComboboxChips, ComboboxChip, ComboboxChipsInput

Multi-select chips: `ComboboxChips` is the bordered container (attach
the `useComboboxAnchor` ref here), `ComboboxChip` renders one selected
item with a built-in remove button, and `ComboboxChipsInput` is the
inline filter input.

| Prop (`ComboboxChip`) | Type      | Default |
| --------------------- | --------- | ------- |
| `showRemove`          | `boolean` | `true`  |

### ComboboxItem, ComboboxGroup, ComboboxLabel, ComboboxCollection, ComboboxEmpty, ComboboxSeparator, ComboboxValue, ComboboxTrigger

Styled Base UI parts. `useComboboxAnchor()` is exported as a convenience
ref hook for the chips anchoring pattern.
