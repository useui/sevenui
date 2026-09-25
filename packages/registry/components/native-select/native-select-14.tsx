"use client";

import { Check, ShoppingBag, Truck } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

const colors = [
  { value: "oat", label: "Oat" },
  { value: "charcoal", label: "Charcoal" },
  { value: "forest", label: "Forest" },
];

const sizes = ["XS", "S", "M", "L", "XL"];

// Units left per color and size.
const stock: Record<string, Record<string, number>> = {
  oat: { XS: 4, S: 12, M: 9, L: 2, XL: 0 },
  charcoal: { XS: 0, S: 6, M: 1, L: 8, XL: 5 },
  forest: { XS: 3, S: 0, M: 0, L: 7, XL: 11 },
};

const quantities = [1, 2, 3, 4, 5];

const price = 128;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function NativeSelect14() {
  const [color, setColor] = React.useState("oat");
  const [size, setSize] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [added, setAdded] = React.useState(false);

  const available = size ? stock[color][size] : 0;
  const maxQuantity = Math.min(available, 5);

  function changeColor(next: string) {
    setColor(next);
    setAdded(false);
    if (size && stock[next][size] === 0) {
      setSize("");
    }
    setQuantity(1);
  }

  return (
    <form
      className="grid w-full max-w-sm gap-4 rounded-xl border bg-card p-4 text-card-foreground"
      onSubmit={(event) => {
        event.preventDefault();
        setAdded(true);
      }}
    >
      <div className="flex gap-4">
        <img
          src="/placeholder.svg"
          alt="Merino crew sweater"
          className="size-20 shrink-0 rounded-lg bg-muted object-cover"
        />
        <div className="grid content-start gap-1">
          <h3 className="text-base font-medium">Merino crew sweater</h3>
          <p className="text-sm text-muted-foreground">
            Midweight, machine washable
          </p>
          <p className="font-medium tabular-nums">{currency.format(price)}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="native-select-14-color">Color</Label>
          <NativeSelect
            id="native-select-14-color"
            className="w-full"
            value={color}
            onChange={(event) => changeColor(event.target.value)}
          >
            {colors.map((item) => (
              <NativeSelectOption key={item.value} value={item.value}>
                {item.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="native-select-14-size">Size</Label>
          <NativeSelect
            id="native-select-14-size"
            className="w-full"
            required
            value={size}
            onChange={(event) => {
              setSize(event.target.value);
              setQuantity(1);
              setAdded(false);
            }}
          >
            <NativeSelectOption value="" disabled>
              Choose size
            </NativeSelectOption>
            {sizes.map((item) => {
              const units = stock[color][item];
              return (
                <NativeSelectOption
                  key={item}
                  value={item}
                  disabled={units === 0}
                >
                  {units === 0
                    ? `${item} · sold out`
                    : units <= 2
                      ? `${item} · ${units} left`
                      : item}
                </NativeSelectOption>
              );
            })}
          </NativeSelect>
        </div>
      </div>
      <div className="flex items-end gap-3">
        <div className="grid gap-2">
          <Label htmlFor="native-select-14-qty">Quantity</Label>
          <NativeSelect
            id="native-select-14-qty"
            disabled={!size}
            value={quantity}
            onChange={(event) => {
              setQuantity(Number(event.target.value));
              setAdded(false);
            }}
          >
            {quantities
              .filter((option) => option <= Math.max(maxQuantity, 1))
              .map((option) => (
                <NativeSelectOption key={option} value={option}>
                  {option}
                </NativeSelectOption>
              ))}
          </NativeSelect>
        </div>
        <Button type="submit" className="flex-1" disabled={!size}>
          {added ? (
            <Check aria-hidden="true" />
          ) : (
            <ShoppingBag aria-hidden="true" />
          )}
          {added
            ? "Added to bag"
            : `Add · ${currency.format(price * quantity)}`}
        </Button>
      </div>
      <p
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
        aria-live="polite"
      >
        <Truck aria-hidden="true" className="size-4 shrink-0" />
        {!size
          ? "Select a size to check availability."
          : available <= 2
            ? `Only ${available} left in ${size}. Ships tomorrow.`
            : "In stock. Free shipping, arrives in 2–4 days."}
      </p>
    </form>
  );
}
