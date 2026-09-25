"use client";

import { ArrowLeft, Check, CircleCheck, Lock } from "lucide-react";
import * as React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/base/ui/breadcrumb";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

const steps = [
  {
    label: "Cart",
    title: "Review your cart",
    fields: [{ id: "promo", label: "Promo code", placeholder: "SPRING15" }],
  },
  {
    label: "Shipping",
    title: "Where should we ship?",
    fields: [
      {
        id: "address",
        label: "Street address",
        placeholder: "221 Harbor Lane",
      },
      { id: "postal", label: "Postal code", placeholder: "94107" },
    ],
  },
  {
    label: "Payment",
    title: "How would you like to pay?",
    fields: [
      { id: "card", label: "Card number", placeholder: "4242 4242 4242 4242" },
    ],
  },
  {
    label: "Review",
    title: "Confirm and place order",
    fields: [],
  },
];

export default function Breadcrumb09() {
  const [current, setCurrent] = React.useState(1);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [placed, setPlaced] = React.useState(false);
  const step = steps[current];
  const isLast = current === steps.length - 1;

  const startOver = () => {
    setValues({});
    setPlaced(false);
    setCurrent(0);
  };

  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-4 text-card-foreground sm:p-5">
      <Breadcrumb aria-label="Checkout steps">
        <BreadcrumbList>
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {i < current && !placed ? (
                  <BreadcrumbLink
                    render={<button type="button" />}
                    onClick={() => setCurrent(i)}
                    className="inline-flex items-center gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <Check className="size-3.5" aria-hidden="true" />
                    {s.label}
                    <span className="sr-only">(completed)</span>
                  </BreadcrumbLink>
                ) : i <= current ? (
                  <BreadcrumbPage
                    aria-current={i === current ? "page" : false}
                    className={
                      i === current
                        ? "font-medium"
                        : "inline-flex items-center gap-1"
                    }
                  >
                    {i < current ? (
                      <Check className="size-3.5" aria-hidden="true" />
                    ) : null}
                    {s.label}
                  </BreadcrumbPage>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground/60">
                    <Lock className="size-3" aria-hidden="true" />
                    {s.label}
                    <span className="sr-only">(locked)</span>
                  </span>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {placed ? (
        <div className="mt-4 flex flex-col items-start gap-3" role="status">
          <div className="flex items-center gap-2">
            <CircleCheck className="size-5 text-success" aria-hidden="true" />
            <h2 className="text-base font-semibold">Order placed</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            We emailed a receipt for $182.50
            {values.address ? ` and will ship to ${values.address}` : ""}.
          </p>
          <Button variant="outline" onClick={startOver}>
            Start a new order
          </Button>
        </div>
      ) : (
        <>
          <h2 className="mt-4 text-base font-semibold">{step.title}</h2>

          <form
            className="mt-4 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (isLast) setPlaced(true);
              else setCurrent((c) => c + 1);
            }}
          >
            {step.fields.map((field) => (
              <div key={field.id} className="grid gap-1.5">
                <Label htmlFor={`checkout-${field.id}`}>{field.label}</Label>
                <Input
                  id={`checkout-${field.id}`}
                  placeholder={field.placeholder}
                  value={values[field.id] ?? ""}
                  onChange={(event) => {
                    const next = event.currentTarget.value;
                    setValues((prev) => ({ ...prev, [field.id]: next }));
                  }}
                />
              </div>
            ))}

            {isLast ? (
              <dl className="grid gap-1.5 rounded-lg bg-muted p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Merino crew sweater × 2</dt>
                  <dd className="tabular-nums">$176.00</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Standard shipping</dt>
                  <dd className="tabular-nums">$6.50</dd>
                </div>
                <div className="flex justify-between gap-3 border-t pt-1.5 font-medium">
                  <dt>Total</dt>
                  <dd className="tabular-nums">$182.50</dd>
                </div>
              </dl>
            ) : null}

            <div className="mt-2 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={current === 0}
                onClick={() => setCurrent((c) => c - 1)}
              >
                <ArrowLeft aria-hidden="true" />
                Back
              </Button>
              <Button type="submit">
                {isLast ? (
                  <>
                    <Lock aria-hidden="true" />
                    Place order
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">Continue</span>
                    <span className="max-sm:hidden">
                      Continue to {steps[current + 1].label.toLowerCase()}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
