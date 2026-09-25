"use client";

import * as React from "react";
import { CircleCheck, CreditCard, Landmark, Lock, Wallet } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Separator } from "@/registry/base/ui/separator";
import { Spinner } from "@/registry/base/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

type Method = "card" | "wallet" | "bank";
type CardErrors = Partial<Record<"number" | "expiry" | "cvc", string>>;

const methods: { value: Method; label: string; icon: typeof CreditCard }[] = [
  { value: "card", label: "Card", icon: CreditCard },
  { value: "wallet", label: "Wallet", icon: Wallet },
  { value: "bank", label: "Bank", icon: Landmark },
];

const summary = [
  { label: "Studio plan, annual", amount: "$228.00" },
  { label: "Sales tax (8.5%)", amount: "$19.38" },
];

const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
};

function validateCard(card: { number: string; expiry: string; cvc: string }) {
  const errors: CardErrors = {};
  if (card.number.replace(/\s/g, "").length !== 16) {
    errors.number = "Enter the 16-digit number on the front of your card.";
  }
  const [month] = card.expiry.split("/");
  if (
    !/^\d{2}\/\d{2}$/.test(card.expiry) ||
    Number(month) < 1 ||
    Number(month) > 12
  ) {
    errors.expiry = "Use MM/YY, e.g. 04/28.";
  }
  if (!/^\d{3,4}$/.test(card.cvc)) {
    errors.cvc = "3 or 4 digits on the back.";
  }
  return errors;
}

export default function Tabs14() {
  const [method, setMethod] = React.useState<Method>("card");
  const [card, setCard] = React.useState({ number: "", expiry: "", cvc: "" });
  const [errors, setErrors] = React.useState<CardErrors>({});
  const [status, setStatus] = React.useState<"idle" | "loading" | "paid">(
    "idle",
  );
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const update = (key: keyof typeof card, value: string) => {
    setCard((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (method === "card") {
      const next = validateCard(card);
      setErrors(next);
      const firstInvalid = Object.keys(next)[0];
      if (firstInvalid) {
        document.getElementById(`tabs-14-${firstInvalid}`)?.focus();
        return;
      }
    }
    setStatus("loading");
    timer.current = setTimeout(() => setStatus("paid"), 1200);
  };

  const loading = status === "loading";

  if (status === "paid") {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-2 rounded-xl border bg-card px-6 py-10 text-center text-card-foreground shadow-xs">
        <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CircleCheck aria-hidden="true" className="size-6" />
        </span>
        <h3 className="font-semibold" role="status">
          {method === "bank" ? "Transfer pending" : "Payment received"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {method === "bank"
            ? "We'll activate your plan and email billing@northwind.io as soon as $247.38 arrives."
            : "$247.38 was charged. A receipt is on its way to billing@northwind.io."}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setStatus("idle");
            setCard({ number: "", expiry: "", cvc: "" });
          }}
        >
          Back to billing
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-labelledby="tabs-14-title"
      className="flex w-full max-w-sm flex-col gap-5 rounded-xl border bg-card p-5 text-card-foreground shadow-xs"
    >
      <div className="flex flex-col gap-1">
        <h3 id="tabs-14-title" className="font-semibold">
          Payment method
        </h3>
        <p className="text-sm text-muted-foreground">
          You won't be charged until you confirm.
        </p>
      </div>

      <Tabs
        value={method}
        onValueChange={(value) => setMethod(value as Method)}
        className="gap-4"
      >
        <TabsList
          aria-label="Payment method"
          className="grid w-full grid-cols-3 gap-2 bg-transparent p-0 group-data-[orientation=horizontal]/tabs:h-auto"
        >
          {methods.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={loading}
              className="h-auto flex-col items-start gap-2 rounded-lg border-border px-3 py-2.5 data-active:border-primary data-active:bg-primary/5 data-active:shadow-none dark:data-active:border-primary dark:data-active:bg-primary/10"
            >
              <item.icon aria-hidden="true" />
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="card" className="flex flex-col gap-4">
          <Field invalid={Boolean(errors.number)} disabled={loading}>
            <FieldLabel htmlFor="tabs-14-number">Card number</FieldLabel>
            <Input
              id="tabs-14-number"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              value={card.number}
              onChange={(event) =>
                update("number", formatCardNumber(event.target.value))
              }
              aria-invalid={Boolean(errors.number) || undefined}
              className="tabular-nums"
            />
            {errors.number && <FieldError match>{errors.number}</FieldError>}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field invalid={Boolean(errors.expiry)} disabled={loading}>
              <FieldLabel htmlFor="tabs-14-expiry">Expiry</FieldLabel>
              <Input
                id="tabs-14-expiry"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                value={card.expiry}
                onChange={(event) =>
                  update("expiry", formatExpiry(event.target.value))
                }
                aria-invalid={Boolean(errors.expiry) || undefined}
                className="tabular-nums"
              />
              {errors.expiry && <FieldError match>{errors.expiry}</FieldError>}
            </Field>
            <Field invalid={Boolean(errors.cvc)} disabled={loading}>
              <FieldLabel htmlFor="tabs-14-cvc">CVC</FieldLabel>
              <Input
                id="tabs-14-cvc"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                value={card.cvc}
                onChange={(event) =>
                  update(
                    "cvc",
                    event.target.value.replace(/\D/g, "").slice(0, 4),
                  )
                }
                aria-invalid={Boolean(errors.cvc) || undefined}
                className="tabular-nums"
              />
              {errors.cvc && <FieldError match>{errors.cvc}</FieldError>}
            </Field>
          </div>
        </TabsContent>

        <TabsContent value="wallet">
          <p className="rounded-lg bg-muted/60 p-3 text-muted-foreground">
            After you confirm, a secure window opens so you can approve the
            payment with Apple Pay or Google Pay.
          </p>
        </TabsContent>

        <TabsContent value="bank" className="flex flex-col gap-3">
          <p className="text-muted-foreground">
            Pay by ACH transfer. Your plan activates once the payment clears,
            usually within 2 business days.
          </p>
          <Field>
            <FieldLabel htmlFor="tabs-14-reference">
              Payment reference
            </FieldLabel>
            <Input
              id="tabs-14-reference"
              readOnly
              value="NW-2026-0418"
              className="font-mono"
            />
            <FieldDescription>
              Include this in the memo so we can match your transfer.
            </FieldDescription>
          </Field>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col gap-2 text-sm">
        {summary.map((row) => (
          <div key={row.label} className="flex justify-between gap-3">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="tabular-nums">{row.amount}</span>
          </div>
        ))}
        <Separator className="my-1" />
        <div className="flex justify-between gap-3 font-medium">
          <span>Total due today</span>
          <span className="tabular-nums">$247.38</span>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        aria-busy={loading}
        className="w-full"
      >
        {loading ? (
          <Spinner aria-hidden="true" />
        ) : (
          <Lock aria-hidden="true" />
        )}
        {method === "bank" ? "Confirm bank transfer" : "Pay $247.38"}
      </Button>
    </form>
  );
}
