"use client";

import { useId, useState } from "react";
import { PackageCheckIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const order = {
  number: "SU-20418",
  deliveredOn: "September 18",
  returnBy: "October 18",
};

const items = [
  {
    id: "sweater",
    name: "Merino crew sweater",
    variant: "Oat, size M",
    price: 98,
    finalSale: false,
  },
  {
    id: "weekender",
    name: "Canvas weekender bag",
    variant: "Olive",
    price: 145,
    finalSale: false,
  },
  {
    id: "socks",
    name: "Wool hiking socks, 3-pack",
    variant: "Charcoal, size L",
    price: 24,
    finalSale: true,
  },
];

const reasons = [
  { value: "size", label: "Doesn't fit" },
  { value: "not-as-described", label: "Not as described" },
  { value: "damaged", label: "Arrived damaged" },
  { value: "changed-mind", label: "Changed my mind" },
];

const creditBonus = 0.1;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Form12() {
  const baseId = useId();
  const itemsErrorId = `${baseId}-items-error`;
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [refundTo, setRefundTo] = useState("original");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rma, setRma] = useState<string | null>(null);

  const subtotal = items
    .filter((item) => item.id in selected)
    .reduce((sum, item) => sum + item.price, 0);
  const refund =
    refundTo === "credit" ? subtotal * (1 + creditBonus) : subtotal;

  const toggleItem = (id: string, checked: boolean) => {
    setErrors({});
    setSelected((current) => {
      const next = { ...current };
      if (checked) next[id] = "";
      else delete next[id];
      return next;
    });
  };

  if (rma) {
    return (
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <PackageCheckIcon aria-hidden="true" className="size-6 text-success" />
        <div role="status" className="flex flex-col gap-1">
          <h3 className="font-semibold">Return {rma} started</h3>
          <p className="text-sm text-muted-foreground">
            We emailed a prepaid label. Drop the package at any UPS location by{" "}
            {order.returnBy}. Your {currency.format(refund)}{" "}
            {refundTo === "credit" ? "store credit" : "refund"} is issued once
            it's scanned.
          </p>
        </div>
        <Button
          variant="outline"
          className="self-start"
          onClick={() => {
            setRma(null);
            setSelected({});
          }}
        >
          Start another return
        </Button>
      </div>
    );
  }

  return (
    <Form
      className="w-full max-w-md gap-5 rounded-xl border border-border bg-card p-5"
      errors={errors}
      onFormSubmit={() => {
        const ids = Object.keys(selected);
        if (ids.length === 0) {
          setErrors({ items: "Choose at least one item to return." });
          return;
        }
        const missing = ids.find((id) => !selected[id]);
        if (missing) {
          setErrors({
            [`reason-${missing}`]: "Tell us why you're returning it.",
          });
          return;
        }
        setRma("RMA-58213");
      }}
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">Return items</h3>
        <p className="text-sm text-muted-foreground">
          Order {order.number}, delivered {order.deliveredOn}. Free returns
          until {order.returnBy}.
        </p>
      </div>

      <FieldSet aria-describedby={errors.items ? itemsErrorId : undefined}>
        <FieldLegend variant="label">What are you sending back?</FieldLegend>
        <FieldGroup className="gap-2">
          {items.map((item) => {
            const checkboxId = `${baseId}-${item.id}`;
            const reasonId = `${baseId}-${item.id}-reason`;
            const isSelected = item.id in selected;
            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-3 has-data-checked:border-primary/40 has-data-checked:bg-primary/5 has-data-disabled:opacity-60"
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={checkboxId}
                    className="mt-0.5"
                    disabled={item.finalSale}
                    checked={isSelected}
                    onCheckedChange={(checked) => toggleItem(item.id, checked)}
                  />
                  <img
                    src="/placeholder.svg"
                    alt=""
                    className="size-10 shrink-0 rounded-md bg-muted object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5 sm:flex-row sm:justify-between sm:gap-3">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <Label htmlFor={checkboxId} className="leading-snug">
                        {item.name}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {item.variant}
                      </span>
                    </div>
                    {item.finalSale ? (
                      <Badge variant="outline">Final sale</Badge>
                    ) : (
                      <span className="text-sm tabular-nums">
                        {currency.format(item.price)}
                      </span>
                    )}
                  </div>
                </div>
                {isSelected ? (
                  <Field name={`reason-${item.id}`} className="gap-1.5 pl-7">
                    <FieldLabel htmlFor={reasonId} className="sr-only">
                      Reason for returning {item.name}
                    </FieldLabel>
                    <NativeSelect
                      id={reasonId}
                      size="sm"
                      className="w-full"
                      value={selected[item.id]}
                      aria-invalid={
                        `reason-${item.id}` in errors || undefined
                      }
                      onChange={(event) => {
                        const value = event.target.value;
                        setErrors({});
                        setSelected((current) => ({
                          ...current,
                          [item.id]: value,
                        }));
                      }}
                    >
                      <NativeSelectOption value="" disabled>
                        Select a reason
                      </NativeSelectOption>
                      {reasons.map((reason) => (
                        <NativeSelectOption
                          key={reason.value}
                          value={reason.value}
                        >
                          {reason.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <FieldError />
                  </Field>
                ) : null}
              </div>
            );
          })}
        </FieldGroup>
        {errors.items ? (
          <p id={itemsErrorId} role="alert" className="text-sm text-destructive">
            {errors.items}
          </p>
        ) : null}
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">Refund to</FieldLegend>
        <RadioGroup
          value={refundTo}
          onValueChange={(value) => setRefundTo(value as string)}
        >
          <Label className="font-normal">
            <RadioGroupItem value="original" />
            Original payment, Visa ending 4242
          </Label>
          <Label className="font-normal">
            <RadioGroupItem value="credit" />
            Store credit
            <Badge variant="secondary">+10% bonus</Badge>
          </Label>
        </RadioGroup>
      </FieldSet>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          Refund{" "}
          <span className="font-medium text-foreground tabular-nums">
            {currency.format(refund)}
          </span>
        </p>
        <Button type="submit">Request return</Button>
      </div>
    </Form>
  );
}
