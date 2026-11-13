"use client";

import * as React from "react";
import {
  DialogBackdrop as SheetBackdropPrimitive,
  DialogClose as SheetClosePrimitive,
  DialogContent as SheetContentPrimitive,
  DialogDescription as SheetDescriptionPrimitive,
  Dialog as SheetPrimitive,
  DialogTitle as SheetTitlePrimitive,
  DialogTrigger as SheetTriggerPrimitive,
} from "@ui-sdk/react/dialog";
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
import { XIcon } from "lucide-react";

import { Button } from "@/registry/ui-sdk/ui/button";

type BaseRender = React.ReactElement<unknown> | RenderProp<never>;

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins. Used where SevenUI's slot name differs from UI SDK's, and for a
// caller's own slot (the mobile sidebar renders a sheet as data-slot=sidebar).
function withSlot<State>(
  slot: string,
  tag: string,
  render?: BaseRender,
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

// A sheet is a dialog attached to an edge, as in the base flavour: UI SDK's
// Drawer would add drag physics and a full-length slide the base sheet does
// not have. `disablePointerDismissal` is Base UI's `closeOnOutsidePress={false}`.
function Sheet({
  disablePointerDismissal,
  ...props
}: React.ComponentProps<typeof SheetPrimitive> & {
  disablePointerDismissal?: boolean;
}) {
  return (
    <SheetPrimitive
      closeOnOutsidePress={
        disablePointerDismissal === undefined ? undefined : !disablePointerDismissal
      }
      container={usePopupContainer()}
      {...props}
    />
  );
}

// Base UI marks an open popup's trigger with data-popup-open and examples
// style it, so the trigger carries it beside UI SDK's data-open.
function SheetTrigger({
  render,
  ...props
}: Omit<React.ComponentProps<typeof SheetTriggerPrimitive>, "render"> & {
  render?: BaseRender;
}) {
  return (
    <SheetTriggerPrimitive
      render={withSlot<{ open: boolean }>("sheet-trigger", "button", render, (state) => ({
        "data-popup-open": state.open ? "" : undefined,
      }))}
      {...props}
    />
  );
}

function SheetClose({
  render,
  ...props
}: Omit<React.ComponentProps<typeof SheetClosePrimitive>, "render"> & {
  render?: BaseRender;
}) {
  return (
    <SheetClosePrimitive render={withSlot("sheet-close", "button", render)} {...props} />
  );
}

// UI SDK's backdrop is a top-layer popover whose reset is keyed to its own
// slot (dialog-backdrop). Keeping SevenUI's sheet-overlay slot loses that
// reset, so size-auto undoes the popover's fit-content size.
function SheetOverlay({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof SheetBackdropPrimitive>, "className" | "render"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <SheetBackdropPrimitive
      render={withSlot("sheet-overlay", "div", render)}
      className={cn(
        "fixed inset-0 z-50 size-auto bg-black/10 supports-backdrop-filter:backdrop-blur-xs transition-opacity duration-150 ease-snappy data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-opacity",
        className,
      )}
      {...props}
    />
  );
}

// Base UI marks a dialog with an open nested dialog data-nested-dialog-open;
// UI SDK's state calls it nestedOpen (dialog-10 styles the Base UI name).
// UI SDK's focus trap finds its content by UI SDK's own data-slot, which the
// SevenUI slot replaces, so Tab left a modal sheet at its last control (and
// Shift+Tab at its first). Checked in Chrome: a plain UI SDK dialog wraps, and
// the same one re-slotted through render does not. So the content wraps Tab
// itself while modal.
const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

function wrapTab(event: React.KeyboardEvent<HTMLElement>) {
  const content = event.currentTarget;
  if (event.key !== "Tab" || event.defaultPrevented) return;
  if (content.getAttribute("aria-modal") !== "true") return;
  const tabbables = [...content.querySelectorAll<HTMLElement>(TABBABLE)].filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.closest("[inert], [hidden]") &&
      element.checkVisibility?.() !== false,
  );
  const first = tabbables[0];
  const last = tabbables[tabbables.length - 1];
  const active = content.ownerDocument.activeElement;
  if (!first || !last) {
    event.preventDefault();
    return;
  }
  if (event.shiftKey && (active === first || active === content)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  render,
  initialFocus,
  finalFocus,
  "data-slot": slot = "sheet-content",
  onKeyDown,
  ...props
}: Omit<
  React.ComponentProps<typeof SheetContentPrimitive>,
  "children" | "className" | "render" | "initialFocus" | "finalFocus"
> & {
  children?: React.ReactNode;
  className?: string;
  render?: BaseRender;
  initialFocus?: BaseFocus;
  finalFocus?: BaseFocus;
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
  "data-slot"?: string;
}) {
  return (
    <>
      <SheetOverlay />
      <SheetContentPrimitive
        data-side={side}
        render={withSlot<{ nestedOpen: boolean }>(slot, "div", render, (state) => ({
          "data-nested-dialog-open": state.nestedOpen ? "" : undefined,
        }))}
        initialFocus={toFocusTarget(initialFocus)}
        finalFocus={toFocusTarget(finalFocus)}
        className={cn(
          // One panel attached to an edge; the inner edge carries a border.
          // The content is a top-layer popover outside UI SDK's slot-keyed
          // reset, so inset-auto, size-auto and overflow-visible undo the
          // popover's own inset, fit-content size and scrolling.
          "fixed inset-auto z-50 flex size-auto flex-col gap-4 overflow-visible bg-popover bg-clip-padding text-sm text-popover-foreground shadow-overlay",
          // Slide 200ms. Reduced motion drops the slide and keeps the fade.
          "transition-[translate,opacity] duration-200 ease-snappy data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-opacity motion-reduce:translate-none!",
          "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className,
        )}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(event);
          wrapTab(event);
        }}
        container={usePopupContainer()}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetClosePrimitive
            render={withSlot(
              "sheet-close",
              "button",
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              >
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>,
            )}
          />
        )}
      </SheetContentPrimitive>
    </>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex flex-col gap-0.5 p-[var(--panel-pad,1.125rem)]",
        className,
      )}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-col gap-2 p-[var(--panel-pad,1.125rem)]",
        className,
      )}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof SheetTitlePrimitive>, "className" | "render"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <SheetTitlePrimitive
      render={withSlot("sheet-title", "h2", render)}
      className={cn(
        "cn-font-heading text-base font-semibold tracking-[-0.01em] text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof SheetDescriptionPrimitive>, "className" | "render"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <SheetDescriptionPrimitive
      render={withSlot("sheet-description", "p", render)}
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
