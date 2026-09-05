"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";

export default function Login03() {
  const [step, setStep] = React.useState<"email" | "code">("email");
  const [email, setEmail] = React.useState("");

  return (
    <div className="flex min-h-[560px] w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-xs text-center">
        {step === "email" ? (
          <>
            <h1 className="text-xl font-semibold tracking-tight">Sign in with a code</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              We will email you a six-digit one-time code.
            </p>
            <div className="mt-8 grid gap-4 text-left">
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              <Button type="button" className="w-full" onClick={() => setStep("code")}>
                Send code
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold tracking-tight">Check your inbox</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              We sent a six-digit code to{" "}
              <span className="font-medium text-foreground break-all">
                {email || "you@example.com"}
              </span>
              .
            </p>
            <div className="mt-8 grid gap-4 text-left">
              <Field>
                <FieldLabel>One-time code</FieldLabel>
                <InputOTP length={6}>
                  <InputOTPGroup>
                    <InputOTPSlot />
                    <InputOTPSlot aria-label="Digit 2 of 6" />
                    <InputOTPSlot aria-label="Digit 3 of 6" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot aria-label="Digit 4 of 6" />
                    <InputOTPSlot aria-label="Digit 5 of 6" />
                    <InputOTPSlot aria-label="Digit 6 of 6" />
                  </InputOTPGroup>
                </InputOTP>
                <FieldDescription>Paste or type the code from your inbox.</FieldDescription>
              </Field>
              <Button type="button" className="w-full">
                Verify
              </Button>
              <Button
                type="button"
                variant="link"
                className="text-muted-foreground"
                onClick={() => setStep("email")}
              >
                Use a different email
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
