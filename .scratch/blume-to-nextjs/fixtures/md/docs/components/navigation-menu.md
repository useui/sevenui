---
title: Navigation Menu
description: A collection of links for navigating websites, sharing one animated popup between top-level menu triggers, built on the Base UI Navigation Menu primitive.
---

```tsx
"use client";

import { cn } from "cn";
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
```

## Installation

<InstallCommand item="navigation-menu" />

## Usage

```tsx
"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#">Introduction</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
```

## API reference

### NavigationMenu

Extends the
[Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
Root. Hover-open timing lives **here**, unlike our other overlays where
it lives on the trigger.

| Prop                     | Type                         | Default        |
| ------------------------ | ---------------------------- | -------------- |
| `value` / `defaultValue` | `string`                     | —              |
| `onValueChange`          | `(value) => void`            | —              |
| `delay` / `closeDelay`   | `number`                     | `50` (ms) each |
| `orientation`            | `"horizontal" \| "vertical"` | `"horizontal"` |

### NavigationMenuContent

Every panel shares **one** popup: each content portals into the single
Viewport inside the shared Popup, and the trigger writes
`--popup-width`/`--popup-height` (and positioner equivalents) as it
switches, so the popup resizes and slides to the active trigger. Content
cross-fades directionally via `data-activation-direction`
(`left`/`right`/`up`/`down`) combined with
`data-starting-style`/`data-ending-style`. The primitive's `keepMounted`
(for SSR/crawler-visible closed panels) is not set by default — compose
the primitive directly when that matters. For tall panels, cap height
with `max-h-[var(--available-height)]` and prefer
[Scroll Area](/docs/components/scroll-area) inside.

### NavigationMenuLink

Renders a real `<a>`. Compose framework routers with the `render` prop:
`<NavigationMenuLink render={<Link href="/docs" />} />`.

| Prop           | Type                            | Default |
| -------------- | ------------------------------- | ------- |
| `closeOnClick` | `boolean`                       | `false` |
| `active`       | `boolean` — sets `data-active`  | `false` |

### NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuPositioner, NavigationMenuIndicator

Styled parts. The Positioner carries an invisible `before:` hover bridge
spanning the `sideOffset` gap — without it, moving the pointer from a
trigger into the popup would cross a non-hoverable gap and close the
menu.
