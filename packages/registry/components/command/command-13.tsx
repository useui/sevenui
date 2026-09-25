"use client";

import * as React from "react";
import { MinusIcon, PlusIcon, ShoppingBagIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/base/ui/command";
import { Separator } from "@/registry/base/ui/separator";

type Product = {
  value: string;
  label: string;
  sku: string;
  price: number;
  stock: number;
};

const products: Product[] = [
  { value: "oat-latte", label: "Oat milk latte", sku: "BEV-104", price: 5.2, stock: 48 },
  { value: "cold-brew", label: "Cold brew, 12 oz", sku: "BEV-221", price: 4.5, stock: 12 },
  { value: "cardamom-bun", label: "Cardamom bun", sku: "BAK-310", price: 3.8, stock: 3 },
  { value: "sourdough", label: "Sourdough loaf", sku: "BAK-402", price: 7.5, stock: 0 },
  { value: "beans-ethiopia", label: "Ethiopia Guji beans, 250 g", sku: "RET-015", price: 16, stock: 9 },
  { value: "ceramic-cup", label: "Ceramic cup, sand", sku: "RET-088", price: 22, stock: 4 },
];

const TAX_RATE = 0.08;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function matchesProduct(product: Product, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return `${product.label} ${product.sku}`.toLowerCase().includes(needle);
}

export default function Command13() {
  const [query, setQuery] = React.useState("");
  const [cart, setCart] = React.useState<Record<string, number>>({
    "oat-latte": 2,
  });
  const [charged, setCharged] = React.useState<string | null>(null);

  function setQuantity(product: Product, quantity: number) {
    setCharged(null);
    setCart((current) => {
      const next = { ...current };
      const clamped = Math.min(Math.max(quantity, 0), product.stock);
      if (clamped === 0) delete next[product.value];
      else next[product.value] = clamped;
      return next;
    });
  }

  function add(product: Product) {
    setQuantity(product, (cart[product.value] ?? 0) + 1);
    setQuery("");
  }

  const lines = products.filter((product) => cart[product.value]);
  const subtotal = lines.reduce(
    (sum, product) => sum + product.price * cart[product.value],
    0,
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const count = lines.reduce((sum, product) => sum + cart[product.value], 0);

  return (
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-[minmax(0,1fr)_16rem]">
      <Command
        items={products}
        value={query}
        onValueChange={(next, details) => {
          if (details.reason === "item-press") return;
          setQuery(next);
        }}
        filter={(product, value) => matchesProduct(product as Product, value)}
        className="h-fit rounded-xl! border border-border"
      >
        <CommandInput
          placeholder="Scan or search name, SKU…"
          aria-label="Add product to order"
        />
        <CommandList>
          {(product: Product) => {
            const inCart = cart[product.value] ?? 0;
            const soldOut = product.stock === 0;
            const maxed = !soldOut && inCart >= product.stock;
            return (
              <CommandItem
                key={product.value}
                value={product}
                disabled={soldOut || maxed}
                onClick={() => add(product)}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{product.label}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    <span className="font-mono">{product.sku}</span>
                    {" · "}
                    {soldOut
                      ? "Sold out"
                      : product.stock <= 5
                        ? `Only ${product.stock} left`
                        : `${product.stock} in stock`}
                  </span>
                </span>
                <span className="ml-auto flex shrink-0 items-center gap-2">
                  {inCart > 0 && (
                    <span className="rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground tabular-nums">
                      {inCart}
                      <span className="sr-only"> in order</span>
                    </span>
                  )}
                  <span className="text-sm tabular-nums">
                    {currency.format(product.price)}
                  </span>
                </span>
              </CommandItem>
            );
          }}
        </CommandList>
        <CommandEmpty>No product or SKU matches.</CommandEmpty>
      </Command>

      <section
        aria-labelledby="command-13-order"
        className="flex flex-col rounded-xl border border-border bg-card p-3 text-card-foreground"
      >
        <div className="flex items-center justify-between">
          <h3 id="command-13-order" className="text-sm font-medium">
            Order · Table 7
          </h3>
          <span className="text-xs text-muted-foreground tabular-nums">
            {count} {count === 1 ? "item" : "items"}
          </span>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
            <ShoppingBagIcon
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              Search a product and press Enter to add it.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2 py-3">
            {lines.map((product) => (
              <li key={product.value} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{product.label}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {currency.format(product.price * cart[product.value])}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-xs"
                    aria-label={`Remove one ${product.label}`}
                    onClick={() =>
                      setQuantity(product, cart[product.value] - 1)
                    }
                  >
                    <MinusIcon aria-hidden="true" />
                  </Button>
                  <span className="w-5 text-center text-sm tabular-nums">
                    {cart[product.value]}
                  </span>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    aria-label={`Add one ${product.label}`}
                    disabled={cart[product.value] >= product.stock}
                    onClick={() =>
                      setQuantity(product, cart[product.value] + 1)
                    }
                  >
                    <PlusIcon aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Separator />
        <dl className="grid grid-cols-2 gap-y-1 py-3 text-sm">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-right tabular-nums">{currency.format(subtotal)}</dd>
          <dt className="text-muted-foreground">Tax (8%)</dt>
          <dd className="text-right tabular-nums">{currency.format(tax)}</dd>
          <dt className="font-medium">Total</dt>
          <dd className="text-right font-medium tabular-nums">
            {currency.format(total)}
          </dd>
        </dl>
        <Button
          disabled={lines.length === 0}
          onClick={() => {
            setCharged(currency.format(total));
            setCart({});
          }}
        >
          Charge {currency.format(total)}
        </Button>
        <p role="status" className="min-h-4 pt-2 text-center text-xs text-muted-foreground">
          {charged && `Payment of ${charged} approved. Receipt sent.`}
        </p>
      </section>
    </div>
  );
}
