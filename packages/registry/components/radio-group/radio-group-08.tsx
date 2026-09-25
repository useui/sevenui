"use client";

import { useState } from "react";
import { CalendarClockIcon, StoreIcon, TruckIcon } from "lucide-react";
import { cn } from "cn";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const methods = [
  {
    value: "standard",
    label: "Standard delivery",
    summary: "Arrives Thu, Oct 2",
    price: "Free",
    icon: TruckIcon,
  },
  {
    value: "scheduled",
    label: "Scheduled delivery",
    summary: "Pick a 2-hour window",
    price: "$6.00",
    icon: CalendarClockIcon,
  },
  {
    value: "pickup",
    label: "Store pickup",
    summary: "Ready in 2 hours at Market Street",
    price: "Free",
    icon: StoreIcon,
  },
];

const timeWindows = [
  "Tue, Sep 30 · 8–10 AM",
  "Tue, Sep 30 · 6–8 PM",
  "Wed, Oct 1 · 10 AM–12 PM",
  "Wed, Oct 1 · 4–6 PM",
];

function MethodDetails({ value }: { value: string }) {
  if (value === "scheduled") {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor="radio-group-08-window">Delivery window</Label>
        <NativeSelect id="radio-group-08-window" className="w-full">
          {timeWindows.map((slot) => (
            <NativeSelectOption key={slot} value={slot}>
              {slot}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    );
  }

  if (value === "pickup") {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor="radio-group-08-pickup">Who's picking up?</Label>
        <Input
          id="radio-group-08-pickup"
          autoComplete="name"
          placeholder="Full name on photo ID"
        />
      </div>
    );
  }

  return null;
}

export default function RadioGroup08() {
  const [method, setMethod] = useState("scheduled");

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <p id="radio-group-08-label" className="text-sm font-medium">
        Delivery method
      </p>
      <RadioGroup
        value={method}
        onValueChange={(value) => setMethod(value as string)}
        aria-labelledby="radio-group-08-label"
        className="gap-2"
      >
        {methods.map((item) => {
          const Icon = item.icon;
          const checked = method === item.value;
          const hasDetails = item.value !== "standard";

          return (
            <div
              key={item.value}
              className={cn(
                "rounded-xl border bg-card text-card-foreground transition-colors",
                checked
                  ? "border-primary/50 bg-primary/5 dark:bg-primary/10"
                  : "border-border",
              )}
            >
              <Label className="cursor-pointer items-center gap-3 p-4 font-normal">
                <RadioGroupItem value={item.value} />
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    checked ? "text-foreground" : "text-muted-foreground",
                  )}
                />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.summary}
                  </span>
                </span>
                <span className="text-sm tabular-nums">{item.price}</span>
              </Label>

              {hasDetails ? (
                // Collapsed panels stay mounted so the height can animate,
                // and `inert` keeps their fields out of the tab order.
                <fieldset
                  aria-label={`${item.label} details`}
                  inert={!checked}
                  // Keep arrow keys inside the fields instead of letting the
                  // radio group treat them as option navigation.
                  onKeyDown={(event) => event.stopPropagation()}
                  className={cn(
                    "m-0 grid min-w-0 border-0 p-0 transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
                    checked
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 sm:pl-11">
                      <MethodDetails value={item.value} />
                    </div>
                  </div>
                </fieldset>
              ) : null}
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
