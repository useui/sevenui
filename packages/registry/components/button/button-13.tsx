"use client";

import * as React from "react";
import { Check, Heart, Minus, Plus, ShoppingBag } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

const sizes = [
  { label: "S", available: true },
  { label: "M", available: true },
  { label: "L", available: true },
  { label: "XL", available: false },
];

const unitPrice = 68;
const maxQuantity = 5;

type CartStatus = "idle" | "adding" | "added";

export default function Button13() {
  const [size, setSize] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [saved, setSaved] = React.useState(false);
  const [status, setStatus] = React.useState<CartStatus>("idle");

  React.useEffect(() => {
    if (status === "idle") return;
    const timeout = setTimeout(
      () => setStatus(status === "adding" ? "added" : "idle"),
      status === "adding" ? 800 : 2400,
    );
    return () => clearTimeout(timeout);
  }, [status]);

  const total = (unitPrice * quantity).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  return (
    <div className="flex w-full max-w-sm flex-col gap-5 rounded-xl border bg-card p-5 text-card-foreground">
      <div className="flex items-start gap-4">
        <img
          src="/placeholder.svg"
          alt="Merino crew sweater in oat"
          className="size-20 shrink-0 rounded-lg border bg-muted object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="font-medium">Merino crew sweater</h3>
          <p className="text-sm text-muted-foreground">Oat · Relaxed fit</p>
          <p className="text-sm font-medium tabular-nums">${unitPrice}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          onClick={() => setSaved((value) => !value)}
        >
          <Heart
            aria-hidden="true"
            className={saved ? "fill-current text-destructive" : undefined}
          />
        </Button>
      </div>

      <fieldset>
        <legend className="mb-2 flex w-full items-baseline justify-between">
          <span className="text-sm font-medium">Size</span>
          <span className="text-xs text-muted-foreground">
            {size ? `Selected: ${size}` : "Choose a size"}
          </span>
        </legend>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((option) => {
            const selected = size === option.label;
            return (
              <Button
                key={option.label}
                variant={selected ? "default" : "outline"}
                aria-pressed={selected}
                disabled={!option.available}
                aria-label={
                  option.available
                    ? `Size ${option.label}`
                    : `Size ${option.label}, sold out`
                }
                onClick={() => setSize(option.label)}
                className={option.available ? undefined : "line-through"}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-2">
        <fieldset className="flex h-8 items-center rounded-lg border">
          <legend className="sr-only">Quantity</legend>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((value) => value - 1)}
          >
            <Minus aria-hidden="true" />
          </Button>
          <output
            aria-live="polite"
            className="w-6 text-center text-sm tabular-nums"
          >
            {quantity}
          </output>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Increase quantity"
            disabled={quantity >= maxQuantity}
            onClick={() => setQuantity((value) => value + 1)}
          >
            <Plus aria-hidden="true" />
          </Button>
        </fieldset>
        <Button
          className="min-w-0 flex-1"
          disabled={!size || status === "adding"}
          onClick={() => setStatus("adding")}
        >
          {status === "adding" ? (
            <>
              <Spinner data-icon="inline-start" />
              Adding
            </>
          ) : status === "added" ? (
            <>
              <Check data-icon="inline-start" aria-hidden="true" />
              Added to bag
            </>
          ) : (
            <>
              <ShoppingBag data-icon="inline-start" aria-hidden="true" />
              Add to bag
              <span className="max-sm:hidden">
                · <span className="tabular-nums">{total}</span>
              </span>
            </>
          )}
        </Button>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground" aria-live="polite">
        {status === "added"
          ? `${quantity} × size ${size} added to your bag.`
          : size
            ? "Free returns within 30 days."
            : "Select a size to add this item to your bag."}
      </p>
    </div>
  );
}
