"use client";

import type * as React from "react";
import {
  NavigationMenuContent as NavigationMenuContentPrimitive,
  NavigationMenuIndicator as NavigationMenuIndicatorPrimitive,
  NavigationMenuItem as NavigationMenuItemPrimitive,
  NavigationMenuLink as NavigationMenuLinkPrimitive,
  NavigationMenuList as NavigationMenuListPrimitive,
  NavigationMenu as NavigationMenuPrimitive,
  NavigationMenuTrigger as NavigationMenuTriggerPrimitive,
  NavigationMenuViewport as NavigationMenuViewportPrimitive,
} from "@ui-sdk/react/navigation-menu";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cva } from "class-variance-authority";
import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";

type BaseRender = React.ReactElement<unknown> | RenderProp<never>;
type Side = React.ComponentProps<typeof NavigationMenuViewportPrimitive>["side"];
type Align = React.ComponentProps<typeof NavigationMenuViewportPrimitive>["align"];

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins, so SevenUI's slot names are set there, with any extra attributes.
function part<State extends object>(
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

// Base UI's logical sides map onto UI SDK's start/end.
function toSide(side: Side | "inline-start" | "inline-end" | undefined): Side {
  if (side === "inline-start") return "start";
  if (side === "inline-end") return "end";
  return side;
}

// Base UI root props with no UI SDK counterpart are accepted and dropped.
function NavigationMenu({
  align = "start",
  className,
  children,
  render,
  value,
  defaultValue,
  onValueChange,
  actionsRef: _actionsRef,
  ...props
}: Omit<
  React.ComponentProps<typeof NavigationMenuPrimitive>,
  "render" | "className" | "value" | "defaultValue" | "onValueChange" | "children"
> & {
  children?: React.ReactNode;
  align?: Align;
  className?: string;
  render?: BaseRender;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the value as any.
  value?: any;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the value as any.
  defaultValue?: any;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the value as any.
  onValueChange?: (value: any, details: any) => void;
  actionsRef?: unknown;
}) {
  return (
    <NavigationMenuPrimitive
      render={part("navigation-menu", "nav", render)}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      <NavigationMenuPositioner align={align} />
    </NavigationMenuPrimitive>
  );
}

function NavigationMenuList({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof NavigationMenuListPrimitive>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <NavigationMenuListPrimitive
      render={part("navigation-menu-list", "ul", render)}
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-0",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof NavigationMenuItemPrimitive>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <NavigationMenuItemPrimitive
      render={part("navigation-menu-item", "li", render)}
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger inline-flex h-[var(--control-h,2.125rem)] w-max items-center justify-center rounded-md px-[var(--control-px,0.75rem)] text-[length:var(--control-text,0.8125rem)] font-medium transition-[background-color,color] duration-100 outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted data-open:bg-muted/50 data-open:hover:bg-muted data-open:focus:bg-muted motion-reduce:transition-none",
);

// Base UI's data-popup-open is added beside UI SDK's data-open, since
// examples style it.
function NavigationMenuTrigger({
  className,
  children,
  render,
  ...props
}: Omit<
  React.ComponentProps<typeof NavigationMenuTriggerPrimitive>,
  "render" | "className" | "children"
> & {
  className?: string;
  children?: React.ReactNode;
  render?: BaseRender;
  nativeButton?: boolean;
}) {
  const { nativeButton: _nativeButton, ...rest } = props;
  return (
    <NavigationMenuTriggerPrimitive
      render={part("navigation-menu-trigger", "button", render, (state: { open?: boolean }) => ({
        "data-popup-open": state.open ? "" : undefined,
      }))}
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...rest}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-px ml-1 size-3 text-muted-foreground transition duration-300 group-data-popup-open/navigation-menu-trigger:rotate-180 group-data-open/navigation-menu-trigger:rotate-180 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </NavigationMenuTriggerPrimitive>
  );
}

// UI SDK sizes the viewport from the open content's own box, so the content
// sits at the viewport's corner with its own width (Base UI's `h-full w-auto`
// would size it from the viewport and loop).
function NavigationMenuContent({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof NavigationMenuContentPrimitive>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <NavigationMenuContentPrimitive
      render={part("navigation-menu-content", "div", render)}
      className={cn(
        "data-ending-style:data-activation-direction=left:translate-x-[50%] data-ending-style:data-activation-direction=right:translate-x-[-50%] data-starting-style:data-activation-direction=left:translate-x-[-50%] data-starting-style:data-activation-direction=right:translate-x-[50%] absolute top-0 start-0 h-auto w-max max-h-(--panel-h) overflow-y-auto p-1 transition-[opacity,transform,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[viewport=false]/navigation-menu:rounded-lg group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow-overlay group-data-[viewport=false]/navigation-menu:ring-1 group-data-[viewport=false]/navigation-menu:ring-foreground/10 group-data-[viewport=false]/navigation-menu:duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none group-data-[viewport=false]/navigation-menu:data-open:animate-in group-data-[viewport=false]/navigation-menu:data-open:fade-in-0 group-data-[viewport=false]/navigation-menu:data-open:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-closed:animate-out group-data-[viewport=false]/navigation-menu:data-closed:fade-out-0 group-data-[viewport=false]/navigation-menu:data-closed:zoom-out-95 motion-reduce:transition-none motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

// Base UI's Portal > Positioner > Popup > Viewport stack is one element in UI
// SDK: the viewport is the top-layer popup that holds the open content and
// takes its size as --viewport-width/--viewport-height.
function NavigationMenuPositioner({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  collisionPadding,
  arrowPadding,
  anchor,
  container,
}: {
  className?: string;
  side?: Side | "inline-start" | "inline-end";
  sideOffset?: number;
  align?: Align;
  alignOffset?: number;
  collisionPadding?: number;
  arrowPadding?: number;
  anchor?: React.ComponentProps<typeof NavigationMenuViewportPrimitive>["anchor"];
  container?: React.ComponentProps<typeof NavigationMenuViewportPrimitive>["container"];
  // Base UI positioner props with no UI SDK counterpart.
  sticky?: boolean;
  positionMethod?: "absolute" | "fixed";
  collisionBoundary?: unknown;
  collisionAvoidance?: unknown;
  disableAnchorTracking?: boolean;
}) {
  return (
    <NavigationMenuViewportPrimitive
      side={toSide(side)}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      // Base UI keeps popups 5px from the viewport edges; UI SDK 8px.
      collisionPadding={collisionPadding ?? 5}
      arrowPadding={arrowPadding}
      anchor={anchor}
      container={container}
      className={cn(
        "isolate z-50 h-(--viewport-height) w-(--viewport-width) max-w-(--available-width) overflow-hidden [--panel-h:var(--available-height)] origin-(--transform-origin) rounded-lg bg-popover text-popover-foreground shadow-overlay ring-1 ring-foreground/10 transition-[opacity,transform,width,height,scale,translate,top,left] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:scale-90 data-starting-style:opacity-0 data-instant:transition-none motion-reduce:transition-none",
        className,
      )}
    />
  );
}

// Base UI's `active` and `closeOnClick` (default false) map to UI SDK's
// `current` and `closeOnSelect`; data-active stays for the styles.
function NavigationMenuLink({
  className,
  render,
  active,
  closeOnClick = false,
  ...props
}: Omit<React.ComponentProps<typeof NavigationMenuLinkPrimitive>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
  active?: boolean;
  closeOnClick?: boolean;
}) {
  return (
    <NavigationMenuLinkPrimitive
      render={part("navigation-menu-link", "a", render, (state: { current?: boolean }) => ({
        "data-active": state.current ? "" : undefined,
      }))}
      current={active}
      closeOnSelect={closeOnClick}
      className={cn(
        "flex items-center gap-2 rounded-md p-2 text-sm transition-[background-color] duration-100 outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 data-active:bg-muted/50 data-active:hover:bg-muted data-active:focus:bg-muted motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  render,
  ...props
}: Omit<
  React.ComponentProps<typeof NavigationMenuIndicatorPrimitive>,
  "render" | "className"
> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <NavigationMenuIndicatorPrimitive
      render={part("navigation-menu-indicator", "div", render)}
      className={cn(
        "top-full z-1 flex h-1.5 items-end justify-center overflow-hidden data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border" />
    </NavigationMenuIndicatorPrimitive>
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuPositioner,
};
