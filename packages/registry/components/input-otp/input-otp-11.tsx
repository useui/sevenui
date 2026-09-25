"use client";

import { useState } from "react";
import { Check, Terminal } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";
import { Label } from "@/registry/base/ui/label";

const DEVICE_CODE = "WDJBMJHT";

const scopes = [
  { name: "projects:read", description: "List projects and environments" },
  { name: "deployments:write", description: "Create and promote deployments" },
  { name: "logs:read", description: "Stream build and runtime logs" },
];

type Decision = "pending" | "authorized" | "denied";

export default function InputOtp11() {
  const [code, setCode] = useState("");
  const [decision, setDecision] = useState<Decision>("pending");

  const complete = code.length === DEVICE_CODE.length;
  const matches = code === DEVICE_CODE;
  const invalid = complete && !matches;

  return (
    <div className="flex w-full max-w-md flex-col gap-5 rounded-xl border bg-card p-5">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-semibold">Connect a device</h2>
        <p className="text-sm text-muted-foreground">
          Enter the code shown in your terminal to sign in the Launchpad CLI.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-muted/60 font-mono text-xs">
        <div className="flex items-center gap-1.5 border-b px-3 py-2 text-muted-foreground">
          <Terminal aria-hidden="true" className="size-3.5" />
          zsh — ~/apps/storefront
        </div>
        <pre className="overflow-x-auto p-3 leading-relaxed whitespace-pre-wrap">
          <span className="text-muted-foreground">$</span> launchpad login{"\n"}
          <span className="text-muted-foreground">
            ! First copy your one-time code:
          </span>{" "}
          <span className="font-semibold">WDJB-MJHT</span>
          {"\n"}
          <span className="text-muted-foreground">
            Waiting for authorization…
          </span>
        </pre>
      </div>

      {decision === "pending" ? (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="device-code">Device code</Label>
            <InputOTP
              id="device-code"
              length={DEVICE_CODE.length}
              value={code}
              onValueChange={setCode}
              validationType="alpha"
              normalizeValue={(value) => value.toUpperCase()}
              autoComplete="off"
              aria-describedby="device-code-hint"
              className="w-full"
            >
              <InputOTPGroup className="min-w-0 flex-1">
                {[1, 2, 3, 4].map((position) => (
                  <InputOTPSlot
                    key={position}
                    aria-invalid={invalid || undefined}
                    className="h-10 min-w-0 flex-1 font-mono text-base"
                    aria-label={
                      position === 1 ? undefined : `Character ${position} of 8`
                    }
                  />
                ))}
              </InputOTPGroup>
              <InputOTPSeparator className="px-0.5 text-muted-foreground" />
              <InputOTPGroup className="min-w-0 flex-1">
                {[5, 6, 7, 8].map((position) => (
                  <InputOTPSlot
                    key={position}
                    aria-invalid={invalid || undefined}
                    className="h-10 min-w-0 flex-1 font-mono text-base"
                    aria-label={`Character ${position} of 8`}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <p
              id="device-code-hint"
              aria-live="polite"
              className={
                invalid
                  ? "text-xs text-destructive"
                  : "text-xs text-muted-foreground"
              }
            >
              {invalid
                ? "That code doesn't match a waiting device. Check your terminal."
                : "8 letters. Codes expire 15 minutes after they're issued."}
            </p>
          </div>

          {matches ? (
            <div className="flex flex-col gap-3 rounded-lg border p-3">
              <p className="text-sm">
                <span className="font-medium">Launchpad CLI</span> on
                MacBook-Pro.local is requesting access to:
              </p>
              <ul className="flex flex-col gap-2">
                {scopes.map((scope) => (
                  <li key={scope.name} className="flex items-start gap-2">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                    />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <Badge variant="outline" className="font-mono">
                        {scope.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {scope.description}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDecision("denied")}
            >
              Deny
            </Button>
            <Button
              disabled={!matches}
              onClick={() => setDecision("authorized")}
            >
              Authorize device
            </Button>
          </div>
        </>
      ) : (
        <div role="status" className="flex flex-col gap-3">
          <p className="text-sm">
            {decision === "authorized"
              ? "Device connected. You can return to your terminal — the CLI is now signed in as @priya."
              : "Request denied. The CLI will stop waiting and no access was granted."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => {
              setCode("");
              setDecision("pending");
            }}
          >
            Connect another device
          </Button>
        </div>
      )}
    </div>
  );
}
