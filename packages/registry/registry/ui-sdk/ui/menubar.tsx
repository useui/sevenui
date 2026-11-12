"use client";

import * as React from "react";
import {
  MenuCheckboxItem,
  MenuItemIndicator,
  MenuRadioItem,
} from "@ui-sdk/react/menu";
import { Menubar as MenubarPrimitive } from "@ui-sdk/react/menubar";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";
import { CheckIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/ui-sdk/ui/dropdown-menu";

type BaseRender = React.ReactElement<unknown> | RenderProp<never>;

// UI SDK ignores a data-slot prop on its parts, and the dropdown-menu parts
// set their own slot on the rendered element; a render function that runs
// last sets SevenUI's menubar-* slot instead, and still honours the caller's
// own render.
function slotted<State extends object>(
  slot: string,
  tag: string,
  render: BaseRender | undefined,
  extra?: (state: State) => Record<string, unknown>,
): RenderProp<State> {
  return (props, state) =>
    renderElement(
      tag,
      { ...props, "data-slot": slot, ...extra?.(state) },
      render as RenderProp<State> | undefined,
      state,
    );
}

function Menubar({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof MenubarPrimitive>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <MenubarPrimitive
      render={slotted("menubar", "div", render)}
      className={cn(
        "flex h-[var(--control-h,2.125rem)] items-center gap-0.5 rounded-lg border p-0.5",
        className,
      )}
      {...props}
    />
  );
}

function MenubarMenu({ ...props }: React.ComponentProps<typeof DropdownMenu>) {
  return <DropdownMenu {...props} />;
}

function MenubarGroup({
  render,
  ...props
}: React.ComponentProps<typeof DropdownMenuGroup>) {
  return <DropdownMenuGroup render={slotted("menubar-group", "div", render)} {...props} />;
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPortal>) {
  return <DropdownMenuPortal {...props} />;
}

function MenubarTrigger({
  className,
  render,
  ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>) {
  return (
    <DropdownMenuTrigger
      render={slotted("menubar-trigger", "button", render)}
      className={cn(
        "relative flex h-full items-center rounded-[max(0px,calc(--theme(--radius-lg)-2px))] px-[var(--control-px,0.75rem)] text-[length:var(--control-text,0.8125rem)] font-medium text-muted-foreground outline-hidden select-none transition-[background-color,color,box-shadow] duration-100 hover:bg-accent hover:text-accent-foreground aria-expanded:text-accent-foreground aria-expanded:bg-accent data-popup-open:bg-accent data-popup-open:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="menubar-content"
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn("min-w-36", className)}
      {...props}
    />
  );
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  render,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      render={slotted("menubar-item", "div", render)}
      inset={inset}
      variant={variant}
      className={cn("group/menubar-item", className)}
      {...props}
    />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  inset,
  closeOnClick,
  render,
  value,
  ...props
}: Omit<React.ComponentProps<typeof MenuCheckboxItem>, "render" | "value" | "children"> & {
  inset?: boolean;
  closeOnClick?: boolean;
  render?: BaseRender;
  children?: React.ReactNode;
  // UI SDK identifies checkbox items in the menu's onCheckedChange; Base UI
  // has no value, so a generated one fills in.
  value?: string;
}) {
  const id = React.useId();
  return (
    <MenuCheckboxItem
      render={slotted("menubar-checkbox-item", "div", render)}
      data-inset={inset}
      value={value ?? id}
      closeOnSelect={closeOnClick}
      className={cn(
        "relative flex min-h-[var(--item-h,2rem)] cursor-default items-center gap-2 rounded-sm px-2 text-[length:var(--control-text,0.8125rem)] outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:[&_.text-muted-foreground]:text-accent-foreground data-disabled:data-highlighted:bg-transparent data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 pr-2 pl-8",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenuItemIndicator>
          <CheckIcon />
        </MenuItemIndicator>
      </span>
      {children}
    </MenuCheckboxItem>
  );
}

function MenubarRadioGroup({
  render,
  ...props
}: React.ComponentProps<typeof DropdownMenuRadioGroup>) {
  return (
    <DropdownMenuRadioGroup render={slotted("menubar-radio-group", "div", render)} {...props} />
  );
}

function MenubarRadioItem({
  className,
  children,
  inset,
  closeOnClick,
  render,
  ...props
}: Omit<React.ComponentProps<typeof MenuRadioItem>, "render" | "children"> & {
  inset?: boolean;
  closeOnClick?: boolean;
  render?: BaseRender;
  children?: React.ReactNode;
}) {
  return (
    <MenuRadioItem
      render={slotted("menubar-radio-item", "div", render)}
      data-inset={inset}
      closeOnSelect={closeOnClick}
      className={cn(
        "relative flex min-h-[var(--item-h,2rem)] cursor-default items-center gap-2 rounded-sm px-2 text-[length:var(--control-text,0.8125rem)] outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:[&_.text-muted-foreground]:text-accent-foreground data-disabled:data-highlighted:bg-transparent data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 pr-2 pl-8",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenuItemIndicator>
          <CheckIcon />
        </MenuItemIndicator>
      </span>
      {children}
    </MenuRadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  render,
  ...props
}: React.ComponentProps<typeof DropdownMenuLabel> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuLabel
      render={slotted("menubar-label", "div", render)}
      inset={inset}
      className={cn("px-2 py-1.5 text-sm font-medium data-inset:pl-8", className)}
      {...props}
    />
  );
}

function MenubarSeparator({
  className,
  render,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return (
    <DropdownMenuSeparator
      render={slotted("menubar-separator", "div", render)}
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuShortcut>) {
  return (
    <DropdownMenuShortcut
      data-slot="menubar-shortcut"
      className={cn(
        "ml-auto pl-3 font-mono text-[0.6875rem] tracking-normal text-muted-foreground group-data-highlighted/menubar-item:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuSub>) {
  return <DropdownMenuSub {...props} />;
}

function MenubarSubTrigger({
  className,
  inset,
  render,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuSubTrigger
      render={slotted("menubar-sub-trigger", "div", render)}
      inset={inset}
      className={cn("data-inset:pl-8", className)}
      {...props}
    />
  );
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubContent>) {
  return (
    <DropdownMenuSubContent
      data-slot="menubar-sub-content"
      className={cn("min-w-32", className)}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
