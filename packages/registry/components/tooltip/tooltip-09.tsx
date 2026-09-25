"use client";

import { InfoIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Separator } from "@/registry/base/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const lineItems = [
  {
    label: "Team plan",
    detail: "12 seats × $18",
    amount: "$216.00",
    help: "Seats are billed for every member with Editor or Admin access. Viewers are free.",
  },
  {
    label: "Build minutes overage",
    detail: "1,420 min over 5,000",
    amount: "$14.20",
    help: "Minutes past your plan's included 5,000 are billed at $0.01 each, rounded to the nearest minute.",
  },
  {
    label: "Proration credit",
    detail: "2 seats removed Sep 14",
    amount: "−$19.20",
    help: "Removing seats mid-cycle credits the unused days back to your next invoice.",
  },
];

export default function Tooltip09() {
  return (
    <TooltipProvider>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Upcoming invoice</CardTitle>
          <CardDescription>Billing period Sep 1 – Sep 30, 2026</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ul className="flex flex-col gap-3">
            {lineItems.map((item) => (
              <li
                key={item.label}
                className="flex items-start justify-between gap-4"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{item.label}</span>
                    <Tooltip>
                      <TooltipTrigger
                        aria-label={`About ${item.label}`}
                        className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <InfoIcon className="size-3.5" aria-hidden="true" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-60 text-left">
                        {item.help}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.detail}
                  </span>
                </div>
                <span className="text-sm tabular-nums">{item.amount}</span>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estimated total</span>
            <span className="text-base font-semibold tabular-nums">
              $211.00
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            Charged Oct 1 to{" "}
            <span className="whitespace-nowrap">Visa ·· 4242</span>
          </span>
          <Button variant="outline" size="sm">
            View usage
          </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
