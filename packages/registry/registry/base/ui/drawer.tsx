"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";

import { cn } from "@/registry/base/lib/utils";

const Drawer = DrawerPrimitive.Root;

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Backdrop>) {
  return (
    <DrawerPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black opacity-[calc(0.5*(1-var(--drawer-swipe-progress,0)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:opacity-0 data-[ending-style]:duration-[calc(var(--drawer-swipe-strength,1)*400ms)] data-[starting-style]:opacity-0 data-[swiping]:duration-0",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Popup>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Viewport className="fixed inset-0 z-50 flex touch-none items-end justify-center">
        <DrawerPrimitive.Popup
          className={cn(
            "flex h-auto max-h-[85vh] w-full flex-col rounded-t-lg border bg-background outline-none transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform [transform:translateY(var(--drawer-swipe-movement-y,0px))] data-[ending-style]:duration-[calc(var(--drawer-swipe-strength,1)*400ms)] data-[ending-style]:[transform:translateY(calc(100%+2px))] data-[starting-style]:[transform:translateY(calc(100%+2px))] data-[swiping]:duration-0",
            className,
          )}
          {...props}
        >
          <div
            aria-hidden
            className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted"
          />
          <DrawerPrimitive.Content className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain touch-auto">
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 p-4 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerClose,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
