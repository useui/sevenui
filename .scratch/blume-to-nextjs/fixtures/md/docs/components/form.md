---
title: Form
description: A native form with consolidated, auto-clearing validation error handling.
---

```tsx
"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Field, FieldError, FieldLabel } from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Input } from "@/registry/base/ui/input";

export default function FormDemo() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  return (
    <div className="w-full max-w-sm">
      <Form
        errors={errors}
        onFormSubmit={() => {
          // Simulate a server-side validation error. It clears automatically
          // once the field's value changes.
          setErrors({ url: "This URL is already taken." });
        }}
      >
        <Field name="url">
          <FieldLabel>Website</FieldLabel>
          <Input required type="url" placeholder="https://example.com" />
          <FieldError />
        </Field>
        <Button type="submit">Submit</Button>
      </Form>
    </div>
  );
}
```

## Installation

<InstallCommand item="form" />

## Usage

```tsx
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

<Form
  errors={errors}
  onFormSubmit={(values) => {
    // submit values, then set `errors` from the server response if any
  }}
>
  <Field name="url">
    <FieldLabel>Website</FieldLabel>
    <Input required type="url" placeholder="https://example.com" />
    <FieldError />
  </Field>
</Form>;
```

## API reference

### Form

Extends the [Base UI Form](https://base-ui.com/react/components/form)
primitive — all its props apply. `Form` renders a native `<form>` element and
consolidates validation errors for the [Field](/docs/components/field)s nested
inside it: entries in `errors` flow to each field's `<FieldError />` by
`name`, and clear automatically once that field's value changes.

| Prop           | Type                                                          | Default    | Description                                                                                            |
| -------------- | -------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| `errors`       | `Record<string, string \| string[]>`                            | —          | Validation errors returned externally (e.g. from a server), keyed by the `name` on the matching `Field`. |
| `onFormSubmit` | `(values, eventDetails) => void`                               | —          | Called on submit with the form's values. `preventDefault()` is already called on the native event.       |
| `validationMode` | `"onSubmit" \| "onBlur" \| "onChange"`                        | `"onSubmit"` | When fields validate. A `Field`'s own `validationMode` takes precedence.                                |

There is no `onClearErrors` handler: errors set via `errors` clear
automatically once the matching field's value changes.

All other props accept standard HTML `<form>` attributes and an optional
`className` override.
