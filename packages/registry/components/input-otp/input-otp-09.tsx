"use client";

import { useEffect, useState } from "react";
import { CircleCheck, Smartphone } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";
import { Label } from "@/registry/base/ui/label";
import { Spinner } from "@/registry/base/ui/spinner";

const CODE_LENGTH = 6;
const RECOVERY_LENGTH = 8;

type Status = "idle" | "verifying" | "verified";

export default function InputOtp09() {
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    if (status !== "verifying") return;
    const timeout = setTimeout(() => setStatus("verified"), 1200);
    return () => clearTimeout(timeout);
  }, [status]);

  const length = recovery ? RECOVERY_LENGTH : CODE_LENGTH;
  const half = length / 2;
  const unit = recovery ? "Character" : "Digit";
  const complete = code.length === length;

  if (status === "verified") {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
        <CircleCheck aria-hidden="true" className="size-8 text-success" />
        <div className="flex flex-col gap-1">
          <p className="font-medium">Signed in as maya@northwind.io</p>
          <p className="text-sm text-muted-foreground">
            {trustDevice
              ? "We won't ask for a code on this browser for 30 days."
              : "You'll be asked for a code next time you sign in."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCode("");
            setRecovery(false);
            setStatus("idle");
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-5 rounded-xl border bg-card p-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (complete) setStatus("verifying");
      }}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <Smartphone aria-hidden="true" className="size-4" />
        </div>
        <h2 className="mt-2 font-semibold">Two-step verification</h2>
        <p className="text-sm text-muted-foreground">
          {recovery
            ? "Enter one of the 8-character recovery codes you saved when you set up two-step verification."
            : "Open your authenticator app and enter the 6-digit code for Northwind."}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="sign-in-code">
          {recovery ? "Recovery code" : "Authentication code"}
        </Label>
        <InputOTP
          key={recovery ? "recovery" : "app"}
          id="sign-in-code"
          length={length}
          value={code}
          onValueChange={setCode}
          validationType={recovery ? "alphanumeric" : "numeric"}
          normalizeValue={recovery ? (value) => value.toUpperCase() : undefined}
          autoComplete={recovery ? "off" : "one-time-code"}
          disabled={status === "verifying"}
        >
          <InputOTPGroup>
            {Array.from({ length: half }, (_, index) => index + 1).map(
              (position) => (
                <InputOTPSlot
                  key={position}
                  className={
                    recovery
                      ? "h-10 w-8 font-mono text-sm uppercase sm:w-9"
                      : "size-10 text-base"
                  }
                  aria-label={
                    position === 1
                      ? undefined
                      : `${unit} ${position} of ${length}`
                  }
                />
              ),
            )}
          </InputOTPGroup>
          <InputOTPSeparator className="px-1 text-muted-foreground" />
          <InputOTPGroup>
            {Array.from({ length: half }, (_, index) => half + index + 1).map(
              (position) => (
                <InputOTPSlot
                  key={position}
                  className={
                    recovery
                      ? "h-10 w-8 font-mono text-sm uppercase sm:w-9"
                      : "size-10 text-base"
                  }
                  aria-label={`${unit} ${position} of ${length}`}
                />
              ),
            )}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Label className="gap-2 font-normal">
        <Checkbox
          checked={trustDevice}
          onCheckedChange={(checked) => setTrustDevice(checked)}
        />
        Trust this browser for 30 days
      </Label>

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          disabled={!complete || status === "verifying"}
          className="w-full"
        >
          {status === "verifying" ? <Spinner /> : null}
          {status === "verifying" ? "Verifying" : "Verify and sign in"}
        </Button>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="self-center"
          disabled={status === "verifying"}
          onClick={() => {
            setCode("");
            setRecovery((value) => !value);
          }}
        >
          {recovery
            ? "Use your authenticator app instead"
            : "Use a recovery code instead"}
        </Button>
      </div>
    </form>
  );
}
