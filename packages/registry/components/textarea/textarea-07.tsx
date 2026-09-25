"use client";

import { CircleCheckIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Spinner } from "@/registry/base/ui/spinner";
import { Textarea } from "@/registry/base/ui/textarea";

type Status = "idle" | "sending" | "sent";

export default function Textarea07() {
  const id = useId();
  const [message, setMessage] = useState(
    "The CSV export drops the timezone from the created_at column, so our finance sheet shifts every row by two hours.",
  );
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const sending = status === "sending";
  const sent = status === "sent";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    setStatus("sending");
    timer.current = setTimeout(() => setStatus("sent"), 1600);
  }

  return (
    <form className="flex w-full max-w-sm flex-col gap-2" onSubmit={handleSubmit}>
      <Label htmlFor={`${id}-feedback`}>Report a problem</Label>
      <div className="relative">
        <Textarea
          id={`${id}-feedback`}
          value={message}
          rows={4}
          disabled={sending}
          readOnly={sent}
          aria-busy={sending || undefined}
          aria-describedby={`${id}-status`}
          onChange={(event) => setMessage(event.target.value)}
          className={
            sent
              ? "resize-none border-success/40 bg-success/5 text-muted-foreground dark:bg-success/10"
              : "resize-none"
          }
        />
        {sending ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-b-lg"
          >
            <div className="h-full w-1/3 animate-pulse bg-primary motion-reduce:animate-none" />
          </div>
        ) : null}
      </div>
      <div className="flex min-h-8 items-center justify-between gap-3">
        <p
          id={`${id}-status`}
          aria-live="polite"
          className={
            sent
              ? "flex items-center gap-1.5 text-sm text-success"
              : "text-sm text-muted-foreground"
          }
        >
          {sent ? (
            <>
              <CircleCheckIcon aria-hidden="true" className="size-4" />
              Sent. Ticket 7310 is open.
            </>
          ) : sending ? (
            "Sending to support..."
          ) : (
            "Goes to support with your workspace ID."
          )}
        </p>
        {sent ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setMessage("");
              setStatus("idle");
            }}
          >
            New report
          </Button>
        ) : (
          <Button type="submit" size="sm" disabled={sending || !message.trim()}>
            {sending ? <Spinner aria-hidden="true" /> : null}
            {sending ? "Sending" : "Send report"}
          </Button>
        )}
      </div>
    </form>
  );
}
