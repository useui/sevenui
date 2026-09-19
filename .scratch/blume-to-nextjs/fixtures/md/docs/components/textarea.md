---
title: Textarea
description: Displays a multi-line text input field.
---

```tsx
import { Textarea } from "@/registry/base/ui/textarea";

export default function TextareaDemo() {
  return <Textarea placeholder="Enter your message here..." />;
}
```

## Installation

<InstallCommand item="textarea" />

## Usage

```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea placeholder="Enter your message..." />;
```

## Examples

### Required

```tsx
import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

export default function TextareaRequired() {
  return (
    <form className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="textarea-required">
        Feedback <span className="text-destructive">*</span>
      </Label>
      <Textarea
        id="textarea-required"
        placeholder="Tell us what went wrong..."
        required
      />
    </form>
  );
}
```

### Disabled

```tsx
import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

export default function TextareaDisabled() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="textarea-disabled">Release notes</Label>
      <Textarea
        id="textarea-disabled"
        defaultValue="Locked while the release is being published."
        disabled
      />
    </div>
  );
}
```

### Invalid

```tsx
import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

export default function TextareaInvalid() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="textarea-invalid">Bio</Label>
      <Textarea
        id="textarea-invalid"
        defaultValue="x"
        aria-invalid="true"
        aria-describedby="textarea-invalid-error"
      />
      <p id="textarea-invalid-error" className="text-sm text-destructive">
        Your bio must be at least 20 characters.
      </p>
    </div>
  );
}
```

## API reference

### Textarea

Extends the native `<textarea>` element — no props beyond it.

| Prop           | Type                                     | Default |
| -------------- | ---------------------------------------- | ------- |
| `rows`         | `number` — initial height                | —       |
| `disabled`     | `boolean`                                | `false` |
| `required`     | `boolean`                                | `false` |
| `aria-invalid` | `boolean` — destructive border and ring  | —       |
