"use client";

import { BellRing, Check, ShoppingBag, Truck } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Skeleton } from "@/registry/base/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

// Price and stock are fetched per size; everything else is known up front.
const inventory: Record<string, { price: string; stock: number }> = {
  "8": { price: "$138.00", stock: 14 },
  "9": { price: "$138.00", stock: 3 },
  "10": { price: "$124.20", stock: 22 },
  "11": { price: "$138.00", stock: 0 },
  "12": { price: "$144.00", stock: 6 },
};

const sizes = Object.keys(inventory);

export default function Skeleton10() {
  const id = React.useId();
  const [size, setSize] = React.useState("10");
  const [pending, setPending] = React.useState(true);
  // Sizes added to the bag, and sold-out sizes with a restock alert.
  const [bagged, setBagged] = React.useState<string[]>([]);
  const [alerts, setAlerts] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => setPending(false), 900);
    return () => window.clearTimeout(timer);
  }, [pending]);

  const item = inventory[size];
  const soldOut = item.stock === 0;
  const done = soldOut ? alerts.includes(size) : bagged.includes(size);

  return (
    <article className="grid w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card text-card-foreground sm:grid-cols-2">
      <img
        src="/placeholder.svg"
        alt="Trail Runner 2 in graphite, side view"
        className="aspect-square w-full bg-muted object-cover sm:aspect-auto sm:h-full"
      />
      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Kestrel Outdoor</p>
          <h3 className="text-lg font-semibold leading-tight">
            Trail Runner 2 · Graphite
          </h3>
          <div className="mt-1 flex h-7 items-center" aria-live="polite">
            {pending ? (
              <>
                <Skeleton aria-hidden="true" className="h-6 w-24" />
                <span className="sr-only">Checking price for size {size}</span>
              </>
            ) : (
              <p className="text-xl font-semibold tabular-nums">
                {item.price}
                {item.price !== "$138.00" ? (
                  <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
                    $138.00
                  </span>
                ) : null}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span id={`${id}-size`} className="text-sm font-medium">
            Size (US)
          </span>
          <ToggleGroup
            aria-labelledby={`${id}-size`}
            variant="outline"
            spacing={1}
            value={[size]}
            onValueChange={(next) => {
              if (next.length === 0 || next[0] === size) return;
              setSize(next[0]);
              setPending(true);
            }}
            className="flex-wrap"
          >
            {sizes.map((value) => (
              <ToggleGroupItem
                key={value}
                value={value}
                className="min-w-10 tabular-nums"
              >
                {value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <div className="flex h-5 items-center text-sm">
            {pending ? (
              <Skeleton aria-hidden="true" className="h-3.5 w-32" />
            ) : soldOut ? (
              <span className="text-destructive">Sold out in this size</span>
            ) : item.stock < 5 ? (
              <span className="flex items-center gap-1.5 font-medium">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-warning"
                />
                Only {item.stock} left
              </span>
            ) : (
              <span className="text-muted-foreground">In stock</span>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full"
            disabled={pending}
            variant={soldOut && !pending ? "outline" : "default"}
            focusableWhenDisabled
            onClick={() => {
              if (done) return;
              if (soldOut) setAlerts((current) => [...current, size]);
              else setBagged((current) => [...current, size]);
            }}
          >
            {pending ? (
              <ShoppingBag aria-hidden="true" />
            ) : done ? (
              <Check aria-hidden="true" />
            ) : soldOut ? (
              <BellRing aria-hidden="true" />
            ) : (
              <ShoppingBag aria-hidden="true" />
            )}
            {pending
              ? "Add to bag"
              : soldOut
                ? done
                  ? "We'll email you"
                  : "Notify me when back"
                : done
                  ? `Added size ${size} to bag`
                  : "Add to bag"}
          </Button>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Truck aria-hidden="true" className="size-3.5" />
            Free delivery over $100, returns within 30 days
          </p>
        </div>
      </div>
    </article>
  );
}
