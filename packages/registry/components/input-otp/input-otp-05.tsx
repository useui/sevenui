"use client";

import { CircleCheck, Lock } from "lucide-react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";

const LENGTH = 6;
const positions = [1, 2, 3, 4, 5, 6];

function Slots({ className }: { className?: string }) {
  return (
    <InputOTPGroup>
      {positions.map((position) => (
        <InputOTPSlot
          key={position}
          aria-label={position === 1 ? undefined : `Digit ${position} of ${LENGTH}`}
          className={className}
        />
      ))}
    </InputOTPGroup>
  );
}

export default function InputOtp05() {
  return (
    <div className="grid w-full max-w-md gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field name="codeEmpty">
        <FieldLabel>Empty</FieldLabel>
        <InputOTP length={LENGTH}>
          <Slots />
        </InputOTP>
        <FieldDescription>Waiting for the code from your app.</FieldDescription>
      </Field>

      <Field name="codeReadOnly">
        <FieldLabel>Read-only</FieldLabel>
        <InputOTP length={LENGTH} defaultValue="482913" readOnly>
          <Slots className="bg-muted/50 dark:bg-muted/50" />
        </InputOTP>
        <FieldDescription>Share this pairing code with the TV.</FieldDescription>
      </Field>

      <Field name="codeDisabled" disabled>
        <FieldLabel>Disabled</FieldLabel>
        <InputOTP length={LENGTH} defaultValue="19" disabled>
          <Slots />
        </InputOTP>
        <FieldDescription className="flex items-center gap-1.5">
          <Lock aria-hidden="true" className="size-3.5 shrink-0" />
          Locked for 5 minutes after 3 attempts.
        </FieldDescription>
      </Field>

      <Field name="codeInvalid" invalid>
        <FieldLabel>Error</FieldLabel>
        <InputOTP length={LENGTH} defaultValue="550271">
          <Slots />
        </InputOTP>
        <FieldError>That code expired. Request a new one.</FieldError>
      </Field>

      <Field name="codeVerified" className="sm:col-span-2">
        <FieldLabel>Verified</FieldLabel>
        <InputOTP length={LENGTH} defaultValue="306148" readOnly>
          <Slots className="border-success/50 bg-success/5 text-foreground dark:bg-success/10" />
        </InputOTP>
        <FieldDescription className="flex items-center gap-1.5 text-success">
          <CircleCheck aria-hidden="true" className="size-3.5 shrink-0" />
          Phone number confirmed.
        </FieldDescription>
      </Field>
    </div>
  );
}
