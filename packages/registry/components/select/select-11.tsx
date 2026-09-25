"use client";

import { useState } from "react";
import { CheckIcon, ShoppingBagIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const sizes = [
  { value: "xs", label: "XS", stock: 0 },
  { value: "s", label: "S", stock: 12 },
  { value: "m", label: "M", stock: 2 },
  { value: "l", label: "L", stock: 7 },
  { value: "xl", label: "XL", stock: 0 },
];

const unitPrice = 89;
const maxPerOrder = 4;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Select11() {
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string | null>("1");
  const [added, setAdded] = useState<string | null>(null);

  const selected = sizes.find((item) => item.value === size);
  const limit = Math.min(selected?.stock ?? maxPerOrder, maxPerOrder);
  const quantities = Array.from({ length: limit }, (_, index) => ({
    value: String(index + 1),
    label: String(index + 1),
  }));
  const count = Number(quantity ?? 1);

  return (
    <form
      aria-labelledby="select-11-title"
      className="grid w-full max-w-sm gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!selected) return;
        setAdded(`Added ${count} × size ${selected.label} to your bag`);
      }}
    >
      <img
        src="/placeholder.svg"
        alt="Charcoal merino crew-neck sweater laid flat"
        className="aspect-4/3 w-full rounded-xl bg-muted object-cover"
      />
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h3 id="select-11-title" className="font-medium">
            Merino Crew Sweater
          </h3>
          <p className="text-sm text-muted-foreground">Charcoal · Relaxed fit</p>
        </div>
        <p className="font-medium tabular-nums">{currency.format(unitPrice)}</p>
      </div>
      <div className="grid grid-cols-[1fr_5.5rem] gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="select-11-size">Size</Label>
          <Select
            items={sizes}
            value={size}
            onValueChange={(next) => {
              setSize(next);
              setAdded(null);
              const stock = sizes.find((item) => item.value === next)?.stock ?? 0;
              if (Number(quantity) > stock) setQuantity(String(Math.max(stock, 1)));
            }}
          >
            <SelectTrigger id="select-11-size" className="w-full">
              <SelectValue placeholder="Choose a size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  disabled={item.stock === 0}
                >
                  <span className="w-7">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.stock === 0
                      ? "Sold out"
                      : item.stock <= 3
                        ? `Only ${item.stock} left`
                        : "In stock"}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="select-11-quantity">Qty</Label>
          {/* Remount when the stock limit changes so the list and the clamped value swap together. */}
          <Select
            key={limit}
            items={quantities}
            value={quantity}
            onValueChange={(next) => {
              setQuantity(next);
              setAdded(null);
            }}
          >
            <SelectTrigger id="select-11-quantity" className="w-full tabular-nums">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {quantities.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="-mt-2 min-h-4 text-xs text-muted-foreground">
        {selected && selected.stock <= 3
          ? `Only ${selected.stock} left in ${selected.label}. Limit ${limit} per order.`
          : "Free returns within 30 days."}
      </p>
      <Button type="submit" size="lg" disabled={!selected}>
        {added ? (
          <CheckIcon aria-hidden="true" data-icon="inline-start" />
        ) : (
          <ShoppingBagIcon aria-hidden="true" data-icon="inline-start" />
        )}
        {selected
          ? `Add to bag · ${currency.format(unitPrice * count)}`
          : "Select a size"}
      </Button>
      <p aria-live="polite" className="text-center text-xs text-muted-foreground empty:hidden">
        {added}
      </p>
    </form>
  );
}
