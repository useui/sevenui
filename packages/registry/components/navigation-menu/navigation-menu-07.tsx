"use client";

import { cn } from "cn";

import { Badge } from "@/registry/base/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/registry/base/ui/navigation-menu";

const compact = "h-7 rounded-md px-2 text-xs";

const services = [
  { href: "#api", name: "API", status: "operational" },
  { href: "#dashboard", name: "Dashboard", status: "operational" },
  { href: "#webhooks", name: "Webhooks", status: "degraded" },
  { href: "#exports", name: "CSV exports", status: "outage" },
] as const;

const statusStyles = {
  operational: { dot: "bg-success", label: "Operational" },
  degraded: { dot: "bg-warning", label: "Degraded" },
  outage: { dot: "bg-destructive", label: "Outage" },
};

export default function NavigationMenu07() {
  return (
    <NavigationMenu
      aria-label="Console"
      className="rounded-lg border border-border bg-card p-1"
    >
      <NavigationMenuList className="flex-wrap gap-0.5">
        <NavigationMenuItem>
          <NavigationMenuTrigger className={compact}>Status</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[min(15rem,calc(100vw-2rem))] gap-0.5">
              {services.map((service) => {
                const style = statusStyles[service.status];
                return (
                  <li key={service.href}>
                    <NavigationMenuLink
                      closeOnClick
                      href={service.href}
                      className="justify-between px-2 py-1.5 text-xs"
                    >
                      <span>{service.name}</span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span
                          aria-hidden="true"
                          className={cn("size-1.5 rounded-full", style.dot)}
                        />
                        {style.label}
                      </span>
                    </NavigationMenuLink>
                  </li>
                );
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#logs"
            className={cn(navigationMenuTriggerStyle(), compact)}
          >
            Logs
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger disabled className={cn(compact, "gap-1.5")}>
            Marketplace
            <Badge variant="outline" className="h-4 px-1.5 text-[0.625rem]">
              Soon
            </Badge>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <p className="w-48 p-2 text-xs text-muted-foreground">
              Integrations launch next quarter.
            </p>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
