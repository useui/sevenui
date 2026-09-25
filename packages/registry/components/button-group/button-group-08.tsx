"use client";

import { MinusIcon, PlusIcon, ShoppingBagIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/registry/base/ui/button-group";

const product = {
  name: "Merino crew sweater",
  variant: "Oatmeal, size M",
  price: 118,
  stock: 6,
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ButtonGroup08() {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(0);
  const available = product.stock - added;
  const soldOut = available === 0;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <div className="flex gap-3">
        <img
          src="/placeholder.svg"
          alt=""
          className="size-16 shrink-0 rounded-lg bg-muted object-cover"
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{product.name}</span>
          <span className="text-xs text-muted-foreground">{product.variant}</span>
          <span className="mt-1 text-sm font-medium tabular-nums">
            {currency.format(product.price)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ButtonGroup aria-label="Quantity">
          <Button
            variant="outline"
            size="icon"
            aria-label="Decrease quantity"
            disabled={soldOut || quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <MinusIcon aria-hidden="true" />
          </Button>
          <ButtonGroupText
            aria-live="polite"
            className="min-w-10 justify-center bg-background tabular-nums"
          >
            {soldOut ? 0 : quantity}
          </ButtonGroupText>
          <Button
            variant="outline"
            size="icon"
            aria-label="Increase quantity"
            disabled={quantity >= available}
            onClick={() => setQuantity((q) => Math.min(available, q + 1))}
          >
            <PlusIcon aria-hidden="true" />
          </Button>
        </ButtonGroup>
        <Button
          className="flex-1"
          disabled={soldOut}
          onClick={() => {
            setAdded((count) => count + quantity);
            setQuantity(1);
          }}
        >
          <ShoppingBagIcon data-icon="inline-start" aria-hidden="true" />
          {soldOut
            ? "All in your bag"
            : `Add ${currency.format(product.price * quantity)}`}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {added > 0
          ? `${added} in your bag. ${
              soldOut ? "That was the last of this size." : "Free shipping on this order."
            }`
          : quantity >= available
            ? `Only ${available} left in stock.`
            : `${product.stock} in stock. Ships in 1–2 business days.`}
      </p>
    </div>
  );
}
