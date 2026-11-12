"use client";

import * as React from "react";
import {
  ToolbarButton as ToolbarButtonPrimitive,
  ToolbarGroup as ToolbarGroupPrimitive,
  ToolbarInput as ToolbarInputPrimitive,
  ToolbarLink as ToolbarLinkPrimitive,
  Toolbar as ToolbarPrimitive,
  ToolbarSeparator as ToolbarSeparatorPrimitive,
} from "@ui-sdk/react/toolbar";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";

import { cn } from "cn";

import { Toggle } from "@/registry/ui-sdk/ui/toggle";

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins. So the slot is set there: a caller's own data-slot, which replaced
// the default in Base UI, or the default. A caller's `render` still renders.
function slotted<P extends object>(
  slot: string | undefined,
  tag: string,
  props: P,
): P {
  const {
    "data-slot": own,
    render,
    ...rest
  } = props as P & { "data-slot"?: string; render?: RenderProp<never> };
  const name = own ?? slot;
  return {
    ...rest,
    render: (partProps: Record<string, unknown>, state: never) =>
      renderElement(
        tag,
        name ? { ...partProps, "data-slot": name } : partProps,
        render,
        state,
      ),
  } as P;
}

// Base UI's `loopFocus` is UI SDK's `loop`.
function Toolbar({
  className,
  loopFocus,
  ...props
}: Omit<React.ComponentProps<typeof ToolbarPrimitive>, "className"> & {
  className?: string;
  loopFocus?: boolean;
}) {
  return (
    <ToolbarPrimitive
      loop={loopFocus}
      className={cn(
        "flex w-fit items-center gap-[var(--control-gap,0.5rem)] rounded-lg border bg-background p-0.5 data-[orientation=vertical]:flex-col",
        className,
      )}
      {...slotted(undefined, "div", props)}
    />
  );
}

const toolbarButtonClassName =
  "inline-flex h-[calc(var(--control-h,2.125rem)-4px)] min-w-[calc(var(--control-h,2.125rem)-4px)] items-center justify-center gap-[var(--control-gap,0.5rem)] rounded-[max(0px,calc(--theme(--radius-lg)-2px))] px-[calc(var(--control-px,0.75rem)-0.25rem)] text-[length:var(--control-text,0.8125rem)] font-medium whitespace-nowrap outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[pressed]:bg-accent data-[pressed]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

// A UI SDK toggle joins the toolbar on its own; rendered through a toolbar
// button it would register twice and leave the toolbar without a tab stop.
// So `render={<Toggle />}` renders the toggle itself with the button's props.
function ToolbarButton({
  className,
  render,
  nativeButton: _nativeButton,
  ...props
}: Omit<
  React.ComponentProps<typeof ToolbarButtonPrimitive>,
  "className" | "render"
> & {
  className?: string;
  render?: React.ReactElement<unknown> | RenderProp<never>;
  // Base UI's hint for a `render` that is not a <button>; UI SDK needs none.
  nativeButton?: boolean;
}) {
  if (React.isValidElement(render) && render.type === Toggle) {
    const own = render.props as React.ComponentProps<typeof Toggle>;
    return (
      <Toggle
        {...(props as React.ComponentProps<typeof Toggle>)}
        {...own}
        className={cn(toolbarButtonClassName, className, own.className)}
      />
    );
  }
  return (
    <ToolbarButtonPrimitive
      className={cn(toolbarButtonClassName, className)}
      {...slotted(undefined, "button", {
        ...props,
        render: render as React.ComponentProps<
          typeof ToolbarButtonPrimitive
        >["render"],
      })}
    />
  );
}

function ToolbarLink({
  className,
  ...props
}: Omit<React.ComponentProps<typeof ToolbarLinkPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <ToolbarLinkPrimitive
      className={cn(
        "inline-flex h-[calc(var(--control-h,2.125rem)-4px)] items-center rounded-[max(0px,calc(--theme(--radius-lg)-2px))] px-[calc(var(--control-px,0.75rem)-0.25rem)] text-[length:var(--control-text,0.8125rem)] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
      {...slotted(undefined, "a", props)}
    />
  );
}

function ToolbarInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof ToolbarInputPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <ToolbarInputPrimitive
      className={cn(
        "h-[calc(var(--control-h,2.125rem)-4px)] rounded-[max(0px,calc(--theme(--radius-lg)-2px))] border border-input bg-transparent px-[calc(var(--control-px,0.75rem)-0.25rem)] text-[length:var(--control-text,0.8125rem)] outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...slotted(undefined, "input", props)}
    />
  );
}

function ToolbarGroup({
  className,
  ...props
}: Omit<React.ComponentProps<typeof ToolbarGroupPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <ToolbarGroupPrimitive
      className={cn("flex items-center gap-0.5", className)}
      {...slotted(undefined, "div", props)}
    />
  );
}

function ToolbarSeparator({
  className,
  ...props
}: Omit<React.ComponentProps<typeof ToolbarSeparatorPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <ToolbarSeparatorPrimitive
      className={cn(
        "shrink-0 bg-border data-[orientation=vertical]:mx-0.5 data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px data-[orientation=horizontal]:my-0.5 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-4",
        className,
      )}
      {...slotted(undefined, "div", props)}
    />
  );
}

export {
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarInput,
  ToolbarGroup,
  ToolbarSeparator,
};
