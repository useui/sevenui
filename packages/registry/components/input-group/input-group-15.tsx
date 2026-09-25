"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  RotateCwIcon,
  SendIcon,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import { Spinner } from "@/registry/base/ui/spinner";

const events = ["invoice.paid", "invoice.payment_failed", "customer.updated"];

function makeSecret() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "whsec_";
  for (let i = 0; i < 28; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

type TestResult =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "done"; ok: boolean; message: string };

export default function InputGroup15() {
  const urlId = useId();
  const secretId = useId();
  const urlHintId = useId();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [url, setUrl] = useState("api.northwind.io/hooks/billing");
  const [secret, setSecret] = useState("whsec_8f2kq9x7m1c4v6b3n5z0p2r8t1y");
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmRoll, setConfirmRoll] = useState(false);
  const [test, setTest] = useState<TestResult>({ state: "idle" });

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) clearTimeout(timer);
    };
  }, []);

  function later(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms));
  }

  const urlValid = /^[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i.test(url.trim());

  function sendTest() {
    if (!urlValid) return;
    setTest({ state: "sending" });
    later(() => {
      const ok = !url.includes("localhost");
      setTest({
        state: "done",
        ok,
        message: ok
          ? "200 OK · responded in 142 ms"
          : "Connection refused · endpoint must be publicly reachable",
      });
    }, 900);
  }

  const masked = `${secret.slice(0, 6)}${"•".repeat(20)}${secret.slice(-4)}`;

  return (
    <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">Billing webhook</h3>
        <Badge variant="outline" className="gap-1.5">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
          Enabled
        </Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        We POST a signed JSON payload to this endpoint for every subscribed
        event.
      </p>

      <div className="mt-5 flex flex-col gap-2">
        <label htmlFor={urlId} className="text-sm font-medium">
          Endpoint URL
        </label>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            id={urlId}
            value={url}
            spellCheck={false}
            className="pl-0.5! font-mono text-xs md:text-xs"
            aria-invalid={url && !urlValid ? true : undefined}
            aria-describedby={urlHintId}
            onChange={(event) => {
              setUrl(event.target.value.replace(/^https?:\/\//, ""));
              setTest({ state: "idle" });
            }}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant="secondary"
              disabled={!urlValid || test.state === "sending"}
              onClick={sendTest}
            >
              {test.state === "sending" ? (
                <Spinner className="size-3.5" />
              ) : (
                <SendIcon aria-hidden="true" />
              )}
              <span className="sr-only sm:not-sr-only">Send test</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <p
          id={urlHintId}
          aria-live="polite"
          className={
            (test.state === "done" && !test.ok) || (url && !urlValid)
              ? "text-xs text-destructive"
              : "text-xs text-muted-foreground"
          }
        >
          {url && !urlValid
            ? "Enter a full host and path, like api.example.com/webhooks."
            : test.state === "done"
              ? test.message
              : `Test sends a sample ${events[0]} event.`}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <label htmlFor={secretId} className="text-sm font-medium">
          Signing secret
        </label>
        <InputGroup>
          <InputGroupInput
            id={secretId}
            readOnly
            value={revealed ? secret : masked}
            spellCheck={false}
            className="font-mono text-xs md:text-xs"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label={revealed ? "Hide secret" : "Reveal secret"}
              aria-pressed={revealed}
              onClick={() => setRevealed((value) => !value)}
            >
              {revealed ? (
                <EyeOffIcon aria-hidden="true" />
              ) : (
                <EyeIcon aria-hidden="true" />
              )}
            </InputGroupButton>
            <InputGroupButton
              size="icon-xs"
              aria-label={copied ? "Copied" : "Copy secret"}
              onClick={() => {
                navigator.clipboard?.writeText(secret).catch(() => {});
                setCopied(true);
                later(() => setCopied(false), 1500);
              }}
            >
              {copied ? (
                <CheckIcon aria-hidden="true" />
              ) : (
                <CopyIcon aria-hidden="true" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <div className="flex min-h-7 flex-wrap items-center justify-between gap-2">
          {confirmRoll ? (
            <>
              <p className="text-xs text-muted-foreground">
                The current secret stops working in 24 hours.
              </p>
              <div className="flex gap-1.5">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setConfirmRoll(false)}
                >
                  Keep current
                </Button>
                <Button
                  size="xs"
                  variant="destructive"
                  onClick={() => {
                    setSecret(makeSecret());
                    setRevealed(true);
                    setConfirmRoll(false);
                  }}
                >
                  Roll secret
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Verify the Northwind-Signature header with this secret.
              </p>
              <Button
                size="xs"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => setConfirmRoll(true)}
              >
                <RotateCwIcon aria-hidden="true" />
                Roll secret
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-xs font-medium text-muted-foreground">Events</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {events.map((event) => (
            <li key={event}>
              <Badge variant="secondary" className="font-mono font-normal">
                {event}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
