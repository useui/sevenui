"use client";

import { Lock } from "lucide-react";
import * as React from "react";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const addressFields = [
  {
    id: "label-04-street",
    label: "Street address",
    placeholder: "221 Harbor Way",
  },
  { id: "label-04-city", label: "City", placeholder: "Portland" },
];

export default function Label04() {
  const [sameAsShipping, setSameAsShipping] = React.useState(true);

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="label-04-account">
          <Lock aria-hidden="true" className="size-3.5 text-muted-foreground" />
          Account ID
        </Label>
        <Input
          id="label-04-account"
          readOnly
          defaultValue="acct_7Q2mX91c"
          aria-describedby="label-04-account-hint"
          className="bg-muted/50 font-mono text-muted-foreground"
        />
        <p id="label-04-account-hint" className="text-xs text-muted-foreground">
          Read-only. Contact support to transfer this account.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
        <Label htmlFor="label-04-same" className="cursor-pointer">
          Billing address same as shipping
        </Label>
        <Switch
          id="label-04-same"
          checked={sameAsShipping}
          onCheckedChange={setSameAsShipping}
        />
      </div>

      <div className="group flex flex-col gap-4" data-disabled={sameAsShipping}>
        {addressFields.map((field) => (
          <div key={field.id} className="flex flex-col gap-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              disabled={sameAsShipping}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
