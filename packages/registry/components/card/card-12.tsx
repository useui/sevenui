"use client";

import { ArrowUpRight, TriangleAlert } from "lucide-react";

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
import { Meter, MeterLabel } from "@/registry/base/ui/meter";

const quotas = [
  {
    id: "requests",
    label: "API requests",
    used: 842_300,
    limit: 1_000_000,
    format: (value: number) => `${(value / 1000).toFixed(0)}k`,
  },
  {
    id: "storage",
    label: "Storage",
    used: 38.4,
    limit: 50,
    format: (value: number) => `${value} GB`,
  },
  {
    id: "seats",
    label: "Seats",
    used: 10,
    limit: 10,
    format: (value: number) => `${value}`,
  },
];

export default function Card12() {
  const atLimit = quotas.filter((quota) => quota.used >= quota.limit);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Usage this cycle</CardTitle>
        <CardDescription className="col-span-2">
          Pro plan · Resets on Oct 1
        </CardDescription>
        <CardAction className="row-span-1">
          <Badge variant="outline">12 days left</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {quotas.map((quota) => {
          const percent = Math.round((quota.used / quota.limit) * 100);
          const text = `${quota.format(quota.used)} of ${quota.format(quota.limit)}`;

          return (
            <Meter
              key={quota.id}
              value={quota.used}
              max={quota.limit}
              getAriaValueText={() => `${text}, ${percent}% used`}
              className="grid-cols-[1fr_auto] gap-y-1.5"
            >
              <MeterLabel>{quota.label}</MeterLabel>
              <span className="text-sm text-muted-foreground tabular-nums">
                {text}
              </span>
            </Meter>
          );
        })}
        {atLimit.length > 0 ? (
          <p className="flex items-start gap-2 rounded-lg bg-warning/10 p-2.5 text-xs text-foreground">
            <TriangleAlert
              aria-hidden="true"
              className="mt-px size-3.5 shrink-0 text-warning"
            />
            <span>
              All {atLimit[0].limit} seats are taken. New invites will stay
              pending until you add seats.
            </span>
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          Next invoice{" "}
          <span className="font-medium text-foreground tabular-nums">
            $240.00
          </span>
        </span>
        <Button size="sm">
          Upgrade plan
          <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  );
}
