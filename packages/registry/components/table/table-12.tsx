"use client";

import { CheckIcon, MinusIcon, PlusIcon, XIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

const initialLines = [
  {
    sku: "CRM-MUG-12",
    name: "Stoneware mug",
    variant: "Oat, 12 oz",
    price: 24,
    qty: 2,
  },
  {
    sku: "LIN-TWL-SET",
    name: "Linen tea towels",
    variant: "Set of 3, Sage",
    price: 38,
    qty: 1,
  },
  {
    sku: "WAL-BRD-L",
    name: "Walnut serving board",
    variant: "Large",
    price: 72,
    qty: 1,
  },
];

const SHIPPING_THRESHOLD = 150;
const SHIPPING_FEE = 8;
const TAX_RATE = 0.0825;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Table12() {
  const [lines, setLines] = React.useState(initialLines);
  const [placed, setPlaced] = React.useState(false);

  const setQty = (sku: string, qty: number) =>
    setLines((prev) =>
      prev.map((line) =>
        line.sku === sku
          ? { ...line, qty: Math.min(9, Math.max(1, qty)) }
          : line,
      ),
    );

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const shipping =
    subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  if (placed) {
    return (
      <div className="grid w-full max-w-xl justify-items-center gap-3 rounded-xl border bg-card p-6 text-center text-card-foreground">
        <span className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckIcon aria-hidden="true" className="size-5" />
        </span>
        <div className="grid gap-1">
          <h3 className="font-semibold">Order placed</h3>
          <p className="text-sm text-muted-foreground">
            {money.format(total)} charged for{" "}
            {lines.reduce((sum, line) => sum + line.qty, 0)} items. A receipt is
            on its way to your inbox.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setLines(initialLines);
            setPlaced(false);
          }}
        >
          Start a new order
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-xl border bg-card p-4 text-card-foreground">
      <h3 id="table-12-title" className="mb-3 font-semibold">
        Your order
      </h3>
      <Table aria-labelledby="table-12-title">
        <TableCaption className="text-left">
          {subtotal >= SHIPPING_THRESHOLD
            ? "Free standard shipping applied."
            : `Add ${money.format(SHIPPING_THRESHOLD - subtotal)} more for free shipping.`}
        </TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-0">Item</TableHead>
            <TableHead className="hidden text-center sm:table-cell">
              Qty
            </TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-8 pr-0">
              <span className="sr-only">Remove</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                Your cart is empty.{" "}
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto px-0"
                  onClick={() => setLines(initialLines)}
                >
                  Restore items
                </Button>
              </TableCell>
            </TableRow>
          ) : (
            lines.map((line) => {
              // Rendered in the Qty column, or under the item on narrow screens.
              const stepper = (
              <fieldset
                aria-label={`Quantity for ${line.name}`}
                className="flex w-fit items-center rounded-lg border"
              >
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Decrease quantity"
                  disabled={line.qty <= 1}
                  onClick={() => setQty(line.sku, line.qty - 1)}
                >
                  <MinusIcon aria-hidden="true" />
                </Button>
                <output
                  aria-live="polite"
                  className="w-6 text-center text-sm tabular-nums"
                >
                  {line.qty}
                </output>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Increase quantity"
                  disabled={line.qty >= 9}
                  onClick={() => setQty(line.sku, line.qty + 1)}
                >
                  <PlusIcon aria-hidden="true" />
                </Button>
              </fieldset>
              );
              return (
              <TableRow key={line.sku} className="hover:bg-transparent">
                <TableCell className="py-3 pl-0">
                  <div className="flex items-center gap-3">
                    <img
                      src="/placeholder.svg"
                      alt=""
                      className="hidden size-10 rounded-md border bg-muted object-cover sm:block"
                    />
                    <div className="min-w-0 whitespace-normal">
                      <div className="font-medium">{line.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {line.variant} · {money.format(line.price)} each
                      </div>
                      <div className="mt-2 sm:hidden">{stepper}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex justify-center">{stepper}</div>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {money.format(line.price * line.qty)}
                </TableCell>
                <TableCell className="pr-0 text-right">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${line.name}`}
                    onClick={() =>
                      setLines((prev) => prev.filter((l) => l.sku !== line.sku))
                    }
                  >
                    <XIcon aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
              );
            })
          )}
        </TableBody>
        <TableFooter className="bg-transparent font-normal">
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell className="pt-3 pl-0 whitespace-normal text-muted-foreground sm:whitespace-nowrap">
              Subtotal
            </TableCell>
            <TableCell className="hidden sm:table-cell" />
            <TableCell className="pt-3 text-right tabular-nums">
              {money.format(subtotal)}
            </TableCell>
            <TableCell className="pr-0" />
          </TableRow>
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell className="pl-0 whitespace-normal text-muted-foreground sm:whitespace-nowrap">
              Shipping
            </TableCell>
            <TableCell className="hidden sm:table-cell" />
            <TableCell className="text-right tabular-nums">
              {shipping === 0 ? "Free" : money.format(shipping)}
            </TableCell>
            <TableCell className="pr-0" />
          </TableRow>
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell className="pl-0 whitespace-normal text-muted-foreground sm:whitespace-nowrap">
              Estimated tax (8.25%)
            </TableCell>
            <TableCell className="hidden sm:table-cell" />
            <TableCell className="text-right tabular-nums">
              {money.format(tax)}
            </TableCell>
            <TableCell className="pr-0" />
          </TableRow>
          <TableRow className="border-t hover:bg-transparent">
            <TableCell className="pl-0 text-base font-semibold whitespace-normal sm:whitespace-nowrap">
              Total
            </TableCell>
            <TableCell className="hidden sm:table-cell" />
            <TableCell className="text-right text-base font-semibold tabular-nums">
              {money.format(total)}
            </TableCell>
            <TableCell className="pr-0" />
          </TableRow>
        </TableFooter>
      </Table>
      <Button
        className="mt-4 w-full"
        size="lg"
        disabled={lines.length === 0}
        onClick={() => setPlaced(true)}
      >
        Continue to payment
      </Button>
    </div>
  );
}
