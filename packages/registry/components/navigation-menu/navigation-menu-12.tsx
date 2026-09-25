"use client";

import { cn } from "cn";
import {
  ArrowRight,
  CalendarClock,
  Inbox,
  Megaphone,
  Route,
  Users,
  Workflow,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/registry/base/ui/navigation-menu";

const features = [
  {
    icon: Inbox,
    title: "Shared inbox",
    body: "Email, chat, and WhatsApp in one queue.",
  },
  {
    icon: Route,
    title: "Smart routing",
    body: "Assign by skill, language, or workload.",
  },
  {
    icon: Workflow,
    title: "Automations",
    body: "Close repetitive tickets without a human.",
  },
  {
    icon: CalendarClock,
    title: "SLA tracking",
    body: "Warn agents before a deadline slips.",
  },
];

const solutions = [
  {
    icon: Users,
    title: "Support teams",
    body: "Resolve faster with macros and context.",
  },
  {
    icon: Megaphone,
    title: "Success teams",
    body: "Spot at-risk accounts from ticket trends.",
  },
];

export default function NavigationMenu12() {
  return (
    <header className="flex w-full max-w-3xl items-center justify-between gap-2 rounded-xl border bg-background px-3 py-2">
      <span className="hidden text-sm font-semibold sm:inline">Relaydesk</span>
      <NavigationMenu aria-label="Main">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Product</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-72 gap-2 p-1 sm:w-[34rem] sm:grid-cols-[1fr_13rem]">
                <ul className="grid gap-0.5">
                  {features.map((feature) => (
                    <li key={feature.title}>
                      <NavigationMenuLink
                        closeOnClick
                        href={`#${feature.title.toLowerCase().replace(" ", "-")}`}
                        className="items-start gap-3"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
                          <feature.icon aria-hidden="true" />
                        </span>
                        <span className="flex flex-col">
                          <span className="font-medium">{feature.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {feature.body}
                          </span>
                        </span>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
                <NavigationMenuLink
                  closeOnClick
                  href="#changelog"
                  className="hidden flex-col items-start justify-between gap-6 bg-muted p-4 sm:flex"
                >
                  <span className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      New in September
                    </span>
                    <span className="text-base leading-snug font-semibold text-balance">
                      AI drafts that cite your help center
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Every suggested reply links the article it came from, so
                      agents can check before sending.
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium">
                    Read the changelog
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </span>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-72 gap-0.5 p-1">
                {solutions.map((solution) => (
                  <li key={solution.title}>
                    <NavigationMenuLink
                      closeOnClick
                      href={`#${solution.title.toLowerCase().replace(" ", "-")}`}
                      className="items-start gap-3"
                    >
                      <solution.icon
                        className="mt-0.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="flex flex-col">
                        <span className="font-medium">{solution.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {solution.body}
                        </span>
                      </span>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem className="hidden md:block">
            <NavigationMenuLink
              href="#pricing"
              className={cn(navigationMenuTriggerStyle(), "flex-row")}
            >
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
          Sign in
        </Button>
        <Button size="sm">
          <span className="sm:hidden">Try free</span>
          <span className="hidden sm:inline">Start free trial</span>
        </Button>
      </div>
    </header>
  );
}
