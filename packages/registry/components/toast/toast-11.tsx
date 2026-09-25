"use client";

import * as React from "react";
import { CheckIcon, ShoppingBagIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  useToastManager,
} from "@/registry/base/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type CartToastData = {
  size: string;
  quantity: number;
  subtotal: string;
};

const toastManager = createToastManager<CartToastData>();

const product = {
  name: "Merino crew sweater",
  color: "Oat heather",
  price: 118,
};

const sizes = ["XS", "S", "M", "L", "XL"];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function CartToasts() {
  const { toasts } = useToastManager<CartToastData>();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent className="items-start">
        <img
          src="/placeholder.svg"
          alt=""
          className="size-14 shrink-0 rounded-lg bg-muted object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <ToastTitle className="flex items-center gap-1.5">
              <CheckIcon className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{toastItem.title}</span>
            </ToastTitle>
            <ToastDescription className="text-xs" />
          </div>
          {toastItem.data ? (
            <p className="text-xs text-muted-foreground tabular-nums">
              Size {toastItem.data.size} · Qty {toastItem.data.quantity} ·{" "}
              <span className="font-medium text-foreground">
                {toastItem.data.subtotal}
              </span>
            </p>
          ) : null}
          <div className="flex gap-2">
            <ToastAction
              render={<Button size="sm" />}
              onClick={() => toastManager.close(toastItem.id)}
            >
              Checkout
            </ToastAction>
            <ToastClose
              render={<Button variant="outline" size="sm" />}
              aria-label="Keep shopping"
              className="text-foreground"
            >
              Keep shopping
            </ToastClose>
          </div>
        </div>
      </ToastContent>
    </Toast>
  ));
}

export default function Toast11() {
  const [size, setSize] = React.useState("M");
  const [cart, setCart] = React.useState<Record<string, number>>({});

  const itemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  function addToCart() {
    const quantity = (cart[size] ?? 0) + 1;
    setCart((current) => ({ ...current, [size]: quantity }));

    // Re-using the id updates the open toast instead of stacking duplicates.
    toastManager.add({
      id: `cart-${size}`,
      title: "Added to your bag",
      description: `${product.name} in ${product.color}`,
      timeout: 6000,
      data: {
        size,
        quantity,
        subtotal: currency.format(product.price * quantity),
      },
    });
  }

  return (
    <ToastProvider toastManager={toastManager}>
      <ToastPortal>
        <ToastViewport>
          <CartToasts />
        </ToastViewport>
      </ToastPortal>
      <article className="w-full max-w-sm overflow-hidden rounded-xl border bg-card text-card-foreground">
        <div className="relative">
          <img
            src="/placeholder.svg"
            alt={`${product.name} in ${product.color}`}
            className="aspect-[4/3] w-full bg-muted object-cover"
          />
          <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium tabular-nums shadow-sm">
            <ShoppingBagIcon className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Items in bag:</span>
            {itemCount}
          </span>
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.color}</p>
            </div>
            <p className="font-medium tabular-nums">
              {currency.format(product.price)}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span id="toast-11-size" className="text-sm font-medium">
              Size
            </span>
            <ToggleGroup
              aria-labelledby="toast-11-size"
              variant="outline"
              spacing={0}
              value={[size]}
              onValueChange={(next) => {
                if (next.length > 0) setSize(next[0]);
              }}
              className="w-full"
            >
              {sizes.map((option) => (
                <ToggleGroupItem
                  key={option}
                  value={option}
                  className="flex-1"
                >
                  {option}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <Button size="lg" className="w-full" onClick={addToCart}>
            <ShoppingBagIcon aria-hidden="true" />
            Add to bag
          </Button>
        </div>
      </article>
    </ToastProvider>
  );
}
