"use client";

import { CreditCardIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/registry/base/ui/carousel";

const cards = [
  {
    id: "visa-4242",
    brand: "Visa",
    last4: "4242",
    holder: "Jordan Ellis",
    expires: "08/28",
  },
  {
    id: "mastercard-8210",
    brand: "Mastercard",
    last4: "8210",
    holder: "Jordan Ellis",
    expires: "03/27",
  },
  {
    id: "amex-1005",
    brand: "American Express",
    last4: "1005",
    holder: "Ellis Studio LLC",
    expires: "11/29",
  },
];

export default function Carousel01() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [defaultId, setDefaultId] = React.useState(cards[0].id);

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const card = cards[current];
  const isDefault = card.id === defaultId;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h3 id="carousel-01-title" className="font-medium">
          Payment methods
        </h3>
        <p className="text-sm text-muted-foreground">
          Swipe to pick the card for renewals.
        </p>
      </div>
      <Carousel
        setApi={setApi}
        opts={{ align: "start" }}
        aria-labelledby="carousel-01-title"
      >
        <CarouselContent className="-ml-3">
          {cards.map((item, index) => (
            <CarouselItem
              key={item.id}
              aria-label={`${index + 1} of ${cards.length}: ${item.brand} ending in ${item.last4}`}
              className="basis-[88%] pl-3"
            >
              <div className="flex aspect-[1.586] flex-col justify-between rounded-xl bg-foreground p-4 text-background shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{item.brand}</span>
                  {item.id === defaultId ? (
                    <Badge
                      variant="outline"
                      className="border-background/30 text-background"
                    >
                      Default
                    </Badge>
                  ) : (
                    <CreditCardIcon
                      aria-hidden="true"
                      className="size-5 opacity-60"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-lg font-medium tracking-wider tabular-nums">
                    <span aria-hidden="true">•••• •••• •••• </span>
                    {item.last4}
                  </span>
                  <div className="flex items-end justify-between gap-2 text-xs">
                    <span className="truncate opacity-80">{item.holder}</span>
                    <span className="shrink-0 tabular-nums opacity-80">
                      Exp {item.expires}
                    </span>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {cards.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ${item.brand} ending in ${item.last4}`}
                aria-current={index === current ? "true" : undefined}
                onClick={() => api?.scrollTo(index)}
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 transition-[width,background-color] duration-300 ease-out outline-none hover:bg-muted-foreground/60 focus-visible:ring-3 focus-visible:ring-ring/50 aria-current:w-5 aria-current:bg-primary"
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <CarouselPrevious className="static my-0" />
            <CarouselNext className="static my-0" />
          </div>
        </div>
      </Carousel>
      <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
        <p className="min-w-0 text-sm" aria-live="polite">
          <span className="font-medium">
            {card.brand} {card.last4}
          </span>
          <span className="text-muted-foreground">
            {isDefault ? " is your default" : " selected"}
          </span>
        </p>
        <Button
          size="sm"
          variant={isDefault ? "ghost" : "default"}
          disabled={isDefault}
          onClick={() => setDefaultId(card.id)}
        >
          {isDefault ? "Default card" : "Make default"}
        </Button>
      </div>
    </div>
  );
}
