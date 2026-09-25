"use client";

import { useState } from "react";
import { LockIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Separator } from "@/registry/base/ui/separator";

const lines = [
  { label: "Subtotal (2 items)", amount: "$184.00" },
  { label: "Shipping", amount: "$6.50" },
  { label: "Tax", amount: "$15.18" },
];

export default function Checkbox08() {
  const [accepted, setAccepted] = useState(false);
  const [updates, setUpdates] = useState(true);
  const [attempted, setAttempted] = useState(false);
  const [placed, setPlaced] = useState(false);

  const showError = attempted && !accepted;

  function placeOrder() {
    setAttempted(true);
    if (accepted) setPlaced(true);
  }

  if (placed) {
    return (
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-card-foreground">
        <p className="text-base font-medium">Order NW-10482 placed</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {updates
            ? "We'll email tracking details to jordan@northwind.co as soon as it ships."
            : "Tracking details will appear under Orders in your account."}
        </p>
        <Button
          variant="outline"
          className="mt-5 w-full"
          onClick={() => {
            setPlaced(false);
            setAttempted(false);
            setAccepted(false);
          }}
        >
          Back to checkout
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 text-card-foreground">
      <dl className="flex flex-col gap-2 text-sm">
        {lines.map((line) => (
          <div key={line.label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{line.label}</dt>
            <dd className="tabular-nums">{line.amount}</dd>
          </div>
        ))}
        <Separator className="my-1" />
        <div className="flex justify-between gap-4 text-base font-medium">
          <dt>Total</dt>
          <dd className="tabular-nums">$205.68</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-col gap-4">
        <Field orientation="horizontal" invalid={showError}>
          <Checkbox
            name="terms"
            checked={accepted}
            aria-invalid={showError || undefined}
            onCheckedChange={(checked) => setAccepted(checked)}
          />
          <FieldContent>
            <FieldLabel>I agree to the Terms of Sale</FieldLabel>
            <FieldDescription className="text-xs">
              Includes the 30-day return policy and the final-sale terms for
              discounted items.
            </FieldDescription>
            {showError ? (
              <FieldError className="text-xs">
                Accept the Terms of Sale to place your order.
              </FieldError>
            ) : null}
          </FieldContent>
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            name="orderUpdates"
            checked={updates}
            onCheckedChange={(checked) => setUpdates(checked)}
          />
          <FieldContent>
            <FieldLabel>Email me shipping updates</FieldLabel>
            <FieldDescription className="text-xs">
              Tracking links only. No promotions.
            </FieldDescription>
          </FieldContent>
        </Field>
      </div>

      <Button size="lg" className="mt-5 w-full" onClick={placeOrder}>
        <LockIcon aria-hidden="true" data-icon="inline-start" />
        Place order · $205.68
      </Button>
    </div>
  );
}
