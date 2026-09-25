"use client";

import { ArrowUpRightIcon } from "lucide-react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";

export default function HoverCard01() {
  return (
    <p className="w-full max-w-md text-sm leading-relaxed text-muted-foreground">
      Upgrading mid-cycle moves you to the new plan immediately. The difference
      is charged as{" "}
      <HoverCard>
        <HoverCardTrigger
          href="#proration"
          className="rounded-sm font-medium text-foreground underline decoration-muted-foreground/60 decoration-dotted underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:decoration-foreground"
        >
          proration
        </HoverCardTrigger>
        <HoverCardContent side="top" className="flex w-72 flex-col gap-2 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium">Proration</span>
            <span className="text-xs text-muted-foreground">Billing term</span>
          </div>
          <p className="text-muted-foreground">
            A partial charge for the days left in your billing period. Moving
            from Team to Business on day 18 of 30 bills 12 days at the new
            rate, minus what you already paid.
          </p>
          <a
            href="#billing-glossary"
            className="inline-flex w-fit items-center gap-1 rounded-sm text-xs font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Billing glossary
            <ArrowUpRightIcon className="size-3" aria-hidden="true" />
          </a>
        </HoverCardContent>
      </HoverCard>{" "}
      on your next invoice, and unused time on the old plan is credited back.
    </p>
  );
}
