"use client";

import * as React from "react";
import { CloudOffIcon, InboxIcon, RotateCwIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import { Spinner } from "@/registry/base/ui/spinner";

type Status = "error" | "retrying" | "resolved";

// The first retry fails again; the second one reaches the server.
const attemptsUntilSuccess = 2;

export default function Empty08() {
  const [status, setStatus] = React.useState<Status>("error");
  const [attempts, setAttempts] = React.useState(0);

  React.useEffect(() => {
    if (status !== "retrying") return;
    const timeout = window.setTimeout(() => {
      setStatus(attempts >= attemptsUntilSuccess ? "resolved" : "error");
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, [status, attempts]);

  const retry = () => {
    setAttempts((count) => count + 1);
    setStatus("retrying");
  };

  const reset = () => {
    setAttempts(0);
    setStatus("error");
  };

  if (status === "resolved") {
    return (
      <Empty className="w-full max-w-md border" aria-live="polite">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-10">
            <InboxIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Connected, no invoices yet</EmptyTitle>
          <EmptyDescription>
            Invoices from Stripe will sync here as soon as the first one is
            issued.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" variant="ghost" onClick={reset}>
            Replay the error state
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const retrying = status === "retrying";

  return (
    <Empty
      className="w-full max-w-md border border-destructive/30 bg-destructive/5"
      aria-live="polite"
    >
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="size-10 bg-destructive/10 text-destructive"
        >
          <CloudOffIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Couldn&apos;t load invoices</EmptyTitle>
        <EmptyDescription>
          {attempts === 0
            ? "The billing service didn't respond. Your data is safe; try again in a moment."
            : `Still unreachable after ${attempts} ${attempts === 1 ? "retry" : "retries"}. One more try usually does it.`}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="outline" disabled={retrying} onClick={retry}>
            {retrying ? (
              <Spinner data-icon="inline-start" aria-hidden="true" />
            ) : (
              <RotateCwIcon aria-hidden="true" data-icon="inline-start" />
            )}
            {retrying ? "Retrying" : "Try again"}
          </Button>
          <Button size="sm" variant="ghost" nativeButton={false} render={<a href="#status" />}>
            View status page
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
