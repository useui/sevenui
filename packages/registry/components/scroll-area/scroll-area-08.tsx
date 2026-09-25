"use client";

import * as React from "react";
import { Check, Loader2, Lock, Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { ScrollArea } from "@/registry/base/ui/scroll-area";
import { Separator } from "@/registry/base/ui/separator";

type LineItem = {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
};

const initialItems: LineItem[] = [
  {
    id: "sku-1042",
    name: "Merino crew sweater",
    variant: "Oat · M",
    price: 98,
    quantity: 1,
  },
  {
    id: "sku-2210",
    name: "Selvedge denim jacket",
    variant: "Indigo · L",
    price: 185,
    quantity: 1,
  },
  {
    id: "sku-3307",
    name: "Organic cotton tee",
    variant: "Bone · M",
    price: 34,
    quantity: 3,
  },
  {
    id: "sku-4115",
    name: "Canvas weekender bag",
    variant: "Olive",
    price: 142,
    quantity: 1,
  },
  {
    id: "sku-5089",
    name: "Wool blend beanie",
    variant: "Charcoal",
    price: 28,
    quantity: 2,
  },
  {
    id: "sku-6021",
    name: "Leather card holder",
    variant: "Cognac",
    price: 45,
    quantity: 1,
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ScrollArea08() {
  const [items, setItems] = React.useState(initialItems);
  const [checkout, setCheckout] = React.useState<"idle" | "pending" | "done">(
    "idle",
  );
  const checkoutTimer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(checkoutTimer.current), []);

  function startCheckout() {
    setCheckout("pending");
    window.clearTimeout(checkoutTimer.current);
    checkoutTimer.current = window.setTimeout(() => setCheckout("done"), 1200);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 200 || subtotal === 0 ? 0 : 12;
  const tax = Math.round(subtotal * 0.0825 * 100) / 100;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  function setQuantity(id: string, delta: number) {
    setCheckout("idle");
    setItems((current) =>
      current.map((i) =>
        i.id === id
          ? { ...i, quantity: Math.min(9, Math.max(1, i.quantity + delta)) }
          : i,
      ),
    );
  }

  function remove(id: string) {
    setCheckout("idle");
    setItems((current) => current.filter((i) => i.id !== id));
  }

  return (
    <div className="flex w-full max-w-sm flex-col rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex items-baseline justify-between px-5 pt-5 pb-3">
        <h3 id="scroll-area-08-title" className="font-semibold">
          Order summary
        </h3>
        <span className="text-sm text-muted-foreground tabular-nums">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>
      <ScrollArea
        role="region"
        aria-label="Items in your bag"
        className="h-72 border-y bg-muted/20"
      >
        {items.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            Your bag is empty.
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 px-5 py-3.5">
                <img
                  src="/placeholder.svg"
                  alt=""
                  className="size-16 shrink-0 rounded-md border bg-muted object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.variant}
                      </p>
                    </div>
                    <p className="text-sm font-medium tabular-nums">
                      {currency.format(item.price * item.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <fieldset
                      aria-label={`Quantity for ${item.name}`}
                      className="flex items-center rounded-md border bg-background"
                    >
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Decrease quantity"
                        disabled={item.quantity <= 1}
                        onClick={() => setQuantity(item.id, -1)}
                      >
                        <Minus aria-hidden="true" />
                      </Button>
                      <span
                        aria-live="polite"
                        className="w-6 text-center text-xs tabular-nums"
                      >
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Increase quantity"
                        disabled={item.quantity >= 9}
                        onClick={() => setQuantity(item.id, 1)}
                      >
                        <Plus aria-hidden="true" />
                      </Button>
                    </fieldset>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-muted-foreground"
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 aria-hidden="true" />
                      Remove
                      <span className="sr-only"> {item.name}</span>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
      <dl className="flex flex-col gap-1.5 px-5 pt-4 text-sm">
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
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Estimated tax</dt>
          <dd className="tabular-nums">{currency.format(tax)}</dd>
        </div>
        <Separator className="my-1.5" />
        <div className="flex justify-between font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">
            {currency.format(subtotal + shipping + tax)}
          </dd>
        </div>
      </dl>
      <div className="flex flex-col gap-2 p-5 pt-4">
        <Button
          size="lg"
          className="w-full"
          disabled={items.length === 0 || checkout !== "idle"}
          onClick={startCheckout}
        >
          {checkout === "pending" ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : checkout === "done" ? (
            <Check aria-hidden="true" />
          ) : (
            <Lock aria-hidden="true" />
          )}
          {checkout === "pending"
            ? "Securing checkout…"
            : checkout === "done"
              ? "Order placed"
              : "Checkout securely"}
        </Button>
        <p
          aria-live="polite"
          className="text-center text-xs text-muted-foreground"
        >
          {checkout === "done"
            ? "Order NW-48213 confirmed. A receipt is on its way."
            : "Free shipping on orders over $200. Returns within 30 days."}
        </p>
      </div>
    </div>
  );
}
