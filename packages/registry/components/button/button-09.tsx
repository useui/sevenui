"use client";

import { AlertCircle, Check, RotateCcw, Rocket } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Spinner } from "@/registry/base/ui/spinner";
import { Switch } from "@/registry/base/ui/switch";

type Status = "idle" | "pending" | "success" | "error";

const statusMessages: Record<Status, string> = {
  idle: "Build 2481 from main is ready to ship.",
  pending: "Deploying build 2481 to production…",
  success: "Build 2481 is live on northwind.studio.",
  error: "Health check failed on eu-west-1. Nothing was changed.",
};

export default function Button09() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [simulateFailure, setSimulateFailure] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function schedule(callback: () => void, delay: number) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(callback, delay);
  }

  function deploy() {
    setStatus("pending");
    schedule(() => {
      if (simulateFailure) {
        setStatus("error");
        return;
      }
      setStatus("success");
      schedule(() => setStatus("idle"), 2500);
    }, 1600);
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        {status === "error" ? (
          <Button variant="destructive" size="lg" className="w-full" onClick={deploy}>
            <RotateCcw aria-hidden="true" />
            Retry deploy
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full data-[status=success]:bg-success data-[status=success]:text-success-foreground"
            data-status={status}
            disabled={status === "pending"}
            focusableWhenDisabled
            onClick={status === "idle" ? deploy : undefined}
          >
            {status === "pending" && <Spinner aria-hidden="true" role="presentation" />}
            {status === "success" && <Check aria-hidden="true" />}
            {status === "idle" && <Rocket aria-hidden="true" />}
            {status === "pending"
              ? "Deploying…"
              : status === "success"
                ? "Deployed"
                : "Deploy to production"}
          </Button>
        )}
        <p
          role="status"
          className={
            status === "error"
              ? "flex items-start gap-1.5 text-xs text-destructive"
              : "text-xs text-muted-foreground"
          }
        >
          {status === "error" && (
            <AlertCircle aria-hidden="true" className="mt-px size-3.5 shrink-0" />
          )}
          {statusMessages[status]}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 border-t pt-4">
        <Label htmlFor="button-09-failure" className="text-muted-foreground">
          Simulate a failed health check
        </Label>
        <Switch
          id="button-09-failure"
          size="sm"
          checked={simulateFailure}
          onCheckedChange={setSimulateFailure}
        />
      </div>
    </div>
  );
}
