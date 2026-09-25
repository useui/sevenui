"use client";

import * as React from "react";
import { cn } from "cn";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/registry/base/ui/navigation-menu";

// A 2px bar grows from the center under the hovered, focused, open, or active item.
const underline =
  "relative h-11 rounded-none bg-transparent px-3 text-muted-foreground hover:bg-transparent hover:text-foreground focus:bg-transparent focus-visible:rounded-md data-popup-open:bg-transparent data-popup-open:text-foreground data-popup-open:hover:bg-transparent data-active:bg-transparent data-active:text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-foreground after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100 data-popup-open:after:scale-x-100 data-active:after:scale-x-100 motion-reduce:after:transition-none";

const guides = [
  { href: "#quickstart", title: "Quickstart", minutes: 5 },
  { href: "#auth", title: "Add authentication", minutes: 12 },
  { href: "#webhooks", title: "Handle webhooks", minutes: 8 },
  { href: "#testing", title: "Test in CI", minutes: 10 },
];

export default function NavigationMenu06() {
  const [current, setCurrent] = React.useState("#docs");
  const guideActive = guides.some((guide) => guide.href === current);

  function go(href: string) {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      setCurrent(href);
    };
  }

  return (
    <NavigationMenu
      aria-label="Documentation"
      className="w-full max-w-md justify-start border-b border-border"
    >
      <NavigationMenuList className="gap-0">
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#docs"
            active={current === "#docs"}
            aria-current={current === "#docs" ? "page" : undefined}
            onClick={go("#docs")}
            className={cn("text-sm font-medium", underline)}
          >
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              underline,
              guideActive && "text-foreground after:scale-x-100",
            )}
          >
            Guides
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[min(15rem,calc(100vw-2rem))] gap-0.5">
              {guides.map((guide) => (
                <li key={guide.href}>
                  <NavigationMenuLink
                    closeOnClick
                    href={guide.href}
                    active={current === guide.href}
                    aria-current={current === guide.href ? "page" : undefined}
                    onClick={go(guide.href)}
                    className="justify-between"
                  >
                    <span>{guide.title}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {guide.minutes} min
                    </span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#api"
            active={current === "#api"}
            aria-current={current === "#api" ? "page" : undefined}
            onClick={go("#api")}
            className={cn("text-sm font-medium", underline)}
          >
            API
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
