"use client";

import * as React from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  ShieldAlertIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/registry/base/ui/message";
import { Spinner } from "@/registry/base/ui/spinner";

type Status = "pending" | "running" | "done" | "denied";

const steps = [
  "Read the production environment config",
  "Found 2 services using STRIPE_WEBHOOK_SECRET",
  "Generated a new signing secret in the dashboard",
];

const services = ["checkout-api", "billing-worker"];

export default function Message12() {
  const [status, setStatus] = React.useState<Status>("pending");

  React.useEffect(() => {
    if (status !== "running") return;
    const timer = window.setTimeout(() => setStatus("done"), 1800);
    return () => window.clearTimeout(timer);
  }, [status]);

  return (
    <section
      aria-label="Ops agent run"
      className="flex w-full max-w-md flex-col gap-4 rounded-2xl border bg-card p-4 text-card-foreground"
    >
      <Message align="end">
        <MessageContent>
          <Bubble align="end" variant="secondary">
            <BubbleContent>
              Rotate the Stripe webhook secret on production.
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>

      <Message>
        <MessageAvatar className="size-8 self-start bg-primary text-primary-foreground group-has-data-[slot=message-footer]/message:translate-y-0">
          <SparklesIcon aria-hidden="true" className="size-4" />
        </MessageAvatar>
        <MessageContent className="gap-3">
          <MessageHeader className="px-0">Ops agent</MessageHeader>

          <Collapsible>
            <CollapsibleTrigger
              render={
                <Button
                  variant="ghost"
                  size="xs"
                  className="-ml-2 text-muted-foreground"
                />
              }
            >
              Worked through {steps.length} steps
              <ChevronDownIcon
                data-icon="inline-end"
                aria-hidden="true"
                className="transition-transform group-data-panel-open/button:rotate-180"
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ol className="mt-1 flex flex-col gap-1.5 border-l border-border pl-3 text-xs text-muted-foreground">
                {steps.map((step) => (
                  <li key={step} className="flex items-start gap-1.5">
                    <CheckIcon
                      aria-hidden="true"
                      className="mt-0.5 size-3 shrink-0 text-success"
                    />
                    {step}
                  </li>
                ))}
              </ol>
            </CollapsibleContent>
          </Collapsible>

          <div
            aria-live="polite"
            className="flex w-full flex-col gap-3 rounded-xl border bg-background p-3"
          >
            {status === "pending" && (
              <>
                <div className="flex items-start gap-2">
                  <ShieldAlertIcon
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-warning"
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="text-sm font-medium">Approval needed</p>
                    <p className="text-sm text-muted-foreground">
                      Applying the secret restarts these services. Checkout
                      pauses for about 20 seconds.
                    </p>
                  </div>
                </div>
                <ul className="flex flex-wrap gap-1.5">
                  {services.map((service) => (
                    <li
                      key={service}
                      className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatus("denied")}
                  >
                    Deny
                  </Button>
                  <Button size="sm" onClick={() => setStatus("running")}>
                    Approve and restart
                  </Button>
                </div>
              </>
            )}
            {status === "running" && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                Restarting checkout-api and billing-worker…
              </p>
            )}
            {status === "done" && (
              <p className="flex items-start gap-2 text-sm">
                <CheckIcon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-success"
                />
                Secret rotated. Both services are healthy and the old secret
                expires in 24 hours.
              </p>
            )}
            {status === "denied" && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <XIcon aria-hidden="true" className="size-4 shrink-0" />
                  Cancelled. Nothing was changed.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatus("pending")}
                >
                  Review again
                </Button>
              </div>
            )}
          </div>

          <MessageFooter className="px-0">
            {status === "done"
              ? "Completed in 41s"
              : status === "running"
                ? "Running"
                : "Waiting for you"}
          </MessageFooter>
        </MessageContent>
      </Message>
    </section>
  );
}
