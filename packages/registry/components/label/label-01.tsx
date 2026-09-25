"use client";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function Label01() {
  return (
    <form
      className="flex w-full max-w-sm flex-col gap-5"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="label-01-company">
          Company name
          <span aria-hidden="true" className="-ml-1.5 text-destructive">
            *
          </span>
          <span className="sr-only">(required)</span>
        </Label>
        <Input
          id="label-01-company"
          name="company"
          autoComplete="organization"
          placeholder="Northwind Logistics"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="label-01-vat">
          VAT number
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            Optional
          </span>
        </Label>
        <Input id="label-01-vat" name="vat" placeholder="DE 123 456 789" />
      </div>
      <p className="text-xs text-muted-foreground">
        Fields marked with{" "}
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
        <span className="sr-only">an asterisk</span> are required.
      </p>
    </form>
  );
}
