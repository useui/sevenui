"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const regions = [
  { value: "eu", label: "European Union", eta: "2–3 business days" },
  { value: "uk", label: "United Kingdom", eta: "3–4 business days" },
  { value: "us", label: "United States", eta: "5–7 business days" },
  { value: "apac", label: "Asia Pacific", eta: "7–10 business days" },
];

export default function Select07() {
  const [value, setValue] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const selected = regions.find((region) => region.value === value);
  const invalid = submitted && !selected;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="grid w-full max-w-xs gap-4"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="select-07-region">
          Shipping region
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </Label>
        <Select
          items={regions}
          value={value}
          onValueChange={setValue}
          required
        >
          <SelectTrigger
            id="select-07-region"
            className="w-full"
            aria-invalid={invalid || undefined}
            aria-required="true"
            aria-describedby="select-07-message"
          >
            <SelectValue placeholder="Choose where to ship" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p
          id="select-07-message"
          aria-live="polite"
          className="flex min-h-4 items-center gap-1.5 text-xs text-muted-foreground"
        >
          {invalid ? (
            <span className="flex items-center gap-1.5 text-destructive">
              <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
              Pick a region so we can quote delivery.
            </span>
          ) : selected ? (
            <span className="flex items-center gap-1.5 text-success">
              <CircleCheck className="size-3.5 shrink-0" aria-hidden="true" />
              Arrives in {selected.eta}.
            </span>
          ) : (
            "Used to calculate duties and delivery time."
          )}
        </p>
      </div>
      <Button type="submit" className="w-full">
        Continue to payment
      </Button>
    </form>
  );
}
