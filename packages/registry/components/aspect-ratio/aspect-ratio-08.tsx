"use client";

import { Heart, ShoppingBag } from "lucide-react";
import * as React from "react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";

const colorways = [
  { id: "oat", label: "Oat", swatch: "bg-muted dark:bg-foreground" },
  { id: "charcoal", label: "Charcoal", swatch: "bg-foreground dark:bg-muted" },
  { id: "moss", label: "Moss", swatch: "bg-chart-2" },
];

export default function AspectRatio08() {
  const [colorway, setColorway] = React.useState(colorways[0]);
  const [saved, setSaved] = React.useState(false);
  const [added, setAdded] = React.useState(false);

  return (
    <article className="w-full max-w-72">
      <div className="relative overflow-hidden rounded-xl border bg-muted">
        <AspectRatio ratio={4 / 5}>
          <img
            src="/placeholder.svg"
            alt={`Merino crew sweater in ${colorway.label.toLowerCase()}, front view`}
            className="absolute inset-0 size-full object-cover"
          />
        </AspectRatio>
        <Badge className="absolute top-3 left-3">New season</Badge>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          onClick={() => setSaved((value) => !value)}
          className="absolute top-3 right-3 rounded-full bg-background/90 dark:bg-background/90 dark:hover:bg-muted"
        >
          <Heart
            aria-hidden="true"
            className={saved ? "fill-current text-destructive" : undefined}
          />
        </Button>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium">Merino Crew Sweater</h3>
          <p className="text-sm text-muted-foreground">{colorway.label}</p>
        </div>
        <p className="text-sm font-semibold tabular-nums">$128</p>
      </div>
      <fieldset className="mt-3">
        <legend className="sr-only">Color</legend>
        <div className="flex gap-2">
          {colorways.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-label={option.label}
              aria-pressed={colorway.id === option.id}
              onClick={() => {
                setColorway(option);
                setAdded(false);
              }}
              className="flex size-7 items-center justify-center rounded-full border border-transparent outline-none transition-colors hover:border-border focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-foreground"
            >
              <span
                className={`size-5 rounded-full border border-border ${option.swatch}`}
              />
            </button>
          ))}
        </div>
      </fieldset>
      <Button className="mt-4 w-full" onClick={() => setAdded(true)}>
        <ShoppingBag aria-hidden="true" data-icon="inline-start" />
        {added ? "Added to bag" : "Add to bag"}
      </Button>
      <p className="sr-only" aria-live="polite">
        {added ? `Merino Crew Sweater in ${colorway.label} added to bag.` : ""}
      </p>
    </article>
  );
}
