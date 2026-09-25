"use client";

import * as React from "react";
import { Minus, Plus, Truck, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/registry/base/ui/alert-dialog";
import { Button } from "@/registry/base/ui/button";
import { Progress, ProgressLabel } from "@/registry/base/ui/progress";

type Line = {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
};

const FREE_SHIPPING_AT = 75;
const SHIPPING_FEE = 6.95;

const initialCart: Line[] = [
  {
    id: "l-1",
    name: "Merino crew sweater",
    variant: "Oat · M",
    price: 48,
    quantity: 1,
  },
  {
    id: "l-2",
    name: "Ribbed wool beanie",
    variant: "Charcoal",
    price: 18,
    quantity: 1,
  },
  {
    id: "l-3",
    name: "Cotton ankle socks",
    variant: "3-pack · 39–42",
    price: 14,
    quantity: 1,
  },
];

const money = (value: number) => `$${value.toFixed(2)}`;

const subtotalOf = (lines: Line[]) =>
  lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

export default function AlertDialog13() {
  const [cart, setCart] = React.useState(initialCart);
  const [open, setOpen] = React.useState(false);
  // The change waiting for confirmation, plus what it would leave behind.
  const [pending, setPending] = React.useState<{
    next: Line[];
    label: string;
    subtotal: number;
  } | null>(null);

  const subtotal = subtotalOf(cart);
  const qualifies = subtotal >= FREE_SHIPPING_AT;

  // Only interrupt when the edit costs the shopper their free shipping.
  const applyChange = (next: Line[], label: string) => {
    const nextSubtotal = subtotalOf(next);
    if (qualifies && nextSubtotal < FREE_SHIPPING_AT) {
      setPending({ next, label, subtotal: nextSubtotal });
      setOpen(true);
      return;
    }
    setCart(next);
  };

  const setQuantity = (line: Line, quantity: number) => {
    const next =
      quantity === 0
        ? cart.filter((item) => item.id !== line.id)
        : cart.map((item) =>
            item.id === line.id ? { ...item, quantity } : item,
          );
    applyChange(
      next,
      quantity === 0
        ? `Removing the ${line.name}`
        : `Lowering the ${line.name} to ${quantity}`,
    );
  };

  const shortfall = pending ? FREE_SHIPPING_AT - pending.subtotal : 0;

  return (
    <section
      aria-labelledby="alert-dialog-13-heading"
      className="w-full max-w-sm rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-baseline justify-between border-b px-4 py-3">
        <h3 id="alert-dialog-13-heading" className="text-sm font-medium">
          Your bag
        </h3>
        <span className="text-sm tabular-nums">{money(subtotal)}</span>
      </header>

      <div className="border-b px-4 py-3">
        <Progress
          value={Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100)}
          className="gap-2"
        >
          <ProgressLabel className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
            <Truck aria-hidden="true" className="size-3.5" />
            {qualifies
              ? "Free standard shipping unlocked"
              : `${money(FREE_SHIPPING_AT - subtotal)} away from free shipping`}
          </ProgressLabel>
        </Progress>
      </div>

      {cart.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Your bag is empty.{" "}
          <button
            type="button"
            className="rounded-sm underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            onClick={() => setCart(initialCart)}
          >
            Restore items
          </button>
        </p>
      ) : (
        <ul className="divide-y">
          {cart.map((line) => (
            <li key={line.id} className="flex gap-3 px-4 py-3">
              <img
                src="/placeholder.svg"
                alt=""
                className="size-14 shrink-0 rounded-md border bg-muted object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{line.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {line.variant}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => setQuantity(line, 0)}
                  >
                    <X aria-hidden="true" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      aria-label={`Decrease ${line.name} quantity`}
                      onClick={() => setQuantity(line, line.quantity - 1)}
                    >
                      <Minus aria-hidden="true" />
                    </Button>
                    <span className="w-6 text-center text-sm tabular-nums">
                      {line.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      aria-label={`Increase ${line.name} quantity`}
                      onClick={() => setQuantity(line, line.quantity + 1)}
                    >
                      <Plus aria-hidden="true" />
                    </Button>
                  </div>
                  <span className="text-sm tabular-nums">
                    {money(line.price * line.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Truck aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Lose free shipping?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.label} drops your bag to {money(pending?.subtotal ?? 0)}
              , which is {money(shortfall)} under the {money(FREE_SHIPPING_AT)}{" "}
              minimum. A {money(SHIPPING_FEE)} shipping fee would apply.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep as is</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) setCart(pending.next);
              }}
            >
              Update bag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
