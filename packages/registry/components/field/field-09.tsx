"use client";

import { useState } from "react";
import { CreditCardIcon, LockIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/base/ui/input-group";

type FieldName = "name" | "number" | "expiry" | "cvc";

function formatNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)} / ${digits.slice(2)}`
    : digits;
}

function detectBrand(number: string) {
  const digits = number.replace(/\D/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return null;
}

function passesLuhn(digits: string) {
  let sum = 0;
  for (let index = 0; index < digits.length; index++) {
    let digit = Number(digits[digits.length - 1 - index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

function isExpired(month: number, year: number) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  return year < currentYear || (year === currentYear && month < currentMonth);
}

function validate(values: Record<FieldName, string>) {
  const errors: Partial<Record<FieldName, string>> = {};
  if (values.name.trim().length < 2) {
    errors.name = "Enter the name printed on the card.";
  }
  const digits = values.number.replace(/\D/g, "");
  if (digits.length < 15 || !passesLuhn(digits)) {
    errors.number = "This card number looks incomplete. Check the digits.";
  }
  const [month, year] = values.expiry.split(" / ").map(Number);
  if (!month || !year || month > 12) {
    errors.expiry = "Use MM / YY.";
  } else if (isExpired(month, 2000 + year)) {
    errors.expiry = "This card has expired.";
  }
  if (!/^\d{3,4}$/.test(values.cvc)) {
    errors.cvc = "3 or 4 digits on the back.";
  }
  return errors;
}

export default function Field09() {
  const [values, setValues] = useState<Record<FieldName, string>>({
    name: "Harper Lin",
    number: "4242 4242 4242 4242",
    expiry: "",
    cvc: "",
  });
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
  const [paid, setPaid] = useState(false);
  const errors = validate(values);
  const brand = detectBrand(values.number);

  function update(name: FieldName, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setPaid(false);
  }

  function errorFor(name: FieldName) {
    return touched[name] ? errors[name] : undefined;
  }

  function blur(name: FieldName) {
    return () => setTouched((current) => ({ ...current, [name]: true }));
  }

  return (
    <form
      noValidate
      className="w-full max-w-sm rounded-xl border border-border bg-card p-4 sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setTouched({ name: true, number: true, expiry: true, cvc: true });
        if (Object.keys(errors).length === 0) setPaid(true);
      }}
    >
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-semibold">Payment details</h3>
        <span className="text-sm text-muted-foreground">
          Pro plan ·{" "}
          <span className="font-medium text-foreground tabular-nums">
            $48.00
          </span>
          /mo
        </span>
      </div>
      <FieldGroup className="gap-4">
        <Field invalid={!!errorFor("name")}>
          <FieldLabel>Name on card</FieldLabel>
          <Input
            autoComplete="cc-name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            onBlur={blur("name")}
          />
          <FieldError>{errorFor("name")}</FieldError>
        </Field>
        <Field invalid={!!errorFor("number")}>
          <FieldLabel>Card number</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              {brand ? (
                <span className="rounded-sm border border-border px-1 py-0.5 text-[0.65rem] font-semibold tracking-wide text-foreground uppercase">
                  {brand}
                </span>
              ) : (
                <CreditCardIcon aria-hidden="true" />
              )}
            </InputGroupAddon>
            <InputGroupInput
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 1234 1234 1234"
              className="tabular-nums max-sm:tracking-tight"
              value={values.number}
              onChange={(event) =>
                update("number", formatNumber(event.target.value))
              }
              onBlur={blur("number")}
              aria-invalid={!!errorFor("number") || undefined}
            />
          </InputGroup>
          <FieldError>{errorFor("number")}</FieldError>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field invalid={!!errorFor("expiry")}>
            <FieldLabel>Expiry</FieldLabel>
            <Input
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM / YY"
              className="tabular-nums"
              value={values.expiry}
              onChange={(event) =>
                update("expiry", formatExpiry(event.target.value))
              }
              onBlur={blur("expiry")}
            />
            <FieldError>{errorFor("expiry")}</FieldError>
          </Field>
          <Field invalid={!!errorFor("cvc")}>
            <FieldLabel>CVC</FieldLabel>
            <Input
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              maxLength={4}
              className="tabular-nums"
              value={values.cvc}
              onChange={(event) =>
                update("cvc", event.target.value.replace(/\D/g, ""))
              }
              onBlur={blur("cvc")}
            />
            <FieldError>{errorFor("cvc")}</FieldError>
          </Field>
        </div>
      </FieldGroup>
      <Button type="submit" className="mt-6 w-full" disabled={paid}>
        <LockIcon aria-hidden="true" data-icon="inline-start" />
        {paid ? "Payment confirmed" : "Pay $48.00"}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Billed monthly. Cancel anytime from Billing settings.
      </p>
    </form>
  );
}
