"use client";

import * as React from "react";
import {
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  TrashIcon,
  TruckIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";
import { Progress } from "@/registry/base/ui/progress";

type CartItem = {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
};

const freeShippingThreshold = 120;

const initialCart: CartItem[] = [
  {
    id: "c1",
    name: "Merino crew sweater",
    variant: "Oatmeal · M",
    price: 68,
    quantity: 1,
  },
  {
    id: "c2",
    name: "Waxed canvas tote",
    variant: "Olive",
    price: 42,
    quantity: 1,
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Popover12() {
  const [cart, setCart] = React.useState(initialCart);

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const remaining = Math.max(freeShippingThreshold - subtotal, 0);

  function updateQuantity(id: string, delta: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.min(item.quantity + delta, 9) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function remove(id: string) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-lg border bg-background px-4 py-2.5">
      <span className="font-semibold text-sm tracking-tight">Fieldhouse</span>
      <div className="hidden gap-4 text-muted-foreground text-sm sm:flex">
        <span>Men</span>
        <span>Women</span>
        <span>Journal</span>
      </div>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Shopping bag, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <ShoppingBagIcon aria-hidden="true" />
              <span className="tabular-nums">{count}</span>
            </Button>
          }
        />
        <PopoverContent
          align="end"
          className="w-[min(22rem,calc(100vw-2rem))] gap-0 p-0"
        >
          <div className="flex items-baseline justify-between px-4 pt-4 pb-3">
            <PopoverTitle>Your bag</PopoverTitle>
            <span className="text-muted-foreground text-xs tabular-nums">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </div>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center gap-1 border-t px-4 py-8 text-center">
              <ShoppingBagIcon
                className="mb-1 size-5 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="font-medium text-sm">Your bag is empty</p>
              <p className="text-muted-foreground text-sm">
                Orders over {currency.format(freeShippingThreshold)} ship free.
              </p>
            </div>
          ) : (
            <>
              <div className="border-t px-4 py-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs">
                  <TruckIcon
                    className="size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {remaining > 0 ? (
                    <span>
                      Add{" "}
                      <span className="font-medium tabular-nums">
                        {currency.format(remaining)}
                      </span>{" "}
                      for free shipping
                    </span>
                  ) : (
                    <span className="font-medium">
                      You unlocked free shipping
                    </span>
                  )}
                </p>
                <Progress
                  value={Math.min((subtotal / freeShippingThreshold) * 100, 100)}
                  aria-label="Progress to free shipping"
                />
              </div>
              <ul className="divide-y border-t">
                {cart.map((item) => (
                  <li key={item.id} className="flex gap-3 px-4 py-3">
                    <img
                      src="/placeholder.svg"
                      alt=""
                      className="size-14 shrink-0 rounded-md bg-muted object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-sm">
                            {item.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {item.variant}
                          </p>
                        </div>
                        <span className="text-sm tabular-nums">
                          {currency.format(item.price * item.quantity)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <fieldset className="flex items-center rounded-md border">
                          <legend className="sr-only">
                            Quantity of {item.name}
                          </legend>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <MinusIcon aria-hidden="true" />
                          </Button>
                          <span
                            className="w-6 text-center text-xs tabular-nums"
                            aria-live="polite"
                          >
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.quantity >= 9}
                          >
                            <PlusIcon aria-hidden="true" />
                          </Button>
                        </fieldset>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => remove(item.id)}
                        >
                          <TrashIcon aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="grid gap-3 border-t bg-muted/40 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">
                    {currency.format(subtotal)}
                  </span>
                </div>
                <Button className="w-full">Checkout</Button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
