"use client";

import * as React from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";

type Country = { code: string; name: string; dial: string };

const countries: Country[] = [
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "JP", name: "Japan", dial: "+81" },
  { code: "MX", name: "Mexico", dial: "+52" },
  { code: "NL", name: "Netherlands", dial: "+31" },
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "ES", name: "Spain", dial: "+34" },
  { code: "TR", name: "Türkiye", dial: "+90" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "US", name: "United States", dial: "+1" },
];

const suggested = ["US", "GB", "DE"];

export default function Drawer12() {
  const [country, setCountry] = React.useState(countries[12]);
  const [phone, setPhone] = React.useState("");
  const [query, setQuery] = React.useState("");

  const search = query.trim().toLowerCase();
  const matches = countries.filter(
    (item) =>
      item.name.toLowerCase().includes(search) ||
      item.dial.includes(search) ||
      item.code.toLowerCase() === search,
  );
  const showSuggested = search === "";

  const renderOption = (item: Country) => {
    const selected = item.code === country.code;
    return (
      <li key={item.code}>
        <DrawerClose
          aria-current={selected ? "true" : undefined}
          onClick={() => setCountry(item)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=true]:bg-muted"
        >
          <span className="flex h-6 w-8 shrink-0 items-center justify-center rounded border bg-background text-[0.625rem] font-medium tracking-wide text-muted-foreground">
            {item.code}
          </span>
          <span className="min-w-0 flex-1 truncate">{item.name}</span>
          <span className="text-muted-foreground tabular-nums">
            {item.dial}
          </span>
          <CheckIcon
            aria-hidden="true"
            className={
              selected ? "size-4 shrink-0" : "size-4 shrink-0 opacity-0"
            }
          />
        </DrawerClose>
      </li>
    );
  };

  return (
    <div className="grid w-full max-w-xs gap-2">
      <Label htmlFor="drawer-12-phone">Mobile number</Label>
      <Drawer
        onOpenChangeComplete={(open) => {
          if (!open) setQuery("");
        }}
      >
        <InputGroup>
          <InputGroupAddon>
            <DrawerTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-1.5 gap-1 px-1.5 tabular-nums"
                  aria-label={`Country code: ${country.name} ${country.dial}`}
                />
              }
            >
              <span className="text-xs font-medium text-muted-foreground">
                {country.code}
              </span>
              {country.dial}
              <ChevronDownIcon aria-hidden="true" className="size-3.5" />
            </DrawerTrigger>
          </InputGroupAddon>
          <InputGroupInput
            id="drawer-12-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(555) 014-2290"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </InputGroup>
        <p className="text-xs text-muted-foreground">
          We text a 6-digit code to confirm it’s you.
        </p>

        <DrawerContent className="data-[swipe-axis=y]:[--drawer-height:min(34rem,calc(100dvh-6rem))]">
          <div className="mx-auto flex min-h-0 w-full max-w-sm flex-1 flex-col">
            <DrawerHeader className="gap-3 pb-3">
              <div className="grid gap-0.5">
                <DrawerTitle>Country or region</DrawerTitle>
                <DrawerDescription>
                  Choose where your phone number is registered.
                </DrawerDescription>
              </div>
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
                  aria-label="Search countries"
                  placeholder="Search by name or code"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </InputGroup>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
              {matches.length === 0 ? (
                <p
                  role="status"
                  className="px-6 py-10 text-center text-sm text-muted-foreground"
                >
                  No country matches “{query.trim()}”. Try the country name in
                  English or its dialing code.
                </p>
              ) : (
                <>
                  {showSuggested ? (
                    <section aria-labelledby="drawer-12-suggested">
                      <h3
                        id="drawer-12-suggested"
                        className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground"
                      >
                        Suggested
                      </h3>
                      <ul>
                        {countries
                          .filter((item) => suggested.includes(item.code))
                          .map(renderOption)}
                      </ul>
                    </section>
                  ) : null}
                  <section aria-labelledby="drawer-12-all">
                    <h3
                      id="drawer-12-all"
                      className="px-3 pt-3 pb-1 text-xs font-medium text-muted-foreground"
                    >
                      {showSuggested
                        ? "All countries"
                        : `${matches.length} ${matches.length === 1 ? "result" : "results"}`}
                    </h3>
                    <ul>{matches.map(renderOption)}</ul>
                  </section>
                </>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
