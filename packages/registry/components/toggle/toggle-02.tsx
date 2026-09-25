"use client";

import { CheckIcon, GiftIcon, PlusIcon, ShieldIcon, TruckIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Separator } from "@/registry/base/ui/separator";
import { Toggle } from "@/registry/base/ui/toggle";

const addOns = [
  {
    id: "express",
    label: "Express delivery",
    detail: "Arrives Friday, Sep 27",
    price: 12,
    icon: TruckIcon,
  },
  {
    id: "gift",
    label: "Gift wrap and note",
    detail: "Recycled paper, handwritten card",
    price: 6,
    icon: GiftIcon,
  },
  {
    id: "protection",
    label: "2-year protection",
    detail: "Covers drops and spills",
    price: 29,
    icon: ShieldIcon,
  },
];

const SUBTOTAL = 249;

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function Toggle02() {
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(["express"]),
  );
  const headingId = React.useId();

  function setAddOn(id: string, pressed: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (pressed) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const extras = addOns
    .filter((addOn) => selected.has(addOn.id))
    .reduce((sum, addOn) => sum + addOn.price, 0);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-1">
        <h3 id={headingId} className="font-medium">
          Add to your order
        </h3>
        <p className="text-sm text-muted-foreground">
          Aeron desk lamp, matte graphite
        </p>
      </div>
      <fieldset
        aria-labelledby={headingId}
        className="flex min-w-0 flex-col gap-2"
      >
        {addOns.map((addOn) => {
          const Icon = addOn.icon;
          return (
            <Toggle
              key={addOn.id}
              variant="outline"
              pressed={selected.has(addOn.id)}
              onPressedChange={(pressed) => setAddOn(addOn.id, pressed)}
              className="h-auto justify-start gap-3 rounded-lg p-3 text-left whitespace-normal aria-pressed:border-primary aria-pressed:bg-primary/5 dark:aria-pressed:bg-primary/10"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-aria-pressed/toggle:bg-primary group-aria-pressed/toggle:text-primary-foreground">
                <Icon aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium">{addOn.label}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {addOn.detail}
                  </span>
                </span>
                <span className="text-sm tabular-nums">
                  +{formatPrice(addOn.price)}
                </span>
              </span>
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full border text-muted-foreground group-aria-pressed/toggle:border-primary group-aria-pressed/toggle:bg-primary group-aria-pressed/toggle:text-primary-foreground">
                <PlusIcon
                  aria-hidden="true"
                  className="size-3 group-aria-pressed/toggle:hidden"
                />
                <CheckIcon
                  aria-hidden="true"
                  className="hidden size-3 group-aria-pressed/toggle:block"
                />
              </span>
            </Toggle>
          );
        })}
      </fieldset>
      <Separator />
      <dl className="grid grid-cols-[1fr_auto] gap-y-1 text-sm">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="text-right tabular-nums">{formatPrice(SUBTOTAL)}</dd>
        <dt className="text-muted-foreground">Add-ons</dt>
        <dd className="text-right tabular-nums">{formatPrice(extras)}</dd>
        <dt className="font-medium">Total</dt>
        <dd aria-live="polite" className="text-right font-medium tabular-nums">
          {formatPrice(SUBTOTAL + extras)}
        </dd>
      </dl>
      <Button className="w-full">Continue to payment</Button>
    </div>
  );
}
