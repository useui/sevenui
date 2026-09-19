---
title: Switch
description: Displays a switch built on the Base UI Switch primitive.
---

```tsx
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

export default function SwitchDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Switch id="switch-airplane" defaultChecked />
        <Label htmlFor="switch-airplane">Airplane mode</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="switch-small" size="sm" defaultChecked />
        <Label htmlFor="switch-small">Small switch</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="switch-disabled" disabled />
        <Label htmlFor="switch-disabled">Disabled switch</Label>
      </div>
    </div>
  );
}
```

## Installation

<InstallCommand item="switch" />

## Usage

```tsx
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

<Label>
  <Switch defaultChecked />
  Airplane mode
</Label>;
```

## API reference

### Switch

Extends the
[Base UI Switch](https://base-ui.com/react/components/switch) Root — all
its props apply: `checked`/`defaultChecked`, `onCheckedChange`,
`name`/`value` and `uncheckedValue` for form submission. The thumb is
built in.

| Prop                         | Type                         | Default     |
| ---------------------------- | ---------------------------- | ----------- |
| `size`                       | `"default" \| "sm"`          | `"default"` |
| `checked` / `defaultChecked` | `boolean`                    | `false`     |
| `onCheckedChange`            | `(checked: boolean) => void` | —           |
| `disabled`                   | `boolean`                    | `false`     |
| `name` / `value`             | `string` — form submission   | —           |
