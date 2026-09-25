"use client";

import * as React from "react";
import { cn } from "cn";
import { CheckIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/registry/base/ui/carousel";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Billing = "monthly" | "yearly";

const seats = 5;

const plans = [
  {
    id: "starter",
    name: "Starter",
    monthly: 0,
    yearly: 0,
    blurb: "For side projects and trying things out.",
    features: ["3 projects", "7-day history", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 12,
    yearly: 10,
    blurb: "For small teams shipping every week.",
    features: ["Unlimited projects", "90-day history", "Email support"],
    recommended: true,
  },
  {
    id: "business",
    name: "Business",
    monthly: 24,
    yearly: 20,
    blurb: "For companies that need controls and audit trails.",
    features: ["SAML single sign-on", "Unlimited history", "Audit log export"],
  },
];

export default function Carousel10() {
  const [billing, setBilling] = React.useState<Billing>("yearly");
  const [selectedId, setSelectedId] = React.useState("pro");
  const [currentPlanId, setCurrentPlanId] = React.useState("starter");
  const [api, setApi] = React.useState<CarouselApi>();

  const selected = plans.find((plan) => plan.id === selectedId) ?? plans[1];
  const perSeat = selected[billing];
  const total = billing === "yearly" ? perSeat * seats * 12 : perSeat * seats;
  const isCurrent = selected.id === currentPlanId;
  const currentPlan =
    plans.find((plan) => plan.id === currentPlanId) ?? plans[0];

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="font-medium" id="carousel-10-title">
            Change plan
          </h3>
          <p className="text-sm text-muted-foreground">
            Acme Studio · {seats} seats
          </p>
        </div>
        <ToggleGroup
          aria-label="Billing period"
          variant="outline"
          size="sm"
          spacing={0}
          value={[billing]}
          onValueChange={(next) => {
            if (next.length > 0) setBilling(next[0] as Billing);
          }}
        >
          <ToggleGroupItem
            value="monthly"
            className="aria-pressed:bg-accent aria-pressed:text-accent-foreground"
          >
            Monthly
          </ToggleGroupItem>
          <ToggleGroupItem
            value="yearly"
            className="aria-pressed:bg-accent aria-pressed:text-accent-foreground"
          >
            Yearly −17%
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Centered so the plans on either side peek in; clicking one brings
          it to the middle. */}
      <Carousel
        setApi={setApi}
        aria-labelledby="carousel-10-title"
        opts={{ align: "center", startIndex: 1 }}
      >
        <CarouselContent className="-ml-3 py-1">
          {plans.map((plan, index) => {
            const active = plan.id === selectedId;
            return (
              <CarouselItem
                key={plan.id}
                className="basis-[82%] pl-3 sm:basis-[62%]"
              >
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelectedId(plan.id);
                    api?.scrollTo(index);
                  }}
                  className={cn(
                    "flex h-full w-full flex-col gap-4 rounded-xl border bg-card p-4 text-left text-card-foreground outline-none transition-[border-color,box-shadow] focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "border-primary ring-1 ring-primary"
                      : "hover:border-foreground/30",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">{plan.name}</span>
                    {plan.id === currentPlanId ? (
                      <Badge variant="outline">Current</Badge>
                    ) : plan.recommended ? (
                      <Badge variant="secondary">Most teams</Badge>
                    ) : null}
                  </span>
                  <span className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tabular-nums">
                      ${plan[billing]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      per seat / month
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.blurb}
                  </span>
                  <span className="flex flex-col gap-1.5 text-sm">
                    {plan.features.map((feature) => (
                      <span key={feature} className="flex items-center gap-2">
                        <CheckIcon
                          aria-hidden="true"
                          className="size-3.5 text-muted-foreground"
                        />
                        {feature}
                      </span>
                    ))}
                  </span>
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted px-4 py-3">
        <p className="text-sm" aria-live="polite">
          {isCurrent ? (
            <span className="text-muted-foreground">
              You&apos;re on {selected.name}.
            </span>
          ) : (
            <>
              <span className="font-medium">{selected.name}</span>
              <span className="text-muted-foreground">
                {" "}
                · ${total.toLocaleString("en-US")} billed{" "}
                {billing === "yearly" ? "yearly" : "monthly"}
              </span>
            </>
          )}
        </p>
        <Button
          disabled={isCurrent}
          onClick={() => setCurrentPlanId(selected.id)}
        >
          {isCurrent
            ? "Current plan"
            : selected.monthly < currentPlan.monthly
              ? `Downgrade to ${selected.name}`
              : `Upgrade to ${selected.name}`}
        </Button>
      </div>
    </div>
  );
}
