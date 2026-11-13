"use client";

import * as React from "react";
import {
  MenuCheckboxItem,
  MenuContent,
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
  MenuTrigger,
} from "@ui-sdk/react/menu";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";

// Base UI portals popups to <body>; UI SDK renders them in place, as children
// of whatever holds the trigger, where that parent's child rules (Field's
// `*:w-full`, ButtonGroup's corners) and inherited styles reach them. So they
// render into <body>, or into a DirectionProvider's host to keep its `dir`
// (direction.tsx); in place on the server and while hydrating.
type PopupHost = { host: HTMLElement | null } | null;
const popupHostKey = Symbol.for("sevenui.ui-sdk.popup-host");
const popupHosts = globalThis as { [key: symbol]: React.Context<PopupHost> | undefined };
popupHosts[popupHostKey] ??= React.createContext<PopupHost>(null);
const PopupHostContext = popupHosts[popupHostKey] as React.Context<PopupHost>;
const subscribeToNothing = () => () => {};
function usePopupContainer(): HTMLElement | null {
  const scope = React.useContext(PopupHostContext);
  const body = React.useSyncExternalStore(subscribeToNothing, () => document.body, () => null);
  return body && (scope ? scope.host : body);
}
import { CheckIcon, ChevronRightIcon } from "lucide-react";

type Side = React.ComponentProps<typeof MenuContent>["side"];
type BaseRender = React.ReactElement<unknown> | RenderProp<never>;

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins, so SevenUI's slot names (dropdown-menu-*) are set there. The same
// render also adds Base UI's data-popup-open to an open trigger, which
// examples style, beside UI SDK's data-open.
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

// Base UI's root `disabled` keeps the menu from opening; UI SDK sets it on
// the trigger, so the root hands it down.
const RootDisabledContext = React.createContext(false);

// Base UI root props with no UI SDK counterpart (hover-opening menus,
// orientation) are accepted for API parity and dropped.
function DropdownMenu({
  openOnHover: _openOnHover,
  closeDelay: _closeDelay,
  orientation: _orientation,
  disabled = false,
  ...props
}: React.ComponentProps<typeof MenuPrimitive> & {
  openOnHover?: boolean;
  closeDelay?: number;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
}) {
  return (
    <RootDisabledContext.Provider value={disabled}>
      <MenuPrimitive {...props} />
    </RootDisabledContext.Provider>
  );
}

// The content parts render into <body> themselves (usePopupContainer), so
// there is nothing to portal; the part stays so composed markup keeps working.
function DropdownMenuPortal({
  children,
}: {
  children?: React.ReactNode;
  container?: unknown;
  keepMounted?: boolean;
}) {
  return <>{children}</>;
}

function DropdownMenuTrigger({
  render,
  disabled,
  ...props
}: Omit<React.ComponentProps<typeof MenuTrigger>, "render"> & {
  render?: BaseRender;
}) {
  const rootDisabled = React.useContext(RootDisabledContext);
  return (
    <MenuTrigger
      render={part("dropdown-menu-trigger", "button", render, popupOpen)}
      disabled={disabled ?? (rootDisabled || undefined)}
      {...props}
    />
  );
}

// Base UI's focus props take a boolean, a ref, or a function of the
// interaction that returns an element, `true`/`null` (the default) or
// `false`/nothing (leave focus). UI SDK takes "none" or a getter.
type BaseFocus =
  | boolean
  | React.RefObject<HTMLElement | null>
  | ((interaction: string) => boolean | HTMLElement | null | undefined);

function toFocusTarget(focus: BaseFocus | undefined) {
  if (focus === undefined || focus === true) return undefined;
  if (focus === false) return "none" as const;
  if (typeof focus === "function") {
    return (): HTMLElement | undefined => {
      const target = focus("mouse");
      if (target instanceof HTMLElement) return target;
      if (target === true || target === null) return undefined;
      return document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    };
  }
  return (): HTMLElement | undefined => focus.current ?? undefined;
}

type ContentProps = Omit<
  React.ComponentProps<typeof MenuContent>,
  "side" | "render" | "finalFocus"
> & {
  side?: Side | "inline-start" | "inline-end";
  render?: BaseRender;
  "data-slot"?: string;
  finalFocus?: BaseFocus;
};

