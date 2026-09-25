"use client";

import * as React from "react";

import { CircleAlertIcon, ReceiptTextIcon, RotateCwIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/base/ui/command";
import { Label } from "@/registry/base/ui/label";
import { Skeleton } from "@/registry/base/ui/skeleton";
import { Spinner } from "@/registry/base/ui/spinner";
import { Switch } from "@/registry/base/ui/switch";

type Invoice = {
  value: string;
  label: string;
  customer: string;
  amount: string;
};

type Status = "loading" | "error" | "ready";

const invoices: Invoice[] = [
  { value: "inv-2041", label: "INV-2041", customer: "Northwind Traders", amount: "$4,200.00" },
  { value: "inv-2042", label: "INV-2042", customer: "Globex Logistics", amount: "$860.50" },
  { value: "inv-2043", label: "INV-2043", customer: "Northwind Traders", amount: "$1,125.00" },
  { value: "inv-2044", label: "INV-2044", customer: "Acme Studio", amount: "$12,480.00" },
  { value: "inv-2045", label: "INV-2045", customer: "Brightline Health", amount: "$399.00" },
];

// Simulated network latency for the fake request.
const LATENCY_MS = 700;

export default function Command05() {
  const [query, setQuery] = React.useState("");
  const [offline, setOffline] = React.useState(false);
  const [status, setStatus] = React.useState<Status>("loading");
  const [items, setItems] = React.useState<Invoice[]>([]);
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    // `attempt` re-runs the request when the user presses Retry.
    void attempt;
    setStatus("loading");
    const timer = window.setTimeout(() => {
      if (offline) {
        setStatus("error");
        setItems([]);
        return;
      }
      const needle = query.trim().toLowerCase();
      setItems(
        invoices.filter((invoice) =>
          `${invoice.label} ${invoice.customer}`.toLowerCase().includes(needle),
        ),
      );
      setStatus("ready");
    }, LATENCY_MS);
    return () => window.clearTimeout(timer);
  }, [query, offline, attempt]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Command
        items={status === "ready" ? items : []}
        mode="none"
        value={query}
        onValueChange={setQuery}
        className="border border-border shadow-md"
      >
        <CommandInput
          placeholder="Search invoices or customers..."
          aria-label="Search invoices"
        />
        <div
          className="flex h-7 items-center gap-1.5 px-3 pt-1 text-xs text-muted-foreground"
          aria-live="polite"
        >
          {status === "loading" && (
            <>
              <Spinner className="size-3" aria-hidden="true" />
              Searching billing records…
            </>
          )}
          {status === "ready" &&
            `${items.length} ${items.length === 1 ? "invoice" : "invoices"} found`}
          {status === "error" && (
            <span className="text-destructive">Request failed</span>
          )}
        </div>
        {status === "loading" && (
          <div className="flex flex-col gap-1 p-1" aria-hidden="true">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex items-center gap-3 px-2 py-1.5">
                <Skeleton className="size-4 rounded-sm" />
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="ml-auto h-3.5 w-14" />
              </div>
            ))}
          </div>
        )}
        {status === "error" && (
          <div
            role="alert"
            className="m-1 flex flex-col items-center gap-2 rounded-lg bg-destructive/5 px-4 py-6 text-center"
          >
            <CircleAlertIcon aria-hidden="true" className="size-5 text-destructive" />
            <p className="text-sm font-medium">Couldn’t reach the billing service</p>
            <p className="text-xs text-muted-foreground">
              Check your connection, then try the search again.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-1"
              onClick={() => setAttempt((count) => count + 1)}
            >
              <RotateCwIcon aria-hidden="true" data-icon="inline-start" />
              Retry
            </Button>
          </div>
        )}
        <CommandList>
          {(invoice: Invoice) => (
            <CommandItem key={invoice.value} value={invoice}>
              <ReceiptTextIcon aria-hidden="true" className="text-muted-foreground" />
              <span className="shrink-0 font-mono text-xs whitespace-nowrap tabular-nums">{invoice.label}</span>
              <span className="truncate text-muted-foreground">{invoice.customer}</span>
              <span className="ml-auto shrink-0 tabular-nums">{invoice.amount}</span>
            </CommandItem>
          )}
        </CommandList>
        {status === "ready" && (
          <CommandEmpty>No invoice matches “{query.trim()}”.</CommandEmpty>
        )}
      </Command>
      <div className="flex items-center gap-2 px-1">
        <Switch
          id="command-05-offline"
          size="sm"
          checked={offline}
          onCheckedChange={setOffline}
        />
        <Label htmlFor="command-05-offline" className="text-xs font-normal">
          Simulate offline
        </Label>
      </div>
    </div>
  );
}
