"use client";

import * as React from "react";
import { CheckIcon, PlusIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/registry/base/ui/carousel";
import { Progress } from "@/registry/base/ui/progress";
import { Separator } from "@/registry/base/ui/separator";

const freeShippingAt = 300;
const shippingFee = 12;

const cartItems = [
  {
    id: "grinder",
    name: "Conical burr grinder",
    detail: "Matte black",
    price: 249,
  },
];

const addOns = [
  { id: "scale", name: "Brew scale", detail: "0.1 g precision", price: 39 },
  { id: "filters", name: "Paper filters", detail: "Pack of 100", price: 9 },
  { id: "brush", name: "Cleaning brush", detail: "Boar bristle", price: 14 },
  { id: "beans", name: "House espresso", detail: "Whole bean, 1 kg", price: 32 },
];

const money = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function Carousel13() {
  const [added, setAdded] = React.useState<string[]>([]);

  const toggle = (id: string) =>
    setAdded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  const lines = [
    ...cartItems,
    ...addOns.filter((addOn) => added.includes(addOn.id)),
  ];
  const subtotal = lines.reduce((sum, line) => sum + line.price, 0);
  const remaining = Math.max(freeShippingAt - subtotal, 0);
  const shipping = remaining === 0 ? 0 : shippingFee;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <h3 className="font-medium">Order summary</h3>

      <ul className="flex flex-col gap-3">
        {lines.map((line) => (
          <li key={line.id} className="flex items-center gap-3">
            <img
              src="/placeholder.svg"
              alt=""
              className="size-10 shrink-0 rounded-md border bg-muted object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{line.name}</span>
              <span className="text-xs text-muted-foreground">
                {line.detail}
              </span>
            </div>
            <span className="text-sm tabular-nums">{money(line.price)}</span>
          </li>
        ))}
      </ul>

      <Carousel
        aria-labelledby="carousel-13-title"
        opts={{ align: "start" }}
        className="flex flex-col gap-2 rounded-lg bg-muted p-3"
      >
        <div className="flex items-center justify-between">
          <span id="carousel-13-title" className="text-sm font-medium">
            Pairs well with
          </span>
          <div className="flex gap-1">
            <CarouselPrevious className="static my-0" />
            <CarouselNext className="static my-0" />
          </div>
        </div>
        <CarouselContent className="-ml-2">
          {addOns.map((addOn) => {
            const isAdded = added.includes(addOn.id);
            return (
              <CarouselItem
                key={addOn.id}
                aria-label={addOn.name}
                className="basis-[46%] pl-2"
              >
                <div className="flex h-full flex-col gap-2 rounded-md border bg-background p-2">
                  <img
                    src="/placeholder.svg"
                    alt=""
                    className="aspect-[4/3] w-full rounded-sm bg-muted object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="truncate text-xs font-medium">
                      {addOn.name}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {money(addOn.price)}
                    </span>
                  </div>
                  <Button
                    size="xs"
                    variant={isAdded ? "secondary" : "outline"}
                    aria-pressed={isAdded}
                    aria-label={`${isAdded ? "Remove" : "Add"} ${addOn.name}`}
                    onClick={() => toggle(addOn.id)}
                    className="mt-auto w-full"
                  >
                    {isAdded ? (
                      <CheckIcon aria-hidden="true" />
                    ) : (
                      <PlusIcon aria-hidden="true" />
                    )}
                    {isAdded ? "Added" : "Add"}
                  </Button>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {remaining === 0
            ? "You've unlocked free shipping."
            : `Add ${money(remaining)} more for free shipping.`}
        </p>
        <Progress
          value={Math.min((subtotal / freeShippingAt) * 100, 100)}
          aria-label="Progress toward free shipping"
        />
      </div>

      <Separator />

      <dl className="grid grid-cols-[1fr_auto] gap-y-1.5 text-sm">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="text-right tabular-nums">{money(subtotal)}</dd>
        <dt className="text-muted-foreground">Shipping</dt>
        <dd className="text-right tabular-nums">
          {shipping === 0 ? "Free" : money(shipping)}
        </dd>
        <dt className="font-medium">Total</dt>
        <dd className="text-right font-medium tabular-nums">
          {money(subtotal + shipping)}
        </dd>
      </dl>

      <Button size="lg" className="w-full">
        Continue to payment
      </Button>
    </div>
  );
}
