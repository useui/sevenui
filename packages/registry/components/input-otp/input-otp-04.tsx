"use client";

import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";

const GROUP_SIZE = 4;
const LENGTH = GROUP_SIZE * 2;

// Recovery codes are case-insensitive, so show them the way they are printed.
function toUpperCase(value: string) {
  return value.toUpperCase();
}

function renderSlots(offset: number) {
  return Array.from({ length: GROUP_SIZE }).map((_, index) => {
    const position = offset + index + 1;
    return (
      <InputOTPSlot
        key={position}
        aria-label={position === 1 ? undefined : `Character ${position} of ${LENGTH}`}
        className="h-10 w-8 font-mono text-sm uppercase sm:w-9"
      />
    );
  });
}

export default function InputOtp04() {
  return (
    <div className="w-full max-w-sm">
      <Field name="recoveryCode">
        <FieldLabel>Recovery code</FieldLabel>
        <InputOTP
          length={LENGTH}
          validationType="alphanumeric"
          normalizeValue={toUpperCase}
          autoComplete="off"
          className="gap-1.5"
        >
          <InputOTPGroup>{renderSlots(0)}</InputOTPGroup>
          <InputOTPSeparator className="text-muted-foreground" />
          <InputOTPGroup>{renderSlots(GROUP_SIZE)}</InputOTPGroup>
        </InputOTP>
        <FieldDescription>
          Use one of the 8-character codes you saved when you turned on
          two-step verification, like K7QD-2MXP. Letters are not case
          sensitive.
        </FieldDescription>
      </Field>
    </div>
  );
}
