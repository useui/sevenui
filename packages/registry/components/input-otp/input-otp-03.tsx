"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";
import { Toggle } from "@/registry/base/ui/toggle";

const LENGTH = 4;
const positions = [1, 2, 3, 4];

export default function InputOtp03() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="w-full max-w-xs">
      <Field name="approvalPin">
        <div className="flex items-center justify-between gap-3">
          <FieldLabel>Payout approval PIN</FieldLabel>
          <Toggle
            size="sm"
            pressed={revealed}
            onPressedChange={setRevealed}
            aria-label={revealed ? "Hide PIN" : "Show PIN"}
          >
            {revealed ? (
              <EyeOff aria-hidden="true" />
            ) : (
              <Eye aria-hidden="true" />
            )}
          </Toggle>
        </div>
        <InputOTP
          length={LENGTH}
          mask={!revealed}
          defaultValue="73"
          autoComplete="off"
        >
          <InputOTPGroup className="gap-3">
            {positions.map((position) => (
              <InputOTPSlot
                key={position}
                aria-label={position === 1 ? undefined : `PIN digit ${position} of ${LENGTH}`}
                className="size-12 rounded-full border text-lg font-medium first:rounded-full last:rounded-full"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <FieldDescription>
          Required for transfers above $5,000. Digits stay hidden unless you
          reveal them.
        </FieldDescription>
      </Field>
    </div>
  );
}
