"use client";

import { CreditCard, LogOut, Settings, UserRound } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/registry/base/ui/navigation-menu";

const accountLinks = [
  { href: "#profile", icon: UserRound, label: "Profile" },
  { href: "#billing", icon: CreditCard, label: "Billing" },
  { href: "#preferences", icon: Settings, label: "Preferences" },
];

export default function NavigationMenu04() {
  return (
    <div className="flex w-full max-w-md justify-end">
      <NavigationMenu align="end" aria-label="Account">
        <NavigationMenuList className="gap-1">
          <NavigationMenuItem>
            <NavigationMenuLink
              href="#help"
              className={navigationMenuTriggerStyle()}
            >
              Help
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              aria-label="Account menu for Maya Chen"
              className="h-10 gap-2 pl-1"
            >
              <Avatar size="sm">
                <AvatarImage src="/placeholder.svg" alt="" />
                <AvatarFallback>MC</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">Maya Chen</span>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="flex w-[min(15rem,calc(100vw-2rem))] flex-col">
                <div className="flex items-center gap-3 px-2 pt-2 pb-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt="" />
                    <AvatarFallback>MC</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">
                      Maya Chen
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      maya@northwind.app
                    </span>
                  </div>
                </div>
                <ul className="grid gap-0.5 border-t border-border pt-1">
                  {accountLinks.map((link) => (
                    <li key={link.href}>
                      <NavigationMenuLink closeOnClick href={link.href}>
                        <link.icon
                          aria-hidden="true"
                          className="text-muted-foreground"
                        />
                        {link.label}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
                <div className="mt-1 border-t border-border pt-1">
                  <NavigationMenuLink
                    closeOnClick
                    href="#sign-out"
                    className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                  >
                    <LogOut aria-hidden="true" />
                    Sign out
                  </NavigationMenuLink>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
