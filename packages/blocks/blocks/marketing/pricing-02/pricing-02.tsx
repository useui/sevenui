"use client";

import * as React from "react";

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
import { Tabs, TabsList, TabsTrigger } from "@/registry/base/ui/tabs";

const tiers = [
  {
    name: "Starter",
    monthly: 9,
    yearly: 90,
    description: "For individuals.",
    features: ["1 project", "Email support"],
    highlighted: false,
  },
  {
    name: "Team",
    monthly: 29,
    yearly: 290,
    description: "For growing teams.",
    features: ["Unlimited projects", "Priority support", "Shared licenses"],
    highlighted: true,
  },
  {
    name: "Business",
    monthly: 79,
    yearly: 790,
    description: "For whole orgs.",
    features: ["Everything in Team", "SSO", "Invoiced billing"],
    highlighted: false,
  },
];

export default function Pricing02() {
  const [billing, setBilling] = React.useState<"monthly" | "yearly">("monthly");
  const yearly = billing === "yearly";
  return (
    <section className="w-full px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Pricing that scales with you</h2>
        <Tabs
          value={billing}
          onValueChange={(value) => setBilling(value as "monthly" | "yearly")}
        >
          <TabsList aria-label="Billing period">
            {/* flex-none: the default flex-1 splits the w-fit list into equal
                halves, which the wider yearly tab overflows. */}
            <TabsTrigger value="monthly" className="flex-none px-3">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" className="flex-none px-3">
              Yearly
              <Badge variant="outline" className="ml-1.5">
                2 months free
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={tier.highlighted ? "border-primary shadow-sm" : undefined}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{tier.name}</CardTitle>
                {tier.highlighted ? <Badge>Popular</Badge> : null}
              </div>
              <CardDescription>{tier.description}</CardDescription>
              <p className="pt-2 text-3xl font-semibold tabular-nums">
                ${yearly ? tier.yearly : tier.monthly}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / {yearly ? "year" : "month"}
                </span>
              </p>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2.5 text-sm text-muted-foreground">
                {tier.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                variant={tier.highlighted ? "default" : "outline"}
                className="w-full"
              >
                {`Choose ${tier.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
