"use client";

import { Check, CreditCard, Download, RefreshCw } from "lucide-react";
import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

type Status = "paid" | "failed" | "refunded";

type Invoice = {
  id: string;
  date: string;
  status: Status;
  card: string;
  lines: { label: string; amount: number }[];
};

const initialInvoices: Invoice[] = [
  {
    id: "INV-2026-0914",
    date: "Sep 14, 2026",
    status: "failed",
    card: "Visa ending 4242",
    lines: [
      { label: "Team plan · 12 seats", amount: 144 },
      { label: "Extra build minutes · 2,000", amount: 16 },
    ],
  },
  {
    id: "INV-2026-0814",
    date: "Aug 14, 2026",
    status: "paid",
    card: "Visa ending 4242",
    lines: [
      { label: "Team plan · 12 seats", amount: 144 },
      { label: "Seat added mid-cycle (prorated)", amount: 6.5 },
    ],
  },
  {
    id: "INV-2026-0714",
    date: "Jul 14, 2026",
    status: "refunded",
    card: "Mastercard ending 8810",
    lines: [{ label: "Team plan · 11 seats", amount: 132 }],
  },
];

const statusLabel: Record<Status, string> = {
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
};

const statusVariant: Record<Status, "secondary" | "destructive" | "outline"> =
  {
    paid: "secondary",
    failed: "destructive",
    refunded: "outline",
  };

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function total(lines: { amount: number }[]) {
  return lines.reduce((sum, line) => sum + line.amount, 0);
}

export default function Accordion13() {
  const [invoices, setInvoices] = React.useState(initialInvoices);
  const [retrying, setRetrying] = React.useState<string | null>(null);
  const [downloaded, setDownloaded] = React.useState<string | null>(null);
  const retryTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  React.useEffect(() => {
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
      if (downloadTimer.current) clearTimeout(downloadTimer.current);
    };
  }, []);

  // Simulates charging the card on file again; the second attempt goes through.
  function retry(id: string) {
    setRetrying(id);
    retryTimer.current = setTimeout(() => {
      setInvoices((current) =>
        current.map((invoice) =>
          invoice.id === id ? { ...invoice, status: "paid" } : invoice,
        ),
      );
      setRetrying(null);
    }, 1200);
  }

  // Simulates handing the PDF to the browser, then confirms on the button
  // briefly before it returns to its idle label.
  function download(id: string) {
    if (downloadTimer.current) clearTimeout(downloadTimer.current);
    setDownloaded(id);
    downloadTimer.current = setTimeout(() => setDownloaded(null), 1500);
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold">Billing history</h3>
        <p className="text-sm text-muted-foreground">
          Invoices are issued on the 14th of each month.
        </p>
      </div>
      <Accordion
        defaultValue={[initialInvoices[0].id]}
        className="rounded-xl border bg-card text-card-foreground"
      >
        {invoices.map((invoice) => (
          <AccordionItem key={invoice.id} value={invoice.id}>
            <AccordionTrigger className="items-center gap-3 px-4 py-3 hover:no-underline">
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span>{invoice.date}</span>
                <span className="truncate font-mono text-xs font-normal text-muted-foreground">
                  {invoice.id}
                </span>
              </span>
              <span className="flex flex-col items-end gap-1">
                <span className="tabular-nums">
                  {currency.format(total(invoice.lines))}
                </span>
                <Badge variant={statusVariant[invoice.status]}>
                  {statusLabel[invoice.status]}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex flex-col gap-4 rounded-lg bg-muted/50 p-3">
                <dl className="grid grid-cols-[1fr_auto] gap-y-2">
                  {invoice.lines.map((line) => (
                    <div key={line.label} className="contents">
                      <dt className="pr-4 text-muted-foreground">{line.label}</dt>
                      <dd className="text-right tabular-nums">
                        {currency.format(line.amount)}
                      </dd>
                    </div>
                  ))}
                  <div className="contents font-medium">
                    <dt className="border-t pt-2 pr-4">Total</dt>
                    <dd className="border-t pt-2 text-right tabular-nums">
                      {currency.format(total(invoice.lines))}
                    </dd>
                  </div>
                </dl>
                <p
                  aria-live="polite"
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <CreditCard aria-hidden="true" className="size-3.5" />
                  {invoice.status === "failed"
                    ? `${invoice.card} was declined. We'll retry on Sep 17.`
                    : invoice.status === "refunded"
                      ? `Refunded to ${invoice.card} on Jul 20.`
                      : `Charged to ${invoice.card}.`}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {invoice.status === "failed" && (
                  <Button
                    size="sm"
                    disabled={retrying === invoice.id}
                    onClick={() => retry(invoice.id)}
                  >
                    {retrying === invoice.id ? (
                      <Spinner data-icon="inline-start" />
                    ) : (
                      <RefreshCw aria-hidden="true" data-icon="inline-start" />
                    )}
                    {retrying === invoice.id ? "Retrying" : "Retry payment"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => download(invoice.id)}
                >
                  {downloaded === invoice.id ? (
                    <Check aria-hidden="true" data-icon="inline-start" />
                  ) : (
                    <Download aria-hidden="true" data-icon="inline-start" />
                  )}
                  {downloaded === invoice.id ? "Downloaded" : "Download PDF"}
                  <span className="sr-only"> for {invoice.id}</span>
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
