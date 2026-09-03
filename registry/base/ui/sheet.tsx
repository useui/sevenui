"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/registry/base/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const sheetSides = {
  top: "inset-x-0 top-0 h-auto border-b data-[ending-style]:-translate-y-full data-[starting-style]:-translate-y-full",
  right:
    "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
  bottom:
    "inset-x-0 bottom-0 h-auto border-t data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
  left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full",
} as const;

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Popup> & {
  side?: keyof typeof sheetSides;
  showCloseButton?: boolean;
}) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <SheetPrimitive.Popup
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition-transform duration-300 ease-in-out",
          sheetSides[side],
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            aria-label="Close"
            className="absolute top-4 right-4 rounded-xs text-muted-foreground opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
