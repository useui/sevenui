"use client";

import { useEffect, useState } from "react";
import { Check, Copy, KeyRound, ShieldCheck } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";
import { Label } from "@/registry/base/ui/label";

const SETUP_KEY = "JBSW Y3DP EHPK 3PXP";

const recoveryCodes = [
  "7f3k-92qd",
  "m2px-4c8h",
  "q9rt-1bzn",
  "v6ws-8je3",
  "k4an-7ty2",
  "h8ue-5lm0",
];

type Step = "scan" | "verify" | "done";

export default function InputOtp13() {
  const [enabled, setEnabled] = useState(false);
  const [step, setStep] = useState<Step>("scan");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Reset the copy confirmation after a moment so the button can be reused.
  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(SETUP_KEY.replace(/\s/g, ""));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      aria-labelledby="two-factor-title"
      className="flex w-full max-w-md flex-col gap-5 rounded-xl border bg-card p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="two-factor-title" className="font-semibold">
            Authenticator app
          </h2>
          <p className="text-sm text-muted-foreground">
            Require a code from 1Password, Authy, or Google Authenticator when
            you sign in.
          </p>
        </div>
        <Badge variant={enabled ? "default" : "outline"}>
          {enabled ? "On" : "Off"}
        </Badge>
      </div>

      {step === "scan" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <img
              src="/placeholder.svg"
              alt="QR code for adding Relay to your authenticator app"
              width={128}
              height={128}
              className="size-32 shrink-0 rounded-lg border bg-muted object-cover"
            />
            <div className="flex w-full min-w-0 flex-col gap-2 text-sm">
              <p>
                <span className="font-medium">1.</span> Scan the QR code with
                your authenticator app.
              </p>
              <p className="text-muted-foreground">
                Can't scan? Enter this setup key manually:
              </p>
              <div className="flex items-center gap-1 rounded-md border bg-muted/50 py-1 pr-1 pl-2.5">
                <code className="min-w-0 flex-1 truncate font-mono text-xs">
                  {SETUP_KEY}
                </code>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={copied ? "Setup key copied" : "Copy setup key"}
                  onClick={copyKey}
                >
                  {copied ? (
                    <Check aria-hidden="true" />
                  ) : (
                    <Copy aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <Button className="self-end" onClick={() => setStep("verify")}>
            Next: enter code
          </Button>
        </div>
      ) : null}

      {step === "verify" ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (code.length === 6) setStep("done");
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="setup-code">
              2. Enter the 6-digit code shown for Relay
            </Label>
            <InputOTP
              id="setup-code"
              length={6}
              value={code}
              onValueChange={setCode}
              aria-describedby="setup-code-hint"
            >
              <InputOTPGroup>
                {[1, 2, 3].map((position) => (
                  <InputOTPSlot
                    key={position}
                    className="size-10 text-base"
                    aria-label={
                      position === 1 ? undefined : `Digit ${position} of 6`
                    }
                  />
                ))}
              </InputOTPGroup>
              <InputOTPSeparator className="px-1 text-muted-foreground" />
              <InputOTPGroup>
                {[4, 5, 6].map((position) => (
                  <InputOTPSlot
                    key={position}
                    className="size-10 text-base"
                    aria-label={`Digit ${position} of 6`}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <p id="setup-code-hint" className="text-xs text-muted-foreground">
              Codes refresh every 30 seconds. Enter the current one.
            </p>
          </div>
          <div className="flex justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setCode("");
                setStep("scan");
              }}
            >
              Back
            </Button>
            <Button type="submit" disabled={code.length < 6}>
              Verify code
            </Button>
          </div>
        </form>
      ) : null}

      {step === "done" ? (
        <div className="flex flex-col gap-4">
          <p
            role="status"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <ShieldCheck aria-hidden="true" className="size-4 text-success" />
            Code accepted. Save your recovery codes to finish.
          </p>
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <KeyRound aria-hidden="true" className="size-3.5" />
              Each code works once if you lose your phone.
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-sm tabular-nums">
              {recoveryCodes.map((recoveryCode) => (
                <li key={recoveryCode}>{recoveryCode}</li>
              ))}
            </ul>
          </div>
          <Label className="gap-2 font-normal">
            <Checkbox
              checked={saved}
              onCheckedChange={(checked) => setSaved(checked)}
            />
            I've stored these codes somewhere safe
          </Label>
          <Button
            className="self-end"
            disabled={!saved || enabled}
            onClick={() => setEnabled(true)}
          >
            {enabled ? "Two-factor enabled" : "Turn on two-factor"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
