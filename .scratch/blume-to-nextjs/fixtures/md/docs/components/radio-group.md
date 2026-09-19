---
title: Radio Group
description: Displays a radio group built on the Base UI Radio primitive.
---

```tsx
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

export default function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center">
        <Label>
          <RadioGroupItem value="default" />
          Default
        </Label>
      </div>
      <div className="flex items-center">
        <Label>
          <RadioGroupItem value="comfortable" />
          Comfortable
        </Label>
      </div>
      <div className="flex items-center">
        <Label>
          <RadioGroupItem value="compact" />
          Compact
        </Label>
      </div>
    </RadioGroup>
  );
}
```

## Installation

<InstallCommand item="radio-group" />

## Usage

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

<RadioGroup defaultValue="comfortable">
  <div className="flex items-center">
    <Label>
      <RadioGroupItem value="default" />
      Default
    </Label>
  </div>
  <div className="flex items-center">
    <Label>
      <RadioGroupItem value="comfortable" />
      Comfortable
    </Label>
  </div>
  <div className="flex items-center">
    <Label>
      <RadioGroupItem value="compact" />
      Compact
    </Label>
  </div>
</RadioGroup>;
```

## Examples

### Cards

Wrap each item in a styled [Label](/docs/components/label) — the
`has-data-checked:` variant styles the selected card.

```tsx
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const plans = [
  { value: "starter", label: "Starter", description: "For side projects", price: "$0" },
  { value: "pro", label: "Pro", description: "For growing teams", price: "$12" },
  { value: "team", label: "Team", description: "For organizations", price: "$32" },
];

export default function RadioGroupCard() {
  return (
    <RadioGroup defaultValue="pro" className="w-full max-w-sm gap-2">
      {plans.map((plan) => (
        <Label
          key={plan.value}
          className="cursor-pointer items-start rounded-lg border border-input px-3 py-2.5 has-data-checked:border-primary/40 has-data-checked:bg-muted hover:bg-muted/50"
        >
          <RadioGroupItem value={plan.value} className="mt-0.5" />
          <div className="flex flex-1 flex-col gap-0.5">
            <span>{plan.label}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {plan.description}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">{plan.price}</span>
        </Label>
      ))}
    </RadioGroup>
  );
}
```

### Disabled

```tsx
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

export default function RadioGroupDisabled() {
  return (
    <RadioGroup defaultValue="standard">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="standard" id="radio-standard" />
        <Label htmlFor="radio-standard">Standard shipping</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="express" id="radio-express" />
        <Label htmlFor="radio-express">Express shipping</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="overnight" id="radio-overnight" disabled />
        <Label htmlFor="radio-overnight">Overnight (unavailable)</Label>
      </div>
    </RadioGroup>
  );
}
```

### Invalid

```tsx
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

export default function RadioGroupInvalid() {
  return (
    <div className="flex flex-col gap-2">
      <RadioGroup aria-invalid="true" aria-describedby="radio-group-error">
        <Label>
          <RadioGroupItem value="monthly" aria-invalid="true" />
          Monthly billing
        </Label>
        <Label>
          <RadioGroupItem value="yearly" aria-invalid="true" />
          Yearly billing
        </Label>
      </RadioGroup>
      <p id="radio-group-error" className="text-sm text-destructive">
        Select a billing period to continue.
      </p>
    </div>
  );
}
```

## API reference

### RadioGroup

Extends the
[Base UI Radio Group](https://base-ui.com/react/components/radio-group)
primitive — all its props apply.

| Prop                       | Type                       | Default |
| -------------------------- | -------------------------- | ------- |
| `value` / `defaultValue`   | `string`                   | —       |
| `onValueChange`            | `(value: string) => void`  | —       |
| `name`                     | `string` — form submission | —       |
| `disabled`                 | `boolean` — whole group    | `false` |

### RadioGroupItem

Extends the [Base UI Radio](https://base-ui.com/react/components/radio)
Root — the dot indicator is built in. Pair with
[Label](/docs/components/label) for the click-target text.

| Prop       | Type                  | Default |
| ---------- | --------------------- | ------- |
| `value`    | `string` (required)   | —       |
| `disabled` | `boolean`             | `false` |
