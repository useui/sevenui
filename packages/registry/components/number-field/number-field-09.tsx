"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";
import { Separator } from "@/registry/base/ui/separator";

const initialItems = [
  {
    id: "mug",
    name: "Stoneware mug",
    variant: "Sand, 350 ml",
    price: 24,
    stock: 12,
    quantity: 2,
  },
  {
    id: "kettle",
    name: "Pour-over kettle",
    variant: "Matte black, 1 L",
    price: 68,
    stock: 3,
    quantity: 1,
  },
  {
    id: "filters",
    name: "Paper filters",
    variant: "Pack of 100",
    price: 9,
    stock: 40,
    quantity: 3,
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function NumberField09() {
  const [items, setItems] = React.useState(initialItems);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 6;

  function setQuantity(id: string, quantity: number | null) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: quantity ?? 1 } : item,
      ),
    );
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section
      aria-labelledby="number-field-09-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-baseline justify-between px-5 pt-5 pb-3">
        <h3 id="number-field-09-title" className="font-semibold">
          Your cart
        </h3>
        <span className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </header>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border-t px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setItems(initialItems)}
          >
            Restore items
          </Button>
        </div>
      ) : (
        <ul className="divide-y border-y">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 px-5 py-4">
              <img
                src="/placeholder.svg"
                alt=""
                className="size-14 shrink-0 rounded-md border bg-muted object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.variant}
                    </p>
                  </div>
                  <p className="text-sm font-medium tabular-nums">
                    {currency.format(item.price * item.quantity)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <NumberField
                    value={item.quantity}
                    onValueChange={(value) => setQuantity(item.id, value)}
                    min={1}
                    max={item.stock}
                  >
                    <NumberFieldGroup className="h-8">
                      <NumberFieldDecrement
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="w-8"
                      />
                      <NumberFieldInput
                        aria-label={`Quantity of ${item.name}`}
                        className="w-10"
                      />
                      <NumberFieldIncrement
                        aria-label={`Increase quantity of ${item.name}`}
                        className="w-8"
                      />
                    </NumberFieldGroup>
                  </NumberField>
                  {item.quantity >= item.stock ? (
                    <span className="text-xs text-muted-foreground">
                      Only {item.stock} in stock
                    </span>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="ml-auto"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <dl className="grid gap-2 px-5 py-4 text-sm">
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
        <Separator className="my-1" />
        <div className="flex justify-between font-medium">
          <dt>Total</dt>
          <dd className="tabular-nums" aria-live="polite">
            {currency.format(subtotal + shipping)}
          </dd>
        </div>
      </dl>
      <div className="px-5 pb-5">
        <Button className="w-full" size="lg" disabled={items.length === 0}>
          Checkout
        </Button>
      </div>
    </section>
  );
}
