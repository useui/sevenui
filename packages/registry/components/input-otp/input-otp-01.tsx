"use client";

import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";

const LENGTH = 6;
const positions = [1, 2, 3, 4, 5, 6];

const sizes = [
  {
    name: "compact",
    label: "Compact",
    hint: "28px slots for dense tables and toolbars.",
    slot: "size-7 text-xs",
  },
  {
    name: "default",
    label: "Default",
    hint: "32px slots that sit next to standard inputs.",
    slot: "",
  },
  {
    name: "large",
    label: "Large",
    hint: "44px slots for sign-in screens and touch devices.",
    slot: "size-11 text-lg font-medium first:rounded-l-xl last:rounded-r-xl",
  },
];

export default function InputOtp01() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {sizes.map((size) => (
        <Field key={size.name} name={`code-${size.name}`}>
          <FieldLabel>{size.label}</FieldLabel>
          <InputOTP length={LENGTH} autoComplete="one-time-code">
            <InputOTPGroup
              className={size.name === "large" ? "rounded-xl" : undefined}
            >
              {positions.map((position) => (
                <InputOTPSlot
                  key={position}
                  aria-label={position === 1 ? undefined : `Digit ${position} of ${LENGTH}`}
                  className={size.slot}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription>{size.hint}</FieldDescription>
        </Field>
      ))}
    </div>
  );
}
