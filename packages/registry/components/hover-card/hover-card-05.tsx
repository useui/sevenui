"use client";

import * as React from "react";
import { CircleAlertIcon, PlaneIcon, RotateCwIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";
import { Skeleton } from "@/registry/base/ui/skeleton";

type Flight = {
  number: string;
  from: { code: string; city: string; time: string };
  to: { code: string; city: string; time: string };
  gate: string;
  status: string;
  delayed?: boolean;
  // Simulates a flaky request: the first fetch fails, the retry succeeds.
  failsFirst?: boolean;
};

type LoadState = "idle" | "loading" | "ready" | "error";

const flights: Flight[] = [
  {
    number: "NW 1403",
    from: { code: "FRA", city: "Frankfurt", time: "07:15" },
    to: { code: "LIS", city: "Lisbon", time: "09:20" },
    gate: "B44",
    status: "On time",
  },
  {
    number: "NW 2218",
    from: { code: "LIS", city: "Lisbon", time: "14:05" },
    to: { code: "OPO", city: "Porto", time: "15:30" },
    gate: "12",
    status: "Delayed 25 min",
    delayed: true,
  },
  {
    number: "NW 1407",
    from: { code: "OPO", city: "Porto", time: "18:40" },
    to: { code: "FRA", city: "Frankfurt", time: "22:35" },
    gate: "Not assigned",
    status: "Scheduled",
    failsFirst: true,
  },
];

function FlightReference({ flight }: { flight: Flight }) {
  const [state, setState] = React.useState<LoadState>("idle");
  const attempts = React.useRef(0);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function load() {
    if (timer.current) clearTimeout(timer.current);
    setState("loading");
    timer.current = setTimeout(() => {
      attempts.current += 1;
      setState(flight.failsFirst && attempts.current === 1 ? "error" : "ready");
    }, 900);
  }

  return (
    <HoverCard
      onOpenChange={(open) => {
        if (open && (state === "idle" || state === "error")) load();
      }}
    >
      <HoverCardTrigger
        href={`#flight-${flight.number.replace(" ", "")}`}
        className="rounded-sm font-medium whitespace-nowrap text-foreground underline decoration-muted-foreground/60 underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:decoration-foreground"
      >
        {flight.number}
      </HoverCardTrigger>
      <HoverCardContent className="w-72 p-3">
        <div aria-live="polite" aria-busy={state === "loading"}>
          {state === "loading" || state === "idle" ? (
            <div className="flex flex-col gap-2.5">
              <span className="sr-only">
                Loading live status for {flight.number}
              </span>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-7 w-14" />
                <Skeleton className="h-px flex-1" />
                <Skeleton className="h-7 w-14" />
              </div>
              <Skeleton className="h-3 w-32" />
            </div>
          ) : state === "error" ? (
            <div className="flex flex-col items-start gap-2">
              <span className="inline-flex items-center gap-1.5 font-medium text-destructive">
                <CircleAlertIcon className="size-4" aria-hidden="true" />
                Couldn&apos;t load {flight.number}
              </span>
              <p className="text-muted-foreground">
                The flight status service didn&apos;t respond. Your booking is
                not affected.
              </p>
              <Button variant="outline" size="xs" onClick={load}>
                <RotateCwIcon aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {flight.number} · Thu, Oct 8
                </span>
                <Badge variant={flight.delayed ? "destructive" : "secondary"}>
                  {flight.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-lg font-semibold tabular-nums">
                    {flight.from.time}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {flight.from.code} · {flight.from.city}
                  </span>
                </div>
                <PlaneIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <div className="flex flex-col items-end">
                  <span className="text-lg font-semibold tabular-nums">
                    {flight.to.time}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {flight.to.city} · {flight.to.code}
                  </span>
                </div>
              </div>
              <p className="border-t pt-2 text-xs text-muted-foreground">
                Departure gate{" "}
                <span className="font-medium text-foreground">
                  {flight.gate}
                </span>
              </p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function HoverCard05() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-xl border border-border bg-card p-4 text-sm text-card-foreground">
      <span className="font-medium">Offsite travel, Oct 8</span>
      <ul className="flex flex-col gap-2 text-muted-foreground">
        <li>
          Morning: fly out on <FlightReference flight={flights[0]} />
        </li>
        <li>
          Afternoon: hop to Porto on <FlightReference flight={flights[1]} />
        </li>
        <li>
          Evening: head home on <FlightReference flight={flights[2]} />
        </li>
      </ul>
      <p className="text-xs text-muted-foreground">
        Live status loads on first hover. NW 1407 fails once to show the error
        state.
      </p>
    </div>
  );
}
