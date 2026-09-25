"use client";

import * as React from "react";
import { CalendarCheck, CalendarPlus, Check, Wallet } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

const details = [
  { label: "Date", value: "Thu, Oct 16" },
  { label: "Doors", value: "8:30 AM PDT" },
  { label: "Venue", value: "Pier 48, San Francisco" },
  { label: "Attendee", value: "Emma Wilson" },
];

export default function Card11() {
  const [inWallet, setInWallet] = React.useState(false);
  const [inCalendar, setInCalendar] = React.useState(false);

  return (
    <Card className="w-full max-w-xs">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Config Summit 2026
        </CardTitle>
        <CardDescription className="col-span-2">
          General admission · 2-day pass
        </CardDescription>
        <CardAction className="row-span-1">
          <Badge variant="secondary">Confirmed</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          {details.map((detail) => (
            <div key={detail.label} className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">{detail.label}</dt>
              <dd className="text-sm font-medium text-pretty">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
      {/* Perforation: a dashed rule with two notches clipped by the card's overflow-hidden edge. */}
      <div aria-hidden="true" className="relative flex items-center">
        <span className="absolute -left-2.5 size-5 rounded-full bg-background ring-1 ring-foreground/10" />
        <span className="mx-(--card-spacing) h-px flex-1 border-t border-dashed border-border" />
        <span className="absolute -right-2.5 size-5 rounded-full bg-background ring-1 ring-foreground/10" />
      </div>
      <CardContent className="flex items-center gap-4">
        <img
          src="/placeholder.svg"
          alt="Entry QR code for ticket CS26-0412-GA"
          className="size-20 shrink-0 rounded-md bg-muted object-cover"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs text-muted-foreground">Ticket number</span>
          <span className="font-mono text-sm font-medium tracking-wide">
            CS26-0412-GA
          </span>
          <span className="text-xs text-muted-foreground text-pretty">
            Show this code at the entrance. Badge pickup opens at 8:00 AM.
          </span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          className="flex-1"
          variant={inWallet ? "secondary" : "default"}
          disabled={inWallet}
          onClick={() => setInWallet(true)}
        >
          {inWallet ? (
            <Check aria-hidden="true" data-icon="inline-start" />
          ) : (
            <Wallet aria-hidden="true" data-icon="inline-start" />
          )}
          {inWallet ? "Added to wallet" : "Add to wallet"}
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={inCalendar ? "Remove from calendar" : "Add to calendar"}
          aria-pressed={inCalendar}
          onClick={() => setInCalendar((value) => !value)}
        >
          {inCalendar ? (
            <CalendarCheck aria-hidden="true" className="text-success" />
          ) : (
            <CalendarPlus aria-hidden="true" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
