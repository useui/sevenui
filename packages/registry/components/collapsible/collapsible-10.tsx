"use client";

import { ChevronDownIcon, ReceiptTextIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

const charges = [
  {
    product: "Pro plan",
    detail: "5 seats × $20",
    amount: 100,
    color: "bg-chart-1",
  },
  {
    product: "Build minutes",
    detail: "420 min over the 3,000 included",
    amount: 33.6,
    color: "bg-chart-2",
  },
  {
    product: "Bandwidth",
    detail: "1.24 TB at $0.04 / GB over 1 TB",
    amount: 9.8,
    color: "bg-chart-3",
  },
  {
    product: "Image optimization",
    detail: "41,200 source images",
    amount: 40.8,
    color: "bg-chart-4",
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const total = charges.reduce((sum, charge) => sum + charge.amount, 0);

export default function Collapsible10() {
  return (
    <section
      aria-labelledby="collapsible-10-title"
      className="flex w-full max-w-md flex-col gap-5 rounded-xl border bg-card p-5 text-card-foreground"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3
            id="collapsible-10-title"
            className="text-sm text-muted-foreground"
          >
            Estimated bill ·{" "}
            <span className="whitespace-nowrap">Sep 1 – Sep 30</span>
          </h3>
          <p className="text-3xl font-semibold tracking-tight tabular-nums">
            {currency.format(total)}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <ReceiptTextIcon aria-hidden="true" data-icon="inline-start" />
          Invoices
        </Button>
      </div>

      <Meter value={3420} max={4000} aria-valuetext="3,420 of 4,000 minutes">
        <div className="flex items-baseline justify-between gap-2">
          <MeterLabel>Build minutes</MeterLabel>
          <MeterValue className="tabular-nums">
            {() => "3,420 / 4,000 min"}
          </MeterValue>
        </div>
      </Meter>

      <div
        role="img"
        aria-label="Share of this bill by product"
        className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full"
      >
        {charges.map((charge) => (
          <span
            key={charge.product}
            className={charge.color}
            style={{ width: `${(charge.amount / total) * 100}%` }}
          />
        ))}
      </div>

      <Collapsible className="-mx-2">
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
          Usage breakdown
          <ChevronDownIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform group-data-panel-open:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <table className="mt-2 w-full text-sm">
            <caption className="sr-only">Charges this billing period</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              {charges.map((charge) => (
                <tr key={charge.product} className="border-b last:border-b-0">
                  <th
                    scope="row"
                    className="px-2 py-2.5 text-left align-top font-normal"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span
                        aria-hidden="true"
                        className={`size-2 shrink-0 rounded-full ${charge.color}`}
                      />
                      {charge.product}
                    </span>
                    <span className="block pl-4 text-xs text-muted-foreground">
                      {charge.detail}
                    </span>
                  </th>
                  <td className="px-2 py-2.5 text-right align-top tabular-nums">
                    {currency.format(charge.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <th scope="row" className="px-2 pt-2.5 text-left font-medium">
                  Total before tax
                </th>
                <td className="px-2 pt-2.5 text-right font-semibold tabular-nums">
                  {currency.format(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
