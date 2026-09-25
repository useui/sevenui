"use client";

import * as React from "react";
import { CloudOffIcon, WifiOffIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

type Mode = "offline" | "retrying" | "local";

export default function Alert04() {
  const [mode, setMode] = React.useState<Mode>("offline");
  const [attempts, setAttempts] = React.useState(0);

  React.useEffect(() => {
    if (mode !== "retrying") return;
    // The server stays unreachable so the offline state can be replayed.
    const timer = setTimeout(() => setMode("offline"), 1200);
    return () => clearTimeout(timer);
  }, [mode]);

  if (mode === "local") {
    return (
      <Alert
        role="status"
        className="w-full max-w-sm grid-cols-[auto_1fr_auto] items-center gap-x-2"
      >
        <CloudOffIcon aria-hidden="true" className="row-span-1! translate-y-0!" />
        <AlertTitle className="col-start-2">Working offline</AlertTitle>
        <Button
          size="xs"
          variant="outline"
          className="col-start-3 row-start-1"
          onClick={() => setMode("retrying")}
        >
          Reconnect
        </Button>
      </Alert>
    );
  }

  const retrying = mode === "retrying";

  return (
    <Alert className="w-full max-w-sm justify-items-center gap-1 px-6 py-8 text-center shadow-sm">
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted">
        <WifiOffIcon aria-hidden="true" className="size-5 text-foreground" />
      </div>
      <AlertTitle className="text-base">You are offline</AlertTitle>
      <AlertDescription className="max-w-64" aria-live="polite">
        {retrying
          ? "Trying to reach the server…"
          : attempts > 0
            ? "Still no connection. Your draft is safe and will sync when the connection returns."
            : "We could not reach the server. Your draft is safe and will sync when the connection returns."}
      </AlertDescription>
      <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          size="sm"
          disabled={retrying}
          onClick={() => {
            setAttempts((count) => count + 1);
            setMode("retrying");
          }}
        >
          {retrying ? <Spinner data-icon="inline-start" aria-hidden="true" /> : null}
          {retrying ? "Retrying" : "Try again"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={retrying}
          onClick={() => setMode("local")}
        >
          Work offline
        </Button>
      </div>
    </Alert>
  );
}
