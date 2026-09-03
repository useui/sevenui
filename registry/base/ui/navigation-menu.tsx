"use client";

import * as React from "react";
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { cva } from "class-variance-authority";

import { cn } from "@/registry/base/lib/utils";

function NavigationMenu({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) {
  return (
    <NavigationMenuPrimitive.Root
      className={cn(
        "relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Portal>
        <NavigationMenuPrimitive.Positioner
          sideOffset={10}
          collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
          collisionAvoidance={{ side: "none" }}
          className="z-50 h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] before:absolute before:content-[''] data-[instant]:transition-none data-[side=bottom]:before:-top-2.5 data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0 data-[side=bottom]:before:h-2.5 data-[side=left]:before:top-0 data-[side=left]:before:-right-2.5 data-[side=left]:before:bottom-0 data-[side=left]:before:w-2.5 data-[side=right]:before:top-0 data-[side=right]:before:bottom-0 data-[side=right]:before:-left-2.5 data-[side=right]:before:w-2.5 data-[side=top]:before:right-0 data-[side=top]:before:-bottom-2.5 data-[side=top]:before:left-0 data-[side=top]:before:h-2.5"
        >
          <NavigationMenuPrimitive.Popup className="relative h-[var(--popup-height)] w-full origin-[var(--transform-origin)] rounded-md border bg-popover text-popover-foreground shadow-md outline-none transition-[opacity,scale,width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:duration-150 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 sm:w-[var(--popup-width)]">
            <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden rounded-[inherit]" />
          </NavigationMenuPrimitive.Popup>
        </NavigationMenuPrimitive.Positioner>
      </NavigationMenuPrimitive.Portal>
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center gap-1 rounded-md bg-background px-4 py-2 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[popup-open]:bg-accent/50 data-[popup-open]:text-accent-foreground",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      className={cn(navigationMenuTriggerStyle(), className)}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Icon className="relative top-[1px] transition-transform duration-200 data-[popup-open]:rotate-180">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </NavigationMenuPrimitive.Icon>
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      className={cn(
        "h-full w-[calc(100vw-2.5rem)] p-2 transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[ending-style]:data-[activation-direction=left]:translate-x-1/2 data-[ending-style]:data-[activation-direction=right]:-translate-x-1/2 data-[starting-style]:data-[activation-direction=left]:-translate-x-1/2 data-[starting-style]:data-[activation-direction=right]:translate-x-1/2 sm:w-max",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      className={cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[active]:bg-accent/50 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
};
