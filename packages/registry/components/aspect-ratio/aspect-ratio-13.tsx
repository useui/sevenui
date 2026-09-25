"use client";

import { Check, Clock, MapPin, Navigation } from "lucide-react";
import * as React from "react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";

// Pin positions are percentages of the map, so they stay anchored at any width.
const stores = [
  {
    id: "mission",
    name: "Mission District",
    address: "2170 Mission St",
    hours: "Open until 8 PM",
    open: true,
    stock: "12 in stock",
    x: 38,
    y: 62,
  },
  {
    id: "hayes",
    name: "Hayes Valley",
    address: "451 Hayes St",
    hours: "Opens 10 AM",
    open: false,
    stock: "3 in stock",
    x: 30,
    y: 38,
  },
  {
    id: "embarcadero",
    name: "Embarcadero Center",
    address: "4 Embarcadero Ctr",
    hours: "Open until 7 PM",
    open: true,
    stock: "Low stock",
    x: 76,
    y: 24,
  },
];

export default function AspectRatio13() {
  const [activeId, setActiveId] = React.useState("mission");
  const [reservedId, setReservedId] = React.useState<string | null>(null);
  const active = stores.find((store) => store.id === activeId) ?? stores[0];
  const reserved = reservedId === active.id;
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${active.address}, San Francisco, CA`)}`;

  return (
    <section
      aria-labelledby="aspect-ratio-13-title"
      className="w-full max-w-lg overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <div className="p-4">
        <h3 id="aspect-ratio-13-title" className="font-medium">
          Pick up in store
        </h3>
        <p className="text-sm text-muted-foreground">
          Trail Runner 4 · Size 10 · Ready in 2 hours
        </p>
      </div>
      <AspectRatio ratio={16 / 9} className="border-y bg-muted">
        <img
          src="/placeholder.svg"
          alt="Map of San Francisco store locations"
          className="absolute inset-0 size-full object-cover opacity-70"
        />
        {stores.map((store) => {
          const selected = store.id === activeId;
          return (
            <button
              key={store.id}
              type="button"
              aria-label={`${store.name} on map`}
              aria-pressed={selected}
              onClick={() => setActiveId(store.id)}
              style={{ left: `${store.x}%`, top: `${store.y}%` }}
              className="absolute flex size-8 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full border bg-background text-foreground shadow-md outline-none transition-transform hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:z-10 aria-pressed:scale-110 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              <MapPin aria-hidden="true" className="size-4" />
            </button>
          );
        })}
      </AspectRatio>
      <ul aria-label="Nearby stores" className="divide-y">
        {stores.map((store) => {
          const selected = store.id === activeId;
          return (
            <li key={store.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveId(store.id)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset aria-pressed:bg-muted"
              >
                <span
                  aria-hidden="true"
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${selected ? "bg-primary" : "bg-border"}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{store.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {store.address}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock aria-hidden="true" className="size-3" />
                    {store.hours}
                  </span>
                </span>
                <Badge variant={store.open ? "secondary" : "outline"}>{store.stock}</Badge>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t p-4">
        <p className="text-sm" aria-live="polite">
          <span className="text-muted-foreground">
            {reserved ? "Reserved at " : "Pickup at "}
          </span>
          <span className="font-medium">{active.name}</span>
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<a href={directionsHref} target="_blank" rel="noreferrer" />}
          >
            <Navigation aria-hidden="true" data-icon="inline-start" />
            Directions
          </Button>
          <Button
            size="sm"
            disabled={!active.open || reserved}
            focusableWhenDisabled
            onClick={() => setReservedId(active.id)}
          >
            {reserved ? (
              <>
                <Check aria-hidden="true" data-icon="inline-start" />
                Reserved
              </>
            ) : active.open ? (
              "Reserve"
            ) : (
              "Closed now"
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
