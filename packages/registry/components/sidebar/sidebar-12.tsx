"use client";

import * as React from "react";
import { CheckIcon, LockIcon, PartyPopperIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { Progress } from "@/registry/base/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/registry/base/ui/sidebar";

const steps = [
  {
    id: "product",
    title: "Add your first product",
    summary: "Name it and set a price",
    body: "Shoppers need something to buy. You can add photos and variants later.",
    field: "Product name",
    placeholder: "Ethiopia Guji, 250 g",
  },
  {
    id: "payments",
    title: "Accept card payments",
    summary: "Where payouts should land",
    body: "Payouts arrive two business days after each order is captured.",
    field: "Payout account holder",
    placeholder: "Fernway Coffee Roasters LLC",
  },
  {
    id: "shipping",
    title: "Set a shipping rate",
    summary: "One flat rate to start",
    body: "A single flat rate covers most small shops. Zones come later.",
    field: "Flat rate (USD)",
    placeholder: "6.50",
  },
  {
    id: "domain",
    title: "Choose your store address",
    summary: "Your public URL",
    body: "This is where customers will find you. Connect a custom domain any time.",
    field: "Store subdomain",
    placeholder: "fernway",
  },
];

export default function Sidebar12() {
  const [current, setCurrent] = React.useState(1);
  const [furthest, setFurthest] = React.useState(1);
  const [published, setPublished] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, string>>({
    product: "Ethiopia Guji, 250 g",
  });

  const completed = Math.min(furthest, steps.length);
  const done = current >= steps.length;
  const step = steps[Math.min(current, steps.length - 1)];
  const value = values[step.id] ?? "";
  const subdomain = values.domain?.trim() || "fernway";

  function next(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) return;
    setFurthest((count) => Math.max(count, current + 1));
    setCurrent((index) => index + 1);
  }

  return (
    <div className="@container w-full max-w-3xl overflow-hidden rounded-xl border bg-background">
      <SidebarProvider className="min-h-0 flex-col @xl:h-[420px] @xl:flex-row">
        <Sidebar
          collapsible="none"
          role="navigation"
          aria-label="Setup steps"
          className="w-full border-b @xl:w-64 @xl:border-r @xl:border-b-0"
        >
          <SidebarHeader className="gap-3 p-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold">Set up Fernway</p>
              <p className="text-xs text-sidebar-foreground/70">
                {completed} of {steps.length} steps complete
              </p>
            </div>
            <Progress
              value={(completed / steps.length) * 100}
              aria-label="Setup progress"
            />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup className="pt-0">
              <SidebarGroupContent>
                <SidebarMenu aria-label="Setup steps" className="gap-1">
                  {steps.map((item, index) => {
                    const isDone = index < furthest;
                    const isCurrent = index === current;
                    const isLocked = index > furthest;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          size="lg"
                          isActive={isCurrent}
                          aria-current={isCurrent ? "step" : undefined}
                          aria-disabled={isLocked || undefined}
                          disabled={isLocked}
                          onClick={() => setCurrent(index)}
                        >
                          <span
                            aria-hidden="true"
                            className={
                              isDone
                                ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                                : "flex size-6 shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-xs font-medium tabular-nums"
                            }
                          >
                            {isDone ? (
                              <CheckIcon className="size-3.5!" />
                            ) : isLocked ? (
                              <LockIcon className="size-3! text-sidebar-foreground/60" />
                            ) : (
                              index + 1
                            )}
                          </span>
                          <span className="grid min-w-0 flex-1 leading-tight">
                            <span className="truncate font-medium">{item.title}</span>
                            <span className="truncate text-xs text-sidebar-foreground/70">
                              {isDone ? values[item.id] || item.summary : item.summary}
                            </span>
                          </span>
                          <span className="sr-only">
                            {isDone ? "Completed" : isLocked ? "Locked" : "Up next"}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="hidden px-4 pb-4 @xl:flex">
            <p className="text-xs text-sidebar-foreground/70">
              Steps unlock in order. Revisit any finished step to edit it.
            </p>
          </SidebarFooter>
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col p-4 @xl:p-8" aria-live="polite">
          {done ? (
            <div className="m-auto flex max-w-xs flex-col items-center gap-3 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                <PartyPopperIcon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="text-base font-semibold">
                {published ? "Your store is live" : "Your store is ready to launch"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {published
                  ? `Customers can now shop at ${subdomain}.shop. Changes you make publish instantly.`
                  : `${subdomain}.shop goes live as soon as you publish. You can keep editing afterwards.`}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrent(steps.length - 1)}>
                  {published ? "Edit setup" : "Review"}
                </Button>
                {published ? (
                  <Button variant="ghost" onClick={() => setPublished(false)}>
                    Unpublish
                  </Button>
                ) : (
                  <Button onClick={() => setPublished(true)}>Publish store</Button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={next} className="flex max-w-sm flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground tabular-nums">
                  Step {current + 1} of {steps.length}
                </p>
                <h2 className="text-lg font-semibold text-balance">{step.title}</h2>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`sidebar-12-${step.id}`}>{step.field}</Label>
                <Input
                  id={`sidebar-12-${step.id}`}
                  placeholder={step.placeholder}
                  value={value}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [step.id]: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={!value.trim()}>
                  {current === steps.length - 1 ? "Finish setup" : "Save and continue"}
                </Button>
                {current > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrent((index) => index - 1)}
                  >
                    Back
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </SidebarProvider>
    </div>
  );
}
