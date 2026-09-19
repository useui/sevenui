---
title: Input OTP
description: Displays an OTP input field built on the Base UI OTPField primitive.
---

```tsx
"use client";

import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/registry/base/ui/input-otp";

export default function InputOTPDemo() {
  const [value, setValue] = useState("");

  return (
    <div className="flex w-full max-w-sm justify-center">
      <InputOTP
        length={6}
        value={value}
        onValueChange={(newValue: string) => setValue(newValue)}
      >
        <InputOTPGroup>
          {Array.from({ length: 3 }).map((_, index) => (
            <InputOTPSlot
              key={index}
              aria-label={
                index === 0
                  ? undefined
                  : `Digit ${index + 1} of 6`
              }
            />
          ))}
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          {Array.from({ length: 3 }).map((_, index) => {
            const globalIndex = 3 + index;
            return (
              <InputOTPSlot
                key={index}
                aria-label={
                  globalIndex === 0
                    ? undefined
                    : `Digit ${globalIndex + 1} of 6`
                }
              />
            );
          })}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
```

## Installation

<InstallCommand item="input-otp" />

## Usage

```tsx
"use client";

import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

export default function InputOTPDemo() {
  const [value, setValue] = useState("");

  return (
    <InputOTP length={6} value={value} onValueChange={(v) => setValue(v)}>
      <InputOTPGroup>
        {Array.from({ length: 3 }).map((_, i) => (
          <InputOTPSlot key={i} />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        {Array.from({ length: 3 }).map((_, i) => (
          <InputOTPSlot key={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
```

## Examples

### Masked

```tsx
"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";
import { Label } from "@/registry/base/ui/label";

export default function InputOTPMask() {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="input-otp-mask">Verification PIN</Label>
      <InputOTP id="input-otp-mask" length={4} mask defaultValue="1234">
        <InputOTPGroup>
          {Array.from({ length: 4 }).map((_, index) => (
            <InputOTPSlot
              key={index}
              aria-label={`PIN digit ${index + 1} of 4`}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
```

## API reference

### InputOTP

Extends the
[Base UI OTP Field](https://base-ui.com/react/components/otp-field)
Root — all its props apply. No third-party input-otp package required.

| Prop                     | Type                                                | Default     |
| ------------------------ | --------------------------------------------------- | ----------- |
| `length`                 | `number` (required)                                 | —           |
| `value` / `defaultValue` | `string`                                            | —           |
| `onValueChange`          | `(value: string) => void`                           | —           |
| `onValueComplete`        | `(value: string) => void` — all slots filled        | —           |
| `validationType`         | `"numeric" \| "alpha" \| "alphanumeric" \| "none"`  | `"numeric"` |
| `mask`                   | `boolean`                                           | `false`     |
| `autoSubmit`             | `boolean` — submit the owning form when complete    | `false`     |

### InputOTPSlot

Extends the Base UI Input part — each slot is a real single-character
input; render exactly `length` of them. Focus styling replaces the old
fake-caret behavior.

### InputOTPGroup and InputOTPSeparator

`InputOTPGroup` (a `div`) draws the joined slot borders and rounded
ends; `InputOTPSeparator` extends the Base UI Separator and renders a
minus icon between groups.
