"use client";

import { CheckIcon, HeartIcon, StarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Toggle } from "@/registry/base/ui/toggle";

const product = {
  name: "Linen Overshirt",
  color: "Sand",
  price: "$128",
  rating: 4.7,
  reviews: 312,
  saves: 1284,
};

export default function Toggle07() {
  const [saved, setSaved] = React.useState(false);
  const [added, setAdded] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const saves = product.saves + (saved ? 1 : 0);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function addToBag() {
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="w-full max-w-xs overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="relative aspect-[4/3] bg-muted">
        <img
          src="/placeholder.svg"
          alt={`${product.name} in ${product.color}`}
          className="size-full object-cover"
        />
        <Toggle
          pressed={saved}
          onPressedChange={setSaved}
          aria-label="Save to wishlist"
          className="absolute top-3 right-3 size-9 rounded-full bg-background/90 shadow-sm backdrop-blur-sm hover:bg-background aria-pressed:bg-background"
        >
          <HeartIcon
            aria-hidden="true"
            className="transition-transform group-aria-pressed/toggle:scale-110 group-aria-pressed/toggle:fill-destructive group-aria-pressed/toggle:text-destructive"
          />
        </Toggle>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-medium">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.color}</p>
          </div>
          <p className="font-semibold tabular-nums">{product.price}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <StarIcon aria-hidden="true" className="size-3.5 fill-current" />
            <span className="tabular-nums">
              {product.rating} ({product.reviews} reviews)
            </span>
          </span>
          <span aria-live="polite" className="tabular-nums">
            {saves.toLocaleString("en-US")} saves
          </span>
        </div>
        <Button className="w-full" onClick={addToBag}>
          {added && <CheckIcon aria-hidden="true" data-icon="inline-start" />}
          <span aria-live="polite">{added ? "Added to bag" : "Add to bag"}</span>
        </Button>
      </div>
    </div>
  );
}
