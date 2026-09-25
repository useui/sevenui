"use client";

import { InfoIcon, ReceiptTextIcon } from "lucide-react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";
import { Progress } from "@/registry/base/ui/progress";
import { Separator } from "@/registry/base/ui/separator";

type Breakdown = {
  heading: string;
  note: string;
  rows: { label: string; detail: string; amount: string; share: number }[];
};

type LineItem = {
  label: string;
  meta: string;
  amount: string;
  breakdown?: Breakdown;
};

const lineItems: LineItem[] = [
  {
    label: "Scale plan",
    meta: "Sep 1 – Sep 30 · 12 seats",
    amount: "$588.00",
  },
  {
    label: "API requests",
    meta: "4.2M of 3M included",
    amount: "$144.00",
    breakdown: {
      heading: "1.2M requests over your included quota",
      note: "Billed at $0.12 per 1,000 requests above 3M.",
      rows: [
        {
          label: "checkout-service",
          detail: "680K over",
          amount: "$81.60",
          share: 57,
        },
        {
          label: "search-indexer",
          detail: "390K over",
          amount: "$46.80",
          share: 32,
        },
        {
          label: "staging",
          detail: "130K over",
          amount: "$15.60",
          share: 11,
        },
      ],
    },
  },
  {
    label: "Storage",
    meta: "312 GB of 250 GB included",
    amount: "$15.50",
    breakdown: {
      heading: "62 GB over your included storage",
      note: "Billed at $0.25 per GB-month, prorated daily.",
      rows: [
        {
          label: "Media uploads",
          detail: "41 GB over",
          amount: "$10.25",
          share: 66,
        },
        {
          label: "Database backups",
          detail: "21 GB over",
          amount: "$5.25",
          share: 34,
        },
      ],
    },
  },
];

function BreakdownCard({
  item,
  breakdown,
}: {
  item: LineItem;
  breakdown: Breakdown;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={250}
        render={
          <button
            type="button"
            className="group inline-flex items-center gap-1 rounded-sm text-left text-xs text-muted-foreground underline decoration-dotted underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        }
      >
        {item.meta}
        <InfoIcon aria-hidden="true" className="size-3 shrink-0" />
        <span className="sr-only">, show {item.label} breakdown</span>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className="w-80 max-w-[calc(100vw-2rem)] p-3"
      >
        <p className="text-sm font-medium">{breakdown.heading}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {breakdown.note}
        </p>
        <ul className="mt-3 grid gap-3">
          {breakdown.rows.map((row) => (
            <li key={row.label} className="grid gap-1.5">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="truncate font-mono">{row.label}</span>
                <span className="shrink-0 font-medium tabular-nums">
                  {row.amount}
                </span>
              </div>
              <Progress
                value={row.share}
                aria-label={`${row.label}: ${row.share}% of overage, ${row.detail}`}
                className="gap-0 [&_[data-slot=progress-track]]:h-1"
              />
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-xs">
          <span className="text-muted-foreground">Overage total</span>
          <span className="font-medium tabular-nums">{item.amount}</span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function HoverCard10() {
  return (
    <section
      aria-labelledby="hover-card-10-title"
      className="w-full max-w-sm rounded-xl border bg-card p-4 text-card-foreground"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 id="hover-card-10-title" className="text-sm font-medium">
            Upcoming invoice
          </h3>
          <p className="text-xs text-muted-foreground">
            Charged to Visa ending 4242 on Oct&nbsp;1
          </p>
        </div>
        <ReceiptTextIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
      </header>
      <ul className="mt-4 grid gap-3">
        {lineItems.map((item) => (
          <li
            key={item.label}
            className="flex items-start justify-between gap-3"
          >
            <div className="grid min-w-0 gap-0.5">
              <span className="text-sm">{item.label}</span>
              {item.breakdown ? (
                <BreakdownCard item={item} breakdown={item.breakdown} />
              ) : (
                <span className="text-xs text-muted-foreground">
                  {item.meta}
                </span>
              )}
            </div>
            <span className="text-sm tabular-nums">{item.amount}</span>
          </li>
        ))}
      </ul>
      <Separator className="my-4" />
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">Estimated total</span>
        <span className="text-lg font-semibold tabular-nums">$747.50</span>
      </div>
    </section>
  );
}
