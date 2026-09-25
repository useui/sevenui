"use client";

import {
  Check,
  CircleCheck,
  CircleX,
  MessageSquareWarning,
  Undo2,
  X,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/registry/base/ui/button-group";
import { Spinner } from "@/registry/base/ui/spinner";

type Decision = "approve" | "changes" | "reject";

const decisions = [
  {
    value: "approve",
    label: "Approve",
    icon: Check,
    result: "Approved",
    resultIcon: CircleCheck,
    tone: "text-success",
  },
  {
    value: "changes",
    label: "Revise",
    icon: MessageSquareWarning,
    result: "Returned for changes",
    resultIcon: MessageSquareWarning,
    tone: "text-warning",
  },
  {
    value: "reject",
    label: "Reject",
    icon: X,
    result: "Rejected",
    resultIcon: CircleX,
    tone: "text-destructive",
  },
] as const;

export default function ButtonGroup07() {
  const [pending, setPending] = React.useState<Decision | null>(null);
  const [decided, setDecided] = React.useState<Decision | null>(null);

  React.useEffect(() => {
    if (!pending) return;
    const timeout = window.setTimeout(() => {
      setDecided(pending);
      setPending(null);
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, [pending]);

  const outcome = decisions.find((d) => d.value === decided);

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-sm font-medium">Team offsite catering</p>
          <p className="truncate text-xs text-muted-foreground">
            Expense EX-4821 · Submitted by Priya Raman
          </p>
        </div>
        <p className="text-sm font-medium tabular-nums">$1,240.00</p>
      </div>
      <div aria-live="polite">
        {outcome ? (
          <ButtonGroup aria-label="Review outcome">
            <ButtonGroupText className="bg-background font-normal dark:bg-input/30">
              <outcome.resultIcon
                aria-hidden="true"
                className={outcome.tone}
              />
              {outcome.result}
            </ButtonGroupText>
            <Button variant="outline" onClick={() => setDecided(null)}>
              <Undo2 aria-hidden="true" data-icon="inline-start" />
              Undo
            </Button>
          </ButtonGroup>
        ) : (
          <ButtonGroup
            aria-label="Review expense"
            aria-busy={pending !== null}
            className="w-full"
          >
            {decisions.map((decision) => {
              const isPending = pending === decision.value;
              return (
                <Button
                  key={decision.value}
                  variant="outline"
                  disabled={pending !== null}
                  onClick={() => setPending(decision.value)}
                  className="min-w-0 flex-1 shrink disabled:opacity-100 disabled:text-muted-foreground"
                >
                  {isPending ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <decision.icon
                      aria-hidden="true"
                      data-icon="inline-start"
                      className="hidden sm:block"
                    />
                  )}
                  <span className="truncate">{decision.label}</span>
                </Button>
              );
            })}
          </ButtonGroup>
        )}
      </div>
    </div>
  );
}
