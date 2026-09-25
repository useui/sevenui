"use client";

import { CheckIcon, DownloadIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

type InvoiceStatus = "paid" | "open" | "refunded";

const invoices: {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: InvoiceStatus;
}[] = [
  {
    id: "INV-2026-0914",
    date: "Sep 14, 2026",
    plan: "Team, 12 seats",
    amount: "$228.00",
    status: "open",
  },
  {
    id: "INV-2026-0814",
    date: "Aug 14, 2026",
    plan: "Team, 12 seats",
    amount: "$228.00",
    status: "paid",
  },
  {
    id: "INV-2026-0714",
    date: "Jul 14, 2026",
    plan: "Team, 10 seats",
    amount: "$190.00",
    status: "paid",
  },
  {
    id: "INV-2026-0628",
    date: "Jun 28, 2026",
    plan: "Seat add-on",
    amount: "$19.00",
    status: "refunded",
  },
  {
    id: "INV-2026-0614",
    date: "Jun 14, 2026",
    plan: "Team, 10 seats",
    amount: "$190.00",
    status: "paid",
  },
];

const statusLabel: Record<InvoiceStatus, string> = {
  paid: "Paid",
  open: "Due Sep 28",
  refunded: "Refunded",
};

const statusClass: Record<InvoiceStatus, string> = {
  paid: "bg-success/10 text-success",
  open: "bg-warning/10 text-warning",
  refunded: "bg-muted text-muted-foreground",
};

function exportCsv() {
  const header = ["Invoice", "Date", "Description", "Status", "Amount"];
  const rows = invoices.map((invoice) => [
    invoice.id,
    invoice.date,
    invoice.plan,
    statusLabel[invoice.status],
    invoice.amount,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "billing-history.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function Table11() {
  // The invoice whose PDF was just requested, shown as a brief confirmation.
  const [downloaded, setDownloaded] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!downloaded) return;
    const timeout = window.setTimeout(() => setDownloaded(null), 1600);
    return () => window.clearTimeout(timeout);
  }, [downloaded]);

  return (
    <section
      aria-labelledby="table-11-title"
      className="w-full max-w-2xl rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-4 pb-3">
        <div className="grid gap-1">
          <h3 id="table-11-title" className="font-semibold">
            Billing history
          </h3>
          <p className="text-sm text-muted-foreground">
            Invoices are emailed to billing@northwind.io on each renewal.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <DownloadIcon aria-hidden="true" data-icon="inline-start" />
          Export CSV
        </Button>
      </div>
      <Table aria-labelledby="table-11-title">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Invoice</TableHead>
            <TableHead className="hidden sm:table-cell">Description</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-12 pr-4">
              <span className="sr-only">Download</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="pl-4">
                <div className="font-medium">{invoice.date}</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {invoice.id}
                </div>
                <Badge
                  className={`mt-1.5 sm:hidden ${statusClass[invoice.status]}`}
                >
                  {statusLabel[invoice.status]}
                </Badge>
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {invoice.plan}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge className={statusClass[invoice.status]}>
                  {statusLabel[invoice.status]}
                </Badge>
              </TableCell>
              <TableCell
                className={
                  invoice.status === "refunded"
                    ? "text-right tabular-nums text-muted-foreground line-through"
                    : "text-right tabular-nums"
                }
              >
                {invoice.amount}
              </TableCell>
              <TableCell className="pr-4 text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={
                    downloaded === invoice.id
                      ? `${invoice.id} downloaded`
                      : `Download ${invoice.id} as PDF`
                  }
                  onClick={() => setDownloaded(invoice.id)}
                >
                  {downloaded === invoice.id ? (
                    <CheckIcon aria-hidden="true" className="text-success" />
                  ) : (
                    <DownloadIcon aria-hidden="true" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
