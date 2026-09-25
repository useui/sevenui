"use client";

import * as React from "react";
import { PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import { Separator } from "@/registry/base/ui/separator";

const products = [
  { id: "canvas-tote", name: "Waxed canvas tote", variant: "Olive", price: 68 },
  { id: "wool-beanie", name: "Merino wool beanie", variant: "Charcoal", price: 34 },
  { id: "field-notes", name: "Field notebook, 3-pack", variant: "Dot grid", price: 18 },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Empty13() {
  const [cart, setCart] = React.useState<string[]>([]);

  const items = products.filter((product) => cart.includes(product.id));
  const suggestions = products.filter((product) => !cart.includes(product.id));
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <section
      aria-labelledby="empty-13-title"
      className="flex w-full max-w-sm flex-col rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      <header className="flex items-center justify-between px-4 py-3">
        <h2 id="empty-13-title" className="text-sm font-medium">
          Your cart
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </header>
      <Separator />
      {items.length === 0 ? (
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBagIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Your cart is empty</EmptyTitle>
            <EmptyDescription>
              Orders over $75 ship free. Start with something from the list
              below.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" variant="outline">
              Browse the shop
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3 px-4 py-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <img
                src="/placeholder.svg"
                alt=""
                className="size-12 shrink-0 rounded-md bg-muted object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.variant}</p>
              </div>
              <span className="text-sm tabular-nums">
                {currency.format(item.price)}
              </span>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Remove ${item.name}`}
                onClick={() =>
                  setCart((current) => current.filter((id) => id !== item.id))
                }
              >
                <Trash2Icon aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {suggestions.length > 0 && (
        <div className="border-t bg-muted/40 px-4 py-3">
          <h3 className="mb-2 text-xs font-medium text-muted-foreground">
            Customers also bought
          </h3>
          <ul className="flex flex-col gap-2">
            {suggestions.map((product) => (
              <li key={product.id} className="flex items-center gap-3">
                <img
                  src="/placeholder.svg"
                  alt=""
                  className="size-9 shrink-0 rounded-md bg-muted object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {currency.format(product.price)}
                  </p>
                </div>
                <Button
                  size="xs"
                  variant="outline"
                  aria-label={`Add ${product.name} to cart`}
                  onClick={() => setCart((current) => [...current, product.id])}
                >
                  <PlusIcon data-icon="inline-start" aria-hidden="true" />
                  Add
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-col gap-3 border-t px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium tabular-nums">
            {currency.format(subtotal)}
          </span>
        </div>
        <Button className="w-full" disabled={items.length === 0}>
          Checkout
        </Button>
      </div>
    </section>
  );
}
