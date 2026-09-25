"use client";

import { ChevronDownIcon, ShoppingBagIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import { Separator } from "@/registry/base/ui/separator";

const lineItems = [
  {
    name: "Merino crew sweater",
    variant: "Oat · Size M",
    quantity: 1,
    price: 128,
  },
  {
    name: "Organic cotton tee",
    variant: "Charcoal · Size M",
    quantity: 2,
    price: 38,
  },
  {
    name: "Wool blend socks",
    variant: "3-pack · One size",
    quantity: 1,
    price: 24,
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const subtotal = lineItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0,
);
const discount = 22.8;
const shipping = 0;
const tax = 17.1;
const total = subtotal - discount + shipping + tax;

export default function Collapsible08() {
  return (
    <Collapsible className="w-full max-w-sm overflow-hidden rounded-xl border bg-card text-card-foreground">
      <CollapsibleTrigger className="group flex w-full items-center gap-3 bg-muted/50 px-4 py-3.5 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset">
        <ShoppingBagIcon aria-hidden="true" className="size-4 shrink-0" />
        <span className="flex-1 text-sm font-medium">
          <span className="group-data-panel-open:hidden">
            Show order summary
          </span>
          <span className="hidden group-data-panel-open:inline">
            Hide order summary
          </span>
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-transform group-data-panel-open:rotate-180"
        />
        <span className="font-semibold tabular-nums">
          {currency.format(total)}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-4 border-t p-4">
          <ul className="flex flex-col gap-3">
            {lineItems.map((item) => (
              <li key={item.name} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src="/placeholder.svg"
                    alt=""
                    className="size-12 rounded-md border bg-muted object-cover"
                  />
                  <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[0.7rem] font-medium text-primary-foreground tabular-nums">
                    <span className="sr-only">Quantity </span>
                    {item.quantity}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.variant}
                  </span>
                </div>
                <span className="text-sm tabular-nums">
                  {currency.format(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <Separator />
          <dl className="grid grid-cols-[1fr_auto] gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-right tabular-nums">
              {currency.format(subtotal)}
            </dd>
            <dt className="text-muted-foreground">
              Discount{" "}
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                AUTUMN10
              </span>
            </dt>
            <dd className="text-right text-success tabular-nums">
              −{currency.format(discount)}
            </dd>
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="text-right">Free</dd>
            <dt className="text-muted-foreground">Estimated tax</dt>
            <dd className="text-right tabular-nums">{currency.format(tax)}</dd>
          </dl>
          <Separator />
          <div className="flex items-baseline justify-between">
            <span className="font-medium">Total</span>
            <span className="text-lg font-semibold tabular-nums">
              <span className="mr-1 text-xs font-normal text-muted-foreground">
                USD
              </span>
              {currency.format(total)}
            </span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
