"use client";

import { useState } from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Label } from "@/registry/base/ui/label";
import { Separator } from "@/registry/base/ui/separator";
import { Slider } from "@/registry/base/ui/slider";
import { Switch } from "@/registry/base/ui/switch";

const INITIAL_SEATS = 12;
const MEMBERS = 11;
const MAX_SEATS = 100;
const ANNUAL_DISCOUNT = 0.2;

const tiers = [
  { from: 1, to: 10, price: 14, name: "Starter" },
  { from: 11, to: 50, price: 12, name: "Growth" },
  { from: 51, to: MAX_SEATS, price: 10, name: "Scale" },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function tierFor(seats: number) {
  return (
    tiers.find((tier) => seats >= tier.from && seats <= tier.to) ?? tiers[0]
  );
}

export default function Slider13() {
  const [currentSeats, setCurrentSeats] = useState(INITIAL_SEATS);
  const [seats, setSeats] = useState(INITIAL_SEATS);
  const [annual, setAnnual] = useState(true);

  const tier = tierFor(seats);
  const perSeat = annual ? tier.price * (1 - ANNUAL_DISCOUNT) : tier.price;
  const monthly = perSeat * seats;
  const delta = seats - currentSeats;
  const belowMembers = seats < MEMBERS;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle id="slider-13-title">Team seats</CardTitle>
        <CardDescription>
          You use {MEMBERS} of {currentSeats} seats. Pricing drops as your team
          grows.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-3xl font-semibold tabular-nums">
              {seats}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                {seats === 1 ? "seat" : "seats"}
              </span>
            </p>
            <Badge variant="secondary">{tier.name} tier</Badge>
          </div>
          <Slider
            aria-labelledby="slider-13-title"
            value={[seats]}
            min={1}
            max={MAX_SEATS}
            largeStep={10}
            onValueChange={(value) =>
              setSeats(Array.isArray(value) ? (value[0] ?? 1) : value)
            }
          />
          <ol className="grid grid-cols-[10fr_40fr_50fr] gap-1 text-[0.7rem]">
            {tiers.map((item) => {
              const active = item === tier;
              return (
                <li
                  key={item.name}
                  className={`flex flex-col gap-0.5 border-t-2 pt-1.5 ${active ? "border-primary text-foreground" : "border-border text-muted-foreground"}`}
                >
                  <span className="font-medium">${item.price}</span>
                  <span className="truncate">
                    {item.from}–{item.to}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label
            htmlFor="slider-13-annual"
            className="flex flex-col items-start gap-0.5"
          >
            <span>Annual billing</span>
            <span className="text-xs font-normal text-muted-foreground">
              Save 20% on every seat
            </span>
          </Label>
          <Switch
            id="slider-13-annual"
            checked={annual}
            onCheckedChange={setAnnual}
          />
        </div>

        <Separator />

        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Per seat, monthly</dt>
            <dd className="tabular-nums">
              {currency.format(perSeat)}
              {annual ? (
                <span className="ml-1.5 text-muted-foreground line-through">
                  {currency.format(tier.price)}
                </span>
              ) : null}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              {annual ? "Billed yearly" : "Billed monthly"}
            </dt>
            <dd className="tabular-nums">
              {currency.format(annual ? monthly * 12 : monthly)}
            </dd>
          </div>
          <div className="flex justify-between font-medium">
            <dt>Monthly equivalent</dt>
            <dd className="tabular-nums" aria-live="polite">
              {currency.format(monthly)}
            </dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-2">
        <Button
          disabled={delta === 0 || belowMembers}
          onClick={() => setCurrentSeats(seats)}
        >
          {delta === 0
            ? "No changes"
            : delta > 0
              ? `Add ${delta} ${delta === 1 ? "seat" : "seats"}`
              : `Remove ${-delta} ${delta === -1 ? "seat" : "seats"}`}
        </Button>
        <p
          className={`text-center text-xs ${belowMembers ? "text-destructive" : "text-muted-foreground"}`}
        >
          {belowMembers
            ? `Remove ${MEMBERS - seats} ${MEMBERS - seats === 1 ? "member" : "members"} before dropping below ${MEMBERS} seats.`
            : "Changes are prorated to your next invoice on Oct 1."}
        </p>
      </CardFooter>
    </Card>
  );
}
