"use client";

import { useId, useState } from "react";
import { TagIcon, XIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Separator } from "@/registry/base/ui/separator";

const lines = [
  { id: "tote", name: "Waxed canvas tote", detail: "Olive · 1", price: 128 },
  { id: "strap", name: "Leather shoulder strap", detail: "Tan · 1", price: 42 },
];

const codes: Record<string, { label: string; percent: number }> = {
  WELCOME10: { label: "10% off your first order", percent: 10 },
  FALL25: { label: "25% off fall collection", percent: 25 },
};

const SHIPPING = 8;

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function InputGroup11() {
  const inputId = useId();
  const messageId = useId();
  const [draft, setDraft] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subtotal = lines.reduce((sum, line) => sum + line.price, 0);
  const discount = applied
    ? Math.round(subtotal * codes[applied].percent) / 100
    : 0;
  const total = subtotal - discount + SHIPPING;

  function apply() {
    const code = draft.trim().toUpperCase();
    if (!code) {
      setError("Enter a promo code first.");
      return;
    }
    if (!codes[code]) {
      setError(`"${code}" isn't a valid code or has expired.`);
      return;
    }
    setApplied(code);
    setDraft("");
    setError(null);
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold">Order summary</h3>
      <ul className="mt-4 flex flex-col gap-3">
        {lines.map((line) => (
          <li key={line.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{line.name}</p>
              <p className="text-xs text-muted-foreground">{line.detail}</p>
            </div>
            <span className="text-sm tabular-nums">
              {formatMoney(line.price)}
            </span>
          </li>
        ))}
      </ul>
      <Separator className="my-4" />
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          apply();
        }}
      >
        <label htmlFor={inputId} className="text-sm font-medium">
          Promo code
        </label>
        <InputGroup>
          <InputGroupAddon>
            <TagIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id={inputId}
            value={draft}
            placeholder="e.g. WELCOME10"
            autoComplete="off"
            spellCheck={false}
            className="uppercase placeholder:normal-case"
            aria-invalid={error ? true : undefined}
            aria-describedby={messageId}
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) setError(null);
            }}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton type="submit" variant="secondary">
              Apply
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <div id={messageId} aria-live="polite">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : applied ? (
            <div className="flex items-center justify-between gap-2 rounded-md bg-muted/60 py-1 pr-1 pl-2.5 text-sm">
              <span className="min-w-0 truncate">
                <span className="font-medium">{applied}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {codes[applied].label}
                </span>
              </span>
              <button
                type="button"
                aria-label={`Remove code ${applied}`}
                onClick={() => setApplied(null)}
                className="grid size-6 shrink-0 place-items-center rounded-sm text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <XIcon aria-hidden="true" className="size-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Try WELCOME10 or FALL25. One code per order.
            </p>
          )}
        </div>
      </form>
      <Separator className="my-4" />
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{formatMoney(subtotal)}</dd>
        </div>
        {applied ? (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="text-success tabular-nums">
              −{formatMoney(discount)}
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="tabular-nums">{formatMoney(SHIPPING)}</dd>
        </div>
        <div className="mt-1 flex justify-between border-t border-border pt-3 font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatMoney(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
