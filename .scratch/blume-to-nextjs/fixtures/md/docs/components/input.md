---
title: Input
description: Displays a text input built on the Base UI Input primitive.
---

```tsx
import { Input } from "@/registry/base/ui/input";

export default function InputDemo() {
  return (
    <div className="w-full max-w-sm">
      <Input type="email" placeholder="name@example.com" />
    </div>
  );
}
```

## Installation

<InstallCommand item="input" />

## Usage

```tsx
import { Input } from "@/components/ui/input";

<Input type="email" placeholder="name@example.com" />;
```

## Examples

### File

```tsx
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function InputFile() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="input-file">Resume</Label>
      <Input id="input-file" type="file" />
    </div>
  );
}
```

### Required

```tsx
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function InputRequired() {
  return (
    <form className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="input-required">
        Email <span className="text-destructive">*</span>
      </Label>
      <Input
        id="input-required"
        type="email"
        placeholder="name@example.com"
        required
      />
    </form>
  );
}
```

### Disabled

```tsx
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function InputDisabled() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="input-disabled">Username</Label>
      <Input id="input-disabled" defaultValue="emma" disabled />
    </div>
  );
}
```

### Invalid

```tsx
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function InputInvalid() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="input-invalid">Workspace URL</Label>
      <Input
        id="input-invalid"
        defaultValue="seven ui"
        aria-invalid="true"
        aria-describedby="input-invalid-error"
      />
      <p id="input-invalid-error" className="text-sm text-destructive">
        The URL can&apos;t contain spaces.
      </p>
    </div>
  );
}
```

## API reference

### Input

Extends the [Base UI Input](https://base-ui.com/react/components/input)
primitive — all native `input` props apply.

| Prop           | Type                                          | Default  |
| -------------- | --------------------------------------------- | -------- |
| `type`         | `"text" \| "email" \| "file" \| "password" \| …` | `"text"` |
| `disabled`     | `boolean`                                     | `false`  |
| `required`     | `boolean`                                     | `false`  |
| `aria-invalid` | `boolean` — destructive border and ring       | —        |

Inside a [Field](/docs/components/field), invalid state is wired
automatically.
