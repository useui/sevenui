"use client";

import { MailCheck, RefreshCw } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";

const cooldownSeconds = 30;
const maxResends = 3;

function formatSeconds(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function Button12() {
  const [remaining, setRemaining] = React.useState(0);
  const [resends, setResends] = React.useState(0);
  const [announcement, setAnnouncement] = React.useState("");

  React.useEffect(() => {
    if (remaining <= 0) return;
    const timeout = setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timeout);
  }, [remaining]);

  const coolingDown = remaining > 0;
  const exhausted = resends >= maxResends;

  function resend() {
    const next = resends + 1;
    setResends(next);
    setRemaining(cooldownSeconds);
    setAnnouncement(
      next >= maxResends
        ? "Code sent. That was your last resend for now."
        : "A new code is on its way.",
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-xl border bg-card p-6 text-center text-card-foreground">
      <span className="flex size-11 items-center justify-center rounded-full bg-muted">
        <MailCheck aria-hidden="true" className="size-5 text-muted-foreground" />
      </span>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">Check your inbox</h3>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium break-words text-foreground">
            maya@northwind.studio
          </span>
          . It expires in 10 minutes.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2">
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          disabled={coolingDown || exhausted}
          focusableWhenDisabled
          aria-describedby="button-12-hint"
          onClick={resend}
        >
          <RefreshCw aria-hidden="true" data-icon="inline-start" />
          {exhausted ? (
            "Resend limit reached"
          ) : coolingDown ? (
            <span>
              Resend code in{" "}
              <span className="tabular-nums">{formatSeconds(remaining)}</span>
            </span>
          ) : (
            "Resend code"
          )}
        </Button>
        <Button variant="link" className="self-center">
          Use a different email
        </Button>
      </div>
      <p id="button-12-hint" className="text-xs text-muted-foreground">
        {exhausted
          ? "Still nothing? Check your spam folder or contact support."
          : `You can request ${maxResends - resends} more ${maxResends - resends === 1 ? "code" : "codes"}.`}
      </p>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
