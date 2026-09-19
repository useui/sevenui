---
title: Label
description: Displays a label for form inputs.
---

```tsx
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function LabelDemo() {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="name@example.com" />
    </div>
  );
}
```

## Installation

<InstallCommand item="label" />

## Usage

```tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>;
```

## API reference

### Label

Extends the native `<label>` element. It dims automatically when its
control is disabled — both as a sibling after the control
(`peer-disabled`) and with the control nested inside
(`has-[:disabled]`). Prefer the sibling pattern with `htmlFor`. Base UI
ships no Label primitive; inside a [Field](/docs/components/field), use
`FieldLabel` for automatic wiring instead.

| Prop      | Type                                            | Default |
| --------- | ----------------------------------------------- | ------- |
| `htmlFor` | `string` — or nest the control inside instead   | —       |
