"use client";

import * as React from "react";
import { DatabaseBackupIcon, HeadsetIcon, ShieldCheckIcon } from "lucide-react";

import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/registry/base/ui/field";

const addons = [
  {
    id: "backups",
    title: "Daily backups",
    description: "Point-in-time restore for the last 30 days.",
    price: 12,
    icon: DatabaseBackupIcon,
  },
  {
    id: "sso",
    title: "SAML single sign-on",
    description: "Connect Okta, Entra ID, or Google Workspace.",
    price: 24,
    icon: ShieldCheckIcon,
  },
  {
    id: "support",
    title: "Priority support",
    description: "Replies within 4 business hours.",
    price: 49,
    icon: HeadsetIcon,
  },
];

export default function Checkbox04() {
  const id = React.useId();
  const [selected, setSelected] = React.useState<string[]>(["backups"]);

  const total = addons
    .filter((addon) => selected.includes(addon.id))
    .reduce((sum, addon) => sum + addon.price, 0);

  return (
    <FieldSet className="w-full max-w-md">
      <FieldLegend>Add-ons</FieldLegend>
      <p className="-mt-1.5 text-sm text-muted-foreground">
        Billed monthly with your Team plan.
      </p>
      <FieldGroup className="gap-3">
        {addons.map((addon) => {
          const Icon = addon.icon;
          const checkboxId = `${id}-${addon.id}`;
          return (
            <label
              key={addon.id}
              htmlFor={checkboxId}
              className="cursor-pointer rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10"
            >
              <Field orientation="horizontal" className="items-start">
                <Checkbox
                  id={checkboxId}
                  className="mt-0.5 after:hidden"
                  checked={selected.includes(addon.id)}
                  onCheckedChange={(checked) =>
                    setSelected((current) =>
                      checked
                        ? [...current, addon.id]
                        : current.filter((value) => value !== addon.id),
                    )
                  }
                />
                <FieldContent>
                  <FieldTitle>
                    <Icon
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                    {addon.title}
                  </FieldTitle>
                  <FieldDescription>{addon.description}</FieldDescription>
                </FieldContent>
                <span className="shrink-0 text-sm font-medium tabular-nums">
                  ${addon.price}
                  <span className="font-normal text-muted-foreground">/mo</span>
                </span>
              </Field>
            </label>
          );
        })}
      </FieldGroup>
      <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="text-muted-foreground">Add-ons total</span>
        <span aria-live="polite" className="font-semibold tabular-nums">
          ${total}/mo
        </span>
      </div>
    </FieldSet>
  );
}
