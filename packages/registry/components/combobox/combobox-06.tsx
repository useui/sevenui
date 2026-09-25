"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/base/ui/combobox";
import { Label } from "@/registry/base/ui/label";

const currencies = [
  { value: "USD", label: "US Dollar", symbol: "$", rate: 1 },
  { value: "EUR", label: "Euro", symbol: "€", rate: 0.92 },
  { value: "GBP", label: "British Pound", symbol: "£", rate: 0.79 },
  { value: "JPY", label: "Japanese Yen", symbol: "¥", rate: 149.6 },
  { value: "CHF", label: "Swiss Franc", symbol: "CHF ", rate: 0.88 },
  { value: "CAD", label: "Canadian Dollar", symbol: "CA$", rate: 1.36 },
  { value: "AUD", label: "Australian Dollar", symbol: "A$", rate: 1.52 },
  { value: "TRY", label: "Turkish Lira", symbol: "₺", rate: 34.1 },
];

type Currency = (typeof currencies)[number];

const recent = ["EUR", "GBP", "JPY"];
const basePriceUsd = 48;

export default function Combobox06() {
  const [currency, setCurrency] = React.useState<Currency | null>(currencies[0]);

  const price = currency
    ? `${currency.symbol}${(basePriceUsd * currency.rate).toLocaleString("en-US", {
        maximumFractionDigits: currency.value === "JPY" ? 0 : 2,
        minimumFractionDigits: currency.value === "JPY" ? 0 : 2,
      })}`
    : "—";

  return (
    <div className="grid w-full max-w-xs gap-3">
      <div className="grid gap-2">
        <Label htmlFor="combobox-06-currency">Display currency</Label>
        <Combobox
          items={currencies}
          value={currency}
          onValueChange={setCurrency}
          itemToStringLabel={(item: Currency) => `${item.value} — ${item.label}`}
          isItemEqualToValue={(item: Currency, selected: Currency) =>
            item.value === selected.value
          }
        >
          <ComboboxInput
            id="combobox-06-currency"
            placeholder="Search currencies"
            className="w-full"
            showClear
          />
          <ComboboxContent>
            <ComboboxEmpty>No supported currency matches.</ComboboxEmpty>
            <ComboboxList>
              {(item: Currency) => (
                <ComboboxItem key={item.value} value={item}>
                  <span className="w-9 font-medium tabular-nums">{item.value}</span>
                  <span className="truncate text-muted-foreground">{item.label}</span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-0.5 text-xs text-muted-foreground">Recent</span>
        {recent.map((code) => {
          const item = currencies.find((entry) => entry.value === code);
          if (!item) return null;
          const active = currency?.value === code;
          return (
            <Button
              key={code}
              size="xs"
              variant={active ? "secondary" : "outline"}
              aria-pressed={active}
              onClick={() => setCurrency(item)}
            >
              {code}
            </Button>
          );
        })}
      </div>

      <div className="flex items-baseline justify-between rounded-lg bg-muted/50 px-3 py-2.5">
        <span className="text-sm text-muted-foreground">Pro plan, monthly</span>
        <output
          htmlFor="combobox-06-currency"
          aria-live="polite"
          className="text-sm font-medium tabular-nums"
        >
          {price}
        </output>
      </div>
    </div>
  );
}
