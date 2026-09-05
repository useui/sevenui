import { CheckIcon } from "lucide-react";

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
import { Separator } from "@/registry/base/ui/separator";

const tiers = [
  {
    name: "Hobby",
    price: "$0",
    description: "For side projects and evaluation.",
    features: ["All free components", "All free blocks", "Community support"],
    cta: "Start for free",
    variant: "outline" as const,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For teams shipping to production.",
    features: [
      "Everything in Hobby",
      "Pro blocks and templates",
      "Priority fixes",
      "Private updates feed",
    ],
    cta: "Get Pro",
    variant: "default" as const,
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For orgs with procurement needs.",
    features: ["Everything in Pro", "License review", "Invoiced billing"],
    cta: "Contact us",
    variant: "outline" as const,
    highlighted: false,
  },
];

export default function Pricing01() {
  return (
    <section className="w-full bg-background px-6 py-16">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Simple pricing</h2>
        <p className="mt-2 text-muted-foreground">
          Free to start. Upgrade when the blocks pay for themselves.
        </p>
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
              <p className="pt-2 text-3xl font-semibold">
                {tier.price}
                {tier.price.startsWith("$") ? (
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / month
                  </span>
                ) : null}
              </p>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <ul className="grid gap-2.5 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckIcon
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="size-4 shrink-0 text-primary"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant={tier.variant} className="w-full">
                {tier.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
