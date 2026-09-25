"use client";

import * as React from "react";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";

const lineItems = [
  { id: "design", description: "Brand identity refresh", quantity: 1, rate: 3200 },
  { id: "pages", description: "Marketing page templates", quantity: 4, rate: 450 },
  { id: "support", description: "Launch week support hours", quantity: 6, rate: 120 },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Resizable09() {
  const [client, setClient] = React.useState("Northwind Studio");
  const [taxRate, setTaxRate] = React.useState("8.25");
  const [previewWidth, setPreviewWidth] = React.useState<number | null>(null);

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0,
  );
  const tax = subtotal * ((Number.parseFloat(taxRate) || 0) / 100);
  const compact = previewWidth !== null && previewWidth < 280;

  return (
    <div className="h-[400px] w-full max-w-3xl">
      <ResizablePanelGroup className="rounded-xl border bg-background">
        <ResizablePanel defaultSize="42%" minSize="32%">
          <form
            aria-label="Invoice details"
            onSubmit={(event) => event.preventDefault()}
            className="flex h-full flex-col gap-4 overflow-y-auto p-4"
          >
            <h3 className="text-sm font-semibold">Invoice INV-2041</h3>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="resizable-09-client">Bill to</Label>
              <Input
                id="resizable-09-client"
                value={client}
                onChange={(event) => setClient(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="resizable-09-tax">Sales tax (%)</Label>
              <Input
                id="resizable-09-tax"
                inputMode="decimal"
                value={taxRate}
                onChange={(event) => setTaxRate(event.target.value)}
              />
            </div>
            <p className="mt-auto text-xs leading-relaxed text-muted-foreground">
              Drag the divider to check how the invoice reads in a narrow
              email client.
            </p>
          </form>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize invoice preview" />
        <ResizablePanel
          defaultSize="58%"
          minSize="35%"
          onResize={(size) => setPreviewWidth(Math.round(size.inPixels))}
        >
          <section
            aria-label="Invoice preview"
            className="flex h-full flex-col bg-muted/50"
          >
            <div className="flex h-9 items-center justify-between gap-2 border-b px-3 text-xs text-muted-foreground">
              <span className="truncate">Preview</span>
              <span className="shrink-0 whitespace-nowrap tabular-nums">
                {previewWidth === null
                  ? ""
                  : `${previewWidth}px · ${compact ? "Compact" : "Full"}`}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-sm font-semibold">Fieldnote Design</span>
                  <span className="text-xs text-muted-foreground">
                    Due Oct 15, 2026
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Billed to{" "}
                  <span className="font-medium text-foreground">
                    {client || "—"}
                  </span>
                </div>
                <ul className="flex flex-col divide-y text-sm">
                  {lineItems.map((item) => (
                    <li
                      key={item.id}
                      className={
                        compact
                          ? "flex flex-col gap-0.5 py-2"
                          : "flex items-baseline justify-between gap-3 py-2"
                      }
                    >
                      <span className="min-w-0">
                        {item.description}
                        <span className="block text-xs text-muted-foreground tabular-nums">
                          {item.quantity} × {currency.format(item.rate)}
                        </span>
                      </span>
                      <span className="font-medium tabular-nums">
                        {currency.format(item.quantity * item.rate)}
                      </span>
                    </li>
                  ))}
                </ul>
                <dl className="flex flex-col gap-1 border-t pt-3 text-sm tabular-nums">
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Tax</dt>
                    <dd>{currency.format(tax)}</dd>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <dt>Total due</dt>
                    <dd>{currency.format(subtotal + tax)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
