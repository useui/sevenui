"use client";

import { useState } from "react";

import { Button } from "@/registry/base/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/registry/base/ui/navigation-menu";

const sections = [
  {
    value: "platform",
    label: "Platform",
    links: [
      { href: "#compute", title: "Compute", note: "Containers that scale to zero" },
      { href: "#storage", title: "Storage", note: "S3-compatible object buckets" },
      { href: "#edge", title: "Edge network", note: "310 cities, one config file" },
    ],
  },
  {
    value: "developers",
    label: "Developers",
    links: [
      { href: "#cli", title: "CLI", note: "Deploy from your terminal" },
      { href: "#sdk", title: "SDKs", note: "TypeScript, Go, and Python" },
      { href: "#changelog", title: "Changelog", note: "Shipped this week" },
    ],
  },
];

export default function NavigationMenu05() {
  const [value, setValue] = useState<string | null>(null);
  const openSection = sections.find((section) => section.value === value);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <NavigationMenu
        aria-label="Product"
        value={value}
        onValueChange={(next) => setValue(next as string | null)}
      >
        <NavigationMenuList className="gap-1">
          {sections.map((section) => (
            <NavigationMenuItem key={section.value} value={section.value}>
              <NavigationMenuTrigger>{section.label}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[min(16rem,calc(100vw-2rem))] gap-0.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <NavigationMenuLink
                        closeOnClick
                        href={link.href}
                        className="flex-col items-start gap-0.5"
                      >
                        <span className="font-medium">{link.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {link.note}
                        </span>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex w-full flex-col gap-3 rounded-lg border border-dashed border-border p-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Open panel:{" "}
          <span className="font-medium text-foreground">
            {openSection ? openSection.label : "None"}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <Button
              key={section.value}
              size="sm"
              variant={value === section.value ? "secondary" : "outline"}
              aria-pressed={value === section.value}
              onClick={() => setValue(section.value)}
            >
              Open {section.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            disabled={value === null}
            onClick={() => setValue(null)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
