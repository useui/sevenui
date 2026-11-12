"use client";

import * as React from "react";
import {
  MenuCheckboxItem,
  MenuContent,
  MenuContextTrigger,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIndicator,
  Menu as MenuPrimitive,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from "@ui-sdk/react/menu";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";
import { CheckIcon, ChevronRightIcon } from "lucide-react";

type Side = React.ComponentProps<typeof MenuContent>["side"];
type BaseRender = React.ReactElement<unknown> | RenderProp<never>;

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins, so SevenUI's slot names (context-menu-*) are set there.
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

const popupOpen = (state: { open?: boolean }) => ({
  "data-popup-open": state.open ? "" : undefined,
});

// Base UI's logical sides map onto UI SDK's start/end.
function toSide(side: Side | "inline-start" | "inline-end" | undefined): Side {
  if (side === "inline-start") return "start";
  if (side === "inline-end") return "end";
  return side;
}

// Base UI root props with no UI SDK counterpart are accepted for API parity
// and dropped.
function ContextMenu({
  disabled: _disabled,
  orientation: _orientation,
  closeDelay: _closeDelay,
  ...props
}: React.ComponentProps<typeof MenuPrimitive> & {
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  closeDelay?: number;
}) {
  return <MenuPrimitive {...props} />;
}

// UI SDK renders popups in place in the top layer, so there is nothing to
// portal; the part stays so composed markup keeps working.
function ContextMenuPortal({
  children,
}: {
  children?: React.ReactNode;
  container?: unknown;
  keepMounted?: boolean;
}) {
  return <>{children}</>;
}

function ContextMenuTrigger({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof MenuContextTrigger>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <MenuContextTrigger
      render={part("context-menu-trigger", "div", render, popupOpen)}
      className={cn("select-none", className)}
      {...props}
    />
  );
}

type FocusTarget = React.ComponentProps<typeof MenuContent>["finalFocus"];
type BaseFinalFocus =
  | FocusTarget
  | boolean
  | React.RefObject<HTMLElement | null>
  | (() => boolean | HTMLElement | null | undefined);

type ContentProps = Omit<
  React.ComponentProps<typeof MenuContent>,
  "side" | "render" | "finalFocus"
> & {
  side?: Side | "inline-start" | "inline-end";
  render?: BaseRender;
  "data-slot"?: string;
  finalFocus?: BaseFinalFocus;
};

// Base UI's finalFocus also takes a boolean, a ref, or a function returning
// a boolean: true keeps the default (the trigger), false leaves focus where
// it is.
function toFinalFocus(target: BaseFinalFocus): FocusTarget {
  if (target === true || target === undefined) return undefined;
  if (target === false) return "none";
  if (typeof target === "object" && target !== null && "current" in target) {
    return () => target.current;
  }
  if (typeof target === "function") {
    return () => {
      const result = target();
      if (result === false) return document.activeElement as HTMLElement | null;
      if (result === true || !result) return undefined;
      return result;
    };
  }
  return target;
}

// No Positioner: UI SDK positions the content itself, in the top layer, so
// placement props sit on this part. A submenu needs UI SDK's MenuSubContent.
function contentPart(Content: typeof MenuContent, defaultSlot: string) {
  return ({
    className,
    align = "start",
    alignOffset = 4,
    side = "right",
    sideOffset = 0,
    render,
    "data-slot": slot = defaultSlot,
    finalFocus,
    ...props
  }: ContentProps) => (
      <Content
        render={part(slot, "div", render)}
        finalFocus={toFinalFocus(finalFocus)}
        align={align}
        alignOffset={alignOffset}
        side={toSide(side)}
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-h-(--available-height) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-overlay ring-1 ring-foreground/10 outline-none transition-[opacity,scale] duration-100 ease-snappy data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-closed:overflow-hidden motion-reduce:transition-none",
          className,
        )}
        {...props}
      />
    );
}

const MenuContentPart = contentPart(MenuContent, "context-menu-content");
const MenuSubContentPart = contentPart(MenuSubContent, "context-menu-sub-content");

function ContextMenuContent(props: ContentProps) {
  return <MenuContentPart {...props} />;
}

function ContextMenuGroup({
  render,
  ...props
}: Omit<React.ComponentProps<typeof MenuGroup>, "render"> & { render?: BaseRender }) {
  return <MenuGroup render={part("context-menu-group", "div", render)} {...props} />;
}

