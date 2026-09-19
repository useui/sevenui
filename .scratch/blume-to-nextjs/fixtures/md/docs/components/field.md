---
title: Field
description: Associates a label, control, description, and validation error for a form field.
---

```tsx
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

export default function FieldDemo() {
  return (
    <div className="w-full max-w-sm">
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input required type="email" placeholder="name@example.com" />
        <FieldDescription>Used to send you order updates.</FieldDescription>
      </Field>
    </div>
  );
}
```

## Installation

<InstallCommand item="field" />

## Usage

```tsx
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

<Field name="email">
  <FieldLabel>Email</FieldLabel>
  <Input required type="email" placeholder="name@example.com" />
  <FieldDescription>Used to send you order updates.</FieldDescription>
  <FieldError />
</Field>;
```

`Field` wires everything together for you: `htmlFor`/`id` between label and
control, `aria-describedby` for the description and error, and
`aria-invalid` on the control are all managed by the underlying Base UI
Field context — no manual ids. Every SevenUI form control (Input, Textarea,
Checkbox, Radio Group, Select, Switch, Slider, Number Field, …) participates
automatically.

## Examples

### Orientation

`horizontal` places the label and control on one row — pair it with
`FieldContent` to stack a label and description beside the control.
`responsive` stacks in narrow containers and switches to the horizontal
layout from the `@md` container breakpoint; it requires a `FieldGroup`
ancestor, which provides the container query scope.

```tsx
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Switch } from "@/registry/base/ui/switch";

export default function FieldOrientation() {
  return (
    <FieldGroup className="max-w-md">
      <Field orientation="horizontal" name="marketing">
        <FieldContent>
          <FieldLabel>Marketing emails</FieldLabel>
          <FieldDescription>Occasional product news. No spam.</FieldDescription>
        </FieldContent>
        <Switch />
      </Field>
      <Field orientation="responsive" name="displayName">
        <FieldContent>
          <FieldLabel>Display name</FieldLabel>
          <FieldDescription>
            Stacks on narrow containers, inline on wide ones.
          </FieldDescription>
        </FieldContent>
        <Input placeholder="Margaret Hamilton" />
      </Field>
    </FieldGroup>
  );
}
```

### Validation

A bare `<FieldError />` renders the field's active error on its own —
native constraint messages (`required`, `type="email"`, …), messages
returned by `validate`, or server errors passed through
[Form](/docs/components/form). This example validates on blur with a custom
`validate` function.

```tsx
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

export default function FieldValidation() {
  return (
    <div className="w-full max-w-sm">
      <Field
        name="username"
        validationMode="onBlur"
        validate={(value) =>
          String(value ?? "").length >= 3
            ? null
            : "Username must be at least 3 characters."
        }
      >
        <FieldLabel>Username</FieldLabel>
        <Input required placeholder="sevenui" />
        <FieldDescription>
          Validates when the input loses focus.
        </FieldDescription>
        <FieldError />
      </Field>
    </div>
  );
}
```

To scope a literal message to one native validity state, use `match`:

```tsx
<FieldError match="valueMissing">Please enter your email.</FieldError>
<FieldError match="typeMismatch">Not a valid email address.</FieldError>
```

### React Hook Form

Any form library can drive a field through three generic props — `invalid`,
`touched`, and `dirty` — plus the `errors` array on `FieldError`. With
react-hook-form, spread `fieldState` from a `Controller`:

```tsx
"use client";

import { Controller, useForm } from "react-hook-form";

import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

type FormValues = { username: string };

export default function FieldRhf() {
  const form = useForm<FormValues>({
    defaultValues: { username: "" },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid w-full max-w-sm gap-4"
      noValidate
    >
      <Controller
        control={form.control}
        name="username"
        rules={{
          required: "Username is required.",
          minLength: {
            value: 3,
            message: "Username must be at least 3 characters.",
          },
        }}
        render={({ field, fieldState }) => (
          <Field
            name={field.name}
            invalid={fieldState.invalid}
            touched={fieldState.isTouched}
            dirty={fieldState.isDirty}
          >
            <FieldLabel>Username</FieldLabel>
            <Input placeholder="sevenui" {...field} />
            <FieldDescription>
              This is your public display name.
            </FieldDescription>
            <FieldError
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </Field>
        )}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

The same pattern works for TanStack Form
(`field.state.meta.isTouched`, `field.state.meta.errors`) or any validator
implementing Standard Schema — the component has no form-library imports.

## API reference

### Field

Extends the [Base UI Field](https://base-ui.com/react/components/field)
Root — all its props apply.

| Prop                            | Type                                                                | Default      |
| ------------------------------- | ------------------------------------------------------------------- | ------------ |
| `orientation`                   | `"vertical" \| "horizontal" \| "responsive"`                        | `"vertical"` |
| `name`                          | `string` — keys the field for form submission and `Form errors`     | —            |
| `validate`                      | `(value, formValues) => string \| string[] \| null \| Promise<...>` | —            |
| `validationMode`                | `"onSubmit" \| "onBlur" \| "onChange"`                              | `"onSubmit"` |
| `invalid` / `touched` / `dirty` | `boolean` — for external form libraries                             | —            |
| `disabled`                      | `boolean` — supersedes the control's own `disabled`                 | `false`      |

Every part carries the field's state as data attributes for styling:
`data-invalid`, `data-valid`, `data-dirty`, `data-touched`, `data-filled`,
`data-focused`, `data-disabled`.

### FieldLabel

Extends the Base UI Field Label — associated with the field's control
automatically, no `htmlFor` needed. Renders through
[Label](/docs/components/label), so label styling applies. Wrapping a
nested `Field` turns it into a selectable card (checkbox/radio card
patterns).

### FieldDescription

Extends the Base UI Field Description — linked to the control via
`aria-describedby` automatically.

### FieldError

Extends the Base UI Field Error. Visible only while the field is invalid,
unless external content forces it.

| Prop     | Type                                       | Default |
| -------- | ------------------------------------------ | ------- |
| `errors` | `Array<{ message?: string } \| undefined>` | —       |
| `match`  | `boolean \| keyof ValidityState`           | —       |

With no props it auto-renders the field's active error from context.
`errors` accepts issues from any form library or Standard Schema validator
(Zod, Valibot, ArkType); messages are deduped, and multiple messages render
as a list. `match="valueMissing"` (and other
[ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)
keys) scopes literal children to one native validity condition.

### Layout parts

Plain styled elements with no form wiring — compose freely around any
number of fields:

| Component        | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| `FieldSet`       | `<fieldset>` grouping related fields.                             |
| `FieldLegend`    | `<legend>`; `variant`: `"legend"` (default) or `"label"`.         |
| `FieldGroup`     | Vertical stack of fields; container-query scope for `responsive`. |
| `FieldContent`   | Column wrapper pairing a label/description beside a control.      |
| `FieldTitle`     | Label-styled heading for non-label contexts.                      |
| `FieldSeparator` | Divider between fields, with optional inline content.             |