// No Positioner: UI SDK positions the content itself, in the top layer, so
// placement props sit on this part. A submenu needs UI SDK's MenuSubContent.
function contentPart(Content: typeof MenuContent, defaultSlot: string) {
  return function ({
    align = "start",
    alignOffset = 0,
    side = "bottom",
    sideOffset = 4,
    className,
    render,
    "data-slot": slot = defaultSlot,
    finalFocus,
    ...props
  }: ContentProps) {
    return (
      <Content
        render={part(slot, "div", render)}
        finalFocus={toFocusTarget(finalFocus)}
        align={align}
        alignOffset={alignOffset}
        side={toSide(side)}
        // Base UI keeps popups 5px from the viewport edges; UI SDK 8px.
        collisionPadding={5}
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-overlay ring-1 ring-foreground/10 outline-none transition-[opacity,scale] duration-100 ease-snappy data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-closed:overflow-hidden motion-reduce:transition-none",
          className,
        )}
        container={usePopupContainer()}
        {...props}
      />
    );
  };
}

const MenuContentPart = contentPart(MenuContent, "dropdown-menu-content");
const MenuSubContentPart = contentPart(MenuSubContent, "dropdown-menu-sub-content");

function DropdownMenuContent(props: ContentProps) {
  return <MenuContentPart {...props} />;
}

function DropdownMenuGroup({
  render,
  ...props
}: Omit<React.ComponentProps<typeof MenuGroup>, "render"> & { render?: BaseRender }) {
  return <MenuGroup render={part("dropdown-menu-group", "div", render)} {...props} />;
}

function DropdownMenuLabel({
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
      render={part("dropdown-menu-label", "div", render)}
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
// on `closeOnClick`; UI SDK runs `onSelect` and closes on `closeOnSelect`, so
// both are mapped. The handler gets the event that selected the item.
function DropdownMenuItem({
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
      render={part("dropdown-menu-item", "div", render)}
      data-inset={inset}
      data-variant={variant}
      // UI SDK treats a returned Promise as a pending item that keeps the
      // menu open; Base UI ignores it, so the result is dropped.
      onSelect={onClick && ((event) => void onClick(event))}
      closeOnSelect={closeOnClick}
      className={cn(
        "group/dropdown-menu-item relative flex min-h-[var(--item-h,2rem)] cursor-default items-center gap-2 rounded-sm px-2 text-[length:var(--control-text,0.8125rem)] outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:data-highlighted:bg-transparent data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:text-[color:color-mix(in_oklch,var(--foreground)_10%,var(--destructive))] data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-[color:color-mix(in_oklch,var(--foreground)_15%,var(--destructive))] dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-[variant=destructive]:data-disabled:data-highlighted:bg-transparent data-[variant=destructive]:*:[svg]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof MenuSub>) {
  return <MenuSub {...props} />;
}

function DropdownMenuSubTrigger({
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
      render={part("dropdown-menu-sub-trigger", "div", render, popupOpen)}
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

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  className,
  ...props
}: ContentProps) {
  return (
    <MenuSubContentPart
      className={cn("w-auto min-w-[96px]", className)}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
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
      render={part("dropdown-menu-checkbox-item", "div", render)}
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
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuItemIndicator>
          <CheckIcon />
        </MenuItemIndicator>
      </span>
      {children}
    </MenuCheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  render,
  ...props
}: Omit<React.ComponentProps<typeof MenuRadioGroup>, "render"> & { render?: BaseRender }) {
  return (
    <MenuRadioGroup render={part("dropdown-menu-radio-group", "div", render)} {...props} />
  );
}

function DropdownMenuRadioItem({
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
      render={part("dropdown-menu-radio-item", "div", render)}
      data-inset={inset}
      closeOnSelect={closeOnClick}
      className={cn(
        "relative flex min-h-[var(--item-h,2rem)] cursor-default items-center gap-2 rounded-sm px-2 text-[length:var(--control-text,0.8125rem)] outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:[&_.text-muted-foreground]:text-accent-foreground data-disabled:data-highlighted:bg-transparent data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 pr-8",
        className,
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuItemIndicator>
          <CheckIcon />
        </MenuItemIndicator>
      </span>
      {children}
    </MenuRadioItem>
  );
}

function DropdownMenuSeparator({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof MenuSeparator>, "render"> & { render?: BaseRender }) {
  return (
    <MenuSeparator
      render={part("dropdown-menu-separator", "div", render)}
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
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto pl-3 font-mono text-[0.6875rem] tracking-normal text-muted-foreground group-data-highlighted/dropdown-menu-item:text-accent-foreground",
        className,
      )}
      {...props}
    />
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
