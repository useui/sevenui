"use client";

import * as React from "react";
import {
  DialogBackdrop as DialogBackdropPrimitive,
  DialogClose as DialogClosePrimitive,
  DialogContent as DialogContentPrimitive,
  DialogDescription as DialogDescriptionPrimitive,
  Dialog as DialogPrimitive,
  DialogTitle as DialogTitlePrimitive,
  DialogTrigger as DialogTriggerPrimitive,
} from "@ui-sdk/react/dialog";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";
import { XIcon } from "lucide-react";

import { Button } from "@/registry/ui-sdk/ui/button";

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins. Used where SevenUI's slot name differs from UI SDK's.
function withSlot<State>(
  slot: string,
  tag: string,
  render?: RenderProp<State>,
): RenderProp<State> {
  return (props, state) =>
    renderElement(tag, { ...props, "data-slot": slot }, render, state);
}

// `disablePointerDismissal` is Base UI's name for UI SDK's
// `closeOnOutsidePress={false}`.
function Dialog({
  disablePointerDismissal,
  ...props
}: React.ComponentProps<typeof DialogPrimitive> & {
  disablePointerDismissal?: boolean;
}) {
  return (
    <DialogPrimitive
      closeOnOutsidePress={
        disablePointerDismissal === undefined ? undefined : !disablePointerDismissal
      }
      {...props}
    />
  );
}

// Base UI marks an open popup's trigger with data-popup-open and examples
// style it, so the trigger carries it beside UI SDK's data-open.
function DialogTrigger({
  render,
  ...props
}: Omit<React.ComponentProps<typeof DialogTriggerPrimitive>, "render"> & {
  render?: React.ReactElement<unknown> | RenderProp<{ open: boolean }>;
}) {
  return (
    <DialogTriggerPrimitive
      data-slot="dialog-trigger"
      render={(triggerProps, state) =>
        renderElement(
          "button",
          { ...triggerProps, "data-popup-open": state.open ? "" : undefined },
          render as RenderProp<{ open: boolean }> | undefined,
          state,
        )
      }
      {...props}
    />
  );
}

// UI SDK renders popups in place in the top layer, so there is nothing to
// portal; the part stays so composed markup keeps working.
function DialogPortal({
  children,
}: {
  children?: React.ReactNode;
  container?: unknown;
  keepMounted?: boolean;
}) {
  return <>{children}</>;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogClosePrimitive>) {
  return <DialogClosePrimitive data-slot="dialog-close" {...props} />;
}

// UI SDK's backdrop is a top-layer popover whose reset is keyed to its own
// slot (dialog-backdrop). Keeping SevenUI's dialog-overlay slot loses that
// reset, so size-auto undoes the popover's fit-content size.
function DialogOverlay({
  className,
  render,
  ...props
}: React.ComponentProps<typeof DialogBackdropPrimitive>) {
  return (
    <DialogBackdropPrimitive
      render={withSlot("dialog-overlay", "div", render)}
      className={cn(
        "fixed inset-0 isolate z-50 size-auto bg-black/10 supports-backdrop-filter:backdrop-blur-xs transition-opacity duration-150 ease-snappy data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-opacity",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: Omit<React.ComponentProps<typeof DialogContentPrimitive>, "children"> & {
  children?: React.ReactNode;
  showCloseButton?: boolean;
}) {
  return (
    <>
      <DialogOverlay />
      <DialogContentPrimitive
        data-slot="dialog-content"
        className={cn(
          // The popup parents the consumer's children directly, so layout
          // classes passed to DialogContent land on the grid itself.
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-[var(--panel-pad,1.125rem)] text-sm text-popover-foreground shadow-overlay ring-1 ring-foreground/10 outline-none sm:max-w-sm",
          // Open/close: fade + scale 0.98 -> 1. Reduced motion keeps the fade only.
          "transition-[scale,opacity] duration-150 ease-snappy data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 motion-reduce:transition-opacity motion-reduce:scale-100!",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogClosePrimitive
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              >
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>
            }
          />
        )}
      </DialogContentPrimitive>
    </>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-[var(--panel-pad,1.125rem)] -mb-[var(--panel-pad,1.125rem)] flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-[var(--panel-pad,1.125rem)] sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogClosePrimitive
          render={
            <Button data-slot="button" variant="outline">
              Close
            </Button>
          }
        />
      )}
    </div>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitlePrimitive>) {
  return (
    <DialogTitlePrimitive
      data-slot="dialog-title"
      className={cn(
        "cn-font-heading text-base leading-none font-semibold tracking-[-0.01em]",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescriptionPrimitive>) {
  return (
    <DialogDescriptionPrimitive
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
