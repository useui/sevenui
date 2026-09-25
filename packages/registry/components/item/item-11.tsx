"use client";

import * as React from "react";
import { CreditCardIcon, LandmarkIcon, PlusIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const METHODS = [
  {
    id: "visa-4242",
    title: "Visa ending in 4242",
    detail: "Expires 08/2028",
    icon: CreditCardIcon,
    expiring: false,
  },
  {
    id: "mastercard-8210",
    title: "Mastercard ending in 8210",
    detail: "Expires 10/2026",
    icon: CreditCardIcon,
    expiring: true,
  },
  {
    id: "ach-6019",
    title: "Business checking ••6019",
    detail: "ACH debit · First Harbor Bank",
    icon: LandmarkIcon,
    expiring: false,
  },
];

const NEW_METHOD = {
  id: "amex-1009",
  title: "Amex ending in 1009",
  detail: "Expires 04/2030",
  icon: CreditCardIcon,
  expiring: false,
};

export default function Item11() {
  const headingId = React.useId();
  const [defaultMethod, setDefaultMethod] = React.useState<string>("visa-4242");
  const [added, setAdded] = React.useState(false);

  const methods = added ? [...METHODS, NEW_METHOD] : METHODS;

  function removeNewMethod() {
    setAdded(false);
    if (defaultMethod === NEW_METHOD.id) setDefaultMethod(METHODS[0].id);
  }

  return (
    <div className="w-full max-w-md space-y-3">
      <div className="space-y-1">
        <h3 id={headingId} className="text-base font-semibold">
          Payment method
        </h3>
        <p className="text-sm text-muted-foreground">
          Your Team plan renews on October 14 for $96.00.
        </p>
      </div>
      <RadioGroup
        aria-labelledby={headingId}
        value={defaultMethod}
        onValueChange={(value) => setDefaultMethod(value as string)}
        className="gap-2"
      >
        {methods.map((method) => {
          const Icon = method.icon;
          const isDefault = defaultMethod === method.id;
          return (
            <Item
              key={method.id}
              variant="outline"
              className="relative hover:bg-muted/50 has-data-checked:border-primary has-data-checked:bg-primary/5 has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
            >
              <ItemMedia className="h-7 w-10 rounded-md border bg-background text-muted-foreground">
                <Icon aria-hidden="true" className="size-4" />
              </ItemMedia>
              <ItemContent className="min-w-0">
                <ItemTitle>
                  <label
                    htmlFor={`${headingId}-${method.id}`}
                    className="cursor-pointer after:absolute after:inset-0"
                  >
                    {method.title}
                  </label>
                  {isDefault && (
                    <Badge variant="outline" className="bg-background">
                      Default
                    </Badge>
                  )}
                </ItemTitle>
                <ItemDescription>
                  {method.detail}
                  {method.expiring && (
                    <span className="font-medium text-foreground">
                      {" "}
                      · Expires soon
                    </span>
                  )}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                {method.id === NEW_METHOD.id ? (
                  <Button
                    size="xs"
                    variant="ghost"
                    className="relative z-10 text-muted-foreground"
                    onClick={removeNewMethod}
                  >
                    Remove
                    <span className="sr-only"> {method.title}</span>
                  </Button>
                ) : null}
                <RadioGroupItem
                  className="z-10"
                  id={`${headingId}-${method.id}`}
                  value={method.id}
                />
              </ItemActions>
            </Item>
          );
        })}
      </RadioGroup>
      {added ? null : (
        <Item
          variant="outline"
          size="sm"
          render={<button type="button" onClick={() => setAdded(true)} />}
          className="cursor-pointer justify-center border-dashed text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        >
          <PlusIcon aria-hidden="true" className="size-4" />
          Add payment method
        </Item>
      )}
    </div>
  );
}