function ContextMenuLabel({
  className,
  inset,
  render,
  ...props
}: Omit<React.ComponentProps<typeof MenuGroupLabel>, "render"> & {
  inset?: boolean;
  render?: BaseRender;
}) {
  return (
    <MenuGroupLabel
      render={part("context-menu-label", "div", render)}
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground data-inset:pl-8",
        className,
      )}
      {...props}
    />
  );
}

// Base UI items run `onClick` for pointer and keyboard activation and close
// on `closeOnClick`; UI SDK runs `onSelect` and closes on `closeOnSelect`.
function ContextMenuItem({
  className,
  inset,
  variant = "default",
  onClick,
  closeOnClick,
  render,
  ...props
}: Omit<React.ComponentProps<typeof MenuItem>, "onClick" | "render"> & {
  inset?: boolean;
  variant?: "default" | "destructive";
  // biome-ignore lint/suspicious/noExplicitAny: Base UI hands onClick its own event type.
  onClick?: (event: any) => void;
  closeOnClick?: boolean;
  render?: BaseRender;
}) {
  return (
    <MenuItem
      render={part("context-menu-item", "div", render)}
      data-inset={inset}
      data-variant={variant}
      onSelect={onClick}
      closeOnSelect={closeOnClick}
      className={cn(
        "group/context-menu-item relative flex min-h-[var(--item-h,2rem)] cursor-default items-center gap-2 rounded-sm px-2 text-[length:var(--control-text,0.8125rem)] outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:data-highlighted:bg-transparent data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:text-[color:color-mix(in_oklch,var(--foreground)_10%,var(--destructive))] data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-[color:color-mix(in_oklch,var(--foreground)_15%,var(--destructive))] dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-[variant=destructive]:data-disabled:data-highlighted:bg-transparent data-[variant=destructive]:*:[svg]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSub({ ...props }: React.ComponentProps<typeof MenuSub>) {
  return <MenuSub {...props} />;
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof MenuSubTrigger>, "render" | "children"> & {
  inset?: boolean;
  children?: React.ReactNode;
  render?: BaseRender;
}) {
  return (
    <MenuSubTrigger
      render={part("context-menu-sub-trigger", "div", render, popupOpen)}
      data-inset={inset}
      className={cn(
        "relative flex min-h-[var(--item-h,2rem)] cursor-default items-center gap-2 rounded-sm px-2 text-[length:var(--control-text,0.8125rem)] outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:[&_.text-muted-foreground]:text-accent-foreground data-disabled:data-highlighted:bg-transparent data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="cn-rtl-flip ml-auto text-muted-foreground" />
    </MenuSubTrigger>
  );
}

function ContextMenuSubContent({ ...props }: ContentProps) {
  return <MenuSubContentPart side="right" {...props} />;
}

function ContextMenuCheckboxItem({
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
      render={part("context-menu-checkbox-item", "div", render)}
      data-inset={inset}
      value={value ?? id}
      closeOnSelect={closeOnClick}
      className={cn(
        "relative flex min-h-[var(--item-h,2rem)] cursor-default items-center gap-2 rounded-sm px-2 text-[length:var(--control-text,0.8125rem)] outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:[&_.text-muted-foreground]:text-accent-foreground data-disabled:data-highlighted:bg-transparent data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 pr-8",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex items-center justify-center">
        <MenuItemIndicator>
          <CheckIcon />
        </MenuItemIndicator>
      </span>
      {children}
    </MenuCheckboxItem>
  );
}

function ContextMenuRadioGroup({
  render,
  ...props
}: Omit<React.ComponentProps<typeof MenuRadioGroup>, "render"> & { render?: BaseRender }) {
  return (
    <MenuRadioGroup render={part("context-menu-radio-group", "div", render)} {...props} />
  );
}

function ContextMenuRadioItem({
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
      render={part("context-menu-radio-item", "div", render)}
      data-inset={inset}
      closeOnSelect={closeOnClick}
      className={cn(
        "relative flex min-h-[var(--item-h,2rem)] cursor-default items-center gap-2 rounded-sm px-2 text-[length:var(--control-text,0.8125rem)] outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:[&_.text-muted-foreground]:text-accent-foreground data-disabled:data-highlighted:bg-transparent data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 pr-8",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex items-center justify-center">
        <MenuItemIndicator>
          <CheckIcon />
        </MenuItemIndicator>
      </span>
      {children}
    </MenuRadioItem>
  );
}

function ContextMenuSeparator({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof MenuSeparator>, "render"> & { render?: BaseRender }) {
  return (
    <MenuSeparator
      render={part("context-menu-separator", "div", render)}
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "ml-auto pl-3 font-mono text-[0.6875rem] tracking-normal text-muted-foreground group-data-highlighted/context-menu-item:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
