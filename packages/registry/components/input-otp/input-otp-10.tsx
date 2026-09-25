"use client";

import { useEffect, useState } from "react";
import { CircleCheck, MailCheck } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

const DEFAULT_EMAIL = "jordan.lee@fieldnote.app";
const COOLDOWN_SECONDS = 30;
const steps = ["Account", "Verify email", "Workspace"];

type Stage = "verify" | "edit" | "verified";

export default function InputOtp10() {
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [resends, setResends] = useState(0);
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [draft, setDraft] = useState(DEFAULT_EMAIL);
  const [stage, setStage] = useState<Stage>("verify");
  const current = stage === "verified" ? 2 : 1;

  useEffect(() => {
    if (stage !== "verify" || cooldown <= 0) return;
    const timeout = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timeout);
  }, [cooldown, stage]);

  return (
    <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border bg-card p-6">
      <ol aria-label="Onboarding progress" className="flex items-center gap-2">
        {steps.map((step, index) => (
          <li
            key={step}
            aria-current={index === current ? "step" : undefined}
            className="flex flex-1 flex-col gap-1.5"
          >
            <span
              className={
                index <= current
                  ? "h-1 rounded-full bg-primary"
                  : "h-1 rounded-full bg-muted"
              }
            />
            <span
              className={
                index === current
                  ? "text-xs font-medium"
                  : "text-xs text-muted-foreground"
              }
            >
              {step}
            </span>
          </li>
        ))}
      </ol>

      {stage === "verified" ? (
        <div role="status" className="flex flex-col gap-3">
          <p className="flex items-center gap-2 font-semibold">
            <CircleCheck aria-hidden="true" className="size-4 text-success" />
            Email verified
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{email}</span> is
            confirmed. Next, name your workspace.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => {
              setCode("");
              setResends(0);
              setCooldown(COOLDOWN_SECONDS);
              setStage("verify");
            }}
          >
            Start over
          </Button>
        </div>
      ) : null}

      {stage === "edit" ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const next = draft.trim();
            if (!next) return;
            setEmail(next);
            setCode("");
            setResends(0);
            setCooldown(COOLDOWN_SECONDS);
            setStage("verify");
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-email">Email address</Label>
            <Input
              id="signup-email"
              type="email"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStage("verify")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!draft.trim()}>
              Send new code
            </Button>
          </div>
        </form>
      ) : null}

      {stage === "verify" ? (
        <>
          <div className="flex flex-col gap-1.5">
            <h2 className="flex items-center gap-2 font-semibold">
              <MailCheck aria-hidden="true" className="size-4" />
              Check your inbox
            </h2>
            <p className="text-sm text-muted-foreground">
              We sent a 4-digit code to{" "}
              <span className="font-medium text-foreground">{email}</span>. It
              expires in 10 minutes.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email-code">Verification code</Label>
            <InputOTP
              id="email-code"
              length={4}
              value={code}
              onValueChange={setCode}
              className="gap-2"
            >
              {[1, 2, 3, 4].map((position) => (
                <InputOTPGroup key={position}>
                  <InputOTPSlot
                    className="h-12 w-11 rounded-lg border text-lg font-medium"
                    aria-label={
                      position === 1 ? undefined : `Digit ${position} of 4`
                    }
                  />
                </InputOTPGroup>
              ))}
            </InputOTP>
            <p aria-live="polite" className="text-xs text-muted-foreground">
              {cooldown > 0 ? (
                <>
                  Didn't get it? You can request a new code in{" "}
                  <span className="tabular-nums">0:{String(cooldown).padStart(2, "0")}</span>
                </>
              ) : (
                <>
                  Didn't get it?{" "}
                  <button
                    type="button"
                    className="rounded-sm font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    onClick={() => {
                      setCode("");
                      setResends((value) => value + 1);
                      setCooldown(COOLDOWN_SECONDS);
                    }}
                  >
                    Resend code
                  </button>
                </>
              )}
              {resends > 0 && cooldown > 0 ? " · New code sent" : null}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setDraft(email);
                setStage("edit");
              }}
            >
              Change email
            </Button>
            <Button
              disabled={code.length < 4}
              onClick={() => setStage("verified")}
            >
              Continue
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
