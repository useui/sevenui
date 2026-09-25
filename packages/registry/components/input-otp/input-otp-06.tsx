"use client";

import { useState } from "react";

import { cn } from "cn";

import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";

const LENGTH = 6;
const positions = [1, 2, 3, 4, 5, 6];

export default function InputOtp06() {
  const [value, setValue] = useState("");
  const remaining = LENGTH - value.length;

  return (
    <div className="w-full max-w-xs">
      <Field name="emailCode">
        <FieldLabel>Email confirmation code</FieldLabel>
        <InputOTP
          length={LENGTH}
          value={value}
          onValueChange={setValue}
          autoComplete="one-time-code"
        >
          <InputOTPGroup className="gap-2">
            {positions.map((position) => (
              <InputOTPSlot
                key={position}
                aria-label={position === 1 ? undefined : `Digit ${position} of ${LENGTH}`}
                className="h-11 w-10 rounded-lg border text-base font-medium first:rounded-lg last:rounded-lg data-filled:border-primary/40 data-filled:bg-primary/5 motion-safe:transition-[background-color,border-color,box-shadow,transform] motion-safe:duration-200 motion-safe:ease-out motion-safe:data-filled:-translate-y-0.5 dark:data-filled:bg-primary/10"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <div aria-hidden="true" className="flex gap-2">
          {positions.map((position) => (
            <span
              key={position}
              className="h-1 w-10 overflow-hidden rounded-full bg-muted"
            >
              <span
                className={cn(
                  "block h-full origin-left rounded-full bg-primary motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out",
                  position <= value.length ? "scale-x-100" : "scale-x-0",
                )}
              />
            </span>
          ))}
        </div>
        <FieldDescription aria-live="polite">
          {remaining === 0
            ? "All 6 digits entered."
            : `${remaining} ${remaining === 1 ? "digit" : "digits"} to go. Sent to maya@northwind.io.`}
        </FieldDescription>
      </Field>
    </div>
  );
}
