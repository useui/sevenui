"use client";

import * as React from "react";
import { Check } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const plans = [
  {
    value: "hobby",
    name: "Hobby",
    price: "$0",
    description: "One project, community support, 1 GB bandwidth.",
  },
  {
    value: "pro",
    name: "Pro",
    price: "$20",
    description: "Unlimited projects, preview deployments, 100 GB bandwidth.",
  },
  {
    value: "team",
    name: "Team",
    price: "$60",
    description: "Everything in Pro plus SSO, audit logs, and role-based access.",
  },
];

export default function Card06() {
  const [plan, setPlan] = React.useState("pro");
  const selected = plans.find((item) => item.value === plan);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <RadioGroup
        value={plan}
        onValueChange={(value) => setPlan(value as string)}
        aria-label="Billing plan"
        className="gap-3"
      >
        {plans.map((item) => {
          const id = `card-06-${item.value}`;
          const isSelected = plan === item.value;

          return (
            <Label key={item.value} htmlFor={id} className="block cursor-pointer">
              <Card
                size="sm"
                data-selected={isSelected || undefined}
                className="transition-[box-shadow,background-color] duration-150 hover:bg-muted/40 has-focus-visible:ring-2 has-focus-visible:ring-ring data-selected:bg-primary/5 data-selected:ring-2 data-selected:ring-primary"
              >
                <CardHeader className="grid-cols-[auto_1fr_auto] items-start gap-x-3">
                  <RadioGroupItem id={id} value={item.value} className="mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription className="text-xs font-normal">
                      {item.description}
                    </CardDescription>
                  </div>
                  <span className="text-sm font-medium tabular-nums">
                    {item.price}
                    <span className="text-xs font-normal text-muted-foreground">
                      /mo
                    </span>
                  </span>
                </CardHeader>
              </Card>
            </Label>
          );
        })}
      </RadioGroup>
      <p
        aria-live="polite"
        className="flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Check aria-hidden="true" className="size-3.5" />
        {selected?.name} plan selected, billed monthly.
      </p>
    </div>
  );
}
