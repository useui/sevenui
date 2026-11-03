"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/registry/base/ui/navigation-menu";
import { LabSection } from "../lab-frame";

function Menu({ defaultValue }: { defaultValue?: string }) {
  return (
    <NavigationMenu defaultValue={defaultValue}>
      <NavigationMenuList>
        <NavigationMenuItem value="getting-started">
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-80 gap-1">
              <li>
                <NavigationMenuLink href="#introduction" active>
                  <div>
                    <div className="font-medium">Introduction (active)</div>
                    <div className="text-muted-foreground">Primitives built on Base UI.</div>
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#installation">
                  <div>
                    <div className="font-medium">Installation</div>
                    <div className="text-muted-foreground">Add a primitive with the CLI.</div>
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#theming">
                  <div>
                    <div className="font-medium">Theming</div>
                    <div className="text-muted-foreground">Tokens, density and the ring.</div>
                  </div>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="components">
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-64 gap-1">
              <li>
                <NavigationMenuLink href="#button">Button</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#menu">Menu</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#docs" className={navigationMenuTriggerStyle()}>
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger disabled>Disabled</NavigationMenuTrigger>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default function NavigationMenuMatrix() {
  return (
    <div>
      <LabSection title="triggers (hover, click, Tab; plain link uses navigationMenuTriggerStyle)">
        <Menu />
      </LabSection>
      <LabSection title="note: the viewport popup portals to <body> with no prop to retheme it, so open popups take the page theme and comfortable density; switch the site theme to review the other">
        <span className="text-xs text-muted-foreground">Open a trigger above.</span>
      </LabSection>
    </div>
  );
}
