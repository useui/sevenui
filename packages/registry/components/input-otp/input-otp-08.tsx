"use client";

import { Check, Copy, EyeOff, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/registry/base/ui/button";
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
import { Spinner } from "@/registry/base/ui/spinner";

const LENGTH = 6;
const VALID_CODE = "314159";
const VERIFY_DELAY_MS = 1200;
const SECRET_KEY = "ak_live_51Hq8vT2eKxPa0mR7cNw4Yd";
const positions = [1, 2, 3, 4, 5, 6];

type Status = "idle" | "verifying" | "error" | "revealed";

export default function InputOtp08() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);

  // Simulated server check; the timeout is cleared if the status changes.
  useEffect(() => {
    if (status !== "verifying") {
      return;
    }
    const timeout = window.setTimeout(() => {
      setStatus(value === VALID_CODE ? "revealed" : "error");
    }, VERIFY_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [status, value]);

  // Reset the copy confirmation after a moment so the button can be reused.
  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  // Verify on every complete value, not only on the first completion, so
  // fixing one digit after an error submits the corrected code again.
  function handleChange(next: string) {
    setValue(next);
    setStatus(next.length === LENGTH ? "verifying" : "idle");
  }

  function hideKey() {
    setValue("");
    setCopied(false);
    setStatus("idle");
  }

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(SECRET_KEY);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const revealed = status === "revealed";

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground">
      <div className="flex flex-col gap-1">
        <h2 className="flex items-center gap-2 font-semibold">
          <KeyRound aria-hidden="true" className="size-4" />
          Production secret key
        </h2>
        <p className="text-sm text-muted-foreground">
          Created Aug 12 by Priya Shah. Last used 2 hours ago.
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-md border bg-muted/50 py-1 pr-1 pl-2.5">
        <code className="min-w-0 flex-1 truncate font-mono text-xs">
          {revealed ? SECRET_KEY : `ak_live_${"•".repeat(16)}`}
        </code>
        {revealed ? (
          <>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={copied ? "Secret key copied" : "Copy secret key"}
              onClick={copyKey}
            >
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Hide secret key"
              onClick={hideKey}
            >
              <EyeOff aria-hidden="true" />
            </Button>
          </>
        ) : null}
      </div>

      {revealed ? (
        <p role="status" className="text-sm text-muted-foreground">
          Visible for this session only. Store it in your secrets manager, not
          in source control.
        </p>
      ) : (
        <Field name="revealCode" invalid={status === "error"}>
          <FieldLabel>Confirm it’s you to reveal</FieldLabel>
          <InputOTP
            length={LENGTH}
            value={value}
            onValueChange={handleChange}
            readOnly={status === "verifying"}
            autoComplete="one-time-code"
            aria-busy={status === "verifying"}
          >
            <InputOTPGroup>
              {positions.map((position) => (
                <InputOTPSlot
                  key={position}
                  aria-label={
                    position === 1
                      ? undefined
                      : `Digit ${position} of ${LENGTH}`
                  }
                  className="size-9 tabular-nums"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <div aria-live="polite" className="min-h-5 text-sm">
            {status === "idle" ? (
              <FieldDescription>
                Enter a code from your authenticator app. Demo code:{" "}
                {VALID_CODE}.
              </FieldDescription>
            ) : null}
            {status === "verifying" ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Spinner aria-hidden="true" role="presentation" />
                Checking code…
              </p>
            ) : null}
          </div>
          {status === "error" ? (
            <FieldError>
              That code didn’t match. Codes refresh every 30 seconds.
            </FieldError>
          ) : null}
        </Field>
      )}
    </div>
  );
}
