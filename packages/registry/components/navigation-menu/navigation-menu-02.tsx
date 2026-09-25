"use client";

import { Menu } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/registry/base/ui/navigation-menu";

const links = [
  { href: "#features", label: "Features" },
  { href: "#customers", label: "Customers" },
  { href: "#pricing", label: "Pricing" },
  { href: "#changelog", label: "Changelog" },
];

const secondary = [
  { href: "#docs", label: "Documentation" },
  { href: "#contact", label: "Contact sales" },
];

// Inline links from the sm breakpoint up; one "Menu" panel below it.
export default function NavigationMenu02() {
  return (
    <header className="flex w-full max-w-2xl items-center justify-between gap-2 border-b border-border pb-2">
      <span className="text-sm font-semibold">Tidewater</span>
      <NavigationMenu aria-label="Main" align="end">
        <NavigationMenuList className="gap-0.5">
          {links.map((link) => (
            <NavigationMenuItem key={link.href} className="hidden sm:block">
              <NavigationMenuLink
                href={link.href}
                className={navigationMenuTriggerStyle()}
              >
                {link.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
          <NavigationMenuItem className="sm:hidden">
            <NavigationMenuTrigger className="gap-1.5">
              <Menu aria-hidden="true" className="size-4" />
              Menu
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="flex w-[min(16rem,calc(100vw-2rem))] flex-col">
                <ul className="grid gap-0.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <NavigationMenuLink
                        closeOnClick
                        href={link.href}
                        className="px-3 py-2.5 text-base font-medium"
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
                <ul className="mt-1 grid gap-0.5 border-t border-border pt-1">
                  {secondary.map((link) => (
                    <li key={link.href}>
                      <NavigationMenuLink
                        closeOnClick
                        href={link.href}
                        className="px-3 text-muted-foreground hover:text-foreground focus:text-foreground"
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
