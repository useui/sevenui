"use client";

import * as React from "react";
import { cn } from "cn";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/registry/base/ui/navigation-menu";

const links = [
  { href: "#overview", label: "Overview" },
  { href: "#projects", label: "Projects" },
  { href: "#deployments", label: "Deployments" },
  { href: "#settings", label: "Settings" },
];

export default function NavigationMenu01() {
  const [current, setCurrent] = React.useState("#projects");

  return (
    <NavigationMenu aria-label="Workspace" className="w-full max-w-md">
      <NavigationMenuList className="flex-wrap gap-1">
        {links.map((link) => {
          const active = link.href === current;
          return (
            <NavigationMenuItem key={link.href}>
              <NavigationMenuLink
                href={link.href}
                active={active}
                aria-current={active ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  setCurrent(link.href);
                }}
                className={cn(
                  navigationMenuTriggerStyle(),
                  "text-muted-foreground hover:text-foreground data-active:bg-muted data-active:text-foreground",
                )}
              >
                {link.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
