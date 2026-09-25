"use client";

import { CheckIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

const LIMIT = 160;
const INITIAL_TEMPLATE =
  "Hi {first_name}, reminder: your cleaning at Brightside Dental is Tue, Oct 14 at 9:30 AM. Reply C to confirm or R to reschedule.";

export default function Textarea05() {
  const id = useId();
  const [message, setMessage] = useState(INITIAL_TEMPLATE);
  const [savedMessage, setSavedMessage] = useState(INITIAL_TEMPLATE);

  const count = message.length;
  const remaining = LIMIT - count;
  const ratio = Math.min(count / LIMIT, 1);
  const over = remaining < 0;
  const near = !over && remaining <= 20;
  const dirty = message !== savedMessage;

  const barColor = over ? "bg-destructive" : near ? "bg-warning" : "bg-primary";
  const countColor = over
    ? "text-destructive"
    : near
      ? "text-warning"
      : "text-muted-foreground";

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={`${id}-sms`}>Reminder text</Label>
        <span
          id={`${id}-count`}
          aria-live="polite"
          className={`text-xs tabular-nums transition-colors ${countColor}`}
        >
          {over
            ? `${-remaining} over, splits into 2 texts`
            : `${remaining} left in 1 text`}
        </span>
      </div>
      <div className="flex flex-col overflow-hidden rounded-lg">
        <Textarea
          id={`${id}-sms`}
          value={message}
          rows={4}
          aria-invalid={over || undefined}
          aria-describedby={`${id}-count`}
          onChange={(event) => setMessage(event.target.value)}
          className="resize-none rounded-b-none"
        />
        <div aria-hidden="true" className="h-1 w-full bg-muted">
          <div
            className={`h-full origin-left transition-[transform,background-color] duration-300 ease-out motion-reduce:transition-none ${barColor}`}
            style={{ transform: `scaleX(${ratio})` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Sent by SMS 24 hours before each appointment.
        </p>
        <Button
          size="sm"
          className="shrink-0"
          disabled={over || !dirty}
          onClick={() => setSavedMessage(message)}
        >
          {dirty ? null : <CheckIcon aria-hidden="true" />}
          {dirty ? "Save template" : "Saved"}
        </Button>
      </div>
    </div>
  );
}
