"use client";

import * as React from "react";
import { CheckIcon, MinusIcon, PlusIcon, RulerIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const sizes = [
  { value: "S", stock: 6 },
  { value: "M", stock: 2 },
  { value: "L", stock: 11 },
  { value: "XL", stock: 0 },
];

const unitPrice = 128;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Drawer08() {
  const [open, setOpen] = React.useState(false);
  const [size, setSize] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [added, setAdded] = React.useState<{
    size: string;
    quantity: number;
  } | null>(null);

  const selected = sizes.find((option) => option.value === size);
  const maxQuantity = Math.min(selected?.stock ?? 1, 5);

  function handleAdd() {
    if (!size) return;
    setAdded({ size, quantity });
    setOpen(false);
  }

  return (
    <div className="w-full max-w-xs overflow-hidden rounded-xl border bg-card text-card-foreground">
      <img
        src="/placeholder.svg"
        alt="Merino crew sweater in oat, front view"
        className="aspect-[4/3] w-full bg-muted object-cover"
      />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-medium">Merino Crew Sweater</h3>
            <p className="text-sm text-muted-foreground">Oat · Relaxed fit</p>
          </div>
          <span className="font-medium tabular-nums">
            {currency.format(unitPrice)}
          </span>
        </div>
        {added ? (
          <p
            role="status"
            className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
          >
            <CheckIcon aria-hidden="true" className="size-4 shrink-0" />
            Added {added.quantity} × size {added.size} to your bag
          </p>
        ) : null}
        <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
          <DrawerTrigger
            render={
              <Button size="lg" className="w-full">
                {added ? "Add another" : "Add to bag"}
              </Button>
            }
          />
          <DrawerContent>
            <div className="mx-auto flex w-full max-w-sm flex-col">
              <DrawerHeader>
                <DrawerTitle>Select a size</DrawerTitle>
                <DrawerDescription>
                  Runs true to size. Free returns within 30 days.
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex flex-col gap-5 p-4">
                <ToggleGroup
                  aria-label="Size"
                  variant="outline"
                  spacing={2}
                  className="grid w-full grid-cols-4"
                  value={size ? [size] : []}
                  onValueChange={(value) => {
                    const next = value[0] ?? null;
                    setSize(next);
                    setQuantity(1);
                  }}
                >
                  {sizes.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      disabled={option.stock === 0}
                      aria-label={
                        option.stock === 0
                          ? `${option.value}, sold out`
                          : option.value
                      }
                      className="h-11 w-full data-disabled:line-through"
                    >
                      {option.value}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <div className="flex min-h-5 items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {selected
                      ? selected.stock <= 3
                        ? `Only ${selected.stock} left in ${selected.value}`
                        : `In stock, ships tomorrow`
                      : "XL is sold out"}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-muted-foreground">
                    <RulerIcon aria-hidden="true" className="size-3.5" />
                    Model wears M
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span id="drawer-08-quantity" className="text-sm font-medium">
                    Quantity
                  </span>
                  <fieldset
                    aria-labelledby="drawer-08-quantity"
                    className="flex items-center gap-1 rounded-lg border p-0.5"
                  >
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <MinusIcon aria-hidden="true" />
                    </Button>
                    <output
                      aria-live="polite"
                      className="w-6 text-center text-sm font-medium tabular-nums"
                    >
                      {quantity}
                    </output>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Increase quantity"
                      disabled={!selected || quantity >= maxQuantity}
                      onClick={() =>
                        setQuantity((q) => Math.min(maxQuantity, q + 1))
                      }
                    >
                      <PlusIcon aria-hidden="true" />
                    </Button>
                  </fieldset>
                </div>
              </div>
              <DrawerFooter>
                <Button size="lg" disabled={!size} onClick={handleAdd}>
                  {size
                    ? `Add to bag · ${currency.format(unitPrice * quantity)}`
                    : "Choose a size"}
                </Button>
                <DrawerClose
                  render={
                    <Button variant="ghost" size="lg">
                      Keep browsing
                    </Button>
                  }
                />
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
