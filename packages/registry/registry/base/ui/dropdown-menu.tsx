"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "@/registry/base/lib/utils";

const DropdownMenu = MenuPrimitive.Root;

const DropdownMenuPortal = MenuPrimitive.Portal;

const DropdownMenuTrigger = MenuPrimitive.Trigger;

const DropdownMenuGroup = MenuPrimitive.Group;

const DropdownMenuSub = MenuPrimitive.SubmenuRoot;

const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup;

const menuPopupClasses =
  "max-h-[var(--available-height)] min-w-32 origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[instant]:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0";

const menuItemClasses =
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

function DropdownMenuContent({
  className,
  side,
  align,
  sideOffset = 4,
  alignOffset,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Popup> &
  Pick<
    React.ComponentProps<typeof MenuPrimitive.Positioner>,
    "side" | "align" | "sideOffset" | "alignOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <MenuPrimitive.Popup
          className={cn(menuPopupClasses, className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenuPrimitive.Item
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(
        menuItemClasses,
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[highlighted]:bg-destructive/10 data-[variant=destructive]:data-[highlighted]:text-destructive data-[variant=destructive]:[&_svg]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
  return (
    <MenuPrimitive.CheckboxItem
      className={cn(menuItemClasses, "pr-2 pl-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon className="size-4" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.RadioItem>) {
  return (
    <MenuPrimitive.RadioItem
      className={cn(menuItemClasses, "pr-2 pl-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.RadioItemIndicator>
          <CircleIcon fill="currentColor" stroke="none" className="size-2" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.GroupLabel> & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-inset={inset || undefined}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return (
    <MenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.SubmenuTrigger> & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-inset={inset || undefined}
      className={cn(
        menuItemClasses,
        "data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Popup>) {
  return (
    <MenuPrimitive.Portal>
      {/* No side/align: Base UI auto-positions submenus at inline-end/start (RTL-aware). */}
      <MenuPrimitive.Positioner className="z-50">
        <MenuPrimitive.Popup
          className={cn(menuPopupClasses, "min-w-32", className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
