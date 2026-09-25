"use client";

import { cn } from "cn";
import { Mail, MessageCircle, Phone, Search } from "lucide-react";

import { Input } from "@/registry/base/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/registry/base/ui/navigation-menu";

const topics = [
  { title: "Getting started", count: 12 },
  { title: "Billing & refunds", count: 18 },
  { title: "Account security", count: 9 },
  { title: "Shipping & returns", count: 21 },
];

const channels = [
  {
    icon: MessageCircle,
    title: "Live chat",
    detail: "Typical reply in 2 minutes",
    status: "Online",
    available: true,
  },
  {
    icon: Mail,
    title: "Email",
    detail: "support@parcelpost.com",
    status: "Within 4h",
    available: true,
  },
  {
    icon: Phone,
    title: "Phone",
    detail: "Mon–Fri, 9:00–18:00 CET",
    status: "Closed",
    available: false,
  },
];

export default function NavigationMenu13() {
  return (
    <section
      aria-labelledby="navigation-menu-13-title"
      className="w-full max-w-xl overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <span className="hidden text-sm font-semibold sm:inline">
          Parcelpost Help
        </span>
        <NavigationMenu aria-label="Help center" align="end">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Topics</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-60 gap-0.5 p-1">
                  {topics.map((topic) => (
                    <li key={topic.title}>
                      <NavigationMenuLink
                        closeOnClick
                        href={`#${topic.title.toLowerCase().replace(/\W+/g, "-")}`}
                        className="justify-between"
                      >
                        {topic.title}
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {topic.count} articles
                        </span>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Contact</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-72 gap-0.5 p-1">
                  {channels.map((channel) => (
                    <li key={channel.title}>
                      <NavigationMenuLink
                        closeOnClick
                        href={`#contact-${channel.title.toLowerCase().replace(" ", "-")}`}
                        className="items-start gap-3"
                      >
                        <channel.icon
                          className="mt-0.5 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="font-medium">{channel.title}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {channel.detail}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 flex shrink-0 items-center gap-1.5 text-xs",
                            channel.available
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "size-1.5 rounded-full",
                              channel.available
                                ? "bg-success"
                                : "bg-muted-foreground/50",
                            )}
                          />
                          {channel.status}
                        </span>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="#status"
                className={cn(navigationMenuTriggerStyle(), "flex-row gap-1.5")}
              >
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-success"
                />
                Status
                <span className="sr-only">: all systems operational</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex flex-col gap-3 bg-muted/40 px-4 py-6">
        <h3
          id="navigation-menu-13-title"
          className="text-lg font-semibold text-balance"
        >
          How can we help, Dana?
        </h3>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            aria-label="Search help articles"
            placeholder="Search “change delivery address”"
            className="bg-background pl-8"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Popular: track a parcel, request a refund, reset two-factor
        </p>
      </div>
    </section>
  );
}
