"use client";

import * as React from "react";
import { CreditCardIcon, RefreshCwIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

const plan = {
  name: "Team plan",
  price: "$96.00",
  cycle: "Billed monthly for 8 seats",
  card: "Visa ending in 4242",
  failedOn: "Sep 22",
  retryOn: "Sep 29",
};

export default function Alert11() {
  const [retried, setRetried] = React.useState(false);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.cycle}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {retried ? (
          <Alert aria-live="polite">
            <RefreshCwIcon aria-hidden="true" />
            <AlertTitle>Retry scheduled</AlertTitle>
            <AlertDescription>
              We will charge {plan.card} again within the next hour and email
              the receipt to billing@northwind.io.
            </AlertDescription>
            <AlertAction>
              <Button size="xs" variant="ghost" onClick={() => setRetried(false)}>
                Cancel
              </Button>
            </AlertAction>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <CreditCardIcon aria-hidden="true" />
            <AlertTitle>Your {plan.failedOn} payment was declined</AlertTitle>
            <AlertDescription>
              <p>
                The bank declined the {plan.price} charge to {plan.card}. Update
                your card before {plan.retryOn} to keep all 8 seats active.
              </p>
            </AlertDescription>
            <div className="col-start-2 mt-2 flex flex-wrap gap-2">
              <Button size="sm">Update payment method</Button>
              <Button size="sm" variant="outline" onClick={() => setRetried(true)}>
                Retry charge
              </Button>
            </div>
          </Alert>
        )}
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Amount due</dt>
          <dd className="text-right font-medium tabular-nums">{plan.price}</dd>
          <dt className="text-muted-foreground">Next attempt</dt>
          <dd className="text-right tabular-nums">{plan.retryOn}</dd>
        </dl>
      </CardContent>
      <CardFooter className="border-t text-xs text-muted-foreground">
        Seats become read-only if the balance stays unpaid for 14 days.
      </CardFooter>
    </Card>
  );
}
