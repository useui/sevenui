"use client";

import * as React from "react";
import { Check } from "lucide-react";

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
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Cycle = "monthly" | "yearly";

const pricing: Record<Cycle, { perSeat: number; note: string }> = {
  monthly: { perSeat: 18, note: "Billed monthly. Cancel anytime." },
  yearly: { perSeat: 14, note: "Billed $168 per seat once a year." },
};

const features = [
  "Unlimited projects and guests",
  "Version history for 365 days",
  "SAML single sign-on",
];

export default function ToggleGroup07() {
  const [cycle, setCycle] = React.useState<Cycle>("yearly");
  const plan = pricing[cycle];

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Team plan</CardTitle>
        <CardDescription>For growing teams shipping every week.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <ToggleGroup
          aria-label="Billing cycle"
          variant="outline"
          spacing={0}
          value={[cycle]}
          onValueChange={(next) => {
            if (next[0]) setCycle(next[0] as Cycle);
          }}
          className="w-full"
        >
          <ToggleGroupItem value="monthly" className="flex-1">
            Monthly
          </ToggleGroupItem>
          <ToggleGroupItem value="yearly" className="flex-1 gap-2">
            Yearly
            <Badge variant="secondary" className="h-4 px-1.5 text-[0.65rem]">
              Save 22%
            </Badge>
          </ToggleGroupItem>
        </ToggleGroup>
        <div aria-live="polite" className="flex flex-col gap-1">
          <p className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold tracking-tight tabular-nums">
              ${plan.perSeat}
            </span>
            <span className="text-sm text-muted-foreground">
              per seat / month
            </span>
          </p>
          <p className="text-xs text-muted-foreground">{plan.note}</p>
        </div>
        <ul className="flex flex-col gap-2 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="size-4 text-primary" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          {cycle === "yearly" ? "Start yearly plan" : "Start monthly plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
