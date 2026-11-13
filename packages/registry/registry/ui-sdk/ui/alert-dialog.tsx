"use client";

import * as React from "react";
import {
  AlertDialogBackdrop as AlertDialogBackdropPrimitive,
  AlertDialogClose as AlertDialogClosePrimitive,
  AlertDialogContent as AlertDialogContentPrimitive,
  AlertDialogDescription as AlertDialogDescriptionPrimitive,
  AlertDialog as AlertDialogPrimitive,
  AlertDialogTitle as AlertDialogTitlePrimitive,
  AlertDialogTrigger as AlertDialogTriggerPrimitive,
} from "@ui-sdk/react/alert-dialog";
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

import { Button } from "@/registry/ui-sdk/ui/button";

type BaseRender = React.ReactElement<unknown> | RenderProp<never>;

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins. Used where SevenUI's slot name differs from UI SDK's.
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

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive>) {
  return <AlertDialogPrimitive container={usePopupContainer()} {...props} />;
}

// Base UI marks an open popup's trigger with data-popup-open and examples
// style it, so the trigger carries it beside UI SDK's data-open.
function AlertDialogTrigger({
  render,
  ...props
}: Omit<React.ComponentProps<typeof AlertDialogTriggerPrimitive>, "render"> & {
  render?: BaseRender;
}) {
  return (
    <AlertDialogTriggerPrimitive
      data-slot="alert-dialog-trigger"
      render={withSlot<{ open: boolean }>(
        "alert-dialog-trigger",
        "button",
        render,
        (state) => ({ "data-popup-open": state.open ? "" : undefined }),
      )}
      {...props}
    />
  );
}

// UI SDK renders popups in place in the top layer, so there is nothing to
// portal; the part stays so composed markup keeps working.
function AlertDialogPortal({
  children,
}: {
  children?: React.ReactNode;
  container?: unknown;
  keepMounted?: boolean;
}) {
  return <>{children}</>;
}

// UI SDK's backdrop is a top-layer popover whose reset is keyed to its own
// slot (alert-dialog-backdrop). Keeping SevenUI's alert-dialog-overlay slot
// loses that reset, so size-auto undoes the popover's fit-content size.
function AlertDialogOverlay({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof AlertDialogBackdropPrimitive>, "className" | "render"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <AlertDialogBackdropPrimitive
      render={withSlot("alert-dialog-overlay", "div", render)}
      className={cn(
        "fixed inset-0 isolate z-50 size-auto bg-black/10 supports-backdrop-filter:backdrop-blur-xs transition-opacity duration-150 ease-snappy data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-opacity",
        className,
      )}
      {...props}
    />
  );
}

// Base UI marks a dialog with an open nested dialog data-nested-dialog-open;
// UI SDK's state calls it nestedOpen (dialog-10 styles the Base UI name).
function AlertDialogContent({
  className,
  size = "default",
  initialFocus,
  finalFocus,
  render,
  ...props
}: Omit<
  React.ComponentProps<typeof AlertDialogContentPrimitive>,
  "className" | "initialFocus" | "finalFocus" | "render"
> & {
  render?: BaseRender;
  className?: string;
  size?: "default" | "sm";
  initialFocus?: BaseFocus;
  finalFocus?: BaseFocus;
}) {
  return (
    <>
      <AlertDialogOverlay />
      <AlertDialogContentPrimitive
        data-slot="alert-dialog-content"
        data-size={size}
        render={withSlot<{ nestedOpen: boolean }>("alert-dialog-content", "div", render, (state) => ({
          "data-nested-dialog-open": state.nestedOpen ? "" : undefined,
        }))}
        initialFocus={toFocusTarget(initialFocus)}
        finalFocus={toFocusTarget(finalFocus)}
        className={cn(
          // The popup parents the consumer's children directly, so layout
          // classes passed to AlertDialogContent land on the grid itself.
          "group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-[var(--panel-pad,1.125rem)] text-popover-foreground shadow-overlay ring-1 ring-foreground/10 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm",
          // Open/close: fade + scale 0.98 -> 1. Reduced motion keeps the fade only.
          "transition-[scale,opacity] duration-150 ease-snappy data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 motion-reduce:transition-opacity motion-reduce:scale-100!",
          className,
        )}
        container={usePopupContainer()}
        {...props}
      />
    </>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "-mx-[var(--panel-pad,1.125rem)] -mb-[var(--panel-pad,1.125rem)] flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-[var(--panel-pad,1.125rem)] group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "mb-2 inline-flex size-10 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: Omit<React.ComponentProps<typeof AlertDialogTitlePrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <AlertDialogTitlePrimitive
      data-slot="alert-dialog-title"
      className={cn(
        "cn-font-heading text-base font-semibold tracking-[-0.01em] sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: Omit<React.ComponentProps<typeof AlertDialogDescriptionPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <AlertDialogDescriptionPrimitive
      data-slot="alert-dialog-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

type CloseProps = Omit<
  React.ComponentProps<typeof AlertDialogClosePrimitive>,
  "className" | "render"
> & {
  className?: string;
  render?: BaseRender;
} & Pick<React.ComponentProps<typeof Button>, "variant" | "size">;

// Both buttons are Close parts rendering a SevenUI Button. The slot goes on
// the rendered element, where UI SDK would otherwise put alert-dialog-close.
function AlertDialogAction({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: CloseProps) {
  return (
    <AlertDialogClosePrimitive
      className={cn(className)}
      render={withSlot(
        "alert-dialog-action",
        "button",
        render ?? <Button variant={variant} size={size} />,
      )}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  render,
  ...props
}: CloseProps) {
  return (
    <AlertDialogClosePrimitive
      className={cn(className)}
      render={withSlot(
        "alert-dialog-cancel",
        "button",
        render ?? <Button variant={variant} size={size} />,
      )}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
