---
title: Number Field
description: Displays a number field built on the Base UI Number Field primitive.
---

```tsx
import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from "@/registry/base/ui/number-field";

export default function NumberFieldDemo() {
  return (
    <NumberField defaultValue={100}>
      <NumberFieldScrubArea>
        <Label>Price</Label>
      </NumberFieldScrubArea>
      <NumberFieldGroup>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldGroup>
    </NumberField>
  );
}
```

## Installation

<InstallCommand item="number-field" />

## Usage

```tsx
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from "@/components/ui/number-field";
import { Label } from "@/components/ui/label";

<NumberField defaultValue={100}>
  <NumberFieldScrubArea>
    <Label>Price</Label>
  </NumberFieldScrubArea>
  <NumberFieldGroup>
    <NumberFieldDecrement />
    <NumberFieldInput />
    <NumberFieldIncrement />
  </NumberFieldGroup>
</NumberField>;
```

## Features

- **ScrubArea with Pointer Lock**: The `NumberFieldScrubArea` component enables drag-to-adjust
  functionality using Pointer Lock API. Drag horizontally to increase or decrease the value.
  Note: Pointer Lock is not available in Safari.
- **Number Formatting**: Use the `format` prop (accepts `Intl.NumberFormatOptions`) to customize
  how numbers are displayed in the input field.
- **Stepper Buttons**: Increment and decrement buttons for precise value adjustments.
- **Step Values**: Configure `step` for regular increments, `smallStep` for fine adjustments
  (e.g., mouse scroll), and `largeStep` for large jumps (e.g., shift+scroll).

## Examples

### Currency

`format` takes `Intl.NumberFormatOptions`; `largeStep` applies while
holding <kbd>Shift</kbd>. Drag the label to scrub the value.

```tsx
import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from "@/registry/base/ui/number-field";

export default function NumberFieldCurrency() {
  return (
    <NumberField
      defaultValue={1500}
      min={0}
      step={100}
      largeStep={1000}
      format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
    >
      <NumberFieldScrubArea>
        <Label>Monthly budget</Label>
      </NumberFieldScrubArea>
      <NumberFieldGroup>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldGroup>
    </NumberField>
  );
}
```

### Quantity

A compact stepper clamped with `min` and `max`.

```tsx
import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";

export default function NumberFieldQuantity() {
  return (
    <div className="flex items-center gap-3">
      <Label htmlFor="number-field-quantity">Quantity</Label>
      <NumberField id="number-field-quantity" defaultValue={2} min={1} max={99}>
        <NumberFieldGroup className="w-28">
          <NumberFieldDecrement />
          <NumberFieldInput className="text-center" />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
    </div>
  );
}
```

## API reference

Number Field is a Base UI exclusive — shadcn/ui has no equivalent
component. The parts compose explicitly, as in the demo above.

### NumberField

Extends the
[Base UI Number Field](https://base-ui.com/react/components/number-field)
Root — all its props apply.

| Prop                     | Type                               | Default |
| ------------------------ | ---------------------------------- | ------- |
| `value` / `defaultValue` | `number \| null`                   | —       |
| `onValueChange`          | `(value: number \| null) => void`  | —       |
| `min` / `max`            | `number`                           | —       |
| `step`                   | `number`                           | `1`     |
| `largeStep`              | `number` — step while holding Shift | `10`   |
| `format`                 | `Intl.NumberFormatOptions`         | —       |
| `disabled`               | `boolean`                          | `false` |

### NumberFieldGroup, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement

Styled Base UI parts: the group draws the bordered container, the input
holds the formatted value, and the stepper buttons come with their
plus/minus icons built in (hold to repeat).

### NumberFieldScrubArea

Wraps a label to make it scrubbable — dragging it adjusts the value
with a pointer-lock cursor.
