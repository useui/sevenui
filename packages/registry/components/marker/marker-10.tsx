"use client";

import * as React from "react";
import {
  ArrowUpCircleIcon,
  CheckIcon,
  DownloadIcon,
  TicketPercentIcon,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";

type Row =
  | { kind: "year"; id: string; label: string }
  | {
      kind: "invoice";
      id: string;
      date: string;
      amount: string;
      plan: string;
      status: "Paid" | "Refunded";
    }
  | { kind: "note"; id: string; icon: "upgrade" | "coupon"; text: string };

const rows: Row[] = [
  { kind: "year", id: "y2026", label: "2026" },
  {
    kind: "invoice",
    id: "INV-0931",
    date: "Sep 1",
    amount: "$96.00",
    plan: "Team · 8 seats",
    status: "Paid",
  },
  {
    kind: "note",
    id: "n-upgrade",
    icon: "upgrade",
    text: "Upgraded from Starter to Team on Aug 14 · $31.20 prorated",
  },
  {
    kind: "invoice",
    id: "INV-0874",
    date: "Aug 1",
    amount: "$29.00",
    plan: "Starter",
    status: "Paid",
  },
  {
    kind: "invoice",
    id: "INV-0812",
    date: "Jul 1",
    amount: "$29.00",
    plan: "Starter",
    status: "Refunded",
  },
  { kind: "year", id: "y2025", label: "2025" },
  {
    kind: "note",
    id: "n-coupon",
    icon: "coupon",
    text: "LAUNCH25 applied — 25% off for 3 months",
  },
  {
    kind: "invoice",
    id: "INV-0655",
    date: "Dec 1",
    amount: "$21.75",
    plan: "Starter",
    status: "Paid",
  },
];

export default function Marker10() {
  const [downloaded, setDownloaded] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function download(id: string) {
    if (timer.current) clearTimeout(timer.current);
    setDownloaded(id);
    // Simulate the file download finishing, then restore the icon.
    timer.current = setTimeout(() => setDownloaded(null), 2000);
  }

  return (
    <section
      aria-labelledby="marker-10-title"
      className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <div className="flex flex-col gap-0.5">
        <h3 id="marker-10-title" className="text-sm font-medium">
          Billing history
        </h3>
        <p className="text-sm text-muted-foreground">
          Invoices and plan changes for Brightline Studio.
        </p>
      </div>

      <ul className="flex flex-col">
        {rows.map((row) => {
          if (row.kind === "year") {
            return (
              <li key={row.id} className="py-2">
                <Marker variant="separator" className="text-xs">
                  <MarkerContent>{row.label}</MarkerContent>
                </Marker>
              </li>
            );
          }
          if (row.kind === "note") {
            return (
              <li key={row.id} className="py-1.5 pl-1">
                <Marker className="text-xs">
                  <MarkerIcon>
                    {row.icon === "upgrade" ? (
                      <ArrowUpCircleIcon />
                    ) : (
                      <TicketPercentIcon />
                    )}
                  </MarkerIcon>
                  <MarkerContent>{row.text}</MarkerContent>
                </Marker>
              </li>
            );
          }
          return (
            <li
              key={row.id}
              className="flex items-center gap-2 border-b border-border py-2.5 last:border-b-0 sm:gap-3"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium">
                  {row.date} <span className="sr-only">invoice</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  <span className="whitespace-nowrap">{row.id}&nbsp;·</span>{" "}
                  {row.plan}
                </span>
              </div>
              <Badge variant={row.status === "Paid" ? "outline" : "secondary"}>
                {row.status}
              </Badge>
              <span
                className={
                  row.status === "Refunded"
                    ? "w-16 text-right text-sm text-muted-foreground tabular-nums line-through"
                    : "w-16 text-right text-sm tabular-nums"
                }
              >
                {row.amount}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={
                  downloaded === row.id
                    ? `Invoice ${row.id} downloaded`
                    : `Download invoice ${row.id}`
                }
                onClick={() => download(row.id)}
              >
                {downloaded === row.id ? (
                  <CheckIcon aria-hidden="true" className="text-success" />
                ) : (
                  <DownloadIcon aria-hidden="true" />
                )}
              </Button>
            </li>
          );
        })}
      </ul>
      <p role="status" className="sr-only">
        {downloaded ? `Invoice ${downloaded} downloaded` : ""}
      </p>
    </section>
  );
}
