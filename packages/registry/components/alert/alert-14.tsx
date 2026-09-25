"use client";

import * as React from "react";
import { CheckIcon, CopyIcon, KeyRoundIcon, LockIcon } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";

const firstSecret = "ak_live_51Hx9QeLmT7vRk2aPz0cN8wYbF3uJd";

const alphabet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function rollSecret() {
  let body = "";
  for (let i = 0; i < 30; i++) {
    body += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `ak_live_${body}`;
}

export default function Alert14() {
  const [copied, setCopied] = React.useState(false);
  const [stored, setStored] = React.useState(false);
  const [secret, setSecret] = React.useState(firstSecret);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(secret);
    } catch {
      // Clipboard access can be blocked; the key stays selectable below.
    }
    setCopied(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section
      aria-labelledby="alert-14-heading"
      className="grid w-full max-w-md gap-4 rounded-xl border bg-card p-4"
    >
      <div className="grid gap-1">
        <h3 id="alert-14-heading" className="font-medium">
          Production API key created
        </h3>
        <p className="text-sm text-muted-foreground">
          Name: checkout-service · Scope: payments:write
        </p>
      </div>
      {stored ? (
        <Alert role="status">
          <LockIcon aria-hidden="true" />
          <AlertTitle>Key hidden for good</AlertTitle>
          <AlertDescription>
            It now shows as{" "}
            <code className="font-mono text-xs whitespace-nowrap">
              ak_live_…{secret.slice(-4)}
            </code>
            . Roll a new key if you ever lose it.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-muted/50">
          <KeyRoundIcon aria-hidden="true" />
          <AlertTitle>Copy this key now</AlertTitle>
          <AlertDescription>
            For your security we only show it once. Store it in your secrets
            manager; if you lose it, roll a new key.
          </AlertDescription>
          <div className="col-start-2 mt-3 flex min-w-0 items-center gap-1 rounded-md border bg-background py-1 pr-1 pl-2.5">
            <code className="min-w-0 flex-1 truncate font-mono text-xs select-all">
              {secret}
            </code>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={copy}
              aria-label={copied ? "Copied" : "Copy API key"}
            >
              {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
            </Button>
          </div>
          <span className="sr-only" aria-live="polite">
            {copied ? "API key copied to clipboard" : ""}
          </span>
        </Alert>
      )}
      <div className="flex justify-end">
        {stored ? (
          <Button
            variant="outline"
            onClick={() => {
              setSecret(rollSecret());
              setStored(false);
            }}
          >
            Roll a new key
          </Button>
        ) : (
          <Button
            onClick={() => {
              setCopied(false);
              setStored(true);
            }}
          >
            I have saved my key
          </Button>
        )}
      </div>
    </section>
  );
}
