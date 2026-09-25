"use client";

import { CircleCheck, MessageSquareText } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";
import { Spinner } from "@/registry/base/ui/spinner";

const LENGTH = 6;
const SMS_CODE = "604218";
const SMS_DELAY_MS = 1800;
const positions = [1, 2, 3, 4, 5, 6];

export default function InputOtp07() {
  const [value, setValue] = useState("");
  const [arrived, setArrived] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Simulate the text message arriving shortly after the code was sent.
  useEffect(() => {
    if (arrived) {
      return;
    }
    const timeout = window.setTimeout(() => setArrived(true), SMS_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [arrived]);

  const autofilled = value === SMS_CODE;

  function handleChange(next: string) {
    setValue(next);
    setConfirmed(false);
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <div
        aria-live="polite"
        className="flex min-h-16 items-center gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm"
      >
        {!arrived ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner aria-hidden="true" role="presentation" />
            Waiting for the text message…
          </p>
        ) : autofilled ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CircleCheck aria-hidden="true" className="size-4 text-success" />
            Code filled in from Messages.
          </p>
        ) : (
          <>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <MessageSquareText aria-hidden="true" className="size-4" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-xs text-muted-foreground">Messages · now</p>
              <p className="text-sm">
                Lumen code:{" "}
                <span className="font-medium tabular-nums">{SMS_CODE}</span>
              </p>
            </div>
            <Button size="sm" onClick={() => handleChange(SMS_CODE)}>
              Fill code
            </Button>
          </>
        )}
      </div>

      <Field name="phoneCode">
        <FieldLabel>Phone verification code</FieldLabel>
        <InputOTP
          length={LENGTH}
          value={value}
          onValueChange={handleChange}
          autoComplete="one-time-code"
        >
          <InputOTPGroup className="w-full">
            {positions.map((position) => (
              <InputOTPSlot
                key={position}
                aria-label={
                  position === 1 ? undefined : `Digit ${position} of ${LENGTH}`
                }
                className="h-11 min-w-0 flex-1 text-lg tabular-nums"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <FieldDescription aria-live="polite">
          {confirmed
            ? "Phone number confirmed. Sign-in alerts will go to this number."
            : "Sent to (415) •••-0192. On a phone, the keyboard offers the code as soon as it arrives."}
        </FieldDescription>
      </Field>

      <Button
        disabled={value.length < LENGTH || confirmed}
        onClick={() => setConfirmed(true)}
      >
        {confirmed ? "Confirmed" : "Confirm phone number"}
      </Button>
    </div>
  );
}
