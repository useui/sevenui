"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";

import { cn } from "@/registry/base/lib/utils";

const Combobox = ComboboxPrimitive.Root;

const ComboboxList = ComboboxPrimitive.List;

const ComboboxGroup = ComboboxPrimitive.Group;

function ComboboxInput({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Input>) {
  return (
    <ComboboxPrimitive.InputGroup
      className={cn("relative flex w-full items-center", className)}
    >
      <ComboboxPrimitive.Input
        className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent py-1 pr-14 pl-3 text-base shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        {...props}
      />
      <div className="absolute right-2 flex items-center gap-1">
        <ComboboxClear />
        <ComboboxTrigger />
      </div>
    </ComboboxPrimitive.InputGroup>
  );
}

function ComboboxTrigger({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Trigger>) {
  return (
    <ComboboxPrimitive.Trigger
      aria-label="Open popup"
      className={cn(
        "flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 opacity-50"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxClear({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Clear>) {
  return (
    <ComboboxPrimitive.Clear
      aria-label="Clear selection"
      className={cn(
        "flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
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
    </ComboboxPrimitive.Clear>
  );
}

function ComboboxContent({
  className,
  children,
  side,
  align,
  sideOffset = 4,
  alignOffset,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Popup> &
  Pick<
    React.ComponentProps<typeof ComboboxPrimitive.Positioner>,
    "side" | "align" | "sideOffset" | "alignOffset"
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <ComboboxPrimitive.Popup
          className={cn(
            "max-h-[min(24rem,var(--available-height))] w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Item>) {
  return (
    <ComboboxPrimitive.Item
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <ComboboxPrimitive.ItemIndicator>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </ComboboxPrimitive.ItemIndicator>
      </span>
      {children}
    </ComboboxPrimitive.Item>
  );
}

function ComboboxEmpty({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Empty>) {
  return (
    <ComboboxPrimitive.Empty
      className={cn(
        // Base UI keeps Empty mounted while items exist (a11y live region),
        // so the padding must only apply when it actually has content.
        "not-empty:py-6 text-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.GroupLabel>) {
  return (
    <ComboboxPrimitive.GroupLabel
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function ComboboxSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Separator>) {
  return (
    <ComboboxPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

export {
  Combobox,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxClear,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxSeparator,
};
