"use client";

import * as React from "react";
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";

import { cn } from "cn";

function Toolbar({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Root>) {
  return (
    <ToolbarPrimitive.Root
      className={cn(
        "flex w-fit items-center gap-[var(--control-gap,0.5rem)] rounded-lg bg-surface-tray p-0.5 shadow-[inset_0_0_0_1px_var(--hairline,var(--border))] data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function ToolbarButton({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Button>) {
  return (
    <ToolbarPrimitive.Button
      className={cn(
        "inline-flex h-[calc(var(--control-h,2.125rem)-4px)] min-w-[calc(var(--control-h,2.125rem)-4px)] items-center justify-center gap-[var(--control-gap,0.5rem)] rounded-[max(0px,calc(--theme(--radius-lg)-2px))] px-[calc(var(--control-px,0.75rem)-0.25rem)] text-[length:var(--control-text,0.8125rem)] font-medium whitespace-nowrap outline-none hover:bg-[color-mix(in_oklch,var(--surface-panel,var(--muted)),var(--foreground)_5%)] hover:text-foreground focus-visible:focus-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[pressed]:bg-surface-raised data-[pressed]:text-foreground data-[pressed]:shadow-[var(--elevation-highlight,0_0_#0000),inset_0_0_0_1px_var(--hairline-strong,var(--border))] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ToolbarLink({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Link>) {
  return (
    <ToolbarPrimitive.Link
      className={cn(
        "inline-flex h-[calc(var(--control-h,2.125rem)-4px)] items-center rounded-[max(0px,calc(--theme(--radius-lg)-2px))] px-[calc(var(--control-px,0.75rem)-0.25rem)] text-[length:var(--control-text,0.8125rem)] text-muted-foreground outline-none hover:text-foreground focus-visible:focus-ring",
        className,
      )}
      {...props}
    />
  );
}

function ToolbarInput({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Input>) {
  return (
    <ToolbarPrimitive.Input
      className={cn(
        "h-[calc(var(--control-h,2.125rem)-4px)] rounded-[max(0px,calc(--theme(--radius-lg)-2px))] bg-surface-inset px-[calc(var(--control-px,0.75rem)-0.25rem)] text-[length:var(--control-text,0.8125rem)] shadow-[inset_0_0_0_1px_var(--hairline-strong,var(--input)),var(--elevation-inset,0_0_#0000)] outline-none placeholder:text-muted-foreground focus-visible:focus-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function ToolbarGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Group>) {
  return (
    <ToolbarPrimitive.Group
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

function ToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  return (
    <ToolbarPrimitive.Separator
      className={cn(
        "shrink-0 bg-hairline data-[orientation=vertical]:mx-0.5 data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px data-[orientation=horizontal]:my-0.5 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-4",
        className,
      )}
      {...props}
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
