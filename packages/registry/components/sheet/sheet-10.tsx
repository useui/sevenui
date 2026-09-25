"use client";

import * as React from "react";
import { CircleCheck, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import { Progress, ProgressLabel } from "@/registry/base/ui/progress";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";

type CartLine = {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
};

const initialCart: CartLine[] = [
  {
    id: "linen-shirt",
    name: "Relaxed linen shirt",
    variant: "Sand · M",
    price: 68,
    quantity: 1,
  },
  {
    id: "canvas-tote",
    name: "Waxed canvas tote",
    variant: "Olive · One size",
    price: 54,
    quantity: 1,
  },
  {
    id: "wool-socks",
    name: "Merino crew socks",
    variant: "Charcoal · 2-pack",
    price: 18,
    quantity: 2,
  },
];

const FREE_SHIPPING_AT = 200;
const SHIPPING_FEE = 8;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Sheet10() {
  const [cart, setCart] = React.useState(initialCart);
  const [placed, setPlaced] = React.useState<number | null>(null);

  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );
  const remaining = Math.max(FREE_SHIPPING_AT - subtotal, 0);
  const shipping = remaining === 0 ? 0 : SHIPPING_FEE;

  const updateQuantity = (id: string, delta: number) =>
    setCart((lines) =>
      lines.map((line) =>
        line.id === id
          ? {
              ...line,
              quantity: Math.min(Math.max(line.quantity + delta, 1), 9),
            }
          : line,
      ),
    );

  const removeLine = (id: string) =>
    setCart((lines) => lines.filter((line) => line.id !== id));

  return (
    <Sheet
      onOpenChangeComplete={(open) => {
        // After a placed order closes, start a fresh cart for the next run.
        if (!open && placed !== null) {
          setPlaced(null);
          setCart(initialCart);
        }
      }}
    >
      <SheetTrigger render={<Button variant="outline" />}>
        <ShoppingBag aria-hidden="true" data-icon="inline-start" />
        Cart
        <span className="text-muted-foreground tabular-nums">
          ({itemCount})
        </span>
      </SheetTrigger>
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription>
            {placed !== null
              ? "Thanks for your order."
              : itemCount === 0
                ? "Nothing here yet."
              : `${itemCount} ${itemCount === 1 ? "item" : "items"} reserved for 30 minutes.`}
          </SheetDescription>
        </SheetHeader>
        {placed !== null ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleCheck aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Order placed</EmptyTitle>
              <EmptyDescription>
                We charged {currency.format(placed)} and emailed your receipt.
              </EmptyDescription>
            </EmptyHeader>
            <SheetClose render={<Button>Done</Button>} />
          </Empty>
        ) : cart.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingBag aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Your cart is empty</EmptyTitle>
              <EmptyDescription>
                Items you add from the shop will show up here.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center">
              <SheetClose
                render={<Button variant="outline">Keep shopping</Button>}
              />
              <Button variant="ghost" onClick={() => setCart(initialCart)}>
                Restore items
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <div className="border-b px-4 py-3">
              <Progress
                value={Math.min((subtotal / FREE_SHIPPING_AT) * 100, 100)}
                aria-valuetext={
                  remaining === 0
                    ? "Free shipping unlocked"
                    : `${currency.format(remaining)} away from free shipping`
                }
              >
                <ProgressLabel className="text-xs font-normal text-muted-foreground">
                  {remaining === 0 ? (
                    <span className="font-medium text-foreground">
                      Free shipping unlocked
                    </span>
                  ) : (
                    <>
                      Add{" "}
                      <span className="font-medium text-foreground tabular-nums">
                        {currency.format(remaining)}
                      </span>{" "}
                      for free shipping
                    </>
                  )}
                </ProgressLabel>
              </Progress>
            </div>
            <ul className="flex-1 overflow-y-auto" aria-label="Cart items">
              {cart.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-3 border-b px-4 py-4 last:border-b-0"
                >
                  <img
                    src="/placeholder.svg"
                    alt=""
                    className="size-20 shrink-0 rounded-md border bg-muted object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{line.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {line.variant}
                        </p>
                      </div>
                      <p className="font-medium tabular-nums">
                        {currency.format(line.price * line.quantity)}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <fieldset className="flex items-center rounded-lg border">
                        <legend className="sr-only">
                          Quantity for {line.name}
                        </legend>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => updateQuantity(line.id, -1)}
                          disabled={line.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus aria-hidden="true" />
                        </Button>
                        <output
                          aria-live="polite"
                          className="w-7 text-center text-sm tabular-nums"
                        >
                          {line.quantity}
                        </output>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => updateQuantity(line.id, 1)}
                          disabled={line.quantity >= 9}
                          aria-label="Increase quantity"
                        >
                          <Plus aria-hidden="true" />
                        </Button>
                      </fieldset>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => removeLine(line.id)}
                        aria-label={`Remove ${line.name}`}
                      >
                        <Trash2 aria-hidden="true" data-icon="inline-start" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <SheetFooter className="gap-3 border-t bg-muted/30">
              <dl className="grid gap-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{currency.format(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="tabular-nums">
                    {shipping === 0 ? "Free" : currency.format(shipping)}
                  </dd>
                </div>
                <div className="flex justify-between border-t pt-2 text-base font-medium">
                  <dt>Total</dt>
                  <dd className="tabular-nums">
                    {currency.format(subtotal + shipping)}
                  </dd>
                </div>
              </dl>
              <Button
                size="lg"
                className="w-full"
                onClick={() => setPlaced(subtotal + shipping)}
              >
                Checkout
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Taxes calculated at checkout. Free returns within 30 days.
              </p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
