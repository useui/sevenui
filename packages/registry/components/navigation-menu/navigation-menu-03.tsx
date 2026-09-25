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

const pill =
  "h-8 rounded-full px-3 text-muted-foreground hover:bg-background/70 hover:text-foreground focus:bg-background/70 data-popup-open:bg-background data-popup-open:text-foreground data-popup-open:shadow-sm data-popup-open:hover:bg-background";

const learn = [
  { href: "#guides", title: "Guides", note: "Step-by-step walkthroughs" },
  { href: "#api", title: "API reference", note: "Every endpoint, typed" },
  { href: "#templates", title: "Templates", note: "Start from a working app", isNew: true },
];

const company = [
  { href: "#about", title: "About", note: "Who we are and why" },
  { href: "#careers", title: "Careers", note: "Six open roles, remote-first" },
  { href: "#press", title: "Press kit", note: "Logos and screenshots" },
];

function LinkList({ items }: { items: typeof learn }) {
  return (
    <ul className="grid w-[min(16rem,calc(100vw-2rem))] gap-0.5">
      {items.map((item) => (
        <li key={item.href}>
          <NavigationMenuLink
            href={item.href}
            closeOnClick
            className="justify-between"
          >
            <span className="flex flex-col">
              <span className="font-medium">{item.title}</span>
              <span className="text-xs text-muted-foreground">{item.note}</span>
            </span>
            {"isNew" in item && item.isNew ? <Badge>New</Badge> : null}
          </NavigationMenuLink>
        </li>
      ))}
    </ul>
  );
}

export default function NavigationMenu03() {
  return (
    <NavigationMenu
      aria-label="Site"
      className="rounded-full border border-border bg-muted/60 p-1"
    >
      <NavigationMenuList className="gap-0.5">
        <NavigationMenuItem>
          <NavigationMenuTrigger className={pill}>Learn</NavigationMenuTrigger>
          <NavigationMenuContent>
            <LinkList items={learn} />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={pill}>Company</NavigationMenuTrigger>
          <NavigationMenuContent>
            <LinkList items={company} />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#blog"
            className={cn(navigationMenuTriggerStyle(), pill)}
          >
            Blog
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
