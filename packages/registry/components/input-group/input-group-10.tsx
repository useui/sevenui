"use client";

import { useId, useState } from "react";
import { ArrowRightLeftIcon, ChevronDownIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";

// Static sample rates, USD per 1 unit of each currency.
const currencies = [
  { code: "USD", name: "US dollar", symbol: "$", rate: 1 },
  { code: "EUR", name: "Euro", symbol: "€", rate: 1.09 },
  { code: "GBP", name: "British pound", symbol: "£", rate: 1.27 },
  { code: "JPY", name: "Japanese yen", symbol: "¥", rate: 0.0067 },
] as const;

type CurrencyCode = (typeof currencies)[number]["code"];

function getCurrency(code: CurrencyCode) {
  return currencies.find((currency) => currency.code === code) ?? currencies[0];
}

export default function InputGroup10() {
  const id = useId();
  const [code, setCode] = useState<CurrencyCode>("EUR");
  const [amount, setAmount] = useState("2,500.00");

  const currency = getCurrency(code);
  const numeric = Number.parseFloat(amount.replace(/,/g, ""));
  const inUsd = Number.isFinite(numeric)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(numeric * currency.rate)
    : "—";

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor={`${id}-amount`}>Invoice amount</Label>
      <InputGroup>
        <InputGroupAddon>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <InputGroupButton
                  variant="ghost"
                  aria-label={`${currency.code}, change currency`}
                  className="font-medium"
                />
              }
            >
              {currency.code}
              <ChevronDownIcon aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Billing currency</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={code}
                  onValueChange={(value) => setCode(value as CurrencyCode)}
                >
                  {currencies.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.code}
                      value={option.code}
                      closeOnClick
                    >
                      <span className="w-4 text-muted-foreground">
                        {option.symbol}
                      </span>
                      {option.name}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {option.code}
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <InputGroupText aria-hidden="true" className="-mr-1 border-l pl-2">
            {currency.symbol}
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          id={`${id}-amount`}
          inputMode="decimal"
          value={amount}
          aria-describedby={`${id}-amount-converted`}
          className="tabular-nums"
          onChange={(event) =>
            setAmount(event.target.value.replace(/[^\d.,]/g, ""))
          }
        />
      </InputGroup>
      <p
        id={`${id}-amount-converted`}
        aria-live="polite"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <ArrowRightLeftIcon aria-hidden="true" className="size-3.5" />
        <span>
          About <span className="font-medium text-foreground tabular-nums">{inUsd}</span>{" "}
          at today’s sample rate
        </span>
      </p>
    </div>
  );
}
