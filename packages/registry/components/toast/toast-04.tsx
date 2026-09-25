"use client";

import * as React from "react";
import {
  CircleCheckIcon,
  LifeBuoyIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Toast,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  useToastManager,
} from "@/registry/base/ui/toast";

type Answer = "yes" | "no";

const ticket = {
  id: "4821",
  subject: "Refund for a duplicate charge",
  agent: "Nora Ellis",
};

const FEEDBACK_ID = "ticket-feedback";

const toastManager = createToastManager();

function FeedbackToasts({ onAnswer }: { onAnswer: (answer: Answer) => void }) {
  const { toasts } = useToastManager();

  return toasts.map((toastItem) => {
    const asking = toastItem.type === "question";

    return (
      <Toast key={toastItem.id} toast={toastItem}>
        <ToastContent className="gap-3 py-3 pr-3">
          {asking ? null : (
            <CircleCheckIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-success"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <ToastTitle />
            <ToastDescription className="text-xs text-pretty" />
          </div>
          {asking ? (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Yes, it's resolved"
                onClick={() => onAnswer("yes")}
              >
                <ThumbsUpIcon aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="No, I still need help"
                onClick={() => onAnswer("no")}
              >
                <ThumbsDownIcon aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <ToastClose />
          )}
        </ToastContent>
      </Toast>
    );
  });
}

export default function Toast04() {
  const [status, setStatus] = React.useState<"open" | "pending" | Answer>(
    "open",
  );

  const resolve = () => {
    setStatus("pending");
    toastManager.add({
      id: FEEDBACK_ID,
      type: "question",
      title: "Did this solve your issue?",
      description: `Your answer closes or reopens ticket #${ticket.id}.`,
      timeout: 0,
      // Swiping the prompt away without answering leaves the ticket open.
      onClose: () =>
        setStatus((current) => (current === "pending" ? "open" : current)),
    });
  };

  const answer = (value: Answer) => {
    setStatus(value);
    toastManager.update(FEEDBACK_ID, {
      type: "answered",
      title: "Thanks for the feedback",
      description:
        value === "yes"
          ? `Ticket #${ticket.id} is closed. ${ticket.agent} will see your rating.`
          : `Ticket #${ticket.id} is reopened. Expect a reply within 4 hours.`,
      timeout: 4000,
    });
  };

  const badge =
    status === "yes"
      ? { label: "Closed", variant: "secondary" as const }
      : status === "no"
        ? { label: "Reopened", variant: "destructive" as const }
        : { label: "Awaiting you", variant: "outline" as const };

  return (
    <ToastProvider toastManager={toastManager}>
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground">
        <div className="flex items-start gap-3">
          <span className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:flex">
            <LifeBuoyIcon aria-hidden="true" className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm font-medium text-pretty">
              {ticket.subject}
            </span>
            <span className="text-sm text-muted-foreground">
              #{ticket.id} · {ticket.agent} replied 5 min ago
            </span>
          </div>
          <Badge variant={badge.variant} className="shrink-0">
            {badge.label}
          </Badge>
        </div>
        <p className="text-sm text-pretty text-muted-foreground">
          “I’ve refunded the second charge of $49.00. It should reach your card
          in 3–5 business days.”
        </p>
        <Button
          variant="outline"
          disabled={status === "pending"}
          onClick={resolve}
        >
          {status === "open" ? "Mark as resolved" : "Ask again"}
        </Button>
      </div>
      <ToastPortal>
        <ToastViewport>
          <FeedbackToasts onAnswer={answer} />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
