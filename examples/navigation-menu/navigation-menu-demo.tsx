"use client";

import { cn } from "@/registry/base/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/registry/base/ui/navigation-menu";

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-72 gap-1">
              <li>
                <NavigationMenuLink href="#">
                  <div className="font-medium">Introduction</div>
                  <div className="text-muted-foreground">
                    Base UI powered components, distributed through the
                    shadcn registry.
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="font-medium">Installation</div>
                  <div className="text-muted-foreground">
                    Configure the SevenUI registry in your project.
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="font-medium">Theming</div>
                  <div className="text-muted-foreground">
                    SevenUI components follow your shadcn theme.
                  </div>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-96 grid-cols-2 gap-1">
              <li>
                <NavigationMenuLink href="#">
                  <div className="font-medium">Button</div>
                  <div className="text-muted-foreground">
                    Displays a button.
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="font-medium">Dialog</div>
                  <div className="text-muted-foreground">
                    A window overlaid on the primary window, rendering
                    content underneath inert.
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="font-medium">Tabs</div>
                  <div className="text-muted-foreground">
                    A set of layered sections that display one panel at a
                    time.
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="font-medium">Toast</div>
                  <div className="text-muted-foreground">
                    A module-level API for brief, non-blocking
                    notifications.
                  </div>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#"
            className={cn(navigationMenuTriggerStyle(), "flex-row")}
          >
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
