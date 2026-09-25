"use client";

import * as React from "react";
import { ArrowLeftRightIcon } from "lucide-react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";
import { Slider } from "@/registry/base/ui/slider";

function describeDelay(ms: number) {
  if (ms === 0) return "Instant";
  if (ms < 400) return "Quick";
  if (ms < 800) return "Deliberate";
  return "Patient";
}

export default function HoverCard04() {
  const [delay, setDelay] = React.useState(600);
  const [closeDelay, setCloseDelay] = React.useState(300);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border border-border bg-card p-4 text-card-foreground">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span id="open-delay-label" className="font-medium">
              Open delay
            </span>
            <span className="text-muted-foreground tabular-nums">
              {describeDelay(delay)} · {delay} ms
            </span>
          </div>
          <Slider
            aria-labelledby="open-delay-label"
            min={0}
            max={1200}
            step={100}
            value={delay}
            onValueChange={(next) => setDelay(next as number)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span id="close-delay-label" className="font-medium">
              Close delay
            </span>
            <span className="text-muted-foreground tabular-nums">
              {closeDelay} ms
            </span>
          </div>
          <Slider
            aria-labelledby="close-delay-label"
            min={0}
            max={1000}
            step={50}
            value={closeDelay}
            onValueChange={(next) => setCloseDelay(next as number)}
          />
        </div>
      </div>
      <p className="border-t border-border pt-4 text-sm text-muted-foreground">
        Hotel in Lisbon, 3 nights:{" "}
        <HoverCard>
          <HoverCardTrigger
            href="#expense-lisbon-hotel"
            delay={delay}
            closeDelay={closeDelay}
            className="rounded-sm font-medium text-foreground tabular-nums underline decoration-muted-foreground/60 decoration-dotted underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:decoration-foreground"
          >
            €412.80
          </HoverCardTrigger>
          <HoverCardContent className="flex w-64 flex-col gap-2 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-lg font-semibold tabular-nums">
                $448.31
              </span>
              <span className="text-xs text-muted-foreground">USD</span>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-muted-foreground">Card rate</dt>
              <dd className="text-right tabular-nums">1 EUR = 1.0860 USD</dd>
              <dt className="text-muted-foreground">Foreign fee</dt>
              <dd className="text-right tabular-nums">$0.00</dd>
            </dl>
            <p className="inline-flex items-center gap-1 border-t pt-2 text-xs text-muted-foreground">
              <ArrowLeftRightIcon className="size-3" aria-hidden="true" />
              Converted on Sep 22 at settlement
            </p>
          </HoverCardContent>
        </HoverCard>{" "}
        is reimbursed in your home currency. Tune the delays, then hover the
        amount.
      </p>
    </div>
  );
}
