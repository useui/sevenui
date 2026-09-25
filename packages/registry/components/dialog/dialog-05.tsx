"use client";

import * as React from "react";
import { CircleCheck } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";

const receipt = [
  { label: "Amount", value: "$1,240.00" },
  { label: "Invoice", value: "INV-2026-0418" },
  { label: "Paid with", value: "Visa ending 4242" },
];

// Shown once the payer asks for the full receipt.
const receiptDetails = [
  { label: "Date", value: "Sep 25, 2026, 10:42 AM" },
  { label: "Transaction", value: "txn_3PQ8f2A91c" },
  { label: "Processing fee", value: "$0.00" },
];

export default function Dialog05() {
  const [showDetails, setShowDetails] = React.useState(false);
  const rows = showDetails ? [...receipt, ...receiptDetails] : receipt;

  return (
    <Dialog
      onOpenChangeComplete={(open) => {
        if (!open) setShowDetails(false);
      }}
    >
      <DialogTrigger render={<Button>Pay $1,240.00</Button>} />
      <DialogContent showCloseButton={false} className="gap-5 sm:max-w-xs">
        <DialogHeader className="items-center text-center">
          <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CircleCheck aria-hidden="true" className="size-6" />
          </div>
          <DialogTitle>Payment received</DialogTitle>
          <DialogDescription className="text-balance">
            Northwind Studio has been paid. A receipt is on its way to
            billing@acme.co.
          </DialogDescription>
        </DialogHeader>
        <dl
          id="dialog-05-receipt"
          className="grid gap-2 rounded-lg bg-muted/60 p-3 text-sm"
        >
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-medium tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
        <DialogFooter className="mx-0 mb-0 grid grid-cols-2 border-t-0 bg-transparent p-0 sm:flex-row">
          <Button
            variant="outline"
            aria-expanded={showDetails}
            aria-controls="dialog-05-receipt"
            onClick={() => setShowDetails((current) => !current)}
          >
            {showDetails ? "Hide receipt" : "View receipt"}
          </Button>
          <DialogClose render={<Button>Done</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
