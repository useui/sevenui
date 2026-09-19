---
title: Checkbox
description: Displays a checkbox built on the Base UI Checkbox primitive.
---

```tsx
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";

export default function CheckboxDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-terms" defaultChecked />
        <Label htmlFor="checkbox-terms">Accept terms</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-disabled" disabled />
        <Label htmlFor="checkbox-disabled">Disabled checkbox</Label>
      </div>
    </div>
  );
}
```

## Installation

<InstallCommand item="checkbox" />

## Usage

```tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

<Label>
  <Checkbox defaultChecked />
  Accept terms
</Label>;
```

## Examples

### Indeterminate

A parent checkbox reflecting a partial selection — `indeterminate` is
independent of `checked` and controlled by you.

```tsx
"use client";

import * as React from "react";

import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";

const teams = ["Design", "Engineering", "Product"];

export default function CheckboxIndeterminate() {
  const [checked, setChecked] = React.useState<string[]>(["Design"]);

  const allChecked = checked.length === teams.length;
  const indeterminate = checked.length > 0 && !allChecked;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="checkbox-all-teams"
          checked={allChecked}
          indeterminate={indeterminate}
          onCheckedChange={(value) => setChecked(value ? [...teams] : [])}
        />
        <Label htmlFor="checkbox-all-teams">All teams</Label>
      </div>
      <div className="flex flex-col gap-3 ps-6">
        {teams.map((team) => (
          <div key={team} className="flex items-center gap-2">
            <Checkbox
              id={`checkbox-team-${team.toLowerCase()}`}
              checked={checked.includes(team)}
              onCheckedChange={(value) =>
                setChecked((prev) =>
                  value ? [...prev, team] : prev.filter((item) => item !== team),
                )
              }
            />
            <Label htmlFor={`checkbox-team-${team.toLowerCase()}`}>{team}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Disabled

```tsx
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";

export default function CheckboxDisabled() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-disabled-unchecked" disabled />
        <Label htmlFor="checkbox-disabled-unchecked">Disabled unchecked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-disabled-checked" disabled defaultChecked />
        <Label htmlFor="checkbox-disabled-checked">Disabled checked</Label>
      </div>
    </div>
  );
}
```

## API reference

### Checkbox

Extends the
[Base UI Checkbox](https://base-ui.com/react/components/checkbox) Root —
all its props apply. The check indicator is built in; pair with
[Label](/docs/components/label) for the click-target text.

| Prop                         | Type                          | Default |
| ---------------------------- | ----------------------------- | ------- |
| `checked` / `defaultChecked` | `boolean`                     | `false` |
| `onCheckedChange`            | `(checked: boolean) => void`  | —       |
| `indeterminate`              | `boolean`                     | `false` |
| `disabled`                   | `boolean`                     | `false` |
| `name` / `value`             | `string` — form submission    | —       |
