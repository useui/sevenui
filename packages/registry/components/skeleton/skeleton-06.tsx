"use client";

import * as React from "react";
import { cn } from "cn";
import {
  CircleAlertIcon,
  PlusIcon,
  ReceiptIcon,
  RotateCwIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Skeleton } from "@/registry/base/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

type State = "loading" | "error" | "empty";

const states: { value: State; label: string }[] = [
  { value: "loading", label: "Loading" },
  { value: "error", label: "Error" },
  { value: "empty", label: "Empty" },
];

// Column widths for the invoice rows: number, customer, amount.
const rows = [
  ["w-14", "w-24", "w-12"],
  ["w-14", "w-32", "w-10"],
  ["w-14", "w-20", "w-14"],
  ["w-14", "w-28", "w-12"],
];

// Pulsing bones while loading, frozen ghosts once the request has settled.
function InvoiceRows({ state }: { state: State }) {
  const bone = cn(
    "motion-reduce:animate-none",
    state === "error" && "animate-none opacity-50",
    state === "empty" &&
      "animate-none border border-dashed border-border bg-transparent",
  );

  return (
    <div aria-hidden="true" className="flex flex-col divide-y divide-border">
      {rows.map((widths, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
        <div key={index} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className={cn("h-3", widths[0], bone)} />
          <Skeleton className={cn("h-3 flex-none", widths[1], bone)} />
          <Skeleton className={cn("ml-auto h-3", widths[2], bone)} />
        </div>
      ))}
    </div>
  );
}

export default function Skeleton06() {
  const [state, setState] = React.useState<State>("loading");

  return (
    <Tabs
      value={state}
      onValueChange={(value) => setState(value as State)}
      className="w-full max-w-sm"
    >
      <TabsList className="w-full">
        {states.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="relative mt-2 overflow-hidden rounded-xl border border-border">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
          <span>Recent invoices</span>
          <span>Amount</span>
        </div>

        <TabsContent value="loading">
          <div role="status" aria-label="Loading invoices">
            <InvoiceRows state="loading" />
            <span className="sr-only">Loading invoices…</span>
          </div>
        </TabsContent>

        <TabsContent value="error" className="relative">
          <InvoiceRows state="error" />
          <div
            role="alert"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 px-6 text-center"
          >
            <CircleAlertIcon
              aria-hidden="true"
              className="size-5 text-destructive"
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Couldn't load invoices</p>
              <p className="text-xs text-muted-foreground">
                The billing service timed out. Your data is safe.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setState("loading")}
            >
              <RotateCwIcon aria-hidden="true" data-icon="inline-start" />
              Try again
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="empty" className="relative">
          <InvoiceRows state="empty" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 px-6 text-center">
            <ReceiptIcon
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">No invoices yet</p>
              <p className="text-xs text-muted-foreground">
                Invoices you send will be listed here.
              </p>
            </div>
            {/* Creating a draft refetches the list, so it goes back to loading. */}
            <Button size="sm" onClick={() => setState("loading")}>
              <PlusIcon aria-hidden="true" data-icon="inline-start" />
              New invoice
            </Button>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
